import React, { useMemo } from 'react';
import { useGraphStore } from '../../../store/useGraphStore';
import type { IFaceNode } from '../../../types/graph.types';
import * as THREE from 'three';

interface FaceMeshProps {
    node: IFaceNode;
}

export const FaceMesh: React.FC<FaceMeshProps> = ({ node }) => {
    const { nodes } = useGraphStore();

    const geometry = useMemo(() => {
        const points = node.pointIds.map(id => {
            const p = nodes[id] as any;
            if (p && p.type === 'point') {
                return new THREE.Vector3(p.position.x, p.position.y, p.position.z);
            }
            return null;
        }).filter(p => p !== null) as THREE.Vector3[];

        if (points.length < 3) return null;

        // Create a shape from points
        const shape = new THREE.Shape();

        // We need to project the 3D points onto a 2D plane for the shape geometry.
        // Assuming the face is relatively planar. Let's find its normal.
        const normal = new THREE.Vector3();
        const cb = new THREE.Vector3();
        const ab = new THREE.Vector3();
        cb.subVectors(points[2], points[1]);
        ab.subVectors(points[0], points[1]);
        normal.crossVectors(cb, ab).normalize();

        // If it's zero vector, fallback to up
        if (normal.lengthSq() < 0.001) normal.set(0, 1, 0);

        // Quaternion to rotate from face normal to Z axis
        const quaternion = new THREE.Quaternion().setFromUnitVectors(normal, new THREE.Vector3(0, 0, 1));
        const inverseQuaternion = quaternion.clone().invert();

        // Project points to 2D
        const points2d = points.map(p => {
            const projected = p.clone().applyQuaternion(quaternion);
            return new THREE.Vector2(projected.x, projected.y);
        });

        shape.moveTo(points2d[0].x, points2d[0].y);
        for (let i = 1; i < points2d.length; i++) {
            shape.lineTo(points2d[i].x, points2d[i].y);
        }

        const geo = new THREE.ShapeGeometry(shape);
        // Transform the geometry back to 3D space

        // Find the center of the first point in original space and projected space
        // Wait, ShapeGeometry creates it on Z=0. We can just apply the inverse quaternion.
        // But we need to offset it to match the original points.
        const p0_2d = new THREE.Vector3(points2d[0].x, points2d[0].y, 0).applyQuaternion(inverseQuaternion);
        const offset = new THREE.Vector3().subVectors(points[0], p0_2d);

        geo.applyQuaternion(inverseQuaternion);
        geo.translate(offset.x, offset.y, offset.z);

        return geo;
    }, [node.pointIds, nodes]);

    if (!geometry) return null;

    return (
        <mesh geometry={geometry}>
            <meshStandardMaterial color="#88ccff" transparent opacity={0.5} side={THREE.DoubleSide} />
        </mesh>
    );
};
