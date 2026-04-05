import { DEFAULT_ACTIVITIES, generateId } from '../data/constants';

const STORAGE_KEY = 'scheduleTrackerData';
const PROFILE_KEY = 'scheduleTrackerProfile';

export const getDefaultData = () => ({
    activities: [],
    tracking: {},
    notes: {},
    goals: {}
});

export const getDefaultProfile = () => ({
    name: '',
    avatar: '👤',
    email: '',
    theme: 'dark',
    startOfWeek: 0, // 0 = Sunday, 1 = Monday
    showStreak: true,
    showHeatmap: true,
    notifications: false,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
});

export const loadData = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
};

export const saveData = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const loadProfile = () => {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
        return JSON.parse(saved);
    }
    return getDefaultProfile();
};

export const saveProfile = (profile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify({
        ...profile,
        lastLogin: new Date().toISOString()
    }));
};

export const clearData = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const clearProfile = () => {
    localStorage.removeItem(PROFILE_KEY);
};

export const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PROFILE_KEY);
};

export const initializeWithDefaults = () => {
    const data = getDefaultData();
    DEFAULT_ACTIVITIES.forEach(activity => {
        data.activities.push({
            id: generateId(),
            name: activity.name,
            goal: activity.goal,
            plan: activity.plan,
            color: activity.color,
            createdAt: new Date().toISOString()
        });
    });
    saveData(data);
    return data;
};

export const getTrackingKey = (activityId, year, month, day) => {
    return `${activityId}_${year}_${month}_${day}`;
};
