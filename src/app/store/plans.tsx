import { create } from "zustand";

export type ShapeType =
  | "rectangle"
  | "circle"
  | "triangle"
  | "text"
  | "image"
  | "freehand"
  | "ellipse"
  | "stadium"
  | "polygon"
  | "regular-polygon"
  | "seat";

export type PlanShape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  rotation: number;
  draggable: boolean;
  selected: boolean;
  // Para formas libres y polígonos
  points?: number[];
  closed?: boolean;
  // Para polígonos regulares
  sides?: number;
  radius?: number;
  // Para asientos
  seatNumber?: string;
  seatStatus?: "available" | "sold" | "reserved";
  seatSection?: string;
  seatPrice?: number;
};

export type GridConfig = {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
};

interface PlanStore {
  shapes: PlanShape[];
  selectedShapeId: string | null;
  isDrawing: boolean;
  currentTool: ShapeType | null;
  gridConfig: GridConfig;
  // Para dibujo libre
  currentPath: number[];
  isDrawingFreehand: boolean;
  // Para polígonos irregulares
  isDrawingPolygon: boolean;
  polygonPoints: number[];
  // Para edición de polígonos
  isEditingPolygon: boolean;
  editingPolygonId: string | null;
  // Para preview en tiempo real
  previewShape: Omit<PlanShape, "id"> | null;
  // Configuración de polígonos regulares
  regularPolygonSides: number;

  // Acciones básicas
  addShape: (shape: Omit<PlanShape, "id">) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, updates: Partial<PlanShape>) => void;
  selectShape: (id: string | null) => void;

  // Herramientas
  setCurrentTool: (tool: ShapeType | null) => void;
  setIsDrawing: (drawing: boolean) => void;

  // Dibujo libre
  startFreehandDrawing: (x: number, y: number) => void;
  addPointToFreehand: (x: number, y: number) => void;
  finishFreehandDrawing: () => void;
  clearCurrentPath: () => void;

  // Polígonos irregulares
  startPolygonDrawing: (x: number, y: number) => void;
  addPolygonPoint: (x: number, y: number) => void;
  finishPolygonDrawing: () => void;
  clearPolygonPoints: () => void;

  // Edición de polígonos
  startPolygonEditing: (polygonId: string) => void;
  stopPolygonEditing: () => void;
  updatePolygonVertex: (
    polygonId: string,
    vertexIndex: number,
    x: number,
    y: number
  ) => void;
  addPolygonVertex: (polygonId: string, x: number, y: number) => void;
  removePolygonVertex: (polygonId: string, vertexIndex: number) => void;

  // Polígonos regulares
  setRegularPolygonSides: (sides: number) => void;

  // Preview en tiempo real
  updatePreviewShape: (shape: Omit<PlanShape, "id"> | null) => void;

  // Grid
  updateGridConfig: (config: Partial<GridConfig>) => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;

  // Selección múltiple
  clearSelection: () => void;
  selectMultiple: (ids: string[]) => void;

  // Exportar/Importar
  exportToJSON: () => string;
  importFromJSON: (json: string) => void;

  // Utilidades
  duplicateShape: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Snap to grid
  snapToGrid: (value: number) => number;
  snapShapeToGrid: (shape: Omit<PlanShape, "id">) => Omit<PlanShape, "id">;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  shapes: [],
  selectedShapeId: null,
  isDrawing: false,
  currentTool: null,
  gridConfig: {
    enabled: true,
    size: 40,
    color: "#E5E7EB",
    opacity: 0.5,
    snapToGrid: false,
  },
  currentPath: [],
  isDrawingFreehand: false,
  isDrawingPolygon: false,
  polygonPoints: [],
  isEditingPolygon: false,
  editingPolygonId: null,
  previewShape: null,
  regularPolygonSides: 5,

  addShape: (shapeData) => {
    const newShape: PlanShape = {
      id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...shapeData,
    };
    set((state) => ({
      shapes: [...state.shapes, newShape],
      selectedShapeId: newShape.id,
    }));
  },

  removeShape: (id) => {
    set((state) => ({
      shapes: state.shapes.filter((shape) => shape.id !== id),
      selectedShapeId:
        state.selectedShapeId === id ? null : state.selectedShapeId,
    }));
  },

  updateShape: (id, updates) => {
    set((state) => ({
      shapes: state.shapes.map((shape) =>
        shape.id === id ? { ...shape, ...updates } : shape
      ),
    }));
  },

  selectShape: (id) => {
    set({ selectedShapeId: id });
  },

  setCurrentTool: (tool) => {
    set({ currentTool: tool });
  },

  setIsDrawing: (drawing) => {
    set({ isDrawing: drawing });
  },

  startFreehandDrawing: (x, y) => {
    const { snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    set({
      currentPath: [snappedX, snappedY],
      isDrawingFreehand: true,
    });
  },

  addPointToFreehand: (x, y) => {
    const { currentPath, snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    set({
      currentPath: [...currentPath, snappedX, snappedY],
    });
  },

  finishFreehandDrawing: () => {
    const { currentPath, gridConfig } = get();
    if (currentPath.length >= 4) {
      // Al menos 2 puntos
      // Calcular bounding box
      const xCoords = currentPath.filter((_, i) => i % 2 === 0);
      const yCoords = currentPath.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      const newShape: PlanShape = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "freehand",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        fill: "#3B82F6",
        stroke: "#1E40AF",
        strokeWidth: 2,
        rotation: 0,
        draggable: true,
        selected: false,
        points: currentPath,
        closed: true,
      };

      set((state) => ({
        shapes: [...state.shapes, newShape],
        selectedShapeId: newShape.id,
        currentPath: [],
        isDrawingFreehand: false,
      }));
    } else {
      set({
        currentPath: [],
        isDrawingFreehand: false,
      });
    }
  },

  clearCurrentPath: () => {
    set({
      currentPath: [],
      isDrawingFreehand: false,
    });
  },

  startPolygonDrawing: (x, y) => {
    const { snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    set({
      polygonPoints: [snappedX, snappedY],
      isDrawingPolygon: true,
    });
  },

  addPolygonPoint: (x, y) => {
    const { polygonPoints, snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    set({
      polygonPoints: [...polygonPoints, snappedX, snappedY],
    });
  },

  finishPolygonDrawing: () => {
    const { polygonPoints, gridConfig } = get();
    if (polygonPoints.length >= 6) {
      // Al menos 3 puntos (6 coordenadas)
      // Calcular bounding box
      const xCoords = polygonPoints.filter((_, i) => i % 2 === 0);
      const yCoords = polygonPoints.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xCoords);
      const maxX = Math.max(...xCoords);
      const minY = Math.min(...yCoords);
      const maxY = Math.max(...yCoords);

      // Cerrar el polígono conectando el último punto con el primero
      const closedPoints = [...polygonPoints];
      if (closedPoints.length >= 4) {
        closedPoints.push(closedPoints[0], closedPoints[1]);
      }

      const newShape: PlanShape = {
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: "polygon",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        fill: "#3B82F6",
        stroke: "#1E40AF",
        strokeWidth: 2,
        rotation: 0,
        draggable: true,
        selected: false,
        points: closedPoints,
        closed: true,
      };

      set((state) => ({
        shapes: [...state.shapes, newShape],
        selectedShapeId: newShape.id,
        polygonPoints: [],
        isDrawingPolygon: false,
      }));
    } else {
      set({
        polygonPoints: [],
        isDrawingPolygon: false,
      });
    }
  },

  clearPolygonPoints: () => {
    set({
      polygonPoints: [],
      isDrawingPolygon: false,
    });
  },

  setRegularPolygonSides: (sides) => {
    set({ regularPolygonSides: sides });
  },

  updatePreviewShape: (shape) => {
    set({ previewShape: shape });
  },

  updateGridConfig: (config) => {
    set((state) => ({
      gridConfig: { ...state.gridConfig, ...config },
    }));
  },

  toggleGrid: () => {
    set((state) => ({
      gridConfig: { ...state.gridConfig, enabled: !state.gridConfig.enabled },
    }));
  },

  toggleSnapToGrid: () => {
    set((state) => ({
      gridConfig: {
        ...state.gridConfig,
        snapToGrid: !state.gridConfig.snapToGrid,
      },
    }));
  },

  clearSelection: () => {
    set({ selectedShapeId: null });
  },

  selectMultiple: (ids) => {
    // Por ahora solo seleccionamos el primero, pero podríamos expandir esto
    set({ selectedShapeId: ids[0] || null });
  },

  exportToJSON: () => {
    const { shapes, gridConfig } = get();
    return JSON.stringify({ shapes, gridConfig }, null, 2);
  },

  importFromJSON: (json) => {
    try {
      const data = JSON.parse(json);
      set({
        shapes: data.shapes || [],
        gridConfig: data.gridConfig || get().gridConfig,
        selectedShapeId: null,
      });
    } catch (error) {
      console.error("Error importing JSON:", error);
    }
  },

  duplicateShape: (id) => {
    const { shapes } = get();
    const shapeToDuplicate = shapes.find((shape) => shape.id === id);
    if (shapeToDuplicate) {
      const duplicatedShape: PlanShape = {
        ...shapeToDuplicate,
        id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: shapeToDuplicate.x + 20,
        y: shapeToDuplicate.y + 20,
        selected: false,
      };
      set((state) => ({
        shapes: [...state.shapes, duplicatedShape],
        selectedShapeId: duplicatedShape.id,
      }));
    }
  },

  bringToFront: (id) => {
    set((state) => {
      const shapeIndex = state.shapes.findIndex((shape) => shape.id === id);
      if (shapeIndex === -1) return state;

      const newShapes = [...state.shapes];
      const [shape] = newShapes.splice(shapeIndex, 1);
      newShapes.push(shape);

      return { shapes: newShapes };
    });
  },

  sendToBack: (id) => {
    set((state) => {
      const shapeIndex = state.shapes.findIndex((shape) => shape.id === id);
      if (shapeIndex === -1) return state;

      const newShapes = [...state.shapes];
      const [shape] = newShapes.splice(shapeIndex, 1);
      newShapes.unshift(shape);

      return { shapes: newShapes };
    });
  },

  snapToGrid: (value) => {
    const { gridConfig } = get();
    if (!gridConfig.snapToGrid) return value;
    return Math.round(value / gridConfig.size) * gridConfig.size;
  },

  snapShapeToGrid: (shape) => {
    const { gridConfig, snapToGrid } = get();
    const snappedShape = { ...shape };
    snappedShape.x = gridConfig.snapToGrid ? snapToGrid(shape.x) : shape.x;
    snappedShape.y = gridConfig.snapToGrid ? snapToGrid(shape.y) : shape.y;
    return snappedShape;
  },

  startPolygonEditing: (polygonId) => {
    set({ isEditingPolygon: true, editingPolygonId: polygonId });
  },

  stopPolygonEditing: () => {
    set({ isEditingPolygon: false, editingPolygonId: null });
  },

  updatePolygonVertex: (polygonId, vertexIndex, x, y) => {
    const { snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    set((state) => ({
      shapes: state.shapes.map((shape) => {
        if (shape.id === polygonId && shape.points) {
          const newPoints = [...shape.points];
          newPoints[vertexIndex * 2] = snappedX;
          newPoints[vertexIndex * 2 + 1] = snappedY;

          // Recalcular bounding box
          const xCoords = newPoints.filter((_, i) => i % 2 === 0);
          const yCoords = newPoints.filter((_, i) => i % 2 === 1);
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);

          return {
            ...shape,
            points: newPoints,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
        }
        return shape;
      }),
    }));
  },

  addPolygonVertex: (polygonId, x, y) => {
    const { snapToGrid } = get();
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);

    set((state) => ({
      shapes: state.shapes.map((shape) => {
        if (shape.id === polygonId && shape.points) {
          const newPoints = [...shape.points, snappedX, snappedY];

          // Recalcular bounding box
          const xCoords = newPoints.filter((_, i) => i % 2 === 0);
          const yCoords = newPoints.filter((_, i) => i % 2 === 1);
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);

          return {
            ...shape,
            points: newPoints,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
        }
        return shape;
      }),
    }));
  },

  removePolygonVertex: (polygonId, vertexIndex) => {
    set((state) => ({
      shapes: state.shapes.map((shape) => {
        if (shape.id === polygonId && shape.points && shape.points.length > 6) {
          const newPoints = shape.points.filter(
            (_, index) =>
              index !== vertexIndex * 2 && index !== vertexIndex * 2 + 1
          );

          // Recalcular bounding box
          const xCoords = newPoints.filter((_, i) => i % 2 === 0);
          const yCoords = newPoints.filter((_, i) => i % 2 === 1);
          const minX = Math.min(...xCoords);
          const maxX = Math.max(...xCoords);
          const minY = Math.min(...yCoords);
          const maxY = Math.max(...yCoords);

          return {
            ...shape,
            points: newPoints,
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
          };
        }
        return shape;
      }),
    }));
  },
}));
