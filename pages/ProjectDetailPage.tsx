import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import { Project } from '../types';
import Card from '../components/ui/Card';
import Lightbox from '../components/ui/Lightbox';
import DetailSkeleton from '../components/ui/skeletons/DetailSkeleton';

const ProjectDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;
            try {
                const data = await api.getProjectById(id);
                if (data) {
                    setProject(data);
                }
            } catch (error) {
                console.error("Failed to fetch project:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const openLightbox = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setLightboxOpen(true);
    };

    if (loading) {
        return (
            <div>
                <Link to="/du-an" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách dự án</Link>
                <DetailSkeleton />
            </div>
        )
    }

    if (!project) return <div className="text-center text-gray-500">Không tìm thấy dự án.</div>;

    return (
        <div>
            <Link to="/du-an" className="text-sm text-primary hover:underline mb-4 inline-block">&larr; Quay lại danh sách dự án</Link>
            
            <Card>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{project.name}</h2>
                        <p className="text-lg text-gray-600 mt-1">{project.address}</p>
                    </div>
                    <button 
                        onClick={() => navigate(`/du-an/sua/${project.id}`)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
                    >
                        Sửa thông tin
                    </button>
                </div>

                <div className="border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Thông tin chi tiết</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Chủ đầu tư</p>
                            <p className="text-md font-medium text-text-main">{project.investor}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">GĐDA / CHT / CPT</p>
                            <p className="text-md font-medium text-text-main">{project.manager}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p className="text-md font-medium text-text-main">{project.phone}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Cập nhật lần cuối</p>
                            <p className="text-md font-medium text-text-main">{project.updatedAt}</p>
                        </div>
                     </div>
                </div>

                <div className="mt-6 border-t pt-6">
                    <h3 className="text-xl font-semibold mb-4">Thư viện ảnh ({project.images.length})</h3>
                    {project.images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {project.images.map((img, index) => (
                                <div key={index} className="aspect-w-1 aspect-h-1 cursor-pointer" onClick={() => openLightbox(img)}>
                                    <img src={img} alt={`Project image ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md hover:opacity-80 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">Chưa có hình ảnh cho dự án này.</p>
                    )}
                </div>
            </Card>
            <Lightbox isOpen={lightboxOpen} onClose={() => setLightboxOpen(false)} imageUrl={selectedImage} />
        </div>
    );
};

export default ProjectDetailPage;