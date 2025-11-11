import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { JobPosting, Project, Candidate, JobStatus, CandidateStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatCurrencyVND } from '../utils/formatters';
import DetailSkeleton from '../components/ui/skeletons/DetailSkeleton';

const getStatusColor = (status: JobStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
        case JobStatus.POSTING: return 'green';
        case JobStatus.PAUSED: return 'yellow';
        case JobStatus.FILLED: return 'gray';
        default: return 'gray';
    }
};

const getCandidateStatusColor = (status: CandidateStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
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

const JobDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobPosting | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'jd' | 'candidates'>('jd');

    useEffect(() => {
        const fetchJobData = async () => {
            if (!id) return;
            try {
                const jobData = await api.getJobById(id);
                if (jobData) {
                    setJob(jobData);
                    const [projectData, candidatesData] = await Promise.all([
                        api.getProjectById(jobData.projectId),
                        api.getCandidatesByJobId(jobData.id)
                    ]);
                    setProject(projectData || null);
                    setCandidates(candidatesData);
                }
            } catch (error) {
                console.error("Failed to fetch job details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobData();
    }, [id]);

    if (loading) {
         return (
             <div>
                <Link to="/tin-tuyen-dung" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách tin</Link>
                <DetailSkeleton />
            </div>
        )
    }
    
    if (!job) return <div className="text-center text-gray-500">Không tìm thấy tin tuyển dụng.</div>;

    return (
        <div>
            <Link to="/tin-tuyen-dung" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách tin</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-primary">{job.jobCode}</p>
                                <h2 className="text-3xl font-bold text-gray-800">{job.title}</h2>
                                <p className="text-lg text-gray-600 mt-1">{job.department}</p>
                                <p className="text-sm text-gray-500">Hạn nộp: {job.deadline}</p>
                            </div>
                            <Badge color={getStatusColor(job.status)}>{job.status}</Badge>
                        </div>
                    </Card>

                    <Card>
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                <button onClick={() => setActiveTab('jd')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'jd' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Mô tả công việc
                                </button>
                                 <button onClick={() => setActiveTab('candidates')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'candidates' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                    Ứng viên ({candidates.length})
                                </button>
                            </nav>
                        </div>
                        <div className="pt-6">
                            {activeTab === 'jd' && (
                                <div className="space-y-4 prose max-w-none">
                                    <h4 className="font-semibold text-gray-700">Mô tả công việc</h4>
                                    <p className="whitespace-pre-wrap">{job.description}</p>
                                    <h4 className="font-semibold text-gray-700">Yêu cầu</h4>
                                    <p className="whitespace-pre-wrap">{job.requirements}</p>
                                    <h4 className="font-semibold text-gray-700">Quyền lợi</h4>
                                    <p className="whitespace-pre-wrap">{job.benefits}</p>
                                </div>
                            )}
                            {activeTab === 'candidates' && (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                        <thead>
                                            <tr>
                                                {['Họ tên', 'Liên hệ', 'Trạng thái', 'Lương', 'Ngày đi làm'].map(h => 
                                                    <th key={h} className="pb-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {candidates.map(c => (
                                                <tr key={c.id} className="border-t">
                                                    <td className="py-3 pr-3"><div className="text-sm font-medium">{c.name}</div><div className="text-xs text-gray-500">{c.positionName}</div></td>
                                                    <td className="py-3 pr-3"><div className="text-sm">{c.phone}</div><div className="text-xs text-gray-500">{c.email}</div></td>
                                                    <td className="py-3 pr-3"><Badge color={getCandidateStatusColor(c.status)}>{c.status}</Badge></td>
                                                    <td className="py-3 pr-3"><div className="text-sm">{formatCurrencyVND(c.probationarySalary)}</div></td>
                                                    <td className="py-3 pr-3"><div className="text-sm">{c.onboardingDate || '-'}</div></td>
                                                    <td className="py-3"><button onClick={() => navigate(`/ung-vien/${c.id}`)} className="text-sm text-primary hover:underline">Xem hồ sơ</button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    {project && (
                         <Card title="Thông tin dự án">
                             <div className="space-y-3">
                                <div><p className="text-sm text-gray-500">Tên dự án</p><p className="font-medium">{project.name}</p></div>
                                <div><p className="text-sm text-gray-500">Địa chỉ</p><p>{project.address}</p></div>
                                <div><p className="text-sm text-gray-500">Chủ đầu tư</p><p>{project.investor}</p></div>
                                <div><p className="text-sm text-gray-500">GĐDA/CHT</p><p>{project.manager} - {project.phone}</p></div>
                             </div>
                             <div className="mt-4 pt-4 border-t flex">
                                 <button onClick={() => navigate(`/du-an/${project.id}`)} className="w-full text-center px-4 py-2 bg-blue-50 text-primary rounded-lg hover:bg-blue-100">Xem chi tiết dự án</button>
                             </div>
                         </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;