"use client";

import { Rect } from "react-konva";

export interface SimpleRectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
}

export default function SimpleRectangleRenderer({
  x,
  y,
  width,
  height,
  fill = "#3B82F6",
  stroke = "#1E40AF",
  strokeWidth = 2,
  rotation = 0,
  draggable = false,
  cornerRadius = 0,
  shadowColor,
  shadowBlur,
  shadowOffsetX,
  shadowOffsetY,
  opacity = 1,
}: SimpleRectangleProps) {
  return (
    <Rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rotation={rotation}
      draggable={draggable}
      cornerRadius={cornerRadius}
      shadowColor={shadowColor}
      shadowBlur={shadowBlur}
      shadowOffsetX={shadowOffsetX}
      shadowOffsetY={shadowOffsetY}
      opacity={opacity}
    />
  );
}
