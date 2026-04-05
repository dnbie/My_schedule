import React, { useState, useEffect } from 'react';
import { COLORS } from '../data/constants';

const PRIORITIES = [
    { value: 'high', label: '🔴 High', color: '#ff4757' },
    { value: 'medium', label: '🟡 Medium', color: '#ffa502' },
    { value: 'low', label: '🟢 Low', color: '#2ed573' }
];

const ActivityModal = ({ isOpen, onClose, activity, onSave, onDelete }) => {
    const [name, setName] = useState('');
    const [goal, setGoal] = useState('');
    const [plan, setPlan] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [priority, setPriority] = useState('medium');

    const isEditing = !!activity;

    useEffect(() => {
        if (activity) {
            setName(activity.name || '');
            setGoal(activity.goal || '');
            setPlan(activity.plan || '');
            setSelectedColor(activity.color || COLORS[0]);
            setPriority(activity.priority || 'medium');
        } else {
            setName('');
            setGoal('');
            setPlan('');
            setSelectedColor(COLORS[0]);
            setPriority('medium');
        }
    }, [activity, isOpen]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            alert('Please enter an activity name');
            return;
        }
        onSave({
            id: activity?.id,
            name: name.trim(),
            goal: goal.trim(),
            plan: plan.trim(),
            color: selectedColor,
            priority: priority
        });
        onClose();
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            onDelete(activity.id);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <h2>{isEditing ? 'Edit Activity' : 'Add New Activity'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Activity Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g., Morning Exercise"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Goal</label>
                        <textarea
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            placeholder="What do you want to achieve?"
                        />
                    </div>

                    <div className="form-group">
                        <label>Plan</label>
                        <textarea
                            value={plan}
                            onChange={e => setPlan(e.target.value)}
                            placeholder="How will you achieve it?"
                        />
                    </div>

                    <div className="form-group">
                        <label>Color</label>
                        <div className="color-options">
                            {COLORS.map(color => (
                                <div
                                    key={color}
                                    className={`color-option ${color === selectedColor ? 'selected' : ''}`}
                                    style={{ background: color }}
                                    onClick={() => setSelectedColor(color)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <div className="priority-options">
                            {PRIORITIES.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    className={`priority-btn ${priority === p.value ? 'selected' : ''}`}
                                    style={{ 
                                        borderColor: priority === p.value ? p.color : 'transparent',
                                        background: priority === p.value ? `${p.color}20` : 'rgba(255,255,255,0.05)'
                                    }}
                                    onClick={() => setPriority(p.value)}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn-primary">
                        Save Activity
                    </button>

                    {isEditing && (
                        <button 
                            type="button" 
                            className="btn-primary btn-danger" 
                            onClick={handleDelete}
                        >
                            Delete Activity
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ActivityModal;
