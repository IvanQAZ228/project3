import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraManager } from './CameraManager';
import { Grid3D } from './Grid3D';

export const Scene3D: React.FC = () => {
    return (
        <div className="w-full h-full absolute inset-0">
            <Canvas>
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 10, 5]} intensity={1} />

                {/* Camera & Controls */}
                <CameraManager />

                {/* Environment */}
                <Grid3D />

                {/* Example Mesh to test rendering */}
                <mesh position={[0, 0.5, 0]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="hotpink" />
                </mesh>
            </Canvas>
        </div>
    );
};
