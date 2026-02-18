import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { queryAPI, feedbackAPI } from '../../api/axios';
import { getErrorMessage, formatDateTime } from '../../utils/helpers';

const QueryPage = () => {
  const [question, setQuestion] = useState('');
  const [department, setDepartment] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackDone, setFeedbackDone] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true); setError(''); setResult(null); setFeedback(null); setFeedbackDone(false);
    try {
      const res = await queryAPI.ask({ question: question.trim(), department: department || undefined });
      setResult(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (type) => {
    if (!result?.query_id) return;
    setFeedbackSubmitting(true);
    try {
      await feedbackAPI.submit({ query_id: result.query_id, feedback_type: type });
      setFeedback(type);
      setFeedbackDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const exampleQuestions = [
    'What is the remote work policy?',
    'How do I submit an expense report?',
    'What are the onboarding steps for new employees?',
  ];

  return (
    <DashboardLayout title="Ask Question">
      <div className="max-w-3xl mx-auto space-y-5">
        <div>
          <h2 className="page-title">Ask a Question</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Search your knowledge base using natural language</p>
        </div>

        {/* Query Form */}
        <div className="card p-6">
          <form onSubmit={handleAsk} className="space-y-4">
            <div>
              <label className="label">Your Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your internal documents..."
                rows={3}
                className="input-base resize-none"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Filter by department (optional)"
                  className="input-base"
                />
              </div>
              <button type="submit" disabled={loading || !question.trim()} className="btn-primary sm:w-36">
                {loading
                  ? <><span className="material-icons animate-spin">refresh</span> Searching...</>
                  : <><span className="material-icons">search</span> Ask</>
                }
              </button>
            </div>
          </form>

          {/* Example questions */}
          {!result && !loading && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide">Example questions</p>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map(q => (
                  <button key={q} type="button" onClick={() => setQuestion(q)} className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-dark-hover hover:bg-brand-100 dark:hover:bg-brand-900/30 text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-300 rounded-full transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <span className="material-icons text-red-500">error</span>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="material-icons text-brand-600 animate-spin text-3xl">psychology</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Searching knowledge base...</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Finding the best answer for you</p>
              </div>
            </div>
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-hover rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-hover rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-dark-hover rounded w-4/5"></div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <div className="space-y-4">
            {/* Answer */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-brand-600 dark:text-brand-400">smart_toy</span>
                <h3 className="section-title">Answer</h3>
                <div className="ml-auto flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1"><span className="material-icons text-sm">token</span>{result.tokens_used} tokens</span>
                  <span className="flex items-center gap-1"><span className="material-icons text-sm">timer</span>{result.response_time_ms}ms</span>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                <ReactMarkdown>{result.answer}</ReactMarkdown>
              </div>

              {/* Feedback */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-dark-border">
                {feedbackDone ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                    <span className="material-icons">check_circle</span>
                    Thank you for your feedback!
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Was this helpful?</p>
                    <button onClick={() => handleFeedback('HELPFUL')} disabled={feedbackSubmitting} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors">
                      <span className="material-icons text-base">thumb_up</span> Helpful
                    </button>
                    <button onClick={() => handleFeedback('NOT_HELPFUL')} disabled={feedbackSubmitting} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-colors">
                      <span className="material-icons text-base">thumb_down</span> Not Helpful
                    </button>
                    <button onClick={() => handleFeedback('HALLUCINATION')} disabled={feedbackSubmitting} className="flex items-center gap-1 px-3 py-1.5 text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-colors">
                      <span className="material-icons text-base">warning</span> Incorrect
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sources */}
            {result.sources && result.sources.length > 0 && (
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons text-gray-400">link</span>
                  <h3 className="section-title">Sources ({result.sources.length})</h3>
                </div>
                <div className="space-y-3">
                  {result.sources.map((src, i) => (
                    <div key={i} className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg border-l-4 border-brand-500">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{src.document_title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">v{src.version_number}</span>
                          <span className={`text-xs font-semibold ${src.similarity_score >= 0.8 ? 'text-green-600 dark:text-green-400' : src.similarity_score >= 0.6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500'}`}>
                            {(src.similarity_score * 100).toFixed(0)}% match
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">"{src.text}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.sources?.length === 0 && (
              <div className="card p-6 text-center">
                <span className="material-icons text-yellow-500 text-4xl mb-2">search_off</span>
                <p className="font-medium text-gray-900 dark:text-white">No relevant documents found</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try rephrasing your question or upload more documents</p>
              </div>
            )}

            {/* Ask Another */}
            <button onClick={() => { setResult(null); setQuestion(''); }} className="btn-secondary w-full">
              <span className="material-icons">add</span> Ask Another Question
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QueryPage;
