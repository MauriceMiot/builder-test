"use client";
import { useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Text, Line, Ellipse } from "react-konva";
import { usePlanStore, PlanShape } from "../../store/plans";
import { useSeatStore } from "../../store/seats";
import Triangle from "../Plans/Triangle";
import Stadium from "../Plans/Stadium";
import RegularPolygon from "../Plans/RegularPolygon";
import SeatSVG from "../Plans/SeatSVG";

export default function SeatMap() {
  const { shapes, gridConfig, importFromJSON } = usePlanStore();
  const { selected, toggleSelect, setSelected } = useSeatStore();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    fetch("/seats3.json")
      .then((res) => res.json())
      .then((data) => {
        importFromJSON(JSON.stringify({ shapes: data }));
      })
      .catch((error) => {
        console.error("Error loading seats:", error);
      });
  }, [importFromJSON]);

  const renderShape = (shape: PlanShape) => {
    const commonProps = {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      fill: shape.fill,
      stroke: shape.stroke,
      strokeWidth: shape.strokeWidth,
      draggable: false,
      rotation: shape.rotation,
    };

    switch (shape.type) {
      case "rectangle":
        return <Rect key={shape.id} {...commonProps} />;
      case "circle":
        return (
          <Circle
            key={shape.id}
            {...commonProps}
            radius={Math.min(shape.width, shape.height) / 2}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
          />
        );
      case "ellipse":
        return (
          <Ellipse
            key={shape.id}
            x={shape.x + shape.width / 2}
            y={shape.y + shape.height / 2}
            radiusX={shape.width / 2}
            radiusY={shape.height / 2}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            rotation={shape.rotation}
          />
        );
      case "triangle":
        return (
          <Triangle
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            draggable={false}
            rotation={shape.rotation}
            onClick={() => {}}
            onTap={() => {}}
            onDragEnd={() => {}}
          />
        );
      case "stadium":
        return (
          <Stadium
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            draggable={false}
            rotation={shape.rotation}
            onClick={() => {}}
            onTap={() => {}}
            onDragEnd={() => {}}
          />
        );
      case "regular-polygon":
        return (
          <RegularPolygon
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            draggable={false}
            rotation={shape.rotation}
            sides={shape.sides || 5}
            radius={shape.radius || Math.min(shape.width, shape.height) / 2}
            onClick={() => {}}
            onTap={() => {}}
            onDragEnd={() => {}}
          />
        );
      case "polygon":
        return (
          <Line
            key={shape.id}
            points={shape.points || []}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            closed={shape.closed || false}
            draggable={false}
            rotation={shape.rotation}
          />
        );
      case "text":
        return (
          <Text
            key={shape.id}
            x={shape.x}
            y={shape.y}
            text={shape.text || "Texto"}
            fontSize={shape.fontSize || 16}
            fontFamily={shape.fontFamily || "Arial"}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            draggable={false}
            rotation={shape.rotation}
          />
        );
      case "seat":
        return (
          <SeatSVG
            key={shape.id}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            fill={shape.fill}
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            draggable={false}
            rotation={shape.rotation}
            seatNumber={shape.seatNumber}
            seatStatus={shape.seatStatus}
            seatSection={shape.seatSection}
            seatPrice={shape.seatPrice}
            isSelected={selected.includes(
              parseInt(shape.id.replace(/\D/g, ""))
            )}
            onClick={() => {
              if (shape.seatStatus === "available") {
                toggleSelect(parseInt(shape.id.replace(/\D/g, "")));
              }
            }}
            onTap={() => {
              if (shape.seatStatus === "available") {
                toggleSelect(parseInt(shape.id.replace(/\D/g, "")));
              }
            }}
            onDragEnd={() => {}}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Mapa de Asientos
          </h1>

          {/* Panel de asientos seleccionados */}
          {selected.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Asientos Seleccionados ({selected.length})
              </h3>
              <div className="space-y-2">
                {selected.map((seatId) => {
                  const seat = shapes.find(
                    (s) => parseInt(s.id.replace(/\D/g, "")) === seatId
                  );
                  if (!seat || seat.type !== "seat") return null;

                  return (
                    <div
                      key={seatId}
                      className="flex justify-between items-center bg-white rounded p-2"
                    >
                      <div>
                        <span className="font-medium">
                          {seat.seatNumber} - Sección {seat.seatSection}
                        </span>
                        <span className="text-gray-600 ml-2">
                          ${seat.seatPrice}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSelect(seatId)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-800">
                    Total: $
                    {selected.reduce((total, seatId) => {
                      const seat = shapes.find(
                        (s) => parseInt(s.id.replace(/\D/g, "")) === seatId
                      );
                      return total + (seat?.seatPrice || 0);
                    }, 0)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelected([])}
                      className="form-button form-button-secondary"
                    >
                      Limpiar
                    </button>
                    <button className="form-button form-button-success">
                      Comprar Asientos
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setScale(scale + 0.1)}
              className="form-button form-button-primary"
            >
              Zoom +
            </button>
            <button
              onClick={() => setScale(Math.max(0.1, scale - 0.1))}
              className="form-button form-button-primary"
            >
              Zoom -
            </button>
            <button
              onClick={() => setScale(1)}
              className="form-button form-button-secondary"
            >
              Reset Zoom
            </button>
          </div>

          {/* Leyenda de asientos */}
          <div className="bg-gray-50 border border-black rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b border-black pb-2">
              Leyenda de Asientos
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-blue-700"></div>
                <span className="text-sm text-gray-700">Disponible</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-700"></div>
                <span className="text-sm text-gray-700">Vendido</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-yellow-700"></div>
                <span className="text-sm text-gray-700">Reservado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-red-500 ring-2 ring-red-500"></div>
                <span className="text-sm text-gray-700">Seleccionado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-black">
          <Stage
            width={800}
            height={600}
            scaleX={scale}
            scaleY={scale}
            draggable
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelected([]);
              }
            }}
          >
            <Layer>
              {/* Grid de fondo */}
              {gridConfig.enabled && (
                <>
                  {Array.from(
                    { length: Math.ceil(800 / gridConfig.size) },
                    (_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * gridConfig.size}
                        y={0}
                        width={1}
                        height={600}
                        fill={gridConfig.color}
                        opacity={gridConfig.opacity}
                      />
                    )
                  )}
                  {Array.from(
                    { length: Math.ceil(600 / gridConfig.size) },
                    (_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * gridConfig.size}
                        width={800}
                        height={1}
                        fill={gridConfig.color}
                        opacity={gridConfig.opacity}
                      />
                    )
                  )}
                </>
              )}

              {/* Renderizar todas las figuras */}
              {shapes.map(renderShape)}
            </Layer>
          </Stage>
        </div>
      </div>
    </div>
  );
}

// // ──────── Helpers ────────

// function getColorBySection(section: string) {
//   switch (section?.toUpperCase()) {
//     case "LUNETA":
//       return "#3b82f6"; // azul
//     case "PATIO":
//       return "#10b981"; // verde
//     case "PALCO":
//       return "#f59e0b"; // amarillo
//     case "VIP":
//       return "#ef4444"; // rojo
//     default:
//       return "gray";
//   }
// }
