"use client";

import { Group, Rect, Circle } from "react-konva";
import { useRef } from "react";
import { PlanShape } from "../../store/plans";
import Konva from "konva";

interface TransformBoxProps {
  shape: PlanShape;
  onResize: (width: number, height: number, x: number, y: number) => void;
  onMove: (x: number, y: number) => void;
  onRotate: (rotation: number) => void;
  onSelect: () => void;
}

export default function TransformBox({
  shape,
  onResize,
  onMove,
  onRotate,
  onSelect,
}: TransformBoxProps) {
  const handleSize = 8;
  const strokeWidth = 2;
  const strokeColor = "#3B82F6";
  const fillColor = "#FFFFFF";

  // Calcular las posiciones de los handles
  const handles = [
    { x: 0, y: 0, cursor: "nw-resize", anchor: "top-left" },
    { x: shape.width / 2, y: 0, cursor: "n-resize", anchor: "top-center" },
    { x: shape.width, y: 0, cursor: "ne-resize", anchor: "top-right" },
    {
      x: shape.width,
      y: shape.height / 2,
      cursor: "e-resize",
      anchor: "right-center",
    },
    {
      x: shape.width,
      y: shape.height,
      cursor: "se-resize",
      anchor: "bottom-right",
    },
    {
      x: shape.width / 2,
      y: shape.height,
      cursor: "s-resize",
      anchor: "bottom-center",
    },
    { x: 0, y: shape.height, cursor: "sw-resize", anchor: "bottom-left" },
    { x: 0, y: shape.height / 2, cursor: "w-resize", anchor: "left-center" },
  ];

  // Usar useRef para mantener el estado entre eventos
  const dragStart = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    shapeX: 0,
    shapeY: 0,
  });
  const rotateStart = useRef({ x: 0, y: 0, rotation: 0 });

  const handleDragStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    dragStart.current = {
      x: e.target.x(),
      y: e.target.y(),
      width: shape.width,
      height: shape.height,
      shapeX: shape.x,
      shapeY: shape.y,
    };
  };

  const handleDragMove = (
    e: Konva.KonvaEventObject<MouseEvent>,
    anchor: string
  ) => {
    e.cancelBubble = true;
    const mousePos = { x: e.target.x(), y: e.target.y() };
    const { width, height, shapeX, shapeY, x, y } = dragStart.current;
    let newWidth = width;
    let newHeight = height;
    let newX = shapeX;
    let newY = shapeY;

    switch (anchor) {
      case "top-left":
        newWidth = width + (x - mousePos.x);
        newHeight = height + (y - mousePos.y);
        newX = shapeX - (mousePos.x - x);
        newY = shapeY - (mousePos.y - y);
        break;
      case "top-center":
        newHeight = height + (y - mousePos.y);
        newY = shapeY - (mousePos.y - y);
        break;
      case "top-right":
        newWidth = width + (mousePos.x - x);
        newHeight = height + (y - mousePos.y);
        newY = shapeY - (mousePos.y - y);
        break;
      case "right-center":
        newWidth = width + (mousePos.x - x);
        break;
      case "bottom-right":
        newWidth = width + (mousePos.x - x);
        newHeight = height + (mousePos.y - y);
        break;
      case "bottom-center":
        newHeight = height + (mousePos.y - y);
        break;
      case "bottom-left":
        newWidth = width + (x - mousePos.x);
        newHeight = height + (mousePos.y - y);
        newX = shapeX - (mousePos.x - x);
        break;
      case "left-center":
        newWidth = width + (x - mousePos.x);
        newX = shapeX - (mousePos.x - x);
        break;
    }
    // Tamaño mínimo
    newWidth = Math.max(newWidth, 10);
    newHeight = Math.max(newHeight, 10);
    onResize(newWidth, newHeight, newX, newY);
  };

  // Rotación precisa respecto al centro del shape
  const handleRotateStart = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    rotateStart.current = {
      x: pointer.x,
      y: pointer.y,
      rotation: shape.rotation || 0,
    };
  };

  const handleRotateMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const stage = e.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const boxCenter = {
      x: shape.x + shape.width / 2,
      y: shape.y + shape.height / 2,
    };
    const dx = pointer.x - boxCenter.x;
    const dy = pointer.y - boxCenter.y;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    onRotate(angle);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
  };

  return (
    <Group
      x={shape.x}
      y={shape.y}
      rotation={shape.rotation}
      draggable
      onDragStart={(e) => {
        e.evt.stopPropagation();
        onSelect();
      }}
      onDragMove={(e) => {
        e.evt.stopPropagation();
        onMove(e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        e.evt.stopPropagation();
      }}
      onClick={(e) => {
        e.evt.stopPropagation();
        onSelect();
      }}
    >
      {/* Borde de selección */}
      <Rect
        x={-strokeWidth / 2}
        y={-strokeWidth / 2}
        width={shape.width + strokeWidth}
        height={shape.height + strokeWidth}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        fill="transparent"
        dash={[5, 5]}
      />

      {/* Handles de redimensionamiento */}
      {handles.map((handle, index) => (
        <Circle
          key={index}
          x={handle.x}
          y={handle.y}
          radius={handleSize / 2}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={1}
          draggable
          onDragStart={handleDragStart}
          onDragMove={(e) => handleDragMove(e, handle.anchor)}
          onDragEnd={handleDragEnd}
          onMouseEnter={(e) => {
            e.target.getStage()!.container().style.cursor = handle.cursor;
          }}
          onMouseLeave={(e) => {
            e.target.getStage()!.container().style.cursor = "default";
          }}
        />
      ))}

      {/* Handle de rotación */}
      <Circle
        x={shape.width / 2}
        y={-30}
        radius={handleSize / 2}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
        draggable
        onDragStart={handleRotateStart}
        onDragMove={handleRotateMove}
        onDragEnd={handleDragEnd}
        onMouseEnter={(e) => {
          e.target.getStage()!.container().style.cursor = "grab";
        }}
        onMouseLeave={(e) => {
          e.target.getStage()!.container().style.cursor = "default";
        }}
      />

      {/* Línea de conexión para rotación */}
      <Rect
        x={shape.width / 2 - 1}
        y={-25}
        width={2}
        height={25}
        fill={strokeColor}
      />
    </Group>
  );
}
