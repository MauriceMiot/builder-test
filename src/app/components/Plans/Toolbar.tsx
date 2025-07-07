"use client";

import { usePlanStore } from "../../store/plans";

const tools: {
  type:
    | "rectangle"
    | "circle"
    | "ellipse"
    | "triangle"
    | "stadium"
    | "regular-polygon"
    | "polygon"
    | "seat"
    | "text"
    | "freehand"
    | null;
  label: string;
  icon: string;
}[] = [
  { type: null, label: "Selección", icon: "👆" },
  { type: "rectangle", label: "Rectángulo", icon: "⬜" },
  { type: "circle", label: "Círculo", icon: "⭕" },
  { type: "ellipse", label: "Óvalo", icon: "🥚" },
  { type: "triangle", label: "Triángulo", icon: "🔺" },
  { type: "stadium", label: "Estadio", icon: "🏟️" },
  { type: "regular-polygon", label: "Polígono Regular", icon: "🔷" },
  { type: "polygon", label: "Polígono Irregular", icon: "📐" },
  { type: "seat", label: "Asiento", icon: "💺" },
  { type: "text", label: "Texto", icon: "T" },
  { type: "freehand", label: "Dibujo Libre", icon: "✏️" },
];

export default function Toolbar() {
  const {
    currentTool,
    setCurrentTool,
    regularPolygonSides,
    setRegularPolygonSides,
  } = usePlanStore();

  return (
    <div className="flex flex-col items-center space-y-1">
      {tools.map((tool) => (
        <button
          key={tool.type || "select"}
          onClick={() => setCurrentTool(tool.type)}
          className={`w-16 h-16 rounded-lg border transition-colors flex flex-col items-center justify-center ${
            currentTool === tool.type
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-black hover:bg-gray-50"
          }`}
          title={tool.label}
        >
          <div className="text-2xl">{tool.icon}</div>
          <p className="text-[0.625rem] mt-1">{tool.label}</p>
        </button>
      ))}

      {/* Configuración adicional para polígonos regulares */}
      {currentTool === "regular-polygon" && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-black">
          <div className="text-sm text-gray-600 mb-3">
            Lados: {regularPolygonSides}
          </div>
          <input
            type="range"
            min="3"
            max="12"
            value={regularPolygonSides}
            onChange={(e) => setRegularPolygonSides(parseInt(e.target.value))}
            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      )}

      {/* Instrucciones flotantes */}
      {currentTool && (
        <div className="absolute left-28 top-4 bg-black text-white text-sm px-4 py-3 rounded whitespace-nowrap z-50">
          {currentTool === "polygon" &&
            "Haz clic para agregar vértices. Presiona Enter para cerrar."}
          {currentTool === "freehand" && "Arrastra para dibujar libremente."}
          {currentTool === "text" && "Haz clic para agregar texto."}
          {currentTool === "seat" && "Haz clic para agregar un asiento."}
          {!["polygon", "freehand", "text", "seat"].includes(currentTool) &&
            currentTool !== null &&
            "Arrastra para crear la figura."}
        </div>
      )}
    </div>
  );
}
