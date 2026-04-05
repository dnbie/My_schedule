// Default activities for the schedule
export const DEFAULT_ACTIVITIES = [
    // 🌙 Night
    { name: 'Sleepy (10PM-6AM)', goal: 'Get 8 hours of quality sleep', plan: 'Go to bed by 10 PM, wake up at 6 AM refreshed', color: '#5f27cd' },
    
    // 🌅 Morning Routine
    { name: 'Ready/Talking (6-6:30AM)', goal: 'Start the day right', plan: 'Get ready for ground activity, light conversations', color: '#ff9f43' },
    { name: 'Ground Activity (6:30-8AM)', goal: 'Physical fitness & outdoor time', plan: 'Exercise, walking, or sports activity', color: '#6bcb77' },
    { name: 'Bath/Breakfast (8-9AM)', goal: 'Personal hygiene & nutrition', plan: 'Refresh and fuel up for the day', color: '#00d9ff' },
    
    // 📚 Learning & Work
    { name: 'Studying (9-10:45AM)', goal: 'Knowledge building', plan: 'Focus on learning new skills and concepts', color: '#4d96ff' },
    { name: 'Work (11AM-1PM)', goal: 'Productive work session', plan: 'Complete primary work tasks', color: '#3498db' },
    { name: 'Lunch (1-2PM)', goal: 'Midday nutrition & rest', plan: 'Eat healthy, take a break', color: '#ffd93d' },
    
    // 🚀 Business Process Check
    { name: 'P1 & P2 Process Check (2-4PM)', goal: 'Business review (Not Execution)', plan: 'IT Solutions, Key Manufacturing, Education, AC Company, Fruit Trading, Booking Sales - Understand process → note → close', color: '#9b59b6' },
    { name: 'GF/Family Time (4-5PM)', goal: 'Connect with loved ones', plan: 'Quality time talking with GF and family', color: '#ff6b6b' },
    { name: 'Break (5-5:30PM)', goal: 'Refresh and recharge', plan: 'Short break before evening focus block', color: '#1abc9c' },
    
    // 🔥 Core Focus Block
    { name: 'S1 Working/Studying (5:30-7:30PM)', goal: 'Deep work session', plan: 'Focused work or study - no distractions', color: '#e74c3c' },
    
    // 🍽️ Evening
    { name: 'Dinner (7:30-8:30PM)', goal: 'Evening meal', plan: 'Eat dinner, unwind', color: '#f39c12' },
    { name: 'Relax/Book/Movie (8:30-10PM)', goal: 'Wind down', plan: 'Book reading, relaxing, talking, movie, sleep preparation', color: '#54a0ff' },
    
    // 🎯 GOOGLE CLOUD ML STUDY PLAN (12 Weeks)
    // Phase 1: Weeks 1-4 - ML System Design + DSA Light
    { name: '🧠 ML System Design (45min)', goal: 'Master ML system components for customer solutions', plan: 'Week 1-4: ML system components, Recommendation systems, Batch vs real-time ML, Monitoring & drift, Cost vs accuracy tradeoffs. Practice explaining to customers.', color: '#4285F4' },
    { name: '💻 DSA Practice (30-45min)', goal: 'Build DSA fundamentals in parallel', plan: 'Daily practice: Arrays, HashMap basics. Use LeetCode Easy problems. Not hardcore - just fundamentals to support interviews.', color: '#34A853' },
    
    // Phase 2: Weeks 5-8 - Data Pipelines + GCP Core
    { name: '☁️ GCP Data Pipelines (45min)', goal: 'Master data engineering on GCP', plan: 'Week 5-8: ETL vs ELT concepts, Data warehousing, BigQuery deep dive, Cloud Storage patterns. Sound like a Google Cloud advisor.', color: '#FBBC04' },
    { name: '🚀 Vertex AI Study (45min)', goal: 'Learn Google\'s ML platform end-to-end', plan: 'Week 5-8: Vertex AI training, Model deployment, FastAPI for ML inference, AutoML vs custom training. Hands-on labs.', color: '#EA4335' },
    
    // Phase 3: Weeks 9-12 - Project + Interview Readiness
    { name: '🔧 ML Project Work (1hr)', goal: 'Build interview-ready portfolio project', plan: 'Week 9-12: One strong cloud-style ML project with architecture diagrams, customer-facing explanations. Deploy on GCP.', color: '#9C27B0' },
    { name: '🎤 Mock Interviews (45min)', goal: 'Practice customer-focused ML explanations', plan: 'Week 9-12: System design mocks, Customer scenario practice, "How would you solve this on GCP?" practice sessions.', color: '#00BCD4' },
    
    // Certification Track
    { name: '📜 GCP ML Engineer Cert (1hr)', goal: 'Prepare for Professional ML Engineer certification', plan: 'Study alongside main plan (6-8 weeks): ML systems, Data pipelines, Model deployment, Monitoring. THE key certification for this role.', color: '#FF5722' },
];

export const COLORS = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6',
    '#1abc9c', '#e74c3c', '#3498db', '#f39c12', '#00d9ff',
    '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
];

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
};

export const generateId = () => {
    return 'activity_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};
