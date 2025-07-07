"use client";

import { usePlanStore } from "../../store/plans";

export default function DrawingInstructions() {
  const { currentTool, isEditingPolygon } = usePlanStore();

  if (
    !currentTool ||
    (currentTool !== "freehand" &&
      currentTool !== "polygon" &&
      currentTool !== "regular-polygon")
  ) {
    return null;
  }

  const getInstructions = () => {
    switch (currentTool) {
      case "freehand":
        return {
          title: "✏️ Instrucciones de Dibujo Libre",
          instructions: [
            "• Haz clic y arrastra para dibujar",
            "• Suelta el mouse para finalizar",
            "• La forma se cerrará automáticamente",
            "• Usa Snap to Grid para mayor precisión",
          ],
        };
      case "polygon":
        return {
          title: "📐 Instrucciones de Polígono Irregular",
          instructions: [
            "• Haz clic para agregar cada vértice",
            "• Presiona Enter para finalizar el polígono",
            "• Presiona Escape para cancelar",
            "• El polígono se cerrará y rellenará automáticamente",
            "• Necesitas al menos 3 puntos para crear el polígono",
            "• Usa Snap to Grid para mayor precisión",
          ],
        };
      case "regular-polygon":
        return {
          title: "🔷 Instrucciones de Polígono Regular",
          instructions: [
            "• Selecciona el número de lados arriba",
            "• Haz clic y arrastra para definir el tamaño",
            "• Suelta el mouse para crear el polígono",
            "• El polígono será perfectamente regular",
            "• Usa Snap to Grid para mayor precisión",
          ],
        };
      default:
        return null;
    }
  };

  const getEditingInstructions = () => {
    return {
      title: "🔧 Modo Edición de Polígono",
      instructions: [
        "• Arrastra los puntos amarillos para mover vértices",
        "• Doble clic en un vértice para eliminarlo",
        "• Presiona Escape para salir del modo edición",
        "• Los cambios se aplican en tiempo real",
        "• El polígono se mantiene cerrado automáticamente",
      ],
    };
  };

  const instructionData = isEditingPolygon
    ? getEditingInstructions()
    : getInstructions();
  if (!instructionData) return null;

  return (
    <div
      className={`border rounded-lg p-4 mb-4 ${
        isEditingPolygon
          ? "bg-orange-50 border-orange-200"
          : "bg-blue-50 border-blue-200"
      }`}
    >
      <h4
        className={`text-sm font-semibold mb-2 ${
          isEditingPolygon ? "text-orange-800" : "text-blue-800"
        }`}
      >
        {instructionData.title}
      </h4>
      <ul
        className={`text-sm space-y-1 ${
          isEditingPolygon ? "text-orange-700" : "text-blue-700"
        }`}
      >
        {instructionData.instructions.map((instruction, index) => (
          <li key={index}>• {instruction}</li>
        ))}
      </ul>
    </div>
  );
}
