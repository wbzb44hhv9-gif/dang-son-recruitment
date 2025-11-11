import React from 'react';
import Card from '../Card';

const TableSkeleton: React.FC = () => {
    return (
        <Card>
            <div className="animate-pulse">
                {/* Header Actions Skeleton */}
                <div className="flex justify-between items-center mb-4">
                    <div className="h-8 bg-gray-200 rounded-lg w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded-lg w-1/4"></div>
                </div>

                {/* Table Skeleton */}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                {[...Array(6)].map((_, i) => (
                                    <th key={i} className="py-4 px-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(8)].map((_, i) => (
                                <tr key={i} className="border-t">
                                    {[...Array(6)].map((_, j) => (
                                        <td key={j} className="py-4 px-2">
                                            <div className="h-4 bg-gray-200 rounded"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Card>
    );
};

export default TableSkeleton;
