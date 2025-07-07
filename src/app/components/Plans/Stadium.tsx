import React, { forwardRef } from "react";
import { Path } from "react-konva";
import Konva from "konva";

interface StadiumProps {
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

const Stadium = forwardRef<Konva.Path, StadiumProps>(
  (
    {
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
    },
    ref
  ) => {
    // Calcular el radio de las esquinas (mitad de la altura para un estadio típico)
    const cornerRadius = height / 2;

    // Crear el path SVG para la forma de estadio
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
        ref={ref}
        x={x}
        y={y}
        data={pathData}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        draggable={draggable}
        rotation={rotation}
        onClick={onClick}
        onTap={onTap}
        onDragEnd={onDragEnd}
      />
    );
  }
);

Stadium.displayName = "Stadium";

export default Stadium;
