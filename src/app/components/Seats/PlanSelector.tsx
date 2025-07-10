"use client";

import { useState } from "react";
import { useEventStore } from "../../store/events";

interface PlanSelectorProps {
  eventId: string;
  onPlanSelect: (planId: string) => void;
  onBackToEventSelection: () => void;
  onBackToHome?: () => void;
}

export default function PlanSelector({
  eventId,
  onPlanSelect,
  onBackToEventSelection,
  onBackToHome,
}: PlanSelectorProps) {
  const { events, getPlansByEvent } = useEventStore();
  const [selectedPlanId, setSelectedPlanId] = useState("");

  const event = events.find((e) => e.id === eventId);
  const plans = event ? getPlansByEvent(eventId) : [];

  const handleContinue = () => {
    if (selectedPlanId) {
      onPlanSelect(selectedPlanId);
    }
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {onBackToHome && (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToEventSelection}
              className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Volver a Eventos</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Seleccionar Plano</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Selecciona un Plano
            </h1>
            <p className="text-gray-600">
              {event ? `Planos disponibles para: ${event.name}` : "Cargando..."}
            </p>
          </div>

          {/* Lista de planos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              const seatShapes = plan.shapes.filter(
                (shape) => shape.type === "seat"
              );

              return (
                <div
                  key={plan.id}
                  className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                  }`}
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {plan.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Creado: {new Date(plan.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Actualizado:{" "}
                        {new Date(plan.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="text-blue-500 text-2xl">✓</div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total de formas:</span>
                      <span className="font-semibold text-blue-600">
                        {plan.shapes.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Asientos:</span>
                      <span className="font-semibold text-green-600">
                        {seatShapes.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Cuadrícula:</span>
                      <span className="font-semibold text-gray-600">
                        {plan.gridConfig.enabled ? "Activada" : "Desactivada"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Información del plano seleccionado */}
          {selectedPlan && (
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Detalles del Plano: {selectedPlan.title}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Estadísticas
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Formas totales:</span>
                      <span className="font-medium">
                        {selectedPlan.shapes.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asientos:</span>
                      <span className="font-medium text-green-600">
                        {
                          selectedPlan.shapes.filter((s) => s.type === "seat")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Otros elementos:</span>
                      <span className="font-medium">
                        {
                          selectedPlan.shapes.filter((s) => s.type !== "seat")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">
                    Configuración
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cuadrícula:</span>
                      <span className="font-medium">
                        {selectedPlan.gridConfig.enabled
                          ? "Activada"
                          : "Desactivada"}
                      </span>
                    </div>
                    {selectedPlan.gridConfig.enabled && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Tamaño cuadrícula:
                        </span>
                        <span className="font-medium">
                          {selectedPlan.gridConfig.size}px
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Snap to grid:</span>
                      <span className="font-medium">
                        {selectedPlan.gridConfig.snapToGrid
                          ? "Activado"
                          : "Desactivado"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón continuar */}
          {selectedPlanId && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleContinue}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
              >
                Ver Mapa de Asientos
              </button>
            </div>
          )}

          {/* Mensaje si no hay planos */}
          {plans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay planos disponibles para este evento
              </h3>
              <p className="text-gray-600">
                Primero necesitas crear planos para este evento en el editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
