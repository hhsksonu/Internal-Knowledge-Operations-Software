import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// InputField MUST be outside Register component
// If defined inside, it remounts on every keystroke = loses focus
const InputField = ({ label, name, type = 'text', placeholder, icon, value, onChange }) => (
  <div>
    <label className="label">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-xl">{icon}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className="input-base pl-10"
      />
    </div>
  </div>
);

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const [form, setForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
    role: 'EMPLOYEE',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (result.success) navigate('/dashboard');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-dark-bg">
      {/* Left Visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 relative overflow-hidden">
        <div className="relative flex flex-col items-center justify-center p-16 text-white text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8">
            <span className="material-icons text-white text-5xl">group_add</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">Join the Platform</h2>
          <p className="text-brand-100 text-lg mb-10 max-w-sm">
            Get access to your organization's knowledge base and AI-powered search capabilities.
          </p>
          <div className="w-full max-w-xs space-y-4">
            {[
              { icon: 'cloud_upload', text: 'Upload and manage documents' },
              { icon: 'psychology', text: 'AI-powered Q&A' },
              { icon: 'analytics', text: 'Usage analytics' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-4 bg-white/10 rounded-xl px-4 py-3">
                <span className="material-icons text-brand-200">{item.icon}</span>
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-16 xl:px-24 overflow-y-auto">
        <div className="flex items-center justify-between mb-10">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
              <span className="material-icons text-white text-xl">hub</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">Know Your Organization</span>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-dark-hover transition-colors"
          >
            <span className="material-icons text-gray-600 dark:text-gray-400">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create account</h1>
            <p className="text-gray-500 dark:text-gray-400">Join your team's knowledge platform</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
              <span className="material-icons text-red-500">error_outline</span>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                name="first_name"
                placeholder="John"
                icon="badge"
                value={form.first_name}
                onChange={handleChange}
              />
              <InputField
                label="Last Name"
                name="last_name"
                placeholder="Doe"
                icon="badge"
                value={form.last_name}
                onChange={handleChange}
              />
            </div>

            <InputField
              label="Username"
              name="username"
              placeholder="johndoe"
              icon="person"
              value={form.username}
              onChange={handleChange}
            />

            <InputField
              label="Email"
              name="email"
              type="email"
              placeholder="john@company.com"
              icon="email"
              value={form.email}
              onChange={handleChange}
            />

            {/* Role */}
            <div>
              <label className="label">Role</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-xl">work</span>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="input-base pl-10 appearance-none"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="CONTENT_OWNER">Content Owner</option>
                  <option value="REVIEWER">Reviewer</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-xl pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Password with eye toggle */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  required
                  className="input-base pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-icons text-xl">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Confirm Password with eye toggle */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-xl">lock_outline</span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="password_confirm"
                  value={form.password_confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  required
                  className="input-base pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-icons text-xl">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? (
                <><span className="material-icons animate-spin text-xl">refresh</span>Creating account...</>
              ) : (
                <>Create Account<span className="material-icons text-xl">arrow_forward</span></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
              <span className="material-icons text-base">arrow_back</span>Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;