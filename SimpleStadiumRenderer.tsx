"use client";

import { Path } from "react-konva";

export interface SimpleStadiumProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  opacity?: number;
}

export default function SimpleStadiumRenderer({
  x,
  y,
  width,
  height,
  fill = "#3B82F6",
  stroke = "#1E40AF",
  strokeWidth = 2,
  rotation = 0,
  draggable = false,
  opacity = 1,
}: SimpleStadiumProps) {
  const cornerRadius = height / 2;

  const pathData = `
    M ${cornerRadius} ${0}
    L ${width - cornerRadius} ${0}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${cornerRadius}
    L ${width} ${height - cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${height}
    L ${cornerRadius} ${height}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${0} ${height - cornerRadius}
    L ${0} ${cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} ${0}
    Z
  `;

  return (
    <Path
      x={x}
      y={y}
      data={pathData}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rotation={rotation}
      draggable={draggable}
      opacity={opacity}
    />
  );
}
