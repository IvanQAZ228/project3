import { create } from 'zustand';
import type { IBaseNode, IPointNode, ILineNode, IFaceNode, ISolidNode, SolidType, IVector3 } from '../types/graph.types';
import { v4 as uuidv4 } from 'uuid';

interface GraphState {
    nodes: Record<string, IBaseNode>;
    selectedNodeId: string | null;
    pointCounter: number;
    addPoint: (position: IVector3) => IPointNode;
    addLine: (startId: string, endId: string) => ILineNode;
    addFace: (pointIds: string[]) => IFaceNode;
    addSolid: (solidType: SolidType, pointIds: string[], lineIds: string[], faceIds: string[]) => ISolidNode;
    updatePointPosition: (id: string, position: IVector3) => void;
    selectNode: (id: string | null) => void;
    deleteNode: (id: string) => void;
}

const generatePointName = (count: number) => {
    let name = '';
    let temp = count;
    while (temp >= 0) {
        name = String.fromCharCode((temp % 26) + 65) + name;
        temp = Math.floor(temp / 26) - 1;
    }
    return name;
};

export const useGraphStore = create<GraphState>((set, get) => ({
    nodes: {},
    selectedNodeId: null,
    pointCounter: 0,

    addPoint: (position) => {
        const id = uuidv4();
        const { pointCounter } = get();
        const newNode: IPointNode = {
            id,
            type: 'point',
            name: generatePointName(pointCounter),
            visible: true,
            position,
            dependencies: [],
            dependents: []
        };

        set((state) => ({
            nodes: { ...state.nodes, [id]: newNode },
            pointCounter: state.pointCounter + 1
        }));

        return newNode;
    },

    addLine: (startId, endId) => {
        const id = uuidv4();
        const newNode: ILineNode = {
            id,
            type: 'line',
            name: `Line_${id.substring(0, 4)}`,
            visible: true,
            startId,
            endId,
            dependencies: [startId, endId],
            dependents: []
        };

        set((state) => {
            const startNode = state.nodes[startId];
            const endNode = state.nodes[endId];

            return {
                nodes: {
                    ...state.nodes,
                    [id]: newNode,
                    [startId]: { ...startNode, dependents: [...startNode.dependents, id] },
                    [endId]: { ...endNode, dependents: [...endNode.dependents, id] },
                }
            };
        });

        return newNode;
    },

    addFace: (pointIds) => {
        const id = uuidv4();
        const newNode: IFaceNode = {
            id,
            type: 'face',
            name: `Face_${id.substring(0, 4)}`,
            visible: true,
            pointIds,
            dependencies: [...pointIds],
            dependents: []
        };

        set((state) => {
            const newNodes = { ...state.nodes, [id]: newNode };
            pointIds.forEach(pId => {
                if (newNodes[pId]) {
                    newNodes[pId] = { ...newNodes[pId], dependents: [...newNodes[pId].dependents, id] };
                }
            });
            return { nodes: newNodes };
        });

        return newNode;
    },

    addSolid: (solidType, pointIds, lineIds, faceIds) => {
        const id = uuidv4();
        const newNode: ISolidNode = {
            id,
            type: 'solid',
            solidType,
            name: `${solidType.charAt(0).toUpperCase() + solidType.slice(1)}_${id.substring(0, 4)}`,
            visible: true,
            pointIds,
            lineIds,
            faceIds,
            dependencies: [...pointIds, ...lineIds, ...faceIds],
            dependents: []
        };

        set((state) => {
            const newNodes = { ...state.nodes, [id]: newNode };

            [...pointIds, ...lineIds, ...faceIds].forEach(depId => {
                if (newNodes[depId]) {
                    newNodes[depId] = { ...newNodes[depId], dependents: [...newNodes[depId].dependents, id] };
                }
            });

            return { nodes: newNodes };
        });

        return newNode;
    },

    updatePointPosition: (id, position) => {
        set((state) => {
            const node = state.nodes[id];
            if (!node || node.type !== 'point') return state;

            return {
                nodes: {
                    ...state.nodes,
                    [id]: { ...node, position }
                }
            };
        });

        // TODO: Update DAG dependents here
    },

    selectNode: (id) => set({ selectedNodeId: id }),

    deleteNode: (id) => {
        set((state) => {
            const newNodes = { ...state.nodes };
            // Simple deletion for now. Real DAG deletion needs to remove dependents.
            delete newNodes[id];
            return { nodes: newNodes, selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId };
        });
    }
}));
