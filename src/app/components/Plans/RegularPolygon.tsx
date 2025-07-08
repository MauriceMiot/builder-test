"use client";

import { forwardRef } from "react";
import { Line } from "react-konva";
import Konva from "konva";

interface RegularPolygonProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
  rotation: number;
  sides: number;
  radius: number;
  onClick: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const RegularPolygon = forwardRef<Konva.Line, RegularPolygonProps>(
  (props, ref) => {
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
      sides,
      radius,
      onClick,
      onTap,
      onDragEnd,
    } = props;

    // Generar puntos del polígono regular
    const generatePoints = () => {
      const points: number[] = [];
      const centerX = width / 2; // Centro relativo al componente
      const centerY = height / 2; // Centro relativo al componente
      const angleStep = (2 * Math.PI) / sides;

      for (let i = 0; i < sides; i++) {
        const angle = i * angleStep - Math.PI / 2; // Empezar desde arriba
        const pointX = centerX + radius * Math.cos(angle);
        const pointY = centerY + radius * Math.sin(angle);
        points.push(pointX, pointY);
      }

      return points;
    };

    return (
      <Line
        ref={ref}
        x={x}
        y={y}
        points={generatePoints()}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        closed={true}
        draggable={draggable}
        rotation={rotation}
        onClick={onClick}
        onTap={onTap}
        onDragEnd={onDragEnd}
      />
    );
  }
);

RegularPolygon.displayName = "RegularPolygon";

export default RegularPolygon;
