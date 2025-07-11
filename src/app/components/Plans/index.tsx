"use client";

import { useState } from "react";
import { usePlanStore } from "../../store/plans";
import Toolbar from "./Toolbar";
import Canvas from "./Canvas";
import PropertiesPanel from "./PropertiesPanel";
import GridSettings from "./GridSettings";
import SavePlanModal from "./SavePlanModal";
import LoadPlanModal from "./LoadPlanModal";

interface PlansProps {
  onBackToHome?: () => void;
}

export default function Plans({ onBackToHome }: PlansProps) {
  const { exportToJSON, importFromJSON } = usePlanStore();
  const [activePanel, setActivePanel] = useState<"properties" | "grid">(
    "properties"
  );
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);

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
        setCurrentPlanId(null); // Reset al importar un archivo
      };
      reader.readAsText(file);
    }
  };

  const handleNewPlan = () => {
    // Limpiar el canvas y crear un nuevo plano
    importFromJSON(
      JSON.stringify({
        shapes: [],
        gridConfig: {
          enabled: true,
          size: 40,
          color: "#E5E7EB",
          opacity: 0.5,
          snapToGrid: false,
          seatSize: 1, // Valor por defecto para el tamaño del asiento
        },
      })
    );
    setCurrentPlanId(null); // Reset al crear un nuevo plano
  };

  const handleLoadPlan = () => {
    setShowLoadModal(true);
  };

  const handlePlanLoad = (planId: string) => {
    // Cargar el plano seleccionado
    try {
      const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
      const selectedPlan = savedPlans.find(
        (plan: { id: string }) => plan.id === planId
      );
      if (selectedPlan) {
        importFromJSON(
          JSON.stringify({
            shapes: selectedPlan.shapes,
            gridConfig: selectedPlan.gridConfig,
          })
        );
        setCurrentPlanId(planId); // Guardar el ID del plano cargado
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    }
    setShowLoadModal(false);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
      {/* Sidebar izquierda - Herramientas */}
      <div className="w-24 h-full bg-white border-r border-black flex flex-col items-center py-4 space-y-2">
        <Toolbar />
      </div>

      {/* Área principal */}
      <div className="flex flex-grow h-full overflow-hidden flex-col">
        {/* Header */}
        {onBackToHome && (
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToHome}
                className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <span className="text-xl">←</span>
                <span className="font-medium">Volver al Inicio</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleNewPlan}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                + Nuevo Plano
              </button>
              <button
                onClick={handleLoadPlan}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                📁 Cargar Plano
              </button>
              <button
                onClick={() => setShowSaveModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm font-medium"
              >
                💾 Guardar Plano
              </button>
              <span className="text-sm text-gray-500">Editor de Planos</span>
            </div>
          </div>
        )}

        {/* Contenido principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Canvas central */}
          <div className="flex-grow bg-white overflow-hidden">
            <Canvas />
          </div>

          {/* Panel lateral derecho */}
          <div className="w-80 bg-white border-l border-black flex flex-col">
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

      {/* Modal para cargar planos */}
      {showLoadModal && (
        <LoadPlanModal
          isOpen={showLoadModal}
          onClose={() => setShowLoadModal(false)}
          onPlanSelect={handlePlanLoad}
        />
      )}

      {/* Modal para guardar planos */}
      {showSaveModal && (
        <SavePlanModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          currentPlanId={currentPlanId}
          onPlanSaved={(planId) => {
            setCurrentPlanId(planId);
            setShowSaveModal(false);
          }}
        />
      )}
    </div>
  );
}
