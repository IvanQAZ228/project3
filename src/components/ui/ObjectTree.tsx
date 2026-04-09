import React from 'react';

import { useGraphStore } from '../../store/useGraphStore';

export const ObjectTree: React.FC = () => {
    const { nodes, selectedNodeId, selectNode } = useGraphStore();
    const nodesList = Object.values(nodes);

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-300 flex flex-col h-full z-10 relative">
            <div className="p-3 bg-gray-200 font-semibold border-b border-gray-300 text-sm">Object Tree</div>
            <div className="p-4 flex-1 overflow-y-auto">
                {nodesList.length === 0 ? (
                    <div className="text-gray-500 italic text-sm">No objects yet...</div>
                ) : (
                    <ul className="space-y-1 text-sm">
                        {nodesList.map(node => (
                            <li
                                key={node.id}
                                onClick={() => selectNode(node.id)}
                                className={`px-2 py-1.5 rounded cursor-pointer ${
                                    selectedNodeId === node.id
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'hover:bg-gray-200'
                                }`}
                            >
                                <span className="font-mono mr-2">[{node.type.substring(0, 1).toUpperCase()}]</span>
                                {node.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
