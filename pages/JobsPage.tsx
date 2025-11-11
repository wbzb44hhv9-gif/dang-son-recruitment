import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { JobPosting, JobStatus, Project, JobType } from '../types';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { PlusCircleIcon, FunnelIcon } from '../components/icons/Icons';
import { useToast } from '../context/ToastContext';
import TableSkeleton from '../components/ui/skeletons/TableSkeleton';
import Card from '../components/ui/Card';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const getStatusColor = (status: JobStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
        case JobStatus.POSTING: return 'green';
        case JobStatus.PAUSED: return 'yellow';
        case JobStatus.FILLED: return 'gray';
        case JobStatus.DRAFT: return 'blue';
        default: return 'gray';
    }
};

const JobsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [jobs, setJobs] = useState<JobPosting[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({ search: '', projectId: '', department: '', location: '', jobType: '', status: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    
    const [projects, setProjects] = useState<Project[]>([]);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    const debouncedSearch = useDebounce(filters.search, 500);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const query = { page: currentPage, limit: itemsPerPage, ...filters, search: debouncedSearch };
            const response = await api.getJobs(query);
            setJobs(response.data);
            setTotalItems(response.total);
        } catch (err: any) {
            showToast(err.message || "Không thể tải danh sách tin tuyển dụng.", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, debouncedSearch, showToast]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    useEffect(() => {
        api.getAllProjects().then(setProjects).catch(() => showToast("Lỗi tải danh sách dự án.", 'error'));
    }, [showToast]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1);
    };
    
    const openStatusModal = (job: JobPosting) => {
        setSelectedJob(job);
        setStatusModalOpen(true);
    };

    const handleStatusToggle = async () => {
        if (!selectedJob) return;
        const newStatus = selectedJob.status === JobStatus.POSTING ? JobStatus.PAUSED : JobStatus.POSTING;
        try {
            await api.updateJob(selectedJob.id, { status: newStatus });
            showToast('Cập nhật trạng thái thành công!', 'success');
            fetchJobs();
        } catch {
            showToast('Cập nhật trạng thái thất bại.', 'error');
        } finally {
            setStatusModalOpen(false);
            setSelectedJob(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-700">Tin tuyển dụng</h2>
                <Link to="/tin-tuyen-dung/tao-moi" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700">
                    <PlusCircleIcon />
                    <span className="ml-2">Tạo tin mới</span>
                </Link>
            </div>
            
            <Card className="mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <input type="text" name="search" placeholder="Tìm theo mã hoặc tên vị trí..." value={filters.search} onChange={handleFilterChange} className="w-full md:w-1/3 px-3 py-2 border border-border-color rounded-lg" />
                     <button onClick={() => setFiltersVisible(!isFiltersVisible)} className="p-2 border rounded-lg md:hidden">
                        <FunnelIcon />
                    </button>
                </div>
                <div className={`${isFiltersVisible ? 'grid' : 'hidden'} md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 transition-all duration-300`}>
                    <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg"><option value="">Tất cả dự án</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                    <input type="text" name="department" placeholder="Phòng ban" value={filters.department} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-lg" />
                    <input type="text" name="location" placeholder="Khu vực" value={filters.location} onChange={handleFilterChange} className="w-full px-3 py-2 border border-border-color rounded-lg" />
                    <select name="jobType" value={filters.jobType} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg"><option value="">Loại hình</option>{Object.values(JobType).map(jt => <option key={jt} value={jt}>{jt}</option>)}</select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg"><option value="">Trạng thái</option>{Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}</select>
                </div>
            </Card>

            {loading ? <TableSkeleton /> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Mã vị trí', 'Chức danh', 'Dự án', 'Khu vực', 'Loại hình', 'Trạng thái', 'Hạn nộp', 'Cập nhật', 'Hành động'].map(h => 
                                        <th key={h} className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase ${h === 'Hành động' ? 'text-right' : 'text-left'}`}>{h}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4"><div className="font-medium text-gray-900">{job.jobCode}</div></td>
                                        <td className="px-4 py-4"><div className="text-sm text-gray-900">{job.title}</div><div className="text-sm text-gray-500">{job.department}</div></td>
                                        <td className="px-4 py-4 text-sm text-gray-700">{job.projectName}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{job.location}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{job.jobType}</td>
                                        <td className="px-4 py-4"><Badge color={getStatusColor(job.status)}>{job.status}</Badge></td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{job.deadline}</td>
                                        <td className="px-4 py-4 text-sm text-gray-500">{job.updatedAt}</td>
                                        <td className="px-4 py-4 text-right text-sm font-medium space-x-2">
                                            <button onClick={() => navigate(`/tin-tuyen-dung/${job.id}`)} className="text-indigo-600 hover:text-indigo-900">Chi tiết</button>
                                            <button onClick={() => navigate(`/tin-tuyen-dung/sua/${job.id}`)} className="text-primary hover:text-blue-700">Sửa</button>
                                            {(job.status === JobStatus.POSTING || job.status === JobStatus.PAUSED) && 
                                                <button onClick={() => openStatusModal(job)} className="text-green-600 hover:text-green-900">{job.status === JobStatus.POSTING ? 'Dừng' : 'Mở'}</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalItems > itemsPerPage && <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} />}
                </div>
            )}
            <ConfirmationModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onConfirm={handleStatusToggle}
                title="Xác nhận thay đổi trạng thái"
                message={`Bạn có chắc chắn muốn ${selectedJob?.status === JobStatus.POSTING ? 'dừng' : 'mở lại'} tin tuyển dụng "${selectedJob?.title}" không?`}
            />
        </div>
    );
};

export default JobsPage;