import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { documentsAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime, formatFileSize, STATUS_COLORS, getErrorMessage } from '../../utils/helpers';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });
  const [newVersionFile, setNewVersionFile] = useState(null);
  const [uploadingVersion, setUploadingVersion] = useState(false);

  const fetchDoc = async () => {
    try {
      const res = await documentsAPI.getById(id);
      setDoc(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoc(); }, [id]);

  const handleApprove = async () => {
    setActionLoading('approve');
    try {
      await documentsAPI.approve(id, 'approve');
      setActionMsg({ type: 'success', text: 'Document approved successfully.' });
      fetchDoc();
    } catch (err) {
      setActionMsg({ type: 'error', text: getErrorMessage(err) });
    } finally { setActionLoading(''); }
  };

  const handleArchive = async () => {
    setActionLoading('archive');
    try {
      await documentsAPI.approve(id, 'archive');
      setActionMsg({ type: 'success', text: 'Document archived.' });
      fetchDoc();
    } catch (err) {
      setActionMsg({ type: 'error', text: getErrorMessage(err) });
    } finally { setActionLoading(''); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    setActionLoading('delete');
    try {
      await documentsAPI.delete(id);
      navigate('/documents');
    } catch (err) {
      setActionMsg({ type: 'error', text: getErrorMessage(err) });
      setActionLoading('');
    }
  };

  const handleNewVersion = async (e) => {
    e.preventDefault();
    if (!newVersionFile) return;
    setUploadingVersion(true);
    try {
      await documentsAPI.newVersion(id, newVersionFile);
      setActionMsg({ type: 'success', text: 'New version uploaded successfully.' });
      setNewVersionFile(null);
      fetchDoc();
    } catch (err) {
      setActionMsg({ type: 'error', text: getErrorMessage(err) });
    } finally { setUploadingVersion(false); }
  };

  if (loading) return (
    <DashboardLayout title="Document">
      <div className="flex items-center justify-center py-20">
        <span className="material-icons text-brand-600 text-5xl animate-spin">refresh</span>
      </div>
    </DashboardLayout>
  );

  if (error) return (
    <DashboardLayout title="Document">
      <div className="card p-8 text-center">
        <span className="material-icons text-red-400 text-5xl mb-3 block">error</span>
        <p className="text-gray-900 dark:text-white font-medium">Failed to load document</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{error}</p>
        <Link to="/documents" className="mt-4 btn-secondary inline-flex"><span className="material-icons">arrow_back</span>Back to Documents</Link>
      </div>
    </DashboardLayout>
  );

  const latestVersion = doc?.versions?.[0];
  const processingStatusColor = { READY: 'text-green-600 dark:text-green-400', PROCESSING: 'text-yellow-600 dark:text-yellow-400', FAILED: 'text-red-600 dark:text-red-400', UPLOADED: 'text-blue-600 dark:text-blue-400' };

  return (
    <DashboardLayout title="Document Details">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link to="/documents" className="hover:text-brand-600 dark:hover:text-brand-400">Documents</Link>
          <span className="material-icons text-sm">chevron_right</span>
          <span className="text-gray-900 dark:text-white truncate">{doc?.title}</span>
        </div>

        {/* Action Message */}
        {actionMsg.text && (
          <div className={`p-4 rounded-lg flex items-center gap-3 border ${actionMsg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
            <span className="material-icons">{actionMsg.type === 'success' ? 'check_circle' : 'error'}</span>
            <p className="text-sm">{actionMsg.text}</p>
          </div>
        )}

        {/* Main Info */}
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="material-icons text-brand-600 dark:text-brand-400 text-3xl">description</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{doc?.title}</h2>
                {doc?.description && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">{doc.description}</p>}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  <span className={`badge ${STATUS_COLORS[doc?.status]}`}>{doc?.status}</span>
                  {doc?.department && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="material-icons text-sm">business</span>{doc.department}
                    </span>
                  )}
                  {latestVersion && (
                    <span className={`flex items-center gap-1 text-xs font-medium ${processingStatusColor[latestVersion.processing_status] || 'text-gray-500'}`}>
                      <span className="material-icons text-sm">memory</span>{latestVersion.processing_status}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            {hasRole(['ADMIN', 'CONTENT_OWNER']) && (
              <div className="flex flex-wrap gap-2 flex-shrink-0">
                {doc?.status === 'DRAFT' && (
                  <button onClick={handleApprove} disabled={!!actionLoading} className="btn-primary">
                    {actionLoading === 'approve' ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">check_circle</span>}
                    Approve
                  </button>
                )}
                {doc?.status !== 'ARCHIVED' && (
                  <button onClick={handleArchive} disabled={!!actionLoading} className="btn-secondary">
                    {actionLoading === 'archive' ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">archive</span>}
                    Archive
                  </button>
                )}
                {hasRole('ADMIN') && (
                  <button onClick={handleDelete} disabled={!!actionLoading} className="btn-danger">
                    {actionLoading === 'delete' ? <span className="material-icons animate-spin">refresh</span> : <span className="material-icons">delete</span>}
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-dark-border">
            {[
              { label: 'Owner', value: doc?.owner?.username || '—', icon: 'person' },
              { label: 'Version', value: `v${doc?.current_version || 1}`, icon: 'history' },
              { label: 'Created', value: formatDateTime(doc?.created_at), icon: 'calendar_today' },
              { label: 'Updated', value: formatDateTime(doc?.updated_at), icon: 'update' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                  <span className="material-icons text-sm">{m.icon}</span>{m.label}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Tags */}
          {doc?.tags && doc.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-900/30 dark:to-blue-900/30 border border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-105"
                  >
                    <span className="material-icons text-base">local_offer</span>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Version History */}
        {doc?.versions && doc.versions.length > 0 && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Version History</h3>
            <div className="space-y-3">
              {doc.versions.map((v, i) => (
                <div key={v.id} className={`flex items-center justify-between p-4 rounded-lg border ${i === 0 ? 'border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/10' : 'border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-hover'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-brand-600 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                      v{v.version_number}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Version {v.version_number} {i === 0 && <span className="text-xs text-brand-600 dark:text-brand-400 ml-1">(Current)</span>}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(v.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatFileSize(v.file_size)}</span>
                    <span className={`badge ${STATUS_COLORS[v.processing_status] || ''}`}>{v.processing_status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload New Version */}
        {hasRole(['ADMIN', 'CONTENT_OWNER']) && doc?.status !== 'ARCHIVED' && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Upload New Version</h3>
            <form onSubmit={handleNewVersion} className="flex items-end gap-3">
              <div className="flex-1">
                <label className="label">Select File</label>
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={(e) => setNewVersionFile(e.target.files[0])}
                  className="input-base"
                />
              </div>
              <button type="submit" disabled={!newVersionFile || uploadingVersion} className="btn-primary">
                {uploadingVersion ? <><span className="material-icons animate-spin">refresh</span>Uploading...</> : <><span className="material-icons">upload</span>Upload</>}
              </button>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DocumentDetail;
