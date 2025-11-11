
import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color: 'green' | 'blue' | 'yellow' | 'red' | 'gray';
}

const Badge: React.FC<BadgeProps> = ({ children, color }) => {
    const colorClasses = {
        green: 'bg-green-100 text-success',
        blue: 'bg-blue-100 text-primary',
        yellow: 'bg-yellow-100 text-warning',
        red: 'bg-red-100 text-error',
        gray: 'bg-gray-100 text-gray-600',
    };

    return (
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${colorClasses[color]}`}>
            {children}
        </span>
    );
};

export default Badge;
