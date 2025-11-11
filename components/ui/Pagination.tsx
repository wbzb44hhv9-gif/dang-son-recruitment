import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    return (
        <div className="px-6 py-3 bg-white flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
                Hiển thị từ <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> trên <span className="font-medium">{totalItems}</span> kết quả
            </div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                    &laquo;
                </button>
                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => onPageChange(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === number 
                                ? 'z-10 bg-blue-50 border-primary text-primary' 
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        {number}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                    &raquo;
                </button>
            </nav>
        </div>
    );
};

export default Pagination;