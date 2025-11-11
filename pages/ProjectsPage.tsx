import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Project } from '../types';
import Pagination from '../components/ui/Pagination';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { PlusCircleIcon, FunnelIcon } from '../components/icons/Icons';
import { useToast } from '../context/ToastContext';
import TableSkeleton from '../components/ui/skeletons/TableSkeleton';
import Card from '../components/ui/Card';

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 10;
    
    const [searchTerm, setSearchTerm] = useState('');
    const [investorFilter, setInvestorFilter] = useState('');
    const [investors, setInvestors] = useState<string[]>([]);

    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const [isFiltersVisible, setFiltersVisible] = useState(false);

    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.getProjects({ 
                page: currentPage, 
                limit: itemsPerPage,
                search: debouncedSearchTerm,
                investor: investorFilter
            });
            setProjects(response.data);
            setTotalItems(response.total);
        } catch (err: any) {
            showToast(err.message || "Không thể tải danh sách dự án.", 'error');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearchTerm, investorFilter, showToast]);
    
    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    useEffect(() => {
        const fetchInvestors = async () => {
            try {
                const data = await api.getInvestors();
                setInvestors(data);
            } catch (error) {
                showToast("Lỗi tải danh sách chủ đầu tư.", 'error');
                console.error("Failed to fetch investors", error);
            }
        };
        fetchInvestors();
    }, [showToast]);

    const openDeleteModal = (project: Project) => {
        setProjectToDelete(project);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setProjectToDelete(null);
        setDeleteModalOpen(false);
    };

    const handleDeleteProject = async () => {
        if (!projectToDelete) return;
        try {
            await api.deleteProject(projectToDelete.id);
            showToast(`Đã xóa dự án "${projectToDelete.name}".`, 'success');
            fetchProjects(); // Refresh list
        } catch (error: any) {
            showToast(error.message || "Xóa dự án thất bại.", 'error');
            console.error(error);
        } finally {
            closeDeleteModal();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-semibold text-gray-700">Danh sách Dự án</h2>
                <Link to="/du-an/tao-moi" className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <PlusCircleIcon />
                    <span className="ml-2">Tạo dự án mới</span>
                </Link>
            </div>
            
            <Card className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <input
                        type="text"
                        placeholder="Tìm theo tên, địa chỉ, CĐT..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                    />
                    <button onClick={() => setFiltersVisible(!isFiltersVisible)} className="p-2 border rounded-lg md:hidden">
                        <FunnelIcon />
                    </button>
                </div>
                <div className={`${isFiltersVisible ? 'block' : 'hidden'} md:block transition-all duration-300`}>
                     <select
                        value={investorFilter}
                        onChange={(e) => setInvestorFilter(e.target.value)}
                        className="w-full md:w-1/3 px-3 py-2 border border-border-color rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white"
                    >
                        <option value="">Tất cả Chủ đầu tư</option>
                        {investors.map(inv => <option key={inv} value={inv}>{inv}</option>)}
                    </select>
                </div>
            </Card>

            {loading ? <TableSkeleton /> : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên dự án</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chủ đầu tư</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GĐDA/SĐT</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Số ảnh</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                            <div className="text-sm text-gray-500 max-w-xs truncate">{project.address}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{project.investor}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{project.manager}</div>
                                            <div className="text-sm text-gray-500">{project.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{project.images.length}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.updatedAt}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button onClick={() => navigate(`/du-an/${project.id}`)} className="text-indigo-600 hover:text-indigo-900">Chi tiết</button>
                                            <button onClick={() => navigate(`/du-an/sua/${project.id}`)} className="text-primary hover:text-blue-700">Sửa</button>
                                            <button onClick={() => openDeleteModal(project)} className="text-error hover:text-red-800">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {totalItems > itemsPerPage && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    )}
                </div>
            )}
             <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteProject}
                title="Xác nhận xóa dự án"
                message={`Bạn có chắc chắn muốn xóa dự án "${projectToDelete?.name}" không? Hành động này không thể hoàn tác.`}
            />
        </div>
    );
};

export default ProjectsPage;