import React, { useEffect, useState, useRef, useCallback } from 'react';
import Card, { StatCard } from '../components/ui/Card';
import { api } from '../services/mockApiService';
import { ReportData, Project } from '../types';
import { UserGroupIcon, FunnelIcon } from '../components/icons/Icons';
import { useToast } from '../context/ToastContext';
import DashboardSkeleton from '../components/ui/skeletons/DashboardSkeleton';

declare const Chart: any;

const BarChart: React.FC<{ data: any, title: string, options?: any }> = ({ data, title, options = {} }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (chartRef.current && data) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'bar',
                    data: data,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            title: { display: true, text: title, font: { size: 16, family: 'Lexend' } }
                        },
                        scales: {
                            y: { beginAtZero: true },
                            x: { grid: { display: false } }
                        },
                        ...options,
                    }
                });
            }
        }
        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, title, options]);

    return <div className="h-80"><canvas ref={chartRef}></canvas></div>;
};

const DoughnutChart: React.FC<{ data: any, title: string }> = ({ data, title }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<any>(null);
    
    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
        if (chartRef.current && data) {
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstance.current = new Chart(ctx, {
                    type: 'doughnut',
                    data: data,
                     options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' },
                            title: { display: true, text: title, font: { size: 16, family: 'Lexend' } }
                        }
                    }
                });
            }
        }
         return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [data, title]);

    return <div className="h-80"><canvas ref={chartRef}></canvas></div>;
};


const ReportsPage: React.FC = () => {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filters, setFilters] = useState({
        timeRange: 'month', // week, month, quarter
        projectId: '',
    });
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [isFiltersVisible, setFiltersVisible] = useState(false);
    
    const fetchReportData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getReportData(filters);
            setReportData(data);
        } catch (error) {
            showToast("Không thể tải dữ liệu báo cáo.", 'error');
            console.error("Failed to fetch report data:", error);
        } finally {
            setLoading(false);
        }
    }, [filters, showToast]);
    
    useEffect(() => {
        api.getAllProjects().then(setProjects).catch(() => showToast("Lỗi tải danh sách dự án.", 'error'));
    }, [showToast]);

    useEffect(() => {
        fetchReportData();
    }, [fetchReportData]);

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({...prev, [key]: value }));
    };

    const handleExport = () => {
        showToast("Chức năng xuất CSV đang được phát triển!", 'success');
    };

    const timeRangeOptions = [
        { key: 'week', label: 'Tuần này' },
        { key: 'month', label: 'Tháng này' },
        { key: 'quarter', label: 'Quý này' },
    ];
    
    const profilesOverTimeData = {
        labels: reportData?.profilesOverTime.map(d => d.label) || [],
        datasets: [{
            label: 'Số hồ sơ',
            data: reportData?.profilesOverTime.map(d => d.value) || [],
            backgroundColor: '#2563EB',
            borderRadius: 6,
        }]
    };
    
    const funnelStages = reportData?.funnel ? [
        { label: 'Sơ vấn', value: reportData.funnel.screening },
        { label: 'Phỏng vấn', value: reportData.funnel.interview },
        { label: 'Offer', value: reportData.funnel.offer },
        { label: 'Nhận việc', value: reportData.funnel.hired },
    ] : [];

    const funnelConversionData = {
        labels: funnelStages.map(s => `${s.label} (${s.value})`),
        datasets: [{
            label: 'Số lượng ứng viên',
            data: funnelStages.map(s => s.value),
            backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
        }]
    };

    const sourceDistributionData = {
        labels: reportData?.sourceDistribution.map(d => d.label) || [],
        datasets: [{
            data: reportData?.sourceDistribution.map(d => d.value) || [],
            backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
            hoverOffset: 4
        }]
    };

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Báo cáo hiệu quả tuyển dụng</h2>
            
            <Card className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                     <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex rounded-lg border border-gray-200">
                             {timeRangeOptions.map(opt => (
                                <button
                                    key={opt.key}
                                    onClick={() => handleFilterChange('timeRange', opt.key)}
                                    className={`px-4 py-2 text-sm font-medium focus:outline-none first:rounded-l-lg last:rounded-r-lg ${filters.timeRange === opt.key ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        <select
                            value={filters.projectId}
                            onChange={(e) => handleFilterChange('projectId', e.target.value)}
                            className="px-3 py-2 border bg-white border-border-color rounded-lg"
                        >
                            <option value="">Tất cả dự án</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-blue-50">
                        Xuất CSV
                    </button>
                </div>
            </Card>

            {loading ? <DashboardSkeleton /> : !reportData ? <p>Không có dữ liệu.</p> : (
                 <div className="space-y-6">
                    {filters.projectId && (
                        <StatCard 
                            title={`Số hồ sơ của dự án`} 
                            value={reportData.totalProfiles} 
                            icon={<UserGroupIcon />} 
                            color="bg-blue-500" 
                        />
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Hồ sơ theo thời gian">
                            <BarChart data={profilesOverTimeData} title="" />
                        </Card>
                         <Card title="Tỉ lệ chuyển đổi qua các vòng">
                            <BarChart data={funnelConversionData} title="" options={{ indexAxis: 'y' }}/>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card title="Phân bổ nguồn ứng viên">
                             <DoughnutChart data={sourceDistributionData} title="" />
                        </Card>
                         {!filters.projectId && reportData.topProjects && (
                            <Card title="Top 5 dự án theo số hồ sơ mới">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr>
                                                <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Tên dự án</th>
                                                <th className="py-2 text-right text-xs font-medium text-gray-500 uppercase">Số hồ sơ</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reportData.topProjects.map(p => (
                                                <tr key={p.name}>
                                                    <td className="py-3 text-sm font-medium text-gray-800">{p.name}</td>
                                                    <td className="py-3 text-sm text-gray-600 text-right">{p.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                 </div>
            )}
        </div>
    );
};

export default ReportsPage;