import React from 'react';
import { Toolbar } from './Toolbar';
import { ObjectTree } from './ObjectTree';
import { PropertiesPanel } from './PropertiesPanel';
import { MobileSheet } from './MobileSheet';
import { Scene3D } from '../canvas3d/Scene3D';

export const Layout: React.FC = () => {
    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-white text-gray-800 font-sans">
            <div className="hidden md:block">
                <Toolbar />
            </div>

            <div className="flex flex-1 relative overflow-hidden">
                {/* Desktop Left Sidebar */}
                <div className="hidden md:block">
                    <ObjectTree />
                </div>

                {/* Main 3D Canvas Area */}
                <main className="flex-1 relative bg-gray-900">
                    <Scene3D />
                </main>

                {/* Desktop Right Sidebar */}
                <div className="hidden md:block">
                    <PropertiesPanel />
                </div>
            </div>

            {/* Mobile Touch UI Elements */}
            <MobileSheet />
        </div>
    );
};
