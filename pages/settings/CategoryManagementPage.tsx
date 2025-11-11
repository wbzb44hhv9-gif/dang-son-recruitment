import React, { useState, useEffect, useCallback } from 'react';
import { SettingItem } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { PlusCircleIcon } from '../../components/icons/Icons';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import CategoryFormModal from '../../components/ui/CategoryFormModal';
import { useToast } from '../../context/ToastContext';

interface CategoryManagementPageProps {
    title: string;
    itemName: string; // e.g., "nguồn ứng viên"
    api_get: () => Promise<SettingItem[]>;
    api_create: (data: { name: string }) => Promise<SettingItem>;
    api_update: (id: string, data: { name: string }) => Promise<SettingItem>;
    api_delete: (id: string) => Promise<{ id: string }>;
}

const CategoryManagementPage: React.FC<CategoryManagementPageProps> = ({
    title,
    itemName,
    api_get,
    api_create,
    api_update,
    api_delete,
}) => {
    const [items, setItems] = useState<SettingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<SettingItem | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api_get();
            setItems(data);
        } catch (err) {
            showToast(`Không thể tải danh sách ${itemName}.`, 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [api_get, itemName, showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const openCreateModal = () => {
        setSelectedItem(null);
        setFormModalOpen(true);
    };

    const openEditModal = (item: SettingItem) => {
        setSelectedItem(item);
        setFormModalOpen(true);
    };
    
    const openDeleteModal = (item: SettingItem) => {
        setSelectedItem(item);
        setDeleteModalOpen(true);
    };
    
    const handleSave = async (data: Omit<SettingItem, 'id'> | SettingItem) => {
        try {
            if ('id' in data) { // Update
                await api_update(data.id, { name: data.name });
                showToast(`Đã cập nhật ${itemName}.`, 'success');
            } else { // Create
                await api_create({ name: data.name });
                 showToast(`Đã tạo ${itemName} mới.`, 'success');
            }
            fetchData();
        } catch(e) {
            showToast(`Lưu ${itemName} thất bại.`, 'error');
        } finally {
            setFormModalOpen(false);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedItem) return;
        try {
            await api_delete(selectedItem.id);
            showToast(`Đã xóa ${itemName}.`, 'success');
            fetchData();
        } catch(e) {
            showToast(`Xóa ${itemName} thất bại.`, 'error');
        } finally {
            setDeleteModalOpen(false);
        }
    }

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                <button onClick={openCreateModal} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700">
                    <PlusCircleIcon />
                    <span className="ml-2">Thêm mới</span>
                </button>
            </div>
            {loading ? <Spinner /> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên {itemName}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                        <button onClick={() => openEditModal(item)} className="text-primary hover:text-blue-700">Sửa</button>
                                        <button onClick={() => openDeleteModal(item)} className="text-error hover:text-red-800">Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
             <CategoryFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSave}
                initialData={selectedItem}
                title={selectedItem ? `Sửa ${itemName}` : `Thêm ${itemName} mới`}
                itemName={itemName}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title={`Xác nhận xóa ${itemName}`}
                message={`Bạn có chắc chắn muốn xóa "${selectedItem?.name}" không?`}
            />
        </Card>
    );
};

export default CategoryManagementPage;