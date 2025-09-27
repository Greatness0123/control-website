# Control AI Platform Configuration Guide

This document provides instructions on how to configure the Control AI platform for deployment and operation. It covers essential configuration variables, file locations, and deployment steps.

## Table of Contents
1. [Environment Variables](#environment-variables)
2. [Firebase Configuration](#firebase-configuration)
3. [OpenRouter API Keys](#openrouter-api-keys)
4. [Executable Files](#executable-files)
5. [Domain Configuration](#domain-configuration)
6. [Deployment Instructions](#deployment-instructions)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# OpenRouter API Keys
OPENROUTER_KEY_1=your_primary_openrouter_key
OPENROUTER_KEY_2=your_backup_openrouter_key

# Redis Configuration (for rate limiting and caching)
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token

# Domain Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## Firebase Configuration

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password, Google, and GitHub providers
3. Set up Firestore database
4. Generate a service account key and save it as `control-ai-desktop-firebase-adminsdk.json` in the root directory
5. Update the Firebase configuration in `.env.local` with your project details

### Authentication Configuration

For Google and GitHub authentication:

1. **Google Authentication**:
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable Google provider
   - Configure OAuth consent screen in Google Cloud Console
   - Add authorized domains

2. **GitHub Authentication**:
   - Go to GitHub Developer Settings > OAuth Apps > New OAuth App
   - Set Homepage URL to your domain
   - Set Authorization callback URL to: `https://your-project.firebaseapp.com/__/auth/handler`
   - Copy Client ID and Client Secret to Firebase Console > Authentication > Sign-in method > GitHub

## OpenRouter API Keys

1. Create an account at [OpenRouter](https://openrouter.ai/)
2. Generate API keys
3. Add these keys to your environment variables as `OPENROUTER_KEY_1`, `OPENROUTER_KEY_2`, etc.
4. Configure the keys in the admin dashboard after deployment

## Executable Files

Place executable files for desktop applications in the following directory:
```
/public/downloads/
```

Required files:
- `control-ai-2.0.1-win-x64.exe` - Windows executable
- `control-ai-2.0.1-macos.dmg` - macOS disk image
- `control-ai-2.0.1-linux-x64.AppImage` - Linux AppImage

Also include signature files with the `.sig` extension for each executable.

## Domain Configuration

1. Purchase a domain name from a domain registrar
2. Configure DNS settings to point to your hosting provider
3. Update the `NEXT_PUBLIC_SITE_URL` environment variable with your domain
4. If using Vercel, add your domain in the Vercel dashboard under Domains

## Deployment Instructions

### Deploying to Vercel

1. Fork the repository to your GitHub account
2. Create a new project in Vercel and link it to your repository
3. Configure environment variables in the Vercel dashboard
4. Deploy the project

### Manual Deployment

1. Build the project:
   ```
   npm run build
   ```

2. Start the production server:
   ```
   npm start
   ```

### Database Initialization

After deployment, initialize the database with default settings:

1. Run the seed script:
   ```
   npm run seed
   ```

2. This will create:
   - Default tier settings
   - Admin user
   - Initial system configuration

## Post-Deployment Configuration

After deployment, log in as an admin user to:

1. Configure OpenRouter API keys
2. Set up tier settings
3. Monitor system health
4. Manage user accounts

## Troubleshooting

If you encounter issues:

1. Check Firebase authentication settings
2. Verify environment variables are correctly set
3. Ensure OpenRouter API keys are valid
4. Check Firestore rules and indexes

For additional support, contact the development team.