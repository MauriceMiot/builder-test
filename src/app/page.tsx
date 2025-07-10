"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const Plans = dynamic(() => import("./components/Plans"), {
  ssr: false,
});

const Seats = dynamic(() => import("./components/Seats"), {
  ssr: false,
});

const EventManager = dynamic(() => import("./components/Events/EventManager"), {
  ssr: false,
});

export default function Home() {
  const [currentView, setCurrentView] = useState<
    "home" | "plans" | "seats" | "events"
  >("home");

  if (currentView === "plans") {
    return <Plans onBackToHome={() => setCurrentView("home")} />;
  }

  if (currentView === "seats") {
    return <Seats onBackToHome={() => setCurrentView("home")} />;
  }

  if (currentView === "events") {
    return <EventManager onBackToHome={() => setCurrentView("home")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Event Map Demo
          </h1>
          <p className="text-xl text-gray-600">
            Herramienta completa para diseño de planos y gestión de asientos
          </p>
        </div>

        {/* Botones de navegación */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Editor de Planos */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📐</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Editor de Planos
              </h2>
              <p className="text-gray-600 mb-6">
                Crea y edita planos detallados con múltiples herramientas de
                dibujo, cuadrícula configurable y exportación de proyectos.
              </p>
              <button
                onClick={() => setCurrentView("plans")}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
              >
                Abrir Editor
              </button>
            </div>
          </div>

          {/* Gestión de Eventos */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Gestión de Eventos
              </h2>
              <p className="text-gray-600 mb-6">
                Crea y gestiona eventos con múltiples días, asigna planos y
                organiza tu calendario de eventos de manera eficiente.
              </p>
              <button
                onClick={() => setCurrentView("events")}
                className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200"
              >
                Gestionar Eventos
              </button>
            </div>
          </div>
          {/* Visor de Asientos */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💺</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Visor de Asientos
              </h2>
              <p className="text-gray-600 mb-6">
                Visualiza y selecciona asientos en tiempo real con información
                detallada de precios, secciones y disponibilidad.
              </p>
              <button
                onClick={() => setCurrentView("seats")}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors duration-200"
              >
                Ver Asientos
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Event Map Demo - Sistema completo de planificación de eventos</p>
        </div>
      </div>
    </div>
  );
}
