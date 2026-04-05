import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    initGoogleAPI, 
    signInWithGoogle, 
    signOutGoogle, 
    isSignedIn, 
    getCurrentUser 
} from '../services/googleAuth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check if user previously logged in as guest
                const guestMode = localStorage.getItem('guestMode');
                if (guestMode === 'true') {
                    setIsGuest(true);
                    setLoading(false);
                    setIsInitialized(true);
                    return;
                }
                
                await initGoogleAPI();
                setIsInitialized(true);
                
                if (isSignedIn()) {
                    const currentUser = getCurrentUser();
                    setUser(currentUser);
                }
            } catch (err) {
                console.error('Failed to initialize Google API:', err);
                setError('Failed to connect to Google. You can continue as guest.');
                setIsInitialized(true);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await signInWithGoogle();
            setUser(userData);
            return userData;
        } catch (err) {
            console.error('Login failed:', err);
            const msg = err?.message || err?.error || 'Unknown error';
            setError(`Login failed: ${msg}`);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            if (isGuest) {
                localStorage.removeItem('guestMode');
                setIsGuest(false);
            } else {
                await signOutGoogle();
            }
            setUser(null);
        } catch (err) {
            console.error('Logout failed:', err);
            setError('Logout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loginAsGuest = () => {
        localStorage.setItem('guestMode', 'true');
        setIsGuest(true);
        setError(null);
    };

    const value = {
        user,
        loading,
        error,
        isInitialized,
        isAuthenticated: !!user || isGuest,
        isGuest,
        login,
        logout,
        loginAsGuest,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
