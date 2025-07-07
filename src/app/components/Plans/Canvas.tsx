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
import { usePlanStore, PlanShape } from "../../store/plans";
import Triangle from "./Triangle";
import Stadium from "./Stadium";
import RegularPolygon from "./RegularPolygon";
import PolygonVertex from "./PolygonVertex";
import SeatSVG from "./SeatSVG";
import KonvaWrapper from "./KonvaWrapper";

// Variable para almacenar la figura copiada temporalmente
let copiedShape: PlanShape | null = null;

export default function Canvas() {
  const shapeRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const {
    shapes,
    currentTool,
    selectedShapeId,
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
    updateShape,
    removeShape,
    clearSelection,
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
    addPolygonVertex,
    removePolygonVertex,
    updatePreviewShape,
  } = usePlanStore();

  useEffect(() => {
    if (selectedShapeId && shapeRef.current && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedShapeId, shapes]);

  // Eliminar con tecla Suprimir/Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedShapeId) {
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
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    selectedShapeId,
    removeShape,
    clearSelection,
    isDrawingPolygon,
    finishPolygonDrawing,
    isEditingPolygon,
    stopPolygonEditing,
  ]);

  useEffect(() => {
    const handleCopyPaste = (e: KeyboardEvent) => {
      // Copiar (Ctrl+C o Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (selectedShapeId) {
          const shape = shapes.find((s) => s.id === selectedShapeId);
          if (shape) {
            copiedShape = { ...shape };
          }
        }
      }
      // Pegar (Ctrl+V o Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (copiedShape) {
          // Crear una copia con nuevo ID y posición desplazada
          const { id, x, y, selected, ...rest } = copiedShape;
          const newShape = {
            ...rest,
            x: x + 30,
            y: y + 30,
            selected: false,
          };
          addShape(newShape);
        }
      }
    };
    window.addEventListener("keydown", handleCopyPaste);
    return () => window.removeEventListener("keydown", handleCopyPaste);
  }, [selectedShapeId, shapes, addShape]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: any) => {
    const stage = e.target.getStage();
    const clickedOnEmpty = e.target === stage;

    if (!currentTool) {
      // Modo selección
      if (clickedOnEmpty) {
        clearSelection();
        return;
      }
      return;
    }

    // Solo iniciar dibujo si se hace clic en el canvas vacío
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
    } else {
      // Modo dibujo de figuras
      setStartPos(pos);
      setIsDrawing(true);
      updatePreviewShape(null);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage?.getPointerPosition();
    if (!pos) return;

    if (currentTool === "freehand" && isDrawingFreehand) {
      // Agregar punto al dibujo libre
      addPointToFreehand(pos.x, pos.y);
    } else if (
      isDrawing &&
      currentTool &&
      currentTool !== "freehand" &&
      currentTool !== "polygon"
    ) {
      // Preview de figuras normales en tiempo real
      const width = Math.abs(pos.x - startPos.x);
      const height = Math.abs(pos.y - startPos.y);

      if (width > 5 && height > 5) {
        let previewData: any = {
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
    }
  };

  const handleMouseUp = (e: any) => {
    if (currentTool === "freehand") {
      // Finalizar dibujo libre
      finishFreehandDrawing();
    } else if (
      isDrawing &&
      currentTool &&
      currentTool !== "freehand" &&
      currentTool !== "polygon"
    ) {
      const stage = e.target.getStage();
      const pos = stage?.getPointerPosition();
      if (pos) {
        const width = Math.abs(pos.x - startPos.x);
        const height = Math.abs(pos.y - startPos.y);

        // Solo crear figura si tiene un tamaño mínimo
        if (width > 5 && height > 5) {
          let newShape: any = {
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
          if (currentTool === "regular-polygon") {
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

  const handleShapeClick = (shapeId: string) => {
    selectShape(shapeId);
  };

  const handleShapeDragEnd = (shapeId: string, x: number, y: number) => {
    const snappedX = snapToGrid(x);
    const snappedY = snapToGrid(y);
    updateShape(shapeId, {
      x: snappedX,
      y: snappedY,
    });
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
    const strokeColor = shape.stroke;
    const strokeWidth = shape.strokeWidth;

    const commonProps = {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
      stroke: strokeColor,
      strokeWidth,
      draggable: true,
      rotation: shape.rotation,
      onClick: () => handleShapeClick(shape.id),
      onTap: () => handleShapeClick(shape.id),
      onDragEnd: (e: any) => {
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
            {...commonProps}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
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
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: any) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
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
            onDragEnd={(e: any) => {
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
            onDragEnd={(e: any) => {
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
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            sides={shape.sides || 5}
            radius={shape.radius || Math.min(shape.width, shape.height) / 2}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: any) => {
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
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            closed={shape.closed || false}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDblClick={() => handlePolygonDoubleClick(shape.id)}
            onDragEnd={(e: any) => {
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
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: any) => {
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
            fill={shape.fill}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            closed={shape.closed || false}
            draggable={true}
            rotation={shape.rotation}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: any) => {
              handleShapeDragEnd(shape.id, e.target.x(), e.target.y());
            }}
            ref={isSelected ? shapeRef : undefined}
          />
        );
      case "seat":
        return (
          <SeatSVG
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
            seatNumber={shape.seatNumber}
            seatStatus={shape.seatStatus}
            seatSection={shape.seatSection}
            seatPrice={shape.seatPrice}
            onClick={() => handleShapeClick(shape.id)}
            onTap={() => handleShapeClick(shape.id)}
            onDragEnd={(e: any) => {
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-black h-full">
        <KonvaWrapper
          width={1200}
          height={800}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchstart={handleMouseDown}
          onTouchmove={handleMouseMove}
          onTouchend={handleMouseUp}
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
              />
            )}
          </Layer>
        </KonvaWrapper>
      </div>
    </div>
  );
}
