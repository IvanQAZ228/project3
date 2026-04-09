export type NodeType = 'point' | 'line' | 'face' | 'plane' | 'solid';

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

export interface IFaceNode extends IBaseNode {
    type: 'face';
    pointIds: string[]; // Ordered list of points forming the polygon
}

export type SolidType = 'cube' | 'pyramid';

export interface ISolidNode extends IBaseNode {
    type: 'solid';
    solidType: SolidType;
    pointIds: string[];
    lineIds: string[];
    faceIds: string[];
}
