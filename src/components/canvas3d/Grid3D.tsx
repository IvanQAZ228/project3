import React from 'react';
import { Grid } from '@react-three/drei';

export const Grid3D: React.FC = () => {
    return (
        <Grid
            position={[0, 0, 0]}
            args={[100, 100]}
            cellSize={1}
            cellThickness={1}
            cellColor="#6f6f6f"
            sectionSize={10}
            sectionThickness={1.5}
            sectionColor="#9d4b4b"
            fadeDistance={50}
            fadeStrength={1.5}
            infiniteGrid
        />
    );
};
