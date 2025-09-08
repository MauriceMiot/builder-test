"use client";

import { forwardRef } from "react";
import { Group, Text, Rect } from "react-konva";
import Konva from "konva";

interface SeatSVGProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  draggable: boolean;
  rotation: number;
  seatNumber?: string;
  seatStatus?: "available" | "sold" | "reserved";
  seatSection?: string;
  seatPrice?: number;
  isSelected?: boolean;
  onClick: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
}

const SeatSVG = forwardRef<Konva.Group, SeatSVGProps>((props, ref) => {
  const {
    x,
    y,
    width,
    height,
    stroke,
    strokeWidth,
    draggable,
    rotation,
    seatNumber,
    seatStatus = "available",
    isSelected = false,
    onClick,
    onTap,
    onDragEnd,
  } = props;

  // Determinar color basado en el estado del asiento
  const getStatusColor = () => {
    // Si está seleccionado, mostrar amarillo
    if (isSelected) {
      return "#F59E0B"; // Amarillo
    }

    // Si no está seleccionado, usar el estado del asiento
    switch (seatStatus) {
      case "sold":
        return "#EF4444"; // Rojo
      case "reserved":
        return "#F59E0B"; // Amarillo
      case "available":
      default:
        return "#10B981"; // Verde claro
    }
  };

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
      {/* Rectángulo simple para el asiento */}
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={getStatusColor()}
        stroke={strokeWidth > 0 ? stroke : "#374151"}
        strokeWidth={strokeWidth || 1}
        cornerRadius={2}
      />

      {/* Número del asiento */}
      {seatNumber && (
        <Text
          x={width / 2 - 6}
          y={height / 2 - 4}
          text={seatNumber}
          fontSize={Math.max(8, Math.min(16, Math.min(width, height) * 0.4))}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
          fontStyle="bold"
        />
      )}
    </Group>
  );
});

SeatSVG.displayName = "SeatSVG";

export default SeatSVG;
