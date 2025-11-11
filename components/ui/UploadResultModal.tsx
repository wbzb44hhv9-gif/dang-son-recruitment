import React from 'react';

interface UploadResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    successes: { fileName: string; candidateName: string }[];
    failures: { fileName: string; error: string }[];
}

const UploadResultModal: React.FC<UploadResultModalProps> = ({ isOpen, onClose, successes, failures }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-text-main mb-4">Kết quả nhập CV</h3>
                
                {successes.length > 0 && (
                    <div className="mb-4">
                        <h4 className="font-semibold text-green-600">Thành công ({successes.length})</h4>
                        <ul className="mt-2 text-sm list-disc list-inside bg-green-50 p-3 rounded-md">
                            {successes.map((s, i) => (
                                <li key={i}><span className="font-medium">{s.fileName}</span> &rarr; đã tạo ứng viên <span className="font-semibold">{s.candidateName}</span></li>
                            ))}
                        </ul>
                    </div>
                )}

                {failures.length > 0 && (
                     <div>
                        <h4 className="font-semibold text-error">Thất bại ({failures.length})</h4>
                        <ul className="mt-2 text-sm list-disc list-inside bg-red-50 p-3 rounded-md">
                             {failures.map((f, i) => (
                                <li key={i}><span className="font-medium">{f.fileName}</span> - Lỗi: {f.error}</li>
                            ))}
                        </ul>
                    </div>
                )}


                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                    >
                        Đã hiểu
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadResultModal;
