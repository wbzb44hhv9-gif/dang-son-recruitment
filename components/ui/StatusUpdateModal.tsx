import React, { useState } from 'react';
import { api } from '../../services/mockApiService';
import { Candidate, CandidateStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: Candidate;
    onStatusUpdated: () => void;
}

const statusWorkflow: CandidateStatus[] = [
    CandidateStatus.APPLIED,
    CandidateStatus.SCREENED,
    CandidateStatus.SENT_TO_DIRECTOR,
    CandidateStatus.INTERVIEW_SCHEDULED,
    CandidateStatus.SALARY_PROPOSED,
    CandidateStatus.SALARY_APPROVED,
    CandidateStatus.OFFER_SENT,
    CandidateStatus.HIRED,
    CandidateStatus.REJECTED,
];

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({ isOpen, onClose, candidate, onStatusUpdated }) => {
    const [newStatus, setNewStatus] = useState<CandidateStatus>(candidate.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setIsSubmitting(true);
        try {
            await api.updateCandidateStatus(candidate.id, newStatus);
            showToast('Cập nhật trạng thái thành công!', 'success');
            onStatusUpdated();
            onClose();
        } catch (error) {
            showToast('Cập nhật trạng thái thất bại.', 'error');
            console.error("Failed to update status:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Allow moving to any next status or to Rejected
    const currentStatusIndex = statusWorkflow.indexOf(candidate.status);
    let availableStatuses = statusWorkflow.slice(currentStatusIndex);
    if (candidate.status !== CandidateStatus.REJECTED) {
        availableStatuses.push(CandidateStatus.REJECTED);
    }
     availableStatuses = [...new Set(availableStatuses)]; // Remove duplicates


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-text-main">Cập nhật trạng thái</h3>
                <p className="mt-2 text-gray-600">Ứng viên: <span className="font-medium">{candidate.name}</span></p>
                <p className="mt-1 text-sm text-gray-500">Trạng thái hiện tại: <span className="font-medium">{candidate.status}</span></p>
                
                <div className="mt-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Chuyển sang trạng thái mới</label>
                    <select
                        id="status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as CandidateStatus)}
                        className="mt-1 block w-full px-3 py-2 border border-border-color bg-white rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    >
                        {availableStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Hủy</button>
                    <button onClick={handleConfirm} disabled={isSubmitting || newStatus === candidate.status} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                        {isSubmitting ? "Đang lưu..." : "Xác nhận"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatusUpdateModal;