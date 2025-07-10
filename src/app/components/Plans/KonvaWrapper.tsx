"use client";

import { Stage } from "react-konva";
import { ReactNode } from "react";
import Konva from "konva";

interface KonvaWrapperProps {
  children: ReactNode;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  onMouseDown?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMousemove?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onMouseup?: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onTouchstart?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  onTouchmove?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
  onTouchend?: (e: Konva.KonvaEventObject<TouchEvent>) => void;
}

export default function KonvaWrapper({
  children,
  width = 800,
  height = 600,
  scaleX = 1,
  scaleY = 1,
  onMouseDown,
  onMousemove,
  onMouseup,
  onTouchstart,
  onTouchmove,
  onTouchend,
}: KonvaWrapperProps) {
  return (
    <div className="w-full h-full bg-gray-50">
      <Stage
        width={width}
        height={height}
        scaleX={scaleX}
        scaleY={scaleY}
        onMouseDown={onMouseDown}
        onMousemove={onMousemove}
        onMouseup={onMouseup}
        onTouchstart={onTouchstart}
        onTouchmove={onTouchmove}
        onTouchend={onTouchend}
        className="border border-gray-300 bg-white"
      >
        {children}
      </Stage>
    </div>
  );
}
