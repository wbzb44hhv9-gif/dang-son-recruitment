import React from 'react';
import Card from '../Card';

const DashboardSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse">
            {/* Stat Cards Skeleton */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="flex items-center p-4">
                        <div className="p-3 mr-4 bg-gray-200 rounded-full h-12 w-12"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content Skeleton */}
            <div className="grid gap-6 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-6">
                    <Card>
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex items-center space-x-4">
                                    <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                     <Card>
                        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                         <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                         <div className="aspect-square bg-gray-200 rounded-xl"></div>
                    </Card>
                     <Card>
                         <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                         <div className="aspect-video bg-gray-200 rounded-xl"></div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardSkeleton;
