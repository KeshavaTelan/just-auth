import React from 'react';
import { AuthProvider, useAuth } from '../src/index';

// Example login component
const LoginComponent: React.FC = () => {
  const { login, logout, user, isAuthenticated, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ 
        email: 'user@example.com', 
        password: 'password123' 
      });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error.message}
        </div>
      )}
      
      {isAuthenticated ? (
        <div>
          <h2>Welcome!</h2>
          <p>User ID: {user?.id}</p>
          <p>Email: {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <h2>Please log in</h2>
          <button onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      )}
    </div>
  );
};

// Example app with AuthProvider
const ExampleApp: React.FC = () => {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
      baseUrl="https://api.example.com"
      onAuthError={(error) => {
        console.error('Authentication error:', error);
        // You could redirect to login page here
        // window.location.href = '/login';
      }}
    >
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Authentication Package Demo</h1>
        <LoginComponent />
      </div>
    </AuthProvider>
  );
};

export default ExampleApp;
