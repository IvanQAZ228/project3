import React from 'react';

export const PropertiesPanel: React.FC = () => {
    return (
        <div className="w-64 bg-gray-50 border-l border-gray-300 flex flex-col h-full z-10 relative">
            <div className="p-3 bg-gray-200 font-semibold border-b border-gray-300 text-sm">Properties</div>
            <div className="p-4 flex-1 overflow-y-auto">
                <p className="text-sm text-gray-600 italic">Select an object to see properties...</p>
            </div>
        </div>
    );
};
