import React, { useState, useEffect } from 'react';

const GroundActivityPlan = ({ onClose, initialTab = 'training' }) => {
    const [activePhase, setActivePhase] = useState(1);
    const [activeDay, setActiveDay] = useState('Monday');
    const [activeTab, setActiveTab] = useState(initialTab);
    const [isEditing, setIsEditing] = useState(false);

    // Load custom meal plan from localStorage or use defaults
    const defaultMealPlan = {
        Monday: {
            preMorning: 'Banana (1)',
            breakfast: '4 egg whites + 2 whole eggs + 2 rotis + Apple',
            lunch: 'Rice + Dal + Veg + Curd',
            preEvening: 'Banana (1 small)',
            postWorkout: 'Whey + water',
            dinner: 'Paneer (150 g) + Veg'
        },
        Tuesday: {
            preMorning: 'Dates (2–3)',
            breakfast: 'Paneer (150 g) + 2 rotis + Papaya',
            lunch: 'Rice + Chicken (150 g) + Veg',
            preEvening: 'Banana (1 small)',
            postWorkout: 'Whey + banana',
            dinner: 'Dal + Veg'
        },
        Wednesday: {
            preMorning: 'Banana (1)',
            breakfast: '4 egg whites + 2 eggs + Idli/Dosa + Apple',
            lunch: 'Rice + Rajma/Chole + Veg',
            preEvening: 'Dates (2)',
            postWorkout: 'Whey + water',
            dinner: 'Chicken (150 g) + Veg'
        },
        Thursday: {
            preMorning: '— (Rest Day)',
            breakfast: 'Paneer (150 g) + 2 rotis + Papaya',
            lunch: 'Rice + Dal + Veg + Curd',
            preEvening: '—',
            postWorkout: '—',
            dinner: 'Light: Soup + Veg'
        },
        Friday: {
            preMorning: 'Banana (1)',
            breakfast: '4 egg whites + 2 eggs + 2 rotis + Apple',
            lunch: 'Rice + Chicken (150 g) + Veg',
            preEvening: 'Banana (1 small)',
            postWorkout: 'Whey + water',
            dinner: 'Paneer (150 g) + Veg'
        },
        Saturday: {
            preMorning: 'Dates (2–3)',
            breakfast: 'Paneer (150 g) + Poha/Upma + Papaya',
            lunch: 'Rice + Dal + Veg',
            preEvening: 'Banana (1 small)',
            postWorkout: 'Whey + banana',
            dinner: 'Dal + Veg'
        },
        Sunday: {
            preMorning: '— (Rest Day)',
            breakfast: 'Eggs or Paneer + Apple',
            lunch: 'Rice + Veg + Curd',
            preEvening: '—',
            postWorkout: '—',
            dinner: 'Light dinner (no heavy carbs)'
        }
    };

    const [mealPlan, setMealPlan] = useState(() => {
        const saved = localStorage.getItem('custom_meal_plan');
        return saved ? JSON.parse(saved) : defaultMealPlan;
    });

    const [customTrainingNotes, setCustomTrainingNotes] = useState(() => {
        const saved = localStorage.getItem('custom_training_notes');
        return saved ? JSON.parse(saved) : { phase1: '', phase2: '', phase3: '' };
    });

    // Update tab when initialTab prop changes
    useEffect(() => {
        setActiveTab(initialTab);
    }, [initialTab]);

    const handleMealEdit = (day, mealType, value) => {
        const updated = {
            ...mealPlan,
            [day]: { ...mealPlan[day], [mealType]: value }
        };
        setMealPlan(updated);
        localStorage.setItem('custom_meal_plan', JSON.stringify(updated));
    };

    const handleTrainingNotesEdit = (phase, value) => {
        const updated = { ...customTrainingNotes, [`phase${phase}`]: value };
        setCustomTrainingNotes(updated);
        localStorage.setItem('custom_training_notes', JSON.stringify(updated));
    };

    const resetMealPlan = () => {
        setMealPlan(defaultMealPlan);
        localStorage.removeItem('custom_meal_plan');
    };

    const resetTrainingNotes = () => {
        setCustomTrainingNotes({ phase1: '', phase2: '', phase3: '' });
        localStorage.removeItem('custom_training_notes');
    };

    const proteinSwaps = ['Eggs', 'Paneer', 'Chicken', 'Dal / Rajma'];
    const carbSwaps = ['Rice', 'Roti', 'Idli', 'Dosa', 'Poha', 'Upma'];
    
    const dailyAddons = [
        { icon: '💧', item: 'Water: 3–4 L' },
        { icon: '🥜', item: 'Nuts: 5–6 almonds (any time)' },
        { icon: '🧂', item: 'Salt: small amount for electrolytes' }
    ];

    const strictlyAvoid = [
        'Junk food',
        'Sugary drinks',
        'Alcohol',
        'Late-night heavy meals'
    ];

    const mealPlanBenefits = [
        'Maintains 72–74 kg',
        'Fuels sprint sessions',
        'Improves recovery',
        'Reduces injury risk'
    ];

    const cookedVegetables = [
        'Carrot', 'Beans', 'Cabbage', 'Cauliflower', 'Beetroot',
        'Bottle gourd (sorakkai)', 'Ridge gourd (peerkangai)', 'Snake gourd',
        'Pumpkin', 'Spinach (palak)', 'Drumstick (murungakkai)'
    ];

    const rawVegetables = [
        'Cucumber', 'Tomato', 'Onion', 'Lettuce', 'Capsicum'
    ];

    const vegPortions = [
        { meal: 'Lunch', amount: '1 bowl' },
        { meal: 'Dinner', amount: '1 bowl' }
    ];

    const limitVegetables = [
        { item: 'Potato', note: 'count as carb, not veg' },
        { item: 'Brinjal (eggplant)', note: 'occasional' },
        { item: 'Fried vegetables', note: 'avoid' }
    ];

    const phase1Weekly = [
        { day: 'Monday', morning: 'Acceleration mechanics', evening: 'Lower-body strength' },
        { day: 'Tuesday', morning: 'Tempo runs + mobility', evening: 'Core + stretch' },
        { day: 'Wednesday', morning: 'Hill acceleration', evening: 'Posterior chain' },
        { day: 'Thursday', morning: 'REST', evening: 'Mobility only' },
        { day: 'Friday', morning: 'Technique + strides', evening: 'Light strength' },
        { day: 'Saturday', morning: 'Drills + tempo', evening: 'Rehab & stretch' },
        { day: 'Sunday', morning: 'FULL REST', evening: '—' }
    ];

    const phase2Weekly = [
        { day: 'Monday', morning: 'Acceleration', evening: 'Strength' },
        { day: 'Tuesday', morning: 'Tempo + mobility', evening: 'Core' },
        { day: 'Wednesday', morning: 'Max velocity', evening: 'Explosive lifts' },
        { day: 'Thursday', morning: 'REST', evening: 'Rehab' },
        { day: 'Friday', morning: 'Speed endurance', evening: 'Light strength' },
        { day: 'Saturday', morning: 'Drills + strides', evening: 'Stretch' },
        { day: 'Sunday', morning: 'FULL REST', evening: '—' }
    ];

    const phase3Weekly = [
        { day: 'Monday', morning: 'Acceleration', evening: 'Strength' },
        { day: 'Tuesday', morning: 'Tempo + mobility', evening: 'Core' },
        { day: 'Wednesday', morning: 'Max velocity', evening: 'Explosive gym' },
        { day: 'Thursday', morning: 'REST', evening: 'Rehab' },
        { day: 'Friday', morning: 'Speed endurance', evening: 'Light strength' },
        { day: 'Saturday', morning: 'Drills + strides', evening: 'Mobility' },
        { day: 'Sunday', morning: 'FULL REST', evening: '—' }
    ];

    const phase1Daily = {
        Monday: {
            title: 'Acceleration Base',
            morning: [
                'Warm-up (20–25 min)',
                'Wall drills: 3×20 sec',
                'Falling starts: 6×10 m (70–80%)',
                '3-point starts: 4×20 m'
            ],
            evening: [
                'Back squat: 4×6',
                'Walking lunges: 3×10/leg',
                'Standing calf raises: 3×15',
                'Plank: 3×40 sec'
            ]
        },
        Tuesday: {
            title: 'Tempo & Recovery',
            morning: [
                'Tempo runs: 8×100 m @ ~60%',
                'Walk-back recovery'
            ],
            evening: [
                'Core circuit (15 min)',
                'Hip, hamstring, ankle mobility'
            ]
        },
        Wednesday: {
            title: 'Hill Power',
            morning: [
                'Hill sprints (5–7% incline)',
                '8×20 m @ ~75%',
                'Uphill marching drills'
            ],
            evening: [
                'Romanian deadlift: 4×6',
                'Hip thrusts: 3×8',
                'Nordic curls (assisted): 2×5',
                'Side plank: 2×30 sec'
            ]
        },
        Thursday: {
            title: 'REST DAY',
            morning: [
                'Light walk',
                'Stretching',
                'Foam rolling'
            ],
            evening: []
        },
        Friday: {
            title: 'Technique Day',
            morning: [
                'A-march → A-skip drills',
                'Strides: 6×60 m @ 65–70%'
            ],
            evening: [
                'Goblet squat: 3×10',
                'Step-ups: 3×8/leg',
                'Core stability'
            ]
        },
        Saturday: {
            title: 'Movement Quality',
            morning: [
                'Drill circuit (A/B skips, bounds)',
                'Tempo: 6×120 m @ 60%'
            ],
            evening: [
                'Long stretching (20 min)',
                'Foam rolling'
            ]
        },
        Sunday: {
            title: 'FULL REST',
            morning: ['Complete rest - recovery day'],
            evening: []
        }
    };

    const phase2Daily = {
        Monday: {
            title: 'Acceleration (0–30 m)',
            morning: [
                'Block / 3-point starts: 6×20 m',
                'Sprints: 4×30 m @ 90%'
            ],
            evening: [
                'Squat: 4×4 (heavier)',
                'Lunges: 3×8',
                'Calf raises: 3×15'
            ]
        },
        Tuesday: {
            title: 'Tempo',
            morning: [
                'Tempo: 8×120 m @ 60%'
            ],
            evening: [
                'Core + mobility'
            ]
        },
        Wednesday: {
            title: 'Max Velocity',
            morning: [
                'Flying 20 m: 4 reps',
                'Build-up runs (30 m entry)'
            ],
            evening: [
                'Hip thrusts: 4×5',
                'Box jumps: 3×5',
                'Nordic curls: 2×5'
            ]
        },
        Thursday: {
            title: 'REST DAY',
            morning: [
                'No running',
                'Mobility + massage'
            ],
            evening: []
        },
        Friday: {
            title: 'Speed Endurance',
            morning: [
                '3×60 m @ 90%',
                '2×80 m @ 85–90%'
            ],
            evening: [
                'Light gym (reduced volume)'
            ]
        },
        Saturday: {
            title: 'Technical Relaxation',
            morning: [
                'Drills + relaxed strides'
            ],
            evening: [
                'Stretch & recovery'
            ]
        },
        Sunday: {
            title: 'FULL REST',
            morning: ['Complete rest - recovery day'],
            evening: []
        }
    };

    const phase3Daily = {
        Monday: {
            title: 'Acceleration',
            morning: [
                'Starts: 4 × 30 m',
                'Full recovery (3–4 min)'
            ],
            evening: [
                'Squat (moderate-heavy): 3×3',
                'Lunges: 2×6/leg',
                'Calf raises: 3×12',
                'Core (plank variations)'
            ]
        },
        Tuesday: {
            title: 'Tempo & Mobility',
            morning: [
                'Tempo: 6–8 × 120 m @ 60%'
            ],
            evening: [
                'Core circuit (15 min)',
                'Hip, hamstring, ankle mobility'
            ]
        },
        Wednesday: {
            title: 'Max Velocity',
            morning: [
                'Flying 30 m × 3 reps',
                'Build-up: 30–40 m',
                'Full rest (4–6 min)'
            ],
            evening: [
                'Hip thrust: 3×3',
                'Box jumps: 3×3',
                'Nordic curls: 2×4'
            ]
        },
        Thursday: {
            title: 'REST DAY',
            morning: [
                'No running',
                'Rehab only (foam roll, stretch)'
            ],
            evening: []
        },
        Friday: {
            title: 'Speed Endurance',
            morning: [
                'Speed endurance: 2 × 80 m @ 95%',
                'Full rest (6–8 min)'
            ],
            evening: [
                'Light gym (reduced volume)',
                'Activation + mobility'
            ]
        },
        Saturday: {
            title: 'Relaxation & Rhythm',
            morning: [
                'Sprint drills (A/B skips)',
                'Strides: 4–6 × 60 m @ 65–70%'
            ],
            evening: [
                'Long stretching',
                'Breathing & relaxation work'
            ]
        },
        Sunday: {
            title: 'FULL REST',
            morning: ['Complete rest - recovery day'],
            evening: []
        }
    };

    const phase1Progression = [
        { 
            week: 'Week 1', 
            title: 'LEARN & ADAPT',
            color: '#00ff88',
            emoji: '🟢',
            intensity: '60–70%',
            changes: [
                'Fewer reps',
                'Focus: posture, balance, rhythm',
                'Body may feel awkward → normal'
            ]
        },
        { 
            week: 'Week 2', 
            title: 'CONTROL & CONFIDENCE',
            color: '#ffd93d',
            emoji: '🟡',
            intensity: '65–75%',
            changes: [
                '+1 rep per drill',
                'Better arm drive & foot placement',
                'Less soreness'
            ]
        },
        { 
            week: 'Week 3', 
            title: 'STABILITY & STRENGTH',
            color: '#ff9f43',
            emoji: '🟠',
            intensity: '70–80%',
            changes: [
                'Slightly faster starts',
                'Better stiffness in ankles & calves',
                'Still NO max speed'
            ]
        },
        { 
            week: 'Week 4', 
            title: 'POLISH & PREPARE',
            color: '#4d96ff',
            emoji: '🔵',
            intensity: '75–80%',
            changes: [
                'Reduce volume slightly',
                'Best technique',
                'Finish Phase 1 fresh, not tired'
            ]
        }
    ];

    const phase1DontChange = [
        'No spikes',
        'No max velocity',
        'No extra sprint days',
        'No heavy ego lifting'
    ];

    const phase1WhyWorks = [
        'Tendons adapt slowly',
        'Nervous system learns through repetition',
        'Changing exercises too often = injury risk',
        'Elite programs repeat basics for years'
    ];

    const phase2Progression = [
        { 
            week: 'Week 5', 
            title: 'INTRODUCTION',
            color: '#00ff88',
            emoji: '🟢',
            intensity: '80–85%',
            changes: [
                'Fewer reps',
                'First timing sessions',
                'Spikes: ❌ (optional only on 1 session)'
            ]
        },
        { 
            week: 'Week 6', 
            title: 'CONFIDENCE',
            color: '#ffd93d',
            emoji: '🟡',
            intensity: '85–90%',
            changes: [
                '+1 rep on sprints',
                'Flying runs feel smoother',
                'Spikes: ✅ once/week'
            ]
        },
        { 
            week: 'Week 7', 
            title: 'SPEED EXPRESSION',
            color: '#ff9f43',
            emoji: '🟠',
            intensity: '90–95%',
            changes: [
                'Longer fly zone (30 m)',
                'Starts feel aggressive',
                'Volume controlled'
            ]
        },
        { 
            week: 'Week 8', 
            title: 'QUALITY OVER QUANTITY',
            color: '#4d96ff',
            emoji: '🔵',
            intensity: '90–95%',
            changes: [
                'Reduce total reps',
                'Fastest, cleanest runs',
                'Finish Phase 2 fresh'
            ]
        }
    ];

    const phase2DontChange = [
        'No daily max speed',
        'No extra sprint days',
        'No long runs',
        'No training on pain'
    ];

    const phase2WhyWorks = [
        'Nervous system needs repeated exposure',
        'Speed improves through confidence, not exhaustion',
        'Elite sprinters repeat the same menu weekly'
    ];

    const phase2EndTarget = [
        '100 m: ~11.2 – 11.6 sec',
        'Strong acceleration & visible top speed',
        'Body handles speed safely'
    ];

    const phase3Progression = [
        { 
            week: 'Week 9', 
            title: 'INTRODUCTION',
            color: '#00ff88',
            emoji: '🟢',
            intensity: '90–92%',
            changes: [
                'Conservative timing',
                'Learn rhythm',
                'Build confidence at speed'
            ]
        },
        { 
            week: 'Week 10', 
            title: 'CONFIDENCE',
            color: '#ffd93d',
            emoji: '🟡',
            intensity: '92–95%',
            changes: [
                'Faster flying runs',
                'Better relaxation',
                'Improved race feel'
            ]
        },
        { 
            week: 'Week 11', 
            title: 'PERFORMANCE',
            color: '#ff9f43',
            emoji: '🟠',
            intensity: '95–98%',
            changes: [
                'Best sprint times',
                'Very controlled volume',
                'Peak expression'
            ]
        },
        { 
            week: 'Week 12', 
            title: 'SHARP & FRESH',
            color: '#4d96ff',
            emoji: '🔵',
            intensity: '95–98%',
            changes: [
                'Reduce reps',
                'Fastest, cleanest runs',
                'Finish feeling hungry, not tired'
            ]
        }
    ];

    const phase3DontChange = [
        'No daily max speed',
        'No extra sprint days',
        'No long runs',
        'No training on pain'
    ];

    const phase3WhyWorks = [
        'Nervous system needs repeated exposure',
        'Speed improves through confidence, not exhaustion',
        'Elite sprinters repeat the same menu weekly'
    ];

    const phase3CoreRule = [
        'All 4 weeks = SAME exercises',
        'Progress by speed, timing, relaxation',
        'No new sprint types',
        'No extra volume',
        'No fatigue chasing'
    ];

    const phase3InjuryPrevention = [
        { item: 'Nordic curls: 2×/week', icon: '🦵' },
        { item: 'Single-leg balance drills', icon: '🦶' },
        { item: 'Ankle mobility: daily', icon: '🔄' },
        { item: 'Ice if tightness > 24 hrs', icon: '🧊' },
        { item: 'Sleep: 8+ hours', icon: '😴' }
    ];

    const phase3Nutrition = [
        { item: 'Protein: 130–150 g/day', icon: '🥩' },
        { item: 'Carbs around training', icon: '🍚' },
        { item: 'Hydration: 3–4 L/day', icon: '💧' },
        { item: 'Creatine: 5 g/day (optional)', icon: '💊' }
    ];

    const phase3ExpectedResults = [
        { timeline: 'Day 60', expected: '~11.8 – 12.0 sec' },
        { timeline: 'Day 90', expected: '11.4 – 11.7 sec' },
        { timeline: 'Future', expected: '10.8 → 10.5 → elite pathway' }
    ];

    const getCurrentWeekly = () => {
        if (activePhase === 1) return phase1Weekly;
        if (activePhase === 2) return phase2Weekly;
        return phase3Weekly;
    };

    const getCurrentDaily = () => {
        if (activePhase === 1) return phase1Daily;
        if (activePhase === 2) return phase2Daily;
        return phase3Daily;
    };

    const getCurrentProgression = () => {
        if (activePhase === 1) return phase1Progression;
        if (activePhase === 2) return phase2Progression;
        return phase3Progression;
    };

    const currentWeekly = getCurrentWeekly();
    const currentDaily = getCurrentDaily();
    const currentProgression = getCurrentProgression();

    return (
        <div className="training-plan-overlay">
            <div className="training-plan-container">
                <button className="close-plan-btn" onClick={onClose}>✕</button>
                
                <header className="plan-header">
                    <h1>🏃 Sprint Training Program</h1>
                    <p className="subtitle">Ground Activity - Complete Training Plan</p>
                    <button 
                        className={`edit-plan-btn ${isEditing ? 'editing' : ''}`}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? '✓ Done Editing' : '✏️ Edit'}
                    </button>
                </header>

                {/* Main Tabs: Training vs Nutrition */}
                <div className="main-tabs">
                    <button 
                        className={`main-tab ${activeTab === 'training' ? 'active' : ''}`}
                        onClick={() => setActiveTab('training')}
                    >
                        🏋️ Training Plan
                    </button>
                    <button 
                        className={`main-tab ${activeTab === 'nutrition' ? 'active' : ''}`}
                        onClick={() => setActiveTab('nutrition')}
                    >
                        🍽️ Meal Plan
                    </button>
                </div>

                {activeTab === 'nutrition' ? (
                    /* NUTRITION TAB CONTENT */
                    <div className="nutrition-tab-content">
                        <h2 className="meal-plan-title">🍽️ Complete Weekly Meal Plan</h2>
                        <p className="meal-plan-subtitle">Sprinter Diet – No Fish, No Oats</p>

                        {isEditing && (
                            <div className="edit-toolbar">
                                <span className="edit-hint">✏️ Click any meal to edit it</span>
                                <button className="reset-btn" onClick={resetMealPlan}>🔄 Reset Meals to Default</button>
                            </div>
                        )}

                        {/* Day Selector for Meals */}
                        <div className="meal-day-selector">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                <button
                                    key={day}
                                    className={`meal-day-btn ${activeDay === day ? 'active' : ''}`}
                                    onClick={() => setActiveDay(day)}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>

                        {/* Daily Meal Card */}
                        <div className="daily-meal-card">
                            <h3>{activeDay}'s Meals</h3>
                            <div className="meal-grid">
                                {[
                                    { key: 'preMorning', label: '🌅 Pre-Morning Workout', cls: 'pre-morning' },
                                    { key: 'breakfast', label: '☀️ Breakfast (Post-Workout)', cls: 'breakfast' },
                                    { key: 'lunch', label: '🌞 Lunch', cls: 'lunch' },
                                    { key: 'preEvening', label: '🌤️ Pre-Evening Workout', cls: 'pre-evening' },
                                    { key: 'postWorkout', label: '💪 Post-Workout', cls: 'post-workout' },
                                    { key: 'dinner', label: '🌙 Dinner', cls: 'dinner' },
                                ].map(meal => (
                                    <div key={meal.key} className={`meal-item ${meal.cls} ${isEditing ? 'editable' : ''}`}>
                                        <span className="meal-time">{meal.label}</span>
                                        {isEditing ? (
                                            <input
                                                className="meal-edit-input"
                                                value={mealPlan[activeDay][meal.key]}
                                                onChange={(e) => handleMealEdit(activeDay, meal.key, e.target.value)}
                                            />
                                        ) : (
                                            <span className="meal-content">{mealPlan[activeDay][meal.key]}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alternatives */}
                        <section className="alternatives-section">
                            <h2>🔁 Alternatives (Use If Bored)</h2>
                            <div className="alternatives-grid">
                                <div className="alternative-box">
                                    <h4>Protein Swaps</h4>
                                    <div className="swap-items">
                                        {proteinSwaps.map((item, i) => (
                                            <span key={i} className="swap-item">{item}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="alternative-box">
                                    <h4>Carb Swaps</h4>
                                    <div className="swap-items">
                                        {carbSwaps.map((item, i) => (
                                            <span key={i} className="swap-item">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Daily Add-ons */}
                        <section className="daily-addons-section">
                            <h2>💧 Daily Add-Ons (Every Day)</h2>
                            <div className="addons-list">
                                {dailyAddons.map((item, i) => (
                                    <div key={i} className="addon-item">
                                        <span className="addon-icon">{item.icon}</span>
                                        <span>{item.item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Vegetables Guide */}
                        <section className="vegetables-section">
                            <h2>🥬 Vegetables You Should Eat (Sprinter-Friendly)</h2>
                            
                            <div className="veg-categories">
                                <div className="veg-category cooked">
                                    <h4>🟢 Cooked Vegetables</h4>
                                    <div className="veg-items">
                                        {cookedVegetables.map((veg, i) => (
                                            <span key={i} className="veg-item">{veg}</span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="veg-category raw">
                                    <h4>🟡 Raw / Salad Vegetables</h4>
                                    <div className="veg-items">
                                        {rawVegetables.map((veg, i) => (
                                            <span key={i} className="veg-item">{veg}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="veg-portions">
                                <h4>🍽️ How Much Veg to Eat?</h4>
                                <div className="portion-list">
                                    {vegPortions.map((p, i) => (
                                        <div key={i} className="portion-item">
                                            <span className="portion-meal">{p.meal}:</span>
                                            <span className="portion-amount">{p.amount}</span>
                                        </div>
                                    ))}
                                    <div className="portion-tip">💡 Mix 2 different vegetables if possible</div>
                                </div>
                            </div>

                            <div className="veg-limit">
                                <h4>🚫 Limit These (Not Daily)</h4>
                                <div className="limit-items">
                                    {limitVegetables.map((v, i) => (
                                        <div key={i} className="limit-item">
                                            <span className="limit-name">{v.item}</span>
                                            <span className="limit-note">({v.note})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Strictly Avoid */}
                        <section className="avoid-section">
                            <h2>🚫 Strictly Avoid (All 4 Weeks)</h2>
                            <div className="avoid-list">
                                {strictlyAvoid.map((item, i) => (
                                    <div key={i} className="avoid-item">❌ {item}</div>
                                ))}
                            </div>
                        </section>

                        {/* Benefits */}
                        <section className="meal-benefits-section">
                            <h2>✅ How This Plan Helps You</h2>
                            <div className="benefits-list">
                                {mealPlanBenefits.map((item, i) => (
                                    <div key={i} className="benefit-item">✔ {item}</div>
                                ))}
                            </div>
                            <p className="benefit-quote">Eat to run fast, not to look light.</p>
                        </section>

                        {/* Notes */}
                        <section className="meal-notes-section">
                            <h2>📌 Notes</h2>
                            <ul>
                                <li>Portions are medium, not bodybuilding-size</li>
                                <li>Adjust rice/roti slightly based on training load</li>
                                <li>Whey protein = 25–30 g scoop</li>
                            </ul>
                        </section>
                    </div>
                ) : (
                    /* TRAINING TAB CONTENT */
                    <>
                        {isEditing && (
                            <div className="edit-toolbar">
                                <span className="edit-hint">✏️ Add personal notes to each phase below</span>
                                <button className="reset-btn" onClick={resetTrainingNotes}>🔄 Reset Notes</button>
                            </div>
                        )}
                        {/* Phase Tabs */}
                        <div className="phase-tabs">
                            <button 
                                className={`phase-tab ${activePhase === 1 ? 'active phase1' : ''}`}
                                onClick={() => setActivePhase(1)}
                            >
                                <span className="phase-icon">🟢</span>
                                <span className="phase-name">PHASE 1</span>
                                <span className="phase-subtitle">Foundation (Days 1–30)</span>
                            </button>
                            <button 
                                className={`phase-tab ${activePhase === 2 ? 'active phase2' : ''}`}
                                onClick={() => setActivePhase(2)}
                            >
                                <span className="phase-icon">🟡</span>
                                <span className="phase-name">PHASE 2</span>
                                <span className="phase-subtitle">Speed Dev (Days 31–60)</span>
                            </button>
                            <button 
                        className={`phase-tab ${activePhase === 3 ? 'active phase3' : ''}`}
                        onClick={() => setActivePhase(3)}
                    >
                        <span className="phase-icon">🔴</span>
                        <span className="phase-name">PHASE 3</span>
                        <span className="phase-subtitle">Performance (Days 61–90)</span>
                    </button>
                </div>

                {/* Phase Info */}
                <div className={`phase-info phase${activePhase}`}>
                    {activePhase === 1 && (
                        <>
                            <div className="info-card">
                                <span className="info-label">Purpose</span>
                                <span className="info-value">Build sprint-ready body, mechanics, and tendon strength</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Intensity</span>
                                <span className="info-value">Low → Moderate</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Speed Zone</span>
                                <span className="info-value">60–80%</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Spikes</span>
                                <span className="info-value spikes-no">❌ NO</span>
                            </div>
                        </>
                    )}
                    {activePhase === 2 && (
                        <>
                            <div className="info-card">
                                <span className="info-label">Purpose</span>
                                <span className="info-value">Build real speed safely</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Intensity</span>
                                <span className="info-value">Moderate → High</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Speed Zone</span>
                                <span className="info-value">80–95%</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Spikes</span>
                                <span className="info-value spikes-yes">✅ Once per week</span>
                            </div>
                        </>
                    )}
                    {activePhase === 3 && (
                        <>
                            <div className="info-card">
                                <span className="info-label">Purpose</span>
                                <span className="info-value">Convert speed → race performance</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Intensity</span>
                                <span className="info-value">High (90–98%)</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Spikes</span>
                                <span className="info-value spikes-yes">✅ Allowed</span>
                            </div>
                            <div className="info-card">
                                <span className="info-label">Timing</span>
                                <span className="info-value spikes-yes">✅ Mandatory</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Phase 3 Core Rule */}
                {activePhase === 3 && (
                    <section className="core-rule-section">
                        <h2>✅ Core Rule (VERY IMPORTANT)</h2>
                        <p className="core-rule-subtitle">Phase 3 is about expression, not exhaustion.</p>
                        <div className="core-rule-list">
                            {phase3CoreRule.map((item, i) => (
                                <div key={i} className={`core-rule-item ${item.startsWith('No') ? 'dont' : 'do'}`}>
                                    {item.startsWith('No') ? '❌' : '✔'} {item}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Weekly Structure */}
                <section className="weekly-structure">
                    <h2>📅 Weekly Structure</h2>
                    <div className="weekly-table">
                        <div className="weekly-header">
                            <div className="col-day">Day</div>
                            <div className="col-morning">Morning (Track)</div>
                            <div className="col-evening">Evening (Gym)</div>
                        </div>
                        {currentWeekly.map((row, index) => (
                            <div 
                                key={row.day} 
                                className={`weekly-row ${activeDay === row.day ? 'active' : ''} ${row.morning === 'REST' || row.morning === 'FULL REST' ? 'rest-day' : ''}`}
                                onClick={() => setActiveDay(row.day)}
                            >
                                <div className="col-day">{row.day}</div>
                                <div className="col-morning">{row.morning}</div>
                                <div className="col-evening">{row.evening}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Daily Content */}
                <section className="daily-content">
                    <h2>🏃 {activeDay} – {currentDaily[activeDay]?.title}</h2>
                    <div className="daily-sessions">
                        <div className="session morning-session">
                            <h3>☀️ Morning</h3>
                            <ul>
                                {currentDaily[activeDay]?.morning.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                        {currentDaily[activeDay]?.evening.length > 0 && (
                            <div className="session evening-session">
                                <h3>🌙 Evening</h3>
                                <ul>
                                    {currentDaily[activeDay]?.evening.map((item, i) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </section>

                {/* Progression */}
                <section className="progression-section">
                    <h2>📈 Week by Week Changes</h2>
                    <div className="progression-cards">
                        {(activePhase === 1 ? phase1Progression : phase2Progression).map((row, i) => (
                            <div key={i} className="progression-card" style={{ borderColor: row.color }}>
                                <div className="progression-card-header">
                                    <span className="week-emoji">{row.emoji}</span>
                                    <div className="week-info">
                                        <span className="week-label">{row.week}</span>
                                        <span className="week-title" style={{ color: row.color }}>{row.title}</span>
                                    </div>
                                    <span className="intensity-badge" style={{ background: row.color }}>
                                        {row.intensity}
                                    </span>
                                </div>
                                <ul className="progression-changes">
                                    {row.changes.map((change, j) => (
                                        <li key={j}>{change}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Don't Change Section */}
                <section className="dont-change-section">
                    <h2>❌ What You MUST NOT Change</h2>
                    <div className="dont-list">
                        {(activePhase === 1 ? phase1DontChange : activePhase === 2 ? phase2DontChange : phase3DontChange).map((item, i) => (
                            <div key={i} className="dont-item">{item}</div>
                        ))}
                    </div>
                </section>

                {/* Why Works Section */}
                <section className="why-works-section">
                    <h2>✅ Why This Structure Works</h2>
                    <div className="why-list">
                        {(activePhase === 1 ? phase1WhyWorks : activePhase === 2 ? phase2WhyWorks : phase3WhyWorks).map((item, i) => (
                            <div key={i} className="why-item">
                                <span className="why-icon">💡</span>
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Phase 3 Extra Sections */}
                {activePhase === 3 && (
                    <>
                        <section className="injury-prevention-section">
                            <h2>🦵 Injury Prevention (Non-Negotiable)</h2>
                            <div className="prevention-list">
                                {phase3InjuryPrevention.map((item, i) => (
                                    <div key={i} className="prevention-item">
                                        <span className="prevention-icon">{item.icon}</span>
                                        <span>{item.item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="nutrition-section">
                            <h2>🍽️ Nutrition</h2>
                            <div className="nutrition-list">
                                {phase3Nutrition.map((item, i) => (
                                    <div key={i} className="nutrition-item">
                                        <span className="nutrition-icon">{item.icon}</span>
                                        <span>{item.item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="expected-results-section">
                            <h2>⏱️ Expected Results</h2>
                            <div className="results-table">
                                {phase3ExpectedResults.map((item, i) => (
                                    <div key={i} className="results-row">
                                        <span className="timeline">{item.timeline}</span>
                                        <span className="expected">{item.expected}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="final-truth-section">
                            <h2>🧠 Final Truth</h2>
                            <div className="truth-content">
                                <p>You are not late.</p>
                                <p>You are on time — if you respect the process.</p>
                                <p className="highlight">Speed rewards patience, precision, and consistency.</p>
                            </div>
                        </section>

                        {/* Personal Training Notes */}
                        {(isEditing || customTrainingNotes[`phase${activePhase}`]) && (
                            <section className="training-notes-section">
                                <h2>📝 My Phase {activePhase} Notes</h2>
                                {isEditing ? (
                                    <textarea
                                        className="training-notes-textarea"
                                        placeholder={`Add your personal notes for Phase ${activePhase}...`}
                                        value={customTrainingNotes[`phase${activePhase}`]}
                                        onChange={(e) => handleTrainingNotesEdit(activePhase, e.target.value)}
                                    />
                                ) : (
                                    <div className="training-notes-display">
                                        {customTrainingNotes[`phase${activePhase}`].split('\n').map((line, i) => (
                                            <p key={i}>{line}</p>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </>
                )}

                {/* End Target */}
                <section className="end-target">
                    <h2>🎯 Phase {activePhase} End Target</h2>
                    <div className="target-list">
                        {activePhase === 1 ? (
                            <>
                                <div className="target-item">✓ Smooth acceleration</div>
                                <div className="target-item">✓ No injuries</div>
                                <div className="target-item">✓ Body feels springy</div>
                                <div className="target-item">✓ Ready for faster running</div>
                            </>
                        ) : activePhase === 2 ? (
                            phase2EndTarget.map((item, i) => (
                                <div key={i} className="target-item">✓ {item}</div>
                            ))
                        ) : (
                            <>
                                <div className="target-item">✓ 100 m: 11.4 – 11.7 sec</div>
                                <div className="target-item">✓ Strong acceleration & visible top speed</div>
                                <div className="target-item">✓ Body handles speed safely</div>
                                <div className="target-item">✓ Ready for competition phase</div>
                            </>
                        )}
                    </div>
                </section>
                    </>
                )}
            </div>
        </div>
    );
};

export default GroundActivityPlan;