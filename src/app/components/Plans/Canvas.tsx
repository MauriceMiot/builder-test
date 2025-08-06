"use client";

import { useRef, useState, useEffect } from "react";
import {
  Layer,
  Rect,
  Circle,
  Text,
  Line,
  Transformer,
  Ellipse,
} from "react-konva";
import Konva from "konva";
import { Icon } from "@iconify/react";

import { usePlanStore, PlanShape } from "../../store/plans";
import Triangle from "./Triangle";
import Stadium from "./Stadium";
import RegularPolygon from "./RegularPolygon";
import PolygonVertex from "./PolygonVertex";
import SeatSVG from "./SeatSVG";
import KonvaWrapper from "./KonvaWrapper";

// Variable para almacenar las figuras copiadas temporalmente
let copiedShapes: PlanShape[] = [];

export default function Canvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [zoom, setZoom] = useState(1);
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [seatHighlightPosition, setSeatHighlightPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [selectionArea, setSelectionArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const {
    shapes,
    currentTool,
    selectedShapeId,
    selectedShapeIds,
    gridConfig,
    currentPath,
    isDrawingFreehand,
    polygonPoints,
    isDrawingPolygon,
    isEditingPolygon,
    editingPolygonId,
    regularPolygonSides,
    previewShape,
    addShape,
    selectShape,
    selectMultiple,
    updateShape,
    removeShape,
    clearSelection,
    bringToFront,
    sendToBack,
    snapToGrid,
    snapShapeToGrid,
    startFreehandDrawing,
    addPointToFreehand,
    finishFreehandDrawing,
    startPolygonDrawing,
    addPolygonPoint,
    finishPolygonDrawing,
    startPolygonEditing,
    stopPolygonEditing,
    updatePolygonVertex,
    removePolygonVertex,
    updatePreviewShape,
    getSeatSize,
    snapPositionToGrid,
    isSeatPositionValid,
    isSeatMoveValid,
    getSeatPositions,
    updateSeatIndex,
    moveSelectedSeats,
    selectSeatsInArea,
  } = usePlanStore();

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3)); // Máximo 3x zoom
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3)); // Mínimo 0.3x zoom
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  useEffect(() => {
    if (selectedShapeId && shapeRef.current && transformerRef.current) {
      // Solo mostrar el transformer si hay una sola figura seleccionada
      if (selectedShapeIds.length === 1) {
        transformerRef.current.nodes([shapeRef.current]);
        transformerRef.current.getLayer()?.batchDraw();
      } else {
        // Si hay selección múltiple, ocultar el transformer
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    }
  }, [selectedShapeId, selectedShapeIds, shapes]);

  // Limpiar posición del highlight cuando cambie la herramienta
  useEffect(() => {
    if (currentTool !== "seat") {
      setSeatHighlightPosition(null);
    }
    if (currentTool !== "selection") {
      setSelectionArea(null);
    }
  }, [currentTool]);

  // Eliminar con tecla Suprimir/Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar si el elemento activo es un input, textarea o contenteditable
      const activeElement = document.activeElement;
      const isInputElement =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          (activeElement as HTMLElement).contentEditable === "true");

      // Solo borrar la figura si no estamos en un input y hay una figura seleccionada
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedShapeId &&
        !isInputElement
      ) {
        removeShape(selectedShapeId);
        clearSelection();
      }
      // Finalizar polígono con Enter
      if (e.key === "Enter" && isDrawingPolygon) {
        finishPolygonDrawing();
      }
      // Cancelar polígono con Escape
      if (e.key === "Escape" && isDrawingPolygon) {
        usePlanStore.getState().clearPolygonPoints();
      }
      // Salir del modo edición con Escape
      if (e.key === "Escape" && isEditingPolygon) {
        stopPolygonEditing();
      }
      // Cancelar modo de pegado con Escape
      if (e.key === "Escape" && isPasteMode) {
        setIsPasteMode(false);
      }
      // Traer al frente con Ctrl+Shift+Up
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key === "ArrowUp" &&
        selectedShapeId
      ) {
        e.preventDefault();
        bringToFront(selectedShapeId);
      }
      // Enviar atrás con Ctrl+Shift+Down
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        e.key === "ArrowDown" &&
        selectedShapeId
      ) {
        e.preventDefault();
        sendToBack(selectedShapeId);
      }

      // Movimiento grupal de asientos con flechas
      if (selectedShapeIds.length > 0) {
        console.log(
          "Tecla presionada:",
          e.key,
          "selectedShapeIds:",
          selectedShapeIds
        );

        const gridSize = gridConfig.size;
        let deltaX = 0;
        let deltaY = 0;

        switch (e.key) {
          case "ArrowLeft":
            deltaX = -gridSize;
            break;
          case "ArrowRight":
            deltaX = gridSize;
            break;
          case "ArrowUp":
            deltaY = -gridSize;
            break;
          case "ArrowDown":
            deltaY = gridSize;
            break;
        }

        if (deltaX !== 0 || deltaY !== 0) {
          e.preventDefault();
          console.log("Intentando mover asientos:", { deltaX, deltaY });
          moveSelectedSeats(deltaX, deltaY);
        }
      } else {
        console.log("No hay asientos seleccionados para movimiento grupal");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedShapeId,
    selectedShapeIds,
    gridConfig.size,
    removeShape,
    clearSelection,
    bringToFront,
    sendToBack,
    isDrawingPolygon,
    finishPolygonDrawing,
    isEditingPolygon,
    stopPolygonEditing,
    isPasteMode,
    moveSelectedSeats,
  ]);

  useEffect(() => {
    const handleCopyPaste = (e: KeyboardEvent) => {
      // Copiar (Ctrl+C o Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (selectedShapeIds.length > 0) {
          // Copiar selección múltiple
          const selectedShapes = shapes.filter((s) =>
            selectedShapeIds.includes(s.id)
          );
          copiedShapes = selectedShapes.map((shape) => ({ ...shape }));
          console.log("Copiadas", copiedShapes.length, "formas");
        } else if (selectedShapeId) {
          // Copiar selección individual
          const shape = shapes.find((s) => s.id === selectedShapeId);
          if (shape) {
            copiedShapes = [{ ...shape }];
            console.log("Copiada 1 forma");
          }
        }
      }
      // Pegar (Ctrl+V o Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (copiedShapes.length > 0) {
          // Activar modo de pegado
          setIsPasteMode(true);
          console.log(
            "Modo de pegado activado. Haz clic donde quieres pegar las",
            copiedShapes.length,
            "formas"
          );
        }
      }
    };
    window.addEventListener("keydown", handleCopyPaste);
    return () => window.removeEventListener("keydown", handleCopyPaste);
  }, [selectedShapeId, selectedShapeIds, shapes, addShape]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [invalidSeatPosition, setInvalidSeatPosition] = useState(false);
  const [seatHighlightPositions, setSeatHighlightPositions] = useState<
    string[]
  >([]);

  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const clickedOnEmpty = e.target === stage;

    // Manejar modo de pegado
    if (isPasteMode && clickedOnEmpty) {
      const pos = stage?.getPointerPosition();
      if (pos && copiedShapes.length > 0) {
        // Calcular el offset basado en la posición del clic
        const firstShape = copiedShapes[0];
        const offsetX = pos.x - firstShape.x;
        const offsetY = pos.y - firstShape.y;

        // Crear copias de todas las formas en la nueva posición
        copiedShapes.forEach((originalShape) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = originalShape;
          const newShape = {
            ...rest,
            x: originalShape.x + offsetX,
            y: originalShape.y + offsetY,
            selected: false,
          };
          addShape(newShape);
        });

        console.log("Pegadas", copiedShapes.length, "formas en posición", pos);
        setIsPasteMode(false);
        return;
      }
    }

    // Si no hay herramienta seleccionada, solo manejar selección
    if (!currentTool) {
      if (clickedOnEmpty) {
        clearSelection();
      }
      return;
    }

    // Solo procesar clics en el canvas vacío
    if (!clickedOnEmpty) {
      return;
    }

    const pos = stage?.getPointerPosition();
    if (!pos) return;

    if (currentTool === "freehand") {
      // Iniciar dibujo libre
      startFreehandDrawing(pos.x, pos.y);
    } else if (currentTool === "polygon") {
      // Iniciar o agregar punto al polígono irregular
      if (!isDrawingPolygon) {
        startPolygonDrawing(pos.x, pos.y);
      } else {
        addPolygonPoint(pos.x, pos.y);
      }
    } else if (currentTool === "seat") {
      // Crear asiento directamente en la posición del highlight (que ya está ajustada a la cuadrícula)
      const seatSizeInSquares = gridConfig.seatSize;

      // Solo crear si hay una posición de highlight disponible
      if (
        seatHighlightPosition &&
        isSeatPositionValid(
          seatHighlightPosition.x,
          seatHighlightPosition.y,
          seatSizeInSquares
        )
      ) {
        const seatSize = getSeatSize();

        const newShape: Omit<PlanShape, "id"> = {
          type: "seat",
          x: seatHighlightPosition.x,
          y: seatHighlightPosition.y,
          width: seatSize,
          height: seatSize,
          fill: "#3B82F6",
          stroke: "#1E40AF",
          strokeWidth: 2,
          rotation: 0,
          draggable: true,
          selected: false,
        };

        addShape(newShape);
        // Actualizar el índice del asiento recién creado después de un breve delay
        setTimeout(() => {
          const newSeats = shapes.filter((s) => s.type === "seat");
          if (newSeats.length > 0) {
            const lastSeat = newSeats[newSeats.length - 1];
            updateSeatIndex(lastSeat.id);
          }
        }, 100);
        setInvalidSeatPosition(false);
      } else {
        setInvalidSeatPosition(true);
        // Limpiar el mensaje después de 2 segundos
        setTimeout(() => setInvalidSeatPosition(false), 2000);
      }
    } else if (currentTool === "selection") {
      // Iniciar selección por área
      setStartPos(pos);
      setIsDrawing(true);
      setSelectionArea({ x: pos.x, y: pos.y, width: 0, height: 0 });
    } else {
      // Modo dibujo de figuras (para otras formas)
      setStartPos(pos);
      setIsDrawing(true);
      updatePreviewShape(null);
    }
  };

  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    if (currentTool === "freehand" && isDrawingFreehand) {
      // Agregar punto al dibujo libre
      addPointToFreehand(pos.x, pos.y);
    } else if (currentTool === "seat") {
      // Resaltar el área que ocuparía el asiento
      const seatSizeInSquares = gridConfig.seatSize;
      const positions = getSeatPositions(pos.x, pos.y, seatSizeInSquares);
      setSeatHighlightPositions(positions);

      // Almacenar la posición ajustada a la cuadrícula para crear el asiento
      const snappedPos = snapPositionToGrid(pos.x, pos.y);
      setSeatHighlightPosition(snappedPos);
    } else if (currentTool === "selection" && isDrawing) {
      // Actualizar área de selección
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);
      const x = Math.min(startPos.x, pos.x);
      const y = Math.min(startPos.y, pos.y);

      setSelectionArea({ x, y, width, height });
    } else if (
      isDrawing &&
      currentTool &&
      currentTool !== "freehand" &&
      currentTool !== "polygon" &&
      !["seat"].includes(currentTool)
    ) {
      // Preview de figuras normales en tiempo real
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);

      if (width > 5 && height > 5) {
        let previewData: Omit<PlanShape, "id"> = {
          type: currentTool,
          x: Math.min(startPos.x, pos.x),
          y: Math.min(startPos.y, pos.y),
          width,
          height,
          fill: "#3B82F6",
          stroke: "#1E40AF",
          strokeWidth: 2,
          rotation: 0,
          draggable: false,
          selected: false,
        };

        // Configuración específica para polígonos regulares
        if (currentTool === "regular-polygon") {
          const radius = Math.min(width, height) / 2;
          const centerX = startPos.x + width / 2;
          const centerY = startPos.y + height / 2;
          previewData = {
            ...previewData,
            type: "regular-polygon",
            x: centerX - radius,
            y: centerY - radius,
            width: radius * 2,
            height: radius * 2,
            sides: regularPolygonSides,
            radius,
          };
        } else if (currentTool === "text") {
          previewData.text = "Texto";
          previewData.fontSize = 16;
          previewData.fontFamily = "Arial";
        }

        // Aplicar snap to grid si está activado
        const snappedPreview = snapShapeToGrid(previewData);
        updatePreviewShape(snappedPreview);
      } else {
        updatePreviewShape(null);
      }
    } else {
      updatePreviewShape(null);
      setSeatHighlightPositions([]);
      setSeatHighlightPosition(null);
      setSelectionArea(null);
    }
  };

  const handleMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (currentTool === "freehand") {
      // Finalizar dibujo libre
      finishFreehandDrawing();
    } else if (currentTool === "selection" && isDrawing) {
      // Finalizar selección por área
      if (selectionArea) {
        console.log("Área de selección:", selectionArea);
        selectSeatsInArea(
          selectionArea.x,
          selectionArea.y,
          selectionArea.x + selectionArea.width,
          selectionArea.y + selectionArea.height
        );
      }
      setSelectionArea(null);
      setIsDrawing(false);
    } else if (
      isDrawing &&
      currentTool &&
      !["freehand", "polygon", "seat", "selection"].includes(currentTool) // Excluir asientos y selección
    ) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        const width = Math.abs(pos.x - startPos.x);
        const height = Math.abs(pos.y - startPos.y);

        // Solo crear figura si tiene un tamaño mínimo
        if (width > 5 && height > 5) {
          let newShape: Omit<PlanShape, "id"> = {
            type: currentTool,
            x: Math.min(startPos.x, pos.x),
            y: Math.min(startPos.y, pos.y),
            width,
            height,
            fill: "#3B82F6",
            stroke: "#1E40AF",
            strokeWidth: 2,
            rotation: 0,
            draggable: true,
            selected: false,
          };

          // Configuración específica para polígonos regulares
          if (currentTool === ("regular-polygon" as const)) {
            const radius = Math.min(width, height) / 2;
            const centerX = startPos.x + width / 2;
            const centerY = startPos.y + height / 2;
            newShape = {
              ...newShape,
              type: "regular-polygon",
              x: centerX - radius,
              y: centerY - radius,
              width: radius * 2,
              height: radius * 2,
              sides: regularPolygonSides,
              radius,
            };
          } else if (currentTool === "text") {
            newShape.text = "Texto";
            newShape.fontSize = 16;
            newShape.fontFamily = "Arial";
          }

          // Aplicar auto-adaptación a la grid
          const snappedShape = snapShapeToGrid(newShape);
          addShape(snappedShape);
        }
      }
      setIsDrawing(false);
      updatePreviewShape(null);
    }
  };

  // Funciones para eventos de touch
  const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseDown(e as unknown as Konva.KonvaEventObject<MouseEvent>);
  };

  const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseMove(e as unknown as Konva.KonvaEventObject<MouseEvent>);
  };

  const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
    handleMouseUp(e as unknown as Konva.KonvaEventObject<MouseEvent>);
  };

  const handleShapeClick = (shapeId: string, event?: MouseEvent) => {
    const shape = shapes.find((s) => s.id === shapeId);

    // Selección múltiple con Ctrl/Cmd
    if (event && (event.ctrlKey || event.metaKey)) {
      const newSelectedIds = selectedShapeIds.includes(shapeId)
        ? selectedShapeIds.filter((id) => id !== shapeId)
        : [...selectedShapeIds, shapeId];

      selectMultiple(newSelectedIds);

      // Si el shape seleccionado es un asiento, actualizar su índice
      if (shape?.type === "seat") {
        updateSeatIndex(shapeId);
      }
    } else {
      // Selección simple - si ya está seleccionado, mantener la selección múltiple
      if (selectedShapeIds.includes(shapeId) && selectedShapeIds.length > 1) {
        // Si ya está en la selección múltiple, mantener la selección
        return;
      }

      // Selección simple
      selectShape(shapeId);

      // Si el shape seleccionado es un asiento, actualizar su índice
      if (shape?.type === "seat") {
        updateSeatIndex(shapeId);
      }
    }
  };

  const handleShapeDragEnd = (shapeId: string, x: number, y: number) => {
    const shape = shapes.find((s) => s.id === shapeId);

    // Validación especial para asientos
    if (shape?.type === "seat") {
      if (isSeatMoveValid(shapeId, x, y)) {
        // Siempre ajustar a la cuadrícula para asientos, independientemente de la configuración
        const gridSize = gridConfig.size;
        const snappedX = Math.round(x / gridSize) * gridSize;
        const snappedY = Math.round(y / gridSize) * gridSize;
        updateShape(shapeId, { x: snappedX, y: snappedY });
        // Actualizar el índice después de mover el asiento
        setTimeout(() => updateSeatIndex(shapeId), 100);
      } else {
        // Si la posición no es válida, revertir a la posición original
        updateShape(shapeId, { x: shape.x, y: shape.y });
      }
    } else {
      // Para otras formas, comportamiento normal
      if (gridConfig.snapToGrid && gridConfig.enabled) {
        const snappedX = snapToGrid(x);
        const snappedY = snapToGrid(y);
        updateShape(shapeId, { x: snappedX, y: snappedY });
      } else {
        updateShape(shapeId, { x, y });
      }
    }
  };

  const handlePolygonDoubleClick = (shapeId: string) => {
    if (shapes.find((s) => s.id === shapeId)?.type === "polygon") {
      startPolygonEditing(shapeId);
    }
  };

  const handleVertexDragMove = (
    polygonId: string,
    vertexIndex: number,
    x: number,
    y: number
  ) => {
    updatePolygonVertex(polygonId, vertexIndex, x, y);
  };

  const handleVertexDragEnd = (
    polygonId: string,
    vertexIndex: number,
    x: number,
    y: number
  ) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    updatePolygonVertex(polygonId, vertexIndex, snappedX, snappedY);
  };

  const handleVertexDoubleClick = (polygonId: string, vertexIndex: number) => {
    removePolygonVertex(polygonId, vertexIndex);
  };

  const renderShape = (shape: PlanShape) => {
    const isSelected = selectedShapeId === shape.id;
    const isInMultiSelection = selectedShapeIds.includes(shape.id);

    // Para asientos, solo mostrar borde cuando están seleccionados
    let strokeColor = shape.stroke;
    let strokeWidth = shape.strokeWidth;

    if (shape.type === "seat") {
      if (isInMultiSelection) {
        strokeColor = "#FF6B6B";
        strokeWidth = 3;
      } else {
        strokeColor = "transparent"; // Sin borde para asientos no seleccionados
        strokeWidth = 0;
      }
    } else {
      // Para otras formas, mantener el comportamiento original
      strokeColor = isInMultiSelection ? "#FF6B6B" : shape.stroke;
      strokeWidth = isInMultiSelection ? 3 : shape.strokeWidth;
    }

    const fillColor = isInMultiSelection ? "#FFE6E6" : shape.fill;

    const commonProps = {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth,
      draggable: true,
      rotation: shape.rotation,
      onClick: (e: Konva.KonvaEventObject<MouseEvent>) =>
        handleShapeClick(shape.id, e.evt),
      onTap: (e: Konva.KonvaEventObject<MouseEvent>) =>
        handleShapeClick(shape.id, e.evt),
      onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
        handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
      },
      ref: isSelected ? shapeRef : undefined,
    };

    switch (shape.type) {
      case "rectangle":
        return <Rect key={shape.id} {...commonProps} />;
      case "circle":
        return (
          <Circle
            key={shape.id}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              // Para círculos, necesitamos ajustar la posición ya que usan centro
              const newX = e.target.x() - shape.width / 2;
              const newY = e.target.y() - shape.height / 2;
              handleShapeDragEnd(shape.id, newX, newY);
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "ellipse":
        return (
          <Ellipse
            key={shape.id}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
            radiusX={shape.width / 2}
            radiusY={shape.height / 2}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              // Para elipses, necesitamos ajustar la posición ya que usan centro
              const newX = e.target.x() - shape.width / 2;
              const newY = e.target.y() - shape.height / 2;
              handleShapeDragEnd(shape.id, newX, newY);
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "triangle":
        return (
          <Triangle
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "stadium":
        return (
          <Stadium
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "regular-polygon":
        return (
          <RegularPolygon
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            sides={shape.sides || 5}
            radius={shape.radius || Math.min(shape.width, shape.height) / 2}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "polygon":
        return (
          <Line
            key={shape.id}
            points={shape.points || []}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            closed={shape.closed || false}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDblClick={() => handlePolygonDoubleClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "text":
        return (
          <Text
            key={shape.id}
            x={shape.x}
            y={shape.y}
            text={shape.text || "Texto"}
            fontSize={shape.fontSize || 16}
            fontFamily={shape.fontFamily || "Arial"}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "freehand":
        return (
          <Line
            key={shape.id}
            points={shape.points || []}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            closed={shape.closed || false}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "seat":
        const isInMultiSelection = selectedShapeIds.includes(shape.id);
        console.log("Renderizando asiento:", {
          id: shape.id,
          isSelected,
          isInMultiSelection,
          selectedShapeIds,
          strokeColor,
          strokeWidth,
        });

        return (
          <SeatSVG
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            seatNumber={shape.seatNumber}
            seatStatus={shape.seatStatus}
            seatSection={shape.seatSection}
            seatPrice={shape.seatPrice}
            isSelected={isSelected}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      default:
        return null;
    }
  };

  // Renderizar vértices editables para polígonos en modo edición
  const renderPolygonVertices = () => {
    if (!isEditingPolygon || !editingPolygonId) return null;

    const polygon = shapes.find((s) => s.id === editingPolygonId);
    if (!polygon || polygon.type !== "polygon" || !polygon.points) return null;

    return polygon.points.map((point, index) => {
      if (index % 2 === 0) {
        const x = point;
        const y = polygon.points![index + 1];
        const vertexIndex = index / 2;

        return (
          <PolygonVertex
            key={`vertex-${editingPolygonId}-${vertexIndex}`}
            x={x}
            y={y}
            index={vertexIndex}
            isSelected={false}
            onDragMove={(vertexIndex, x, y) =>
              handleVertexDragMove(editingPolygonId, vertexIndex, x, y)
            }
            onDragEnd={(vertexIndex, x, y) =>
              handleVertexDragEnd(editingPolygonId, vertexIndex, x, y)
            }
            onDoubleClick={(vertexIndex) =>
              handleVertexDoubleClick(editingPolygonId, vertexIndex)
            }
          />
        );
      }
      return null;
    });
  };

  return (
    <div className="flex-1 bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-black h-full relative">
        <KonvaWrapper
          width={1200}
          height={800}
          scaleX={zoom}
          scaleY={zoom}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchstart={handleTouchStart}
          onTouchmove={handleTouchMove}
          onTouchend={handleTouchEnd}
        >
          <Layer>
            {/* Grid de fondo */}
            {gridConfig.enabled && (
              <>
                {Array.from(
                  { length: Math.ceil(1200 / gridConfig.size) },
                  (_, i) => (
                    <Rect
                      key={`grid-v-${i}`}
                      x={i * gridConfig.size}
                      y={0}
                      width={1}
                      height={800}
                      fill={gridConfig.color}
                      opacity={gridConfig.opacity}
                    />
                  )
                )}
                {Array.from(
                  { length: Math.ceil(800 / gridConfig.size) },
                  (_, i) => (
                    <Rect
                      key={`grid-h-${i}`}
                      x={0}
                      y={i * gridConfig.size}
                      width={1200}
                      height={1}
                      fill={gridConfig.color}
                      opacity={gridConfig.opacity}
                    />
                  )
                )}
              </>
            )}

            {/* Resaltado de área para asientos */}
            {currentTool === "seat" && seatHighlightPositions.length > 0 && (
              <>
                {seatHighlightPositions.map((posKey, index) => {
                  const [x, y] = posKey.split(",").map(Number);
                  return (
                    <Rect
                      key={`highlight-${index}`}
                      x={x}
                      y={y}
                      width={gridConfig.size}
                      height={gridConfig.size}
                      fill="#3B82F6"
                      opacity={0.3}
                      stroke="#1E40AF"
                      strokeWidth={1}
                    />
                  );
                })}
              </>
            )}

            {/* Área de selección */}
            {selectionArea && (
              <Rect
                x={selectionArea.x}
                y={selectionArea.y}
                width={selectionArea.width}
                height={selectionArea.height}
                fill="#3B82F6"
                opacity={0.2}
                stroke="#1E40AF"
                strokeWidth={2}
                dash={[5, 5]}
              />
            )}

            {/* Figuras */}
            {shapes.map(renderShape)}
            {/* Línea de dibujo libre en tiempo real */}
            {isDrawingFreehand && currentPath.length >= 4 && (
              <Line
                points={currentPath}
                stroke="#3B82F6"
                strokeWidth={2}
                fill="transparent"
                closed={false}
              />
            )}
            {/* Línea de polígono irregular en tiempo real */}
            {isDrawingPolygon && polygonPoints.length >= 6 && (
              <>
                {/* Línea de contorno */}
                <Line
                  points={polygonPoints}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="transparent"
                  closed={false}
                />
                {/* Polígono relleno (vista previa) */}
                <Line
                  points={[
                    ...polygonPoints,
                    polygonPoints[0],
                    polygonPoints[1],
                  ]}
                  stroke="#1E40AF"
                  strokeWidth={1}
                  fill="#3B82F6"
                  opacity={0.3}
                  closed={true}
                />
                {/* Puntos de vértices */}
                {polygonPoints.map((point, index) => {
                  if (index % 2 === 0) {
                    const x = point;
                    const y = polygonPoints[index + 1];
                    return (
                      <Circle
                        key={`vertex-${index}`}
                        x={x}
                        y={y}
                        radius={4}
                        fill="#EF4444"
                        stroke="#DC2626"
                        strokeWidth={1}
                      />
                    );
                  }
                  return null;
                })}
              </>
            )}
            {/* Línea simple mientras se dibuja (menos de 3 puntos) */}
            {isDrawingPolygon &&
              polygonPoints.length >= 2 &&
              polygonPoints.length < 6 && (
                <Line
                  points={polygonPoints}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="transparent"
                  closed={false}
                />
              )}
            {/* Vértices editables para polígonos en modo edición */}
            {renderPolygonVertices()}
            {/* Preview de figuras en tiempo real */}
            {previewShape &&
              (() => {
                const previewNode = renderShape({
                  ...previewShape,
                  id: "preview",
                });
                return previewNode ? previewNode : null;
              })()}
            {/* Transformer de Konva para la figura seleccionada */}
            {selectedShapeId && !isEditingPolygon && (
              <Transformer
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
                rotateEnabled={true}
                enabledAnchors={[
                  "top-left",
                  "top-center",
                  "top-right",
                  "middle-right",
                  "bottom-right",
                  "bottom-center",
                  "bottom-left",
                  "middle-left",
                ]}
                onTransformEnd={(e: Konva.KonvaEventObject<Event>) => {
                  // Manejar el final de la transformación de manera suave
                  const node = e.target;
                  const scaleX = node.scaleX();
                  const scaleY = node.scaleY();

                  // Resetear la escala para evitar problemas
                  node.scaleX(1);
                  node.scaleY(1);

                  // Actualizar el shape con las nuevas dimensiones
                  const shapeId = selectedShapeId;
                  if (shapeId) {
                    const shape = shapes.find((s) => s.id === shapeId);
                    if (shape) {
                      let newWidth = Math.max(shape.width * scaleX, 10);
                      let newHeight = Math.max(shape.height * scaleY, 10);

                      // Aplicar snap to grid si está habilitado
                      if (gridConfig.snapToGrid && gridConfig.enabled) {
                        newWidth = snapToGrid(newWidth);
                        newHeight = snapToGrid(newHeight);
                      }

                      // Solo actualizar dimensiones y rotación, NO la posición
                      updateShape(shapeId, {
                        width: newWidth,
                        height: newHeight,
                        rotation: node.rotation(),
                      });
                    }
                  }
                }}
              />
            )}
          </Layer>
        </KonvaWrapper>

        {/* Controles de zoom en la esquina superior derecha */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
          <button
            onClick={handleZoomIn}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom In"
          >
            <Icon icon="mdi:zoom-in" className="text-xl text-gray-700" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Zoom Out"
          >
            <Icon icon="mdi:zoom-out" className="text-xl text-gray-700" />
          </button>
          <button
            onClick={handleResetZoom}
            className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
            title="Reset Zoom"
          >
            <Icon icon="mdi:refresh" className="text-lg text-gray-700" />
          </button>
        </div>

        {/* Indicador de posición inválida para asientos */}
        {invalidSeatPosition && currentTool === "seat" && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-20 animate-pulse">
            No se puede colocar un asiento aquí
          </div>
        )}

        {/* Indicador de selección múltiple */}
        {selectedShapeIds.length > 1 && (
          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-20">
            {selectedShapeIds.length} asientos seleccionados
          </div>
        )}

        {/* Indicador de modo de pegado */}
        {isPasteMode && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-20 animate-pulse">
            Haz clic donde quieres pegar las {copiedShapes.length} formas
          </div>
        )}
      </div>
    </div>
  );
}
