import React from 'react';

import { useToolStore } from '../../store/useToolStore';

export const Toolbar: React.FC = () => {
    const { activeTool, setTool, shiftPressed } = useToolStore();

    const tools = [
        { id: 'select', label: 'Select (V)' },
        { id: 'point', label: 'Point' },
        { id: 'line', label: 'Line' },
        { id: 'polygon', label: 'Polygon' },
        { id: 'cube', label: 'Cube' },
        { id: 'pyramid', label: 'Pyramid' }
    ] as const;

    return (
        <div className="h-14 bg-gray-100 border-b border-gray-300 flex items-center justify-between px-4 shadow-sm z-10 relative">
            <div className="flex items-center">
                <h1 className="font-bold text-lg mr-8">StereoMath</h1>
                <div className="flex space-x-2">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setTool(tool.id)}
                            className={`px-3 py-1 rounded border text-sm transition-colors ${
                                activeTool === tool.id
                                ? 'bg-blue-100 border-blue-400 text-blue-800 font-medium'
                                : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                            }`}
                        >
                            {tool.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="text-xs text-gray-500 flex items-center">
                <span className="mr-2">Snapping:</span>
                <span className={`px-2 py-1 rounded ${shiftPressed ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {shiftPressed ? 'Disabled (Shift)' : 'Enabled'}
                </span>
            </div>
        </div>
    );
};
