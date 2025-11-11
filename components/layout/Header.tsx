
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { MagnifyingGlassIcon, BellIcon, ArrowLeftOnRectangleIcon, Bars3Icon } from '../icons/Icons';

interface HeaderProps {
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const { user, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="h-16 z-10 py-4 bg-white shadow-md">
            <div className="container flex items-center h-full px-6 mx-auto text-text-main">
                {/* Toggle Button */}
                <button
                    className="p-1 mr-4 -ml-1 rounded-md focus:outline-none focus:shadow-outline-purple"
                    onClick={toggleSidebar}
                    aria-label="Menu"
                >
                    <Bars3Icon />
                </button>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-xl focus-within:text-primary">
                    <div className="absolute inset-y-0 flex items-center pl-2">
                       <MagnifyingGlassIcon />
                    </div>
                    <input
                        className="w-full pl-8 pr-2 text-sm text-gray-700 placeholder-gray-600 bg-gray-100 border-0 rounded-md focus:placeholder-gray-500 focus:bg-white focus:border-primary focus:outline-none focus:shadow-outline-purple form-input"
                        type="text"
                        placeholder="Tìm kiếm ứng viên, tin tuyển dụng..."
                        aria-label="Search"
                    />
                </div>

                {/* User Menu */}
                <ul className="flex items-center flex-shrink-0 space-x-6 ml-6">
                    <li>
                        <button className="relative align-middle rounded-md focus:outline-none focus:shadow-outline-purple" aria-label="Notifications" aria-haspopup="true">
                            <BellIcon />
                            <span aria-hidden="true" className="absolute top-0 right-0 inline-block w-3 h-3 transform translate-x-1 -translate-y-1 bg-error border-2 border-white rounded-full"></span>
                        </button>
                    </li>
                    <li className="relative" ref={dropdownRef}>
                        <div className="flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <span className="font-medium mr-3 hidden md:inline">{user?.name}</span>
                            <button className="align-middle rounded-full focus:shadow-outline-purple focus:outline-none" aria-label="Account" aria-haspopup="true">
                                <img className="object-cover w-8 h-8 rounded-full" src={user?.avatarUrl} alt="" aria-hidden="true" />
                            </button>
                        </div>
                        {isDropdownOpen && (
                             <div className="absolute right-0 w-56 p-2 mt-2 space-y-2 text-gray-600 bg-white border border-gray-100 rounded-md shadow-md" aria-label="submenu">
                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-2 text-sm font-medium text-left text-gray-700 transition-colors duration-150 rounded-md hover:bg-gray-100 hover:text-gray-800"
                                >
                                    <ArrowLeftOnRectangleIcon />
                                    <span className="ml-4">Đăng xuất</span>
                                </button>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </header>
    );
};

export default Header;