"use client";

import { useEventStore } from "../../store/events";

interface EventDaysSelectorProps {
  eventId: string;
  onDaySelect: (dayId: string, planId: string) => void;
  onBackToEvents: () => void;
  onBackToHome?: () => void;
}

export default function EventDaysSelector({
  eventId,
  onDaySelect,
  onBackToEvents,
  onBackToHome,
}: EventDaysSelectorProps) {
  const { events, getPlansByDay } = useEventStore();

  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Evento no encontrado
          </h2>
          <button
            onClick={onBackToEvents}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Eventos
          </button>
        </div>
      </div>
    );
  }

  const handleDaySelect = (dayId: string) => {
    const plans = getPlansByDay(dayId);
    if (plans.length > 0) {
      // Tomar el primer plano disponible para este día
      const firstPlan = plans[0];
      onDaySelect(dayId, firstPlan.id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {onBackToHome && (
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToEvents}
              className="flex cursor-pointer items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <span className="text-xl">←</span>
              <span className="font-medium">Volver a Eventos</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Seleccionar Día</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Título principal */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {event.name}
            </h1>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <p className="text-sm text-gray-500">
              Selecciona el día para ver los asientos disponibles
            </p>
          </div>

          {/* Lista de días */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {event.days.map((day) => {
              const plans = getPlansByDay(day.id);
              const totalSeats = plans.reduce((total, plan) => {
                const seatShapes = plan.shapes.filter(
                  (shape) => shape.type === "seat"
                );
                return total + seatShapes.length;
              }, 0);

              return (
                <div
                  key={day.id}
                  className="bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all duration-200 border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl"
                  onClick={() => handleDaySelect(day.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        {new Date(day.date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {day.time && (
                        <p className="text-gray-600 text-sm mb-2">
                          Hora: {day.time}
                        </p>
                      )}
                      {day.description && (
                        <p className="text-gray-500 text-sm">
                          {day.description}
                        </p>
                      )}
                    </div>
                    {plans.length > 0 && (
                      <div className="text-green-500 text-2xl">✓</div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-gray-600">
                        Asientos disponibles:
                      </span>
                      <span className="font-semibold text-green-600">
                        {totalSeats}
                      </span>
                    </div>
                    {plans.length > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDaySelect(day.id);
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

          {/* Mensaje si no hay días con planos */}
          {event.days.every((day) => getPlansByDay(day.id).length === 0) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No hay planos disponibles para este evento
              </h3>
              <p className="text-gray-600">
                Primero necesitas crear planos para los días de este evento en
                el editor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
