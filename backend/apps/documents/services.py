"""
Document Processing Service.

Handles:
1. Text extraction from PDF/DOCX/TXT
2. Text chunking with overlap
3. Metadata extraction

This is a service layer - it contains business logic separate from views/models.
"""

import os
import re
from typing import List, Dict, Tuple
from django.conf import settings

# Text extraction libraries
import PyPDF2
from docx import Document as DocxDocument


class DocumentProcessingService:
    """
    Service for processing documents into searchable chunks.
    
    Methods:
    - extract_text(): Get text from file
    - chunk_text(): Split text into overlapping chunks
    - extract_metadata(): Get page numbers, sections, etc.
    """
    
    def __init__(self):
        self.chunk_size = settings.DOCUMENT_CONFIG['CHUNK_SIZE']
        self.chunk_overlap = settings.DOCUMENT_CONFIG['CHUNK_OVERLAP']
    
    def extract_text(self, file_path: str, file_type: str) -> str:
        """
        Extract text from document based on file type.
        
        Args:
            file_path: Path to the file
            file_type: File extension (pdf, docx, txt)
        
        Returns:
            Extracted text as string
        
        Raises:
            ValueError: If file type not supported
            Exception: If extraction fails
        """
        
        if file_type == 'pdf':
            return self._extract_from_pdf(file_path)
        elif file_type == 'docx':
            return self._extract_from_docx(file_path)
        elif file_type == 'txt':
            return self._extract_from_txt(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """
        Extract text from PDF file.
        
        Note: This is a basic implementation.
        For production, consider:
        - OCR for scanned PDFs (pytesseract)
        - Better table extraction
        - Image handling
        """
        text = []
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text.append(page_text)
        
        return "\n\n".join(text)
    
    def _extract_from_docx(self, file_path: str) -> str:
        """
        Extract text from DOCX file.
        
        Preserves paragraph structure.
        """
        doc = DocxDocument(file_path)
        
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        
        return "\n\n".join(paragraphs)
    
    def _extract_from_txt(self, file_path: str) -> str:
        """
        Extract text from TXT file.
        
        Handles different encodings.
        """
        encodings = ['utf-8', 'latin-1', 'cp1252']
        
        for encoding in encodings:
            try:
                with open(file_path, 'r', encoding=encoding) as file:
                    return file.read()
            except UnicodeDecodeError:
                continue
        
        # If all encodings fail, read as binary and decode with errors='ignore'
        with open(file_path, 'rb') as file:
            return file.read().decode('utf-8', errors='ignore')
    
    def chunk_text(
        self,
        text: str,
        metadata: Dict = None
    ) -> List[Dict[str, any]]:
        """
        Split text into overlapping chunks.
        
        Why overlapping chunks?
        - Prevents splitting related content across chunks
        - Improves retrieval quality
        
        Args:
            text: Full document text
            metadata: Optional metadata to include with each chunk
        
        Returns:
            List of chunk dictionaries with text and metadata
        
        Example:
            text = "This is a long document..."
            chunks = chunk_text(text)
            # Returns: [
            #   {"text": "This is a long...", "chunk_index": 0, "metadata": {...}},
            #   {"text": "...long document...", "chunk_index": 1, "metadata": {...}}
            # ]
        """
        
        # Clean the text
        text = self._clean_text(text)
        
        # If text is shorter than chunk size, return as single chunk
        if len(text) <= self.chunk_size:
            return [{
                'text': text,
                'chunk_index': 0,
                'metadata': metadata or {}
            }]
        
        chunks = []
        start = 0
        chunk_index = 0
        
        while start < len(text):
            # Get chunk end position
            end = start + self.chunk_size
            
            # If this isn't the last chunk, try to break at a sentence boundary
            if end < len(text):
                # Look for sentence endings within last 100 chars of chunk
                search_start = max(end - 100, start)
                sentence_end = self._find_sentence_boundary(text, search_start, end)
                if sentence_end > start:
                    end = sentence_end
            
            # Extract chunk
            chunk_text = text[start:end].strip()
            
            if chunk_text:
                chunks.append({
                    'text': chunk_text,
                    'chunk_index': chunk_index,
                    'metadata': {
                        **(metadata or {}),
                        'char_start': start,
                        'char_end': end,
                    }
                })
                chunk_index += 1
            
            # Move start position (with overlap)
            start = end - self.chunk_overlap
        
        return chunks
    
    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text.
        
        - Remove extra whitespace
        - Normalize line breaks
        - Remove special characters that cause issues
        """
        
        # Replace multiple spaces with single space
        text = re.sub(r'\s+', ' ', text)
        
        # Replace multiple newlines with double newline
        text = re.sub(r'\n+', '\n\n', text)
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        return text.strip()
    
    def _find_sentence_boundary(
        self,
        text: str,
        start: int,
        end: int
    ) -> int:
        """
        Find the nearest sentence boundary before 'end' position.
        
        Looks for: . ! ? followed by space or newline
        """
        
        # Search backwards from end
        search_text = text[start:end]
        
        # Common sentence endings
        sentence_ends = ['. ', '.\n', '! ', '!\n', '? ', '?\n']
        
        last_boundary = -1
        for ending in sentence_ends:
            pos = search_text.rfind(ending)
            if pos > last_boundary:
                last_boundary = pos + len(ending)
        
        if last_boundary > 0:
            return start + last_boundary
        
        return end
    
    def extract_metadata(
        self,
        text: str,
        file_type: str
    ) -> Dict[str, any]:
        """
        Extract metadata from document.
        
        This is a basic implementation.
        In production, you might:
        - Extract table of contents
        - Identify sections/headers
        - Extract authors, dates, etc.
        
        Returns:
            Dictionary with metadata
        """
        
        # Count basic statistics
        word_count = len(text.split())
        char_count = len(text)
        
        # Try to extract title (first non-empty line)
        lines = [line.strip() for line in text.split('\n') if line.strip()]
        potential_title = lines[0] if lines else ''
        
        return {
            'word_count': word_count,
            'char_count': char_count,
            'potential_title': potential_title[:200],  # First 200 chars
            'file_type': file_type,
        }
