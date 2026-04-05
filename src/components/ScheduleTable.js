import React, { useRef, useState } from 'react';
import { MONTHS, getDaysInMonth } from '../data/constants';
import { Line } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ScheduleTable = ({
    selectedMonth,
    currentYear,
    activities,
    getActivityProgress,
    isDayCompleted,
    onToggleDay,
    onActivityClick,
    onAddActivity,
    onReset,
    dailyProgress,
    getStreak,
    onImport,
    onBackup,
    onRestore,
    onReorder,
    getNote,
    onOpenNoteModal,
    getGoal,
    onSetGoal,
    onSaveToCloud,
    syncStatus
}) => {
    const tableRef = useRef(null);
    const fileInputRef = useRef(null);
    const backupInputRef = useRef(null);
    const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
    const [draggedIndex, setDraggedIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);
    const [goalEditId, setGoalEditId] = useState(null);
    const [currentWeekStart, setCurrentWeekStart] = useState(() => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek);
        return start;
    });
    
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Get days for current week view
    const getWeekDays = () => {
        const weekDays = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            weekDays.push({
                date,
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                dayName: dayNames[i],
                isToday: date.toDateString() === new Date().toDateString()
            });
        }
        return weekDays;
    };

    const weekDays = getWeekDays();

    const navigateWeek = (direction) => {
        const newStart = new Date(currentWeekStart);
        newStart.setDate(currentWeekStart.getDate() + (direction * 7));
        setCurrentWeekStart(newStart);
    };

    const goToCurrentWeek = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const start = new Date(today);
        start.setDate(today.getDate() - dayOfWeek);
        setCurrentWeekStart(start);
    };

    // Export to Excel function - Full year with each month as a sheet
    const exportToExcel = () => {
        const wb = XLSX.utils.book_new();

        // Loop through all 12 months
        for (let month = 0; month < 12; month++) {
            const monthDays = getDaysInMonth(month, currentYear);
            const monthDaysArray = Array.from({ length: monthDays }, (_, i) => i + 1);

            // Create header row with days
            const headerRow = ['Activity', ...monthDaysArray.map(d => `Day ${d}`), 'Progress (%)'];
            
            // Create data rows for each activity
            const dataRows = activities.map(activity => {
                const progress = getActivityProgress(activity.id, currentYear, month);
                const dayStatuses = monthDaysArray.map(day => 
                    isDayCompleted(activity.id, currentYear, month, day) ? '✓' : ''
                );
                return [activity.name, ...dayStatuses, progress.percentage];
            });

            // Calculate daily progress for this month
            const monthDailyProgress = monthDaysArray.map(day => {
                let completed = 0;
                activities.forEach(activity => {
                    if (isDayCompleted(activity.id, currentYear, month, day)) {
                        completed++;
                    }
                });
                const total = activities.length;
                return total > 0 ? Math.round((completed / total) * 100) : 0;
            });

            // Add daily progress row at the bottom
            const dailyProgressRow = ['Daily Progress (%)', ...monthDailyProgress, ''];

            // Combine all rows
            const wsData = [headerRow, ...dataRows, [], dailyProgressRow];

            // Create worksheet
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Set column widths
            const colWidths = [{ wch: 30 }]; // Activity column
            monthDaysArray.forEach(() => colWidths.push({ wch: 6 })); // Day columns
            colWidths.push({ wch: 12 }); // Progress column
            ws['!cols'] = colWidths;

            // Add the worksheet to workbook with month name
            XLSX.utils.book_append_sheet(wb, ws, MONTHS[month]);
        }

        // Generate filename and save
        const filename = `Schedule_${currentYear}_Full_Year.xlsx`;
        XLSX.writeFile(wb, filename);
    };

    // Import from Excel function
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Parse tracking data from all sheets (months)
                const importedTracking = {};
                
                workbook.SheetNames.forEach((sheetName, monthIndex) => {
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    
                    if (jsonData.length < 2) return; // Skip empty sheets
                    
                    const headerRow = jsonData[0];
                    const daysInSheet = headerRow.length - 2; // Subtract Activity and Progress columns
                    
                    // Process each activity row (skip header and daily progress row)
                    for (let rowIndex = 1; rowIndex < jsonData.length; rowIndex++) {
                        const row = jsonData[rowIndex];
                        if (!row[0] || row[0] === 'Daily Progress (%)' || row[0] === '') continue;
                        
                        const activityName = row[0];
                        // Find matching activity by name
                        const activity = activities.find(a => a.name === activityName);
                        if (!activity) continue;
                        
                        // Process each day column
                        for (let dayIndex = 1; dayIndex <= daysInSheet; dayIndex++) {
                            const cellValue = row[dayIndex];
                            if (cellValue === '✓' || cellValue === '✔' || cellValue === 'Y' || cellValue === 'Yes' || cellValue === 'yes' || cellValue === true) {
                                const key = `${activity.id}_${currentYear}_${monthIndex}_${dayIndex}`;
                                importedTracking[key] = true;
                            }
                        }
                    }
                });
                
                if (Object.keys(importedTracking).length > 0) {
                    onImport(importedTracking);
                    alert(`Successfully imported ${Object.keys(importedTracking).length} completed entries!`);
                } else {
                    alert('No matching data found to import. Make sure activity names match.');
                }
            } catch (error) {
                console.error('Import error:', error);
                alert('Error importing file. Please make sure it\'s a valid Excel file exported from this app.');
            }
        };
        
        reader.readAsArrayBuffer(file);
        // Reset input so same file can be selected again
        e.target.value = '';
    };

    // Backup to JSON
    const handleBackup = () => {
        onBackup();
    };

    // Restore from JSON
    const handleRestoreClick = () => {
        backupInputRef.current?.click();
    };

    const handleRestoreFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.activities && data.tracking) {
                    onRestore(data);
                    alert('Data restored successfully!');
                } else {
                    alert('Invalid backup file format.');
                }
            } catch (error) {
                console.error('Restore error:', error);
                alert('Error restoring backup. Please make sure it\'s a valid JSON backup file.');
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Line chart data
    const lineChartData = {
        labels: days,
        datasets: [{
            label: 'Daily Progress',
            data: dailyProgress,
            borderColor: '#00d9ff',
            backgroundColor: 'rgba(0, 217, 255, 0.2)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 8,
            pointBackgroundColor: dailyProgress.map(p => {
                if (p === 0) return 'rgba(255, 255, 255, 0.3)';
                if (p < 25) return '#ff6b6b';
                if (p < 50) return '#ff9f43';
                if (p < 75) return '#ffd93d';
                if (p < 100) return '#6bcb77';
                return '#00ff88';
            }),
            pointBorderColor: '#fff',
            pointBorderWidth: 2
        }]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(26, 26, 46, 0.95)',
                titleColor: '#00d9ff',
                bodyColor: '#fff',
                borderColor: 'rgba(0, 217, 255, 0.3)',
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: (items) => `Day ${items[0].label}`,
                    label: (item) => `Progress: ${item.raw}%`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    color: '#888',
                    callback: value => value + '%',
                    stepSize: 25
                },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            x: {
                ticks: { 
                    color: '#888',
                    maxTicksLimit: 15
                },
                grid: { display: false }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index'
        }
    };

    return (
        <section className="schedule-section">
            <div className="table-wrapper" ref={tableRef}>
                <div className="schedule-header">
                    <div className="header-left">
                        <h2>🎯 {MONTHS[selectedMonth]} {currentYear} - Mission Control</h2>
                        <div className="view-toggle">
                            <button 
                                className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
                                onClick={() => setViewMode('month')}
                            >
                                Month
                            </button>
                            <button 
                                className={`view-btn ${viewMode === 'week' ? 'active' : ''}`}
                                onClick={() => setViewMode('week')}
                            >
                                Week
                            </button>
                        </div>
                        {viewMode === 'week' && (
                            <div className="week-navigation">
                                <button className="week-nav-btn" onClick={() => navigateWeek(-1)}>←</button>
                                <span className="week-label">
                                    {weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <button className="week-nav-btn" onClick={() => navigateWeek(1)}>→</button>
                                <button className="week-nav-btn today-btn" onClick={goToCurrentWeek}>Today</button>
                            </div>
                        )}
                    </div>
                    <div className="header-buttons">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx,.xls"
                            style={{ display: 'none' }}
                        />
                        <input
                            type="file"
                            ref={backupInputRef}
                            onChange={handleRestoreFile}
                            accept=".json"
                            style={{ display: 'none' }}
                        />
                        {onSaveToCloud && (
                            <button 
                                className={`add-activity-btn save-cloud-btn ${syncStatus === 'syncing' ? 'syncing' : ''}`}
                                onClick={onSaveToCloud}
                                disabled={syncStatus === 'syncing'}
                            >
                                {syncStatus === 'syncing' ? '☁️ Saving...' : '☁️ Save to Cloud'}
                            </button>
                        )}
                        <button className="add-activity-btn backup-btn" onClick={handleBackup}>
                            💾 Backup
                        </button>
                        <button className="add-activity-btn restore-btn" onClick={handleRestoreClick}>
                            🔄 Restore
                        </button>
                        <button className="add-activity-btn import-btn" onClick={handleImportClick}>
                            📥 Import Excel
                        </button>
                        <button className="add-activity-btn export-btn" onClick={exportToExcel}>
                            📊 Export Excel
                        </button>
                        <button className="add-activity-btn reset-btn" onClick={onReset}>
                            🔄 Reset
                        </button>
                        <button className="add-activity-btn" onClick={onAddActivity}>
                            + Add Activity
                        </button>
                    </div>
                </div>

                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Activity</th>
                            {viewMode === 'month' ? (
                                days.map(day => {
                                    const today = new Date();
                                    const isToday = day === today.getDate() && 
                                                    selectedMonth === today.getMonth() && 
                                                    currentYear === today.getFullYear();
                                    return (
                                        <th key={day} className={isToday ? 'today-header' : ''}>{day}</th>
                                    );
                                })
                            ) : (
                                weekDays.map((wd, i) => (
                                    <th key={i} className={wd.isToday ? 'today-header' : ''}>
                                        <div className="week-day-header">
                                            <span className="day-name">{wd.dayName}</span>
                                            <span className="day-num">{wd.day}</span>
                                        </div>
                                    </th>
                                ))
                            )}
                            <th>🔥 Streak</th>
                            <th>🎯 Goal</th>
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activities.length === 0 ? (
                            <tr>
                                <td colSpan={viewMode === 'month' ? daysInMonth + 4 : 11} className="empty-state">
                                    No activities yet. Click "Add Activity" to get started!
                                </td>
                            </tr>
                        ) : (
                            activities.map((activity, index) => {
                                const progress = getActivityProgress(activity.id, currentYear, selectedMonth);
                                const streak = getStreak(activity.id);
                                return (
                                    <tr 
                                        key={activity.id}
                                        draggable
                                        onDragStart={() => setDraggedIndex(index)}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            setDragOverIndex(index);
                                        }}
                                        onDragLeave={() => setDragOverIndex(null)}
                                        onDrop={() => {
                                            if (draggedIndex !== null && draggedIndex !== index) {
                                                onReorder(draggedIndex, index);
                                            }
                                            setDraggedIndex(null);
                                            setDragOverIndex(null);
                                        }}
                                        onDragEnd={() => {
                                            setDraggedIndex(null);
                                            setDragOverIndex(null);
                                        }}
                                        className={`
                                            ${draggedIndex === index ? 'dragging' : ''}
                                            ${dragOverIndex === index ? 'drag-over' : ''}
                                        `}
                                    >
                                        <td onClick={() => onActivityClick(activity)}>
                                            <div className="activity-name">
                                                <span className="drag-handle">⋮⋮</span>
                                                <div 
                                                    className="activity-color" 
                                                    style={{ background: activity.color }}
                                                />
                                                <span>{activity.name}</span>
                                                {activity.priority && (
                                                    <span className={`priority-badge priority-${activity.priority}`}>
                                                        {activity.priority === 'high' ? '🔴' : activity.priority === 'medium' ? '🟡' : '🟢'}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {viewMode === 'month' ? (
                                            days.map(day => {
                                                const completed = isDayCompleted(activity.id, currentYear, selectedMonth, day);
                                                const today = new Date();
                                                const isToday = day === today.getDate() && 
                                                                selectedMonth === today.getMonth() && 
                                                                currentYear === today.getFullYear();
                                                return (
                                                    <td key={day} className={isToday ? 'today-cell' : ''}>
                                                        <button
                                                            className={`cell-btn ${completed ? 'yes' : 'no'}`}
                                                            onClick={() => onToggleDay(activity.id, currentYear, selectedMonth, day)}
                                                        >
                                                            {completed ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                );
                                            })
                                        ) : (
                                            weekDays.map((wd, i) => {
                                                const completed = isDayCompleted(activity.id, wd.year, wd.month, wd.day);
                                                return (
                                                    <td key={i} className={wd.isToday ? 'today-cell' : ''}>
                                                        <button
                                                            className={`cell-btn week-cell ${completed ? 'yes' : 'no'}`}
                                                            onClick={() => onToggleDay(activity.id, wd.year, wd.month, wd.day)}
                                                        >
                                                            {completed ? '✓' : ''}
                                                        </button>
                                                    </td>
                                                );
                                            })
                                        )}
                                        <td>
                                            <div className={`streak-badge ${streak >= 7 ? 'streak-hot' : streak >= 3 ? 'streak-warm' : ''}`}>
                                                {streak > 0 ? (
                                                    <>
                                                        <span className="streak-fire">🔥</span>
                                                        <span className="streak-count">{streak}</span>
                                                    </>
                                                ) : (
                                                    <span className="streak-count streak-zero">0</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {(() => {
                                                const goal = getGoal(activity.id, currentYear, selectedMonth);
                                                const isEditing = goalEditId === activity.id;
                                                const goalMet = goal && progress.completed >= goal;
                                                
                                                return (
                                                    <div className="goal-cell">
                                                        {isEditing ? (
                                                            <input
                                                                type="number"
                                                                className="goal-input"
                                                                defaultValue={goal || ''}
                                                                min="1"
                                                                max={daysInMonth}
                                                                placeholder={daysInMonth}
                                                                autoFocus
                                                                onBlur={(e) => {
                                                                    const val = parseInt(e.target.value);
                                                                    if (val > 0 && val <= daysInMonth) {
                                                                        onSetGoal(activity.id, currentYear, selectedMonth, val);
                                                                    }
                                                                    setGoalEditId(null);
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        const val = parseInt(e.target.value);
                                                                        if (val > 0 && val <= daysInMonth) {
                                                                            onSetGoal(activity.id, currentYear, selectedMonth, val);
                                                                        }
                                                                        setGoalEditId(null);
                                                                    } else if (e.key === 'Escape') {
                                                                        setGoalEditId(null);
                                                                    }
                                                                }}
                                                            />
                                                        ) : (
                                                            <button 
                                                                className={`goal-btn ${goal ? (goalMet ? 'goal-met' : 'goal-set') : ''}`}
                                                                onClick={() => setGoalEditId(activity.id)}
                                                                title={goal ? `Goal: ${progress.completed}/${goal} days` : 'Set monthly goal'}
                                                            >
                                                                {goal ? (
                                                                    <>
                                                                        <span className="goal-progress">{progress.completed}/{goal}</span>
                                                                        {goalMet && <span className="goal-check">✓</span>}
                                                                    </>
                                                                ) : (
                                                                    <span className="goal-add">+</span>
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <div className="activity-progress">
                                                <div 
                                                    className="activity-progress-bar" 
                                                    style={{ 
                                                        width: `${progress.percentage}%`,
                                                        background: activity.color 
                                                    }}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                        {/* Notes Row */}
                        {activities.length > 0 && viewMode === 'month' && (
                            <tr className="notes-row">
                                <td>📝 Notes</td>
                                {days.map(day => {
                                    const note = getNote(currentYear, selectedMonth, day);
                                    const hasNote = note && note.trim().length > 0;
                                    return (
                                        <td key={day}>
                                            <button
                                                className={`note-btn ${hasNote ? 'has-note' : ''}`}
                                                onClick={() => onOpenNoteModal(currentYear, selectedMonth, day)}
                                                title={hasNote ? note : 'Add note'}
                                            >
                                                {hasNote ? '📝' : '+'}
                                            </button>
                                        </td>
                                    );
                                })}
                                <td></td>
                                <td></td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Line Chart - Daily Progress */}
            <div className="progress-chart-section">
                <h3>📈 Daily Progress</h3>
                <div className="line-chart-container">
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>
            </div>
        </section>
    );
};

export default ScheduleTable;