"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";

interface SeatData {
  rowLetter: string;
  seatNumber: number;
  x: number;
  y: number;
  section: string;
  status: string;
}

interface ConversionConfig {
  baseX: number;
  baseY: number;
  seatSpacing: number;
  rowSpacing: number;
  seatWidth: number;
  seatHeight: number;
  autoDetectSections: boolean;
  customSections: string[];
}

interface ExcelToJsonConverterProps {
  onConversionComplete: (jsonData: any) => void;
  currentGridConfig?: {
    enabled: boolean;
    size: number;
    color: string;
    opacity: number;
    snapToGrid: boolean;
    seatSize: number;
  };
}

const ExcelToJsonConverter: React.FC<ExcelToJsonConverterProps> = ({
  onConversionComplete,
  currentGridConfig,
}) => {
  const [isConverting, setIsConverting] = useState(false);
  const [config, setConfig] = useState<ConversionConfig>({
    baseX: 100,
    baseY: 40,
    seatSpacing: 25,
    rowSpacing: 20,
    seatWidth: 20,
    seatHeight: 20,
    autoDetectSections: true,
    customSections: ["Platea Alta", "Platea Media", "Platea Baja"],
  });

  const generateShapeId = (): string => {
    const timestamp = Date.now();
    const uniqueId = Math.random().toString(36).substring(2, 10);
    return `shape_${timestamp}_${uniqueId}`;
  };

  const detectSeatsFromExcel = (jsonData: unknown[]): SeatData[] => {
    const seats: SeatData[] = [];
    const rowMap = new Map<string, number>(); // Mapear fila a posición Y
    const hasLetters = new Set<string>(); // Track si encontramos asientos con letras
    const rowLettersMap = new Map<number, string>(); // Mapear índice de fila a letra de fila

    // Primera pasada: detectar todas las filas y sus posiciones
    jsonData.forEach((row: unknown, rowIndex: number) => {
      if (Array.isArray(row)) {
        let rowLetter = "";

        // Buscar si hay una letra de fila en esta fila (Z, ZZ, Y, etc.)
        row.forEach((cell: unknown, colIndex: number) => {
          if (cell && (typeof cell === "string" || typeof cell === "number")) {
            const cellStr = cell.toString().trim();

            // Detectar patrón con letra + número (ej: A1, B23)
            const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
            // Detectar solo números (ej: 1, 23, 456)
            const numberOnlyMatch = cellStr.match(/^\d+$/);
            // Detectar letras solas (ej: Z, ZZ, Y, AA)
            const letterOnlyMatch = cellStr.match(/^[A-Z]+$/);

            if (letterNumberMatch) {
              const letter = letterNumberMatch[1];
              hasLetters.add(letter);
              if (!rowMap.has(letter)) {
                rowMap.set(letter, rowIndex);
              }
            } else if (letterOnlyMatch && cellStr.length <= 3) {
              // Esta es probablemente una letra de fila
              rowLetter = cellStr;
              hasLetters.add(cellStr);
            } else if (numberOnlyMatch) {
              // Para asientos sin letra, usar el índice de fila como identificador
              const rowKey = `ROW_${rowIndex}`;
              if (!rowMap.has(rowKey)) {
                rowMap.set(rowKey, rowIndex);
              }
            }
          }
        });

        // Si encontramos una letra de fila, mapearla
        if (rowLetter) {
          rowLettersMap.set(rowIndex, rowLetter);
          if (!rowMap.has(rowLetter)) {
            rowMap.set(rowLetter, rowIndex);
          }
        }
      }
    });

    // Contar cuántos números sueltos vs letras+números encontramos
    let numberOnlyCount = 0;
    let letterNumberCount = 0;

    jsonData.forEach((row: unknown, rowIndex: number) => {
      if (Array.isArray(row)) {
        row.forEach((cell: unknown, colIndex: number) => {
          if (cell && (typeof cell === "string" || typeof cell === "number")) {
            const cellStr = cell.toString().trim();
            const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
            const numberOnlyMatch = cellStr.match(/^\d+$/);

            if (letterNumberMatch) {
              letterNumberCount++;
            } else if (numberOnlyMatch) {
              numberOnlyCount++;
            }
          }
        });
      }
    });

    // Si hay muchos más números sueltos que letras+números, tratar como solo números
    const useLetters = letterNumberCount > numberOnlyCount;

    console.log(
      `📊 Números sueltos: ${numberOnlyCount}, Letra+Número: ${letterNumberCount}, useLetters: ${useLetters}`
    );

    // Ordenar las filas
    let sortedRows: string[];
    if (useLetters) {
      // Si hay letras, ordenar por letra (T, S, R, Q, P, O, N, M, L, K, J, I, H, G, F, E, D, C, B, A)
      sortedRows = Array.from(rowMap.keys())
        .filter((key) => !key.startsWith("ROW_"))
        .sort((a, b) => b.charCodeAt(0) - a.charCodeAt(0));
    } else {
      // Si solo hay números, ordenar por índice de fila
      sortedRows = Array.from(rowMap.keys()).sort((a, b) => {
        const indexA = parseInt(a.replace("ROW_", ""));
        const indexB = parseInt(b.replace("ROW_", ""));
        return indexA - indexB;
      });
    }

    console.log("📝 Filas detectadas:", sortedRows.length);
    console.log("📝 Usando letras:", useLetters);

    // Segunda pasada: crear asientos con posiciones corregidas
    let seatsCreatedInSecondPass = 0;
    jsonData.forEach((row: unknown, rowIndex: number) => {
      if (Array.isArray(row)) {
        // Obtener la letra de fila para esta fila (si existe)
        const currentRowLetter = rowLettersMap.get(rowIndex) || "";

        row.forEach((cell: unknown, colIndex: number) => {
          if (cell && (typeof cell === "string" || typeof cell === "number")) {
            const cellStr = cell.toString().trim();

            // Detectar patrón con letra + número (formato A1)
            const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
            // Detectar solo números
            const numberOnlyMatch = cellStr.match(/^\d+$/);
            // Detectar si es una letra sola (ignorar para asientos)
            const letterOnlyMatch = cellStr.match(/^[A-Z]+$/);

            if (letterNumberMatch && useLetters) {
              // Formato A1, B23, etc.
              const rowLetter = letterNumberMatch[1];
              const seatNumber = parseInt(letterNumberMatch[2]);

              // Calcular posición Y basada en el orden de las filas
              const rowIndexInOrder = sortedRows.indexOf(rowLetter);
              const y = config.baseY + rowIndexInOrder * config.rowSpacing;

              // Calcular posición X basada en la columna en el Excel
              const x = config.baseX + colIndex * config.seatSpacing;

              // Determinar sección basada en la letra de fila
              let section = "General";
              if (config.autoDetectSections) {
                const letterCode = rowLetter.charCodeAt(0);
                if (letterCode >= "T".charCodeAt(0)) {
                  section = "Platea Alta";
                } else if (letterCode >= "K".charCodeAt(0)) {
                  section = "Platea Media";
                } else {
                  section = "Platea Baja";
                }
              }

              seats.push({
                rowLetter,
                seatNumber,
                x,
                y,
                section,
                status: "available",
              });
              seatsCreatedInSecondPass++;
              if (seatsCreatedInSecondPass <= 3) {
                console.log(
                  `  ✅ Asiento A1 creado: ${rowLetter}-${seatNumber}`
                );
              }
            } else if (numberOnlyMatch && !letterOnlyMatch) {
              // Es un número de asiento
              const seatNumber = parseInt(numberOnlyMatch[0]);

              if (useLetters && currentRowLetter) {
                // Tenemos letras de fila separadas - formato: fila Z tiene asientos 683, 682, etc.
                const rowLetter = currentRowLetter;

                // Calcular posición Y basada en el orden de las filas
                const rowIndexInOrder = sortedRows.indexOf(rowLetter);
                const y = config.baseY + rowIndexInOrder * config.rowSpacing;

                // Calcular posición X basada en la columna en el Excel
                const x = config.baseX + colIndex * config.seatSpacing;

                // Determinar sección basada en la letra de fila
                let section = "General";
                if (config.autoDetectSections) {
                  // Para letras como Z, ZZ, Y, etc.
                  if (rowLetter.length > 1 || rowLetter >= "T") {
                    section = "Platea Alta";
                  } else if (rowLetter >= "K") {
                    section = "Platea Media";
                  } else {
                    section = "Platea Baja";
                  }
                }

                seats.push({
                  rowLetter,
                  seatNumber,
                  x,
                  y,
                  section,
                  status: "available",
                });
                seatsCreatedInSecondPass++;
                if (seatsCreatedInSecondPass <= 3) {
                  console.log(
                    `  ✅ Asiento separado creado: ${rowLetter}-${seatNumber}`
                  );
                }
              } else if (!useLetters) {
                // Solo números sin letras de fila
                const rowKey = `ROW_${rowIndex}`;

                // Solo números - usar exactamente la misma lógica que letras+números pero sin letras
                const seatNumber = parseInt(numberOnlyMatch[0]);

                // Calcular posición Y basada en el orden de las filas (igual que con letras)
                const rowIndexInOrder = sortedRows.indexOf(rowKey);
                const y = config.baseY + rowIndexInOrder * config.rowSpacing;

                // Calcular posición X basada en la columna en el Excel (igual que con letras)
                const x = config.baseX + colIndex * config.seatSpacing;

                // Para asientos sin letras, usar sección genérica o basada en posición
                let section = "General";
                if (config.autoDetectSections) {
                  // Dividir en secciones basadas en la posición Y
                  if (rowIndexInOrder < sortedRows.length / 3) {
                    section = "Sección A";
                  } else if (rowIndexInOrder < (2 * sortedRows.length) / 3) {
                    section = "Sección B";
                  } else {
                    section = "Sección C";
                  }
                }

                seats.push({
                  rowLetter: "", // Sin letra de fila para modo solo números
                  seatNumber, // Usar solo el número real del Excel (683, 682, etc.)
                  x,
                  y,
                  section,
                  status: "available",
                });
                seatsCreatedInSecondPass++;
                if (seatsCreatedInSecondPass <= 3) {
                  console.log(
                    `  ✅ Asiento numérico creado: ${seatNumber} (fila ${
                      rowIndexInOrder + 1
                    })`
                  );
                }
              }
            }
          }
        });
      }
    });

    console.log(
      `📊 Total asientos creados en segunda pasada: ${seatsCreatedInSecondPass}`
    );

    console.log("🏁 Total asientos creados:", seats.length);
    console.log("🏁 Primeros 3 asientos:", seats.slice(0, 3));
    return seats;
  };

  const createSeatShape = (seat: SeatData): any => {
    // Usar la configuración del plano existente si está disponible
    const seatWidth = currentGridConfig?.seatSize
      ? currentGridConfig.seatSize * 20
      : config.seatWidth;
    const seatHeight = currentGridConfig?.seatSize
      ? currentGridConfig.seatSize * 20
      : config.seatHeight;

    return {
      id: generateShapeId(),
      type: "seat",
      x: seat.x,
      y: seat.y,
      width: seatWidth,
      height: seatHeight,
      fill: "#3B82F6",
      stroke: "#1E40AF",
      strokeWidth: 2,
      rotation: 0,
      draggable: true,
      selected: false,
      seatStatus: seat.status,
      seatNumber: `${seat.rowLetter}${seat.seatNumber}`,
      seatSection: seat.section,
      seatPrice: 50, // Precio por defecto
    };
  };

  const createSectionLabel = (sectionName: string, x: number, y: number) => {
    return {
      id: generateShapeId(),
      type: "text",
      x,
      y,
      width: sectionName.length * 8,
      height: 20,
      fill: "#ffffff",
      stroke: "#ffffff",
      strokeWidth: 2,
      rotation: 0,
      draggable: true,
      selected: false,
      text: sectionName,
      fontSize: 14,
      fontFamily: "Arial",
    };
  };

  const createSectionRectangle = (
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    return {
      id: generateShapeId(),
      type: "rectangle",
      x,
      y,
      width,
      height,
      fill: "#3B82F6",
      stroke: "#1E40AF",
      strokeWidth: 2,
      rotation: 0,
      draggable: true,
      selected: false,
    };
  };

  const createTheaterTitle = (title: string) => {
    return {
      id: generateShapeId(),
      type: "text",
      x: config.baseX,
      y: config.baseY - 30,
      width: title.length * 10,
      height: 25,
      fill: "#000000",
      stroke: "#000000",
      strokeWidth: 1,
      rotation: 0,
      draggable: true,
      selected: false,
      text: title,
      fontSize: 18,
      fontFamily: "Arial",
      fontWeight: "bold",
    };
  };

  const convertExcelToJson = (file: File) => {
    setIsConverting(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a array de arrays para procesamiento
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log("📊 Datos del Excel:", jsonData);

        // Buscar el título del teatro
        let theaterTitle = "Teatro";
        jsonData.forEach((row: unknown) => {
          if (Array.isArray(row)) {
            row.forEach((cell: unknown) => {
              if (cell && typeof cell === "string" && cell.includes("TEATRO")) {
                theaterTitle = cell;
              }
            });
          }
        });

        // Detectar asientos automáticamente
        console.log("🔍 Datos JSON del Excel:", jsonData.slice(0, 5)); // Mostrar primeras 5 filas
        const detectedSeats = detectSeatsFromExcel(jsonData);
        console.log("🪑 Asientos detectados:", detectedSeats.length);

        if (detectedSeats.length === 0) {
          alert(
            "❌ No se detectaron asientos en el archivo. Verifica que el Excel contenga asientos con formato como 'A1', 'B2', números solos '1', '23', o letras separadas como 'Z' con números '683', '682'."
          );
          setIsConverting(false);
          return;
        }

        console.log(`✅ Detectados ${detectedSeats.length} asientos`);

        // Agrupar asientos por sección
        const sections = new Map<string, SeatData[]>();
        detectedSeats.forEach((seat) => {
          if (!sections.has(seat.section)) {
            sections.set(seat.section, []);
          }
          sections.get(seat.section)!.push(seat);
        });

        const shapes: any[] = [];

        // Agregar título del teatro
        shapes.push(createTheaterTitle(theaterTitle));

        // Procesar cada sección
        sections.forEach((sectionSeats, sectionName) => {
          console.log(
            `🎭 Procesando sección: ${sectionName} (${sectionSeats.length} asientos)`
          );

          // Crear asientos para esta sección
          sectionSeats.forEach((seat) => {
            const seatShape = createSeatShape(seat);
            shapes.push(seatShape);
          });

          // Crear etiqueta de sección si hay suficientes asientos
          if (sectionSeats.length > 5) {
            const minX = Math.min(...sectionSeats.map((s) => s.x));
            const minY = Math.min(...sectionSeats.map((s) => s.y));
            const sectionLabel = createSectionLabel(
              sectionName,
              minX,
              minY - 20
            );
            shapes.push(sectionLabel);
          }
        });

        // Crear el objeto JSON final
        const jsonResult = {
          shapes,
          gridConfig: currentGridConfig || {
            enabled: true,
            size: 20,
            color: "#E5E7EB",
            opacity: 0.5,
            snapToGrid: false,
            seatSize: 1,
          },
        };

        console.log("✅ JSON generado:", jsonResult);
        console.log(`📊 Total de shapes: ${shapes.length}`);
        console.log(`💺 Total de asientos: ${detectedSeats.length}`);
        console.log(
          `🏷️ Secciones detectadas: ${Array.from(sections.keys()).join(", ")}`
        );

        onConversionComplete(jsonResult);
        setIsConverting(false);
      } catch (error) {
        console.error("❌ Error al convertir Excel:", error);
        alert("❌ Error al procesar el archivo Excel. Verifica el formato.");
        setIsConverting(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel" ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".xls")
      ) {
        convertExcelToJson(file);
      } else {
        alert("❌ Por favor selecciona un archivo Excel (.xlsx o .xls)");
      }
    }
  };

  const handleConfigChange = (field: keyof ConversionConfig, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🎭 Convertidor Excel a JSON - Modo Inteligente
      </h2>

      {/* Configuración */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          ⚙️ Configuración de Posicionamiento
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Posición X Base
            </label>
            <input
              type="number"
              value={config.baseX}
              onChange={(e) =>
                handleConfigChange("baseX", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Posición Y Base
            </label>
            <input
              type="number"
              value={config.baseY}
              onChange={(e) =>
                handleConfigChange("baseY", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Espaciado entre Asientos
            </label>
            <input
              type="number"
              value={config.seatSpacing}
              onChange={(e) =>
                handleConfigChange("seatSpacing", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Espaciado entre Filas
            </label>
            <input
              type="number"
              value={config.rowSpacing}
              onChange={(e) =>
                handleConfigChange("rowSpacing", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Ancho del Asiento
            </label>
            <input
              type="number"
              value={config.seatWidth}
              onChange={(e) =>
                handleConfigChange("seatWidth", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Alto del Asiento
            </label>
            <input
              type="number"
              value={config.seatHeight}
              onChange={(e) =>
                handleConfigChange("seatHeight", parseInt(e.target.value))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Configuración de secciones */}
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.autoDetectSections}
              onChange={(e) =>
                handleConfigChange("autoDetectSections", e.target.checked)
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Detectar secciones automáticamente (T-K: Platea Alta, K-A: Platea
              Media, A-: Platea Baja)
            </span>
          </label>
        </div>
      </div>

      {/* Subida de archivo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          📁 Subir Archivo Excel
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isConverting}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>📊 Seleccionar Excel</>
            )}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Formatos soportados: .xlsx, .xls
          </p>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">
          🧠 Modo Inteligente - Detección Automática
        </h4>
        <p className="text-sm text-blue-700 mb-2">
          Este convertidor detecta automáticamente:
        </p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • <strong>Asientos:</strong> Busca patrones como "A1", "T20", "B15"
          </li>
          <li>
            • <strong>Secciones:</strong> Crea secciones basadas en la letra de
            fila
          </li>
          <li>
            • <strong>Título:</strong> Detecta el nombre del teatro
            automáticamente
          </li>
          <li>
            • <strong>Posicionamiento:</strong> Usa la posición en el Excel para
            ubicar asientos
          </li>
          <li>
            • <strong>Configuración:</strong> Respeta la configuración actual
            del plano (cuadrícula, tamaño de asientos)
          </li>
        </ul>
        <p className="text-sm text-blue-700 mt-2">
          <strong>💡 No necesitas formato específico.</strong> Solo sube tu
          Excel y el sistema hará el resto.
        </p>
        {currentGridConfig && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-xs text-green-700">
              <strong>✅ Usando configuración actual:</strong> Tamaño de
              asiento: {currentGridConfig.seatSize}, Cuadrícula:{" "}
              {currentGridConfig.size}px
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelToJsonConverter;
