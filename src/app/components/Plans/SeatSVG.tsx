"use client";

import { forwardRef } from "react";
import { Group, Text, Path } from "react-konva";
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
    // fill,
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

  // Path del SVG de asiento (escalado y centrado)
  const seatPath =
    "M5 9.15V7c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2.16c-1.16.41-2 1.51-2 2.81V14H7v-2.04c0-1.29-.84-2.4-2-2.81M20 10c-1.1 0-2 .9-2 2v3H6v-3a2 2 0 1 0-4 0v5c0 1.1.9 2 2 2v2h2v-2h12v2h2v-2c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2";

  // Escalar el path para que quepa en el tamaño especificado
  const scale = Math.min(width / 24, height / 24);
  const scaledWidth = 24 * scale;
  const scaledHeight = 24 * scale;

  // Centrar el asiento
  const centerX = width / 2 - scaledWidth / 2;
  const centerY = height / 2 - scaledHeight / 2;

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
      {/* SVG del asiento */}
      <Path
        x={centerX}
        y={centerY}
        data={seatPath}
        fill={getStatusColor()}
        stroke={strokeWidth > 0 ? stroke : "transparent"}
        strokeWidth={strokeWidth}
        scaleX={scale}
        scaleY={scale}
      />

      {/* Número del asiento */}
      {seatNumber && (
        <Text
          x={width / 2 - 15}
          y={height / 2 - 8}
          text={seatNumber}
          fontSize={Math.max(8, Math.min(12, scale * 6))}
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
