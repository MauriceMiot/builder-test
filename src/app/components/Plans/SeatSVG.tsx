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
    fill,
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
    switch (seatStatus) {
      case "sold":
        return "#EF4444"; // Rojo
      case "reserved":
        return "#F59E0B"; // Amarillo
      case "available":
      default:
        return fill;
    }
  };

  // Path del SVG de asiento (escalado y centrado)
  const seatPath =
    "M5.5 21c.83 0 1.5-.67 1.5-1.5V18h10v1.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V17c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v2.5c0 .83.67 1.5 1.5 1.5M20 10h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1M3 10h1c.55 0 1 .45 1 1v1c0 .55-.45 1-1 1H3c-.55 0-1-.45-1-1v-1c0-.55.45-1 1-1m14 3H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2z";

  // Escalar el path para que quepa en el tamaño especificado
  const scale = Math.min(width / 24, height / 24);
  const scaledWidth = 24 * scale;
  const scaledHeight = 24 * scale;

  // Centrar el asiento
  const centerX = width / 2 - scaledWidth / 2;
  const centerY = height / 2 - scaledHeight / 2;

  const selectionStrokeColor = isSelected ? "#EF4444" : stroke;
  const selectionStrokeWidth = isSelected ? 2 : strokeWidth;

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
        stroke={selectionStrokeColor}
        strokeWidth={selectionStrokeWidth}
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

      {/* Indicador de selección (anillo exterior) */}
      {isSelected && (
        <Path
          x={centerX}
          y={centerY}
          data={seatPath}
          fill="transparent"
          stroke="#EF4444"
          strokeWidth={3}
          scaleX={scale * 1.1}
          scaleY={scale * 1.1}
        />
      )}
    </Group>
  );
});

SeatSVG.displayName = "SeatSVG";

export default SeatSVG;
