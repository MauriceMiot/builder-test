"use client";

import { Circle } from "react-konva";

interface PolygonVertexProps {
  x: number;
  y: number;
  index: number;
  isSelected: boolean;
  onDragMove: (index: number, x: number, y: number) => void;
  onDragEnd: (index: number, x: number, y: number) => void;
  onDoubleClick: (index: number) => void;
}

export default function PolygonVertex({
  x,
  y,
  index,
  isSelected,
  onDragMove,
  onDragEnd,
  onDoubleClick,
}: PolygonVertexProps) {
  return (
    <Circle
      x={x}
      y={y}
      radius={isSelected ? 6 : 4}
      fill={isSelected ? "#EF4444" : "#F59E0B"}
      stroke={isSelected ? "#DC2626" : "#D97706"}
      strokeWidth={2}
      draggable={true}
      onDragMove={(e) => {
        onDragMove(index, e.target.x(), e.target.y());
      }}
      onDragEnd={(e) => {
        onDragEnd(index, e.target.x(), e.target.y());
      }}
      onDblClick={() => onDoubleClick(index)}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = "pointer";
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = "default";
      }}
    />
  );
}
