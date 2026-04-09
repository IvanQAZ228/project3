import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MobileSheet: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute bottom-0 w-full z-20 md:hidden flex justify-center">
            {/* Toggle Button */}
            <button
                className="absolute bottom-4 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg z-30"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? 'Close Tools' : 'Open Tools'}
            </button>

            {/* Bottom Sheet */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="w-full bg-white rounded-t-2xl shadow-[0_-5px_15px_rgba(0,0,0,0.1)] h-64 p-4 flex flex-col items-center"
                    >
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4"></div>
                        <h2 className="font-semibold mb-4">Tools</h2>
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <button className="p-3 bg-gray-100 rounded text-sm text-center active:bg-gray-200">Point</button>
                            <button className="p-3 bg-gray-100 rounded text-sm text-center active:bg-gray-200">Line</button>
                            <button className="p-3 bg-gray-100 rounded text-sm text-center active:bg-gray-200">Cube</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
