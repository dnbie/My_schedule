// ==========================================
// MY SCHEDULE TRACKER - JavaScript Application
// ==========================================

// Available colors for activities
const COLORS = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6',
    '#1abc9c', '#e74c3c', '#3498db', '#f39c12', '#00d9ff',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
];

// Month names
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Get days in a month
function getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
}

// Current date info
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
let selectedMonth = currentDate.getMonth();

// Initialize data structure
let scheduleData = loadData();

// ==========================================
// DATA MANAGEMENT
// ==========================================

function getDefaultData() {
    return {
        activities: [],
        tracking: {} // { 'activityId_year_month_day': true/false }
    };
}

function loadData() {
    const saved = localStorage.getItem('scheduleTrackerData');
    if (saved) {
        return JSON.parse(saved);
    }
    return getDefaultData();
}

function saveData() {
    localStorage.setItem('scheduleTrackerData', JSON.stringify(scheduleData));
}

function generateId() {
    return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// ==========================================
// ACTIVITY MANAGEMENT
// ==========================================

function addActivity(name, goal, plan, color) {
    const activity = {
        id: generateId(),
        name: name,
        goal: goal || '',
        plan: plan || '',
        color: color || COLORS[0],
        createdAt: new Date().toISOString()
    };
    scheduleData.activities.push(activity);
    saveData();
    return activity;
}

function updateActivity(id, name, goal, plan, color) {
    const index = scheduleData.activities.findIndex(a => a.id === id);
    if (index !== -1) {
        scheduleData.activities[index] = {
            ...scheduleData.activities[index],
            name: name,
            goal: goal || '',
            plan: plan || '',
            color: color
        };
        saveData();
    }
}

function deleteActivity() {
    const id = document.getElementById('editActivityId').value;
    if (id && confirm('Are you sure you want to delete this activity?')) {
        scheduleData.activities = scheduleData.activities.filter(a => a.id !== id);
        // Also remove tracking data for this activity
        Object.keys(scheduleData.tracking).forEach(key => {
            if (key.startsWith(id)) {
                delete scheduleData.tracking[key];
            }
        });
        saveData();
        closeModal('activityModal');
        renderAll();
    }
}

function getTrackingKey(activityId, year, month, day) {
    return `${activityId}_${year}_${month}_${day}`;
}

function toggleDay(activityId, year, month, day) {
    const key = getTrackingKey(activityId, year, month, day);
    scheduleData.tracking[key] = !scheduleData.tracking[key];
    saveData();
    renderAll();
}

function isDayCompleted(activityId, year, month, day) {
    const key = getTrackingKey(activityId, year, month, day);
    return scheduleData.tracking[key] || false;
}

// ==========================================
// STATISTICS CALCULATIONS
// ==========================================

function getActivityProgress(activityId, year, month) {
    const daysInMonth = getDaysInMonth(month, year);
    let completed = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
        if (isDayCompleted(activityId, year, month, day)) {
            completed++;
        }
    }
    
    return {
        completed: completed,
        total: daysInMonth,
        percentage: Math.round((completed / daysInMonth) * 100)
    };
}

function getMonthProgress(year, month) {
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
}

function getDailyProgress(year, month) {
    const daysInMonth = getDaysInMonth(month, year);
    const dailyData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
        let completed = 0;
        scheduleData.activities.forEach(activity => {
            if (isDayCompleted(activity.id, year, month, day)) {
                completed++;
            }
        });
        const total = scheduleData.activities.length;
        dailyData.push(total > 0 ? Math.round((completed / total) * 100) : 0);
    }
    
    return dailyData;
}

// ==========================================
// RENDERING FUNCTIONS
// ==========================================

function renderYearOverview() {
    const container = document.getElementById('yearOverview');
    container.innerHTML = '';
    
    MONTHS.forEach((monthName, index) => {
        const progress = getMonthProgress(currentYear, index);
        const card = document.createElement('div');
        card.className = `month-card ${index === selectedMonth ? 'active' : ''}`;
        card.onclick = () => selectMonth(index);
        
        card.innerHTML = `
            <h3>${monthName}</h3>
            <div class="month-progress">
                <div class="month-progress-bar" style="width: ${progress.percentage}%"></div>
            </div>
            <div class="month-stats">
                <span>${progress.percentage}%</span>
                <span>${scheduleData.activities.length} activities</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function selectMonth(month) {
    selectedMonth = month;
    renderAll();
}

function renderScheduleTable() {
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    
    // Update title
    document.getElementById('currentMonthTitle').textContent = 
        `${MONTHS[selectedMonth]} ${currentYear}`;
    
    // Render header
    const header = document.getElementById('tableHeader');
    let headerHTML = '<tr><th>Activity</th>';
    for (let day = 1; day <= daysInMonth; day++) {
        headerHTML += `<th>${day}</th>`;
    }
    headerHTML += '<th>Progress</th></tr>';
    header.innerHTML = headerHTML;
    
    // Render body
    const body = document.getElementById('tableBody');
    body.innerHTML = '';
    
    if (scheduleData.activities.length === 0) {
        body.innerHTML = `
            <tr>
                <td colspan="${daysInMonth + 2}" style="text-align: center; padding: 40px; color: #888;">
                    No activities yet. Click "Add Activity" to get started!
                </td>
            </tr>
        `;
        return;
    }
    
    scheduleData.activities.forEach(activity => {
        const progress = getActivityProgress(activity.id, currentYear, selectedMonth);
        const row = document.createElement('tr');
        
        let rowHTML = `
            <td onclick="openActivityDetail('${activity.id}')">
                <div class="activity-name">
                    <div class="activity-color" style="background: ${activity.color}"></div>
                    <span>${activity.name}</span>
                </div>
            </td>
        `;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const completed = isDayCompleted(activity.id, currentYear, selectedMonth, day);
            rowHTML += `
                <td>
                    <button class="cell-btn ${completed ? 'yes' : 'no'}" 
                            onclick="toggleDay('${activity.id}', ${currentYear}, ${selectedMonth}, ${day})">
                        ${completed ? '✓' : ''}
                    </button>
                </td>
            `;
        }
        
        rowHTML += `
            <td>
                <div class="activity-progress">
                    <div class="activity-progress-bar" style="width: ${progress.percentage}%; background: ${activity.color}"></div>
                </div>
            </td>
        `;
        
        row.innerHTML = rowHTML;
        body.appendChild(row);
    });
}

function renderStats() {
    const progress = getMonthProgress(currentYear, selectedMonth);
    const daysInMonth = getDaysInMonth(selectedMonth, currentYear);
    
    // Count days with at least one activity completed
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
    
    document.getElementById('completedDays').textContent = daysWithCompletion;
    document.getElementById('overallProgress').textContent = progress.percentage + '%';
}

// ==========================================
// CHARTS
// ==========================================

let progressChart = null;
let activityChart = null;

function renderCharts() {
    renderProgressChart();
    renderActivityChart();
}

function renderProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const dailyData = getDailyProgress(currentYear, selectedMonth);
    const labels = dailyData.map((_, i) => i + 1);
    
    if (progressChart) {
        progressChart.destroy();
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Daily Progress',
                data: dailyData,
                borderColor: '#00d9ff',
                backgroundColor: 'rgba(0, 217, 255, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 2,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        color: '#888',
                        callback: value => value + '%'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        color: '#888',
                        maxTicksLimit: 10
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function renderActivityChart() {
    const ctx = document.getElementById('activityChart').getContext('2d');
    
    if (activityChart) {
        activityChart.destroy();
    }
    
    if (scheduleData.activities.length === 0) {
        return;
    }
    
    const labels = scheduleData.activities.map(a => a.name);
    const data = scheduleData.activities.map(a => {
        const progress = getActivityProgress(a.id, currentYear, selectedMonth);
        return progress.percentage;
    });
    const colors = scheduleData.activities.map(a => a.color);
    
    activityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#888',
                        padding: 15,
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// ==========================================
// MODALS
// ==========================================

function openAddActivityModal() {
    document.getElementById('modalTitle').textContent = 'Add New Activity';
    document.getElementById('activityForm').reset();
    document.getElementById('editActivityId').value = '';
    document.getElementById('deleteActivityBtn').style.display = 'none';
    renderColorOptions();
    document.getElementById('activityModal').classList.add('active');
}

function openEditActivityModal(activity) {
    document.getElementById('modalTitle').textContent = 'Edit Activity';
    document.getElementById('editActivityId').value = activity.id;
    document.getElementById('activityName').value = activity.name;
    document.getElementById('activityGoal').value = activity.goal || '';
    document.getElementById('activityPlan').value = activity.plan || '';
    document.getElementById('deleteActivityBtn').style.display = 'block';
    renderColorOptions(activity.color);
    document.getElementById('activityModal').classList.add('active');
}

function renderColorOptions(selectedColor = COLORS[0]) {
    const container = document.getElementById('colorOptions');
    container.innerHTML = '';
    
    COLORS.forEach(color => {
        const option = document.createElement('div');
        option.className = `color-option ${color === selectedColor ? 'selected' : ''}`;
        option.style.background = color;
        option.onclick = () => {
            document.querySelectorAll('.color-option').forEach(el => el.classList.remove('selected'));
            option.classList.add('selected');
        };
        container.appendChild(option);
    });
}

function getSelectedColor() {
    const selected = document.querySelector('.color-option.selected');
    return selected ? selected.style.background : COLORS[0];
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Activity Detail Modal
let currentDetailActivityId = null;

function openActivityDetail(activityId) {
    currentDetailActivityId = activityId;
    const activity = scheduleData.activities.find(a => a.id === activityId);
    if (!activity) return;
    
    const progress = getActivityProgress(activityId, currentYear, selectedMonth);
    
    document.getElementById('detailColor').style.background = activity.color;
    document.getElementById('detailName').textContent = activity.name;
    document.getElementById('detailStats').textContent = 
        `${progress.completed} of ${progress.total} days completed this month`;
    
    // Progress ring
    const circumference = 2 * Math.PI * 60;
    const offset = circumference - (progress.percentage / 100) * circumference;
    document.getElementById('progressRing').style.strokeDashoffset = offset;
    document.getElementById('ringPercentage').textContent = progress.percentage + '%';
    
    // Goal and Plan
    document.getElementById('detailGoal').textContent = activity.goal || 'No goal set';
    document.getElementById('detailPlan').textContent = activity.plan || 'No plan set';
    
    // Weekly breakdown
    renderWeeklyBreakdown(activityId);
    
    document.getElementById('activityDetailModal').classList.add('active');
}

function renderWeeklyBreakdown(activityId) {
    const container = document.getElementById('weeklyBreakdown');
    container.innerHTML = '';
    
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const dayDiv = document.createElement('div');
        dayDiv.className = 'week-day';
        
        let status = 'pending';
        if (date.getMonth() === selectedMonth && date.getFullYear() === currentYear) {
            const completed = isDayCompleted(activityId, currentYear, selectedMonth, date.getDate());
            if (date <= today) {
                status = completed ? 'completed' : 'missed';
            }
        }
        
        dayDiv.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-status ${status}"></div>
        `;
        
        container.appendChild(dayDiv);
    }
}

function editActivityFromDetail() {
    closeModal('activityDetailModal');
    const activity = scheduleData.activities.find(a => a.id === currentDetailActivityId);
    if (activity) {
        openEditActivityModal(activity);
    }
}

// ==========================================
// FORM HANDLING
// ==========================================

document.getElementById('activityForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('editActivityId').value;
    const name = document.getElementById('activityName').value.trim();
    const goal = document.getElementById('activityGoal').value.trim();
    const plan = document.getElementById('activityPlan').value.trim();
    const color = getSelectedColor();
    
    if (!name) {
        alert('Please enter an activity name');
        return;
    }
    
    if (id) {
        updateActivity(id, name, goal, plan, color);
    } else {
        addActivity(name, goal, plan, color);
    }
    
    closeModal('activityModal');
    renderAll();
});

// Close modal when clicking outside
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
});

// ==========================================
// INITIALIZATION
// ==========================================

function renderAll() {
    renderYearOverview();
    renderScheduleTable();
    renderStats();
    renderCharts();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Force refresh - clear old data and add new activities
    localStorage.removeItem('scheduleTrackerData');
    scheduleData = getDefaultData();
    
    // 🌙 Night
    addActivity('Sleep (10PM-6AM)', 'Get 8 hours of quality sleep', 'Go to bed by 10 PM, wake up at 6 AM refreshed', '#5f27cd');
    
    // 🌅 Morning Routine
    addActivity('Ready/Talking (6-6:30AM)', 'Start the day right', 'Get ready for ground activity, light conversations', '#ff9f43');
    addActivity('Ground Activity (6:30-8AM)', 'Physical fitness & outdoor time', 'Exercise, walking, or sports activity', '#6bcb77');
    addActivity('Bath/Breakfast (8-9AM)', 'Personal hygiene & nutrition', 'Refresh and fuel up for the day', '#00d9ff');
    
    // 📚 Learning & Work
    addActivity('Studying (9-10:45AM)', 'Knowledge building', 'Focus on learning new skills and concepts', '#4d96ff');
    addActivity('Work (11AM-1PM)', 'Productive work session', 'Complete primary work tasks', '#3498db');
    addActivity('Lunch (1-2PM)', 'Midday nutrition & rest', 'Eat healthy, take a break', '#ffd93d');
    
    // 🚀 Business Process Check
    addActivity('P1 & P2 Process Check (2-4PM)', 'Business review (Not Execution)', 'IT Solutions, Key Manufacturing, Education, AC Company, Fruit Trading, Booking Sales - Understand process → note → close', '#9b59b6');
    addActivity('GF/Family Time (4-5PM)', 'Connect with loved ones', 'Quality time talking with GF and family', '#ff6b6b');
    addActivity('Break (5-5:30PM)', 'Refresh and recharge', 'Short break before evening focus block', '#1abc9c');
    
    // 🔥 Core Focus Block
    addActivity('S1 Working/Studying (5:30-7:30PM)', 'Deep work session', 'Focused work or study - no distractions', '#e74c3c');
    
    // 🍽️ Evening
    addActivity('Dinner (7:30-8:30PM)', 'Evening meal', 'Eat dinner, unwind', '#f39c12');
    addActivity('Relax/Book/Movie (8:30-10PM)', 'Wind down', 'Book reading, relaxing, talking, movie, sleep preparation', '#54a0ff');
    
    renderAll();
});

// Reset to default activities
function resetToDefault() {
    if (confirm('This will delete all your current data and reset to the default schedule. Are you sure?')) {
        localStorage.removeItem('scheduleTrackerData');
        scheduleData = getDefaultData();
        
        // 🌙 Night
        addActivity(' (10PM-6AM)', 'Get 8 hours of quality sleep', 'Go to bed by 10 PM, wake up at 6 AM refreshed', '#5f27cd');
        
        // 🌅 Morning Routine
        addActivity('Ready/Talking (6-6:30AM)', 'Start the day right', 'Get ready for ground activity, light conversations', '#ff9f43');
        addActivity('Ground Activity (6:30-8AM)', 'Physical fitness & outdoor time', 'Exercise, walking, or sports activity', '#6bcb77');
        addActivity('Bath/Breakfast (8-9AM)', 'Personal hygiene & nutrition', 'Refresh and fuel up for the day', '#00d9ff');
        
        // 📚 Learning & Work
        addActivity('Studying (9-10:45AM)', 'Knowledge building', 'Focus on learning new skills and concepts', '#4d96ff');
        addActivity('Work (11AM-1PM)', 'Productive work session', 'Complete primary work tasks', '#3498db');
        addActivity('Lunch (1-2PM)', 'Midday nutrition & rest', 'Eat healthy, take a break', '#ffd93d');
        
        // 🚀 Business Process Check
        addActivity('P1 & P2 Process Check (2-4PM)', 'Business review (Not Execution)', 'IT Solutions, Key Manufacturing, Education, AC Company, Fruit Trading, Booking Sales - Understand process → note → close', '#9b59b6');
        addActivity('GF/Family Time (4-5PM)', 'Connect with loved ones', 'Quality time talking with GF and family', '#ff6b6b');
        addActivity('Break (5-5:30PM)', 'Refresh and recharge', 'Short break before evening focus block', '#1abc9c');
        
        // 🔥 Core Focus Block
        addActivity('S1 Working/Studying (5:30-7:30PM)', 'Deep work session', 'Focused work or study - no distractions', '#e74c3c');
        
        // 🍽️ Evening
        addActivity('Dinner (7:30-8:30PM)', 'Evening meal', 'Eat dinner, unwind', '#f39c12');
        addActivity('Relax/Book/Movie (8:30-10PM)', 'Wind down', 'Book reading, relaxing, talking, movie, sleep preparation', '#54a0ff');
        
        renderAll();
        alert('Schedule reset to your daily plan!');
    }
}

// Make functions globally accessible
window.toggleDay = toggleDay;
window.openAddActivityModal = openAddActivityModal;
window.openActivityDetail = openActivityDetail;
window.closeModal = closeModal;
window.deleteActivity = deleteActivity;
window.editActivityFromDetail = editActivityFromDetail;
window.resetToDefault = resetToDefault;
