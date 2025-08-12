# Usage Examples

## Basic Usage

### 1. Install the package

```bash
npm install @keshavasilva/just-auth
```

### 2. Setup AuthProvider in your React app

```tsx
// App.tsx
import React from 'react';
import { AuthProvider } from '@your-org/auth-package';
import { LoginComponent } from './components/LoginComponent';

function App() {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      onAuthError={(error) => {
        console.error('Auth error:', error);
        // Redirect to login or show error message
      }}
    >
      <div className="app">
        <LoginComponent />
      </div>
    </AuthProvider>
  );
}

export default App;
```

### 3. Create a login component

```tsx
// components/LoginComponent.tsx
import React, { useState } from 'react';
import { useAuth } from '@your-org/auth-package';

export const LoginComponent: React.FC = () => {
  const { login, logout, user, isAuthenticated, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {error && <div className="error">{error.message}</div>}
      
      {isAuthenticated ? (
        <div>
          <h2>Welcome, {user?.email}!</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>Login</h2>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </div>
  );
};
```

## Next.js Usage

### 1. Setup with custom storage for SSR

```tsx
// lib/auth-storage.ts
import { StorageStrategy } from '@your-org/auth-package';
import Cookies from 'js-cookie';

export const cookieStorage: StorageStrategy = {
  get: (key: string) => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(key) || null;
  },
  set: (key: string, value: string) => {
    if (typeof window === 'undefined') return;
    Cookies.set(key, value, { secure: true, sameSite: 'strict' });
  },
  clear: (key: string) => {
    if (typeof window === 'undefined') return;
    Cookies.remove(key);
  }
};
```

```tsx
// pages/_app.tsx
import { AppProps } from 'next/app';
import { AuthProvider } from '@your-org/auth-package';
import { cookieStorage } from '../lib/auth-storage';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      storageStrategy={cookieStorage}
      baseUrl={process.env.NEXT_PUBLIC_API_URL}
    >
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
```

### 2. Protected route example

```tsx
// components/ProtectedRoute.tsx
import { useAuth } from '@your-org/auth-package';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
};
```

## Advanced Usage

### 1. Using the API client directly

```tsx
// services/api.ts
import { ApiClient, TokenManager, RefreshQueue } from '@your-org/auth-package';

const tokenManager = new TokenManager();
const refreshQueue = new RefreshQueue();

export const apiClient = new ApiClient(
  process.env.REACT_APP_API_URL || 'https://api.example.com',
  '/auth/refresh',
  tokenManager,
  refreshQueue,
  10000, // timeout
  (error) => {
    console.error('API Auth Error:', error);
    // Handle global auth errors
  }
);

// Example API functions
export const fetchUserProfile = async () => {
  const response = await apiClient.get('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data: any) => {
  const response = await apiClient.put('/user/profile', data);
  return response.data;
};
```

### 2. Custom error handling

```tsx
// hooks/useAuthErrorHandler.ts
import { useAuth } from '@your-org/auth-package';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useAuthErrorHandler = () => {
  const { error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      // Log error for debugging
      console.error('Auth error:', error);
      
      // Show user-friendly message
      if (error.message.includes('Authentication failed')) {
        router.push('/login?error=session_expired');
      }
    }
  }, [error, router]);
};
```

### 3. TypeScript usage with custom User type

```tsx
// types/auth.ts
import { User as BaseUser } from '@your-org/auth-package';

export interface CustomUser extends BaseUser {
  firstName: string;
  lastName: string;
  role: 'admin' | 'user' | 'moderator';
  permissions: string[];
}

// In your component
const { user } = useAuth();
const typedUser = user as CustomUser;
```

## Backend Integration

### Expected API Response Format

Your backend should return responses in this format:

```json
// POST /api/auth/login response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "expiresIn": 3600
}
```

```json
// POST /api/auth/refresh response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // optional
}
```

### Example Express.js Backend

```javascript
// routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate credentials (implement your logic)
    const user = await validateUser(email, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate tokens
    const accessToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      expiresIn: 900 // 15 minutes
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );
    
    res.json({
      accessToken,
      // Optionally return new refresh token
      // refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

module.exports = router;
```
