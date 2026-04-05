import React, { useState, useEffect, useCallback, useRef } from 'react';
import YearOverview from './components/YearOverview';
import ScheduleTable from './components/ScheduleTable';
import ActivityModal from './components/ActivityModal';
import ActivityDetailModal from './components/ActivityDetailModal';
import GroundActivityPlan from './components/GroundActivityPlan';
import YearlyHeatmap from './components/YearlyHeatmap';
import LoginPage from './components/LoginPage';
import StudyPlan from './components/StudyPlan';
import { useAuth } from './context/AuthContext';
import { getDaysInMonth, generateId } from './data/constants';
import { 
    loadData, 
    saveData, 
    initializeWithDefaults, 
    getTrackingKey,
    loadProfile,
    saveProfile,
    getDefaultProfile
} from './utils/storage';
import {
    saveScheduleData,
    loadScheduleData,
    saveProfileData,
    loadProfileData
} from './services/googleAuth';

// Avatar options
const AVATAR_OPTIONS = ['👤', '😊', '😎', '🤓', '🧑‍💻', '👨‍💼', '👩‍💼', '🦸', '🧙', '🎯', '⭐', '🌟', '🔥', '💪', '🏆', '🎨', '📚', '💻', '🎮', '🎸'];

function App() {
    const { user, isAuthenticated, isGuest, loading: authLoading, logout } = useAuth();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [scheduleData, setScheduleData] = useState({ activities: [], tracking: {}, notes: {}, goals: {} });
    const [activityModalOpen, setActivityModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [groundPlanOpen, setGroundPlanOpen] = useState(false);
    const [groundPlanTab, setGroundPlanTab] = useState('training');
    const [studyPlanOpen, setStudyPlanOpen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [noteModal, setNoteModal] = useState({ open: false, day: null, month: null, year: null });
    const [profile, setProfile] = useState(getDefaultProfile());
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('synced'); // 'synced', 'syncing', 'error'
    const [miniCountdown, setMiniCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const saveTimeoutRef = useRef(null);

    // Funny messages for mini countdown
    const funnyMessages = [
        "⏰ Tick tock! Only",
        "🏃 Time's running! Just",
        "😱 OMG only",
        "🚀 Blast off in",
        "🎉 Party countdown:",
        "⚡ Zooming by!",
        "🔥 Burning through time:",
        "💀 RIP this year in",
        "🎯 Finish line in",
        "🍕 Pizza time... err I mean"
    ];
    const [funnyIndex] = useState(Math.floor(Math.random() * funnyMessages.length));

    // Mini countdown timer
    useEffect(() => {
        const calculateCountdown = () => {
            const now = new Date();
            const nextYear = new Date(currentYear + 1, 0, 1, 0, 0, 0);
            const diff = nextYear - now;

            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setMiniCountdown({ days, hours, minutes, seconds });
            }
        };

        calculateCountdown();
        const timer = setInterval(calculateCountdown, 1000);
        return () => clearInterval(timer);
    }, [currentYear]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Don't trigger shortcuts when typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    setSelectedMonth(prev => prev > 0 ? prev - 1 : 11);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    setSelectedMonth(prev => prev < 11 ? prev + 1 : 0);
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    setSelectedMonth(new Date().getMonth());
                    break;
                case 'n':
                case 'N':
                    e.preventDefault();
                    setSelectedActivity(null);
                    setActivityModalOpen(true);
                    break;
                case '?':
                    e.preventDefault();
                    setShowShortcuts(prev => !prev);
                    break;
                case 'Escape':
                    setShowShortcuts(false);
                    setActivityModalOpen(false);
                    setDetailModalOpen(false);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Load data from Google Drive when authenticated
    useEffect(() => {
        const loadFromCloud = async () => {
            if (!isAuthenticated) {
                setDataLoading(false);
                return;
            }
            
            // Guest mode - load from local storage only
            if (isGuest) {
                let localData = loadData();
                if (!localData || localData.activities.length === 0) {
                    localData = initializeWithDefaults();
                }
                setScheduleData(localData);
                setProfile(loadProfile());
                setDataLoading(false);
                return;
            }
            
            setDataLoading(true);
            try {
                // Try to load from Google Drive first
                let cloudData = await loadScheduleData();
                let cloudProfile = await loadProfileData();
                
                if (cloudData && cloudData.activities && cloudData.activities.length > 0) {
                    setScheduleData(cloudData);
                } else {
                    // Fall back to local storage or defaults
                    let localData = loadData();
                    if (!localData || localData.activities.length === 0) {
                        localData = initializeWithDefaults();
                    }
                    setScheduleData(localData);
                    // Save to cloud
                    await saveScheduleData(localData);
                }
                
                if (cloudProfile) {
                    setProfile(prev => ({ ...prev, ...cloudProfile }));
                } else {
                    const localProfile = loadProfile();
                    setProfile(prev => ({
                        ...prev,
                        ...localProfile,
                        name: user?.name || localProfile.name,
                        email: user?.email || localProfile.email,
                        avatar: localProfile.avatar || '👤'
                    }));
                }
            } catch (error) {
                console.error('Error loading from cloud:', error);
                // Fall back to local
                let data = loadData();
                if (!data || data.activities.length === 0) {
                    data = initializeWithDefaults();
                }
                setScheduleData(data);
                setProfile(loadProfile());
            } finally {
                setDataLoading(false);
            }
        };

        loadFromCloud();
    }, [isAuthenticated, isGuest, user]);

    // Auto-save to Google Drive with debounce
    const saveToCloud = useCallback(async (data) => {
        if (!isAuthenticated || isGuest) return;
        
        setSyncStatus('syncing');
        try {
            await saveScheduleData(data);
            saveData(data); // Also save locally as backup
            setSyncStatus('synced');
        } catch (error) {
            console.error('Error saving to cloud:', error);
            setSyncStatus('error');
            saveData(data); // Save locally if cloud fails
        }
    }, [isAuthenticated, isGuest]);

    // Save data whenever it changes (debounced)
    useEffect(() => {
        if (scheduleData.activities.length > 0 && isAuthenticated && !dataLoading) {
            // For guests, just save locally
            if (isGuest) {
                saveData(scheduleData);
                return;
            }
            
            // Clear existing timeout
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            // Debounce save by 2 seconds
            saveTimeoutRef.current = setTimeout(() => {
                saveToCloud(scheduleData);
            }, 2000);
        }
        
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [scheduleData, isAuthenticated, isGuest, dataLoading, saveToCloud]);

    // Save profile whenever it changes
    useEffect(() => {
        if ((profile.name || profile.avatar !== '👤') && isAuthenticated && !dataLoading) {
            saveProfile(profile);
            saveProfileData(profile);
        }
    }, [profile, isAuthenticated, dataLoading]);

    const handleSaveProfile = (newProfile) => {
        setProfile(newProfile);
        saveProfile(newProfile);
        if (isAuthenticated) {
            saveProfileData(newProfile);
        }
        setProfileModalOpen(false);
    };

    const isDayCompleted = useCallback((activityId, year, month, day) => {
        const key = getTrackingKey(activityId, year, month, day);
        return scheduleData.tracking[key] || false;
    }, [scheduleData.tracking]);

    const toggleDay = (activityId, year, month, day) => {
        const key = getTrackingKey(activityId, year, month, day);
        setScheduleData(prev => ({
            ...prev,
            tracking: {
                ...prev.tracking,
                [key]: !prev.tracking[key]
            }
        }));
    };

    const getActivityProgress = useCallback((activityId, year, month) => {
        const daysInMonth = getDaysInMonth(month, year);
        let completed = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            if (isDayCompleted(activityId, year, month, day)) {
                completed++;
            }
        }
        
        return {
            completed,
            total: daysInMonth,
            percentage: Math.round((completed / daysInMonth) * 100)
        };
    }, [isDayCompleted]);

    const getMonthProgress = useCallback((year, month) => {
        if (scheduleData.activities.length === 0) {
            return { completed: 0, total: 0, percentage: 0 };
        }
        
        const daysInMonth = getDaysInMonth(month, year);
        let totalChecks = 0;
        let completedChecks = 0;
        
        scheduleData.activities.forEach(activity => {
            for (let day = 1; day <= daysInMonth; day++) {
                totalChecks++;
                if (isDayCompleted(activity.id, year, month, day)) {
                    completedChecks++;
                }
            }
        });
        
        return {
            completed: completedChecks,
            total: totalChecks,
            percentage: totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0
        };
    }, [scheduleData.activities, isDayCompleted]);

    const getDailyProgress = useCallback(() => {
        const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
        const dailyData = [];
        
        for (let day = 1; day <= daysInMonth; day++) {
            let completed = 0;
            scheduleData.activities.forEach(activity => {
                if (isDayCompleted(activity.id, currentYear, selectedMonth, day)) {
                    completed++;
                }
            });
            const total = scheduleData.activities.length;
            dailyData.push(total > 0 ? Math.round((completed / total) * 100) : 0);
        }
        
        return dailyData;
    }, [selectedMonth, currentYear, scheduleData.activities, isDayCompleted]);

    const getCompletedDays = useCallback(() => {
        const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
        let daysWithCompletion = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            let hasCompletion = false;
            scheduleData.activities.forEach(activity => {
                if (isDayCompleted(activity.id, currentYear, selectedMonth, day)) {
                    hasCompletion = true;
                }
            });
            if (hasCompletion) daysWithCompletion++;
        }
        
        return daysWithCompletion;
    }, [selectedMonth, currentYear, scheduleData.activities, isDayCompleted]);

    const getWeeklyBreakdown = useCallback((activityId) => {
        const today = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const breakdown = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            let status = 'pending';
            if (date.getMonth() === selectedMonth && date.getFullYear() === currentYear) {
                const completed = isDayCompleted(activityId, currentYear, selectedMonth, date.getDate());
                if (date <= today) {
                    status = completed ? 'completed' : 'missed';
                }
            }
            
            breakdown.push({
                name: dayNames[date.getDay()],
                status
            });
        }
        
        return breakdown;
    }, [selectedMonth, currentYear, isDayCompleted]);

    // Calculate current streak for an activity (consecutive days from today going backwards)
    const getStreak = useCallback((activityId) => {
        const today = new Date();
        let streak = 0;
        let checkDate = new Date(today);
        
        // Start from today and go backwards
        while (true) {
            const year = checkDate.getFullYear();
            const month = checkDate.getMonth();
            const day = checkDate.getDate();
            
            if (isDayCompleted(activityId, year, month, day)) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // If today is not completed, check if yesterday starts a streak
                if (streak === 0) {
                    checkDate.setDate(checkDate.getDate() - 1);
                    const prevYear = checkDate.getFullYear();
                    const prevMonth = checkDate.getMonth();
                    const prevDay = checkDate.getDate();
                    
                    if (isDayCompleted(activityId, prevYear, prevMonth, prevDay)) {
                        streak++;
                        checkDate.setDate(checkDate.getDate() - 1);
                        continue;
                    }
                }
                break;
            }
            
            // Safety limit - don't go back more than 365 days
            if (streak > 365) break;
        }
        
        return streak;
    }, [isDayCompleted]);

    const handleSaveActivity = (activityData) => {
        if (activityData.id) {
            // Update existing
            setScheduleData(prev => ({
                ...prev,
                activities: prev.activities.map(a => 
                    a.id === activityData.id 
                        ? { ...a, ...activityData }
                        : a
                )
            }));
        } else {
            // Add new
            const newActivity = {
                ...activityData,
                id: generateId(),
                createdAt: new Date().toISOString()
            };
            setScheduleData(prev => ({
                ...prev,
                activities: [...prev.activities, newActivity]
            }));
        }
        setSelectedActivity(null);
    };

    const handleDeleteActivity = (activityId) => {
        setScheduleData(prev => {
            const newTracking = { ...prev.tracking };
            Object.keys(newTracking).forEach(key => {
                if (key.startsWith(activityId)) {
                    delete newTracking[key];
                }
            });
            return {
                activities: prev.activities.filter(a => a.id !== activityId),
                tracking: newTracking
            };
        });
    };

    const handleReset = () => {
        if (window.confirm('This will delete all your current data and reset to the default schedule. Are you sure?')) {
            const data = initializeWithDefaults();
            setScheduleData(data);
        }
    };

    const handleImport = (importedTracking) => {
        setScheduleData(prev => ({
            ...prev,
            tracking: {
                ...prev.tracking,
                ...importedTracking
            }
        }));
    };

    const handleBackup = () => {
        const backupData = {
            ...scheduleData,
            backupDate: new Date().toISOString(),
            version: '1.0'
        };
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `schedule_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleRestore = (data) => {
        if (window.confirm('This will replace all your current data with the backup. Are you sure?')) {
            setScheduleData({
                activities: data.activities || [],
                tracking: data.tracking || {},
                notes: data.notes || {},
                goals: data.goals || {}
            });
        }
    };

    const handleReorder = (fromIndex, toIndex) => {
        setScheduleData(prev => {
            const newActivities = [...prev.activities];
            const [movedItem] = newActivities.splice(fromIndex, 1);
            newActivities.splice(toIndex, 0, movedItem);
            return {
                ...prev,
                activities: newActivities
            };
        });
    };

    // Notes handlers
    const getNoteKey = (year, month, day) => `note_${year}_${month}_${day}`;
    
    const getNote = (year, month, day) => {
        const key = getNoteKey(year, month, day);
        return scheduleData.notes?.[key] || '';
    };

    const handleOpenNoteModal = (year, month, day) => {
        setNoteModal({ open: true, day, month, year });
    };

    const handleSaveNote = (note) => {
        const key = getNoteKey(noteModal.year, noteModal.month, noteModal.day);
        setScheduleData(prev => ({
            ...prev,
            notes: {
                ...prev.notes,
                [key]: note
            }
        }));
        setNoteModal({ open: false, day: null, month: null, year: null });
    };

    // Goals handlers
    const getGoalKey = (activityId, year, month) => `goal_${activityId}_${year}_${month}`;
    
    const getGoal = (activityId, year, month) => {
        const key = getGoalKey(activityId, year, month);
        return scheduleData.goals?.[key] || null;
    };

    const handleSetGoal = (activityId, year, month, goalValue) => {
        const key = getGoalKey(activityId, year, month);
        setScheduleData(prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                [key]: goalValue
            }
        }));
    };

    const handleActivityClick = (activity) => {
        // Check if it's the Ground Activity
        if (activity.name.toLowerCase().includes('ground')) {
            setGroundPlanOpen(true);
        } else {
            setSelectedActivity(activity);
            setDetailModalOpen(true);
        }
    };

    const handleEditFromDetail = () => {
        setDetailModalOpen(false);
        setActivityModalOpen(true);
    };

    const monthProgress = getMonthProgress(currentYear, selectedMonth);

    // Calculate total stats for profile
    const getTotalStats = () => {
        let totalCompleted = 0;
        let totalDays = 0;
        Object.values(scheduleData.tracking).forEach(val => {
            if (val) totalCompleted++;
        });
        const activeDays = new Set();
        Object.keys(scheduleData.tracking).forEach(key => {
            if (scheduleData.tracking[key]) {
                const parts = key.split('_');
                activeDays.add(`${parts[1]}_${parts[2]}_${parts[3]}`);
            }
        });
        return {
            totalCompleted,
            activeDays: activeDays.size,
            activities: scheduleData.activities.length
        };
    };

    const stats = getTotalStats();

    // Show loading screen
    if (authLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">📅</div>
                    <div className="loading-spinner-large"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return <LoginPage />;
    }

    // Show loading while fetching data (skip for guest mode)
    if (dataLoading && !isGuest) {
        return (
            <div className="loading-screen">
                <div className="loading-content">
                    <div className="loading-logo">📅</div>
                    <div className="loading-spinner-large"></div>
                    <p>Loading your data from cloud...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`container ${profile.theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
            {/* Mini Countdown Bar */}
            <div className="mini-countdown-bar">
                <span className="mini-countdown-text">
                    {funnyMessages[funnyIndex]} <strong>{miniCountdown.days}d {String(miniCountdown.hours).padStart(2, '0')}h {String(miniCountdown.minutes).padStart(2, '0')}m {String(miniCountdown.seconds).padStart(2, '0')}s</strong> till {currentYear + 1}! 🎆
                </span>
            </div>
            <header>
                <div className="header-content">
                    <div className="header-left-section">
                        <h1>⚡ Hustle Hub ⚡</h1>
                        <p>Crush it daily • Level up constantly • Be legendary 🏆</p>
                        <div className="sync-status">
                            {isGuest ? (
                                <span className="sync-indicator guest">👤 Guest Mode (Local Storage)</span>
                            ) : (
                                <>
                                    {syncStatus === 'syncing' && <span className="sync-indicator syncing">☁️ Syncing...</span>}
                                    {syncStatus === 'synced' && <span className="sync-indicator synced">✓ Synced</span>}
                                    {syncStatus === 'error' && <span className="sync-indicator error">⚠️ Sync failed</span>}
                                </>
                            )}
                        </div>
                        <div className="quick-plan-buttons">
                            <button 
                                className="plan-btn training-plan-btn"
                                onClick={() => { setGroundPlanTab('training'); setGroundPlanOpen(true); }}
                                title="Sprint Training Plan"
                            >
                                🏃 Training Plan
                            </button>
                            <button 
                                className="plan-btn meal-plan-btn"
                                onClick={() => { setGroundPlanTab('nutrition'); setGroundPlanOpen(true); }}
                                title="Weekly Meal Plan"
                            >
                                🍽️ Meal Plan
                            </button>
                            <button 
                                className="plan-btn study-plan-btn"
                                onClick={() => setStudyPlanOpen(true)}
                                title="Google Cloud ML Study Plan"
                            >
                                📚 GCP ML Study Plan
                            </button>
                        </div>
                    </div>
                    <div className="header-right-section">
                        <div className="profile-section" onClick={() => setProfileModalOpen(true)}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Profile" className="profile-avatar-img" />
                            ) : (
                                <div className="profile-avatar">{profile.avatar}</div>
                            )}
                            <div className="profile-info">
                                <span className="profile-name">{isGuest ? 'Guest' : (user?.name || profile.name || 'Set Profile')}</span>
                                <span className="profile-stats">🔥 {stats.totalCompleted} completed</span>
                            </div>
                        </div>
                        <button className="logout-btn" onClick={logout} title={isGuest ? 'Exit Guest Mode' : 'Sign out'}>
                            🚪
                        </button>
                    </div>
                </div>
            </header>

            <YearOverview
                currentYear={currentYear}
                selectedMonth={selectedMonth}
                onSelectMonth={setSelectedMonth}
            />

            {profile.showHeatmap && (
                <YearlyHeatmap
                    currentYear={currentYear}
                    activities={scheduleData.activities}
                    isDayCompleted={isDayCompleted}
                />
            )}

            <div className="main-content">
                <ScheduleTable
                    selectedMonth={selectedMonth}
                    currentYear={currentYear}
                    activities={scheduleData.activities}
                    getActivityProgress={getActivityProgress}
                    isDayCompleted={isDayCompleted}
                    onToggleDay={toggleDay}
                    onActivityClick={handleActivityClick}
                    onAddActivity={() => {
                        setSelectedActivity(null);
                        setActivityModalOpen(true);
                    }}
                    onReset={handleReset}
                    dailyProgress={getDailyProgress()}
                    getStreak={getStreak}
                    onImport={handleImport}
                    onBackup={handleBackup}
                    onRestore={handleRestore}
                    onReorder={handleReorder}
                    getNote={getNote}
                    onOpenNoteModal={handleOpenNoteModal}
                    getGoal={getGoal}
                    onSetGoal={handleSetGoal}
                    onSaveToCloud={isAuthenticated && !isGuest ? () => saveToCloud(scheduleData) : null}
                    syncStatus={syncStatus}
                />
            </div>

            <ActivityModal
                isOpen={activityModalOpen}
                onClose={() => {
                    setActivityModalOpen(false);
                    setSelectedActivity(null);
                }}
                activity={selectedActivity}
                onSave={handleSaveActivity}
                onDelete={handleDeleteActivity}
            />

            <ActivityDetailModal
                isOpen={detailModalOpen}
                onClose={() => {
                    setDetailModalOpen(false);
                    setSelectedActivity(null);
                }}
                activity={selectedActivity}
                progress={selectedActivity ? getActivityProgress(selectedActivity.id, currentYear, selectedMonth) : { completed: 0, total: 0, percentage: 0 }}
                weeklyBreakdown={selectedActivity ? getWeeklyBreakdown(selectedActivity.id) : []}
                onEdit={handleEditFromDetail}
            />

            {groundPlanOpen && (
                <GroundActivityPlan 
                    onClose={() => setGroundPlanOpen(false)} 
                    initialTab={groundPlanTab}
                />
            )}

            {studyPlanOpen && (
                <StudyPlan onClose={() => setStudyPlanOpen(false)} />
            )}

            {/* Keyboard Shortcuts Help */}
            {showShortcuts && (
                <div className="shortcuts-overlay" onClick={() => setShowShortcuts(false)}>
                    <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
                        <h3>⌨️ Keyboard Shortcuts</h3>
                        <div className="shortcuts-list">
                            <div className="shortcut-item">
                                <kbd>←</kbd>
                                <span>Previous month</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>→</kbd>
                                <span>Next month</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>T</kbd>
                                <span>Jump to current month</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>N</kbd>
                                <span>New activity</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>?</kbd>
                                <span>Toggle this help</span>
                            </div>
                            <div className="shortcut-item">
                                <kbd>Esc</kbd>
                                <span>Close modals</span>
                            </div>
                        </div>
                        <button className="close-shortcuts" onClick={() => setShowShortcuts(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Shortcuts hint */}
            <div className="shortcuts-hint" onClick={() => setShowShortcuts(true)}>
                Press <kbd>?</kbd> for shortcuts
            </div>

            {/* Note Modal */}
            {noteModal.open && (
                <div className="note-modal-overlay" onClick={() => setNoteModal({ open: false, day: null, month: null, year: null })}>
                    <div className="note-modal" onClick={e => e.stopPropagation()}>
                        <h3>📝 Note for Day {noteModal.day}</h3>
                        <textarea
                            className="note-textarea"
                            placeholder="Add a note for this day..."
                            defaultValue={getNote(noteModal.year, noteModal.month, noteModal.day)}
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                    handleSaveNote(e.target.value);
                                }
                            }}
                            id="noteInput"
                        />
                        <div className="note-modal-buttons">
                            <button 
                                className="note-cancel-btn"
                                onClick={() => setNoteModal({ open: false, day: null, month: null, year: null })}
                            >
                                Cancel
                            </button>
                            <button 
                                className="note-save-btn"
                                onClick={() => handleSaveNote(document.getElementById('noteInput').value)}
                            >
                                Save (Ctrl+Enter)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {profileModalOpen && (
                <div className="profile-modal-overlay" onClick={() => setProfileModalOpen(false)}>
                    <div className="profile-modal" onClick={e => e.stopPropagation()}>
                        <div className="profile-modal-header">
                            <h3>👤 Profile Settings</h3>
                            <button className="profile-close-btn" onClick={() => setProfileModalOpen(false)}>×</button>
                        </div>
                        
                        <div className="profile-modal-content">
                            <div className="profile-avatar-section">
                                <div className="profile-avatar-large">{profile.avatar}</div>
                                <div className="profile-avatar-picker">
                                    {AVATAR_OPTIONS.map(avatar => (
                                        <button 
                                            key={avatar}
                                            className={`avatar-option ${profile.avatar === avatar ? 'selected' : ''}`}
                                            onClick={() => setProfile(prev => ({ ...prev, avatar }))}
                                        >
                                            {avatar}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="profile-form">
                                <div className="profile-field">
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Enter your name"
                                    />
                                </div>
                                
                                <div className="profile-field">
                                    <label>Email (optional)</label>
                                    <input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="your@email.com"
                                    />
                                </div>

                                <div className="profile-field">
                                    <label>Start of Week</label>
                                    <select
                                        value={profile.startOfWeek}
                                        onChange={(e) => setProfile(prev => ({ ...prev, startOfWeek: parseInt(e.target.value) }))}
                                    >
                                        <option value={0}>Sunday</option>
                                        <option value={1}>Monday</option>
                                    </select>
                                </div>

                                <div className="profile-field">
                                    <label>Theme</label>
                                    <div className="theme-toggle-group">
                                        <button 
                                            className={`theme-btn ${profile.theme === 'dark' ? 'active' : ''}`}
                                            onClick={() => setProfile(prev => ({ ...prev, theme: 'dark' }))}
                                        >
                                            🌙 Dark
                                        </button>
                                        <button 
                                            className={`theme-btn ${profile.theme === 'light' ? 'active' : ''}`}
                                            onClick={() => setProfile(prev => ({ ...prev, theme: 'light' }))}
                                        >
                                            ☀️ Light
                                        </button>
                                    </div>
                                </div>

                                <div className="profile-toggles">
                                    <label className="toggle-option">
                                        <input
                                            type="checkbox"
                                            checked={profile.showStreak}
                                            onChange={(e) => setProfile(prev => ({ ...prev, showStreak: e.target.checked }))}
                                        />
                                        <span>Show Streak Counter</span>
                                    </label>
                                    <label className="toggle-option">
                                        <input
                                            type="checkbox"
                                            checked={profile.showHeatmap}
                                            onChange={(e) => setProfile(prev => ({ ...prev, showHeatmap: e.target.checked }))}
                                        />
                                        <span>Show Yearly Heatmap</span>
                                    </label>
                                </div>
                            </div>

                            <div className="profile-stats-section">
                                <h4>📊 Your Statistics</h4>
                                <div className="profile-stats-grid">
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.totalCompleted}</span>
                                        <span className="stat-label">Total Completed</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.activeDays}</span>
                                        <span className="stat-label">Active Days</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.activities}</span>
                                        <span className="stat-label">Activities</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Today'}</span>
                                        <span className="stat-label">Member Since</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-modal-buttons">
                                <button 
                                    className="profile-save-btn"
                                    onClick={() => handleSaveProfile(profile)}
                                >
                                    Save Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
