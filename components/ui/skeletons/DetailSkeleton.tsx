import React from 'react';
import Card from '../Card';

const DetailSkeleton: React.FC = () => {
    return (
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Main Header Card */}
                <Card>
                    <div className="h-8 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </Card>

                {/* Details Card */}
                <Card>
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                                <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Sidebar Card */}
            <div className="lg:col-span-1">
                <Card>
                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-6"></div>
                    <div className="space-y-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex space-x-3">
                                <div className="flex flex-col items-center">
                                    <div className="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                                    <div className="w-0.5 flex-grow bg-gray-200"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-300 rounded w-3/4 mb-1"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default DetailSkeleton;
