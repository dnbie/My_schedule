import React, { useState, useEffect } from 'react';
import { MONTHS, getDaysInMonth } from '../data/constants';

const YearlyHeatmap = ({ currentYear, activities, isDayCompleted }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    // Countdown timer for next year
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
                setCountdown({ days, hours, minutes, seconds });
            } else {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateCountdown();
        const timer = setInterval(calculateCountdown, 1000);
        return () => clearInterval(timer);
    }, [currentYear]);

    // Get today's date info
    const today = new Date();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();
    const todayYear = today.getFullYear();

    // Generate all days of the year
    const generateYearData = () => {
        const yearData = [];
        
        for (let month = 0; month < 12; month++) {
            const daysInMonth = getDaysInMonth(month, currentYear);
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(currentYear, month, day);
                const dayOfWeek = date.getDay();
                
                // Check if this day is in the past
                const isPast = date < new Date(todayYear, todayMonth, todayDay);
                const isToday = month === todayMonth && day === todayDay && currentYear === todayYear;
                
                // Calculate completion percentage for this day
                let completed = 0;
                activities.forEach(activity => {
                    if (isDayCompleted(activity.id, currentYear, month, day)) {
                        completed++;
                    }
                });
                const percentage = activities.length > 0 
                    ? Math.round((completed / activities.length) * 100) 
                    : 0;
                
                yearData.push({
                    date,
                    month,
                    day,
                    dayOfWeek,
                    percentage,
                    completed,
                    total: activities.length,
                    isPast,
                    isToday
                });
            }
        }
        
        return yearData;
    };

    const yearData = generateYearData();

    // Get color based on completion percentage and day status
    const getColor = (dayData) => {
        if (!dayData) return 'transparent';
        
        const { percentage, isPast, isToday } = dayData;
        
        // Today gets a special highlight
        if (isToday) {
            return 'rgba(0, 217, 255, 1)'; // Bright cyan for today
        }
        
        // Past days with no activity - darker/dead color
        if (isPast && percentage === 0) {
            return 'rgba(80, 80, 100, 0.5)'; // Grayish dead color
        }
        
        // Future days with no activity
        if (!isPast && percentage === 0) {
            return 'rgba(255, 255, 255, 0.08)';
        }
        
        // Days with activity - color by percentage
        if (percentage < 25) return 'rgba(255, 107, 107, 0.5)';
        if (percentage < 50) return 'rgba(255, 159, 67, 0.6)';
        if (percentage < 75) return 'rgba(255, 217, 61, 0.7)';
        if (percentage < 100) return 'rgba(107, 203, 119, 0.8)';
        return 'rgba(0, 255, 136, 1)';
    };

    // Group days by week for the grid layout
    const getWeeksData = () => {
        const weeks = [];
        let currentWeek = new Array(7).fill(null);
        
        yearData.forEach((dayData, index) => {
            const dayOfWeek = dayData.dayOfWeek;
            
            // If it's the first day of the year or first day shown, pad the beginning
            if (index === 0 && dayOfWeek > 0) {
                for (let i = 0; i < dayOfWeek; i++) {
                    currentWeek[i] = null;
                }
            }
            
            currentWeek[dayOfWeek] = dayData;
            
            // If it's Saturday or the last day, push the week and start a new one
            if (dayOfWeek === 6 || index === yearData.length - 1) {
                weeks.push([...currentWeek]);
                currentWeek = new Array(7).fill(null);
            }
        });
        
        return weeks;
    };

    const weeks = getWeeksData();

    return (
        <div className={`yearly-heatmap ${isExpanded ? 'expanded' : ''}`}>
            <div className="heatmap-header" onClick={() => setIsExpanded(!isExpanded)}>
                <h3>🔥 {currentYear} Grind Grid - Your Hustle Heat! 🚀</h3>
                <span className="expand-toggle">{isExpanded ? '▼' : '▶'}</span>
            </div>
            
            {isExpanded && (
                <>
                    {/* Countdown to Next Year */}
                    <div className="countdown-container">
                        <div className="countdown-title">⏰ Countdown to {currentYear + 1}</div>
                        <div className="countdown-timer">
                            <div className="countdown-item">
                                <span className="countdown-value">{countdown.days}</span>
                                <span className="countdown-label">Days</span>
                            </div>
                            <div className="countdown-separator">:</div>
                            <div className="countdown-item">
                                <span className="countdown-value">{String(countdown.hours).padStart(2, '0')}</span>
                                <span className="countdown-label">Hours</span>
                            </div>
                            <div className="countdown-separator">:</div>
                            <div className="countdown-item">
                                <span className="countdown-value">{String(countdown.minutes).padStart(2, '0')}</span>
                                <span className="countdown-label">Mins</span>
                            </div>
                            <div className="countdown-separator">:</div>
                            <div className="countdown-item">
                                <span className="countdown-value">{String(countdown.seconds).padStart(2, '0')}</span>
                                <span className="countdown-label">Secs</span>
                            </div>
                        </div>
                    </div>

                    <div className="heatmap-container">
                        <div className="heatmap-grid">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="heatmap-week">
                                    {week.map((dayData, dayIndex) => (
                                        <div
                                            key={dayIndex}
                                            className={`heatmap-cell ${dayData ? '' : 'empty'} ${dayData?.isToday ? 'today' : ''} ${dayData?.isPast && dayData?.percentage === 0 ? 'dead' : ''}`}
                                            style={{
                                                backgroundColor: getColor(dayData)
                                            }}
                                            onMouseEnter={() => dayData && setHoveredDay(dayData)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Tooltip */}
                    {hoveredDay && (
                        <div className="heatmap-tooltip">
                            <strong>{MONTHS[hoveredDay.month]} {hoveredDay.day}, {currentYear}</strong>
                            <span>{hoveredDay.completed}/{hoveredDay.total} activities ({hoveredDay.percentage}%)</span>
                            {hoveredDay.isToday && <span className="today-badge">📍 TODAY</span>}
                            {hoveredDay.isPast && hoveredDay.percentage === 0 && <span className="dead-badge">💀 Missed</span>}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default YearlyHeatmap;
