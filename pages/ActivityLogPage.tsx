import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/mockApiService';
import { ActivityLog, ActivityLogEntity } from '../types';
import Pagination from '../components/ui/Pagination';
import { formatDate } from '../utils/formatters';
import TableSkeleton from '../components/ui/skeletons/TableSkeleton';
import Card from '../components/ui/Card';
import { FunnelIcon } from '../components/icons/Icons';
import { useToast } from '../context/ToastContext';

const entityTranslations: Record<ActivityLogEntity, string> = {
    project: 'Dự án',
    job_posting: 'Tin tuyển dụng',
    candidate: 'Ứng viên',
    source: 'Nguồn ứng viên',
    classification: 'Phân loại',
    position: 'Vị trí',
};

const actionTranslations: Record<string, string> = {
    create: 'Tạo mới',
    update: 'Cập nhật',
    delete: 'Xóa',
    status_change: 'Đổi trạng thái'
};

const LogDetailsDiff: React.FC<{ details: ActivityLog['details'] }> = ({ details }) => {
    const { before, after } = details;

    if (!before && after) { // Create action
        return <pre className="text-xs bg-green-50 text-green-800 p-2 rounded whitespace-pre-wrap font-mono">Tạo mới: {JSON.stringify(after, null, 2)}</pre>;
    }
    if (before && !after) { // Delete action
        return <pre className="text-xs bg-red-50 text-red-800 p-2 rounded whitespace-pre-wrap font-mono">Đã xóa: {JSON.stringify(before, null, 2)}</pre>;
    }
    if (before && after) { // Update action
        const changes = Object.keys({ ...before, ...after }).reduce((acc, key) => {
            const beforeValue = JSON.stringify(before[key]);
            const afterValue = JSON.stringify(after[key]);
            if (beforeValue !== afterValue) {
                acc[key] = { from: before[key] ?? 'N/A', to: after[key] ?? 'N/A' };
            }
            return acc;
        }, {} as Record<string, { from: any, to: any }>);

        if (Object.keys(changes).length === 0) {
            return <span className="text-xs text-gray-500">Không có thay đổi dữ liệu.</span>;
        }

        return (
            <div className="text-xs font-mono bg-gray-50 p-2 rounded space-y-1">
                {Object.entries(changes).map(([key, value]) => (
                    <div key={key}>
                        <span className="font-semibold">{key}:</span>
                        <span className="text-red-600"> "{String(value.from)}"</span> &rarr;
                        <span className="text-green-600"> "{String(value.to)}"</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ActivityLogPage: React.FC = () => {
    const { showToast } = useToast();
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actors, setActors] = useState<string[]>([]);
    
    const [filters, setFilters] = useState({
        actor: '',
        entity: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 15;
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        try {
            const query = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters,
            };
            const response = await api.getActivityLogs(query);
            setLogs(response.data);
            setTotalItems(response.total);
        } catch (err: any) {
            showToast(err.message || "Không thể tải lịch sử hoạt động.", 'error');
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, showToast]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    useEffect(() => {
        api.getLogActors().then(setActors).catch(() => showToast("Lỗi tải danh sách người dùng.", 'error'));
    }, [showToast]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Lịch sử hoạt động</h2>
            
            <Card className="mb-6">
                <button onClick={() => setFiltersVisible(!isFiltersVisible)} className="p-2 border rounded-lg md:hidden mb-4 flex items-center gap-2">
                    <FunnelIcon />
                    <span>Bộ lọc</span>
                </button>
                 <div className={`${isFiltersVisible ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300`}>
                    <select name="actor" value={filters.actor} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả người dùng</option>
                        {actors.map(actor => <option key={actor} value={actor}>{actor}</option>)}
                    </select>
                     <select name="entity" value={filters.entity} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả đối tượng</option>
                        {Object.entries(entityTranslations).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-lg" />
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-lg" />
                </div>
            </Card>

            {loading ? <TableSkeleton /> : (
                 <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người thao tác</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đối tượng</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chi tiết thay đổi (Trước → Sau)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.actor}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{actionTranslations[log.action] || log.action}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="text-gray-900">{entityTranslations[log.entity]}</div>
                                            <div className="text-gray-500">{log.entityName}</div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <LogDetailsDiff details={log.details} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     {totalItems > itemsPerPage && (
                        <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />
                    )}
                </div>
            )}
        </div>
    );
};

export default ActivityLogPage;