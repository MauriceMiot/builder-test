"use client";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Stage, Layer, Rect, Circle, Text, Line, Ellipse } from "react-konva";
import { usePlanStore, PlanShape } from "../../store/plans";
import { useSeatStore } from "../../store/seats";
import Triangle from "../Plans/Triangle";
import Stadium from "../Plans/Stadium";
import RegularPolygon from "../Plans/RegularPolygon";
import SeatSVG from "../Plans/SeatSVG";
import { Icon } from "@iconify/react";
import EventSelector from "./EventSelector";

interface SeatMapProps {
  onBackToHome?: () => void;
}

export default function SeatMap({ onBackToHome }: SeatMapProps) {
  const { shapes, importFromJSON, calculateAllSeatIndexes } = usePlanStore();
  const { selected, toggleSelect, setSelected } = useSeatStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 1200, height: 800 });
  const [zoom, setZoom] = useState(1);

  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.round((width * 2) / 3); // Mantener 3:2
        setStageSize({ width, height });
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Calcular escala para shapes y grid
  const baseWidth = 1200;
  const baseHeight = 800;
  const autoScale =
    Math.min(stageSize.width / baseWidth, stageSize.height / baseHeight) * zoom;

  // Funciones de zoom
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 3)); // Máximo 3x zoom
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.3)); // Mínimo 0.3x zoom
  };

  const handleResetZoom = () => {
    setZoom(1);
  };

  // Estados para manejar la navegación
  const [currentView, setCurrentView] = useState<"events" | "map">("events");
  const [selectedPlanId, setSelectedPlanId] = useState("");

  // Funciones de navegación
  const handleEventSelect = (eventId: string, planId: string) => {
    setSelectedPlanId(planId);
    setCurrentView("map");
  };

  const handleBackToHome = () => {
    setCurrentView("events");
    setSelectedPlanId("");
    onBackToHome?.();
  };

  // Función helper para manejar la selección y logging de asientos
  const handleSeatSelection = (shape: PlanShape) => {
    console.log("handleSeatSelection called with shape:", shape);
    console.log("Current selected seats:", selected);

    if (shape.type === "seat" && shape.seatStatus === "available") {
      const seatId = parseInt(shape.id.replace(/\D/g, ""));
      console.log("Extracted seatId:", seatId);

      toggleSelect(seatId);
      console.log("After toggleSelect, selected seats:", selected);

      // Loggear información del asiento seleccionado
      const seatInfo = {
        id: shape.id,
        seatId: seatId,
        seatIndex: shape.seatIndex || "N/A",
        seatNumber: shape.seatNumber || "N/A",
        seatPrice: shape.seatPrice || 0,
        seatSection: shape.seatSection || "N/A",
        seatStatus: shape.seatStatus || "available",
      };

      console.log("Asiento seleccionado:", seatInfo);

      // Obtener todos los asientos seleccionados actualmente
      const currentSelected = selected.includes(seatId)
        ? selected.filter((id) => id !== seatId)
        : [...selected, seatId];

      // Crear array con información completa de todos los asientos seleccionados
      const selectedSeatsInfo = currentSelected.map((id) => {
        const seatShape = shapes.find(
          (s) => s.type === "seat" && parseInt(s.id.replace(/\D/g, "")) === id
        );
        return {
          id: seatShape?.id || `seat_${id}`,
          seatId: id,
          seatIndex: seatShape?.seatIndex || "N/A",
          seatNumber: seatShape?.seatNumber || "N/A",
          seatPrice: seatShape?.seatPrice || 0,
          seatSection: seatShape?.seatSection || "N/A",
        };
      });

      console.log("Todos los asientos seleccionados:", selectedSeatsInfo);
      console.log("Total de asientos:", selectedSeatsInfo.length);
      console.log(
        "Precio total:",
        selectedSeatsInfo.reduce((sum, seat) => sum + seat.seatPrice, 0)
      );
    } else {
      console.log("Shape is not a selectable seat:", {
        type: shape.type,
        seatStatus: shape.seatStatus,
      });
    }
  };

  useEffect(() => {
    if (currentView === "map" && selectedPlanId) {
      // Limpiar selección anterior
      setSelected([]);

      // Cargar el plano seleccionado desde localStorage
      try {
        const savedPlans = JSON.parse(
          localStorage.getItem("savedPlans") || "[]"
        );
        const selectedPlan = savedPlans.find(
          (plan: { id: string }) => plan.id === selectedPlanId
        );

        if (selectedPlan) {
          importFromJSON(
            JSON.stringify({
              shapes: selectedPlan.shapes,
              gridConfig: selectedPlan.gridConfig,
            })
          );

          // Calcular índices de todos los asientos después de cargar el plano
          setTimeout(() => {
            calculateAllSeatIndexes();
          }, 100);

          // Log para debug
          console.log("Loaded plan shapes:", selectedPlan.shapes);
          console.log(
            "Seat shapes:",
            selectedPlan.shapes.filter((s: PlanShape) => s.type === "seat")
          );
        }
      } catch (error) {
        console.error("Error loading plan:", error);
      }
    }
  }, [selectedPlanId, currentView, importFromJSON, setSelected]);

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
            onClick={() => handleSeatSelection(shape)}
            onTap={() => handleSeatSelection(shape)}
            onDragEnd={() => {}}
          />
        );
      default:
        return null;
    }
  };

  // Renderizado condicional basado en la vista actual
  if (currentView === "events") {
    return (
      <EventSelector
        onEventSelect={handleEventSelect}
        onBackToHome={onBackToHome}
      />
    );
  }

  // Vista del mapa de asientos
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {onBackToHome && (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToHome}
              className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Volver al Inicio</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Visor de Asientos</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Título principal */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Mapa de Asientos
            </h1>
          </div>

          {/* Layout principal: Plano a la izquierda, panel a la derecha */}
          <div className="flex gap-6">
            {/* Plano a la izquierda */}
            <div className="flex-1" ref={containerRef} style={{ minWidth: 0 }}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-black relative">
                <Stage
                  width={stageSize.width}
                  height={stageSize.height / 1.2}
                  scaleX={autoScale}
                  scaleY={autoScale}
                  draggable
                  onMouseDown={(e) => {
                    if (e.target === e.target.getStage()) {
                      setSelected([]);
                    }
                  }}
                >
                  <Layer>
                    {/* Grid de fondo (OCULTO EN EL VISOR) */}
                    {/* {gridConfig.enabled && (
                      <>
                        {Array.from(
                          { length: Math.ceil(baseWidth / gridConfig.size) },
                          (_, i) => (
                            <Rect
                              key={`grid-v-${i}`}
                              x={i * gridConfig.size}
                              y={0}
                              width={1}
                              height={baseHeight}
                              fill={gridConfig.color}
                              opacity={gridConfig.opacity}
                            />
                          )
                        )}
                        {Array.from(
                          { length: Math.ceil(baseHeight / gridConfig.size) },
                          (_, i) => (
                            <Rect
                              key={`grid-h-${i}`}
                              x={0}
                              y={i * gridConfig.size}
                              width={baseWidth}
                              height={1}
                              fill={gridConfig.color}
                              opacity={gridConfig.opacity}
                            />
                          )
                        )}
                      </>
                    )} */}
                    {/* Renderizar todas las figuras */}
                    {shapes.map(renderShape)}
                  </Layer>
                </Stage>

                {/* Controles de zoom en la esquina superior derecha */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                  <button
                    onClick={handleZoomIn}
                    className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Zoom In"
                  >
                    <Icon
                      icon="mdi:zoom-in"
                      className="text-xl text-gray-700"
                    />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Zoom Out"
                  >
                    <Icon
                      icon="mdi:zoom-out"
                      className="text-xl text-gray-700"
                    />
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                    title="Reset Zoom"
                  >
                    <Icon
                      icon="mdi:refresh"
                      className="text-lg text-gray-700"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Panel de información a la derecha */}
            <div className="w-80 space-y-4">
              {/* Leyenda de asientos */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Leyenda de Asientos
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-700"></div>
                    <span className="text-sm text-gray-700">Disponible</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-yellow-700"></div>
                    <span className="text-sm text-gray-700">Reservado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-red-700"></div>
                    <span className="text-sm text-gray-700">Ocupado</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full border-2 border-yellow-700"></div>
                    <span className="text-sm text-gray-700">Seleccionado</span>
                  </div>
                </div>
              </div>
              {/* Panel de asientos seleccionados */}
              {selected.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">
                    Asientos Seleccionados ({selected.length})
                  </h3>
                  <div
                    className="space-y-2 overflow-y-auto"
                    style={{ maxHeight: "20vh" }}
                  >
                    {selected.map((seatId) => {
                      const seat = shapes.find(
                        (s) => parseInt(s.id.replace(/\D/g, "")) === seatId
                      );
                      if (!seat || seat.type !== "seat") return null;

                      return (
                        <div
                          key={seatId}
                          className="flex justify-between items-center bg-blue-50 rounded p-2"
                        >
                          <div>
                            <span className="font-bold text-sm text-gray-800">
                              {seat.seatNumber || "Sin número"}
                            </span>
                            <span className="text-gray-400 text-sm ml-1">
                              - {seat.seatSection || "Sin sección"}
                            </span>
                            <span className="text-blue-600 text-xs ml-1">
                              (Índice: {seat.seatIndex || "N/A"})
                            </span>
                            <span className="text-gray-800 ml-2 text-sm font-semibold">
                              ${seat.seatPrice ?? 0}
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
                  <div className="mt-4 pt-3 border-t border-blue-200">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold text-blue-800">
                        Total: $
                        {selected.reduce((total, seatId) => {
                          const seat = shapes.find(
                            (s) => parseInt(s.id.replace(/\D/g, "")) === seatId
                          );
                          return (
                            total +
                            (seat && seat.type === "seat" && seat.seatPrice
                              ? seat.seatPrice
                              : 0)
                          );
                        }, 0)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelected([])}
                        className="form-button form-button-secondary flex-1"
                      >
                        Limpiar
                      </button>
                      <button className="form-button form-button-success flex-1">
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
