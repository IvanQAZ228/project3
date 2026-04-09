import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToolStore } from '../../store/useToolStore';

export const MobileSheet: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeTool, setTool } = useToolStore();

    const tools = [
        { id: 'select', label: 'Select' },
        { id: 'point', label: 'Point' },
        { id: 'line', label: 'Line' },
        { id: 'polygon', label: 'Polygon' },
        { id: 'cube', label: 'Cube' },
        { id: 'pyramid', label: 'Pyramid' }
    ] as const;

    return (
        <div className="absolute bottom-0 w-full z-20 md:hidden flex justify-center pointer-events-none">
            {/* Toggle Button */}
            <button
                className="absolute bottom-4 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg z-30 pointer-events-auto"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? 'Close Tools' : `Tools (${activeTool})`}
            </button>

            {/* Bottom Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="w-full bg-white rounded-t-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.1)] h-auto p-4 flex flex-col items-center pointer-events-auto pb-24"
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
                        <h2 className="font-semibold mb-4">Tools</h2>
                        <div className="grid grid-cols-3 gap-4 w-full">
                            {tools.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => { setTool(tool.id); setIsOpen(false); }}
                                    className={`p-3 rounded text-sm text-center ${
                                        activeTool === tool.id
                                        ? 'bg-blue-100 border border-blue-400 text-blue-800'
                                        : 'bg-gray-100 active:bg-gray-200'
                                    }`}
                                >
                                    {tool.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
