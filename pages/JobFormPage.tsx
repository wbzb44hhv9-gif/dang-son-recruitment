import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { JobPosting, Project, JobStatus, JobType } from '../types';
import FormSkeleton from '../components/ui/skeletons/FormSkeleton';
import { useToast } from '../context/ToastContext';
import Card from '../components/ui/Card';

type FormData = Omit<JobPosting, 'id' | 'createdAt' | 'updatedAt' | 'candidateCount' | 'projectName'>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const JobFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<FormData>({
        jobCode: '', title: '', department: '', projectId: '', location: '',
        jobType: JobType.FULL_TIME, status: JobStatus.DRAFT, deadline: '',
        description: '', requirements: '', benefits: '',
    });
    const [projectAddress, setProjectAddress] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        const fetchPrerequisites = async () => {
            try {
                const projectsData = await api.getAllProjects();
                setProjects(projectsData);

                if (isEditMode && id) {
                    const jobData = await api.getJobById(id);
                    if (jobData) {
                        const { projectName, candidateCount, createdAt, updatedAt, ...rest } = jobData;
                        setFormData(rest);
                        const project = projectsData.find(p => p.id === jobData.projectId);
                        if (project) setProjectAddress(project.address);
                    } else {
                        showToast("Không tìm thấy tin tuyển dụng.", 'error');
                        navigate('/tin-tuyen-dung');
                    }
                }
            } catch (error) {
                showToast("Tải dữ liệu thất bại.", 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchPrerequisites();
    }, [id, isEditMode, navigate, showToast]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.jobCode.trim()) newErrors.jobCode = "Mã vị trí là bắt buộc.";
        else if (!/^XD\.\d{3,}$/.test(formData.jobCode)) newErrors.jobCode = "Mã vị trí phải theo dạng XD.XXX";
        if (!formData.title.trim()) newErrors.title = "Chức danh là bắt buộc.";
        if (!formData.projectId) newErrors.projectId = "Vui lòng chọn dự án.";
        if (!formData.deadline) newErrors.deadline = "Vui lòng chọn hạn nộp hồ sơ.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === 'projectId') {
            const selectedProject = projects.find(p => p.id === value);
            setProjectAddress(selectedProject ? selectedProject.address : '');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);
        try {
            if (isEditMode && id) {
                await api.updateJob(id, formData);
                showToast("Cập nhật tin tuyển dụng thành công!", 'success');
            } else {
                await api.createJob(formData);
                showToast("Tạo tin tuyển dụng thành công!", 'success');
            }
            navigate('/tin-tuyen-dung');
        } catch (error: any) {
            showToast(error.message || "Lưu tin tuyển dụng thất bại.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
             <div>
                <Link to="/tin-tuyen-dung" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">Chỉnh sửa Tin tuyển dụng</h2>
                <FormSkeleton />
            </div>
        )
    }

    return (
        <div>
            <Link to="/tin-tuyen-dung" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">{isEditMode ? 'Chỉnh sửa Tin tuyển dụng' : 'Tạo Tin tuyển dụng Mới'}</h2>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FormField label="Mã vị trí *" error={errors.jobCode}><input type="text" name="jobCode" value={formData.jobCode} onChange={handleChange} /></FormField>
                        <FormField label="Chức danh *" error={errors.title}><input type="text" name="title" value={formData.title} onChange={handleChange} /></FormField>
                        <FormField label="Phòng ban"><input type="text" name="department" value={formData.department} onChange={handleChange} /></FormField>
                        <FormField label="Dự án *" error={errors.projectId}>
                            <select name="projectId" value={formData.projectId} onChange={handleChange}>
                                <option value="">Chọn dự án</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Địa chỉ dự án">
                            <input type="text" value={projectAddress} readOnly className="bg-gray-100" />
                        </FormField>
                        <FormField label="Khu vực"><input type="text" name="location" value={formData.location} onChange={handleChange} /></FormField>
                        <FormField label="Loại hình">
                            <select name="jobType" value={formData.jobType} onChange={handleChange}>
                                {Object.values(JobType).map(jt => <option key={jt} value={jt}>{jt}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Trạng thái">
                            <select name="status" value={formData.status} onChange={handleChange}>
                                 {Object.values(JobStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Hạn nộp hồ sơ *" error={errors.deadline}><input type="date" name="deadline" value={formData.deadline} onChange={handleChange} /></FormField>
                    </div>
                    <div className="space-y-4">
                        <FormField label="Mô tả công việc"><textarea name="description" value={formData.description} onChange={handleChange} rows={5}></textarea></FormField>
                        <FormField label="Yêu cầu"><textarea name="requirements" value={formData.requirements} onChange={handleChange} rows={5}></textarea></FormField>
                        <FormField label="Quyền lợi"><textarea name="benefits" value={formData.benefits} onChange={handleChange} rows={5}></textarea></FormField>
                    </div>
                    <div className="flex justify-end pt-4 space-x-3">
                        <Link to="/tin-tuyen-dung" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu tin'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

const FormField: React.FC<{label: string, error?: string, children: React.ReactNode}> = ({label, error, children}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            {React.Children.map(children, child =>
                React.isValidElement(child) ? React.cloneElement(child, { 
                    className: `block w-full px-3 py-2 border rounded-lg shadow-sm sm:text-sm ${(child.props as any).readOnly ? 'bg-gray-100 cursor-not-allowed' : ''} ${error ? 'border-error' : 'border-border-color'} focus:outline-none focus:ring-primary focus:border-primary`
                 } as React.AllHTMLAttributes<HTMLElement>) : child
            )}
        </div>
        {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
);

export default JobFormPage;