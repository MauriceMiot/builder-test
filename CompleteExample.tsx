"use client";

import SimplePlanRenderer from "./SimplePlanRenderer";
import { SimplePlanData, CanvasConfig } from "./types";

export default function CompleteExample() {
  // Configuración del canvas
  const config: CanvasConfig = {
    width: 800,
    height: 600,
    backgroundColor: "#f8fafc", // Color de fondo opcional
  };

  // Datos del plano
  const planData: SimplePlanData = {
    rectangles: [
      {
        x: 50,
        y: 50,
        width: 200,
        height: 150,
        fill: "#3B82F6",
        stroke: "#1E40AF",
        strokeWidth: 2,
      },
      {
        x: 300,
        y: 100,
        width: 100,
        height: 100,
        fill: "#10B981",
        stroke: "#059669",
        strokeWidth: 2,
        cornerRadius: 10,
      },
      {
        x: 450,
        y: 200,
        width: 120,
        height: 80,
        fill: "#F59E0B",
        stroke: "#D97706",
        strokeWidth: 1,
        rotation: 15,
      },
    ],
    texts: [
      {
        x: 50,
        y: 220,
        text: "Título del plano",
        fontSize: 24,
        fontFamily: "Arial",
        fill: "#1E293B",
        fontStyle: "bold",
      },
      {
        x: 300,
        y: 220,
        text: "Texto centrado",
        fontSize: 18,
        fontFamily: "Arial",
        fill: "#1E40AF",
        align: "center",
        fontStyle: "bold",
      },
      {
        x: 450,
        y: 300,
        text: "Texto con borde",
        fontSize: 16,
        fontFamily: "Arial",
        fill: "#EF4444",
        stroke: "#DC2626",
        strokeWidth: 1,
      },
      {
        x: 50,
        y: 350,
        text: "Descripción del plano",
        fontSize: 14,
        fontFamily: "Arial",
        fill: "#64748B",
      },
    ],
  };

  return (
    <div className="w-full h-full p-4">
      <h1 className="text-2xl font-bold mb-4">Ejemplo de Plano Simplificado</h1>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <SimplePlanRenderer data={planData} config={config} />
      </div>
    </div>
  );
}
