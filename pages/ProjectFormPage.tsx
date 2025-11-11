import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Project } from '../types';
import { XMarkIcon } from '../components/icons/Icons';
import { useToast } from '../context/ToastContext';
import FormSkeleton from '../components/ui/skeletons/FormSkeleton';

type FormErrors = Partial<Record<keyof Omit<Project, 'id' | 'images' | 'updatedAt'>, string>>;

const ProjectFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        investor: '',
        manager: '',
        phone: '',
    });
    const [images, setImages] = useState<string[]>([]);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(isEditMode);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const initialImageCount = useRef(0);

    useEffect(() => {
        if (isEditMode) {
            const fetchProject = async () => {
                try {
                    const data = await api.getProjectById(id!);
                    if (data) {
                        const { name, address, investor, manager, phone, images: existingImages } = data;
                        setFormData({ name, address, investor, manager, phone });
                        setImages(existingImages);
                        initialImageCount.current = existingImages.length;
                    } else {
                        showToast("Không tìm thấy dự án.", 'error');
                        navigate('/du-an');
                    }
                } catch (error) {
                    showToast("Tải dữ liệu dự án thất bại.", 'error');
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [id, isEditMode, navigate, showToast]);

    const validate = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.name.trim()) newErrors.name = "Tên dự án là bắt buộc.";
        if (!formData.address.trim()) newErrors.address = "Địa chỉ là bắt buộc.";
        if (!formData.investor.trim()) newErrors.investor = "Chủ đầu tư là bắt buộc.";
        
        const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})\b$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            newErrors.phone = "Số điện thoại không đúng định dạng Việt Nam.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalImages = images.length + imageFiles.length + files.length;
            if (totalImages > 6) {
                showToast("Bạn chỉ có thể tải lên tối đa 6 ảnh.", 'error');
                return;
            }
            setImageFiles(prev => [...prev, ...files]);

            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    if (typeof reader.result === 'string') {
                        setImages(prev => [...prev, reader.result]);
                    }
                };
                // FIX: Add type assertion to resolve 'unknown' type error.
                reader.readAsDataURL(file as File);
            });
        }
    };

    const removeImage = (index: number) => {
        const fileIndexToRemove = index - initialImageCount.current;
        
        setImages(prev => prev.filter((_, i) => i !== index));

        if (fileIndexToRemove >= 0) {
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndexToRemove));
        } else {
            initialImageCount.current--;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSubmitting(true);
        try {
            const uploadedImageUrls = await Promise.all(
                imageFiles.map(file => api.uploadImage(file).then(res => res.url))
            );
            
            // This logic is for mock only. Real app would combine existing and new URLs.
            const projectPayload = {
                ...formData,
                images: images, 
            };

            if (isEditMode) {
                await api.updateProject(id!, projectPayload);
                showToast('Cập nhật dự án thành công!', 'success');
            } else {
                await api.createProject(projectPayload);
                showToast('Tạo dự án mới thành công!', 'success');
            }
            navigate('/du-an');
        } catch (error: any) {
            showToast(error.message || "Lưu dự án thất bại.", 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    if (loading) {
        return (
             <div>
                <Link to="/du-an" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
                <h2 className="text-3xl font-semibold text-gray-700 mb-6">Chỉnh sửa Dự án</h2>
                <FormSkeleton />
            </div>
        )
    }

    return (
        <div>
            <Link to="/du-an" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách</Link>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">{isEditMode ? 'Chỉnh sửa Dự án' : 'Tạo Dự án Mới'}</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Tên dự án *" error={errors.name}><input type="text" name="name" value={formData.name} onChange={handleInputChange} /></FormField>
                        <FormField label="Chủ đầu tư *" error={errors.investor}><input type="text" name="investor" value={formData.investor} onChange={handleInputChange} /></FormField>
                    </div>
                     <FormField label="Địa chỉ *" error={errors.address}><input type="text" name="address" value={formData.address} onChange={handleInputChange} /></FormField>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="GĐDA / CHT / CPT"><input type="text" name="manager" value={formData.manager} onChange={handleInputChange} /></FormField>
                        <FormField label="Số điện thoại" error={errors.phone}><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} /></FormField>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Hình ảnh (tối đa 6)</label>
                        <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img src={img} alt={`preview ${index}`} className="w-full h-full object-cover rounded-lg" />
                                    <button type="button" onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-error text-white rounded-full p-0.5"><XMarkIcon/></button>
                                </div>
                            ))}
                            {images.length < 6 && (
                                <label htmlFor="image-upload" className="cursor-pointer flex items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-primary hover:text-primary">
                                    <span>+ Thêm ảnh</span>
                                    <input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageChange} className="sr-only" />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <Link to="/du-an" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Hủy</Link>
                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
                            {isSubmitting ? 'Đang lưu...' : (isEditMode ? 'Lưu thay đổi' : 'Tạo dự án')}
                        </button>
                    </div>
                </form>
            </div>
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

export default ProjectFormPage;