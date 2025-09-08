# 🎭 Convertidor de Excel a JSON para Planos de Asientos

Este script convierte archivos Excel con datos de asientos a JSON compatible con la aplicación de planos de asientos.

## 📋 Requisitos

```bash
pip install pandas openpyxl
```

## 📊 Formato del Excel

Tu archivo Excel debe tener las siguientes columnas:

| Columna   | Descripción          | Ejemplo                |
| --------- | -------------------- | ---------------------- |
| `Fila`    | Letra de la fila     | A, B, C, D...          |
| `Asiento` | Número del asiento   | 1, 2, 3, 4...          |
| `Seccion` | Nombre de la sección | Galeria, PALCO, VIP... |
| `Precio`  | Precio del asiento   | 50, 75, 100...         |

### Ejemplo de estructura:

```
Fila,Asiento,Seccion,Precio
A,1,Galeria,50
A,2,Galeria,50
A,3,Galeria,50
B,1,Galeria,50
B,2,Galeria,50
A,1,PALCO,75
A,2,PALCO,75
A,1,VIP,100
A,2,VIP,100
```

## 🚀 Uso Básico

```bash
python excel_to_json_converter.py tu_archivo.xlsx
```

## ⚙️ Opciones Avanzadas

```bash
python excel_to_json_converter.py tu_archivo.xlsx \
  --output teatro_convertido.json \
  --base-x 100 \
  --base-y 40 \
  --seat-spacing 25 \
  --row-spacing 20 \
  --seat-width 20 \
  --seat-height 20
```

## 📝 Parámetros Disponibles

| Parámetro        | Descripción              | Valor por defecto               |
| ---------------- | ------------------------ | ------------------------------- |
| `--base-x`       | Posición X inicial       | 100                             |
| `--base-y`       | Posición Y inicial       | 40                              |
| `--seat-spacing` | Espaciado entre asientos | 25                              |
| `--row-spacing`  | Espaciado entre filas    | 20                              |
| `--seat-width`   | Ancho del asiento        | 20                              |
| `--seat-height`  | Alto del asiento         | 20                              |
| `-o, --output`   | Archivo JSON de salida   | `[nombre_excel]_converted.json` |

## 🎯 Ejemplos de Uso

### 1. Conversión básica

```bash
python excel_to_json_converter.py teatro_juarez.xlsx
```

### 2. Con archivo de salida personalizado

```bash
python excel_to_json_converter.py teatro_juarez.xlsx -o mi_teatro.json
```

### 3. Con espaciado personalizado

```bash
python excel_to_json_converter.py teatro_juarez.xlsx \
  --seat-spacing 30 \
  --row-spacing 25 \
  --seat-width 25 \
  --seat-height 25
```

### 4. Para teatros grandes con más espacio

```bash
python excel_to_json_converter.py teatro_grande.xlsx \
  --base-x 200 \
  --base-y 80 \
  --seat-spacing 35 \
  --row-spacing 30
```

## 📁 Archivos Generados

El script genera un archivo JSON con la siguiente estructura:

```json
{
  "shapes": [
    {
      "id": "shape_1234567890_abc123",
      "type": "seat",
      "x": 100,
      "y": 40,
      "width": 20,
      "height": 20,
      "fill": "#3B82F6",
      "stroke": "#1E40AF",
      "strokeWidth": 2,
      "rotation": 0,
      "draggable": true,
      "selected": false,
      "seatStatus": "available",
      "seatNumber": "A1",
      "seatSection": "Galeria",
      "seatPrice": 50
    }
  ],
  "gridConfig": {
    "enabled": true,
    "size": 40,
    "color": "#E5E7EB",
    "opacity": 0.5,
    "snapToGrid": false,
    "seatSize": 1
  }
}
```

## 🔧 Características del Script

- ✅ **Generación automática de IDs únicos**
- ✅ **Posicionamiento automático de asientos**
- ✅ **Creación de etiquetas de sección**
- ✅ **Creación de rectángulos de fondo**
- ✅ **Configuración de grid automática**
- ✅ **Manejo de errores robusto**
- ✅ **Logs detallados del proceso**

## 🎭 Cómo Cargar en la Aplicación

1. **Ejecuta el script** con tu archivo Excel
2. **Copia el JSON generado** a la carpeta `public/` de tu aplicación
3. **Carga el plano** desde la aplicación usando "Cargar Plano"
4. **Selecciona el archivo JSON** generado

## 🐛 Solución de Problemas

### Error: "No module named 'pandas'"

```bash
pip install pandas openpyxl
```

### Error: "Columnas no encontradas"

Asegúrate de que tu Excel tenga las columnas: `Fila`, `Asiento`, `Seccion`, `Precio`

### Error: "Archivo no encontrado"

Verifica que la ruta al archivo Excel sea correcta

### Asientos mal posicionados

Ajusta los parámetros `--seat-spacing` y `--row-spacing` según el tamaño de tu teatro

## 📞 Soporte

Si tienes problemas o necesitas ajustes específicos, puedes:

1. **Revisar los logs** que genera el script
2. **Verificar el formato** de tu Excel
3. **Ajustar los parámetros** de posicionamiento
4. **Contactar al desarrollador** con el error específico

## 🎉 ¡Listo!

Una vez que tengas tu JSON, podrás:

- ✅ Cargarlo en la aplicación
- ✅ Editar asientos individualmente
- ✅ Usar selección múltiple
- ✅ Asignar secciones masivamente
- ✅ Enumerar asientos automáticamente
