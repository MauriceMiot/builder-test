"use client";

import { Stage, Layer, Circle, Image as KonvaImage, Text } from "react-konva";
import { Fragment, useEffect, useRef, useState } from "react";
import { useImage } from "react-konva-utils";
import { Transformer } from "react-konva";
import { useSeatStore } from "@/app/store/seats";

// ──────── Tipos y Store ────────

type Seat = {
  id: number;
  x: number;
  y: number;
  status: "available" | "sold";
  price: number;
  section: string;
  label: string;
};

// ──────── Componente ────────

export default function SeatEditor() {
  const { seats, addSeat, removeSeat, updateSeatPosition, selected } =
    useSeatStore();

  const [bgImageUrl] = useState("/venue.svg");
  const [image] = useImage(bgImageUrl);
  const [currentSection, setCurrentSection] = useState("LUNETA");
  const [currentRow, setCurrentRow] = useState("A");
  const [rowCounter, setRowCounter] = useState<{ [key: string]: number }>({});
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const layerRef = useRef<any>(null);

  const handleClick = (e: any) => {
    const clickedShape = e.target;
    const idAttr = clickedShape?.attrs?.id;

    // Evitar clicks sobre Transformer
    if (clickedShape.getParent()?.className === "Transformer") return;

    // Seleccionar/deseleccionar si se clickea un asiento
    if (idAttr && idAttr.startsWith("seat-")) {
      const numericId = Number(idAttr.replace("seat-", ""));
      useSeatStore.getState().toggleSelect(numericId);
      return;
    }

    // Crear nuevo asiento si se clickea el fondo
    const stage = stageRef.current;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const newSeat: Seat = {
      id: Date.now(),
      x: pointer.x,
      y: pointer.y,
      status: "available",
      price: 50,
      section: currentSection,
      label: "", // sin label
    };
    addSeat(newSeat);
  };

  // const handleClick = (e: any) => {
  //   const clickedShape = e.target;
  //   const idAttr = clickedShape?.attrs?.id;

  //   // Evitar clicks sobre Transformer
  //   if (clickedShape.getParent()?.className === "Transformer") return;

  //   // Seleccionar/deseleccionar si se clickea un asiento
  //   if (idAttr && idAttr.startsWith("seat-")) {
  //     const numericId = Number(idAttr.replace("seat-", ""));
  //     useSeatStore.getState().toggleSelect(numericId);
  //     return;
  //   }

  //   // Crear nuevo asiento si se clickea el fondo
  //   const stage = stageRef.current;
  //   const pointer = stage.getPointerPosition();
  //   if (!pointer) return;

  //   const count = (rowCounter[currentRow] ?? 0) + 1;
  //   setRowCounter((prev) => ({ ...prev, [currentRow]: count }));

  //   const label = `${currentRow}${count}`;

  //   const newSeat: Seat = {
  //     id: Date.now(),
  //     x: pointer.x,
  //     y: pointer.y,
  //     status: "available",
  //     price: 50,
  //     section: currentSection,
  //     label,
  //   };
  //   addSeat(newSeat);
  // };

  const exportSeats = () => {
    const data = JSON.stringify(seats, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seats.json";
    a.click();
  };

  useEffect(() => {
    const transformer = transformerRef.current;
    const layer = layerRef.current;
    if (!transformer || !layer) return;

    const selectedNodes = layer.find((node: any) =>
      selected.includes(Number(node.id()))
    );

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [selected]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        selected.forEach((id) => removeSeat(id));
        useSeatStore.getState().setSelected([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selected]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-400 w-full text-white">
      <h1 className="text-2xl">Editor de plano de asientos</h1>

      <div className="flex gap-4 items-center">
        <label>Sección:</label>
        <select
          value={currentSection}
          onChange={(e) => setCurrentSection(e.target.value)}
          className="text-white rounded border border-white px-2 py-1"
        >
          <option value="LUNETA">LUNETA</option>
          <option value="PATIO">PATIO</option>
          <option value="PALCO">PALCO</option>
          <option value="VIP">VIP</option>
        </select>

        <label className="text-white">Fila:</label>
        <input
          value={currentRow}
          onChange={(e) => setCurrentRow(e.target.value.toUpperCase())}
          maxLength={2}
          className="text-white rounded border border-white px-2 py-1 w-14 text-center"
        />

        <button
          onClick={exportSeats}
          className="bg-green-600 px-4 py-2 rounded ml-auto"
        >
          Exportar JSON
        </button>
      </div>

      <Stage
        ref={stageRef}
        width={900}
        height={600}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            useSeatStore.getState().setSelected([]);
          }
        }}
        onClick={handleClick}
        style={{ border: "1px solid white" }}
      >
        <Layer ref={layerRef}>
          {image && <KonvaImage image={image} width={900} height={600} />}
          {seats.map((seat) => (
            <Fragment key={seat.id}>
              <Circle
                id={`seat-${seat.id}`}
                x={seat.x}
                y={seat.y}
                radius={6}
                fill={getColorBySection(seat.section)}
                draggable
                onDragEnd={(e) =>
                  updateSeatPosition(seat.id, e.target.x(), e.target.y())
                }
              />
              <Text
                x={seat.x - 8}
                y={seat.y - 5}
                text={seat.label}
                fontSize={10}
                fill="white"
              />
            </Fragment>
          ))}
          <Transformer ref={transformerRef} />
        </Layer>
      </Stage>
    </div>
  );
}

// ──────── Helpers ────────

function getColorBySection(section: string) {
  switch (section) {
    case "LUNETA":
      return "#3b82f6"; // azul
    case "PATIO":
      return "#10b981"; // verde
    case "PALCO":
      return "#f59e0b"; // amarillo
    case "VIP":
      return "#ef4444"; // rojo
    default:
      return "gray";
  }
}
