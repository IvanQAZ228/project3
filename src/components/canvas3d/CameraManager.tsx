import React from 'react';
import { OrbitControls } from '@react-three/drei';

export const CameraManager: React.FC = () => {
    return (
        <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.05}
            minDistance={1}
            maxDistance={100}
            domElement={document.querySelector('canvas') as HTMLCanvasElement}
        />
    );
};
