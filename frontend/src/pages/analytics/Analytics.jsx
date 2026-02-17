import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { analyticsAPI } from '../../api/axios';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sys, me] = await Promise.all([analyticsAPI.stats(), analyticsAPI.me()]);
        setStats(sys.data);
        setUserStats(me.data);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    load();
  }, []);

  const StatBox = ({ label, value, icon, color }) => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
          <span className="material-icons text-white text-xl">{icon}</span>
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value ?? '—'}</p>
    </div>
  );

  if (loading) return (
    <DashboardLayout title="Analytics">
      <div className="flex items-center justify-center py-20">
        <span className="material-icons text-brand-600 text-5xl animate-spin">refresh</span>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Platform usage and performance metrics</p>
        </div>

        {/* System Stats */}
        {stats && (
          <>
            <div>
              <h3 className="section-title mb-4">System Overview</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatBox label="Total Documents" value={stats.documents?.total} icon="description" color="bg-brand-600" />
                <StatBox label="Approved Documents" value={stats.documents?.approved} icon="check_circle" color="bg-green-600" />
                <StatBox label="Total Queries" value={stats.queries?.total} icon="quiz" color="bg-purple-600" />
                <StatBox label="Success Rate" value={stats.queries?.success_rate ? `${stats.queries.success_rate.toFixed(1)}%` : '—'} icon="trending_up" color="bg-teal-600" />
              </div>
            </div>

            <div>
              <h3 className="section-title mb-4">Resource Usage</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatBox label="Active Users" value={stats.users?.total_active} icon="people" color="bg-orange-600" />
                <StatBox label="Total Tokens Used" value={stats.tokens?.total_used?.toLocaleString()} icon="toll" color="bg-pink-600" />
                <StatBox label="Pending Docs" value={stats.documents?.pending} icon="pending_actions" color="bg-yellow-600" />
              </div>
            </div>
          </>
        )}

        {/* User Stats */}
        {userStats && (
          <div>
            <h3 className="section-title mb-4">My Usage</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatBox label="Queries Today" value={userStats.queries?.today} icon="today" color="bg-brand-600" />
              <StatBox label="Remaining Today" value={userStats.queries?.remaining_today} icon="hourglass_empty" color="bg-indigo-600" />
              <StatBox label="Total Queries" value={userStats.queries?.total} icon="history" color="bg-violet-600" />
              <StatBox label="Tokens Used" value={userStats.tokens_used} icon="token" color="bg-rose-600" />
            </div>
          </div>
        )}

        {/* Usage Limits */}
        {userStats && (
          <div className="card p-6">
            <h3 className="section-title mb-4">Daily Quota</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Queries used today</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{userStats.queries?.today || 0} / 100</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-dark-hover rounded-full overflow-hidden">
                  <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${Math.min((userStats.queries?.today || 0) / 100 * 100, 100)}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Resets daily at midnight</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
