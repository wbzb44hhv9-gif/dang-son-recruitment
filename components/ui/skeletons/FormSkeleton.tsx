import React from 'react';
import Card from '../Card';

const FormSkeleton: React.FC = () => {
    return (
        <Card>
            <div className="animate-pulse space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        </div>
                    ))}
                </div>
                 <div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-24 bg-gray-200 rounded-lg w-full"></div>
                </div>
                 <div className="flex justify-end space-x-3 pt-4">
                    <div className="h-10 bg-gray-200 rounded-lg w-20"></div>
                    <div className="h-10 bg-gray-300 rounded-lg w-28"></div>
                </div>
            </div>
        </Card>
    );
};

export default FormSkeleton;
