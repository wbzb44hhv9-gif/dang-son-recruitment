import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    const baseClasses = "flex items-center justify-between w-full p-4 text-white rounded-lg shadow-lg";
    const typeClasses = {
        success: "bg-success",
        error: "bg-error",
    };

    const Icon = () => {
        if (type === 'success') {
            return (
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            );
        }
        return (
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        );
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            <div className="flex items-center">
                <Icon />
                <span className="font-medium">{message}</span>
            </div>
            <button onClick={onClose} className="text-xl font-semibold leading-none">&times;</button>
        </div>
    );
};

export default Toast;
