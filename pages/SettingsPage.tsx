import React from 'react';
import { NavLink, useParams, Navigate } from 'react-router-dom';
import { api } from '../services/mockApiService';
import CategoryManagementPage from './settings/CategoryManagementPage';
import GeneralSettingsPage from './settings/GeneralSettingsPage';

const SettingsPage: React.FC = () => {
    const { subpage } = useParams<{ subpage: string }>();

    if (!subpage) {
        return <Navigate to="/cai-dat/chung" replace />;
    }

    const renderContent = () => {
        switch (subpage) {
            case 'chung':
                return <GeneralSettingsPage />;
            case 'nguon-ung-vien':
                return <CategoryManagementPage 
                    title="Quản lý Nguồn ứng viên"
                    itemName="nguồn ứng viên"
                    api_get={api.getCandidateSources}
                    api_create={api.createSource}
                    api_update={api.updateSource}
                    api_delete={api.deleteSource}
                />;
            case 'phan-loai':
                return <CategoryManagementPage 
                    title="Quản lý Phân loại"
                    itemName="phân loại"
                    api_get={api.getClassifications}
                    api_create={api.createClassification}
                    api_update={api.updateClassification}
                    api_delete={api.deleteClassification}
                />;
            case 'vi-tri':
                return <CategoryManagementPage 
                    title="Quản lý Vị trí"
                    itemName="vị trí"
                    api_get={api.getPositions}
                    api_create={api.createPosition}
                    api_update={api.updatePosition}
                    api_delete={api.deletePosition}
                />;
            default:
                return <Navigate to="/cai-dat/chung" replace />;
        }
    };
    
    const navItems = [
      { to: "/cai-dat/chung", label: "Chung" },
      { to: "/cai-dat/nguon-ung-vien", label: "Nguồn ứng viên" },
      { to: "/cai-dat/phan-loai", label: "Phân loại" },
      { to: "/cai-dat/vi-tri", label: "Vị trí" },
    ];

    return (
        <div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-6">Cài đặt</h2>
            <div className="flex flex-col md:flex-row">
                <nav className="flex flex-row md:flex-col md:space-y-2 md:w-1/4 md:pr-8 mb-6 md:mb-0 overflow-x-auto">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `px-4 py-2 rounded-lg text-left whitespace-nowrap ${isActive ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="w-full md:w-3/4">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;