"use client";

import { Circle } from "react-konva";

export interface SimpleCircleProps {
  x: number; // centro X
  y: number; // centro Y
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  opacity?: number;
}

export default function SimpleCircleRenderer({
  x,
  y,
  radius,
  fill = "#3B82F6",
  stroke = "#1E40AF",
  strokeWidth = 2,
  rotation = 0,
  draggable = false,
  opacity = 1,
}: SimpleCircleProps) {
  return (
    <Circle
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rotation={rotation}
      draggable={draggable}
      opacity={opacity}
    />
  );
}
