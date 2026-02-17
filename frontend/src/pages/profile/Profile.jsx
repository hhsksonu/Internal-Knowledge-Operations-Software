import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';
import { ROLE_LABELS, getErrorMessage } from '../../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data);
      setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: getErrorMessage(err) });
    } finally { setSaving(false); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm_password) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return; }
    setChangingPw(true);
    try {
      await authAPI.changePassword({ old_password: pwForm.old_password, new_password: pwForm.new_password });
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: getErrorMessage(err) });
    } finally { setChangingPw(false); }
  };

  const Alert = ({ msg }) => !msg.text ? null : (
    <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${msg.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
      <span className="material-icons text-base">{msg.type === 'success' ? 'check_circle' : 'error'}</span>
      {msg.text}
    </div>
  );

  return (
    <DashboardLayout title="Profile">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h2 className="page-title">My Profile</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account information</p>
        </div>

        {/* Avatar & Role Card */}
        <div className="card p-6 flex items-center gap-5">
          <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{user?.first_name} {user?.last_name}</h3>
            <p className="text-gray-500 dark:text-gray-400">@{user?.username}</p>
            <span className="mt-1 inline-block text-xs px-2.5 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full font-medium">
              {ROLE_LABELS[user?.role] || user?.role}
            </span>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Personal Information</h3>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <Alert msg={profileMsg} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input type="text" value={form.first_name} onChange={e => setForm({...form, first_name: e.target.value})} className="input-base" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input type="text" value={form.last_name} onChange={e => setForm({...form, last_name: e.target.value})} className="input-base" />
              </div>
            </div>
            <div>
              <label className="label">Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-base" />
            </div>
            <div>
              <label className="label">Username</label>
              <input type="text" value={user?.username} disabled className="input-base opacity-60 cursor-not-allowed" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Username cannot be changed.</p>
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? <><span className="material-icons animate-spin">refresh</span>Saving...</> : <><span className="material-icons">save</span>Save Changes</>}
            </button>
          </form>
        </div>

        {/* Password Form */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Change Password</h3>
          <form onSubmit={handlePwChange} className="space-y-4">
            <Alert msg={pwMsg} />
            <div>
              <label className="label">Current Password</label>
              <input type="password" value={pwForm.old_password} onChange={e => setPwForm({...pwForm, old_password: e.target.value})} className="input-base" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" value={pwForm.new_password} onChange={e => setPwForm({...pwForm, new_password: e.target.value})} className="input-base" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" value={pwForm.confirm_password} onChange={e => setPwForm({...pwForm, confirm_password: e.target.value})} className="input-base" required />
            </div>
            <button type="submit" disabled={changingPw} className="btn-primary">
              {changingPw ? <><span className="material-icons animate-spin">refresh</span>Changing...</> : <><span className="material-icons">lock_reset</span>Change Password</>}
            </button>
          </form>
        </div>

        {/* Usage Stats */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Account Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">{user?.daily_query_count || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Queries Today</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-dark-hover rounded-lg">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.total_tokens_used?.toLocaleString() || 0}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tokens Used</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
