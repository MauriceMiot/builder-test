"use client";

import { useState } from "react";
import { useEventStore, Event } from "../../store/events";

interface EventManagerProps {
  onBackToHome?: () => void;
}

interface SavedPlan {
  id: string;
  title: string;
  shapes: unknown[];
  gridConfig: unknown;
  createdAt: string;
  updatedAt: string;
}

interface EventFormData {
  name: string;
  description: string;
  days: {
    date: string;
    time: string;
    description: string;
    venueId: string;
    planId: string;
  }[];
}

export default function EventManager({ onBackToHome }: EventManagerProps) {
  const { events, venues, addEvent, updateEvent, removeEvent } =
    useEventStore();

  // Obtener planos guardados desde localStorage
  const getSavedPlans = () => {
    try {
      return JSON.parse(localStorage.getItem("savedPlans") || "[]");
    } catch {
      return [];
    }
  };
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    description: "",
    days: [{ date: "", time: "", description: "", venueId: "", planId: "" }],
  });

  const handleAddEvent = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      days: [{ date: "", time: "", description: "", venueId: "", planId: "" }],
    });
    setShowForm(true);
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      days: event.days.map((day) => ({
        date: day.date,
        time: day.time || "",
        description: day.description || "",
        venueId: day.venueId,
        planId: "", // Los planos se asignarán después
      })),
    });
    setShowForm(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      removeEvent(eventId);
    }
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert("El nombre del evento es obligatorio");
      return;
    }

    if (formData.days.length === 0) {
      alert("Debe agregar al menos un día al evento");
      return;
    }

    const eventData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      days: formData.days.map((day, index) => ({
        id: editingEvent?.days[index]?.id || `day_${Date.now()}_${index}`,
        eventId: editingEvent?.id || `event_${Date.now()}`,
        venueId: day.venueId,
        planId: day.planId,
        date: day.date,
        time: day.time,
        description: day.description,
      })),
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }

    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      days: [{ date: "", time: "", description: "", venueId: "", planId: "" }],
    });
  };

  const addDay = () => {
    setFormData((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        { date: "", time: "", description: "", venueId: "", planId: "" },
      ],
    }));
  };

  const removeDay = (index: number) => {
    if (formData.days.length > 1) {
      setFormData((prev) => ({
        ...prev,
        days: prev.days.filter((_, i) => i !== index),
      }));
    }
  };

  const updateDay = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.map((day, i) =>
        i === index ? { ...day, [field]: value } : day
      ),
    }));
  };

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
            <span className="text-sm text-gray-500">Gestión de Eventos</span>
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Título y botón agregar */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Gestión de Eventos
              </h1>
              <p className="text-gray-600 mt-2">
                Crea y gestiona los eventos para tus planos
              </p>
            </div>
            <button
              onClick={handleAddEvent}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Nuevo Evento
            </button>
          </div>

          {/* Lista de eventos */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.name}
                    </h3>
                    {event.description && (
                      <p className="text-gray-600 text-sm mb-2">
                        {event.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {event.days.length} día
                      {event.days.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {event.days.map((day) => (
                    <div key={day.id} className="text-sm text-gray-600">
                      <div className="font-medium">
                        {new Date(day.date).toLocaleDateString("es-ES", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      {day.time && <div>Hora: {day.time}</div>}
                      {day.description && <div>{day.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Nombre del evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Evento *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ej: Festival de Rock"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descripción del evento..."
                    />
                  </div>

                  {/* Días del evento */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Días del Evento *
                      </label>
                      <button
                        type="button"
                        onClick={addDay}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        + Agregar Día
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formData.days.map((day, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-gray-800">
                              Día {index + 1}
                            </h4>
                            {formData.days.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDay(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Eliminar
                              </button>
                            )}
                          </div>

                          <div className="mb-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Localidad *
                            </label>
                            <select
                              value={day.venueId}
                              onChange={(e) =>
                                updateDay(index, "venueId", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar localidad</option>
                              {venues.map((venue) => (
                                <option key={venue.id} value={venue.id}>
                                  {venue.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Fecha *
                              </label>
                              <input
                                type="date"
                                value={day.date}
                                onChange={(e) =>
                                  updateDay(index, "date", e.target.value)
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Hora
                              </label>
                              <input
                                type="time"
                                value={day.time}
                                onChange={(e) =>
                                  updateDay(index, "time", e.target.value)
                                }
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Descripción del día
                            </label>
                            <input
                              type="text"
                              value={day.description}
                              onChange={(e) =>
                                updateDay(index, "description", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Ej: Día 1 - Bandas locales"
                            />
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Plano del día
                            </label>
                            <select
                              value={day.planId}
                              onChange={(e) =>
                                updateDay(index, "planId", e.target.value)
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Seleccionar plano</option>
                              {getSavedPlans().map((plan: SavedPlan) => (
                                <option key={plan.id} value={plan.id}>
                                  {plan.title}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowForm(false)}
                      className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      {editingEvent ? "Actualizar" : "Crear"} Evento
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
