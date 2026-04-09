import React from 'react';
import type { ISolidNode } from '../../../types/graph.types';

interface SolidMeshProps {
    node: ISolidNode;
}

export const SolidMesh: React.FC<SolidMeshProps> = () => {
    // The visual rendering of solids is now completely handled by the underlying points, lines, and faces.
    // The SolidNode just acts as a logical grouping container in the DAG.
    return null;
};
