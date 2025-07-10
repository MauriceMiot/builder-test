"use client";

import { useState } from "react";
import { useEventStore } from "../../store/events";

interface EventSelectorProps {
  onEventSelect: (eventId: string, planId: string) => void;
  onBackToHome?: () => void;
}

export default function EventSelector({
  onEventSelect,
  onBackToHome,
}: EventSelectorProps) {
  const { events, venues } = useEventStore();
  const [selectedEventId, setSelectedEventId] = useState("");

  // Filtrar eventos que tienen planos asignados
  const eventsWithPlans = events.filter((event) => {
    // Verificar si algún día del evento tiene un plano asignado
    return event.days.some((day) => day.planId && day.planId.trim() !== "");
  });

  return (
    <div className="min-h-screen bg-gray-100">
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
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Seleccionar Evento</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Eventos Disponibles
            </h1>
            <p className="text-gray-600">
              Selecciona un evento para ver sus asientos disponibles
            </p>
          </div>

          {/* Lista de eventos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventsWithPlans.map((event) => {
              const isSelected = selectedEventId === event.id;

              return (
                <div
                  key={event.id}
                  className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-xl"
                  }`}
                  onClick={() => setSelectedEventId(event.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {event.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {event.days.length} día
                        {event.days.length !== 1 ? "s" : ""}
                      </p>
                      {event.description && (
                        <p className="text-gray-500 text-sm">
                          {event.description}
                        </p>
                      )}
                      {/* Mostrar información de localidades */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 font-medium">
                          Localidades:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.from(
                            new Set(event.days.map((day) => day.venueId))
                          ).map((venueId) => {
                            const venue = venues.find((v) => v.id === venueId);
                            return venue ? (
                              <span
                                key={venueId}
                                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                              >
                                {venue.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="text-blue-500 text-2xl">✓</div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">Días con planos:</span>
                      <span className="font-semibold text-green-600">
                        {
                          event.days.filter(
                            (day) => day.planId && day.planId.trim() !== ""
                          ).length
                        }
                      </span>
                    </div>
                    {event.days.some(
                      (day) => day.planId && day.planId.trim() !== ""
                    ) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Obtener el primer día con plano asignado
                          const dayWithPlan = event.days.find(
                            (day) => day.planId && day.planId.trim() !== ""
                          );
                          if (dayWithPlan) {
                            onEventSelect(event.id, dayWithPlan.planId);
                          }
                        }}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Ver Asientos
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mensaje si no hay eventos con planos */}
          {eventsWithPlans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay eventos con planos disponibles
              </h3>
              <p className="text-gray-600">
                Primero necesitas crear planos para los eventos en el editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
