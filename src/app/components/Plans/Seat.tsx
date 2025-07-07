"use client";

import { forwardRef } from "react";
import { Group, Circle, Text } from "react-konva";
import Konva from "konva";

interface SeatProps {
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

const Seat = forwardRef<Konva.Group, SeatProps>((props, ref) => {
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

  const radius = Math.min(width, height) / 2;
  const selectionStrokeColor = isSelected ? "#EF4444" : stroke;
  const selectionStrokeWidth = isSelected ? 4 : strokeWidth;

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
      {/* Círculo principal del asiento */}
      <Circle
        x={width / 2}
        y={height / 2}
        radius={radius}
        fill={getStatusColor()}
        stroke={selectionStrokeColor}
        strokeWidth={selectionStrokeWidth}
      />

      {/* Número del asiento */}
      {seatNumber && (
        <Text
          x={width / 2 - 10}
          y={height / 2 - 8}
          text={seatNumber}
          fontSize={Math.max(8, radius / 2)}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
        />
      )}

      {/* Indicador de estado (punto pequeño) */}
      <Circle
        x={width / 2 + radius * 0.6}
        y={height / 2 - radius * 0.6}
        radius={radius * 0.15}
        fill={
          seatStatus === "sold"
            ? "#DC2626"
            : seatStatus === "reserved"
            ? "#D97706"
            : "#10B981"
        }
        stroke="white"
        strokeWidth={1}
      />

      {/* Indicador de selección (anillo exterior) */}
      {isSelected && (
        <Circle
          x={width / 2}
          y={height / 2}
          radius={radius + 3}
          fill="transparent"
          stroke="#EF4444"
          strokeWidth={2}
        />
      )}
    </Group>
  );
});

Seat.displayName = "Seat";

export default Seat;
