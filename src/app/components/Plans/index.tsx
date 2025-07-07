"use client";

import { useState } from "react";
import { usePlanStore } from "../../store/plans";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import GridSettings from "./GridSettings";

export default function Plans() {
  const { exportToJSON, importFromJSON } = usePlanStore();
  const [activePanel, setActivePanel] = useState<"properties" | "grid">(
    "properties"
  );

  const handleExport = () => {
    const json = exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plano.json";
    a.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importFromJSON(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar izquierda - Herramientas */}
      <div className="w-24 h-full bg-white border-r border-black flex flex-col items-center py-4 space-y-2">
        <Toolbar />
      </div>

      {/* Área principal */}
      <div className="flex flex-grow h-full overflow-hidden">
        {/* Canvas central */}
        <div className="flex-grow bg-white h-full overflow-hidden">
          <Canvas />
        </div>

        {/* Panel lateral derecho */}
        <div className="w-80 h-full bg-white border-l border-black flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-black">
            <button
              onClick={() => setActivePanel("properties")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activePanel === "properties"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Propiedades
            </button>
            <button
              onClick={() => setActivePanel("grid")}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activePanel === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Cuadrícula
            </button>
          </div>

          {/* Contenido del panel */}
          <div className="flex-1 overflow-y-auto">
            {activePanel === "properties" && <PropertiesPanel />}
            {activePanel === "grid" && <GridSettings />}
          </div>

          {/* Botones exportar/importar */}
          <div className="p-4 border-t border-black space-y-2">
            <button
              onClick={handleExport}
              className="w-full form-button form-button-success"
            >
              Exportar JSON
            </button>
            <label className="w-full form-button form-button-secondary cursor-pointer text-center block">
              Importar JSON
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
