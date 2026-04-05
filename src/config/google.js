// Google API Configuration
// Setup: https://console.cloud.google.com/
// 1. Create a new project
// 2. Enable Google Drive API
// 3. Configure OAuth Consent Screen (External, add your email as test user)
// 4. Create OAuth 2.0 credentials → Web application
// 5. Add Authorized JavaScript origins:
//    - http://localhost:4500 (dev)
//    - https://my-schedule-pied-tau.vercel.app (prod)
// 6. Copy the Client ID below

export const GOOGLE_CONFIG = {
    clientId: '734804398402-chlln9gjm4a7qvanka8990invt6rugo4.apps.googleusercontent.com',
    scopes: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
};

// File names stored in Google Drive's appDataFolder
export const DRIVE_FILE_NAME = 'schedule_tracker_data.json';
export const DRIVE_PROFILE_NAME = 'schedule_tracker_profile.json';
