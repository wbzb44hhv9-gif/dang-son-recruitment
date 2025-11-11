import React from 'react';
import { XMarkIcon } from '../icons/Icons';

interface LightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
}

const Lightbox: React.FC<LightboxProps> = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 z-50 flex justify-center items-center" 
            onClick={onClose}
        >
            <button 
                className="absolute top-4 right-4 text-white hover:text-gray-300"
                onClick={onClose}
            >
                <XMarkIcon />
            </button>
            <div className="relative max-w-4xl max-h-4/5" onClick={e => e.stopPropagation()}>
                <img src={imageUrl} alt="Lightbox view" className="max-w-full max-h-[80vh] object-contain" />
            </div>
        </div>
    );
};

export default Lightbox;