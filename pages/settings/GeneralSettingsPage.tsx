import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockApiService';
import { AppSettings } from '../../types';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';

const GeneralSettingsPage: React.FC = () => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const data = await api.getSettings();
                setSettings(data);
            } catch (error) {
                showToast("Không thể tải cài đặt.", 'error');
                console.error("Failed to load settings", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [showToast]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value,
        });
    };
    
    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await api.updateSettings(settings);
            showToast("Cài đặt đã được lưu.", 'success');
        } catch (error) {
            showToast("Lưu cài đặt thất bại.", 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <Spinner />;
    if (!settings) return <p>Không thể tải cài đặt.</p>;

    return (
        <Card>
             <h3 className="text-xl font-semibold text-gray-800 mb-4">Cài đặt chung</h3>
             <div className="space-y-6">
                <div>
                    <label htmlFor="endpointUpload" className="block text-sm font-medium text-gray-700">Endpoint lưu trữ tệp</label>
                    <input
                        type="text"
                        id="endpointUpload"
                        name="endpointUpload"
                        value={settings.endpointUpload}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="https://your-storage-service.com/upload"
                    />
                    <p className="mt-2 text-xs text-gray-500">URL của dịch vụ để tải lên CV, ảnh dự án, v.v.</p>
                </div>
                
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            id="enableSync"
                            name="enableSync"
                            type="checkbox"
                            checked={settings.enableSync}
                            onChange={handleChange}
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor="enableSync" className="font-medium text-gray-700">Đồng bộ Sheets/Firestore</label>
                        <p className="text-gray-500">Khi được bật, hệ thống sẽ gửi thông báo (mock) để đồng bộ dữ liệu mỗi khi có thay đổi trên Project, Job hoặc Candidate.</p>
                    </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
             </div>
        </Card>
    );
};

export default GeneralSettingsPage;