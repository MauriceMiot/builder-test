"use client";

import { forwardRef } from "react";
import { Group, Line } from "react-konva";
import Konva from "konva";

interface TriangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
  rotation: number;
  onClick: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const Triangle = forwardRef<Konva.Group, TriangleProps>((props, ref) => {
  const {
    x,
    y,
    width,
    height,
    fill,
    stroke,
    strokeWidth,
    draggable,
    rotation,
    onClick,
    onTap,
    onDragEnd,
  } = props;
  const points = [width / 2, 0, width, height, 0, height];
  return (
    <Group
      ref={ref}
      draggable={draggable}
      onClick={onClick}
      onTap={onTap}
      onDragEnd={onDragEnd}
      rotation={rotation}
      x={x}
      y={y}
    >
      <Line
        points={points}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        closed
      />
    </Group>
  );
});

Triangle.displayName = "Triangle";

export default Triangle;
