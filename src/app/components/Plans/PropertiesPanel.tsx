"use client";

import { usePlanStore } from "../../store/plans";
import { Icon } from "@iconify/react";

export default function PropertiesPanel() {
  const {
    shapes,
    selectedShapeId,
    updateShape,
    bringToFront,
    sendToBack,
    // duplicateShape,
  } = usePlanStore();

  const selectedShape = shapes.find((shape) => shape.id === selectedShapeId);

  if (!selectedShape) {
    return (
      <div className="p-8">
        <h3 className="text-2xl font-semibold text-gray-800 mb-8 border-b border-black pb-4">
          Propiedades de la Figura
        </h3>
        <p className="text-gray-500 text-center py-16 text-xl">
          Selecciona una figura para ver sus propiedades
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-8 border-b border-black pb-4">
        Propiedades de la Figura
      </h3>
      <div className="space-y-8 gap-2">
        {/* Posición */}
        <div className="flex justify-between items-center gap-2">
          <div className="w-1/2 flex items-center gap-2 justify-center space-y-4">
            <label className="block text-base font-medium text-gray-700 p-0 m-0">
              X
            </label>
            <input
              type="number"
              value={selectedShape.x}
              onChange={(e) =>
                updateShape(selectedShape.id, { x: parseInt(e.target.value) })
              }
              className="form-input text-base py-3"
            />
          </div>
          <div className="w-1/2 flex items-center gap-2 justify-center space-y-4">
            <label className="block text-base font-medium text-gray-700 p-0 m-0">
              Y
            </label>
            <input
              type="number"
              value={selectedShape.y}
              onChange={(e) =>
                updateShape(selectedShape.id, { y: parseInt(e.target.value) })
              }
              className="form-input text-base py-3"
            />
          </div>
        </div>

        {/* Tamaño */}
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-2">
            <div className="w-1/2 flex items-center gap-2 justify-center space-y-4">
              <Icon
                icon="mdi:arrow-expand-horizontal"
                className="text-2xl text-gray-700 p-0 m-0"
              />
              <input
                type="number"
                value={selectedShape.width}
                onChange={(e) =>
                  updateShape(selectedShape.id, {
                    width: parseInt(e.target.value),
                  })
                }
                className="form-input text-base py-3"
              />
            </div>

            <div className="w-1/2 flex items-center gap-2 justify-center space-y-4">
              <Icon
                icon="mdi:arrow-expand-vertical"
                className="text-2xl text-gray-700 p-0 m-0"
              />
              <input
                type="number"
                value={selectedShape.height}
                onChange={(e) =>
                  updateShape(selectedShape.id, {
                    height: parseInt(e.target.value),
                  })
                }
                className="form-input text-base py-3"
              />
            </div>
          </div>
        </div>

        {/* Rotación */}
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-2">
            <div className="w-1/2 flex items-center gap-2 justify-center space-y-4">
              <Icon
                icon="mdi:rotate-right"
                className="text-2xl text-gray-700 p-0 m-0"
              />

              <input
                type="number"
                value={selectedShape.rotation}
                onChange={(e) =>
                  updateShape(selectedShape.id, {
                    rotation: parseInt(e.target.value),
                  })
                }
                className="form-input text-base py-3"
              />
            </div>

            <div className="flex w-1/2 items-center gap-2 justify-center space-y-4">
              <Icon
                icon="bi:border-width"
                className="text-2xl text-gray-700 p-0 m-0"
              />

              <input
                type="number"
                min="0"
                max="20"
                value={selectedShape.strokeWidth}
                onChange={(e) =>
                  updateShape(selectedShape.id, {
                    strokeWidth: parseInt(e.target.value),
                  })
                }
                className="form-input text-base py-3"
              />
            </div>
          </div>
        </div>

        {/* Color de relleno */}
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-2">
            <div className="flex w-1/2 items-center gap-2 justify-center">
              <Icon
                icon="mdi:palette"
                className="text-2xl text-gray-700 p-0 m-0"
              />

              <input
                type="color"
                value={selectedShape.fill}
                onChange={(e) =>
                  updateShape(selectedShape.id, { fill: e.target.value })
                }
                className="w-full h-8 border border-black rounded-md cursor-pointer"
              />
            </div>

            {/* Color de borde */}

            <div className="flex w-1/2 items-center gap-2 justify-center space-y-4">
              <Icon
                icon="material-symbols:border-color"
                className="text-2xl text-gray-700 p-0 m-0"
              />

              <input
                type="color"
                value={selectedShape.stroke}
                onChange={(e) =>
                  updateShape(selectedShape.id, { stroke: e.target.value })
                }
                className="w-full h-8 border border-black rounded-md cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Controles de capa */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Orden de capa
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => bringToFront(selectedShape.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              title="Traer al frente"
            >
              <Icon icon="mdi:arrow-up" className="text-lg" />
              <span className="text-sm">Traer al frente</span>
            </button>
            <button
              onClick={() => sendToBack(selectedShape.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              title="Enviar atrás"
            >
              <Icon icon="mdi:arrow-down" className="text-lg" />
              <span className="text-sm">Enviar atrás</span>
            </button>
          </div>
        </div>

        {/* Propiedades específicas para texto */}
        {selectedShape?.type === "text" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <div className="flex w-1/2 items-center gap-2 justify-center">
                <Icon
                  icon="bx:font-size"
                  className="text-2xl text-gray-700 p-0 m-0"
                />
                <input
                  type="number"
                  value={selectedShape.fontSize || 16}
                  onChange={(e) =>
                    updateShape(selectedShape.id, {
                      fontSize: parseInt(e.target.value),
                    })
                  }
                  className="form-input text-base py-3"
                />
              </div>
              <div className="flex w-1/2 items-center gap-2 justify-center">
                <Icon
                  icon="ri:font-family"
                  className="text-2xl text-gray-700 p-0 m-0"
                />
                <select
                  value={selectedShape.fontFamily || "Arial"}
                  onChange={(e) =>
                    updateShape(selectedShape.id, {
                      fontFamily: e.target.value,
                    })
                  }
                  className="form-select text-base py-3"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>
            <label className="block text-base font-medium text-gray-700">
              Texto
            </label>
            <input
              type="text"
              value={selectedShape.text || ""}
              onChange={(e) =>
                updateShape(selectedShape.id, { text: e.target.value })
              }
              className="form-input text-base py-3"
            />
          </div>
        )}

        {/* Propiedades específicas para asientos */}
        {selectedShape?.type === "seat" && (
          <div className="space-y-4">
            <label className="block text-base font-medium text-gray-700">
              Número de asiento
            </label>
            <input
              type="text"
              value={selectedShape.seatNumber || ""}
              onChange={(e) =>
                updateShape(selectedShape.id, { seatNumber: e.target.value })
              }
              className="form-input text-base py-3"
            />
            <label className="block text-base font-medium text-gray-700">
              Estado
            </label>
            <select
              value={selectedShape.seatStatus || "available"}
              onChange={(e) =>
                updateShape(selectedShape.id, {
                  seatStatus: e.target.value as
                    | "available"
                    | "sold"
                    | "reserved",
                })
              }
              className="form-select text-base py-3"
            >
              <option value="available">Disponible</option>
              <option value="reserved">Reservado</option>
              <option value="sold">Vendido</option>
            </select>
            <label className="block text-base font-medium text-gray-700">
              Sección
            </label>
            <input
              type="text"
              value={selectedShape.seatSection || ""}
              onChange={(e) =>
                updateShape(selectedShape.id, { seatSection: e.target.value })
              }
              className="form-input text-base py-3"
            />
            <label className="block text-base font-medium text-gray-700">
              Precio
            </label>
            <input
              type="number"
              value={selectedShape.seatPrice || 0}
              onChange={(e) =>
                updateShape(selectedShape.id, {
                  seatPrice: parseFloat(e.target.value),
                })
              }
              className="form-input text-base py-3"
            />
          </div>
        )}
      </div>
    </div>
  );
}
