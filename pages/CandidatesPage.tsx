import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Candidate, CandidateStatus, SettingItem, Project } from '../types';
import Badge from '../components/ui/Badge';
import Pagination from '../components/ui/Pagination';
import { PlusCircleIcon, FunnelIcon } from '../components/icons/Icons';
import StatusUpdateModal from '../components/ui/StatusUpdateModal';
import CvProcessingModal from '../components/ui/CvProcessingModal';
import { useToast } from '../context/ToastContext';
import { formatDate, formatCurrencyVND } from '../utils/formatters';
import TableSkeleton from '../components/ui/skeletons/TableSkeleton';
// FIX: Import Card component.
import Card from '../components/ui/Card';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const getStatusColor = (status: CandidateStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
        case CandidateStatus.OFFER_SENT:
        case CandidateStatus.SALARY_APPROVED:
        case CandidateStatus.HIRED:
            return 'green';
        case CandidateStatus.INTERVIEW_SCHEDULED:
        case CandidateStatus.SENT_TO_DIRECTOR:
        case CandidateStatus.SALARY_PROPOSED:
            return 'blue';
        case CandidateStatus.APPLIED:
        case CandidateStatus.SCREENED:
            return 'yellow';
        case CandidateStatus.REJECTED:
            return 'red';
        default:
            return 'gray';
    }
};

const getFollowUpDateColor = (dateString?: string): string => {
    if (!dateString) return 'text-gray-500';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUpDate = new Date(dateString);
    followUpDate.setHours(0, 0, 0, 0);

    const diffTime = followUpDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) return 'text-red-600 font-semibold';
    if (diffDays <= 7) return 'text-yellow-600 font-semibold';
    return 'text-gray-500';
};


const CandidatesPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    const [filters, setFilters] = useState({
        search: '',
        status: '',
        sourceId: '',
        classificationId: '',
        positionId: '',
        projectId: '',
        startDate: '',
        endDate: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    
    const [sources, setSources] = useState<SettingItem[]>([]);
    const [classifications, setClassifications] = useState<SettingItem[]>([]);
    const [positions, setPositions] = useState<SettingItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [cvProcessingModalOpen, setCvProcessingModalOpen] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    const debouncedSearch = useDebounce(filters.search, 500);

    const fetchCandidates = useCallback(async () => {
        setLoading(true);
        try {
            const query = {
                page: currentPage,
                limit: itemsPerPage,
                ...filters,
                search: debouncedSearch,
            };
            const response = await api.getCandidates(query);
            setCandidates(response.data);
            setTotalItems(response.total);
        } catch (err: any) {
            showToast(err.message || "Không thể tải danh sách ứng viên.", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, filters, debouncedSearch, showToast]);

    useEffect(() => {
        fetchCandidates();
    }, [fetchCandidates]);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                 const [sourcesData, classData, posData, projData] = await Promise.all([
                    api.getCandidateSources(),
                    api.getClassifications(),
                    api.getPositions(),
                    api.getAllProjects(),
                ]);
                setSources(sourcesData);
                setClassifications(classData);
                setPositions(posData);
                setProjects(projData);
            } catch {
                showToast("Lỗi tải dữ liệu cho bộ lọc.", 'error');
            }
        };
        fetchDropdownData();
    }, [showToast]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };
    
    const handleExport = async () => {
        try {
            const csvData = await api.exportCandidatesToCSV({ ...filters, search: debouncedSearch });
            const blob = new Blob([`\uFEFF${csvData}`], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('download', 'danh_sach_ung_vien.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Xuất file CSV thành công!', 'success');
        } catch {
            showToast('Xuất file thất bại.', 'error');
        }
    };
    
    const openStatusModal = (candidate: Candidate) => {
        setSelectedCandidate(candidate);
        setStatusModalOpen(true);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-semibold text-gray-700">Quản lý Ứng viên</h2>
                <div className="flex space-x-2 flex-wrap gap-2">
                    <button onClick={handleExport} className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-blue-50">Xuất Excel</button>
                    <button onClick={() => setCvProcessingModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Nhập từ CVs</button>
                    <Link to="/ung-vien/tao-moi" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700">
                        <PlusCircleIcon />
                        <span className="ml-2">Tạo ứng viên mới</span>
                    </Link>
                </div>
            </div>
            
            <Card className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <input type="text" name="search" placeholder="Tìm theo tên, SĐT, email..." value={filters.search} onChange={handleFilterChange} className="w-full md:w-1/3 px-3 py-2 border border-border-color rounded-lg" />
                     <button onClick={() => setFiltersVisible(!isFiltersVisible)} className="p-2 border rounded-lg md:hidden">
                        <FunnelIcon />
                    </button>
                </div>
                <div className={`${isFiltersVisible ? 'block' : 'hidden'} md:grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-300`}>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả trạng thái</option>
                        {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="sourceId" value={filters.sourceId} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả nguồn</option>
                        {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select name="positionId" value={filters.positionId} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả vị trí</option>
                        {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                     <select name="projectId" value={filters.projectId} onChange={handleFilterChange} className="w-full px-3 py-2 border bg-white border-border-color rounded-lg">
                        <option value="">Tất cả dự án</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </Card>

            {loading ? <TableSkeleton /> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ứng viên</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyên ngành</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí/Dự án</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lương (TV/CT)</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đi làm</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày liên hệ lại</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {candidates.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{c.name}</div>
                                            <div className="text-sm text-gray-500">{c.phone}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(c.dateOfBirth)}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{c.major || '-'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                                            <div className="text-gray-900">{c.positionName || '-'}</div>
                                            <div className="text-gray-500">{c.projectName || '-'}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div>{c.probationarySalary > 0 ? formatCurrencyVND(c.probationarySalary).replace(/\s₫/g, '') : '-'}</div>
                                            <div>{c.officialSalary > 0 ? formatCurrencyVND(c.officialSalary).replace(/\s₫/g, '') : '-'}</div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(c.onboardingDate) || '-'}</td>
                                        <td className={`px-4 py-4 whitespace-nowrap text-sm ${getFollowUpDateColor(c.followUpDate)}`}>{formatDate(c.followUpDate) || 'N/A'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={c.note}>{c.note || '-'}</td>
                                        <td className="px-4 py-4 whitespace-nowrap"><Badge color={getStatusColor(c.status)}>{c.status}</Badge></td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => openStatusModal(c)} className="text-primary hover:text-blue-700">Cập nhật TT</button>
                                            <button onClick={() => navigate(`/ung-vien/${c.id}`)} className="text-indigo-600 hover:text-indigo-900">Chi tiết</button>
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
            {selectedCandidate && (
                <StatusUpdateModal 
                    isOpen={statusModalOpen} 
                    onClose={() => setStatusModalOpen(false)} 
                    candidate={selectedCandidate}
                    onStatusUpdated={fetchCandidates}
                />
            )}
            <CvProcessingModal
                isOpen={cvProcessingModalOpen}
                onClose={() => setCvProcessingModalOpen(false)}
                onProcessingComplete={fetchCandidates}
                dropdownData={{ sources, classifications, positions, projects }}
            />
        </div>
    );
};

export default CandidatesPage;