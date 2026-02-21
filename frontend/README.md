# Know Your Organization - Frontend

Modern React frontend with dark mode, responsive design, and intuitive user experience.

---

## Tech Stack

- **Framework:** React 18.3
- **Build Tool:** Vite 5.0
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS 3.4
- **Icons:** Material Icons
- **Hosting:** Vercel (Production)

---

## Project Structure

```
frontend/
├── public/                     # Static assets
│   └── vite.svg
│
├── src/
│   ├── api/                   # API client configuration
│   │   └── axios.js          # Axios instance with base URL
│   │
│   ├── components/            # Reusable components
│   │   ├── layout/
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Header.jsx
│   │   └── common/
│   │       ├── LoadingSpinner.jsx
│   │       └── ErrorBoundary.jsx
│   │
│   ├── pages/                 # Page components
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── documents/
│   │   │   ├── DocumentList.jsx
│   │   │   ├── DocumentDetail.jsx
│   │   │   └── DocumentUpload.jsx
│   │   ├── query/
│   │   │   ├── QueryPage.jsx
│   │   │   └── QueryHistory.jsx
│   │   ├── analytics/
│   │   │   └── AnalyticsPage.jsx
│   │   ├── audit/
│   │   │   └── AuditLogs.jsx
│   │   ├── profile/
│   │   │   └── ProfilePage.jsx
│   │   ├── HomePage.jsx
│   │   └── UserGuide.jsx
│   │
│   ├── context/               # React Context
│   │   ├── AuthContext.jsx   # Authentication state
│   │   └── ThemeContext.jsx  # Dark/Light mode
│   │
│   ├── utils/                 # Helper functions
│   │   └── helpers.js        # Date formatting, error handling
│   │
│   ├── App.jsx               # Main app component
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
│
├── .env.example              # Environment variables template
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── vercel.json               # Vercel deployment config
```

---

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

**1. Clone and navigate:**
```bash
git clone https://github.com/yourusername/know-your-organization.git
cd know-your-organization/frontend
```

**2. Install dependencies:**
```bash
npm install
```

**3. Configure environment:**
```bash
cp .env.example .env
```

Edit `.env`:
```bash
VITE_API_URL=http://localhost:8000/api
```

**4. Start development server:**
```bash
npm run dev
```

**5. Open browser:**
```
http://localhost:3000
```

---

## Features

### Dark Mode
- Persistent theme preference (localStorage)
- Smooth transitions
- System preference detection
- Toggle button in header

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interface

### Authentication
- JWT token-based auth
- Automatic token refresh
- Protected routes
- Role-based UI rendering

### Real-time Features
- Loading states for all API calls
- Error handling with user-friendly messages
- Success notifications
- Optimistic UI updates

---

## API Integration

### Axios Configuration

**File:** `src/api/axios.js`

```javascript
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE });

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${BASE}/auth/refresh/`, {
          refresh: refreshToken
        });
        
        localStorage.setItem('accessToken', response.data.access);
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

---

## Styling Guide

### Tailwind Classes

**Common patterns:**

```jsx
// Card
<div className="card p-6">
  {/* Content */}
</div>

// Button Primary
<button className="btn-primary">
  Click Me
</button>

// Button Secondary
<button className="btn-secondary">
  Cancel
</button>

// Input Field
<input className="input-base" />

// Label
<label className="label">Field Name</label>

// Section Title
<h2 className="section-title">Title</h2>

// Page Title
<h1 className="page-title">Page Title</h1>
```

### Custom CSS Classes

**File:** `src/index.css`

```css
/* Cards */
.card {
  @apply bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-sm;
}

/* Buttons */
.btn-primary {
  @apply px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors;
}

/* Inputs */
.input-base {
  @apply w-full px-4 py-2 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent;
}

.label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1;
}

/* Typography */
.page-title {
  @apply text-3xl font-bold text-gray-900 dark:text-white;
}

.section-title {
  @apply text-lg font-semibold text-gray-900 dark:text-white;
}
```

---

## Authentication Flow

### Login Process

```javascript
// 1. User enters credentials
const handleLogin = async (credentials) => {
  try {
    const response = await authAPI.login(credentials);
    
    // 2. Store tokens
    localStorage.setItem('accessToken', response.data.access);
    localStorage.setItem('refreshToken', response.data.refresh);
    
    // 3. Store user info
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // 4. Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    setError('Invalid credentials');
  }
};
```

### Protected Routes

```jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};
```

---

## Production Deployment

### Vercel Deployment

**1. Install Vercel CLI (optional):**
```bash
npm install -g vercel
```

**2. Connect GitHub repository:**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Select the `frontend` folder as root

**3. Configure build settings:**
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**4. Add environment variables:**
- `VITE_API_URL` = `https://api.yourdomain.com/api`

**5. Deploy:**
```bash
vercel --prod
```

Or just push to GitHub (auto-deploys).

---

### Custom Domain Setup

**1. Add domain in Vercel:**
- Go to Project Settings → Domains
- Add: `app.yourdomain.com`
- Vercel provides DNS instructions

**2. Configure DNS:**
Add CNAME record:
```
app.yourdomain.com → cname.vercel-dns.com
```

**3. SSL:**
Vercel automatically provisions SSL certificate (Let's Encrypt).

---

### vercel.json Configuration

Create `vercel.json` in frontend root:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## Testing

**Run tests:**
```bash
npm test
```

**Run with coverage:**
```bash
npm run test:coverage
```

**Example test:**
```javascript
import { render, screen } from '@testing-library/react';
import { Login } from './pages/auth/Login';

test('renders login form', () => {
  render(<Login />);
  expect(screen.getByText(/sign in/i)).toBeInTheDocument();
});
```

---

## Build

**Development build:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

Build output goes to `dist/` folder.

---

## Environment Variables

### Development (.env.local)

```bash
VITE_API_URL=http://localhost:8000/api
```

### Production (.env.production)

```bash
VITE_API_URL=https://api.yourdomain.com/api
```

**Note:** All environment variables must be prefixed with `VITE_` to be exposed to the client.

---

## Theming

### Theme Configuration

**File:** `tailwind.config.js`

```javascript
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ... more shades
          600: '#2563eb',
          700: '#1d4ed8',
          // ... more shades
        },
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
          border: '#475569',
        }
      }
    }
  }
}
```

### Theme Context

**File:** `src/context/ThemeContext.jsx`

Provides:
- `isDark` - Current theme state
- `toggleTheme()` - Toggle function
- Persists to localStorage
- Syncs with system preference

---

## Responsive Design

### Breakpoints

```javascript
// tailwind.config.js
screens: {
  'sm': '640px',   // Mobile landscape
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Large desktop
  '2xl': '1536px'  // Extra large
}
```

### Usage

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Troubleshooting

**Build fails:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

**API calls failing:**
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors
- Verify backend is running

**Dark mode not working:**
- Check `ThemeContext` is wrapped around app
- Verify `darkMode: 'class'` in tailwind.config.js
- Clear localStorage and refresh

---

## License

MIT License - see [LICENSE](../LICENSE) file

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md)

---

**For backend documentation, see [../backend/README.md](../backend/README.md)**
