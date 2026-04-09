import React from 'react';
import { useGraphStore } from '../../../store/useGraphStore';
import type { ISolidNode } from '../../../types/graph.types';
import * as THREE from 'three';

interface SolidMeshProps {
    node: ISolidNode;
}

export const SolidMesh: React.FC<SolidMeshProps> = ({ node }) => {
    const { nodes } = useGraphStore();

    if (node.solidType === 'cube' && node.pointIds.length >= 3) {
        const p1 = nodes[node.pointIds[0]] as any;
        const p2 = nodes[node.pointIds[1]] as any;
        const p3 = nodes[node.pointIds[2]] as any;

        if (!p1 || !p2 || !p3) return null;

        const v1 = new THREE.Vector3(p1.position.x, p1.position.y, p1.position.z);
        const v2 = new THREE.Vector3(p2.position.x, p2.position.y, p2.position.z);

        const edgeDir = new THREE.Vector3().subVectors(v2, v1);
        const edgeLength = edgeDir.length();

        // This is a simplified cube based on 3 points logic from requirements.
        // It uses p1 and p2 as the base edge, and p3 to determine the orientation plane.
        // For MVP, we will just draw a box at the center of p1 and v2, rotated properly.
        // Real logic requires computing the exact 8 vertices for a generic cube in any orientation.

        const center = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
        // Let's extrude upwards for simple MVP
        center.y += edgeLength / 2;

        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(1,0,0), edgeDir.normalize());

        return (
            <mesh position={center} quaternion={quaternion}>
                <boxGeometry args={[edgeLength, edgeLength, edgeLength]} />
                <meshStandardMaterial color="#88ccff" transparent opacity={0.6} side={THREE.DoubleSide} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.BoxGeometry(edgeLength, edgeLength, edgeLength)]} />
                    <lineBasicMaterial color="#1166aa" linewidth={2} />
                </lineSegments>
            </mesh>
        );
    }

    if (node.solidType === 'pyramid' && node.pointIds.length >= 2) {
        const baseCenter = nodes[node.pointIds[0]] as any;
        const tip = nodes[node.pointIds[1]] as any;

        if (!baseCenter || !tip) return null;

        const bc = new THREE.Vector3(baseCenter.position.x, baseCenter.position.y, baseCenter.position.z);
        const t = new THREE.Vector3(tip.position.x, tip.position.y, tip.position.z);

        const height = t.y - bc.y; // Assuming pyramid standing on Y
        const radius = new THREE.Vector2(t.x - bc.x, t.z - bc.z).length();

        return (
            <mesh position={[bc.x, bc.y + height/2, bc.z]}>
                <coneGeometry args={[Math.max(0.1, radius), Math.abs(height), 4]} />
                <meshStandardMaterial color="#ffcc88" transparent opacity={0.6} side={THREE.DoubleSide} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.ConeGeometry(Math.max(0.1, radius), Math.abs(height), 4)]} />
                    <lineBasicMaterial color="#cc7722" linewidth={2} />
                </lineSegments>
            </mesh>
        );
    }

    return null;
};
