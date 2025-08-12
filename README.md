# @keshavasilva/just-auth

A lightweight, headless authentication package for React and Next.js applications with automatic token refresh and flexible storage strategies.

## ✨ Features

- 🔐 **Headless Authentication** - No UI components, just logic
- 🔄 **Automatic Token Refresh** - Seamless token renewal on expiry
- 🏪 **Flexible Storage** - localStorage, cookies, or custom storage strategies
- 🚫 **Request Queuing** - Prevents race conditions during token refresh
- 📱 **SSR Compatible** - Works with Next.js server-side rendering
- 🎯 **TypeScript First** - Full type safety out of the box
- ⚡ **Zero Dependencies** - Only requires React as peer dependency
- 🔧 **Configurable** - Customize URLs, storage, and error handling

## 📦 Installation

```bash
npm install @keshavasilva/just-auth
```

## 🚀 Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@keshavasilva/just-auth';

function App() {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      onAuthError={(error) => {
        console.log('Authentication error:', error);
        // Redirect to login page
      }}
    >
      <YourAppComponents />
    </AuthProvider>
  );
}
```

### 2. Use the authentication hook

```tsx
import { useAuth } from '@keshavasilva/just-auth';

function LoginPage() {
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // User is now logged in, tokens are stored automatically
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### 3. Access user data and authentication state

```tsx
import { useAuth } from '@keshavasilva/just-auth';

function Dashboard() {
  const { user, isAuthenticated, logout, getAccessToken } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.name}!</h1>
      <button onClick={logout}>Logout</button>
      
      {/* Access token for manual API calls */}
      <button onClick={() => {
        const token = getAccessToken();
        console.log('Current token:', token);
      }}>
        Get Token
      </button>
    </div>
  );
}
```

## 🔧 API Reference

### AuthProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `loginUrl` | `string` | ✅ | Endpoint for user login |
| `refreshUrl` | `string` | ✅ | Endpoint for token refresh |
| `storageStrategy` | `StorageStrategy` | ❌ | Custom storage implementation (defaults to localStorage) |
| `onAuthError` | `(error: Error) => void` | ❌ | Callback when authentication fails |
| `children` | `ReactNode` | ✅ | Your app components |

### useAuth Hook Returns

| Property | Type | Description |
|----------|------|-------------|
| `user` | `object \| null` | Current user data |
| `isAuthenticated` | `boolean` | Whether user is logged in |
| `loading` | `boolean` | Loading state for auth operations |
| `error` | `Error \| null` | Current error state |
| `login(payload)` | `(payload: object) => Promise<void>` | Login function |
| `logout()` | `() => void` | Logout function |
| `getAccessToken()` | `() => string \| null` | Get current access token |

## 🏪 Storage Strategies

### Default (localStorage)
```tsx
<AuthProvider
  loginUrl="/api/auth/login"
  refreshUrl="/api/auth/refresh"
  // Uses localStorage by default
/>
```

### Custom Storage (e.g., Cookies for SSR)
```tsx
import Cookies from 'js-cookie';

const cookieStorage = {
  get: (key: string) => Cookies.get(key) || null,
  set: (key: string, value: string) => Cookies.set(key, value),
  clear: (key: string) => Cookies.remove(key),
};

<AuthProvider
  loginUrl="/api/auth/login"
  refreshUrl="/api/auth/refresh"
  storageStrategy={cookieStorage}
/>
```

### Session Storage
```tsx
const sessionStorage = {
  get: (key: string) => window.sessionStorage.getItem(key),
  set: (key: string, value: string) => window.sessionStorage.setItem(key, value),
  clear: (key: string) => window.sessionStorage.removeItem(key),
};

<AuthProvider
  storageStrategy={sessionStorage}
  // ... other props
/>
```

## 🔄 Automatic Token Refresh

The package automatically handles token refresh when:

- ✅ **API returns 401** - Automatically refreshes tokens and retries request
- ✅ **Multiple simultaneous requests** - Queues requests to prevent race conditions
- ✅ **Transparent to user** - Original request succeeds after refresh
- ✅ **Graceful failure** - Calls `onAuthError` if refresh fails

```tsx
// This request might trigger automatic token refresh
const response = await fetch('/api/protected-data', {
  headers: {
    'Authorization': `Bearer ${getAccessToken()}`
  }
});
// User never sees 401 error - refresh happens automatically
```

## 🗄️ Backend API Requirements

Your backend should implement these endpoints:

### Login Endpoint
```javascript
// POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Refresh Endpoint
```javascript
// POST /api/auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..." // optional new refresh token
}
```

## 🔐 Security Best Practices

- ✅ **Short-lived access tokens** (15 minutes recommended)
- ✅ **Longer refresh tokens** (7-30 days)
- ✅ **Secure HTTP-only cookies** for refresh tokens (server-side)
- ✅ **HTTPS only** in production
- ✅ **Token rotation** on refresh
- ✅ **Logout endpoint** to invalidate tokens

## 🌐 Next.js SSR Example

```tsx
// pages/_app.tsx
import { AuthProvider } from '@keshavasilva/just-auth';
import Cookies from 'js-cookie';

const cookieStorage = {
  get: (key: string) => Cookies.get(key) || null,
  set: (key: string, value: string) => Cookies.set(key, value, { secure: true }),
  clear: (key: string) => Cookies.remove(key),
};

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      storageStrategy={cookieStorage}
      onAuthError={() => {
        window.location.href = '/login';
      }}
    >
      <Component {...pageProps} />
    </AuthProvider>
  );
}
```

## 🧪 Error Handling

```tsx
import { useAuth } from '@keshavasilva/just-auth';

function MyComponent() {
  const { login, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'wrong' });
    } catch (err) {
      // Handle specific errors
      if (err.response?.status === 401) {
        alert('Invalid credentials');
      } else if (err.response?.status === 429) {
        alert('Too many attempts, try again later');
      } else {
        alert('Login failed');
      }
    }
  };

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
```

## 📱 Token Types Supported

- ✅ **JWT (JSON Web Tokens)** - Most common
- ✅ **Opaque tokens** - Server-side validation
- ✅ **Session tokens** - Traditional sessions
- ✅ **Custom token formats** - Any Bearer token

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT © [ASYNCHRO](LICENSE)

## 🔗 Links

- [npm package](https://www.npmjs.com/package/@keshavasilva/just-auth)
- [GitHub repository](https://github.com/KeshavaTelan/just-auth)
- [Issues](https://github.com/KeshavaTelan/just-auth/issues)

---

**Made with ❤️ for the React community**
