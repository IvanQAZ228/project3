import React from 'react';

export const ObjectTree: React.FC = () => {
    return (
        <div className="w-64 bg-gray-50 border-r border-gray-300 flex flex-col h-full z-10 relative">
            <div className="p-3 bg-gray-200 font-semibold border-b border-gray-300 text-sm">Object Tree</div>
            <div className="p-4 flex-1 overflow-y-auto">
                <ul className="space-y-2 text-sm">
                    <li className="text-gray-600 italic">No objects yet...</li>
                </ul>
            </div>
        </div>
    );
};
