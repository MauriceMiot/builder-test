"use client";

import { usePlanStore } from "../../store/plans";

export default function PropertiesPanel() {
  const {
    shapes,
    selectedShapeId,
    updateShape,
    removeShape,
    duplicateShape,
    bringToFront,
    sendToBack,
    clearSelection,
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

  const handlePropertyChange = (property: string, value: string | number) => {
    updateShape(selectedShape.id, { [property]: value });
  };

  const handleDelete = () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta figura?")) {
      removeShape(selectedShape.id);
      clearSelection();
    }
  };

  const handleDuplicate = () => {
    duplicateShape(selectedShape.id);
  };

  return (
    <div className="p-8">
      <h3 className="text-2xl font-semibold text-gray-800 mb-8 border-b border-black pb-4">
        Propiedades de la Figura
      </h3>
      <div className="space-y-8">
        {/* Posición */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Posición X
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
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Posición Y
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

        {/* Tamaño */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Ancho
          </label>
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
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Alto
          </label>
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

        {/* Rotación */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Rotación
          </label>
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

        {/* Color de relleno */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Color de relleno
          </label>
          <input
            type="color"
            value={selectedShape.fill}
            onChange={(e) =>
              updateShape(selectedShape.id, { fill: e.target.value })
            }
            className="w-full h-16 border border-black rounded-md cursor-pointer"
          />
        </div>

        {/* Color de borde */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Color de borde
          </label>
          <input
            type="color"
            value={selectedShape.stroke}
            onChange={(e) =>
              updateShape(selectedShape.id, { stroke: e.target.value })
            }
            className="w-full h-16 border border-black rounded-md cursor-pointer"
          />
        </div>

        {/* Grosor de borde */}
        <div className="space-y-4">
          <label className="block text-base font-medium text-gray-700">
            Grosor de borde
          </label>
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

        {/* Propiedades específicas para texto */}
        {selectedShape?.type === "text" && (
          <div className="space-y-4">
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
            <label className="block text-base font-medium text-gray-700">
              Tamaño de fuente
            </label>
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
            <label className="block text-base font-medium text-gray-700">
              Fuente
            </label>
            <select
              value={selectedShape.fontFamily || "Arial"}
              onChange={(e) =>
                updateShape(selectedShape.id, { fontFamily: e.target.value })
              }
              className="form-select text-base py-3"
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
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

        {/* Botón eliminar */}
        <button
          onClick={handleDelete}
          className="w-full form-button form-button-danger mt-10 py-4 text-lg"
        >
          Eliminar Figura
        </button>
      </div>
    </div>
  );
}
