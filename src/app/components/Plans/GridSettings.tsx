"use client";

import { usePlanStore } from "../../store/plans";

export default function GridSettings() {
  const { gridConfig, updateGridConfig, toggleGrid, toggleSnapToGrid } =
    usePlanStore();

  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-8 border-b border-black pb-4">
        Configuración de Cuadrícula
      </h3>
      <div className="space-y-8">
        {/* Habilitar/Deshabilitar cuadrícula */}
        <div className="flex items-center justify-between">
          <label className="text-base font-medium text-gray-700">
            Mostrar cuadrícula
          </label>
          <button
            onClick={toggleGrid}
            className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${
              gridConfig.enabled
                ? "bg-blue-600 text-white border border-blue-600"
                : "bg-gray-200 text-gray-700 border border-black hover:bg-gray-300"
            }`}
          >
            {gridConfig.enabled ? "Activada" : "Desactivada"}
          </button>
        </div>

        {/* Tamaño de la cuadrícula */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Tamaño de la cuadrícula: {gridConfig.size}px
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={gridConfig.size}
            onChange={(e) =>
              updateGridConfig({ size: parseInt(e.target.value) })
            }
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Color de la cuadrícula */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Color de la cuadrícula
          </label>
          <input
            type="color"
            value={gridConfig.color}
            onChange={(e) => updateGridConfig({ color: e.target.value })}
            className="w-full h-16 border border-black rounded-md cursor-pointer"
          />
        </div>

        {/* Opacidad de la cuadrícula */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Opacidad: {Math.round(gridConfig.opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={gridConfig.opacity}
            onChange={(e) =>
              updateGridConfig({ opacity: parseFloat(e.target.value) })
            }
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Snap to grid */}
        <div className="flex items-center justify-between">
          <label className="text-base font-medium text-gray-700">
            Ajustar a la cuadrícula
          </label>
          <button
            onClick={toggleSnapToGrid}
            className={`px-6 py-3 rounded-md text-base font-medium transition-colors ${
              gridConfig.snapToGrid
                ? "bg-green-600 text-white border border-green-600"
                : "bg-gray-200 text-gray-700 border border-black hover:bg-gray-300"
            }`}
          >
            {gridConfig.snapToGrid ? "Activado" : "Desactivado"}
          </button>
        </div>
      </div>
    </div>
  );
}
