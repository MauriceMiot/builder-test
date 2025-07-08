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
          className={`w-12 h-12 rounded-lg border transition-colors flex items-center justify-center relative group ${
            currentTool === tool.type
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-black hover:bg-gray-50"
          }`}
          title={tool.label}
        >
          <div className="text-2xl">{tool.icon}</div>

          {/* Tooltip */}
          <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 pointer-events-none">
            {tool.label}
          </div>
        </button>
      ))}

      {/* Configuración adicional para polígonos regulares */}
      {currentTool === "regular-polygon" && (
        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-black">
          <div className="text-xs text-gray-600 mb-2 text-center">Lados</div>
          <select
            value={regularPolygonSides}
            onChange={(e) => setRegularPolygonSides(parseInt(e.target.value))}
            className="w-full text-xs p-1 border border-gray-300 rounded bg-white focus:outline-none focus:border-blue-500"
          >
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
            <option value={7}>7</option>
            <option value={8}>8</option>
            <option value={9}>9</option>
            <option value={10}>10</option>
            <option value={11}>11</option>
            <option value={12}>12</option>
          </select>
        </div>
      )}
    </div>
  );
}
