# GitHub Secrets Setup Guide

## Required Secrets

For the automated publishing workflow to work, you need to set up the following secrets in your GitHub repository:

### 1. NPM_TOKEN

This is required to publish packages to npm.

#### Steps to create NPM_TOKEN:

1. Go to [npmjs.com](https://www.npmjs.com/) and sign in
2. Click on your profile picture → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" (this allows publishing)
5. Copy the generated token

#### Steps to add NPM_TOKEN to GitHub:

1. Go to your repository on GitHub: https://github.com/KeshavaTelan/just-auth
2. Click "Settings" tab
3. Click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Name: `NPM_TOKEN`
6. Value: Paste your npm token
7. Click "Add secret"

### 2. Repository Permissions

The workflow also needs write permissions to the repository. This should be automatically configured with the permissions we've set in the workflow file:

```yaml
permissions:
  contents: write
  pull-requests: read
```

## Verification

After setting up the NPM_TOKEN:

1. Make a small change to the repository
2. Commit and push to the main branch
3. Check the "Actions" tab on GitHub to see if the workflow runs successfully

## Troubleshooting

If you're still getting permission errors:

1. **Check Repository Settings**:
   - Go to Settings → Actions → General
   - Ensure "Read and write permissions" is selected under "Workflow permissions"

2. **Check Branch Protection**:
   - Go to Settings → Branches
   - If main branch has protection rules, ensure "Restrict pushes that create files" is not enabled
   - Or add the GitHub Actions bot as an exception

3. **Manual Publishing** (if automated fails):
   ```bash
   npm login
   npm publish --access public
   ```

## Current Status

- ✅ Workflow file updated with proper permissions
- ⏳ NPM_TOKEN needs to be set up in GitHub secrets
- ⏳ Repository permissions may need to be adjusted
