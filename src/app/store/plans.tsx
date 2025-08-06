import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  | "seat"
  | "selection";

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
  seatIndex?: number; // Índice de posición del asiento
};

export type GridConfig = {
  enabled: boolean;
  size: number;
  color: string;
  opacity: number;
  snapToGrid: boolean;
  seatSize: number; // Nuevo: tamaño del asiento en cuadrados (ej: 2 = 2² = 4 cuadrados)
};

interface PlanStore {
  shapes: PlanShape[];
  selectedShapeId: string | null;
  selectedShapeIds: string[]; // Para selección múltiple
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

  // Guardar plano
  savePlan: (planData: {
    title: string;
    shapes: PlanShape[];
    gridConfig: GridConfig;
  }) => void;

  // Utilidades
  duplicateShape: (id: string) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;

  // Snap to grid
  snapToGrid: (value: number) => number;
  snapShapeToGrid: (shape: Omit<PlanShape, "id">) => Omit<PlanShape, "id">;

  // Calcular tamaño del asiento basado en la configuración
  getSeatSize: () => number;

  // Redimensionar todos los asientos existentes
  resizeAllSeats: () => void;

  // Funciones para validación de colocación de asientos
  snapPositionToGrid: (x: number, y: number) => { x: number; y: number };
  isSeatPositionValid: (x: number, y: number, seatSize: number) => boolean;
  getOccupiedGridPositions: () => Set<string>;

  // Funciones para validación al mover asientos
  isSeatMoveValid: (seatId: string, newX: number, newY: number) => boolean;
  getSeatPositions: (x: number, y: number, seatSize: number) => string[];

  // Función para calcular índice de posición de asientos
  updateSeatIndex: (seatId: string) => void;

  // Función para calcular índices de todos los asientos
  calculateAllSeatIndexes: () => void;

  // Funciones para movimiento grupal de asientos
  moveSelectedSeats: (deltaX: number, deltaY: number) => void;
  isSeatGroupMoveValid: (
    seatIds: string[],
    deltaX: number,
    deltaY: number
  ) => boolean;

  // Funciones para selección por área
  selectSeatsInArea: (x1: number, y1: number, x2: number, y2: number) => void;
}

export const usePlanStore = create<PlanStore>()(
  persist(
    (set, get) => ({
      shapes: [],
      selectedShapeId: null,
      selectedShapeIds: [],
      isDrawing: false,
      currentTool: null,
      gridConfig: {
        enabled: true,
        size: 40,
        color: "#E5E7EB",
        opacity: 0.5,
        snapToGrid: false,
        seatSize: 1, // Valor por defecto para el tamaño del asiento
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
        // Si es un asiento, asegurar seatStatus: 'available' por defecto
        const isSeat = shapeData.type === "seat";
        const newShape: PlanShape = {
          id: `shape_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...shapeData,
          ...(isSeat && { seatStatus: shapeData.seatStatus || "available" }),
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
        set({ selectedShapeId: id, selectedShapeIds: id ? [id] : [] });
      },

      // Selección múltiple
      selectMultiple: (ids) => {
        console.log("selectMultiple llamado:", { ids });
        set({
          selectedShapeIds: ids,
          selectedShapeId: ids.length > 0 ? ids[0] : null,
        });
      },

      clearSelection: () => {
        set({ selectedShapeId: null, selectedShapeIds: [] });
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
        const { currentPath } = get();
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
            id: `shape_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
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
        const { polygonPoints } = get();
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
            id: `shape_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
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
        set((state) => {
          const newGridConfig = { ...state.gridConfig, ...config };

          // Si se cambió el tamaño del asiento o el tamaño de la cuadrícula, redimensionar todos los asientos existentes
          if (
            (config.seatSize !== undefined &&
              config.seatSize !== state.gridConfig.seatSize) ||
            (config.size !== undefined && config.size !== state.gridConfig.size)
          ) {
            const newSeatSize =
              newGridConfig.seatSize *
              newGridConfig.seatSize *
              newGridConfig.size;

            const updatedShapes = state.shapes.map((shape) => {
              if (shape.type === "seat") {
                // Calcular la posición ajustada a la nueva cuadrícula
                const gridSize = newGridConfig.size;
                const snappedX = Math.round(shape.x / gridSize) * gridSize;
                const snappedY = Math.round(shape.y / gridSize) * gridSize;

                const updatedShape = {
                  ...shape,
                  width: newSeatSize,
                  height: newSeatSize,
                  x: snappedX,
                  y: snappedY,
                };
                return updatedShape;
              }
              return shape;
            });

            return {
              gridConfig: newGridConfig,
              shapes: updatedShapes,
            };
          }

          return {
            gridConfig: newGridConfig,
          };
        });
      },

      toggleGrid: () => {
        set((state) => ({
          gridConfig: {
            ...state.gridConfig,
            enabled: !state.gridConfig.enabled,
          },
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

      savePlan: (planData) => {
        // Guardar el plano en localStorage por ahora
        const savedPlans = JSON.parse(
          localStorage.getItem("savedPlans") || "[]"
        );
        const newPlan = {
          id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: planData.title,
          shapes: planData.shapes,
          gridConfig: planData.gridConfig,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        savedPlans.push(newPlan);
        localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
      },

      duplicateShape: (id) => {
        const { shapes } = get();
        const shapeToDuplicate = shapes.find((shape) => shape.id === id);
        if (shapeToDuplicate) {
          const duplicatedShape: PlanShape = {
            ...shapeToDuplicate,
            id: `shape_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
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

        // Calcular el múltiplo más cercano del tamaño de la cuadrícula
        const gridSize = gridConfig.size;
        return Math.round(value / gridSize) * gridSize;
      },

      snapShapeToGrid: (shape) => {
        const { gridConfig, snapToGrid } = get();
        const snappedShape = { ...shape };

        if (gridConfig.snapToGrid) {
          // Ajustar posición
          snappedShape.x = snapToGrid(shape.x);
          snappedShape.y = snapToGrid(shape.y);

          // Ajustar dimensiones para que se alineen con la cuadrícula
          // Solo ajustar si la diferencia es menor a la mitad del tamaño de la cuadrícula
          const snappedWidth = snapToGrid(shape.width);
          const snappedHeight = snapToGrid(shape.height);

          // Asegurar que las dimensiones mínimas se mantengan
          const minSize = Math.max(10, gridConfig.size);

          if (Math.abs(snappedWidth - shape.width) <= gridConfig.size / 2) {
            snappedShape.width = Math.max(snappedWidth, minSize);
          }
          if (Math.abs(snappedHeight - shape.height) <= gridConfig.size / 2) {
            snappedShape.height = Math.max(snappedHeight, minSize);
          }
        }

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
            if (
              shape.id === polygonId &&
              shape.points &&
              shape.points.length > 6
            ) {
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

      getSeatSize: () => {
        const { gridConfig } = get();
        // Calcular el tamaño del asiento basado en la configuración
        // Si seatSize es 2, entonces el tamaño es 2² = 4 cuadrados
        const seatSizeInSquares = gridConfig.seatSize;
        const seatSizeInPixels =
          seatSizeInSquares * seatSizeInSquares * gridConfig.size;
        return seatSizeInPixels;
      },

      resizeAllSeats: () => {
        const { gridConfig } = get();
        const newSeatSize =
          gridConfig.seatSize * gridConfig.seatSize * gridConfig.size;

        set((state) => ({
          shapes: state.shapes.map((shape) => {
            if (shape.type === "seat") {
              // Calcular la posición ajustada a la cuadrícula
              const gridSize = gridConfig.size;
              const snappedX = Math.round(shape.x / gridSize) * gridSize;
              const snappedY = Math.round(shape.y / gridSize) * gridSize;

              const updatedShape = {
                ...shape,
                width: newSeatSize,
                height: newSeatSize,
                x: snappedX,
                y: snappedY,
              };
              return updatedShape;
            }
            return shape;
          }),
        }));
      },

      snapPositionToGrid: (x, y) => {
        const { gridConfig } = get();
        // Para asientos, siempre ajustar a la cuadrícula independientemente de la configuración
        const gridSize = gridConfig.size;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
        return { x: snappedX, y: snappedY };
      },

      isSeatPositionValid: (x, y, seatSize) => {
        const { gridConfig, getOccupiedGridPositions } = get();
        // Para asientos, siempre ajustar a la cuadrícula independientemente de la configuración
        const gridSize = gridConfig.size;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;

        // Verificar si la posición está dentro de los límites del canvas (1200x800)
        if (snappedX < 0 || snappedX + seatSize * gridConfig.size > 1200)
          return false;
        if (snappedY < 0 || snappedY + seatSize * gridConfig.size > 800)
          return false;

        // Verificar si alguna de las posiciones que ocuparía el asiento está ocupada
        const occupiedPositions = getOccupiedGridPositions();
        for (let i = 0; i < seatSize; i++) {
          for (let j = 0; j < seatSize; j++) {
            const posKey = `${snappedX + i * gridConfig.size},${
              snappedY + j * gridConfig.size
            }`;
            if (occupiedPositions.has(posKey)) {
              return false;
            }
          }
        }
        return true;
      },

      getOccupiedGridPositions: () => {
        const { shapes, gridConfig, getSeatSize } = get();
        const occupiedPositions = new Set<string>();

        shapes.forEach((shape) => {
          if (shape.type === "seat") {
            // Para asientos, siempre ajustar a la cuadrícula independientemente de la configuración
            const gridSize = gridConfig.size;
            const snappedX = Math.round(shape.x / gridSize) * gridSize;
            const snappedY = Math.round(shape.y / gridSize) * gridSize;
            const seatSizeInSquares = Math.sqrt(
              getSeatSize() / gridConfig.size
            );

            for (let i = 0; i < seatSizeInSquares; i++) {
              for (let j = 0; j < seatSizeInSquares; j++) {
                const posKey = `${snappedX + i * gridConfig.size},${
                  snappedY + j * gridConfig.size
                }`;
                occupiedPositions.add(posKey);
              }
            }
          }
        });
        return occupiedPositions;
      },

      isSeatMoveValid: (seatId, newX, newY) => {
        const { gridConfig, getOccupiedGridPositions } = get();
        const seat = get().shapes.find((shape) => shape.id === seatId);
        if (!seat) return false;

        // Para asientos, siempre ajustar a la cuadrícula independientemente de la configuración
        const gridSize = gridConfig.size;
        const snappedNewX = Math.round(newX / gridSize) * gridSize;
        const snappedNewY = Math.round(newY / gridSize) * gridSize;

        // Verificar si la nueva posición está dentro de los límites del canvas (1200x800)
        if (snappedNewX < 0 || snappedNewX + seat.width > 1200) return false;
        if (snappedNewY < 0 || snappedNewY + seat.height > 800) return false;

        // Verificar si alguna de las posiciones que ocuparía el asiento en la nueva posición está ocupada
        const occupiedPositions = getOccupiedGridPositions();
        for (let i = 0; i < seat.width / gridConfig.size; i++) {
          for (let j = 0; j < seat.height / gridConfig.size; j++) {
            const posKey = `${snappedNewX + i * gridConfig.size},${
              snappedNewY + j * gridConfig.size
            }`;
            if (occupiedPositions.has(posKey)) {
              return false;
            }
          }
        }
        return true;
      },

      getSeatPositions: (x, y, seatSize) => {
        const { gridConfig } = get();
        // Para asientos, siempre ajustar a la cuadrícula independientemente de la configuración
        const gridSize = gridConfig.size;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
        const positions: string[] = [];

        for (let i = 0; i < seatSize; i++) {
          for (let j = 0; j < seatSize; j++) {
            positions.push(
              `${snappedX + i * gridConfig.size},${
                snappedY + j * gridConfig.size
              }`
            );
          }
        }
        return positions;
      },

      updateSeatIndex: (seatId) => {
        const { shapes, gridConfig } = get();
        const seat = shapes.find((shape) => shape.id === seatId);

        if (!seat || seat.type !== "seat") return;

        // Obtener todos los asientos ordenados por posición (de arriba a abajo, de izquierda a derecha)
        const seats = shapes
          .filter((shape) => shape.type === "seat")
          .sort((a, b) => {
            // Primero ordenar por Y (fila), luego por X (columna)
            const gridSize = gridConfig.size;
            const snappedAY = Math.round(a.y / gridSize) * gridSize;
            const snappedBY = Math.round(b.y / gridSize) * gridSize;

            if (snappedAY !== snappedBY) {
              return snappedAY - snappedBY;
            }

            const snappedAX = Math.round(a.x / gridSize) * gridSize;
            const snappedBX = Math.round(b.x / gridSize) * gridSize;
            return snappedAX - snappedBX;
          });

        // Encontrar el índice del asiento seleccionado
        const seatIndex = seats.findIndex((s) => s.id === seatId);

        if (seatIndex !== -1) {
          // Actualizar el asiento con su índice (empezando desde 1)
          set((state) => ({
            shapes: state.shapes.map((shape) => {
              if (shape.id === seatId) {
                return {
                  ...shape,
                  seatIndex: seatIndex + 1, // Índice basado en 1
                };
              }
              return shape;
            }),
          }));
        }
      },

      calculateAllSeatIndexes: () => {
        const { shapes, snapToGrid } = get();

        // Obtener todos los asientos ordenados por posición (de arriba a abajo, de izquierda a derecha)
        const seats = shapes
          .filter((shape) => shape.type === "seat")
          .sort((a, b) => {
            // Primero ordenar por Y (fila), luego por X (columna)
            const snappedAY = snapToGrid(a.y);
            const snappedBY = snapToGrid(b.y);

            if (snappedAY !== snappedBY) {
              return snappedAY - snappedBY;
            }

            const snappedAX = snapToGrid(a.x);
            const snappedBX = snapToGrid(b.x);
            return snappedAX - snappedBX;
          });

        // Actualizar todos los asientos con sus índices
        set((state) => ({
          shapes: state.shapes.map((shape) => {
            if (shape.type === "seat") {
              const seatIndex = seats.findIndex((s) => s.id === shape.id);
              if (seatIndex !== -1) {
                return {
                  ...shape,
                  seatIndex: seatIndex + 1, // Índice basado en 1
                };
              }
            }
            return shape;
          }),
        }));
      },

      // Funciones para movimiento grupal de asientos
      moveSelectedSeats: (deltaX, deltaY) => {
        const { selectedShapeIds, gridConfig, shapes } = get();

        console.log("moveSelectedSeats llamado:", {
          selectedShapeIds,
          selectedShapeIdsLength: selectedShapeIds.length,
          deltaX,
          deltaY,
        });

        if (selectedShapeIds.length === 0) return;

        // Filtrar solo asientos seleccionados
        const selectedSeats = shapes.filter(
          (shape) =>
            selectedShapeIds.includes(shape.id) && shape.type === "seat"
        );

        if (selectedSeats.length === 0) {
          console.log("No hay asientos seleccionados para mover");
          return;
        }

        // Verificar si el movimiento es válido para todo el grupo
        const isValidMove = get().isSeatGroupMoveValid(
          selectedShapeIds,
          deltaX,
          deltaY
        );
        console.log("Validación de movimiento grupal:", { isValidMove });

        if (isValidMove) {
          console.log("Movimiento válido, actualizando posiciones...");
          set((state) => ({
            shapes: state.shapes.map((shape) => {
              if (
                selectedShapeIds.includes(shape.id) &&
                shape.type === "seat"
              ) {
                // Ajustar a la cuadrícula
                const gridSize = gridConfig.size;
                const newX =
                  Math.round((shape.x + deltaX) / gridSize) * gridSize;
                const newY =
                  Math.round((shape.y + deltaY) / gridSize) * gridSize;

                console.log("Actualizando asiento:", {
                  id: shape.id,
                  oldPos: { x: shape.x, y: shape.y },
                  newPos: { x: newX, y: newY },
                });

                return {
                  ...shape,
                  x: newX,
                  y: newY,
                };
              }
              return shape;
            }),
          }));

          // Actualizar índices de todos los asientos seleccionados
          selectedShapeIds.forEach((seatId) => {
            setTimeout(() => get().updateSeatIndex(seatId), 100);
          });
        } else {
          console.log("Movimiento no válido, no se actualiza");
        }
      },

      isSeatGroupMoveValid: (seatIds, deltaX, deltaY) => {
        const { shapes, gridConfig } = get();

        // Verificar que todos los asientos del grupo puedan moverse
        for (const seatId of seatIds) {
          const seat = shapes.find((s) => s.id === seatId);
          if (!seat || seat.type !== "seat") continue;

          const gridSize = gridConfig.size;
          const newX = Math.round((seat.x + deltaX) / gridSize) * gridSize;
          const newY = Math.round((seat.y + deltaY) / gridSize) * gridSize;

          // Verificar límites del canvas
          if (newX < 0 || newX + seat.width > 1200) return false;
          if (newY < 0 || newY + seat.height > 800) return false;

          // Verificar conflictos con otros asientos (excluyendo los del grupo)
          const occupiedPositions = get().getOccupiedGridPositions();
          const seatSizeInSquares = Math.sqrt(
            get().getSeatSize() / gridConfig.size
          );

          for (let i = 0; i < seatSizeInSquares; i++) {
            for (let j = 0; j < seatSizeInSquares; j++) {
              const posKey = `${newX + i * gridConfig.size},${
                newY + j * gridConfig.size
              }`;

              // Solo verificar conflictos con asientos que no están en el grupo
              const isOccupiedByGroup = seatIds.some((groupId) => {
                const groupSeat = shapes.find((s) => s.id === groupId);
                if (!groupSeat || groupSeat.type !== "seat") return false;

                const groupSeatSizeInSquares = Math.sqrt(
                  get().getSeatSize() / gridConfig.size
                );
                for (let gi = 0; gi < groupSeatSizeInSquares; gi++) {
                  for (let gj = 0; gj < groupSeatSizeInSquares; gj++) {
                    const groupPosKey = `${
                      groupSeat.x + gi * gridConfig.size
                    },${groupSeat.y + gj * gridConfig.size}`;
                    if (groupPosKey === posKey) return true;
                  }
                }
                return false;
              });

              if (occupiedPositions.has(posKey) && !isOccupiedByGroup) {
                return false;
              }
            }
          }
        }

        return true;
      },

      // Selección por área
      selectSeatsInArea: (x1, y1, x2, y2) => {
        const { shapes } = get();

        // Calcular el área de selección
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        // Encontrar todos los asientos dentro del área
        const seatsInArea = shapes
          .filter((shape) => shape.type === "seat")
          .filter((seat) => {
            // Verificar si el asiento intersecta con el área de selección
            const seatRight = seat.x + seat.width;
            const seatBottom = seat.y + seat.height;

            const isInArea =
              seat.x < maxX &&
              seatRight > minX &&
              seat.y < maxY &&
              seatBottom > minY;

            console.log("Verificando asiento:", {
              id: seat.id,
              seatPos: {
                x: seat.x,
                y: seat.y,
                right: seatRight,
                bottom: seatBottom,
              },
              area: { minX, maxX, minY, maxY },
              isInArea,
            });

            return isInArea;
          })
          .map((seat) => seat.id);

        console.log("Asientos encontrados en área:", seatsInArea);

        // Seleccionar los asientos encontrados
        if (seatsInArea.length > 0) {
          console.log("Estableciendo selección múltiple:", seatsInArea);
          set({
            selectedShapeIds: seatsInArea,
            selectedShapeId: seatsInArea[0],
          });
        } else {
          console.log("No se encontraron asientos, limpiando selección");
          set({
            selectedShapeId: null,
            selectedShapeIds: [],
          });
        }
      },
    }),
    {
      name: "plan-store",
      partialize: (state) => ({
        shapes: state.shapes,
        gridConfig: state.gridConfig,
      }),
    }
  )
);
