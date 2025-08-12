# Publishing Instructions

## Automated Publishing with GitHub Actions

🤖 **The easiest way**: Push to the main branch and let GitHub Actions handle everything!

### Setup (One-time only)
1. Follow the setup guide in `GITHUB_ACTIONS_SETUP.md`
2. Add your `NPM_TOKEN` to GitHub repository secrets
3. Push to main branch - that's it!

### Version Bumping with Commit Messages
- **Patch** (1.0.0 → 1.0.1): `git commit -m "fix: resolve token issue"`
- **Minor** (1.0.0 → 1.1.0): `git commit -m "feat: add new feature"`
- **Major** (1.0.0 → 2.0.0): `git commit -m "feat: breaking change\n\nBREAKING CHANGE: API changed"`

## Manual Publishing (Alternative)

If you prefer manual control:

### Pre-Publishing Checklist

1. **Package information is ready:**
   - Package name is set to `just-auth`
   - Author is set to `KeshavaSilva`
   - Repository URLs are configured
   - Version will be managed manually

2. **Test the package:**
   ```powershell
   npm run build
   npm run type-check
   ```

3. **Test in a local project** (see TESTING.md for detailed instructions):
   ```powershell
   npm pack
   # This creates a .tgz file you can install in another project for testing
   # See TESTING.md for complete testing guide
   ```

## Publishing to NPM

1. **Login to NPM:**
   ```powershell
   npm login
   ```

2. **Publish with public access:**
   ```powershell
   npm publish --access public
   ```

## Package Structure

```
/src
  index.ts                 # Main entry point - exports all public APIs
  auth-context.tsx         # AuthProvider component and useAuth hook
  hooks/useAuth.ts         # Re-export of useAuth hook (alternative import path)
  client/apiClient.ts      # Axios-based HTTP client with interceptors
  utils/tokenManager.ts    # Token storage and management utilities
  utils/refreshQueue.ts    # Queue for handling concurrent token refresh requests
  types.ts                 # TypeScript type definitions

/dist                      # Built package output (created by tsup)
  index.js                 # CommonJS build
  index.mjs                # ESM build  
  index.d.ts               # TypeScript declarations
  index.d.mts              # TypeScript declarations for ESM
  *.map                    # Source maps
```

## Key Features Implemented

 **AuthProvider Component** - React context provider for authentication
 **useAuth Hook** - React hook for accessing auth state and methods
 **Token Management** - Secure token storage with configurable strategies
 **Automatic Token Refresh** - Handles 401 responses and refreshes tokens
 **Request Queuing** - Prevents multiple concurrent refresh requests
 **API Client** - Axios-based client with automatic auth headers
 **TypeScript Support** - Full type definitions and type safety
 **ESM + CJS Support** - Works with both module systems
 **SSR Ready** - Configurable storage strategies for server-side rendering

## Usage in Consumer Projects

After publishing, other projects can install and use your package:

```bash
npm install just-auth
```

```tsx
import { AuthProvider, useAuth } from 'just-auth';

function App() {
  return (
    <AuthProvider
      loginUrl="/api/auth/login"
      refreshUrl="/api/auth/refresh"
    >
      <MyApp />
    </AuthProvider>
  );
}
```

## Customization Options

- **Storage Strategy**: Default localStorage, can be customized for cookies/SSR
- **Error Handling**: Optional `onAuthError` callback for global error handling
- **API Configuration**: Configurable base URL, timeout, and request interceptors
- **User Type**: Extensible User interface for custom user properties

## Security Considerations

- Tokens are stored using the configured storage strategy (localStorage by default)
- Automatic token refresh prevents expired token issues
- Request queuing prevents race conditions during token refresh
- Configurable storage allows for secure cookie-based storage in SSR environments

## Next Steps

1. Update the package name and metadata
2. Test thoroughly in a real project
3. Consider adding unit tests (not included in this initial version)
4. Add CI/CD pipeline for automated publishing
5. Create comprehensive documentation website
