import React, { useState, useRef, useCallback } from 'react';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MONTH_COLORS = [
    '#ff6b6b', // Jan - Red
    '#ff9f43', // Feb - Orange
    '#ffd93d', // Mar - Yellow
    '#6bcb77', // Apr - Green
    '#1abc9c', // May - Teal
    '#00d9ff', // Jun - Cyan
    '#4d96ff', // Jul - Blue
    '#5f27cd', // Aug - Purple
    '#9b59b6', // Sep - Violet
    '#e74c3c', // Oct - Dark Red
    '#f39c12', // Nov - Amber
    '#00d2d3'  // Dec - Turquoise
];

const YearOverview = ({ currentYear, selectedMonth, onSelectMonth }) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const sidebarRef = useRef(null);

    const handleMouseMove = useCallback((e) => {
        if (!sidebarRef.current) return;
        
        const labels = sidebarRef.current.querySelectorAll('.month-label');
        let closestIndex = null;
        let closestDistance = Infinity;
        
        labels.forEach((label, index) => {
            const rect = label.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const distance = Math.abs(e.clientY - centerY);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });
        
        setHoveredIndex(closestIndex);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setHoveredIndex(null);
    }, []);

    const getZoomClass = (index) => {
        if (hoveredIndex === null) return '';
        
        const distance = Math.abs(index - hoveredIndex);
        
        if (distance === 0) return 'zoom-1';
        if (distance === 1) return 'zoom-2';
        return '';
    };

    return (
        <div 
            className="month-sidebar"
            ref={sidebarRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {MONTH_SHORT.map((monthName, index) => (
                <div
                    key={index}
                    className={`month-label ${index === selectedMonth ? 'active' : ''} ${getZoomClass(index)}`}
                    onClick={() => onSelectMonth(index)}
                    style={{ color: MONTH_COLORS[index] }}
                >
                    {monthName}
                </div>
            ))}
        </div>
    );
};

export default YearOverview;
