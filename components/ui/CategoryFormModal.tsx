import React, { useState, useEffect } from 'react';
import { SettingItem } from '../../types';

interface CategoryFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: Omit<SettingItem, 'id'> | SettingItem) => void;
    initialData?: SettingItem | null;
    title: string;
    itemName: string;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, initialData, title, itemName }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setError('');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!name.trim()) {
            setError(`Tên ${itemName} là bắt buộc.`);
            return;
        }
        onSave(initialData ? { ...initialData, name } : { name });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-text-main">{title}</h3>
                <div className="mt-4">
                    <label htmlFor="category-name" className="block text-sm font-medium text-gray-700">Tên {itemName}</label>
                    <input
                        type="text"
                        id="category-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        autoFocus
                    />
                    {error && <p className="text-sm text-error mt-1">{error}</p>}
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">Lưu</button>
                </div>
            </div>
        </div>
    );
};

export default CategoryFormModal;