# Authentication Package

A reusable React/Next.js authentication package with TypeScript support, featuring automatic token refresh and request interception.

## Features

- 🔐 **Token Management**: Automatic access and refresh token handling
- 🔄 **Auto Refresh**: Seamless token refresh with request queuing
- 📦 **Type Safe**: Full TypeScript support with comprehensive type definitions
- 🎣 **React Hooks**: Easy-to-use `useAuth()` hook
- 🌐 **SSR Ready**: Configurable storage strategies for server-side rendering
- 🛡️ **Secure**: Best practices for token storage and refresh security
- 📱 **Framework Agnostic**: Works with React, Next.js, and other React frameworks

## Installation

```bash
npm install @keshavasilva/just-auth
```

## Quick Start

### 1. Wrap your app with AuthProvider

```tsx
import { AuthProvider } from '@keshavasilva/just-auth';

function App() {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      onAuthError={(error) => {
        console.error('Authentication error:', error);
        // Handle auth errors (e.g., redirect to login)
      }}
    >
      <YourApp />
    </AuthProvider>
  );
}
```

### 2. Use the authentication hook

```tsx
Use the provided API client for authenticated requests:

```tsx
import { useAuth } from '@keshavasilva/just-auth';

function LoginComponent() {
  const { login, logout, user, isAuthenticated, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ 
        email: 'user@example.com', 
        password: 'password' 
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.email}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## API Reference

### AuthProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `loginUrl` | `string` | ✅ | URL endpoint for user login |
| `refreshUrl` | `string` | ✅ | URL endpoint for token refresh |
| `storageStrategy` | `StorageStrategy` | ❌ | Custom storage strategy (defaults to localStorage) |
| `onAuthError` | `(error: Error) => void` | ❌ | Callback for authentication errors |
| `baseUrl` | `string` | ❌ | Base URL for API requests |
| `timeout` | `number` | ❌ | Request timeout in milliseconds |

### useAuth Hook

The `useAuth()` hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Current authenticated user |
| `isAuthenticated` | `boolean` | Whether user is authenticated |
| `loading` | `boolean` | Loading state for auth operations |
| `error` | `Error \| null` | Current error state |
| `login` | `(payload: LoginPayload) => Promise<void>` | Login function |
| `logout` | `() => void` | Logout function |
| `getAccessToken` | `() => string \| null` | Get current access token |

## Custom Storage Strategy

For server-side rendering or custom storage needs:

```tsx
import { StorageStrategy } from '@keshavasilva/just-auth';

const cookieStorage: StorageStrategy = {
  get: (key: string) => {
    // Get from cookies
    return getCookie(key);
  },
  set: (key: string, value: string) => {
    // Set cookie
    setCookie(key, value);
  },
  clear: (key: string) => {
    // Remove cookie
    removeCookie(key);
  }
};

<AuthProvider
  loginUrl="/api/auth/login"
  refreshUrl="/api/auth/refresh"
  storageStrategy={cookieStorage}
>
  <App />
</AuthProvider>
```

## Advanced Usage

### Using the API Client Directly

```tsx
import { ApiClient, TokenManager, RefreshQueue } from '@keshavasilva/just-auth';

const tokenManager = new TokenManager();
const refreshQueue = new RefreshQueue();
const apiClient = new ApiClient(
  'https://api.example.com',
  '/auth/refresh',
  tokenManager,
  refreshQueue
);

// Make authenticated requests
const response = await apiClient.get('/protected-endpoint');
```

## Type Definitions

### User Interface

```typescript
interface User {
  id: string | number;
  email?: string;
  name?: string;
  [key: string]: any;
}
```

### Auth Response

```typescript
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn?: number;
}
```

## Best Practices

1. **Error Handling**: Always implement the `onAuthError` callback to handle authentication failures gracefully.

2. **Token Security**: The package uses secure defaults for token storage. For production SSR applications, consider implementing a cookie-based storage strategy.

3. **Request Interceptors**: The built-in API client automatically adds Authorization headers and handles token refresh, but you can access the underlying axios instance if needed.

4. **Loading States**: Use the `loading` state from `useAuth()` to show appropriate UI feedback during authentication operations.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT © [ASYNCHRO]
