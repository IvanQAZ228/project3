import React from 'react';
import { useGraphStore } from '../../../store/useGraphStore';
import type { ILineNode } from '../../../types/graph.types';
import * as THREE from 'three';

interface LineMeshProps {
    node: ILineNode;
}

export const LineMesh: React.FC<LineMeshProps> = ({ node }) => {
    const { nodes } = useGraphStore();
    const startNode = nodes[node.startId] as any;
    const endNode = nodes[node.endId] as any;

    if (!startNode || !endNode || startNode.type !== 'point' || endNode.type !== 'point') {
        return null;
    }

    const startPos = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z);
    const endPos = new THREE.Vector3(endNode.position.x, endNode.position.y, endNode.position.z);

    const distance = startPos.distanceTo(endPos);
    const position = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);

    // Create cylinder to represent line
    const direction = new THREE.Vector3().subVectors(endPos, startPos).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

    return (
        <mesh position={position} quaternion={quaternion}>
            <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
            <meshStandardMaterial color="#4a90e2" />
        </mesh>
    );
};
