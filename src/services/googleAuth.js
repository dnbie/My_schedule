import { GOOGLE_CONFIG, DRIVE_FILE_NAME, DRIVE_PROFILE_NAME } from '../config/google';

// ============================================================
// Google Identity Services (GIS) - Modern Auth (2024+)
// ============================================================

let tokenClient = null;
let accessToken = null;
let currentUserProfile = null;
// eslint-disable-next-line no-unused-vars
let gapiLoaded = false;
let gisLoaded = false;
let initPromise = null; // Cache the init promise so we can await it

// ---- Script loaders ----

const loadScript = (src, id) => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
};

const loadGapiClient = () => {
    return new Promise((resolve, reject) => {
        window.gapi.load('client', async () => {
            try {
                await window.gapi.client.init({
                    discoveryDocs: GOOGLE_CONFIG.discoveryDocs,
                });
                gapiLoaded = true;
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    });
};

// ---- Initialize ----

const doInit = async () => {
    // Load both scripts in parallel
    await Promise.all([
        loadScript('https://apis.google.com/js/api.js', 'gapi-script'),
        loadScript('https://accounts.google.com/gsi/client', 'gis-script'),
    ]);

    // Init gapi client (for Drive API calls)
    await loadGapiClient();

    // Check for existing session
    const savedToken = sessionStorage.getItem('gapi_access_token');
    const savedProfile = sessionStorage.getItem('gapi_user_profile');
    if (savedToken && savedProfile) {
        accessToken = savedToken;
        window.gapi.client.setToken({ access_token: accessToken });
        currentUserProfile = JSON.parse(savedProfile);
    }

    gisLoaded = true;
};

export const initGoogleAPI = async () => {
    if (!initPromise) {
        initPromise = doInit();
    }
    return initPromise;
};

// Ensure GIS is ready (called before sign-in)
const ensureGISLoaded = async () => {
    if (!gisLoaded) {
        await initGoogleAPI();
    }
    if (!window.google || !window.google.accounts) {
        throw new Error('Google Identity Services failed to load. Check your internet connection or try disabling ad-blockers.');
    }
};

// ---- Token client (for Drive API access) ----

const getTokenClient = () => {
    if (tokenClient) return tokenClient;

    tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CONFIG.clientId,
        scope: GOOGLE_CONFIG.scopes,
        callback: () => {}, // Will be overridden per-call
    });

    return tokenClient;
};

// ---- Sign In ----

export const signInWithGoogle = async () => {
    await ensureGISLoaded();
    return new Promise((resolve, reject) => {
        const client = getTokenClient();
        
        client.callback = async (tokenResponse) => {
            if (tokenResponse.error) {
                reject(new Error(tokenResponse.error));
                return;
            }

            accessToken = tokenResponse.access_token;
            window.gapi.client.setToken({ access_token: accessToken });
            sessionStorage.setItem('gapi_access_token', accessToken);

            // Fetch user profile using the access token
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                const profile = await res.json();
                currentUserProfile = {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    avatar: profile.picture,
                    firstName: profile.given_name,
                };
                sessionStorage.setItem('gapi_user_profile', JSON.stringify(currentUserProfile));
                resolve(currentUserProfile);
            } catch (err) {
                reject(err);
            }
        };

        client.error_callback = (err) => {
            reject(new Error(err.type || 'Login cancelled'));
        };

        // Request token - shows Google popup
        client.requestAccessToken({ prompt: 'consent' });
    });
};

// ---- Sign Out ----

export const signOutGoogle = () => {
    if (accessToken) {
        window.google.accounts.oauth2.revoke(accessToken, () => {
            console.log('Token revoked');
        });
    }
    accessToken = null;
    currentUserProfile = null;
    window.gapi.client.setToken(null);
    sessionStorage.removeItem('gapi_access_token');
    sessionStorage.removeItem('gapi_user_profile');
};

// ---- Status helpers ----

export const isSignedIn = () => {
    return !!accessToken && !!currentUserProfile;
};

export const getCurrentUser = () => {
    return currentUserProfile;
};

// ---- Google Drive helpers ----

const getAccessToken = () => {
    return accessToken;
};

const findFile = async (fileName) => {
    try {
        const response = await window.gapi.client.drive.files.list({
            spaces: 'appDataFolder',
            fields: 'files(id, name)',
            q: `name='${fileName}'`,
        });
        const files = response.result.files;
        return files && files.length > 0 ? files[0] : null;
    } catch (error) {
        console.error('Error finding file:', error);
        return null;
    }
};

export const saveToDrive = async (data, fileName = DRIVE_FILE_NAME) => {
    try {
        const token = getAccessToken();
        if (!token) throw new Error('Not authenticated');

        const existingFile = await findFile(fileName);
        const fileContent = JSON.stringify(data, null, 2);
        const blob = new Blob([fileContent], { type: 'application/json' });

        const metadata = {
            name: fileName,
            mimeType: 'application/json',
        };

        if (existingFile) {
            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            await fetch(`https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
        } else {
            metadata.parents = ['appDataFolder'];

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', blob);

            await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: form,
            });
        }

        return true;
    } catch (error) {
        console.error('Error saving to Drive:', error);
        return false;
    }
};

export const loadFromDrive = async (fileName = DRIVE_FILE_NAME) => {
    try {
        const token = getAccessToken();
        if (!token) return null;

        const file = await findFile(fileName);
        if (!file) return null;

        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error loading from Drive:', error);
        return null;
    }
};

// ---- Public API for schedule/profile ----

export const saveScheduleData = async (data) => {
    return saveToDrive(data, DRIVE_FILE_NAME);
};

export const loadScheduleData = async () => {
    return loadFromDrive(DRIVE_FILE_NAME);
};

export const saveProfileData = async (profile) => {
    return saveToDrive(profile, DRIVE_PROFILE_NAME);
};

export const loadProfileData = async () => {
    return loadFromDrive(DRIVE_PROFILE_NAME);
};
