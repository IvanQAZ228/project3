import { Vector3 } from 'three';
import type { IVector3 } from '../../types/graph.types';

export class SnappingEngine {
    static GRID_SIZE = 1;
    static SNAP_DISTANCE = 0.5;

    // Snap to grid
    static snapToGrid(position: Vector3): Vector3 {
        return new Vector3(
            Math.round(position.x / this.GRID_SIZE) * this.GRID_SIZE,
            Math.round(position.y / this.GRID_SIZE) * this.GRID_SIZE,
            Math.round(position.z / this.GRID_SIZE) * this.GRID_SIZE
        );
    }

    // Find nearest point within snap distance
    static findNearestPoint(position: Vector3, points: IVector3[]): IVector3 | null {
        let nearest: IVector3 | null = null;
        let minDistance = this.SNAP_DISTANCE;

        for (const pt of points) {
            const vPt = new Vector3(pt.x, pt.y, pt.z);
            const dist = position.distanceTo(vPt);

            if (dist < minDistance) {
                minDistance = dist;
                nearest = pt;
            }
        }

        return nearest;
    }

    // Snap to angle (for line construction, angles in degrees)
    static snapToAngle(start: Vector3, current: Vector3, snapAnglesDeg: number[] = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330], thresholdDeg = 5): Vector3 {
        const dir = new Vector3().subVectors(current, start);
        const length = dir.length();
        if (length === 0) return current;

        dir.normalize();

        // Only considering XZ plane for simplicity of 2D angle
        // In 3D we'd need to define the plane of construction
        const angleRad = Math.atan2(dir.z, dir.x);
        let angleDeg = (angleRad * 180 / Math.PI + 360) % 360;

        for (const snapDeg of snapAnglesDeg) {
            if (Math.abs(angleDeg - snapDeg) < thresholdDeg) {
                const snappedRad = snapDeg * Math.PI / 180;
                return new Vector3(
                    start.x + Math.cos(snappedRad) * length,
                    current.y, // preserve Y height for now
                    start.z + Math.sin(snappedRad) * length
                );
            }
        }

        return current;
    }
}
