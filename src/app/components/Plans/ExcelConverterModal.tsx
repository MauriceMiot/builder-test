"use client";

import React, { useState } from "react";
import ExcelToJsonConverter from "./ExcelToJsonConverter";
import { usePlanStore } from "../../store/plans";

interface ExcelConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExcelConverterModal: React.FC<ExcelConverterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { importFromJSON, updateGridConfig, gridConfig } = usePlanStore();
  const [convertedData, setConvertedData] = useState<any>(null);

  const handleConversionComplete = (jsonData: any) => {
    setConvertedData(jsonData);
  };

  const handleLoadToCanvas = () => {
    if (convertedData) {
      // Usar importFromJSON para mantener la configuración existente
      const jsonString = JSON.stringify(convertedData);
      importFromJSON(jsonString);
      onClose();
      setConvertedData(null);
    }
  };

  const handleDownloadJson = () => {
    if (convertedData) {
      const dataStr = JSON.stringify(convertedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "teatro_converted.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            🎭 Convertidor Excel a JSON
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <ExcelToJsonConverter
            onConversionComplete={handleConversionComplete}
            currentGridConfig={gridConfig}
          />

          {/* Actions after conversion */}
          {convertedData && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Conversión Completada
              </h3>
              <div className="text-sm text-green-700 mb-4">
                <p>
                  <strong>Total de shapes:</strong>{" "}
                  {convertedData.shapes.length}
                </p>
                <p>
                  <strong>Total de asientos:</strong>{" "}
                  {
                    convertedData.shapes.filter((s: any) => s.type === "seat")
                      .length
                  }
                </p>
                <p>
                  <strong>Secciones:</strong>{" "}
                  {Array.from(
                    new Set(
                      convertedData.shapes
                        .filter((s: any) => s.type === "seat")
                        .map((s: any) => s.seatSection)
                    )
                  ).join(", ")}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleLoadToCanvas}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  🎨 Cargar en el Canvas
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  💾 Descargar JSON
                </button>
                <button
                  onClick={() => setConvertedData(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  🔄 Convertir Otro
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelConverterModal;
