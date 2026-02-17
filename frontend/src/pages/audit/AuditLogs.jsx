import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { auditAPI } from '../../api/axios';
import { formatDateTime, getErrorMessage } from '../../utils/helpers';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (actionFilter) params.action = actionFilter;
      const res = await auditAPI.logs(params);
      setLogs(res.data.results || res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [search, actionFilter]);

  const actionColor = {
    DOCUMENT_UPLOAD: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    DOCUMENT_APPROVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    DOCUMENT_DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    USER_LOGIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    QUERY_EXECUTED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  };

  return (
    <DashboardLayout title="Audit Logs">
      <div className="space-y-5">
        <div>
          <h2 className="page-title">Audit Logs</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete activity trail across the platform</p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400">search</span>
              <input
                type="text"
                placeholder="Search by user or resource..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-base pl-10"
              />
            </div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="input-base sm:w-52"
            >
              <option value="">All Actions</option>
              <option value="DOCUMENT_UPLOAD">Document Upload</option>
              <option value="DOCUMENT_APPROVE">Document Approve</option>
              <option value="DOCUMENT_DELETE">Document Delete</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="QUERY_EXECUTED">Query Executed</option>
            </select>
            <button onClick={fetchLogs} className="btn-secondary">
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
              <p className="mt-3 text-gray-500 dark:text-gray-400">Loading audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center">
              <span className="material-icons text-gray-300 dark:text-gray-600 text-6xl mb-4 block">assignment</span>
              <p className="text-gray-900 dark:text-white font-medium">No audit logs found</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Activity will appear here as users interact with the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-hover border-b border-gray-200 dark:border-dark-border">
                  <tr>
                    <th className="table-header">Action</th>
                    <th className="table-header">User</th>
                    <th className="table-header hidden md:table-cell">Resource</th>
                    <th className="table-header hidden lg:table-cell">IP Address</th>
                    <th className="table-header">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="table-row">
                      <td className="table-cell">
                        <span className={`badge ${actionColor[log.action] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {log.user?.username?.[0]?.toUpperCase() || '?'}
                          </div>
                          <span className="text-gray-900 dark:text-gray-200">{log.user?.username || 'System'}</span>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-500 dark:text-gray-400">
                        {log.resource_type && (
                          <span>{log.resource_type} {log.resource_id && `#${log.resource_id}`}</span>
                        )}
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <code className="text-xs bg-gray-100 dark:bg-dark-hover px-2 py-0.5 rounded text-gray-600 dark:text-gray-400">
                          {log.ip_address || '—'}
                        </code>
                      </td>
                      <td className="table-cell text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(log.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-600 text-center">
          Showing {logs.length} audit log entries
        </p>
      </div>
    </DashboardLayout>
  );
};

export default AuditLogs;
