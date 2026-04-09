export type NodeType = 'point' | 'line' | 'plane' | 'solid';

export interface IVector3 {
    x: number;
    y: number;
    z: number;
}

export interface IBaseNode {
    id: string;
    type: NodeType;
    name: string;
    visible: boolean;
    dependencies: string[];
    dependents: string[];
}

export interface IPointNode extends IBaseNode {
    type: 'point';
    position: IVector3;
}

export interface ILineNode extends IBaseNode {
    type: 'line';
    startId: string;
    endId: string;
}

export type SolidType = 'cube' | 'pyramid';

export interface ISolidNode extends IBaseNode {
    type: 'solid';
    solidType: SolidType;
    pointIds: string[]; // For cube: 3 points (p1, p2 for base edge, p3 for direction/plane). Pyramid: base point, tip point etc.
}
