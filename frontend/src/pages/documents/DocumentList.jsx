import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { documentsAPI } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate, STATUS_COLORS, getErrorMessage } from '../../utils/helpers';

const DocumentList = () => {
  const { hasRole } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [approving, setApproving] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await documentsAPI.list(params);
      setDocs(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [search, statusFilter]);

  const handleApprove = async (id) => {
    try {
      setApproving(id);
      await documentsAPI.approve(id, 'approve');
      fetchDocs();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setApproving(null);
    }
  };

  return (
    <DashboardLayout title="Documents">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="page-title">Documents</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{docs.length} documents found</p>
          </div>
          {hasRole(['ADMIN', 'CONTENT_OWNER']) && (
            <Link to="/documents/upload" className="btn-primary">
              <span className="material-icons text-xl">cloud_upload</span>
              Upload Document
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-10"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base sm:w-40">
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <button onClick={fetchDocs} className="btn-secondary">
              <span className="material-icons">refresh</span>
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <span className="material-icons text-red-500">error</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="py-16 text-center">
              <span className="material-icons text-brand-600 text-5xl animate-spin">refresh</span>
              <p className="mt-3 text-gray-500 dark:text-gray-400">Loading documents...</p>
            </div>
          ) : docs.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-icons text-gray-300 dark:text-gray-600 text-6xl mb-4 block">description</span>
              <p className="text-gray-900 dark:text-white font-medium">No documents found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {search ? 'Try a different search term' : 'Upload a document to get started'}
              </p>
              {hasRole(['ADMIN', 'CONTENT_OWNER']) && !search && (
                <Link to="/documents/upload" className="mt-4 btn-primary inline-flex">
                  <span className="material-icons">cloud_upload</span> Upload First Document
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="table-header">Document</th>
                    <th className="table-header hidden md:table-cell">Department</th>
                    <th className="table-header">Status</th>
                    <th className="table-header hidden lg:table-cell">Version</th>
                    <th className="table-header hidden lg:table-cell">Created</th>
                    <th className="table-header text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {docs.map(doc => (
                    <tr key={doc.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="material-icons text-brand-600 dark:text-brand-400 text-lg">description</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                            {doc.description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-xs">{doc.description}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-500 dark:text-gray-400">{doc.department || '—'}</td>
                      <td className="table-cell">
                        <span className={`badge ${STATUS_COLORS[doc.status]}`}>{doc.status}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400">v{doc.current_version || 1}</td>
                      <td className="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">{formatDate(doc.created_at)}</td>
                      <td className="table-cell text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/documents/${doc.id}`} className="p-1.5 text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors" title="View">
                            <span className="material-icons text-xl">visibility</span>
                          </Link>
                          {hasRole(['ADMIN', 'CONTENT_OWNER']) && doc.status === 'DRAFT' && (
                            <button onClick={() => handleApprove(doc.id)} disabled={approving === doc.id} className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Approve">
                              {approving === doc.id
                                ? <span className="material-icons text-xl animate-spin">refresh</span>
                                : <span className="material-icons text-xl">check_circle</span>
                              }
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentList;
