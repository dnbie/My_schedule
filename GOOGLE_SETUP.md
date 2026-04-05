# Google Authentication Setup Guide

## Overview
This app uses **Google Identity Services (GIS)** for authentication and **Google Drive** for cloud storage. Your data is stored in Google Drive's `appDataFolder` — a hidden folder that only you and this app can access.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it something like "My Schedule Tracker"
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google Drive API"
3. Click on it and press "Enable"

## Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (unless you have a Google Workspace account)
3. Fill in the required fields:
   - App name: "My Schedule Tracker"
   - User support email: Your email
   - Developer contact email: Your email
4. Click "Save and Continue"
5. On "Scopes" page, click "Add or Remove Scopes"
6. Add these scopes:
   - `https://www.googleapis.com/auth/drive.appdata`
   - `https://www.googleapis.com/auth/userinfo.profile`
   - `https://www.googleapis.com/auth/userinfo.email`
7. Click "Save and Continue"
8. **Add test users** (your email and any other emails you want to test with)
9. Click "Save and Continue"

## Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select **"Web application"**
4. Name: "Schedule Tracker Web Client"
5. Add **Authorized JavaScript origins**:
   - `http://localhost:4500` (dev server)
   - `https://my-schedule-pied-tau.vercel.app` (production)
6. **Leave Authorized redirect URIs empty** (GIS uses popup, not redirect)
7. Click "Create"
8. **Copy the Client ID** (looks like `123456789-abcdef.apps.googleusercontent.com`)

## Step 5: Update the App Configuration

Open `src/config/google.js` and replace the placeholder:

```javascript
export const GOOGLE_CONFIG = {
    clientId: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',  // ← Paste here
    scopes: '...',
    discoveryDocs: ['...'],
};
```

> **No API Key needed!** GIS uses only the Client ID.

## Step 6: Test Locally

1. Run `npm start`
2. You should see the login page
3. Click "Sign in with Google"
4. A Google popup opens → select your account → authorize
5. Your data will now sync to Google Drive!

## Deployment

When deploying (e.g., to Netlify, Vercel, GitHub Pages):

Your app is live at: `https://my-schedule-pied-tau.vercel.app`

1. Make sure `https://my-schedule-pied-tau.vercel.app` is in the OAuth client's **Authorized JavaScript origins**
2. That's it — no other configuration needed

## How It Works

- **Sign-in**: Uses `google.accounts.oauth2.initTokenClient()` to get an access token via a popup
- **Drive Storage**: Saves/loads JSON files in Google Drive's `appDataFolder` (hidden from user)
- **Session**: Access token is kept in `sessionStorage` for the current browser tab
- **Privacy**: Only you can access your data. The app never shares or stores your info anywhere else

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure `http://localhost:4500` is in Authorized JavaScript origins (no trailing slash!)

### "Error 403: access_denied"
- Make sure you've added your email as a **test user** in the OAuth consent screen
- The app is in "Testing" mode by default — only test users can sign in

### Popup blocked
- Allow popups from localhost in your browser settings
- Or try a different browser

### Data not syncing
- Check the browser console (F12) for errors
- Make sure Google Drive API is enabled in your project
- Verify your Client ID is correct
