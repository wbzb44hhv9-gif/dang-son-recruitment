
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
    return (
        <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
            {title && <h3 className="text-xl font-semibold text-text-main mb-4">{title}</h3>}
            {children}
        </div>
    );
};

export const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
    return (
        <Card className="flex items-center p-4">
            <div className={`p-3 mr-4 text-white rounded-full ${color}`}>
                {icon}
            </div>
            <div>
                <p className="mb-2 text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-semibold text-gray-700">{value}</p>
            </div>
        </Card>
    )
}

export default Card;
