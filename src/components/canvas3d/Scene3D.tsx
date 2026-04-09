import React from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraManager } from './CameraManager';
import { Grid3D } from './Grid3D';
import { ObjectRenderer } from './ObjectRenderer';
import { DraftToolsRenderer } from './DraftToolsRenderer';
import { useGraphStore } from '../../store/useGraphStore';
import { useToolStore } from '../../store/useToolStore';
import { useInteractionStore } from '../../store/useInteractionStore';
import { SnappingEngine } from '../../core/engine/SnappingEngine';
import * as THREE from 'three';

export const Scene3D: React.FC = () => {
    const { activeTool, shiftPressed, setTool } = useToolStore();
    const { addPoint, selectNode, nodes, addLine, addSolid } = useGraphStore();
    const {
        draftLineStartId, setDraftLineStartId, setDraftLineCurrentPos,
        solidBuildStep, setSolidBuildStep, solidPointsId, addSolidPoint, resetSolidBuild
    } = useInteractionStore();

    const handlePointerDown = (e: any) => {
        const point = e.point;
        let pos = new THREE.Vector3(point.x, 0, point.z);

        if (activeTool === 'point') {
            if (!shiftPressed) pos = SnappingEngine.snapToGrid(pos);
            addPoint({ x: pos.x, y: pos.y, z: pos.z });
        }
        else if (activeTool === 'line') {
            if (!shiftPressed) {
                // Try snapping to existing point
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                }
            }

            if (!draftLineStartId) {
                // Find point at this exact position, or create new
                let startPoint = Object.values(nodes).find(n => {
                    if (n.type !== 'point') return false;
                    const p = (n as any).position;
                    return Math.abs(p.x - pos.x) < 0.001 && Math.abs(p.y - pos.y) < 0.001 && Math.abs(p.z - pos.z) < 0.001;
                });
                if (!startPoint) {
                    startPoint = addPoint({ x: pos.x, y: pos.y, z: pos.z });
                }
                setDraftLineStartId(startPoint.id);
                setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
            } else {
                // Finish line
                let endPoint = Object.values(nodes).find(n => {
                    if (n.type !== 'point') return false;
                    const p = (n as any).position;
                    return Math.abs(p.x - pos.x) < 0.001 && Math.abs(p.y - pos.y) < 0.001 && Math.abs(p.z - pos.z) < 0.001;
                });
                if (!endPoint) {
                    // Check angle snapping if shifted not pressed
                    if (!shiftPressed) {
                        const startNode = nodes[draftLineStartId];
                        const startPos = new THREE.Vector3((startNode as any).position.x, (startNode as any).position.y, (startNode as any).position.z);
                        pos = SnappingEngine.snapToAngle(startPos, pos);
                    }
                    endPoint = addPoint({ x: pos.x, y: pos.y, z: pos.z });
                }

                if (endPoint.id !== draftLineStartId) {
                    addLine(draftLineStartId, endPoint.id);
                }
                setDraftLineStartId(null);
                setDraftLineCurrentPos(null);
                setTool('select'); // Reset tool after building
            }
        }
        else if (activeTool === 'cube') {
            if (!shiftPressed) pos = SnappingEngine.snapToGrid(pos);
            const pt = addPoint({ x: pos.x, y: pos.y, z: pos.z });

            if (solidBuildStep === 0) {
                addSolidPoint(pt.id);
                setSolidBuildStep(1);
            } else if (solidBuildStep === 1) {
                addSolidPoint(pt.id);
                setSolidBuildStep(2);
            } else if (solidBuildStep === 2) {
                addSolidPoint(pt.id);
                addSolid('cube', [...solidPointsId, pt.id]);
                resetSolidBuild();
                setTool('select');
            }
        }
        else if (activeTool === 'pyramid') {
            // Step 0: Center, Step 1: Base radius/direction, Step 2: Height
            if (!shiftPressed) pos = SnappingEngine.snapToGrid(pos);

            // For step 2 (height), we allow moving in Y. For now we use the click X/Z to determine height.
            if (solidBuildStep === 2 && solidPointsId[0]) {
                const base = nodes[solidPointsId[0]] as any;
                pos.y = new THREE.Vector3(pos.x, 0, pos.z).distanceTo(new THREE.Vector3(base.position?.x || 0, 0, base.position?.z || 0));
                pos.x = base.position?.x || 0;
                pos.z = base.position?.z || 0;
            }

            const pt = addPoint({ x: pos.x, y: pos.y, z: pos.z });

            if (solidBuildStep === 0) {
                addSolidPoint(pt.id);
                setSolidBuildStep(1);
            } else if (solidBuildStep === 1) {
                addSolidPoint(pt.id);
                addSolid('pyramid', [...solidPointsId, pt.id]);
                resetSolidBuild();
                setTool('select');
            }
        }
        else if (activeTool === 'select') {
            selectNode(null);
        }
    };

    const handlePointerMove = (e: any) => {
        if (activeTool === 'line' && draftLineStartId) {
            let pos = new THREE.Vector3(e.point.x, 0, e.point.z);

            if (!shiftPressed) {
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                    const startNode = nodes[draftLineStartId] as any;
                    if (startNode && startNode.type === 'point') {
                        const startPos = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z);
                        pos = SnappingEngine.snapToAngle(startPos, pos);
                    }
                }
            }

            setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
        }
    };

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

                {/* Interaction Plane */}
                <mesh
                    rotation={[-Math.PI / 2, 0, 0]}
                    position={[0, 0, 0]}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                >
                    <planeGeometry args={[1000, 1000]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>

                {/* Objects */}
                <ObjectRenderer />
                <DraftToolsRenderer />
            </Canvas>
        </div>
    );
};
