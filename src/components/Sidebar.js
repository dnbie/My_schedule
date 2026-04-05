import React from 'react';

const Sidebar = ({
    completedDays,
    overallProgress
}) => {
    return (
        <aside className="sidebar">
            <div className="chart-section">
                <h3>📊 Monthly Stats</h3>
                <div className="overall-stats">
                    <div className="stat-box">
                        <div className="value">{completedDays}</div>
                        <div className="label">Days Completed</div>
                    </div>
                    <div className="stat-box">
                        <div className="value">{overallProgress}%</div>
                        <div className="label">Overall Progress</div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
