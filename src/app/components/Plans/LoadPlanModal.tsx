"use client";

import { useState, useEffect } from "react";

interface SavedPlan {
  id: string;
  title: string;
  shapes: unknown[];
  gridConfig: unknown;
  createdAt: string;
  updatedAt: string;
}

interface LoadPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlanSelect: (planId: string) => void;
}

export default function LoadPlanModal({
  isOpen,
  onClose,
  onPlanSelect,
}: LoadPlanModalProps) {
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Cargar planos guardados desde localStorage
      try {
        const plans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
        setSavedPlans(plans);
      } catch (error) {
        console.log("Error loading plans:", error);
        setSavedPlans([]);
      }
    }
  }, [isOpen]);

  const handleLoadPlan = () => {
    if (selectedPlanId) {
      onPlanSelect(selectedPlanId);
    }
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este plano?")) {
      try {
        const plans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
        const updatedPlans = plans.filter(
          (plan: SavedPlan) => plan.id !== planId
        );
        localStorage.setItem("savedPlans", JSON.stringify(updatedPlans));
        setSavedPlans(updatedPlans);
        if (selectedPlanId === planId) {
          setSelectedPlanId("");
        }
      } catch (error) {
        console.error("Error deleting plan:", error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Cargar Plano</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <span className="text-2xl">×</span>
          </button>
        </div>

        {savedPlans.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No hay planos guardados
            </h3>
            <p className="text-gray-600">
              Crea un nuevo plano para comenzar a diseñar.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {savedPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPlanId === plan.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">
                        {plan.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Creado: {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Formas: {plan.shapes.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPlanId === plan.id && (
                        <span className="text-blue-500 text-xl">✓</span>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan.id);
                        }}
                        className="text-red-600 hover:text-red-800 text-sm px-2 py-1"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLoadPlan}
                disabled={!selectedPlanId}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cargar Plano
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
