import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { documentsAPI } from '../../api/axios';
import { getErrorMessage } from '../../utils/helpers';

const DocumentUpload = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', department: '', tags: '' });
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (selectedFile) => {
    const allowed = ['pdf', 'docx', 'txt'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { setError('Only PDF, DOCX, and TXT files are allowed.'); return; }
    if (selectedFile.size > 10 * 1024 * 1024) { setError('File must be under 10MB.'); return; }
    setFile(selectedFile);
    setError('');
    if (!form.title) setForm(f => ({ ...f, title: selectedFile.name.split('.')[0] }));
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file to upload.'); return; }
    setLoading(true); setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('department', form.department);
      if (form.tags) fd.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      const res = await documentsAPI.upload(fd);
      setSuccess('Document uploaded successfully! Processing in background...');
      setTimeout(() => navigate(`/documents/${res.data.document?.id}`), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Upload Document">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="page-title">Upload Document</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add new content to the knowledge base</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <span className="material-icons text-red-500">error</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <span className="material-icons text-green-500">check_circle</span>
            <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* File Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`card p-8 text-center border-2 border-dashed transition-colors cursor-pointer ${
              dragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' :
              file ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10' :
              'border-gray-300 dark:border-dark-border hover:border-brand-400 dark:hover:border-brand-600'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input id="file-input" type="file" accept=".pdf,.docx,.txt" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} className="hidden" />
            {file ? (
              <>
                <span className="material-icons text-green-500 text-5xl mb-3">check_circle</span>
                <p className="font-semibold text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline">Remove file</button>
              </>
            ) : (
              <>
                <span className="material-icons text-gray-300 dark:text-gray-600 text-5xl mb-3">cloud_upload</span>
                <p className="font-semibold text-gray-900 dark:text-white">Drop file here or click to browse</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">PDF, DOCX, TXT — Max 10MB</p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="card p-6 space-y-4">
            <h3 className="section-title">Document Details</h3>

            <div>
              <label className="label">Title <span className="text-red-500">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Document title" required className="input-base" />
            </div>
            <div>
              <label className="label">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Brief description of this document..." rows={3} className="input-base resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Department</label>
                <input type="text" name="department" value={form.department} onChange={handleChange} placeholder="e.g. HR, Finance" className="input-base" />
              </div>
              <div>
                <label className="label">Tags</label>
                <input type="text" name="tags" value={form.tags} onChange={handleChange} placeholder="policy, guide, manual" className="input-base" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comma separated</p>
              </div>
            </div>
          </div>

          {/* Processing Info */}
          <div className="card p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <span className="material-icons text-blue-500">info</span>
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Processing Information</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  After upload, the document will be automatically processed and indexed. This takes 10-60 seconds. A Content Owner or Admin must approve it before it becomes searchable.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/documents')} className="btn-secondary flex-1">
              <span className="material-icons">arrow_back</span> Cancel
            </button>
            <button type="submit" disabled={loading || !file} className="btn-primary flex-1">
              {loading ? <><span className="material-icons animate-spin">refresh</span> Uploading...</> : <><span className="material-icons">cloud_upload</span> Upload Document</>}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DocumentUpload;
