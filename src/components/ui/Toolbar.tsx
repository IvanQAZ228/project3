import React from 'react';

export const Toolbar: React.FC = () => {
    return (
        <div className="h-14 bg-gray-100 border-b border-gray-300 flex items-center px-4 shadow-sm z-10 relative">
            <h1 className="font-bold text-lg mr-8">StereoMath</h1>
            <div className="flex space-x-2">
                <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">Point</button>
                <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">Line</button>
                <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">Cube</button>
                <button className="px-3 py-1 bg-white rounded border hover:bg-gray-50">Section</button>
            </div>
        </div>
    );
};
