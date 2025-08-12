# GitHub Actions Setup Guide

## Required Secrets

To enable automatic publishing, you need to set up these secrets in your GitHub repository:

### 1. NPM_TOKEN (Required for publishing)

1. Go to [npmjs.com](https://www.npmjs.com) and log in
2. Click on your profile → "Access Tokens"
3. Click "Generate New Token" → "Granular Access Token"
4. Configure the token:
   - **Name**: `github-actions-just-auth`
   - **Expiration**: 1 year (or your preference)
   - **Permissions**: `Read and write` for packages
5. Copy the generated token

6. In your GitHub repository:
   - Go to **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Name: `NPM_TOKEN`
   - Value: Paste the npm token
   - Click **Add secret**

### 2. GITHUB_TOKEN (Automatically provided)
This is automatically provided by GitHub Actions for creating releases.

## How the Workflow Works

### 🧪 **On Pull Requests**
- Runs tests on Node.js 18.x and 20.x
- Checks TypeScript types
- Builds the package
- Validates package structure
- Shows package size

### 🚀 **On Push to Main Branch**
1. **Test Phase**:
   - Runs all tests (same as PR)
   - Only continues if tests pass

2. **Version Bump Logic**:
   - **Major**: Commit message contains `BREAKING CHANGE` or `major:`
   - **Minor**: Commit message contains `feat:` or `feature:`
   - **Patch**: All other commits (default)

3. **Publish Phase**:
   - Bumps version in package.json
   - Builds the package
   - Publishes to npm
   - Commits version change back to repo
   - Creates GitHub release with changelog

## Commit Message Examples

### Patch Version (1.0.0 → 1.0.1)
```bash
git commit -m "fix: resolve token refresh issue"
git commit -m "docs: update README examples"
git commit -m "chore: update dependencies"
```

### Minor Version (1.0.0 → 1.1.0)
```bash
git commit -m "feat: add custom storage strategy support"
git commit -m "feature: implement remember me functionality"
```

### Major Version (1.0.0 → 2.0.0)
```bash
git commit -m "feat: redesign auth API

BREAKING CHANGE: AuthProvider props have changed"

# OR

git commit -m "major: complete API rewrite"
```

## Testing the Workflow

### 1. Test without publishing (Pull Request)
```bash
git checkout -b test-workflow
git add .
git commit -m "test: verify GitHub Actions setup"
git push origin test-workflow
# Create PR on GitHub to see tests run
```

### 2. Test with publishing (Push to main)
```bash
git checkout main
git add .
git commit -m "feat: add GitHub Actions workflow"
git push origin main
# This will trigger the full workflow including npm publish
```

## Workflow Files

- **`.github/workflows/publish.yml`** - Main workflow for testing and publishing
- **`.github/workflows/test.yml`** - Pull request testing only

## Manual Override

If you need to publish manually or skip the workflow:
```bash
# Add [skip ci] to commit message
git commit -m "docs: update README [skip ci]"

# Or publish manually
npm version patch
npm publish --access public
```

## Monitoring

After setting up:
1. Go to **Actions** tab in your GitHub repository
2. You'll see workflow runs for each push/PR
3. Click on any run to see detailed logs
4. Check npm to verify successful publications

## Troubleshooting

### Common Issues:
1. **NPM_TOKEN invalid**: Regenerate token with correct permissions
2. **Version conflicts**: Workflow automatically handles version bumping
3. **Build failures**: Check the Actions tab for detailed error logs
4. **Permission issues**: Ensure repository has Actions enabled
5. **Node.js version conflicts**: Workflow now uses Node.js 20.x and 22.x
6. **Package-lock.json conflicts**: Workflow regenerates dependencies automatically

### Dependency Issues Fix
If you encounter `npm ci` errors related to package-lock.json, the workflow now:
- Removes the existing package-lock.json
- Runs `npm install` to create a fresh lock file
- Uses Node.js 20.x+ to avoid engine compatibility issues

Your package will now be automatically tested and published! 🚀
