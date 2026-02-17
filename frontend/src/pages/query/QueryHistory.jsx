import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { queryAPI } from '../../api/axios';
import { formatDateTime, truncate, getErrorMessage } from '../../utils/helpers';

const QueryHistory = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    queryAPI.history().then(r => setQueries(r.data.results || r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Query History">
      <div className="space-y-5">
        <div>
          <h2 className="page-title">Query History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your previous questions and answers</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          {/* List */}
          <div className="lg:col-span-2 card overflow-hidden">
            {loading ? (
              <div className="py-12 text-center"><span className="material-icons text-brand-600 text-4xl animate-spin">refresh</span></div>
            ) : queries.length === 0 ? (
              <div className="py-12 text-center">
                <span className="material-icons text-gray-300 dark:text-gray-600 text-5xl mb-3 block">history</span>
                <p className="text-gray-500 dark:text-gray-400">No queries yet</p>
                <Link to="/query" className="mt-3 btn-primary inline-flex"><span className="material-icons">quiz</span>Ask First Question</Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-border">
                {queries.map(q => (
                  <button key={q.id} onClick={() => setSelected(q)} className={`w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors ${selected?.id === q.id ? 'bg-brand-50 dark:bg-brand-900/20 border-l-2 border-brand-500' : ''}`}>
                    <div className="flex items-start gap-3">
                      <span className={`material-icons mt-0.5 ${q.was_successful ? 'text-green-500' : 'text-red-400'}`}>{q.was_successful ? 'check_circle' : 'error'}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{q.question}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDateTime(q.created_at)}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="card p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-1">Question</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selected.question}</p>
                </div>
                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><span className="material-icons text-sm">access_time</span>{formatDateTime(selected.created_at)}</span>
                  <span className="flex items-center gap-1"><span className="material-icons text-sm">token</span>{selected.tokens_used || 0} tokens</span>
                </div>
                <div className="border-t border-gray-100 dark:border-dark-border pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium mb-2">Answer</p>
                  <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{selected.answer || 'No answer recorded.'}</p>
                </div>
                <div className="pt-2">
                  <Link to="/query" className="btn-primary inline-flex">
                    <span className="material-icons">quiz</span> Ask Similar Question
                  </Link>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <span className="material-icons text-gray-300 dark:text-gray-600 text-5xl mb-3 block">touch_app</span>
                <p className="text-gray-500 dark:text-gray-400">Select a query to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default QueryHistory;
