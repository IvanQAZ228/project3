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
    const { addPoint, selectNode, nodes, addLine } = useGraphStore();
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
        else if (activeTool === 'polygon') {
            if (!shiftPressed) {
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                }
            }

            // Find point at this exact position, or create new
            let pt = Object.values(nodes).find(n => {
                if (n.type !== 'point') return false;
                const p = (n as any).position;
                return Math.abs(p.x - pos.x) < 0.001 && Math.abs(p.y - pos.y) < 0.001 && Math.abs(p.z - pos.z) < 0.001;
            });
            if (!pt) {
                pt = addPoint({ x: pos.x, y: pos.y, z: pos.z });
            }

            // If we click the first point and we have at least 3 points, close the polygon
            if (solidPointsId.length > 2 && pt.id === solidPointsId[0]) {
                const { addFace } = useGraphStore.getState();
                addFace(solidPointsId);
                // Create lines to close it visually
                addLine(solidPointsId[solidPointsId.length - 1], pt.id);
                resetSolidBuild();
                setDraftLineStartId(null);
                setDraftLineCurrentPos(null);
                setTool('select');
            } else {
                if (solidPointsId.length > 0) {
                    addLine(solidPointsId[solidPointsId.length - 1], pt.id);
                }
                addSolidPoint(pt.id);
                setDraftLineStartId(pt.id);
                setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
            }
        }
        else if (activeTool === 'cube') {
            if (!shiftPressed) {
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                }
            }

            // Step 2 is constrained to make a square
            if (solidBuildStep === 2) {
                const p1 = nodes[solidPointsId[0]] as any;
                const p2 = nodes[solidPointsId[1]] as any;
                if (p1 && p2) {
                    const v1 = new THREE.Vector3(p1.position.x, p1.position.y, p1.position.z);
                    const v2 = new THREE.Vector3(p2.position.x, p2.position.y, p2.position.z);
                    const edgeDir = new THREE.Vector3().subVectors(v2, v1);
                    const edgeLength = edgeDir.length();

                    // Cross product with UP to find perpendicular direction on the plane
                    const up = new THREE.Vector3(0, 1, 0);
                    const perp = new THREE.Vector3().crossVectors(edgeDir, up).normalize();

                    // Snap the pos to one of the two perpendicular directions
                    const d1 = new THREE.Vector3().addVectors(v2, perp.clone().multiplyScalar(edgeLength));
                    const d2 = new THREE.Vector3().addVectors(v2, perp.clone().multiplyScalar(-edgeLength));

                    if (pos.distanceTo(d1) < pos.distanceTo(d2)) {
                        pos.copy(d1);
                    } else {
                        pos.copy(d2);
                    }
                }
            }

            let pt = Object.values(nodes).find(n => {
                if (n.type !== 'point') return false;
                const p = (n as any).position;
                return Math.abs(p.x - pos.x) < 0.001 && Math.abs(p.y - pos.y) < 0.001 && Math.abs(p.z - pos.z) < 0.001;
            });
            if (!pt) pt = addPoint({ x: pos.x, y: pos.y, z: pos.z });

            if (solidBuildStep === 0) {
                addSolidPoint(pt.id);
                setDraftLineStartId(pt.id);
                setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
                setSolidBuildStep(1);
            } else if (solidBuildStep === 1) {
                addLine(solidPointsId[0], pt.id);
                addSolidPoint(pt.id);
                setDraftLineStartId(pt.id);
                setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
                setSolidBuildStep(2);
            } else if (solidBuildStep === 2) {
                const { addFace, addSolid } = useGraphStore.getState();
                const p1Node = nodes[solidPointsId[0]] as any;
                const p2Node = nodes[solidPointsId[1]] as any;
                const p3Node = pt as any;

                const p1 = new THREE.Vector3(p1Node.position.x, p1Node.position.y, p1Node.position.z);
                const p2 = new THREE.Vector3(p2Node.position.x, p2Node.position.y, p2Node.position.z);
                const p3 = new THREE.Vector3(p3Node.position.x, p3Node.position.y, p3Node.position.z);

                // Calculate p4 to complete bottom face
                const p4Pos = new THREE.Vector3().addVectors(p1, new THREE.Vector3().subVectors(p3, p2));
                const p4 = addPoint({ x: p4Pos.x, y: p4Pos.y, z: p4Pos.z });

                // Bottom lines
                addLine(p2Node.id, p3Node.id);
                addLine(p3Node.id, p4.id);
                addLine(p4.id, p1Node.id);
                const fBottom = addFace([p1Node.id, p2Node.id, p3Node.id, p4.id]);

                // Calculate Top points (Extrude up by edge length)
                const edgeLength = p1.distanceTo(p2);

                const t1 = addPoint({ x: p1.x, y: p1.y + edgeLength, z: p1.z });
                const t2 = addPoint({ x: p2.x, y: p2.y + edgeLength, z: p2.z });
                const t3 = addPoint({ x: p3.x, y: p3.y + edgeLength, z: p3.z });
                const t4 = addPoint({ x: p4Pos.x, y: p4Pos.y + edgeLength, z: p4Pos.z });

                // Top lines
                addLine(t1.id, t2.id);
                addLine(t2.id, t3.id);
                addLine(t3.id, t4.id);
                addLine(t4.id, t1.id);
                const fTop = addFace([t1.id, t2.id, t3.id, t4.id]);

                // Vertical lines
                addLine(p1Node.id, t1.id);
                addLine(p2Node.id, t2.id);
                addLine(p3Node.id, t3.id);
                addLine(p4.id, t4.id);

                // Side faces
                const fs1 = addFace([p1Node.id, p2Node.id, t2.id, t1.id]);
                const fs2 = addFace([p2Node.id, p3Node.id, t3.id, t2.id]);
                const fs3 = addFace([p3Node.id, p4.id, t4.id, t3.id]);
                const fs4 = addFace([p4.id, p1Node.id, t1.id, t4.id]);

                const pointIds = [p1Node.id, p2Node.id, p3Node.id, p4.id, t1.id, t2.id, t3.id, t4.id];
                // we'll just gather the created lines dynamically (or they are implicitly tracked by points/faces, but let's just pass empty for simplicity in solid definition since they are rendered via their own nodes now)

                addSolid('cube', pointIds, [], [fBottom.id, fTop.id, fs1.id, fs2.id, fs3.id, fs4.id]);

                resetSolidBuild();
                setDraftLineStartId(null);
                setDraftLineCurrentPos(null);
                setTool('select');
            }
        }
        else if (activeTool === 'pyramid') {
            if (!shiftPressed) {
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint && solidBuildStep === 0) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                }
            }

            // In step 1 (defining height), use distance from the center of the base to the current pointer position as height
            if (solidBuildStep === 1 && solidPointsId.length > 2) {
                // Find centroid of base
                const basePoints = solidPointsId.map(id => nodes[id] as any);
                let cx = 0, cz = 0;
                basePoints.forEach(p => { cx += p.position.x; cz += p.position.z; });
                cx /= basePoints.length;
                cz /= basePoints.length;

                const distance = new THREE.Vector2(pos.x - cx, pos.z - cz).length();
                pos.x = cx;
                pos.z = cz;
                pos.y = distance;
            }

            let pt = Object.values(nodes).find(n => {
                if (n.type !== 'point') return false;
                const p = (n as any).position;
                return Math.abs(p.x - pos.x) < 0.001 && Math.abs(p.y - pos.y) < 0.001 && Math.abs(p.z - pos.z) < 0.001;
            });
            if (!pt) pt = addPoint({ x: pos.x, y: pos.y, z: pos.z });

            if (solidBuildStep === 0) {
                // Building the base polygon
                if (solidPointsId.length > 2 && pt.id === solidPointsId[0]) {
                    // Close the base polygon and move to step 1 (height)
                    const { addFace } = useGraphStore.getState();
                    addFace(solidPointsId);
                    addLine(solidPointsId[solidPointsId.length - 1], pt.id);
                    setSolidBuildStep(1);
                    setDraftLineStartId(null);
                    setDraftLineCurrentPos(null);
                } else {
                    if (solidPointsId.length > 0) {
                        addLine(solidPointsId[solidPointsId.length - 1], pt.id);
                    }
                    addSolidPoint(pt.id);
                    setDraftLineStartId(pt.id);
                    setDraftLineCurrentPos({ x: pos.x, y: pos.y, z: pos.z });
                }
            } else if (solidBuildStep === 1) {
                // Finalize pyramid with tip point
                const tipId = pt.id;
                const { addFace, addSolid } = useGraphStore.getState();

                const faceIds: string[] = [];
                // Base face is already added, but let's gather its ID if we need to. For now, we will add triangular faces.

                for (let i = 0; i < solidPointsId.length; i++) {
                    const p1Id = solidPointsId[i];
                    const p2Id = solidPointsId[(i + 1) % solidPointsId.length];
                    addLine(p1Id, tipId);
                    const f = addFace([p1Id, p2Id, tipId]);
                    faceIds.push(f.id);
                }

                addSolid('pyramid', [...solidPointsId, tipId], [], faceIds);
                resetSolidBuild();
                setTool('select');
            }
        }
        else if (activeTool === 'select') {
            selectNode(null);
        }
    };

    const handlePointerMove = (e: any) => {
        if ((activeTool === 'line' || activeTool === 'polygon') && draftLineStartId) {
            let pos = new THREE.Vector3(e.point.x, 0, e.point.z);

            if (!shiftPressed) {
                const points = Object.values(nodes).filter(n => n.type === 'point').map(n => (n as any).position);
                const snappedPoint = SnappingEngine.findNearestPoint(pos, points);
                if (snappedPoint) {
                    pos = new THREE.Vector3(snappedPoint.x, snappedPoint.y, snappedPoint.z);
                } else {
                    pos = SnappingEngine.snapToGrid(pos);
                    if (activeTool === 'line') {
                        const startNode = nodes[draftLineStartId] as any;
                        if (startNode && startNode.type === 'point') {
                            const startPos = new THREE.Vector3(startNode.position.x, startNode.position.y, startNode.position.z);
                            pos = SnappingEngine.snapToAngle(startPos, pos);
                        }
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
