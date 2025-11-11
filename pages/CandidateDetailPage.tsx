import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Candidate, CandidateStatus } from '../types';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { formatCurrencyVND, formatDate } from '../utils/formatters';
import DetailSkeleton from '../components/ui/skeletons/DetailSkeleton';

const getStatusColor = (status: CandidateStatus): 'green' | 'blue' | 'yellow' | 'red' | 'gray' => {
    switch (status) {
        case CandidateStatus.HIRED:
        case CandidateStatus.OFFER_SENT:
        case CandidateStatus.SALARY_APPROVED:
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

const CandidateDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            if (!id) return;
            try {
                const data = await api.getCandidateById(id);
                if (data) setCandidate(data);
            } catch (error) {
                console.error("Failed to fetch candidate:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCandidate();
    }, [id]);

    if (loading) {
        return (
             <div>
                <Link to="/ung-vien" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
                <DetailSkeleton />
            </div>
        );
    }

    if (!candidate) return <div className="text-center text-gray-500">Không tìm thấy ứng viên.</div>;

    return (
        <div>
            <Link to="/ung-vien" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-start">
                             <div>
                                <h2 className="text-2xl font-bold text-gray-800">{candidate.name}</h2>
                                <p className="text-md text-gray-600">Mã: {candidate.candidateCode}</p>
                                <p className="text-md text-gray-500">Ứng tuyển vị trí: <span className="font-semibold">{candidate.positionName || 'Chưa cập nhật'}</span></p>
                            </div>
                            <Badge color={getStatusColor(candidate.status)}>{candidate.status}</Badge>
                        </div>
                    </Card>
                    <Card title="Thông tin chi tiết">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <InfoItem label="Email" value={candidate.email} />
                            <InfoItem label="Số điện thoại" value={candidate.phone} />
                            <InfoItem label="Ngày sinh" value={formatDate(candidate.dateOfBirth) || 'Chưa cập nhật'} />
                            <InfoItem label="Chuyên ngành" value={candidate.major || 'Chưa cập nhật'} />
                            <InfoItem label="Nguồn" value={candidate.sourceName || 'Chưa cập nhật'} />
                            <InfoItem label="Phân loại" value={candidate.classificationName || 'Chưa cập nhật'} />
                            <InfoItem label="Dự án" value={candidate.projectName || 'Chưa cập nhật'} />
                            <InfoItem label="Ngày đi làm dự kiến" value={formatDate(candidate.onboardingDate) || 'Chưa có'} />
                            <InfoItem label="Ngày cần liên hệ lại" value={formatDate(candidate.followUpDate) || 'Chưa có'} />
                            <InfoItem label="Lương thử việc" value={candidate.probationarySalary > 0 ? formatCurrencyVND(candidate.probationarySalary) : 'Chưa cập nhật'} />
                            <InfoItem label="Lương chính thức" value={candidate.officialSalary > 0 ? formatCurrencyVND(candidate.officialSalary) : 'Chưa cập nhật'} />
                        </div>
                        {candidate.note && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-500">Ghi chú</p>
                                <p className="text-md font-medium text-text-main whitespace-pre-wrap">{candidate.note}</p>
                            </div>
                        )}
                        {candidate.cvUrl && (
                            <div className="mt-4 pt-4 border-t">
                                <p className="text-sm text-gray-500">CV đính kèm</p>
                                <a href={candidate.cvUrl} target="_blank" rel="noopener noreferrer" className="text-md font-medium text-primary hover:underline">
                                    Xem CV
                                </a>
                            </div>
                        )}
                         <div className="mt-4 pt-4 border-t flex justify-end">
                            <button onClick={() => navigate(`/ung-vien/sua/${candidate.id}`)} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700">Chỉnh sửa thông tin</button>
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <Card title="Lịch sử trạng thái">
                        <ul className="space-y-4">
                            {candidate.statusLogs.map((log, index) => (
                                <li key={index} className="flex space-x-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-3 h-3 rounded-full mt-1 ${index === 0 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                        {index < candidate.statusLogs.length - 1 && <div className="w-0.5 flex-grow bg-gray-300"></div>}
                                    </div>
                                    <div>
                                        <p className={`font-semibold ${index === 0 ? 'text-text-main' : 'text-gray-600'}`}>{log.status}</p>
                                        <p className="text-xs text-gray-500">bởi {log.updatedBy} lúc {formatDate(log.updatedAt)}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{label: string, value?: string}> = ({label, value}) => (
    <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-md font-medium text-text-main">{value}</p>
    </div>
);

export default CandidateDetailPage;