import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getDaysInMonth } from '../data/constants';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({ 
    currentYear, 
    selectedMonth, 
    activities, 
    isDayCompleted 
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isOnRightSide, setIsOnRightSide] = useState(true);
    const widgetRef = useRef(null);
    const dragOffset = useRef({ x: 0, y: 0 });
    const clickStartTime = useRef(0);
    
    const handleMouseDown = (e) => {
        if (e.target.closest('.calendar-body')) return;
        
        e.preventDefault();
        clickStartTime.current = Date.now();
        
        const rect = widgetRef.current.getBoundingClientRect();
        dragOffset.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        // Set initial position if not set
        widgetRef.current.style.right = 'auto';
        widgetRef.current.style.transform = 'none';
        widgetRef.current.style.left = rect.left + 'px';
        widgetRef.current.style.top = rect.top + 'px';
        
        setIsDragging(true);
    };

    const toggleExpanded = useCallback(() => {
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        
        if (widgetRef.current) {
            if (newExpanded) {
                // Adjust position when expanding to keep calendar visible
                setTimeout(() => {
                    if (!widgetRef.current) return;
                    const rect = widgetRef.current.getBoundingClientRect();
                    const padding = 20;
                    // Expanded calendar is about 350px wide
                    const expandedWidth = 350;
                    const expandedHeight = 400;
                    
                    let newX = rect.left;
                    let newY = rect.top;
                    
                    // If on right side, need to shift left to accommodate expanded width
                    if (isOnRightSide) {
                        newX = window.innerWidth - expandedWidth - padding;
                    }
                    
                    // Check if calendar goes off right edge
                    if (rect.left + expandedWidth > window.innerWidth - padding) {
                        newX = window.innerWidth - expandedWidth - padding;
                    }
                    
                    // Check if calendar goes off bottom edge
                    if (rect.top + expandedHeight > window.innerHeight - padding) {
                        newY = window.innerHeight - expandedHeight - padding;
                    }
                    
                    // Check if calendar goes off left edge
                    if (newX < padding) {
                        newX = padding;
                    }
                    
                    // Check if calendar goes off top edge
                    if (newY < padding) {
                        newY = padding;
                    }
                    
                    // Apply new position
                    widgetRef.current.style.transition = 'left 0.2s ease, top 0.2s ease';
                    widgetRef.current.style.left = newX + 'px';
                    widgetRef.current.style.top = newY + 'px';
                    
                    setTimeout(() => {
                        if (widgetRef.current) {
                            widgetRef.current.style.transition = '';
                        }
                    }, 200);
                }, 50);
            } else {
                // When closing, snap back to the edge
                setTimeout(() => {
                    if (!widgetRef.current) return;
                    const rect = widgetRef.current.getBoundingClientRect();
                    const padding = 20;
                    const collapsedWidth = 50; // Collapsed calendar width
                    
                    let targetX;
                    if (isOnRightSide) {
                        targetX = window.innerWidth - collapsedWidth - padding;
                    } else {
                        targetX = padding;
                    }
                    
                    // Smooth transition back to edge
                    widgetRef.current.style.transition = 'left 0.3s ease';
                    widgetRef.current.style.left = targetX + 'px';
                    
                    setTimeout(() => {
                        if (widgetRef.current) {
                            widgetRef.current.style.transition = '';
                        }
                    }, 300);
                }, 50);
            }
        }
    }, [isExpanded, isOnRightSide]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !widgetRef.current) return;
        
        // Close calendar when starting to drag
        if (isExpanded) {
            setIsExpanded(false);
            // Recalculate position for collapsed size
            const collapsedWidth = 50;
            const padding = 20;
            if (isOnRightSide) {
                widgetRef.current.style.left = (window.innerWidth - collapsedWidth - padding) + 'px';
            }
        }
        
        const newX = e.clientX - dragOffset.current.x;
        const newY = e.clientY - dragOffset.current.y;
        
        // Keep within viewport bounds
        const maxX = window.innerWidth - widgetRef.current.offsetWidth - 10;
        const maxY = window.innerHeight - widgetRef.current.offsetHeight - 10;
        
        const clampedX = Math.max(10, Math.min(newX, maxX));
        const clampedY = Math.max(10, Math.min(newY, maxY));
        
        // Direct DOM manipulation for smooth movement
        widgetRef.current.style.left = clampedX + 'px';
        widgetRef.current.style.top = clampedY + 'px';
    }, [isDragging, isExpanded, isOnRightSide]);

    const handleMouseUp = useCallback((e) => {
        const clickDuration = Date.now() - clickStartTime.current;
        const wasDragging = isDragging;
        setIsDragging(false);
        
        // If it was a short click (not a drag), toggle expanded
        if (clickDuration < 200 && widgetRef.current) {
            const rect = widgetRef.current.getBoundingClientRect();
            const moveDistance = Math.abs(e.clientX - (rect.left + dragOffset.current.x)) + 
                                 Math.abs(e.clientY - (rect.top + dragOffset.current.y));
            
            // If barely moved, treat as click
            if (moveDistance < 5) {
                toggleExpanded();
                return;
            }
        }
        
        // Close calendar when long press (didn't move but held for long)
        const wasLongPress = clickDuration >= 200;
        if (wasLongPress && isExpanded) {
            setIsExpanded(false);
        }
        
        // Snap to left or right edge, keep vertical position
        if (widgetRef.current) {
            const rect = widgetRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const viewportCenterX = window.innerWidth / 2;
            
            const paddingX = 20;
            const paddingY = 20;
            const collapsedWidth = 50;
            let targetX;
            let newIsOnRightSide;
            
            // Snap to left or right edge based on which side it's closer to
            if (centerX < viewportCenterX) {
                targetX = paddingX;
                newIsOnRightSide = false;
            } else {
                // Use collapsed width when closing
                targetX = window.innerWidth - collapsedWidth - paddingX;
                newIsOnRightSide = true;
            }
            
            setIsOnRightSide(newIsOnRightSide);
            
            // Keep vertical position but clamp to screen bounds
            const maxY = window.innerHeight - rect.height - paddingY;
            const targetY = Math.max(paddingY, Math.min(rect.top, maxY));
            
            // Smooth transition to edge
            widgetRef.current.style.transition = 'left 0.3s ease, top 0.3s ease';
            widgetRef.current.style.left = targetX + 'px';
            widgetRef.current.style.top = targetY + 'px';
            
            // Remove transition after animation
            setTimeout(() => {
                if (widgetRef.current) {
                    widgetRef.current.style.transition = '';
                }
            }, 300);
        }
    }, [isDragging, isExpanded, toggleExpanded]);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);
    
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay();
    
    const getDayProgress = (day) => {
        if (activities.length === 0) return 0;
        let completed = 0;
        activities.forEach(activity => {
            if (isDayCompleted(activity.id, currentYear, selectedMonth, day)) {
                completed++;
            }
        });
        return Math.round((completed / activities.length) * 100);
    };

    const getProgressColor = (progress) => {
        if (progress === 0) return 'rgba(255, 255, 255, 0.05)';
        if (progress < 25) return '#ff6b6b';
        if (progress < 50) return '#ff9f43';
        if (progress < 75) return '#ffd93d';
        if (progress < 100) return '#6bcb77';
        return '#00ff88';
    };

    const today = new Date();
    const isToday = (day) => {
        return today.getDate() === day && 
               today.getMonth() === selectedMonth && 
               today.getFullYear() === currentYear;
    };

    const calendarDays = [];
    
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const progress = getDayProgress(day);
        const color = getProgressColor(progress);
        
        calendarDays.push(
            <div 
                key={day} 
                className={`calendar-day ${isToday(day) ? 'today' : ''}`}
                style={{ background: color }}
                title={`Day ${day}: ${progress}% complete`}
            >
                {isExpanded && (
                    <>
                        <span className="day-number">{day}</span>
                        <span className="day-progress">{progress}%</span>
                    </>
                )}
            </div>
        );
    }

    return (
        <div 
            ref={widgetRef}
            className={`calendar-widget ${isExpanded ? 'expanded' : ''} ${isDragging ? 'dragging' : ''}`}
        >
            <div 
                className="calendar-header"
                onMouseDown={handleMouseDown}
            >
                <span className="drag-handle">⋮⋮</span>
                <span className="calendar-icon">📅</span>
                {isExpanded && <span className="calendar-title">Calendar View</span>}
                <span className="expand-icon">
                    {isExpanded ? '◀' : '▶'}
                </span>
            </div>
            
            <div className="calendar-body">
                {isExpanded && (
                    <div className="calendar-weekdays">
                        {DAYS.map(day => (
                            <div key={day} className="weekday">{day}</div>
                        ))}
                    </div>
                )}
                
                <div className={`calendar-grid ${isExpanded ? 'expanded' : ''}`}>
                    {calendarDays}
                </div>
                
                {isExpanded && (
                    <div className="calendar-legend">
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#ff6b6b' }}></div>
                            <span>&lt;25%</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#ff9f43' }}></div>
                            <span>25-49%</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#ffd93d' }}></div>
                            <span>50-74%</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#6bcb77' }}></div>
                            <span>75-99%</span>
                        </div>
                        <div className="legend-item">
                            <div className="legend-color" style={{ background: '#00ff88' }}></div>
                            <span>100%</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CalendarView;
