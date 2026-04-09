import React from 'react';
import { useGraphStore } from '../../store/useGraphStore';
import { PointMesh } from './meshes/PointMesh';
import { LineMesh } from './meshes/LineMesh';
import { SolidMesh } from './meshes/SolidMesh';

export const ObjectRenderer: React.FC = () => {
    const { nodes } = useGraphStore();

    return (
        <>
            {Object.values(nodes).map(node => {
                if (node.type === 'point') {
                    return <PointMesh key={node.id} node={node as any} />;
                }
                if (node.type === 'line') {
                    return <LineMesh key={node.id} node={node as any} />;
                }
                if (node.type === 'solid') {
                    return <SolidMesh key={node.id} node={node as any} />;
                }
                return null;
            })}
        </>
    );
};
