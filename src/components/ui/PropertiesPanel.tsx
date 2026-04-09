import React from 'react';
import { useGraphStore } from '../../store/useGraphStore';

export const PropertiesPanel: React.FC = () => {
    const { nodes, selectedNodeId, deleteNode } = useGraphStore();
    const selectedNode = selectedNodeId ? nodes[selectedNodeId] : null;

    return (
        <div className="w-64 bg-gray-50 border-l border-gray-300 flex flex-col h-full z-10 relative">
            <div className="p-3 bg-gray-200 font-semibold border-b border-gray-300 text-sm flex justify-between items-center">
                <span>Properties</span>
                {selectedNode && (
                    <button
                        onClick={() => deleteNode(selectedNode.id)}
                        className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200"
                    >
                        Delete
                    </button>
                )}
            </div>
            <div className="p-4 flex-1 overflow-y-auto">
                {!selectedNode ? (
                    <p className="text-sm text-gray-600 italic">Select an object to see properties...</p>
                ) : (
                    <div className="space-y-4 text-sm">
                        <div>
                            <span className="text-gray-500 block mb-1">Name</span>
                            <div className="font-semibold">{selectedNode.name}</div>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Type</span>
                            <div className="capitalize">{selectedNode.type}</div>
                        </div>

                        {selectedNode.type === 'point' && (
                            <div>
                                <span className="text-gray-500 block mb-1">Position</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className="bg-white border rounded p-1 text-center">X: {(selectedNode as any).position.x.toFixed(2)}</div>
                                    <div className="bg-white border rounded p-1 text-center">Y: {(selectedNode as any).position.y.toFixed(2)}</div>
                                    <div className="bg-white border rounded p-1 text-center">Z: {(selectedNode as any).position.z.toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        <div>
                            <span className="text-gray-500 block mb-1">Dependencies</span>
                            <div className="text-xs text-gray-700">
                                {selectedNode.dependencies.length > 0
                                    ? selectedNode.dependencies.map(id => nodes[id]?.name).join(', ')
                                    : 'None'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
