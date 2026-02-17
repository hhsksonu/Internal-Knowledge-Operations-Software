import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

// ─── Data ─────────────────────────────────────────────────────────────────────

const stats = [
  { value: '10x', label: 'Faster than manual search', icon: 'rocket_launch' },
  { value: '95%', label: 'Answer accuracy rate', icon: 'verified' },
  { value: '24/7', label: 'Always available', icon: 'schedule' },
  { value: '100%', label: 'Your data stays internal', icon: 'lock' },
];

const howItWorks = [
  {
    step: '01',
    icon: 'upload_file',
    title: 'Upload Documents',
    desc: 'Content Owners upload PDFs, Word docs, and text files policies, SOPs, manuals, and more.',
    color: 'from-blue-600 to-blue-500',
  },
  {
    step: '02',
    icon: 'auto_awesome',
    title: 'AI Indexes Everything',
    desc: 'The platform automatically processes, chunks, and indexes every document using vector embeddings.',
    color: 'from-violet-600 to-violet-500',
  },
  {
    step: '03',
    icon: 'question_answer',
    title: 'Employees Ask Questions',
    desc: 'Any employee types a question in plain English and gets an instant answer with source references.',
    color: 'from-emerald-600 to-emerald-500',
  },
  {
    step: '04',
    icon: 'trending_up',
    title: 'Quality Improves Over Time',
    desc: 'Feedback loops and analytics help reviewers and admins keep the knowledge base accurate and growing.',
    color: 'from-orange-600 to-orange-500',
  },
];

const roles = [
  {
    id: 'employee',
    title: 'Employee',
    subtitle: 'For every staff member',
    icon: 'person',
    color: 'blue',
    accent: '#3b82f6',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-800',
    badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
    description: 'Get instant answers to any work question without digging through shared drives, emailing colleagues, or waiting for a response.',
    features: [
      { icon: 'quiz', text: 'Ask questions in plain English — no search syntax needed' },
      { icon: 'source', text: 'Every answer cites its exact source document and version' },
      { icon: 'history', text: 'Full query history so you can revisit past answers' },
      { icon: 'thumb_up', text: 'Rate answers to improve AI quality over time' },
      { icon: 'description', text: 'Browse and read all approved internal documents' },
    ],
    scenario: '"What is the notice period policy for probationary employees?"',
    result: 'Answered in 2 seconds from the HR Policy Manual v3.',
  },
  {
    id: 'content_owner',
    title: 'Content Owner',
    subtitle: 'For team leads & department heads',
    icon: 'edit_document',
    color: 'emerald',
    accent: '#10b981',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
    description: 'Own and maintain the knowledge in your department. Upload documents, manage versions, and control what employees can search.',
    features: [
      { icon: 'cloud_upload', text: 'Upload PDF, DOCX, and TXT files with drag & drop' },
      { icon: 'approval', text: 'Approve documents before they go live to employees' },
      { icon: 'history_edu', text: 'Full version control — update documents without losing history' },
      { icon: 'archive', text: 'Archive outdated content to keep the knowledge base clean' },
      { icon: 'label', text: 'Tag documents by department and category for easy filtering' },
    ],
    scenario: '"I need to publish the updated Leave Policy 2024 and replace the old one."',
    result: 'Upload → Process → Approve. Old version archived. Done in under a minute.',
  },
  {
    id: 'reviewer',
    title: 'Reviewer',
    subtitle: 'For QA and compliance teams',
    icon: 'manage_search',
    color: 'violet',
    accent: '#8b5cf6',
    lightBg: 'bg-violet-50 dark:bg-violet-950/30',
    border: 'border-violet-200 dark:border-violet-800',
    badge: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
    description: 'Monitor platform quality, track how employees use the knowledge base, and identify gaps before they become problems.',
    features: [
      { icon: 'bar_chart', text: 'Full analytics dashboard with query trends and success rates' },
      { icon: 'feedback', text: 'Review employee feedback on AI answers in real time' },
      { icon: 'search_insights', text: 'Spot knowledge gaps by seeing what queries return no results' },
      { icon: 'groups', text: 'Monitor usage by department to understand engagement' },
      { icon: 'timeline', text: 'Track platform performance and improvement over time' },
    ],
    scenario: '"Employees in Finance are getting poor results. What is missing?"',
    result: 'Analytics shows 40% of Finance queries have low confidence. 3 documents need uploading.',
  },
  {
    id: 'admin',
    title: 'Administrator',
    subtitle: 'For IT admins & platform managers',
    icon: 'admin_panel_settings',
    color: 'rose',
    accent: '#f43f5e',
    lightBg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    badge: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
    description: 'Full control over the entire platform. Manage users, monitor all activity, ensure security compliance, and maintain system health.',
    features: [
      { icon: 'assignment', text: 'Complete audit logs — every action by every user, timestamped' },
      { icon: 'manage_accounts', text: 'Create and manage user accounts and roles' },
      { icon: 'delete_forever', text: 'Permanently delete documents when required' },
      { icon: 'security', text: 'Monitor IP addresses and flag suspicious activity' },
      { icon: 'dashboard_customize', text: 'Full access to all platform features and settings' },
    ],
    scenario: '"I need to check who approved Document #45 and from which IP address."',
    result: 'Audit log shows: approved by j.smith at 10:42 AM from 192.168.1.45.',
  },
];

const features = [
  { icon: 'psychology', title: 'RAG-Powered AI', desc: 'Retrieval-Augmented Generation finds the most relevant document chunks and composes a precise answer — never hallucinating.' },
  { icon: 'shield', title: 'Enterprise Security', desc: 'JWT authentication, role-based access control, and encrypted storage. Your data never leaves your infrastructure.' },
  { icon: 'sync', title: 'Version Control', desc: 'Every document update creates a new version. Employees always get answers from the latest approved content.' },
  { icon: 'speed', title: 'Vector Search', desc: 'pgvector-powered semantic search finds the right content in milliseconds — even with thousands of documents.' },
  { icon: 'forum', title: 'Human Feedback Loop', desc: 'Employees rate every answer. Reviewers act on low-rated responses to continuously improve knowledge quality.' },
  { icon: 'inventory_2', title: 'Offline-First Data', desc: 'Everything runs on your own servers. No external API calls, no third-party data sharing, no compliance risk.' },
];

// ─── Components ───────────────────────────────────────────────────────────────

const RoleCard = ({ role }) => {
  const colorMap = {
    blue: 'bg-blue-600',
    emerald: 'bg-emerald-600',
    violet: 'bg-violet-600',
    rose: 'bg-rose-600',
  };

  return (
    <div className={`rounded-2xl border ${role.border} ${role.lightBg} p-8 flex flex-col gap-6`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 ${colorMap[role.color]} rounded-2xl flex items-center justify-center flex-shrink-0`}>
          <span className="material-icons text-white text-3xl">{role.icon}</span>
        </div>
        <div>
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${role.badge}`}>
            {role.subtitle}
          </span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{role.title}</h3>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{role.description}</p>

      {/* Features */}
      <ul className="space-y-3">
        {role.features.map((f) => (
          <li key={f.text} className="flex items-start gap-3">
            <div className={`w-7 h-7 ${colorMap[role.color]} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
              <span className="material-icons text-white text-sm">{f.icon}</span>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{f.text}</span>
          </li>
        ))}
      </ul>

      {/* Scenario */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-5 mt-auto">
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
          Real-world example
        </p>
        <div className="bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-200 dark:border-dark-border mb-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
            {role.scenario}
          </p>
        </div>
        <div className={`rounded-xl p-4 ${role.lightBg} border ${role.border}`}>
          <div className="flex items-start gap-2">
            <span className="material-icons text-sm mt-0.5" style={{ color: role.accent }}>check_circle</span>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{role.result}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const HomePage = () => {
  const { toggleTheme, isDark } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState('employee');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const navLinks = [
    { label: 'How It Works', anchor: 'how-it-works' },
    { label: 'For Your Role', anchor: 'roles' },
    { label: 'Features', anchor: 'features' },
  ];

  const activeRole = roles.find(r => r.id === activeTab);

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-white">

      {/* ── NAV ──────────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? 'bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-dark-border'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            style={{ textDecoration: 'none' }}
          >
            {/*
              Logo icon: fixed gold background — theme-independent.
              drop-shadow ensures legibility on both white (scrolled light mode)
              and dark transparent (hero) navbar states.
            */}
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:brightness-110"
              style={{
                backgroundColor: '#D4AF37',
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
              }}
            >
              <span className="material-icons text-white text-xl" style={{ lineHeight: 1 }}>hub</span>
            </div>
            <div>
              {/*
                Logo text: fixed gold — never switches with theme or scroll.
                A subtle text-shadow provides separation on pure-white scrolled backgrounds.
              */}
              <p
                className="text-sm font-bold leading-tight transition-colors duration-200 group-hover:brightness-110"
                style={{
                  color: '#D4AF37',
                  textShadow: '0 1px 3px rgba(0,0,0,0.18)',
                }}
              >
                Know Your Organization
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight hidden sm:block">
                AI-Powered Internal Knowledge System
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map(n => (
              <button key={n.anchor} onClick={() => scrollTo(n.anchor)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
                {n.label}
              </button>
            ))}
            <button onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors">
              <span className="material-icons text-gray-600 dark:text-gray-400 text-xl">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <Link to="/guide"
              className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors">
              <span className="material-icons text-base">menu_book</span>
              User Guide
            </Link>
            <Link to="/login"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Sign In
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card">
              <span className="material-icons text-gray-600 dark:text-gray-400">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card">
              <span className="material-icons text-gray-600 dark:text-gray-400">
                {mobileOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border px-4 py-4 space-y-1">
            {navLinks.map(n => (
              <button key={n.anchor} onClick={() => scrollTo(n.anchor)}
                className="block w-full text-left text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 hover:text-brand-600 dark:hover:text-brand-400">
                {n.label}
              </button>
            ))}
            <Link to="/guide" className="block text-sm font-medium text-gray-700 dark:text-gray-300 py-2.5 hover:text-brand-600 dark:hover:text-brand-400">
              User Guide
            </Link>
            <Link to="/login" className="block w-full text-center px-4 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold mt-2">
              Sign In
            </Link>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 dark:from-slate-950 dark:via-gray-900 dark:to-slate-950">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left — text */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-brand-600/20 border border-brand-500/30 rounded-full">
                <span className="material-icons text-brand-400 text-base">auto_awesome</span>
                <span className="text-brand-300 text-sm font-medium">AI-Powered Internal Knowledge System</span>
              </div>

              <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
                Know Your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-blue-400 to-violet-400">
                  Organization
                </span>
              </h1>

              <p className="text-xl text-slate-300 leading-relaxed mb-10 max-w-lg">
                Stop wasting hours searching through shared drives and asking colleagues. Ask any question get an instant, accurate answer from your official internal documents.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold text-base transition-all shadow-lg shadow-brand-900/40 hover:shadow-brand-900/60 hover:-translate-y-0.5">
                  Get Started Free
                  <span className="material-icons">arrow_forward</span>
                </Link>
                <Link to="/guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-bold text-base transition-all hover:-translate-y-0.5">
                  <span className="material-icons">menu_book</span>
                  View User Guide
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-4">
                {['Data stays on your servers', 'No external AI calls', 'Role-based access'].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-slate-400 text-sm">
                    <span className="material-icons text-emerald-400 text-base">check_circle</span>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — floating UI mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-2 text-slate-400 text-xs font-mono">know-your-organization.app</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                    <p className="text-slate-400 text-xs mb-2 font-medium">ASK A QUESTION</p>
                    <p className="text-white text-sm">"What is the maternity leave policy for employees with less than 1 year of service?"</p>
                  </div>
                  <div className="bg-brand-600/20 border border-brand-500/30 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-icons text-brand-400 text-base">smart_toy</span>
                      <span className="text-brand-300 text-xs font-semibold">KYO AI</span>
                    </div>
                    <p className="text-slate-200 text-sm leading-relaxed">
                      Employees with less than 12 months of service are entitled to 12 weeks of unpaid maternity leave, with the option to extend by 4 weeks...
                    </p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-slate-400 text-xs font-medium mb-1">SOURCE</p>
                    <div className="flex items-center gap-2">
                      <span className="material-icons text-slate-400 text-sm">description</span>
                      <span className="text-slate-300 text-xs">HR Policy Manual v4 — Section 6.2</span>
                      <span className="ml-auto text-emerald-400 text-xs font-semibold">94% match</span>
                    </div>
                  </div>
                </div>

                {/* Floating chips */}
                <div className="absolute -top-4 -right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Answer in 1.2s
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 text-xs px-3 py-2 rounded-xl shadow-lg flex items-center gap-2">
                  <span className="material-icons text-brand-600 text-sm">groups</span>
                  4 roles supported
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                <span className="material-icons text-brand-400 text-2xl mb-2 block">{s.icon}</span>
                <p className="text-3xl font-black text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-4 bg-gray-50 dark:bg-dark-card border-y border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-full">
              The Process
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              From document upload to answered question the entire workflow in four steps.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-14 left-[calc(12.5%+28px)] right-[calc(12.5%+28px)] h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 via-emerald-500 to-orange-500 opacity-30" />

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((h, i) => (
                <div key={h.step} className="relative text-center group">
                  <div className={`w-16 h-16 mx-auto mb-5 bg-gradient-to-br ${h.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <span className="material-icons text-white text-3xl">{h.icon}</span>
                  </div>
                  <span className="block text-5xl font-black text-gray-100 dark:text-gray-800 mb-2 select-none">
                    {h.step}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{h.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLES SECTION ─────────────────────────────── */}
      <section id="roles" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-full">
              Built for Everyone
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              How It Works for Your Role
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              KYO is designed for every level of your organization. Select your role to see exactly what you can do.
            </p>
          </div>

          {/* Role tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {roles.map(r => {
              const colorActive = {
                blue: 'bg-blue-600 text-white border-blue-600',
                emerald: 'bg-emerald-600 text-white border-emerald-600',
                violet: 'bg-violet-600 text-white border-violet-600',
                rose: 'bg-rose-600 text-white border-rose-600',
              };
              const isActive = activeTab === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setActiveTab(r.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border transition-all ${isActive
                    ? colorActive[r.color]
                    : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <span className="material-icons text-lg">{r.icon}</span>
                  {r.title}
                </button>
              );
            })}
          </div>

          {/* Active role card — full width */}
          {activeRole && (
            <div className={`rounded-2xl border ${activeRole.border} ${activeRole.lightBg} p-8 lg:p-10`}>
              <div className="grid lg:grid-cols-2 gap-10 items-start">
                {/* Left */}
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 ${{ blue: 'bg-blue-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600', rose: 'bg-rose-600' }[activeRole.color]
                      } rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <span className="material-icons text-white text-3xl">{activeRole.icon}</span>
                    </div>
                    <div>
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-1 ${activeRole.badge}`}>
                        {activeRole.subtitle}
                      </span>
                      <h3 className="text-3xl font-black text-gray-900 dark:text-white">{activeRole.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-8">
                    {activeRole.description}
                  </p>
                  <Link to="/guide"
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-colors ${{
                      blue: 'bg-blue-600 hover:bg-blue-700',
                      emerald: 'bg-emerald-600 hover:bg-emerald-700',
                      violet: 'bg-violet-600 hover:bg-violet-700',
                      rose: 'bg-rose-600 hover:bg-rose-700',
                    }[activeRole.color]}`}>
                    <span className="material-icons text-base">menu_book</span>
                    Read {activeRole.title} Guide
                  </Link>
                </div>

                {/* Right */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4">
                    What you can do
                  </h4>
                  {activeRole.features.map((f) => (
                    <div key={f.text} className="flex items-start gap-3 bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-100 dark:border-dark-border">
                      <div className={`w-8 h-8 ${{
                        blue: 'bg-blue-600', emerald: 'bg-emerald-600', violet: 'bg-violet-600', rose: 'bg-rose-600',
                      }[activeRole.color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <span className="material-icons text-white text-sm">{f.icon}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-1">{f.text}</p>
                    </div>
                  ))}

                  {/* Scenario */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                      Real-world example
                    </p>
                    <div className="bg-gray-50 dark:bg-dark-hover rounded-xl p-4 mb-3 border border-gray-200 dark:border-dark-border">
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">{activeRole.scenario}</p>
                    </div>
                    <div className={`rounded-xl p-4 ${activeRole.lightBg} border ${activeRole.border}`}>
                      <div className="flex items-start gap-2">
                        <span className="material-icons text-sm mt-0.5" style={{ color: activeRole.accent }}>check_circle</span>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{activeRole.result}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All 4 role summary cards */}
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map(r => (
              <button
                key={r.id}
                onClick={() => setActiveTab(r.id)}
                className={`text-left p-5 rounded-xl border transition-all hover:shadow-md ${activeTab === r.id
                  ? `${r.lightBg} ${r.border}`
                  : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
              >
                <span className="material-icons mb-2 block" style={{ color: r.accent }}>{r.icon}</span>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{r.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{r.subtitle}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────── */}
      <section id="features" className="py-24 px-4 bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 px-3 py-1 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 rounded-full">
              Under the Hood
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
              Built for Enterprise
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Production-grade technology that keeps your data secure, your answers accurate, and your team productive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="group bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-2xl p-6 hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-5 group-hover:bg-brand-600 transition-colors">
                  <span className="material-icons text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors">{f.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USER GUIDE CTA ───────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-dark-bg border-t border-gray-200 dark:border-dark-border">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-brand-700 via-brand-600 to-violet-600 rounded-3xl p-10 lg:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            <div className="relative">
              <span className="material-icons text-brand-200 text-5xl mb-4 block">menu_book</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Need Help Getting Started?
              </h2>
              <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
                Our complete User Guide walks you through every feature step by step, for every role. Whether you're an employee, content owner, reviewer, or admin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/guide"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-700 rounded-xl font-black text-base hover:bg-gray-100 transition-colors shadow-xl">
                  <span className="material-icons">menu_book</span>
                  Open User Guide
                </Link>
                <Link to="/register"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent border-2 border-white/40 text-white rounded-xl font-black text-base hover:bg-white/10 transition-colors">
                  <span className="material-icons">person_add</span>
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────── */}
      <section className="py-24 px-4 bg-gray-950 dark:bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
            Ready to Transform How Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">
              Team Finds Information?
            </span>
          </h2>
          <p className="text-xl text-slate-400 mb-10">
            Sign in or create an account to get instant access to your organization's knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-black text-lg transition-all shadow-2xl shadow-brand-900/50 hover:-translate-y-0.5">
              Get Started Free
              <span className="material-icons">arrow_forward</span>
            </Link>
            <Link to="/login"
              className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-black text-lg transition-all hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="bg-black text-gray-600 py-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/*
              Footer logo: same fixed gold treatment as nav logo.
              drop-shadow ensures contrast on the black footer background.
            */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: '#D4AF37',
                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))',
                }}
              >
                <span className="material-icons text-white text-lg" style={{ lineHeight: 1 }}>hub</span>
              </div>
              <div>
                <p
                  className="font-bold text-sm"
                  style={{ color: '#D4AF37' }}
                >
                  Know Your Organization
                </p>
                <p className="text-gray-600 text-xs">AI-Powered Internal Knowledge System</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/guide" className="hover:text-white transition-colors">User Guide</Link>
              <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            </div>
            <p className="text-xs text-gray-700">2024 Know Your Organization. Internal Use Only.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default HomePage;