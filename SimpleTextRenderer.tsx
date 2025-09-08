"use client";

import { Text } from "react-konva";

export interface SimpleTextProps {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  fontStyle?: "normal" | "bold" | "italic";
  draggable?: boolean;
}

export default function SimpleTextRenderer({
  x,
  y,
  text,
  fontSize = 16,
  fontFamily = "Arial",
  fill = "#000000",
  stroke,
  strokeWidth = 0,
  rotation = 0,
  align = "left",
  verticalAlign = "top",
  fontStyle = "normal",
  draggable = false,
}: SimpleTextProps) {
  return (
    <Text
      x={x}
      y={y}
      text={text}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
      rotation={rotation}
      align={align}
      verticalAlign={verticalAlign}
      fontStyle={fontStyle}
      draggable={draggable}
    />
  );
}
