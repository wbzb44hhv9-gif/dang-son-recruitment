import React, { useState } from 'react';
import { api } from '../../services/mockApiService';
import { Candidate, Project, SettingItem } from '../../types';
import { XMarkIcon } from '../icons/Icons';
import { useToast } from '../../context/ToastContext';

type CandidateFormData = Omit<Candidate, 'id' | 'candidateCode' | 'statusLogs' | 'status' | 'avatarUrl' | 'createdAt' | 'updatedAt'>;

interface CvProcessingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProcessingComplete: () => void;
    dropdownData: {
        sources: SettingItem[];
        classifications: SettingItem[];
        positions: SettingItem[];
        projects: Project[];
    };
}

type FileStatus = 'pending' | 'uploading' | 'parsing' | 'review' | 'done' | 'error';

interface ProcessedFile {
    file: File;
    status: FileStatus;
    errorMessage?: string;
    formData?: CandidateFormData;
}

const CvProcessingModal: React.FC<CvProcessingModalProps> = ({ isOpen, onClose, onProcessingComplete, dropdownData }) => {
    const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
    const [files, setFiles] = useState<File[]>([]);
    const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const { showToast } = useToast();
    
    if (!isOpen) return null;

    const resetState = () => {
        setStep('upload');
        setFiles([]);
        setProcessedFiles([]);
        setIsProcessing(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (selectedFiles.length + files.length > 5) {
                showToast("Bạn chỉ có thể tải lên tối đa 5 CV cùng một lúc.", 'error');
                return;
            }
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };
    
    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    const startProcessing = async () => {
        if (files.length === 0) return;
        
        setIsProcessing(true);
        setStep('processing');
        
        const initialProcessedFiles = files.map(file => ({ file, status: 'pending' as FileStatus }));
        setProcessedFiles(initialProcessedFiles);
        
        const results = await Promise.all(files.map(async (file, index) => {
            const updateStatus = (status: FileStatus, errorMessage?: string) => {
                setProcessedFiles(prev => {
                    const newFiles = [...prev];
                    newFiles[index].status = status;
                    if (errorMessage) newFiles[index].errorMessage = errorMessage;
                    return newFiles;
                });
            };

            try {
                updateStatus('uploading');
                const { url: cvUrl } = await api.uploadCvToDrive(file);

                updateStatus('parsing');
                const base64 = await fileToBase64(file);
                const parsedInfo = await api.parseCvWithGemini({ base64, mimeType: file.type });
                
                const formData: CandidateFormData = {
                    name: parsedInfo.name || '',
                    email: parsedInfo.email || '',
                    phone: parsedInfo.phone || '',
                    dateOfBirth: parsedInfo.dateOfBirth || '',
                    major: parsedInfo.major || '',
                    cvUrl,
                    probationarySalary: 0,
                    officialSalary: 0,
                    sourceId: '',
                    classificationId: '',
                    positionId: '',
                    projectId: '',
                    onboardingDate: '',
                    followUpDate: '',
                    note: '',
                };
                
                updateStatus('review');
                return { file, status: 'review' as FileStatus, formData };

            } catch (error: any) {
                updateStatus('error', error.message || 'Lỗi không xác định');
                return { file, status: 'error' as FileStatus, errorMessage: error.message || 'Lỗi không xác định' };
            }
        }));
        
        setProcessedFiles(results);
        setIsProcessing(false);
        setStep('review');
    };

    const handleFormChange = (index: number, field: keyof CandidateFormData, value: any) => {
        setProcessedFiles(prev => {
            const newFiles = [...prev];
            if (newFiles[index]?.formData) {
                (newFiles[index].formData as any)[field] = value;
            }
            return newFiles;
        });
    };

    const handleSaveAll = async () => {
        setIsProcessing(true);
        const candidatesToCreate = processedFiles.filter(pf => pf.status === 'review' && pf.formData);
        
        const results = await Promise.all(candidatesToCreate.map(async (pf) => {
             if (pf.formData) {
                try {
                    await api.createCandidate(pf.formData);
                    return { success: true };
                } catch(e: any) {
                    return { success: false, message: e.message };
                }
             }
             return { success: false, message: 'No form data' };
        }));

        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
            showToast(`Đã tạo thành công ${successCount} ứng viên.`, 'success');
        }
        if (successCount < results.length) {
            showToast(`Có lỗi xảy ra khi tạo ${results.length - successCount} ứng viên.`, 'error');
        }

        setIsProcessing(false);
        onProcessingComplete();
        handleClose();
    };

    const renderStep = () => {
        switch (step) {
            case 'upload': return (
                <div>
                    <h3 className="text-xl font-semibold">Tải lên CVs</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Chọn tối đa 5 tệp (PDF, DOC, DOCX).</p>
                    <input type="file" multiple onChange={handleFileChange} accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-primary hover:file:bg-blue-100 mb-4" />
                    {files.length > 0 && (
                        <ul className="text-sm list-disc list-inside mb-4">
                            {files.map((f, i) => <li key={i}>{f.name}</li>)}
                        </ul>
                    )}
                    <div className="flex justify-end space-x-2">
                        <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-lg">Hủy</button>
                        <button onClick={startProcessing} disabled={files.length === 0} className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-blue-300">Bắt đầu xử lý</button>
                    </div>
                </div>
            );
            case 'processing': return (
                 <div>
                    <h3 className="text-xl font-semibold">Đang xử lý CVs...</h3>
                    <ul className="space-y-3 mt-4">
                        {processedFiles.map(({ file, status }, i) => (
                            <li key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <span className="text-sm font-medium">{file.name}</span>
                                {status === 'uploading' && <span className="text-xs text-blue-600">Đang tải lên...</span>}
                                {status === 'parsing' && <span className="text-xs text-blue-600">Đang trích xuất...</span>}
                                {status === 'error' && <span className="text-xs text-red-600">Lỗi</span>}
                            </li>
                        ))}
                    </ul>
                </div>
            );
            case 'review': return (
                 <div>
                    <h3 className="text-xl font-semibold mb-4">Xem lại và Bổ sung thông tin</h3>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {processedFiles.map((pf, index) => pf.formData ? (
                        <div key={index} className="p-4 border rounded-lg">
                             <h4 className="font-semibold">{pf.file.name}</h4>
                             <div className="grid grid-cols-2 gap-4 mt-2">
                                <FormField label="Họ tên"><input value={pf.formData.name} onChange={e => handleFormChange(index, 'name', e.target.value)} /></FormField>
                                <FormField label="Email"><input type="email" value={pf.formData.email} onChange={e => handleFormChange(index, 'email', e.target.value)} /></FormField>
                                <FormField label="SĐT"><input type="tel" value={pf.formData.phone} onChange={e => handleFormChange(index, 'phone', e.target.value)} /></FormField>
                                <FormField label="Ngày sinh"><input type="date" value={pf.formData.dateOfBirth} onChange={e => handleFormChange(index, 'dateOfBirth', e.target.value)} /></FormField>
                                <FormField label="Chuyên ngành"><input value={pf.formData.major} onChange={e => handleFormChange(index, 'major', e.target.value)} /></FormField>
                                <FormField label="Vị trí"><select value={pf.formData.positionId} onChange={e => handleFormChange(index, 'positionId', e.target.value)}><option value="">Chọn vị trí</option>{dropdownData.positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
                                <FormField label="Dự án"><select value={pf.formData.projectId} onChange={e => handleFormChange(index, 'projectId', e.target.value)}><option value="">Chọn dự án</option>{dropdownData.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></FormField>
                                <FormField label="Ngày liên hệ lại"><input type="date" value={pf.formData.followUpDate} onChange={e => handleFormChange(index, 'followUpDate', e.target.value)} /></FormField>
                                <FormField label="Lương thử việc"><input type="number" value={pf.formData.probationarySalary} onChange={e => handleFormChange(index, 'probationarySalary', e.target.value)} /></FormField>
                                <FormField label="Lương chính thức"><input type="number" value={pf.formData.officialSalary} onChange={e => handleFormChange(index, 'officialSalary', e.target.value)} /></FormField>
                             </div>
                             <div className="mt-4">
                                <FormField label="Ghi chú">
                                    <textarea 
                                        value={pf.formData.note} 
                                        onChange={e => handleFormChange(index, 'note', e.target.value)}
                                        rows={2}
                                    />
                                </FormField>
                            </div>
                        </div>
                    ) : pf.status === 'error' ? (
                        <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <h4 className="font-semibold text-red-700">{pf.file.name} - Thất bại</h4>
                            <p className="text-sm text-red-600">{pf.errorMessage}</p>
                        </div>
                    ) : null)}
                    </div>
                    <div className="flex justify-end space-x-2 mt-6 pt-4 border-t">
                        <button onClick={handleClose} className="px-4 py-2 bg-gray-200 rounded-lg">Hủy</button>
                        <button onClick={handleSaveAll} disabled={isProcessing} className="px-4 py-2 bg-primary text-white rounded-lg disabled:bg-blue-300">
                            {isProcessing ? 'Đang lưu...' : `Lưu tất cả ứng viên hợp lệ`}
                        </button>
                    </div>
                </div>
            );
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6" onClick={e => e.stopPropagation()}>
                <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"><XMarkIcon /></button>
                {renderStep()}
            </div>
        </div>
    );
};

const FormField: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
    <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child, { 
                className: `block w-full px-2 py-1.5 border border-border-color rounded-lg shadow-sm sm:text-sm focus:outline-none focus:ring-primary focus:border-primary`
             } as React.AllHTMLAttributes<HTMLElement>) : child
        )}
    </div>
);


export default CvProcessingModal;