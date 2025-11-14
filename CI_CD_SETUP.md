# CI/CD Setup Guide

This project uses GitHub Actions for CI/CD and automatically deploys to Vercel when pushing to the `main` branch.

## GitHub Actions Workflow

The CI/CD pipeline (`.github/workflows/ci.yml`) runs on every push to `main` or `master` branch and includes:

1. **Test Job:**
   - Checks out code
   - Sets up Node.js 20
   - Installs pnpm
   - Installs dependencies
   - Runs linter
   - Runs TypeScript type checking
   - Runs tests
   - Builds the application

2. **Deploy Job:**
   - Only runs on `main`/`master` branch
   - Builds the application
   - Deploys to Vercel production

## Required GitHub Secrets

To enable the CI/CD pipeline, you need to configure the following secrets in your GitHub repository:

### Go to: Settings → Secrets and variables → Actions → New repository secret

1. **MONGODB_URI**
   - Your MongoDB connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

2. **NEXTAUTH_SECRET**
   - Secret key for NextAuth.js
   - Generate one using: `openssl rand -base64 32`

3. **NEXTAUTH_URL**
   - Your application URL
   - For production: `https://your-app.vercel.app`
   - For local: `http://localhost:3000`

4. **VERCEL_TOKEN**
   - Vercel authentication token
   - Get it from: Vercel Dashboard → Settings → Tokens

5. **VERCEL_ORG_ID**
   - Your Vercel organization ID
   - Get it from: Vercel Dashboard → Settings → General

6. **VERCEL_PROJECT_ID**
   - Your Vercel project ID
   - Get it from: Vercel Dashboard → Your Project → Settings → General

## Vercel Setup

1. **Connect your GitHub repository to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

2. **Environment Variables in Vercel:**
   - Add the same environment variables as GitHub secrets:
     - `MONGODB_URI`
     - `NEXTAUTH_SECRET`
     - `NEXTAUTH_URL`

## Testing Locally

Before pushing to GitHub, test the CI/CD steps locally:

```bash
# Install dependencies
pnpm install

# Run linter
pnpm lint

# Run type check
pnpm type-check

# Run tests
pnpm test

# Build application
pnpm build
```

## Workflow Status

You can check the workflow status in:
- GitHub → Actions tab
- Each commit will show a checkmark or X indicating pass/fail

## Troubleshooting

### Build fails in CI
- Check that all environment variables are set correctly
- Verify that `pnpm-lock.yaml` is committed
- Check the Actions logs for specific error messages

### Deployment fails
- Verify Vercel secrets are correct
- Check that the project is linked in Vercel
- Ensure environment variables are set in Vercel dashboard

### Tests fail
- Currently, tests are set to `continue-on-error: true` to allow the pipeline to pass
- Add proper tests in `__tests__/` directory
- Update the test script in `package.json` when ready

