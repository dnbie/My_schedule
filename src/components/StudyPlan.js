import React, { useState, useEffect } from 'react';

const StudyPlan = ({ onClose }) => {
    const [activePhase, setActivePhase] = useState(1);
    const [completedTasks, setCompletedTasks] = useState(() => {
        const saved = localStorage.getItem('gcpStudyProgress');
        return saved ? JSON.parse(saved) : {};
    });
    const [expandedWeek, setExpandedWeek] = useState(null);

    // Calculate current week based on start date
    const startDate = new Date('2026-01-19'); // Today's date as start
    const today = new Date();
    const weekNumber = Math.min(12, Math.max(1, Math.ceil((today - startDate) / (7 * 24 * 60 * 60 * 1000))));

    useEffect(() => {
        localStorage.setItem('gcpStudyProgress', JSON.stringify(completedTasks));
    }, [completedTasks]);

    const toggleTask = (taskId) => {
        setCompletedTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const studyPlan = {
        title: "🎯 Google Cloud AI/ML Solutions Engineer",
        target: "Google Cloud - Professional ML Engineer Role",
        duration: "12 Weeks",
        phases: [
            {
                id: 1,
                name: "Phase 1: ML System Design + DSA Light",
                weeks: "Weeks 1-4",
                color: "#4285F4",
                outcome: "You can explain an end-to-end ML solution to a customer",
                weeks_detail: [
                    {
                        week: 1,
                        focus: "ML System Components Basics",
                        tasks: [
                            { id: "w1t1", name: "Study ML system architecture overview", duration: "45min", type: "ml" },
                            { id: "w1t2", name: "Learn about data ingestion pipelines", duration: "45min", type: "ml" },
                            { id: "w1t3", name: "Arrays fundamentals - LeetCode Easy x3", duration: "30min", type: "dsa" },
                            { id: "w1t4", name: "Practice explaining ML concepts to non-technical audience", duration: "30min", type: "soft" },
                            { id: "w1t5", name: "Study feature engineering basics", duration: "45min", type: "ml" },
                            { id: "w1t6", name: "HashMap basics - LeetCode Easy x2", duration: "30min", type: "dsa" },
                            { id: "w1t7", name: "Weekend: Review & document learnings", duration: "1hr", type: "review" },
                        ]
                    },
                    {
                        week: 2,
                        focus: "Recommendation Systems Deep Dive",
                        tasks: [
                            { id: "w2t1", name: "Collaborative filtering concepts", duration: "45min", type: "ml" },
                            { id: "w2t2", name: "Content-based recommendations", duration: "45min", type: "ml" },
                            { id: "w2t3", name: "Two pointers technique - LeetCode x3", duration: "30min", type: "dsa" },
                            { id: "w2t4", name: "Hybrid recommendation systems", duration: "45min", type: "ml" },
                            { id: "w2t5", name: "Real-world rec system case studies", duration: "45min", type: "ml" },
                            { id: "w2t6", name: "Sliding window - LeetCode x2", duration: "30min", type: "dsa" },
                            { id: "w2t7", name: "Weekend: Design a simple rec system on paper", duration: "2hr", type: "project" },
                        ]
                    },
                    {
                        week: 3,
                        focus: "Batch vs Real-time ML",
                        tasks: [
                            { id: "w3t1", name: "Batch processing patterns", duration: "45min", type: "ml" },
                            { id: "w3t2", name: "Real-time/streaming ML concepts", duration: "45min", type: "ml" },
                            { id: "w3t3", name: "Binary search - LeetCode x3", duration: "30min", type: "dsa" },
                            { id: "w3t4", name: "When to use batch vs real-time", duration: "45min", type: "ml" },
                            { id: "w3t5", name: "Lambda architecture overview", duration: "45min", type: "ml" },
                            { id: "w3t6", name: "Stack/Queue basics - LeetCode x2", duration: "30min", type: "dsa" },
                            { id: "w3t7", name: "Weekend: Case study - design batch+realtime system", duration: "2hr", type: "project" },
                        ]
                    },
                    {
                        week: 4,
                        focus: "Monitoring, Drift & Cost Optimization",
                        tasks: [
                            { id: "w4t1", name: "Model monitoring fundamentals", duration: "45min", type: "ml" },
                            { id: "w4t2", name: "Data drift vs concept drift", duration: "45min", type: "ml" },
                            { id: "w4t3", name: "Linked list basics - LeetCode x3", duration: "30min", type: "dsa" },
                            { id: "w4t4", name: "Cost vs accuracy tradeoffs", duration: "45min", type: "ml" },
                            { id: "w4t5", name: "A/B testing for ML models", duration: "45min", type: "ml" },
                            { id: "w4t6", name: "Tree basics - LeetCode x2", duration: "30min", type: "dsa" },
                            { id: "w4t7", name: "Weekend: Phase 1 review + mock customer explanation", duration: "2hr", type: "review" },
                        ]
                    }
                ]
            },
            {
                id: 2,
                name: "Phase 2: Data Pipelines + GCP Core",
                weeks: "Weeks 5-8",
                color: "#FBBC04",
                outcome: "You sound like a Google Cloud advisor, not a student",
                weeks_detail: [
                    {
                        week: 5,
                        focus: "ETL/ELT & Data Warehousing",
                        tasks: [
                            { id: "w5t1", name: "ETL vs ELT deep dive", duration: "45min", type: "gcp" },
                            { id: "w5t2", name: "Data warehouse concepts", duration: "45min", type: "gcp" },
                            { id: "w5t3", name: "BigQuery fundamentals", duration: "1hr", type: "gcp" },
                            { id: "w5t4", name: "Cloud Storage patterns", duration: "45min", type: "gcp" },
                            { id: "w5t5", name: "Data modeling for analytics", duration: "45min", type: "gcp" },
                            { id: "w5t6", name: "DSA review - mixed problems x3", duration: "30min", type: "dsa" },
                            { id: "w5t7", name: "Weekend: Hands-on BigQuery lab", duration: "2hr", type: "project" },
                        ]
                    },
                    {
                        week: 6,
                        focus: "Vertex AI Fundamentals",
                        tasks: [
                            { id: "w6t1", name: "Vertex AI platform overview", duration: "1hr", type: "gcp" },
                            { id: "w6t2", name: "AutoML vs Custom training", duration: "45min", type: "gcp" },
                            { id: "w6t3", name: "Vertex AI Workbench setup", duration: "1hr", type: "gcp" },
                            { id: "w6t4", name: "Model training on Vertex AI", duration: "1hr", type: "gcp" },
                            { id: "w6t5", name: "Vertex AI Pipelines intro", duration: "45min", type: "gcp" },
                            { id: "w6t6", name: "DSA - Graph basics", duration: "30min", type: "dsa" },
                            { id: "w6t7", name: "Weekend: Train a model on Vertex AI", duration: "3hr", type: "project" },
                        ]
                    },
                    {
                        week: 7,
                        focus: "Model Deployment & Serving",
                        tasks: [
                            { id: "w7t1", name: "Vertex AI Model Registry", duration: "45min", type: "gcp" },
                            { id: "w7t2", name: "Online vs Batch predictions", duration: "45min", type: "gcp" },
                            { id: "w7t3", name: "FastAPI basics for ML", duration: "1hr", type: "gcp" },
                            { id: "w7t4", name: "Build FastAPI ML endpoint", duration: "1.5hr", type: "project" },
                            { id: "w7t5", name: "Vertex AI Endpoints deployment", duration: "1hr", type: "gcp" },
                            { id: "w7t6", name: "DSA - Dynamic programming intro", duration: "30min", type: "dsa" },
                            { id: "w7t7", name: "Weekend: Deploy model + create API", duration: "3hr", type: "project" },
                        ]
                    },
                    {
                        week: 8,
                        focus: "MLOps & CI/CD for ML",
                        tasks: [
                            { id: "w8t1", name: "MLOps principles", duration: "45min", type: "gcp" },
                            { id: "w8t2", name: "Vertex AI Feature Store", duration: "1hr", type: "gcp" },
                            { id: "w8t3", name: "Model versioning best practices", duration: "45min", type: "gcp" },
                            { id: "w8t4", name: "CI/CD pipelines for ML", duration: "1hr", type: "gcp" },
                            { id: "w8t5", name: "Monitoring deployed models", duration: "45min", type: "gcp" },
                            { id: "w8t6", name: "DSA review - medium problems", duration: "30min", type: "dsa" },
                            { id: "w8t7", name: "Weekend: Phase 2 review + GCP practice", duration: "2hr", type: "review" },
                        ]
                    }
                ]
            },
            {
                id: 3,
                name: "Phase 3: Project + Interview Readiness",
                weeks: "Weeks 9-12",
                color: "#34A853",
                outcome: "Interview-ready with portfolio project",
                weeks_detail: [
                    {
                        week: 9,
                        focus: "Portfolio Project - Design & Setup",
                        tasks: [
                            { id: "w9t1", name: "Choose project idea (customer-focused)", duration: "1hr", type: "project" },
                            { id: "w9t2", name: "Design system architecture", duration: "1.5hr", type: "project" },
                            { id: "w9t3", name: "Create architecture diagrams", duration: "1hr", type: "project" },
                            { id: "w9t4", name: "Set up GCP project & resources", duration: "1hr", type: "project" },
                            { id: "w9t5", name: "Data pipeline implementation start", duration: "2hr", type: "project" },
                            { id: "w9t6", name: "GCP ML Cert: Study ML fundamentals", duration: "1hr", type: "cert" },
                            { id: "w9t7", name: "Weekend: Continue project development", duration: "3hr", type: "project" },
                        ]
                    },
                    {
                        week: 10,
                        focus: "Portfolio Project - Core Development",
                        tasks: [
                            { id: "w10t1", name: "Model training implementation", duration: "2hr", type: "project" },
                            { id: "w10t2", name: "API development", duration: "1.5hr", type: "project" },
                            { id: "w10t3", name: "Deployment to Vertex AI", duration: "1.5hr", type: "project" },
                            { id: "w10t4", name: "Add monitoring & logging", duration: "1hr", type: "project" },
                            { id: "w10t5", name: "Document customer use case", duration: "1hr", type: "project" },
                            { id: "w10t6", name: "GCP ML Cert: Data engineering section", duration: "1hr", type: "cert" },
                            { id: "w10t7", name: "Weekend: Project polish + testing", duration: "3hr", type: "project" },
                        ]
                    },
                    {
                        week: 11,
                        focus: "Interview Prep - System Design",
                        tasks: [
                            { id: "w11t1", name: "ML system design patterns review", duration: "1hr", type: "interview" },
                            { id: "w11t2", name: "Practice: Design YouTube recommendation", duration: "1hr", type: "interview" },
                            { id: "w11t3", name: "Practice: Design fraud detection system", duration: "1hr", type: "interview" },
                            { id: "w11t4", name: "Customer scenario practice", duration: "1hr", type: "interview" },
                            { id: "w11t5", name: "Refine project presentation", duration: "1hr", type: "project" },
                            { id: "w11t6", name: "GCP ML Cert: Model deployment section", duration: "1hr", type: "cert" },
                            { id: "w11t7", name: "Weekend: Mock interview #1", duration: "2hr", type: "interview" },
                        ]
                    },
                    {
                        week: 12,
                        focus: "Final Interview Prep & Certification",
                        tasks: [
                            { id: "w12t1", name: "Behavioral interview prep (STAR method)", duration: "1hr", type: "interview" },
                            { id: "w12t2", name: "\"Why Google?\" story refinement", duration: "30min", type: "interview" },
                            { id: "w12t3", name: "Technical deep-dive practice", duration: "1.5hr", type: "interview" },
                            { id: "w12t4", name: "Customer communication scenarios", duration: "1hr", type: "interview" },
                            { id: "w12t5", name: "GCP ML Cert: Practice exam", duration: "2hr", type: "cert" },
                            { id: "w12t6", name: "Final project demo preparation", duration: "1hr", type: "project" },
                            { id: "w12t7", name: "Weekend: Mock interview #2 + final review", duration: "3hr", type: "interview" },
                        ]
                    }
                ]
            }
        ],
        certification: {
            name: "Google Cloud Professional ML Engineer",
            prepTime: "6-8 weeks (parallel with study plan)",
            topics: [
                "ML Systems & Architecture",
                "Data Pipelines & Processing",
                "Model Training & Deployment",
                "Monitoring & Maintenance"
            ]
        }
    };

    const getTaskTypeColor = (type) => {
        const colors = {
            ml: '#4285F4',
            dsa: '#34A853',
            gcp: '#FBBC04',
            project: '#9C27B0',
            review: '#00BCD4',
            soft: '#FF9800',
            cert: '#EA4335',
            interview: '#E91E63'
        };
        return colors[type] || '#666';
    };

    const getTaskTypeLabel = (type) => {
        const labels = {
            ml: '🧠 ML',
            dsa: '💻 DSA',
            gcp: '☁️ GCP',
            project: '🔧 Project',
            review: '📝 Review',
            soft: '🗣️ Soft Skills',
            cert: '📜 Cert',
            interview: '🎤 Interview'
        };
        return labels[type] || type;
    };

    const calculatePhaseProgress = (phase) => {
        const allTasks = phase.weeks_detail.flatMap(w => w.tasks);
        const completed = allTasks.filter(t => completedTasks[t.id]).length;
        return Math.round((completed / allTasks.length) * 100);
    };

    const calculateWeekProgress = (week) => {
        const completed = week.tasks.filter(t => completedTasks[t.id]).length;
        return Math.round((completed / week.tasks.length) * 100);
    };

    const calculateOverallProgress = () => {
        const allTasks = studyPlan.phases.flatMap(p => p.weeks_detail.flatMap(w => w.tasks));
        const completed = allTasks.filter(t => completedTasks[t.id]).length;
        return Math.round((completed / allTasks.length) * 100);
    };

    return (
        <div className="study-plan-overlay">
            <div className="study-plan-container">
                <div className="study-plan-header">
                    <div className="header-content">
                        <h1>{studyPlan.title}</h1>
                        <p className="target">🎯 Target: {studyPlan.target}</p>
                        <p className="duration">📅 Duration: {studyPlan.duration} | Currently Week {weekNumber}</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                {/* Overall Progress */}
                <div className="overall-progress">
                    <div className="progress-header">
                        <span>Overall Progress</span>
                        <span>{calculateOverallProgress()}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div 
                            className="progress-bar" 
                            style={{ width: `${calculateOverallProgress()}%`, background: 'linear-gradient(90deg, #4285F4, #34A853, #FBBC04, #EA4335)' }}
                        />
                    </div>
                </div>

                {/* Phase Tabs */}
                <div className="phase-tabs">
                    {studyPlan.phases.map(phase => (
                        <button
                            key={phase.id}
                            className={`phase-tab ${activePhase === phase.id ? 'active' : ''}`}
                            onClick={() => setActivePhase(phase.id)}
                            style={{ borderColor: activePhase === phase.id ? phase.color : 'transparent' }}
                        >
                            <span className="phase-name">{phase.name}</span>
                            <span className="phase-weeks">{phase.weeks}</span>
                            <div className="phase-progress-mini">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${calculatePhaseProgress(phase)}%`, backgroundColor: phase.color }}
                                />
                            </div>
                        </button>
                    ))}
                </div>

                {/* Active Phase Content */}
                {studyPlan.phases.filter(p => p.id === activePhase).map(phase => (
                    <div key={phase.id} className="phase-content">
                        <div className="phase-outcome" style={{ borderLeftColor: phase.color }}>
                            <strong>🎯 Outcome:</strong> {phase.outcome}
                        </div>

                        <div className="weeks-grid">
                            {phase.weeks_detail.map(week => (
                                <div 
                                    key={week.week} 
                                    className={`week-card ${expandedWeek === week.week ? 'expanded' : ''} ${week.week === weekNumber ? 'current-week' : ''}`}
                                >
                                    <div 
                                        className="week-header"
                                        onClick={() => setExpandedWeek(expandedWeek === week.week ? null : week.week)}
                                    >
                                        <div className="week-info">
                                            <h3>Week {week.week} {week.week === weekNumber && <span className="current-badge">← Current</span>}</h3>
                                            <p>{week.focus}</p>
                                        </div>
                                        <div className="week-progress">
                                            <span>{calculateWeekProgress(week)}%</span>
                                            <span className="expand-icon">{expandedWeek === week.week ? '▲' : '▼'}</span>
                                        </div>
                                    </div>

                                    {expandedWeek === week.week && (
                                        <div className="week-tasks">
                                            {week.tasks.map(task => (
                                                <div 
                                                    key={task.id} 
                                                    className={`task-item ${completedTasks[task.id] ? 'completed' : ''}`}
                                                    onClick={() => toggleTask(task.id)}
                                                >
                                                    <div className="task-checkbox">
                                                        {completedTasks[task.id] ? '✓' : ''}
                                                    </div>
                                                    <div className="task-content">
                                                        <span className="task-name">{task.name}</span>
                                                        <div className="task-meta">
                                                            <span 
                                                                className="task-type"
                                                                style={{ backgroundColor: getTaskTypeColor(task.type) }}
                                                            >
                                                                {getTaskTypeLabel(task.type)}
                                                            </span>
                                                            <span className="task-duration">⏱️ {task.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Certification Track */}
                <div className="certification-section">
                    <h2>📜 Certification Track</h2>
                    <div className="cert-card">
                        <h3>{studyPlan.certification.name}</h3>
                        <p>⏱️ {studyPlan.certification.prepTime}</p>
                        <div className="cert-topics">
                            {studyPlan.certification.topics.map((topic, idx) => (
                                <span key={idx} className="cert-topic">{topic}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="task-legend">
                    <h4>Task Types:</h4>
                    <div className="legend-items">
                        {Object.entries({ml: 'ML System Design', dsa: 'DSA Practice', gcp: 'GCP/Cloud', project: 'Project Work', interview: 'Interview Prep', cert: 'Certification'}).map(([type, label]) => (
                            <span key={type} className="legend-item">
                                <span className="legend-color" style={{ backgroundColor: getTaskTypeColor(type) }}></span>
                                {label}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudyPlan;
