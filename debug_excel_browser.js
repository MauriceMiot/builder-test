const XLSX = require("xlsx");

// Leer el archivo Excel igual que en el navegador
const workbook = XLSX.readFile("public/TEATROS (1) (1) (2).xlsx");
const firstSheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[firstSheetName];

// Usar los mismos parámetros que usa el componente React
const jsonData = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  raw: false,
  defval: undefined,
});

console.log("📊 Primeras 10 filas (simulando React):");
jsonData.slice(0, 10).forEach((row, index) => {
  console.log(`Fila ${index}:`, row);
});

// Verificar si hay diferencias en el procesamiento
console.log("\n🔍 Verificando tipos de datos:");
let totalCells = 0;
let stringCells = 0;
let numberCells = 0;
let undefinedCells = 0;

jsonData.slice(0, 40).forEach((row, rowIndex) => {
  if (Array.isArray(row)) {
    row.forEach((cell, colIndex) => {
      totalCells++;
      if (cell === undefined || cell === null) {
        undefinedCells++;
      } else if (typeof cell === "string") {
        stringCells++;
        if (rowIndex < 10) {
          console.log(`String en fila ${rowIndex}, col ${colIndex}: "${cell}"`);
        }
      } else if (typeof cell === "number") {
        numberCells++;
        if (rowIndex < 10) {
          console.log(`Number en fila ${rowIndex}, col ${colIndex}: ${cell}`);
        }
      }
    });
  }
});

console.log(`\n📈 Estadísticas de celdas (primeras 40 filas):`);
console.log(`Total: ${totalCells}`);
console.log(`Strings: ${stringCells}`);
console.log(`Numbers: ${numberCells}`);
console.log(`Undefined/null: ${undefinedCells}`);

// Simular exactamente la lógica del componente React
console.log("\n🎯 Simulando detección React...");

const rowMap = new Map();
const hasLetters = new Set();
const rowLettersMap = new Map();

jsonData.forEach((row, rowIndex) => {
  if (Array.isArray(row)) {
    let rowLetter = "";

    row.forEach((cell, colIndex) => {
      if (cell && typeof cell === "string") {
        const cellStr = cell.toString().trim();

        const letterNumberMatch = cellStr.match(/^([A-Z])(\d+)$/);
        const numberOnlyMatch = cellStr.match(/^\d+$/);
        const letterOnlyMatch = cellStr.match(/^[A-Z]+$/);

        if (letterNumberMatch) {
          const letter = letterNumberMatch[1];
          hasLetters.add(letter);
          if (!rowMap.has(letter)) {
            rowMap.set(letter, rowIndex);
          }
        } else if (letterOnlyMatch && cellStr.length <= 3) {
          rowLetter = cellStr;
          hasLetters.add(cellStr);
        } else if (numberOnlyMatch) {
          const rowKey = `ROW_${rowIndex}`;
          if (!rowMap.has(rowKey)) {
            rowMap.set(rowKey, rowIndex);
          }
        }
      }
    });

    if (rowLetter) {
      rowLettersMap.set(rowIndex, rowLetter);
      if (!rowMap.has(rowLetter)) {
        rowMap.set(rowLetter, rowIndex);
      }
    }
  }
});

console.log("hasLetters size:", hasLetters.size);
console.log("hasLetters:", Array.from(hasLetters));
console.log("rowLettersMap size:", rowLettersMap.size);
console.log("useLetters would be:", hasLetters.size > 0);
