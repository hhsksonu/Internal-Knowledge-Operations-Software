import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';

// ─── Data ────────────────────────────────────────────────────────────────────

const whatIsThis = [
    {
        icon: 'psychology',
        title: 'AI-Powered Question Answering',
        desc: 'Ask any question in plain English and receive an instant, accurate answer pulled directly from your organization\'s official documents — no guessing, no searching.',
    },
    {
        icon: 'library_books',
        title: 'Centralized Document Repository',
        desc: 'All internal documents — policies, manuals, SOPs, guidelines — are stored in one secure, searchable place accessible to your entire team.',
    },
    {
        icon: 'verified',
        title: 'Source-Backed Answers',
        desc: 'Every answer shows exactly which document it came from, which version, and how closely it matched — giving you confidence in the information.',
    },
    {
        icon: 'shield',
        title: 'Role-Based Access Control',
        desc: 'Employees see only what they should. Admins control who can upload, approve, and manage content across the organization.',
    },
    {
        icon: 'assignment',
        title: 'Complete Audit Trail',
        desc: 'Every action — upload, approval, query, login — is logged automatically for compliance, security, and governance purposes.',
    },
    {
        icon: 'trending_up',
        title: 'Continuous Improvement',
        desc: 'Employees rate every AI answer. That feedback is reviewed by your team to keep the knowledge base accurate and improving over time.',
    },
];

const whoIsItFor = [
    {
        role: 'Employee',
        icon: 'person',
        color: 'bg-blue-600',
        light: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        headline: 'For every staff member who needs quick answers',
        points: [
            'Ask questions in plain English from any device',
            'Browse all approved internal documents',
            'View your full query history',
            'Rate answers to improve AI quality',
        ],
    },
    {
        role: 'Content Owner',
        icon: 'edit_document',
        color: 'bg-emerald-600',
        light: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'border-emerald-200 dark:border-emerald-800',
        headline: 'For team leads and department heads',
        points: [
            'Upload PDF, Word, and text documents',
            'Manage document versions and updates',
            'Approve documents before they go live',
            'Archive outdated content safely',
        ],
    },
    {
        role: 'Reviewer',
        icon: 'manage_search',
        color: 'bg-violet-600',
        light: 'bg-violet-50 dark:bg-violet-900/20',
        border: 'border-violet-200 dark:border-violet-800',
        headline: 'For QA, compliance, and quality teams',
        points: [
            'View full analytics and usage statistics',
            'Monitor query success rates by department',
            'Track employee feedback trends',
            'Identify gaps in the knowledge base',
        ],
    },
    {
        role: 'Administrator',
        icon: 'admin_panel_settings',
        color: 'bg-rose-600',
        light: 'bg-rose-50 dark:bg-rose-900/20',
        border: 'border-rose-200 dark:border-rose-800',
        headline: 'For IT admins and platform managers',
        points: [
            'Full access to all platform features',
            'View and search complete audit logs',
            'Manage all users and their roles',
            'Monitor system health and performance',
        ],
    },
];

const guideSteps = [
    {
        role: 'Employee',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-600',
        sections: [
            {
                title: 'How to Ask a Question',
                icon: 'quiz',
                steps: [
                    { step: 1, text: 'Click "Ask Question" in the left sidebar.' },
                    { step: 2, text: 'Type your question in natural language. Example: "What is the annual leave policy?"' },
                    { step: 3, text: 'Optionally filter by department (e.g. HR, Finance) to narrow results.' },
                    { step: 4, text: 'Click Ask and wait a few seconds.' },
                    { step: 5, text: 'Read the answer and check the Sources section to see which document it came from.' },
                    { step: 6, text: 'Click Helpful, Not Helpful, or Incorrect to rate the answer.' },
                ],
            },
            {
                title: 'How to Browse Documents',
                icon: 'description',
                steps: [
                    { step: 1, text: 'Click "Documents" in the left sidebar.' },
                    { step: 2, text: 'Use the search bar to find documents by name.' },
                    { step: 3, text: 'Use the Status dropdown to filter: All, Approved, Draft, or Archived.' },
                    { step: 4, text: 'Click the eye icon on any document to view its full details and version history.' },
                ],
            },
            {
                title: 'How to View Your Query History',
                icon: 'history',
                steps: [
                    { step: 1, text: 'Click "Query History" in the left sidebar.' },
                    { step: 2, text: 'Your past questions are listed on the left panel.' },
                    { step: 3, text: 'Click any question to view the full answer and details on the right.' },
                    { step: 4, text: 'Click "Ask Similar Question" to return to the query page.' },
                ],
            },
        ],
    },
    {
        role: 'Content Owner',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-600',
        sections: [
            {
                title: 'How to Upload a Document',
                icon: 'cloud_upload',
                steps: [
                    { step: 1, text: 'Click "Upload Document" in the left sidebar.' },
                    { step: 2, text: 'Drag and drop your file onto the upload zone, or click to browse. Supported: PDF, DOCX, TXT (max 10MB).' },
                    { step: 3, text: 'Fill in the Title, Description, Department, and Tags fields.' },
                    { step: 4, text: 'Click Upload Document.' },
                    { step: 5, text: 'Wait for processing to complete: UPLOADED → PROCESSING → READY (10–60 seconds).' },
                    { step: 6, text: 'The document is now in DRAFT status. Approve it to make it searchable.' },
                ],
            },
            {
                title: 'How to Approve a Document',
                icon: 'check_circle',
                steps: [
                    { step: 1, text: 'Go to Documents and find the document with DRAFT status.' },
                    { step: 2, text: 'Option A: Click the green tick icon in the Actions column for a quick approval.' },
                    { step: 3, text: 'Option B: Open the document detail page and click the Approve button.' },
                    { step: 4, text: 'Status changes to APPROVED — it is now searchable by all employees.' },
                ],
            },
            {
                title: 'How to Upload a New Version',
                icon: 'upload_file',
                steps: [
                    { step: 1, text: 'Open the document detail page for the document you want to update.' },
                    { step: 2, text: 'Scroll to the "Upload New Version" section at the bottom.' },
                    { step: 3, text: 'Select your updated file and click Upload.' },
                    { step: 4, text: 'Approve the new version so employees see the updated content.' },
                ],
            },
        ],
    },
    {
        role: 'Reviewer',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-600',
        sections: [
            {
                title: 'How to Use Analytics',
                icon: 'bar_chart',
                steps: [
                    { step: 1, text: 'Click "Analytics" in the left sidebar.' },
                    { step: 2, text: 'View System Overview: total documents, queries, success rate, and active users.' },
                    { step: 3, text: 'View My Usage to see your own personal activity statistics.' },
                    { step: 4, text: 'Check the Daily Quota bar to see how much capacity has been used today.' },
                    { step: 5, text: 'Look for low success rates — this indicates missing content that should be uploaded.' },
                ],
            },
        ],
    },
    {
        role: 'Administrator',
        color: 'text-rose-600 dark:text-rose-400',
        bg: 'bg-rose-600',
        sections: [
            {
                title: 'How to Use Audit Logs',
                icon: 'assignment',
                steps: [
                    { step: 1, text: 'Click "Audit Logs" in the left sidebar.' },
                    { step: 2, text: 'View the complete record of all platform actions: Action, User, Resource, IP Address, and Timestamp.' },
                    { step: 3, text: 'Use the Search bar to filter by username or resource.' },
                    { step: 4, text: 'Use the Action filter to show specific event types: Document Upload, Login, Query Executed, etc.' },
                    { step: 5, text: 'Use this data for security reviews, compliance reports, and activity audits.' },
                ],
            },
            {
                title: 'Weekly Admin Checklist',
                icon: 'checklist',
                steps: [
                    { step: 1, text: 'Review Audit Logs for unusual or unauthorized activity.' },
                    { step: 2, text: 'Check Analytics for usage trends and engagement.' },
                    { step: 3, text: 'Follow up on documents still in DRAFT status.' },
                    { step: 4, text: 'Check for any documents with FAILED processing status.' },
                    { step: 5, text: 'Review employee feedback to identify quality issues.' },
                ],
            },
        ],
    },
];

const faqs = [
    {
        q: 'Is my data secure?',
        a: 'Yes. All data is stored on your organization\'s own servers. Nothing is sent to external AI services. JWT authentication and role-based access ensure only authorized users can see what they should.',
    },
    {
        q: 'Who can see my questions?',
        a: 'Your query history is private to your own account. Administrators can see activity logs for compliance purposes, but other employees cannot see your questions.',
    },
    {
        q: 'What file types can be uploaded?',
        a: 'PDF, Microsoft Word (.docx), and plain text (.txt) files. Maximum file size is 10MB per document.',
    },
    {
        q: 'Why is the AI answer sometimes incomplete?',
        a: 'The AI answers based only on documents that have been uploaded and approved. If information is missing, it means the relevant document has not been added to the system yet. Click "Incorrect" or "Not Helpful" to flag it.',
    },
    {
        q: 'What happens to archived documents?',
        a: 'Archived documents are removed from search results but are never deleted. The full version history is preserved and administrators can still view them.',
    },
    {
        q: 'Can employees see Draft documents?',
        a: 'No. Only Approved documents appear in search results for employees. Content Owners and Administrators can see documents in all statuses.',
    },
    {
        q: 'What is my daily query limit?',
        a: 'Each user can submit up to 100 queries per day. This limit resets every day at midnight. Your remaining quota is shown on the Analytics page.',
    },
    {
        q: 'How do I report a problem?',
        a: 'Contact your platform Administrator with a description of the issue, the steps that led to it, and a screenshot if possible.',
    },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

const SectionAnchor = ({ id }) => <div id={id} className="-mt-20 pt-20" />;

const NavDot = ({ label, anchor, active, onClick }) => (
    <button
        onClick={onClick}
        className={`text-sm font-medium transition-colors ${active
                ? 'text-brand-600 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
    >
        {label}
    </button>
);

const FaqItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 text-left bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors"
            >
                <span className="font-semibold text-gray-900 dark:text-white text-sm">{q}</span>
                <span className="material-icons text-gray-400 flex-shrink-0 ml-4">
                    {open ? 'expand_less' : 'expand_more'}
                </span>
            </button>
            {open && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const UserGuide = () => {
    const { toggleTheme, isDark } = useTheme();
    const [activeRole, setActiveRole] = useState('Employee');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        setMobileMenuOpen(false);
    };

    const activeGuide = guideSteps.find(g => g.role === activeRole);

    const navLinks = [
        { label: 'What is KYO?', anchor: 'what-is-this' },
        { label: 'Who Is It For?', anchor: 'who-is-it-for' },
        { label: 'User Guide', anchor: 'user-guide' },
        { label: 'FAQ', anchor: 'faq' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-dark-bg text-gray-900 dark:text-gray-100">

            {/* ── Sticky Nav ─────────────────────────────────── */}
            <nav className="fixed top-0 w-full z-50 glass border-b border-gray-200 dark:border-dark-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center">
                            <span className="material-icons text-white text-xl">hub</span>
                        </div>
                        <div className="leading-tight">
                            <p className="text-sm font-bold text-gray-900 dark:text-white leading-none">Know Your Organization</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-none">User Guide</p>
                        </div>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map(n => (
                            <button
                                key={n.anchor}
                                onClick={() => scrollTo(n.anchor)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors"
                            >
                                {n.label}
                            </button>
                        ))}
                    </div>

                    {/* Right controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-dark-card hover:bg-gray-200 dark:hover:bg-dark-hover transition-colors"
                        >
                            <span className="material-icons text-gray-600 dark:text-gray-400">
                                {isDark ? 'light_mode' : 'dark_mode'}
                            </span>
                        </button>
                        <Link
                            to="/login"
                            className="hidden sm:inline-flex items-center gap-1 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <span className="material-icons text-base">login</span>
                            Sign In
                        </Link>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-dark-card"
                        >
                            <span className="material-icons text-gray-600 dark:text-gray-400">
                                {mobileMenuOpen ? 'close' : 'menu'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border px-4 py-3 space-y-2">
                        {navLinks.map(n => (
                            <button
                                key={n.anchor}
                                onClick={() => scrollTo(n.anchor)}
                                className="block w-full text-left text-sm text-gray-700 dark:text-gray-300 font-medium py-2 hover:text-brand-600 dark:hover:text-brand-400"
                            >
                                {n.label}
                            </button>
                        ))}
                        <Link to="/login" className="block w-full text-center px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium mt-2">
                            Sign In
                        </Link>
                    </div>
                )}
            </nav>

            {/* ── Hero ───────────────────────────────────────── */}
            <section className="pt-28 pb-16 px-4 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 bg-white/10 rounded-full border border-white/20">
                        <span className="material-icons text-brand-200 text-base">menu_book</span>
                        <span className="text-white text-sm font-medium">Documentation</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        Know Your Organization
                    </h1>
                    <p className="text-xl text-brand-100 mb-8">
                        AI-Powered Internal Knowledge System
                    </p>
                    <p className="text-brand-200 max-w-2xl mx-auto text-base leading-relaxed">
                        Everything you need to understand, use, and get the most out of your organization's knowledge platform. Find the guide for your role below.
                    </p>

                    {/* Quick jump buttons */}
                    <div className="mt-10 flex flex-wrap justify-center gap-3">
                        {navLinks.map(n => (
                            <button
                                key={n.anchor}
                                onClick={() => scrollTo(n.anchor)}
                                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                {n.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHAT IS THIS PLATFORM ──────────────────────── */}
            <section className="py-20 px-4">
                <SectionAnchor id="what-is-this" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block mb-3 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Overview
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            What Is This Platform?
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Know Your Organization (KYO) is your company's central hub for internal knowledge — powered by AI to give every employee instant, accurate answers from official documents.
                        </p>
                    </div>

                    {/* Problem / Solution callout */}
                    <div className="grid md:grid-cols-2 gap-6 mb-14">
                        <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white">report_problem</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">The Problem</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Employees waste hours searching through shared drives, email threads, and PDFs trying to find the right policy or procedure — often giving up or asking colleagues who also don't know.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                    <span className="material-icons text-white">check_circle</span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">The Solution</h3>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                KYO lets anyone type a question in plain English and get an instant, source-backed answer from your official documents — in seconds, available 24/7, from any device.
                            </p>
                        </div>
                    </div>

                    {/* Feature grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {whatIsThis.map((f) => (
                            <div
                                key={f.title}
                                className="group p-6 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                            >
                                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:bg-brand-600 transition-colors">
                                    <span className="material-icons text-brand-600 dark:text-brand-400 group-hover:text-white transition-colors">
                                        {f.icon}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── WHO IS IT FOR ──────────────────────────────── */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-dark-card border-y border-gray-200 dark:border-dark-border">
                <SectionAnchor id="who-is-it-for" />
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <span className="inline-block mb-3 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Roles
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Who Is This For?
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            KYO is built for every level of your organization, with tailored access and capabilities for each role.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {whoIsItFor.map((r) => (
                            <div
                                key={r.role}
                                className={`p-6 rounded-2xl border ${r.light} ${r.border}`}
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <div className={`w-12 h-12 ${r.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                        <span className="material-icons text-white text-2xl">{r.icon}</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                                            Role
                                        </p>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{r.role}</h3>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 font-medium">{r.headline}</p>
                                <ul className="space-y-2">
                                    {r.points.map((pt) => (
                                        <li key={pt} className="flex items-start gap-2">
                                            <span className="material-icons text-base mt-0.5 flex-shrink-0 text-gray-400">
                                                arrow_right
                                            </span>
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{pt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── USER GUIDE ─────────────────────────────────── */}
            <section className="py-20 px-4">
                <SectionAnchor id="user-guide" />
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block mb-3 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                            Step-by-Step
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            User Guide
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Select your role to see the relevant guide for you.
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {guideSteps.map(g => (
                            <button
                                key={g.role}
                                onClick={() => setActiveRole(g.role)}
                                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeRole === g.role
                                        ? 'bg-brand-600 text-white shadow-lg'
                                        : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 hover:border-brand-400 dark:hover:border-brand-600'
                                    }`}
                            >
                                {g.role}
                            </button>
                        ))}
                    </div>

                    {/* Guide content */}
                    {activeGuide && (
                        <div className="space-y-8">
                            {activeGuide.sections.map((sec) => (
                                <div
                                    key={sec.title}
                                    className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden"
                                >
                                    {/* Section header */}
                                    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-hover">
                                        <div className={`w-9 h-9 ${activeGuide.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                            <span className="material-icons text-white text-lg">{sec.icon}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-white">{sec.title}</h3>
                                    </div>

                                    {/* Steps */}
                                    <div className="p-6 space-y-4">
                                        {sec.steps.map((s) => (
                                            <div key={s.step} className="flex items-start gap-4">
                                                <div className={`w-7 h-7 ${activeGuide.bg} rounded-full flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                                    <span className="text-white text-xs font-bold">{s.step}</span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pt-0.5">
                                                    {s.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── FAQ ────────────────────────────────────────── */}
            <section className="py-20 px-4 bg-gray-50 dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                <SectionAnchor id="faq" />
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-block mb-3 px-3 py-1 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-full uppercase tracking-wide">
                            FAQ
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Quick answers to the most common questions.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {faqs.map((f) => (
                            <FaqItem key={f.q} q={f.q} a={f.a} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ────────────────────────────────────────── */}
            <section className="py-16 px-4 bg-brand-600 dark:bg-brand-800">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-brand-100 mb-8">
                        Sign in to your organization's Know Your Organization platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-600 rounded-xl font-bold text-base hover:bg-gray-100 transition-colors shadow-lg"
                        >
                            <span className="material-icons">login</span>
                            Sign In
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-transparent border-2 border-white/50 text-white rounded-xl font-bold text-base hover:bg-white/10 transition-colors"
                        >
                            <span className="material-icons">person_add</span>
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Footer ─────────────────────────────────────── */}
            <footer className="bg-gray-900 dark:bg-black text-gray-400 py-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="material-icons text-brand-400 text-xl">hub</span>
                    <span className="text-white font-semibold text-sm">Know Your Organization</span>
                </div>
                <p className="text-xs text-gray-600">AI-Powered Internal Knowledge System</p>
                <p className="text-xs text-gray-700 mt-3">2024 Know Your Organization. Internal Use Only.</p>
            </footer>

        </div>
    );
};

export default UserGuide;