import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Candidate, SettingItem, Project } from '../types';
import FormSkeleton from '../components/ui/skeletons/FormSkeleton';
import { useToast } from '../context/ToastContext';
// FIX: Import Card component.
import Card from '../components/ui/Card';

type FormData = Omit<Candidate, 'id' | 'candidateCode' | 'statusLogs' | 'status' | 'avatarUrl' | 'createdAt' | 'updatedAt'>;
type FormErrors = Partial<Record<keyof FormData, string>>;

const CandidateFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState<FormData>({
        name: '', phone: '', email: '', dateOfBirth: '', major: '', sourceId: '', classificationId: '',
        positionId: '', projectId: '', probationarySalary: 0, officialSalary: 0,
        onboardingDate: '', followUpDate: '', cvUrl: '', note: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [sources, setSources] = useState<SettingItem[]>([]);
    const [classifications, setClassifications] = useState<SettingItem[]>([]);
    const [positions, setPositions] = useState<SettingItem[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    const [cvFile, setCvFile] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    
    const [useAi, setUseAi] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [aiScore, setAiScore] = useState<number | null>(null);

    useEffect(() => {
        const fetchDropdownData = async () => {
            try {
                const [src, cls, pos, prj] = await Promise.all([
                    api.getCandidateSources(),
                    api.getClassifications(),
                    api.getPositions(),
                    api.getAllProjects()
                ]);
                setSources(src);
                setClassifications(cls);
                setPositions(pos);
                setProjects(prj);
            } catch {
                showToast("Tải dữ liệu thất bại.", 'error');
            }
        };
        
        const fetchCandidate = async () => {
            if (!id) return;
            try {
                const data = await api.getCandidateById(id);
                if (data) {
                    setFormData(data);
                    if (data.aiSummary) setAiSummary(data.aiSummary);
                    if (data.aiScore) setAiScore(data.aiScore);
                }
            } catch (error) {
                showToast("Tải thông tin ứng viên thất bại.", 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchDropdownData();
        if (isEditMode) fetchCandidate();
    }, [id, isEditMode, showToast]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "Họ tên là bắt buộc.";
        if (!formData.phone.trim()) newErrors.phone = "Số điện thoại là bắt buộc.";
        else if (!/^(0[3|5|7|8|9])+([0-9]{8})\b$/.test(formData.phone)) newErrors.phone = "SĐT không đúng định dạng VN.";
        if (!formData.email.trim()) newErrors.email = "Email là bắt buộc.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Email không hợp lệ.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (useAi || (isEditMode && aiSummary)) {
                payload.aiSummary = aiSummary;
                payload.aiScore = aiScore ?? undefined;
            }

            if (isEditMode) {
                await api.updateCandidate(id!, payload);
                showToast('Cập nhật ứng viên thành công!', 'success');
            } else {
                 if (cvFile) {
                    const { url } = await api.uploadCvToDrive(cvFile);
                    payload.cvUrl = url;
                }
                await api.createCandidate(payload);
                showToast('Tạo ứng viên thành công!', 'success');
            }
            navigate('/ung-vien');
        } catch (error: any) {
            showToast(error.message || "Lưu thông tin thất bại.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0]);
        }
    };

    const handleCvExtract = async () => {
        if (!cvFile) {
            showToast('Vui lòng chọn một tệp CV để trích xuất.', 'error');
            return;
        }

        setIsExtracting(true);
        setAiSummary('');
        setAiScore(null);

        try {
            const base64 = await fileToBase64(cvFile);
            const extractedData = await api.parseCvWithGemini({
                base64,
                mimeType: cvFile.type,
            });

            setFormData(prev => ({
                ...prev,
                name: extractedData.name || prev.name,
                email: extractedData.email || prev.email,
                phone: extractedData.phone || prev.phone,
                major: extractedData.major || prev.major,
                dateOfBirth: extractedData.dateOfBirth || prev.dateOfBirth,
            }));
            showToast('Trích xuất thông tin cơ bản thành công!', 'success');
            
            if (useAi) {
                const [summary, score] = await Promise.all([
                    api.summarizeCv(cvFile),
                    api.scoreMatch({ name: extractedData.name }, formData.positionId)
                ]);
                setAiSummary(summary);
                setAiScore(score);
                showToast('AI đã tóm tắt và chấm điểm CV.', 'success');
            }
            
        } catch (error: any) {
            showToast(error.message || 'Đã xảy ra lỗi khi trích xuất thông tin.', 'error');
        } finally {
            setIsExtracting(false);
        }
    };


    if (loading) {
        return (
             <div>
                <Link to="/ung-vien" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">Chỉnh sửa Ứng viên</h2>
                <FormSkeleton />
            </div>
        )
    }

    return (
        <div>
            <Link to="/ung-vien" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">{isEditMode ? 'Chỉnh sửa Ứng viên' : 'Tạo Ứng viên Mới'}</h2>

            {!isEditMode && (
                 <Card className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Tạo nhanh từ CV</h3>
                    <p className="text-sm text-gray-500 mb-4">Tải lên CV của ứng viên (PDF, DOC, DOCX) và hệ thống sẽ tự động điền các thông tin cơ bản.</p>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                             <input 
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100"
                             />
                        </div>
                        <button
                            type="button"
                            onClick={handleCvExtract}
                            disabled={!cvFile || isExtracting}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                        >
                            {isExtracting ? (
                                <>
                                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Đang xử lý...
                                </>
                            ) : 'Trích xuất thông tin'}
                        </button>
                    </div>
                     <div className="mt-4 pt-4 border-t">
                        <label className="flex items-center">
                            <input type="checkbox" checked={useAi} onChange={e => setUseAi(e.target.checked)} className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"/>
                            <span className="ml-2 text-sm font-medium text-gray-700">Dùng AI tóm tắt & chấm điểm (demo)</span>
                        </label>
                        {useAi && aiSummary && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-semibold text-primary">AI Đánh giá</h4>
                                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{aiSummary}</p>
                                {aiScore !== null && (
                                    <p className="text-sm font-semibold mt-2">Độ phù hợp: <span className="text-lg text-green-600">{aiScore}/100</span></p>
                                )}
                            </div>
                        )}
                     </div>
                </Card>
            )}
            
            {isEditMode && aiSummary && (
                 <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-primary">AI Đánh giá</h4>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{aiSummary}</p>
                    {aiScore !== null && (
                        <p className="text-sm font-semibold mt-2">Độ phù hợp: <span className="text-lg text-green-600">{aiScore}/100</span></p>
                    )}
                </div>
            )}

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Họ tên *" error={errors.name}>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />
                        </FormField>
                         <FormField label="Số điện thoại *" error={errors.phone}>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                        </FormField>
                        <FormField label="Email *" error={errors.email}>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} />
                        </FormField>
                        <FormField label="Ngày sinh">
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Chuyên ngành">
                            <input type="text" name="major" value={formData.major || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Nguồn ứng viên" error={errors.sourceId}>
                            <select name="sourceId" value={formData.sourceId} onChange={handleChange}>
                                <option value="">Chọn nguồn</option>
                                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </FormField>
                         <FormField label="Phân loại" error={errors.classificationId}>
                            <select name="classificationId" value={formData.classificationId} onChange={handleChange}>
                                <option value="">Chọn phân loại</option>
                                {classifications.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Vị trí" error={errors.positionId}>
                            <select name="positionId" value={formData.positionId} onChange={handleChange}>
                                <option value="">Chọn vị trí</option>
                                {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Dự án" error={errors.projectId}>
                            <select name="projectId" value={formData.projectId} onChange={handleChange}>
                                <option value="">Chọn dự án</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </FormField>
                         <FormField label="Ngày đi làm dự kiến">
                            <input type="date" name="onboardingDate" value={formData.onboardingDate || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Ngày liên hệ lại">
                            <input type="date" name="followUpDate" value={formData.followUpDate || ''} onChange={handleChange} />
                        </FormField>
                        <FormField label="Lương thử việc (VNĐ)">
                            <input type="number" name="probationarySalary" value={formData.probationarySalary} onChange={handleChange} />
                        </FormField>
                        <FormField label="Lương chính thức (VNĐ)">
                            <input type="number" name="officialSalary" value={formData.officialSalary} onChange={handleChange} />
                        </FormField>
                    </div>

                    <FormField label="Ghi chú">
                        <textarea name="note" value={formData.note || ''} onChange={handleChange} rows={4}></textarea>
                    </FormField>

                    <div className="flex justify-end pt-4 space-x-3">
                        <Link to="/ung-vien" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
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
                    className: `block w-full px-3 py-2 border rounded-lg shadow-sm sm:text-sm ${error ? 'border-error' : 'border-border-color'} focus:outline-none focus:ring-primary focus:border-primary`
                 } as React.AllHTMLAttributes<HTMLElement>) : child
            )}
        </div>
        {error && <p className="text-sm text-error mt-1">{error}</p>}
    </div>
);


export default CandidateFormPage;