const XLSX = require("xlsx");

// Leer el archivo Excel
const workbook = XLSX.readFile("public/TEATROS (1) (1) (2).xlsx");
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];
const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

console.log("🔍 Simulando la lógica de detección...\n");

const rowMap = new Map();
const hasLetters = new Set();
const rowLettersMap = new Map();

// Primera pasada: detectar todas las filas y sus posiciones
jsonData.forEach((row, rowIndex) => {
  if (Array.isArray(row)) {
    let rowLetter = "";

    console.log(`Fila ${rowIndex}:`, row.slice(0, 10)); // Solo mostrar primeras 10 celdas

    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === "string") {
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
          console.log(
            `  📍 Encontrado letra+número: ${cellStr} (letra: ${letter})`
          );
        } else if (letterOnlyMatch && cellStr.length <= 3) {
          // Esta es probablemente una letra de fila
          rowLetter = cellStr;
          hasLetters.add(cellStr);
          console.log(`  📍 Encontrada letra de fila: ${cellStr}`);
        } else if (numberOnlyMatch) {
          // Para asientos sin letra, usar el índice de fila como identificador
          const rowKey = `ROW_${rowIndex}`;
          if (!rowMap.has(rowKey)) {
            rowMap.set(rowKey, rowIndex);
          }
          console.log(`  📍 Encontrado número: ${cellStr}`);
        }
      }
    });

    // Si encontramos una letra de fila, mapearla
    if (rowLetter) {
      rowLettersMap.set(rowIndex, rowLetter);
      if (!rowMap.has(rowLetter)) {
        rowMap.set(rowLetter, rowIndex);
      }
      console.log(`  ✅ Mapeada fila ${rowIndex} -> letra: ${rowLetter}`);
    }
  }
});

console.log("\n📊 Resultados de detección:");
console.log("hasLetters:", Array.from(hasLetters));
console.log("rowMap:", Array.from(rowMap.entries()));
console.log("rowLettersMap:", Array.from(rowLettersMap.entries()));

const useLetters = hasLetters.size > 0;
console.log("useLetters:", useLetters);

// Contar asientos potenciales
let seatCount = 0;
jsonData.forEach((row, rowIndex) => {
  if (Array.isArray(row)) {
    const currentRowLetter = rowLettersMap.get(rowIndex) || "";

    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === "string") {
        const cellStr = cell.toString().trim();
        const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
        const numberOnlyMatch = cellStr.match(/^\d+$/);
        const letterOnlyMatch = cellStr.match(/^[A-Z]+$/);

        if (letterNumberMatch && useLetters) {
          seatCount++;
        } else if (numberOnlyMatch && !letterOnlyMatch) {
          if (useLetters && currentRowLetter) {
            seatCount++;
          } else if (!useLetters) {
            seatCount++;
          }
        }
      }
    });
  }
});

console.log(`\n🪑 Total de asientos que se detectarían: ${seatCount}`);
