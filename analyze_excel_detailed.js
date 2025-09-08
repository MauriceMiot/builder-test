const XLSX = require("xlsx");
const fs = require("fs");

// Leer el archivo Excel
const workbook = XLSX.readFile("public/TEATROS (1) (1) (2).xlsx");
console.log("📊 Hojas disponibles:", workbook.SheetNames);

// Analizar la primera hoja
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

console.log("\n📋 Analizando hoja:", firstSheetName);

// Convertir a JSON para análisis
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

console.log("\n📊 Primeras 10 filas del Excel:");
jsonData.slice(0, 10).forEach((row, index) => {
  console.log(`Fila ${index}:`, row);
});

console.log("\n🔍 Análisis detallado de celdas:");
let seatPatterns = {
  letterNumber: [],
  numberOnly: [],
  other: [],
};

jsonData.forEach((row, rowIndex) => {
  if (Array.isArray(row)) {
    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === "string") {
        const cellStr = cell.toString().trim();

        // Detectar patrón letra + número
        const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
        // Detectar solo números
        const numberOnlyMatch = cellStr.match(/^\d+$/);
        // Detectar otros patrones posibles
        const mixedMatch = cellStr.match(/^(\d+)([A-Z])$/); // Número + letra
        const spaceMatch = cellStr.match(/^([A-Z])\s+(\d+)$/); // Letra espacio número

        if (letterNumberMatch) {
          seatPatterns.letterNumber.push({
            cell: cellStr,
            row: rowIndex,
            col: colIndex,
            letter: letterNumberMatch[1],
            number: letterNumberMatch[2],
          });
        } else if (numberOnlyMatch) {
          seatPatterns.numberOnly.push({
            cell: cellStr,
            row: rowIndex,
            col: colIndex,
            number: numberOnlyMatch[0],
          });
        } else if (mixedMatch) {
          seatPatterns.other.push({
            cell: cellStr,
            row: rowIndex,
            col: colIndex,
            type: "number+letter",
            pattern: mixedMatch[0],
          });
        } else if (spaceMatch) {
          seatPatterns.other.push({
            cell: cellStr,
            row: rowIndex,
            col: colIndex,
            type: "letter space number",
            pattern: spaceMatch[0],
          });
        } else if (cellStr.length > 0 && cellStr !== "undefined") {
          seatPatterns.other.push({
            cell: cellStr,
            row: rowIndex,
            col: colIndex,
            type: "unknown",
            pattern: cellStr,
          });
        }
      }
    });
  }
});

console.log("\n📈 Resumen de patrones encontrados:");
console.log(
  "Letra+Número (A1):",
  seatPatterns.letterNumber.length,
  "ejemplos:",
  seatPatterns.letterNumber.slice(0, 5)
);
console.log(
  "Solo Números (1):",
  seatPatterns.numberOnly.length,
  "ejemplos:",
  seatPatterns.numberOnly.slice(0, 5)
);
console.log(
  "Otros patrones:",
  seatPatterns.other.length,
  "ejemplos:",
  seatPatterns.other.slice(0, 10)
);

// Buscar títulos o encabezados
console.log("\n🏷️ Posibles títulos encontrados:");
jsonData.slice(0, 5).forEach((row, index) => {
  if (Array.isArray(row)) {
    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === "string" && cell.length > 10) {
        console.log(`Fila ${index}, Col ${colIndex}:`, cell);
      }
    });
  }
});
