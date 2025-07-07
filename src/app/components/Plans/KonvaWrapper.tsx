"use client";

import { Stage } from "react-konva";
import { ReactNode } from "react";

interface KonvaWrapperProps {
  children: ReactNode;
  width?: number;
  height?: number;
  onMouseDown?: (e: any) => void;
  onMousemove?: (e: any) => void;
  onMouseup?: (e: any) => void;
  onTouchstart?: (e: any) => void;
  onTouchmove?: (e: any) => void;
  onTouchend?: (e: any) => void;
}

export default function KonvaWrapper({
  children,
  width = 800,
  height = 600,
  onMouseDown,
  onMousemove,
  onMouseup,
  onTouchstart,
  onTouchmove,
  onTouchend,
}: KonvaWrapperProps) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50">
      <Stage
        width={width}
        height={height}
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
