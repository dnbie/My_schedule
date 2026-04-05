import React from 'react';

const ActivityDetailModal = ({ 
    isOpen, 
    onClose, 
    activity, 
    progress, 
    weeklyBreakdown,
    onEdit 
}) => {
    if (!isOpen || !activity) return null;

    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (progress.percentage / 100) * circumference;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                
                <div className="activity-detail-header">
                    <div 
                        className="activity-detail-color" 
                        style={{ background: activity.color }}
                    />
                    <div className="activity-detail-info">
                        <h2>{activity.name}</h2>
                        <p>{progress.completed} of {progress.total} days completed this month</p>
                    </div>
                </div>

                <div className="progress-ring">
                    <div className="progress-ring-container">
                        <svg width="150" height="150">
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                    <stop offset="0%" stopColor="#00d9ff"/>
                                    <stop offset="100%" stopColor="#00ff88"/>
                                </linearGradient>
                            </defs>
                            <circle className="progress-ring-bg" cx="75" cy="75" r="60"/>
                            <circle 
                                className="progress-ring-fill" 
                                cx="75" 
                                cy="75" 
                                r="60" 
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                            />
                        </svg>
                        <div className="progress-ring-text">
                            <div className="percentage">{progress.percentage}%</div>
                            <div className="label">Complete</div>
                        </div>
                    </div>
                </div>

                <div className="detail-section">
                    <h4>🎯 Goal</h4>
                    <p>{activity.goal || 'No goal set'}</p>
                </div>

                <div className="detail-section">
                    <h4>📋 Plan</h4>
                    <p>{activity.plan || 'No plan set'}</p>
                </div>

                <div className="detail-section">
                    <h4>📅 This Week</h4>
                    <div className="weekly-breakdown">
                        {weeklyBreakdown.map((day, index) => (
                            <div key={index} className="week-day">
                                <div className="day-name">{day.name}</div>
                                <div className={`day-status ${day.status}`}></div>
                            </div>
                        ))}
                    </div>
                </div>

                <button className="btn-primary" onClick={onEdit}>
                    ✏️ Edit Activity
                </button>
            </div>
        </div>
    );
};

export default ActivityDetailModal;
