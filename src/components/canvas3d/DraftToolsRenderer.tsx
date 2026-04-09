import React from 'react';
import { useInteractionStore } from '../../store/useInteractionStore';
import { useGraphStore } from '../../store/useGraphStore';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

import { useToolStore } from '../../store/useToolStore';

export const DraftToolsRenderer: React.FC = () => {
    const { draftLineStartId, draftLineCurrentPos, solidBuildStep, solidPointsId } = useInteractionStore();
    const { nodes } = useGraphStore();
    const { activeTool } = useToolStore();

    if (activeTool === 'pyramid' && solidBuildStep === 1 && draftLineCurrentPos) {
        // Render draft height line for pyramid
        if (solidPointsId.length > 2) {
            const basePoints = solidPointsId.map(id => nodes[id] as any);
            let cx = 0, cz = 0;
            basePoints.forEach(p => { cx += p.position.x; cz += p.position.z; });
            cx /= basePoints.length;
            cz /= basePoints.length;

            const startPos = new THREE.Vector3(cx, 0, cz);
            const currentPos = new THREE.Vector3(cx, draftLineCurrentPos.y, cz);
            const distance = startPos.distanceTo(currentPos);

            if (distance > 0.01) {
                const midPos = new THREE.Vector3().addVectors(startPos, currentPos).multiplyScalar(0.5);
                const direction = new THREE.Vector3().subVectors(currentPos, startPos).normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

                return (
                    <group>
                        <mesh position={midPos} quaternion={quaternion}>
                            <cylinderGeometry args={[0.03, 0.03, distance, 8]} />
                            <meshBasicMaterial color="#ff9900" transparent opacity={0.5} />
                        </mesh>
                        <Html position={currentPos.clone().add(new THREE.Vector3(0, 0.5, 0))}>
                            <div className="bg-white/90 border border-orange-300 text-orange-800 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none select-none">
                                H: {distance.toFixed(2)}
                            </div>
                        </Html>
                    </group>
                );
            }
        }
    }

    if (draftLineStartId && draftLineCurrentPos) {
        const startNode = nodes[draftLineStartId] as any;
        if (startNode && startNode.type === 'point') {
            const startPos = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z);
            const currentPos = new THREE.Vector3(draftLineCurrentPos.x, draftLineCurrentPos.y, draftLineCurrentPos.z);

            const distance = startPos.distanceTo(currentPos);

            // Render draft line if distance > 0
            if (distance > 0.01) {
                const midPos = new THREE.Vector3().addVectors(startPos, currentPos).multiplyScalar(0.5);
                const direction = new THREE.Vector3().subVectors(currentPos, startPos).normalize();
                const up = new THREE.Vector3(0, 1, 0);
                const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);

                // Calculate angle for display
                const angleRad = Math.atan2(direction.z, direction.x);
                let angleDeg = (angleRad * 180 / Math.PI + 360) % 360;

                return (
                    <group>
                        <mesh position={midPos} quaternion={quaternion}>
                            <cylinderGeometry args={[0.03, 0.03, distance, 8]} />
                            <meshBasicMaterial color="#ff9900" transparent opacity={0.5} />
                        </mesh>
                        <Html position={currentPos.clone().add(new THREE.Vector3(0, 0.5, 0))}>
                            <div className="bg-white/90 border border-orange-300 text-orange-800 text-xs px-2 py-1 rounded shadow-sm whitespace-nowrap pointer-events-none select-none">
                                L: {distance.toFixed(2)} | A: {angleDeg.toFixed(1)}°
                            </div>
                        </Html>
                    </group>
                );
            }
        }
    }

    return null;
};
