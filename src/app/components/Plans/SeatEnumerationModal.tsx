"use client";

import { useState, useEffect } from "react";
import { usePlanStore } from "../../store/plans";

interface SeatEnumerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type EnumerationPattern = "sequential" | "even_odd" | "custom" | "pattern";
type NumberingDirection = "incremental" | "decremental";

interface PreviewData {
  type: "pattern" | "normal";
  rowLetters?: string[];
  numbers: number[];
  preview?: string[][];
}

export default function SeatEnumerationModal({
  isOpen,
  onClose,
}: SeatEnumerationModalProps) {
  const { shapes, selectedShapeIds, updateShape } = usePlanStore();

  const [enumerationPattern, setEnumerationPattern] =
    useState<EnumerationPattern>("sequential");
  const [rowLetter, setRowLetter] = useState<string>("A");
  const [startNumber, setStartNumber] = useState<number>(1);
  const [step, setStep] = useState<number>(1);
  const [customNumbers, setCustomNumbers] = useState<string>("");
  const [direction, setDirection] = useState<"left_to_right" | "right_to_left">(
    "left_to_right"
  );
  const [numberingDirection, setNumberingDirection] =
    useState<NumberingDirection>("incremental");

  // Nuevas opciones para patrón de múltiples filas
  const [useMultipleRows, setUseMultipleRows] = useState<boolean>(false);
  const [multipleRowLetters, setMultipleRowLetters] = useState<string>("");
  const [patternStartNumber, setPatternStartNumber] = useState<number>(23);
  const [patternStep, setPatternStep] = useState<number>(2);

  // Obtener asientos seleccionados
  const selectedSeats = shapes.filter(
    (shape) => shape.type === "seat" && selectedShapeIds.includes(shape.id)
  );

  // Ordenar asientos por posición (izquierda a derecha, arriba a abajo)
  const sortedSeats = selectedSeats.sort((a, b) => {
    if (Math.abs(a.y - b.y) <= 25) {
      // Misma fila, ordenar por X
      return direction === "left_to_right" ? a.x - b.x : b.x - a.x;
    }
    // Diferente fila, ordenar por Y
    return a.y - b.y;
  });

  // La letra de la fila se puede personalizar con el input

  // Generar números según el patrón seleccionado
  const generateNumbers = (count: number): number[] => {
    const numbers: number[] = [];

    switch (enumerationPattern) {
      case "sequential":
        for (let i = 0; i < count; i++) {
          numbers.push(startNumber + i * step);
        }
        break;
      case "even_odd":
        let currentNumber = startNumber;
        for (let i = 0; i < count; i++) {
          numbers.push(currentNumber);
          currentNumber += step;
        }
        break;
      case "custom":
        const customArray = customNumbers
          .split(",")
          .map((n) => parseInt(n.trim()))
          .filter((n) => !isNaN(n));
        return customArray.slice(0, count);
      case "pattern":
        // Para patrón de múltiples filas, usar el patrón numérico fijo
        for (let i = 0; i < count; i++) {
          if (numberingDirection === "decremental") {
            numbers.push(patternStartNumber - i * patternStep);
          } else {
            numbers.push(patternStartNumber + i * patternStep);
          }
        }
        break;
    }

    // NO hacer reverse aquí - se maneja en la asignación
    return numbers;
  };

  // Aplicar enumeración
  const applyEnumeration = () => {
    if (sortedSeats.length === 0) return;

    if (useMultipleRows && enumerationPattern === "pattern") {
      // Enumeración por patrón de múltiples filas
      applyPatternEnumeration();
    } else {
      // Enumeración normal de una sola fila
      applyNormalEnumeration();
    }
  };

  // Enumeración normal (una sola fila)
  const applyNormalEnumeration = () => {
    const numbers = generateNumbers(sortedSeats.length);

    sortedSeats.forEach((seat, index) => {
      if (numbers[index] !== undefined) {
        // Para decremental, empezar desde el número más alto
        let numberToUse;
        if (numberingDirection === "decremental") {
          // Empezar desde startNumber y ir hacia abajo
          numberToUse = startNumber - index * step;
        } else {
          // Empezar desde startNumber y ir hacia arriba
          numberToUse = startNumber + index * step;
        }

        const seatNumber = `${rowLetter}${numberToUse}`;

        // Actualizar SOLO el seatNumber, preservar toda la posición
        updateShape(seat.id, {
          seatNumber: seatNumber,
          // NO incluir x, y, width, height para preservar posición
        });
      }
    });

    onClose();
  };

  // Enumeración por patrón (múltiples filas)
  const applyPatternEnumeration = () => {
    if (!multipleRowLetters.trim()) {
      alert("Por favor ingresa las letras de las filas separadas por comas");
      return;
    }

    const rowLetters = multipleRowLetters
      .split(",")
      .map((l) => l.trim().toUpperCase())
      .filter((l) => l);

    // Dividir asientos por filas reales (por posición Y)
    const seatGroups: (typeof sortedSeats)[] = [];

    // Detectar filas físicas reales por posición Y y asignar letras
    const targetRows = rowLetters.length;

    // Agrupar asientos por posición Y (misma fila física)
    const rowGroups = new Map<number, typeof sortedSeats>();

    // Ordenar asientos por posición Y para detectar filas
    const seatsSortedByY = [...sortedSeats].sort((a, b) => a.y - b.y);

    // Detectar filas físicas usando un umbral más preciso
    let currentRowY = seatsSortedByY[0]?.y || 0;
    let currentRowSeats: typeof sortedSeats = [];

    seatsSortedByY.forEach((seat, index) => {
      // Si es el primer asiento, iniciar primera fila
      if (index === 0) {
        currentRowY = seat.y;
        currentRowSeats = [seat];
        return;
      }

      // Calcular diferencia en Y con el asiento anterior
      const yDiff = Math.abs(seat.y - currentRowY);

      // Si la diferencia es significativa, es una nueva fila
      // En tu plano las filas están separadas por 20px, así que usamos 15px como umbral
      if (yDiff > 15) {
        // Guardar la fila actual
        if (currentRowSeats.length > 0) {
          rowGroups.set(currentRowY, currentRowSeats);
        }

        // Iniciar nueva fila
        currentRowY = seat.y;
        currentRowSeats = [seat];
      } else {
        // Agregar a la fila actual
        currentRowSeats.push(seat);
      }
    });

    // Agregar la última fila
    if (currentRowSeats.length > 0) {
      rowGroups.set(currentRowY, currentRowSeats);
    }

    // Ordenar filas por posición Y (arriba hacia abajo)
    const sortedRows = Array.from(rowGroups.entries())
      .sort(([y1], [y2]) => y1 - y2)
      .map(([, seats]) => seats);

    // Asignar letras a las filas físicas detectadas
    sortedRows.forEach((rowSeats, index) => {
      if (index < targetRows) {
        seatGroups.push(rowSeats);
      }
    });

    // Log único y claro de la enumeración
    console.log(`=== ENUMERACIÓN DE ASIENTOS ===`);
    console.log(`Letras especificadas: ${rowLetters.join(", ")}`);
    console.log(`Filas físicas detectadas: ${sortedRows.length}`);
    console.log(`Filas con letras asignadas: ${seatGroups.length}`);

    if (seatGroups.length !== rowLetters.length) {
      console.warn(
        `⚠️ ADVERTENCIA: Se detectaron ${sortedRows.length} filas pero se especificaron ${rowLetters.length} letras`
      );
    }

    // Aplicar numeración a cada grupo con su letra correspondiente
    seatGroups.forEach((group, groupIndex) => {
      if (groupIndex < rowLetters.length) {
        const currentRowLetter = rowLetters[groupIndex];

        // Ordenar asientos del grupo por X (izquierda a derecha o derecha a izquierda)
        const sortedGroupSeats = group.sort((a, b) =>
          direction === "left_to_right" ? a.x - b.x : b.x - a.x
        );

        // Aplicar números a los asientos de este grupo
        sortedGroupSeats.forEach((seat, seatIndex) => {
          let seatNumber;
          if (numberingDirection === "decremental") {
            seatNumber = `${currentRowLetter}${
              patternStartNumber - seatIndex * patternStep
            }`;
          } else {
            seatNumber = `${currentRowLetter}${
              patternStartNumber + seatIndex * patternStep
            }`;
          }

          updateShape(seat.id, {
            seatNumber: seatNumber,
          });
        });
      }
    });

    onClose();
  };

  // Vista previa de la enumeración
  const getPreview = (): PreviewData => {
    if (sortedSeats.length === 0) {
      return { type: "normal", numbers: [] };
    }

    if (useMultipleRows && enumerationPattern === "pattern") {
      // Vista previa para patrón de múltiples filas
      const rowLetters = multipleRowLetters
        .split(",")
        .map((l) => l.trim().toUpperCase())
        .filter((l) => l);

      // Generar números según el patrón configurado
      const numbers: number[] = [];
      for (let i = 0; i < Math.min(8, sortedSeats.length); i++) {
        if (numberingDirection === "decremental") {
          numbers.push(patternStartNumber - i * patternStep);
        } else {
          numbers.push(patternStartNumber + i * patternStep);
        }
      }

      // Crear vista previa por grupos
      const seatsPerGroup = Math.ceil(sortedSeats.length / rowLetters.length);
      const preview = rowLetters.slice(0, 4).map((letter, groupIndex) => {
        const startIndex = groupIndex * seatsPerGroup;
        const endIndex = Math.min(startIndex + 4, sortedSeats.length);
        return numbers
          .slice(0, endIndex - startIndex)
          .map((num) => `${letter}${num}`);
      });

      return {
        type: "pattern",
        rowLetters,
        numbers,
        preview,
      };
    } else {
      // Vista previa normal
      const numbers = [];
      for (let i = 0; i < sortedSeats.length; i++) {
        if (numberingDirection === "decremental") {
          // Empezar desde startNumber y ir hacia abajo
          numbers.push(startNumber - i * step);
        } else {
          // Empezar desde startNumber y ir hacia arriba
          numbers.push(startNumber + i * step);
        }
      }

      return {
        type: "normal",
        numbers,
      };
    }
  };

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!isOpen) {
      setRowLetter("A");
      setStartNumber(1);
      setStep(1);
      setCustomNumbers("");
      setDirection("left_to_right");
      setNumberingDirection("incremental");
      setUseMultipleRows(false);
      setMultipleRowLetters("");
      setPatternStartNumber(23);
      setPatternStep(2);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const preview = getPreview();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Enumeración de Asientos Seleccionados
            {selectedSeats.length > 0 &&
              useMultipleRows &&
              enumerationPattern === "pattern" && (
                <span className="block text-lg text-blue-600 font-normal">
                  Múltiples Filas:{" "}
                  {multipleRowLetters
                    .split(",")
                    .map((l) => l.trim().toUpperCase())
                    .join(", ")}
                </span>
              )}
            {selectedSeats.length > 0 &&
              (!useMultipleRows || enumerationPattern !== "pattern") && (
                <span className="block text-lg text-blue-600 font-normal">
                  Fila {rowLetter}
                </span>
              )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Información de asientos seleccionados */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            💺 <strong>Asientos Seleccionados:</strong> {selectedSeats.length}
          </p>
          {selectedSeats.length > 0 &&
            useMultipleRows &&
            enumerationPattern === "pattern" && (
              <p className="text-sm text-blue-700 mt-1">
                🎭 <strong>Filas:</strong>{" "}
                {multipleRowLetters
                  .split(",")
                  .map((l) => l.trim().toUpperCase())
                  .join(", ")}{" "}
                | <strong>Total:</strong> {selectedSeats.length} asientos
              </p>
            )}
          {selectedSeats.length > 0 &&
            (!useMultipleRows || enumerationPattern !== "pattern") && (
              <p className="text-sm text-blue-700 mt-1">
                🎭 <strong>Fila:</strong> {rowLetter} |{" "}
                <strong>Posición:</strong> {Math.round(sortedSeats[0]?.y || 0)}
                px
              </p>
            )}
          {selectedSeats.length === 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Selecciona asientos con la herramienta de selección múltiple
              primero
            </p>
          )}
        </div>

        {selectedSeats.length > 0 && (
          <>
            {/* Opción para múltiples filas */}
            <div className="mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useMultipleRows}
                  onChange={(e) => {
                    setUseMultipleRows(e.target.checked);
                    if (e.target.checked) {
                      setEnumerationPattern("pattern");
                    }
                  }}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  Enumerar múltiples filas con patrón
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Útil para enumerar múltiples filas en secuencia (ej: K, H, G, F)
                con el mismo patrón numérico
              </p>
              {useMultipleRows && (
                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded-md">
                  <p className="text-xs text-purple-700">
                    💡 <strong>Modo Patrón Activado:</strong> Los asientos
                    seleccionados se dividirán automáticamente en grupos según
                    la cantidad de letras especificadas. Cada grupo tendrá su
                    letra correspondiente.
                  </p>
                </div>
              )}
            </div>

            {!useMultipleRows && (
              <>
                {/* Configuración de la letra de fila */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letra de la Fila
                  </label>
                  <input
                    type="text"
                    value={rowLetter}
                    onChange={(e) => setRowLetter(e.target.value.toUpperCase())}
                    placeholder="A, B, C, L, M, N..."
                    maxLength={1}
                    className="w-full p-2 border border-gray-300 rounded-md text-center text-lg font-bold"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Los asientos se enumerarán como {rowLetter}1, {rowLetter}2,{" "}
                    {rowLetter}3...
                  </p>
                </div>
              </>
            )}

            {useMultipleRows && (
              <>
                {/* Configuración para múltiples filas */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Letras de las Filas (separadas por comas)
                  </label>
                  <input
                    type="text"
                    value={multipleRowLetters}
                    onChange={(e) => setMultipleRowLetters(e.target.value)}
                    placeholder="K, J, I, H, G, F, E, D"
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ejemplo: K, H, G, F → Los asientos se dividirán en 4 grupos,
                    cada uno con su letra y patrón numérico
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número inicial del patrón
                    </label>
                    <input
                      type="number"
                      value={patternStartNumber}
                      onChange={(e) =>
                        setPatternStartNumber(parseInt(e.target.value) || 23)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Incremento del patrón
                    </label>
                    <input
                      type="number"
                      value={patternStep}
                      onChange={(e) =>
                        setPatternStep(parseInt(e.target.value) || 2)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                {/* Dirección de numeración para patrón */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Numeración del Patrón
                  </label>
                  <select
                    value={numberingDirection}
                    onChange={(e) =>
                      setNumberingDirection(
                        e.target.value as "incremental" | "decremental"
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="incremental">
                      Incremental (23, 25, 27, 29...)
                    </option>
                    <option value="decremental">
                      Decremental (23, 21, 19, 17...)
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {numberingDirection === "incremental"
                      ? `El patrón irá de ${patternStartNumber} hacia arriba: ${patternStartNumber}, ${
                          patternStartNumber + patternStep
                        }, ${patternStartNumber + 2 * patternStep}...`
                      : `El patrón irá de ${patternStartNumber} hacia abajo: ${patternStartNumber}, ${
                          patternStartNumber - patternStep
                        }, ${patternStartNumber - 2 * patternStep}...`}
                  </p>
                </div>
              </>
            )}

            {/* Lista de asientos seleccionados */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asientos a Enumerar{" "}
                {useMultipleRows && enumerationPattern === "pattern"
                  ? `(Filas: ${multipleRowLetters
                      .split(",")
                      .map((l) => l.trim().toUpperCase())
                      .join(", ")})`
                  : `(Fila ${rowLetter})`}
                :
              </label>
              <div className="bg-gray-100 p-3 rounded-md max-h-32 overflow-y-auto">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {sortedSeats.map((seat, index) => (
                    <div key={seat.id} className="bg-white p-2 rounded border">
                      <div className="font-medium">Asiento {index + 1}</div>
                      <div className="text-gray-600">
                        Pos: ({Math.round(seat.x)}, {Math.round(seat.y)})
                      </div>
                      {seat.seatNumber && (
                        <div className="text-green-600">
                          Número: {seat.seatNumber}
                        </div>
                      )}
                      {!useMultipleRows && (
                        <div className="text-blue-600 font-medium">
                          {rowLetter}
                          {preview.type === "normal"
                            ? preview.numbers[index] || "?"
                            : "?"}
                        </div>
                      )}
                      {useMultipleRows && enumerationPattern === "pattern" && (
                        <div className="text-purple-600 font-medium">
                          Grupo:{" "}
                          {Math.floor(
                            index /
                              Math.ceil(
                                sortedSeats.length /
                                  multipleRowLetters
                                    .split(",")
                                    .filter((l) => l.trim()).length
                              )
                          ) + 1}
                        </div>
                      )}
                      {useMultipleRows && enumerationPattern !== "pattern" && (
                        <div className="text-purple-600 font-medium">
                          Fila: {Math.round(seat.y / 50)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!useMultipleRows && (
              <>
                {/* Patrón de Enumeración */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patrón de Enumeración
                  </label>
                  <select
                    value={enumerationPattern}
                    onChange={(e) =>
                      setEnumerationPattern(
                        e.target.value as EnumerationPattern
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="sequential">Secuencial</option>
                    <option value="even_odd">De 2 en 2</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {/* Configuración según el patrón */}
                {enumerationPattern === "sequential" && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número inicial
                      </label>
                      <input
                        type="number"
                        value={startNumber}
                        onChange={(e) =>
                          setStartNumber(parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incremento
                      </label>
                      <input
                        type="number"
                        value={step}
                        onChange={(e) => setStep(parseInt(e.target.value) || 1)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {enumerationPattern === "even_odd" && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número inicial
                      </label>
                      <input
                        type="number"
                        value={startNumber}
                        onChange={(e) =>
                          setStartNumber(parseInt(e.target.value) || 1)
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Incremento
                      </label>
                      <input
                        type="number"
                        value={step}
                        onChange={(e) => setStep(parseInt(e.target.value) || 2)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                )}

                {enumerationPattern === "custom" && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Números personalizados (separados por comas)
                    </label>
                    <input
                      type="text"
                      value={customNumbers}
                      onChange={(e) => setCustomNumbers(e.target.value)}
                      placeholder="1, 3, 5, 7, 9..."
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}

                {/* Dirección de ordenamiento */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden de Selección
                  </label>
                  <select
                    value={direction}
                    onChange={(e) =>
                      setDirection(
                        e.target.value as "left_to_right" | "right_to_left"
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="left_to_right">Izquierda → Derecha</option>
                    <option value="right_to_left">Derecha → Izquierda</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Define el orden en que se procesan los asientos
                    seleccionados
                  </p>
                </div>

                {/* Dirección de numeración */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Numeración
                  </label>
                  <select
                    value={numberingDirection}
                    onChange={(e) =>
                      setNumberingDirection(
                        e.target.value as "incremental" | "decremental"
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="incremental">
                      Incremental (1, 2, 3, 4...)
                    </option>
                    <option value="decremental">
                      Decremental (4, 3, 2, 1...)
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {numberingDirection === "incremental"
                      ? `Los números irán de ${startNumber} hacia arriba`
                      : `Los números irán de ${startNumber} hacia abajo`}
                  </p>
                </div>
              </>
            )}

            {/* Vista Previa */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vista Previa
              </label>
              <div className="bg-gray-100 p-3 rounded-md">
                {preview.type === "pattern" &&
                preview.rowLetters &&
                preview.preview ? (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      🎭 <strong>Patrón de Múltiples Filas:</strong>{" "}
                      {preview.rowLetters.join(", ")} |{" "}
                      {numberingDirection === "incremental"
                        ? "↗️ Incremental"
                        : "↘️ Decremental"}
                    </div>
                    <div className="space-y-2">
                      {preview.preview.map(
                        (rowNumbers: string[], rowIndex: number) => (
                          <div key={rowIndex} className="flex flex-wrap gap-1">
                            <span className="text-xs text-gray-500 font-medium w-6">
                              {preview.rowLetters![rowIndex]}:
                            </span>
                            {rowNumbers.map((num: string, numIndex: number) => (
                              <span
                                key={numIndex}
                                className="bg-purple-500 text-white px-2 py-1 rounded text-xs"
                              >
                                {num}
                              </span>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <strong>Patrón:</strong>{" "}
                      {numberingDirection === "incremental"
                        ? `${patternStartNumber}, ${
                            patternStartNumber + patternStep
                          }, ${patternStartNumber + 2 * patternStep}...`
                        : `${patternStartNumber}, ${
                            patternStartNumber - patternStep
                          }, ${patternStartNumber - 2 * patternStep}...`}
                    </div>
                    <div className="text-xs text-purple-700 mt-2 p-2 bg-purple-50 rounded">
                      💡 <strong>División automática:</strong> Los{" "}
                      {selectedSeats.length} asientos seleccionados se dividirán
                      automáticamente en {preview.rowLetters.length} grupos,
                      cada uno con su letra correspondiente.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm text-gray-600 mb-2">
                      🎭 <strong>Fila {rowLetter}:</strong>{" "}
                      {selectedSeats.length} asientos |{" "}
                      {numberingDirection === "incremental"
                        ? "↗️ Incremental"
                        : "↘️ Decremental"}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {preview.numbers.map((num, index) => (
                        <span
                          key={index}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                        >
                          {rowLetter}
                          {num}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <strong>Orden:</strong>{" "}
                      {direction === "left_to_right"
                        ? "Izquierda → Derecha"
                        : "Derecha → Izquierda"}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Botón Aplicar */}
            <button
              onClick={applyEnumeration}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Aplicar Enumeración
            </button>

            {/* Advertencia sobre posición */}
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
              <p className="text-xs text-green-700 text-center">
                ✅ Solo se modificará el número del asiento, la posición se
                mantendrá intacta
              </p>
            </div>
          </>
        )}

        {selectedSeats.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💺</div>
            <p className="text-gray-600">
              Selecciona asientos con la herramienta de selección múltiple
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Luego regresa aquí para enumerarlos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
