"use client";

import { useState, useEffect } from "react";
import { usePlanStore, PlanShape, GridConfig } from "../../store/plans";

interface SavePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId?: string | null;
  onPlanSaved?: (planId: string) => void;
}

interface SavedPlan {
  id: string;
  title: string;
  shapes: PlanShape[];
  gridConfig: GridConfig;
  updatedAt?: string;
}

export default function SavePlanModal({
  isOpen,
  onClose,
  currentPlanId,
  onPlanSaved,
}: SavePlanModalProps) {
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);

  const { shapes, gridConfig, savePlan } = usePlanStore();

  // Detectar si estamos editando un plano existente
  useEffect(() => {
    if (currentPlanId) {
      try {
        const savedPlans = JSON.parse(
          localStorage.getItem("savedPlans") || "[]"
        );
        const existingPlan = savedPlans.find(
          (plan: SavedPlan) => plan.id === currentPlanId
        );
        if (existingPlan) {
          setTitle(existingPlan.title);
          setIsUpdate(true);
        }
      } catch (error) {
        console.error("Error loading existing plan:", error);
      }
    } else {
      setTitle("");
      setIsUpdate(false);
    }
  }, [currentPlanId]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Por favor ingresa el título del plano");
      return;
    }

    setIsLoading(true);

    try {
      if (isUpdate && currentPlanId) {
        // Actualizar plano existente
        const savedPlans = JSON.parse(
          localStorage.getItem("savedPlans") || "[]"
        );
        const updatedPlans = savedPlans.map((plan: SavedPlan) => {
          if (plan.id === currentPlanId) {
            return {
              ...plan,
              title: title.trim(),
              shapes,
              gridConfig,
              updatedAt: new Date().toISOString(),
            };
          }
          return plan;
        });
        localStorage.setItem("savedPlans", JSON.stringify(updatedPlans));
        onPlanSaved?.(currentPlanId);
      } else {
        // Crear nuevo plano
        savePlan({
          title: title.trim(),
          shapes,
          gridConfig,
        });
        onPlanSaved?.("new");
      }

      setTitle("");
      onClose();
    } catch (error) {
      console.error("Error al guardar el plano:", error);
      alert("Error al guardar el plano");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96 max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {isUpdate ? "Actualizar Plano" : "Guardar Plano"}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Título del plano */}
          <div>
            <label
              htmlFor="plan-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Título del Plano *
            </label>
            <input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Plano Principal del Estadio"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Información del plano */}
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Formas en el plano:</span>
                <span className="font-medium">{shapes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Cuadrícula:</span>
                <span className="font-medium">
                  {gridConfig.enabled ? "Activada" : "Desactivada"}
                </span>
              </div>
              {isUpdate && (
                <div className="flex justify-between">
                  <span>Modo:</span>
                  <span className="font-medium text-blue-600">
                    Actualización
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isLoading}
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? isUpdate
                  ? "Actualizando..."
                  : "Guardando..."
                : isUpdate
                ? "Actualizar Plano"
                : "Guardar Plano"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
