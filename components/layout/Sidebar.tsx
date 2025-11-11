
import React from 'react';
import { NavLink } from 'react-router-dom';
import { HomeIcon, BriefcaseIcon, UserGroupIcon, ChartBarIcon, DocumentTextIcon, CogIcon } from '../icons/Icons';

interface SidebarProps {
    isOpen: boolean;
}

const DangSonLogo: React.FC<SidebarProps> = ({ isOpen }) => (
    <div className="flex items-center justify-center mt-8">
        <div className="flex items-center">
            <div className="bg-primary text-white font-bold rounded-lg p-3 text-2xl flex-shrink-0">
                ĐS
            </div>
            <span className={`text-text-main text-2xl font-bold ml-3 overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'max-w-full' : 'max-w-0'}`}>Đăng Sơn</span>
        </div>
    </div>
);

const NavItem: React.FC<{ to: string, icon: React.ReactNode, label: string, isOpen: boolean }> = ({ to, icon, label, isOpen }) => {
    const activeClass = "bg-blue-100 text-primary border-r-4 border-primary";
    const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-800";
    
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `flex items-center py-3 transition-colors duration-200 ${isOpen ? 'px-6' : 'justify-center'} ${isActive ? activeClass : inactiveClass}`}
            title={!isOpen ? label : ''}
        >
            <div className="flex-shrink-0">{icon}</div>
            <span className={`mx-4 font-medium overflow-hidden whitespace-nowrap transition-all duration-300 ${isOpen ? 'max-w-full' : 'max-w-0'}`}>{label}</span>
        </NavLink>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const navItems = [
        { to: "/bang-dieu-khien", icon: <HomeIcon />, label: "Bảng điều khiển" },
        { to: "/du-an", icon: <DocumentTextIcon />, label: "Dự án" },
        { to: "/tin-tuyen-dung", icon: <BriefcaseIcon />, label: "Tin tuyển dụng" },
        { to: "/ung-vien", icon: <UserGroupIcon />, label: "Ứng viên" },
        { to: "/bao-cao", icon: <ChartBarIcon />, label: "Báo cáo" },
        { to: "/hoat-dong", icon: <DocumentTextIcon />, label: "Hoạt động" },
        { to: "/cai-dat", icon: <CogIcon />, label: "Cài đặt" },
    ];

    return (
        <aside className={`flex-shrink-0 flex flex-col h-screen py-8 bg-white border-r overflow-y-auto transition-all duration-300 ${isOpen ? 'w-64 px-4' : 'w-20 px-2'}`}>
            <DangSonLogo isOpen={isOpen} />
            <div className="flex flex-col justify-between flex-1 mt-12">
                <nav>
                    {navItems.map(item => <NavItem key={item.to} {...item} isOpen={isOpen} />)}
                </nav>
            </div>
        </aside>
    );
};

export default Sidebar;