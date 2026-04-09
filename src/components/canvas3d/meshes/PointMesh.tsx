import React, { useRef, useState } from 'react';
import { useGraphStore } from '../../../store/useGraphStore';
import type { IPointNode } from '../../../types/graph.types';
import { Html, TransformControls } from '@react-three/drei';
import { useToolStore } from '../../../store/useToolStore';
import * as THREE from 'three';
import { SnappingEngine } from '../../../core/engine/SnappingEngine';

interface PointMeshProps {
    node: IPointNode;
}

export const PointMesh: React.FC<PointMeshProps> = ({ node }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { updatePointPosition, selectNode, selectedNodeId } = useGraphStore();
    const { activeTool, shiftPressed } = useToolStore();
    const isSelected = selectedNodeId === node.id;
    const [hovered, setHovered] = useState(false);

    const handlePointerDown = (e: any) => {
        if (activeTool === 'select') {
            e.stopPropagation();
            selectNode(node.id);
        }
    };

    const handleDrag = () => {
        if (meshRef.current) {
            let newPos = meshRef.current.position.clone();

            if (!shiftPressed) {
                newPos = SnappingEngine.snapToGrid(newPos);
                // Also update visual position while dragging if snapped
                meshRef.current.position.copy(newPos);
            }

            updatePointPosition(node.id, { x: newPos.x, y: newPos.y, z: newPos.z });
        }
    };

    return (
        <>
            <mesh
                ref={meshRef}
                position={[node.position.x, node.position.y, node.position.z]}
                onPointerDown={handlePointerDown}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[isSelected ? 0.2 : 0.15, 16, 16]} />
                <meshStandardMaterial color={isSelected ? "#ff3366" : (hovered ? "#ff6699" : "#4a90e2")} />

                {/* Label */}
                <Html center position={[0, 0.4, 0]}>
                    <div className="bg-white/80 px-1 rounded text-xs font-bold text-gray-800 pointer-events-none select-none">
                        {node.name}
                    </div>
                </Html>
            </mesh>

            {isSelected && activeTool === 'select' && meshRef.current && (
                <TransformControls
                    object={meshRef.current as any}
                    mode="translate"
                    onObjectChange={handleDrag}
                    onMouseUp={() => {}} // dummy to satisfy TS if needed, we rely on Drei's makeDefault in CameraManager to auto-disable
                />
            )}
        </>
    );
};
