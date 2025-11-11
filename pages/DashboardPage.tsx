import React, { useEffect, useState, useRef } from 'react';
import Card, { StatCard } from '../components/ui/Card';
import { api } from '../services/mockApiService';
import { DashboardData, JobPosting, JobStatus, Candidate } from '../types';
import { CalendarDaysIcon, FunnelIcon, StarIcon, BriefcaseIcon, UserGroupIcon } from '../components/icons/Icons';
import { Link } from 'react-router-dom';
import DashboardSkeleton from '../components/ui/skeletons/DashboardSkeleton';

// Since we are using a CDN, we declare Chart to avoid TypeScript errors.
declare const Chart: any;

const BarChart: React.FC<{ data: any, title: string }> = ({ data, title }) => {
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


const DashboardPage: React.FC = () => {
    const [stats, setStats] = useState<DashboardData | null>(null);
    const [featuredJobs, setFeaturedJobs] = useState<JobPosting[]>([]);
    const [todaysFollowUps, setTodaysFollowUps] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsData, jobsData, followUpsData] = await Promise.all([
                    api.getDashboardData(),
                    api.getJobs({}),
                    api.getTodaysFollowUpCandidates(),
                ]);
                setStats(statsData);
                setFeaturedJobs(jobsData.data.filter(j => j.status === JobStatus.POSTING).slice(0, 3));
                setTodaysFollowUps(followUpsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
             <div>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">Bảng điều khiển</h2>
                <DashboardSkeleton />
            </div>
        )
    }

    if (!stats) {
        return <p>Không thể tải dữ liệu bảng điều khiển.</p>
    }

    const weeklyProfilesChartData = {
        labels: stats.profilesByWeek.map(d => d.label),
        datasets: [{
            label: 'Số hồ sơ',
            data: stats.profilesByWeek.map(d => d.value),
            backgroundColor: '#2563EB',
            borderRadius: 6,
        }]
    };

    const sourceDistributionChartData = {
        labels: stats.profilesBySource.map(d => d.label),
        datasets: [{
            data: stats.profilesBySource.map(d => d.value),
            backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
            hoverOffset: 4
        }]
    };
    
    const funnelText = `${stats.funnel.screening} → ${stats.funnel.interview} → ${stats.funnel.offer} → ${stats.funnel.hired}`;

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Bảng điều khiển</h2>
            
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                <StatCard title="Hồ sơ mới tuần này" value={stats.newThisWeek} icon={<CalendarDaysIcon />} color="bg-blue-500" />
                <StatCard title="Tỉ lệ qua vòng (Sàng lọc → Tuyển)" value={funnelText} icon={<FunnelIcon />} color="bg-indigo-500" />
                <StatCard title="Số tin đang đăng" value={stats.openJobs} icon={<BriefcaseIcon />} color="bg-green-500" />
                <StatCard title="Nguồn hiệu quả nhất" value={stats.topSource} icon={<StarIcon />} color="bg-amber-500" />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-6">
                    <Card title="Ứng viên cần liên hệ hôm nay">
                         {todaysFollowUps.length > 0 ? (
                            <ul className="space-y-3">
                                {todaysFollowUps.map(candidate => (
                                    <li key={candidate.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <Link to={`/ung-vien/${candidate.id}`} className="font-semibold text-text-main hover:text-primary">{candidate.name}</Link>
                                                <p className="text-sm text-gray-500">{candidate.positionName || 'Chưa có vị trí'}</p>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600">{candidate.phone}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="text-center py-4">
                                <UserGroupIcon />
                                <p className="mt-2 text-gray-500">Không có ứng viên nào cần liên hệ hôm nay.</p>
                            </div>
                        )}
                    </Card>
                    <Card title="Việc làm nổi bật">
                         <ul className="space-y-4">
                            {featuredJobs.map(job => (
                                <li key={job.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                                    <div>
                                        <Link to={`/tin-tuyen-dung/${job.id}`} className="font-semibold text-text-main hover:text-primary">{job.title}</Link>
                                        <p className="text-sm text-gray-500">{job.location} • {job.jobType}</p>
                                    </div>
                                    <span className="text-sm text-gray-600">{job.candidateCount} ứng viên</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                     <Card title="Nguồn ứng viên">
                         <DoughnutChart data={sourceDistributionChartData} title="Phân bổ hồ sơ theo nguồn" />
                    </Card>
                     <Card title="Hồ sơ theo tuần">
                        <BarChart data={weeklyProfilesChartData} title="Số lượng hồ sơ nhận được"/>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;