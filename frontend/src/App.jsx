import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import DocumentList from './pages/documents/DocumentList';
import DocumentUpload from './pages/documents/DocumentUpload';
import DocumentDetail from './pages/documents/DocumentDetail';
import QueryPage from './pages/query/QueryPage';
import QueryHistory from './pages/query/QueryHistory';
import Analytics from './pages/analytics/Analytics';
import Profile from './pages/profile/Profile';
import AuditLogs from './pages/audit/AuditLogs';
import UserGuide from './pages/guide/UserGuide';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/guide" element={<UserGuide />} />

      {/* Protected */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/documents" element={<DocumentList />} />
      <Route path="/documents/upload" element={<DocumentUpload />} />
      <Route path="/documents/:id" element={<DocumentDetail />} />
      <Route path="/query" element={<QueryPage />} />
      <Route path="/query/history" element={<QueryHistory />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/audit" element={<AuditLogs />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
