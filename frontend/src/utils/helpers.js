export const USER_ROLES = { ADMIN: 'ADMIN', CONTENT_OWNER: 'CONTENT_OWNER', EMPLOYEE: 'EMPLOYEE', REVIEWER: 'REVIEWER' };

export const STATUS_COLORS = {
  DRAFT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  ARCHIVED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  UPLOADED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  PROCESSING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  READY: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const ROLE_LABELS = { ADMIN: 'Administrator', CONTENT_OWNER: 'Content Owner', EMPLOYEE: 'Employee', REVIEWER: 'Reviewer' };

export const formatDate = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }); };
export const formatDateTime = (d) => { if (!d) return 'N/A'; return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };
export const formatFileSize = (b) => { if (!b) return '0 B'; const k = 1024; const s = ['B', 'KB', 'MB', 'GB']; const i = Math.floor(Math.log(b) / Math.log(k)); return (b / Math.pow(k, i)).toFixed(1) + ' ' + s[i]; };
export const truncate = (t, n = 80) => !t ? '' : t.length <= n ? t : t.slice(0, n) + '...';
export const getInitials = (u) => u?.username?.[0]?.toUpperCase() || 'U';
export const getErrorMessage = (err) => {
  const d = err?.response?.data;
  if (!d) return err?.message || 'An error occurred';
  if (typeof d === 'string') return d;
  if (d.detail) return d.detail;
  if (d.message) return d.message;
  const key = Object.keys(d)[0];
  return Array.isArray(d[key]) ? d[key][0] : String(d[key]);
};
export const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
