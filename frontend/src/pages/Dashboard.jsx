import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { analyticsAPI, documentsAPI, queryAPI } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, getErrorMessage } from '../utils/helpers';

const StatCard = ({ icon, label, value, color, link }) => (
  <Link to={link || '#'} className="card p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
      <span className="material-icons text-white text-2xl">{icon}</span>
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
    </div>
  </Link>
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await analyticsAPI.me();
        setUserStats(userRes.data);

        if (hasRole(['ADMIN', 'REVIEWER'])) {
          const sysRes = await analyticsAPI.stats();
          setStats(sysRes.data);
        }

        const docsRes = await documentsAPI.list({ page: 1 });
        setRecentDocs(docsRes.data.results?.slice(0, 5) || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusColor = { DRAFT: 'text-yellow-600 dark:text-yellow-400', APPROVED: 'text-green-600 dark:text-green-400', ARCHIVED: 'text-gray-500 dark:text-gray-400' };

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome */}
        <div className="card p-6 bg-gradient-to-r from-brand-600 to-brand-500 border-0">
          <h2 className="text-2xl font-bold text-white mb-1">
            Welcome back, {user?.first_name || user?.username}
          </h2>
          <p className="text-brand-100">
            {user?.role === 'ADMIN' ? 'You have full platform access.' :
             user?.role === 'CONTENT_OWNER' ? 'Manage documents and review content.' :
             'Search and query your knowledge base.'}
          </p>
        </div>

        {/* My Stats */}
        <div>
          <h3 className="section-title mb-4">My Activity</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="quiz" label="Queries Today" value={userStats?.queries?.today} color="bg-brand-600" link="/query/history" />
            <StatCard icon="history" label="Total Queries" value={userStats?.queries?.total} color="bg-indigo-600" link="/query/history" />
            <StatCard icon="toll" label="Tokens Used" value={userStats?.tokens_used} color="bg-purple-600" />
            <StatCard icon="feedback" label="Feedback Given" value={userStats?.feedback_given} color="bg-teal-600" />
          </div>
        </div>

        {/* System Stats (Admin/Reviewer only) */}
        {hasRole(['ADMIN', 'REVIEWER']) && stats && (
          <div>
            <h3 className="section-title mb-4">System Overview</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon="description" label="Total Documents" value={stats.documents?.total} color="bg-green-600" link="/documents" />
              <StatCard icon="check_circle" label="Approved Docs" value={stats.documents?.approved} color="bg-emerald-600" link="/documents" />
              <StatCard icon="people" label="Active Users" value={stats.users?.total_active} color="bg-orange-600" />
              <StatCard icon="bar_chart" label="Success Rate" value={stats.queries?.success_rate ? `${stats.queries.success_rate.toFixed(0)}%` : '—'} color="bg-cyan-600" link="/analytics" />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="section-title mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/query" className="card p-5 text-center hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
              <span className="material-icons text-brand-600 dark:text-brand-400 text-4xl mb-2 block group-hover:scale-110 transition-transform">quiz</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Ask a Question</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Query your knowledge base</p>
            </Link>
            <Link to="/documents" className="card p-5 text-center hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
              <span className="material-icons text-green-600 dark:text-green-400 text-4xl mb-2 block group-hover:scale-110 transition-transform">description</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Browse Documents</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View all documents</p>
            </Link>
            {hasRole(['ADMIN', 'CONTENT_OWNER']) && (
              <Link to="/documents/upload" className="card p-5 text-center hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
                <span className="material-icons text-purple-600 dark:text-purple-400 text-4xl mb-2 block group-hover:scale-110 transition-transform">cloud_upload</span>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Upload Document</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Add new content</p>
              </Link>
            )}
            <Link to="/query/history" className="card p-5 text-center hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all group">
              <span className="material-icons text-orange-600 dark:text-orange-400 text-4xl mb-2 block group-hover:scale-110 transition-transform">history</span>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Query History</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View past queries</p>
            </Link>
          </div>
        </div>

        {/* Recent Documents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Documents</h3>
            <Link to="/documents" className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium">View all</Link>
          </div>
          <div className="card overflow-hidden">
            {loading ? (
              <div className="py-12 text-center">
                <span className="material-icons text-brand-600 text-4xl animate-spin">refresh</span>
              </div>
            ) : recentDocs.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-icons text-gray-300 dark:text-gray-600 text-5xl mb-3 block">description</span>
                <p className="text-gray-500 dark:text-gray-400">No documents yet.</p>
                {hasRole(['ADMIN', 'CONTENT_OWNER']) && (
                  <Link to="/documents/upload" className="mt-3 inline-flex items-center gap-1 text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline">
                    <span className="material-icons text-base">add</span> Upload first document
                  </Link>
                )}
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-dark-hover">
                  <tr>
                    <th className="table-header">Document</th>
                    <th className="table-header hidden md:table-cell">Department</th>
                    <th className="table-header">Status</th>
                    <th className="table-header hidden lg:table-cell">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocs.map(doc => (
                    <tr key={doc.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <span className="material-icons text-gray-400">description</span>
                          <Link to={`/documents/${doc.id}`} className="font-medium text-brand-600 dark:text-brand-400 hover:underline">
                            {doc.title}
                          </Link>
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell text-gray-500 dark:text-gray-400">{doc.department || '—'}</td>
                      <td className="table-cell">
                        <span className={`font-medium text-xs ${statusColor[doc.status]}`}>{doc.status}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">{formatDateTime(doc.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
