# 🎭 Convertidor Excel a JSON - Integrado en Next.js

Este convertidor está integrado directamente en tu aplicación Next.js y permite convertir archivos Excel con datos de asientos a JSON compatible con el sistema de planos.

## 🚀 Cómo Usar

### 1. **Acceder al Convertidor**

- Ve al **Editor de Planos**
- Haz clic en el botón **"📊 Excel a JSON"** en la barra superior

### 2. **Preparar tu Excel**

Tu archivo Excel debe tener estas columnas:

| Columna   | Descripción          | Ejemplo                |
| --------- | -------------------- | ---------------------- |
| `Fila`    | Letra de la fila     | A, B, C, D...          |
| `Asiento` | Número del asiento   | 1, 2, 3, 4...          |
| `Seccion` | Nombre de la sección | Galeria, PALCO, VIP... |
| `Precio`  | Precio del asiento   | 50, 75, 100...         |

### 3. **Configurar Posicionamiento**

Antes de subir tu Excel, puedes ajustar:

- **Posición X Base**: Posición inicial horizontal (por defecto: 100)
- **Posición Y Base**: Posición inicial vertical (por defecto: 40)
- **Espaciado entre Asientos**: Distancia horizontal entre asientos (por defecto: 25)
- **Espaciado entre Filas**: Distancia vertical entre filas (por defecto: 20)
- **Ancho del Asiento**: Tamaño horizontal del asiento (por defecto: 20)
- **Alto del Asiento**: Tamaño vertical del asiento (por defecto: 20)

### 4. **Subir y Convertir**

- Haz clic en **"📊 Seleccionar Excel"**
- Selecciona tu archivo Excel (.xlsx o .xls)
- El sistema procesará automáticamente tu archivo

### 5. **Resultados**

Después de la conversión verás:

- ✅ **Total de shapes creados**
- ✅ **Total de asientos generados**
- ✅ **Secciones detectadas**

### 6. **Opciones Post-Conversión**

- **🎨 Cargar en el Canvas**: Carga directamente el resultado en el editor
- **💾 Descargar JSON**: Guarda el archivo JSON en tu computadora
- **🔄 Convertir Otro**: Procesa otro archivo Excel

## 📊 Ejemplo de Excel

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

## 🎯 Características

### ✅ **Conversión Automática**

- Lee archivos Excel (.xlsx, .xls)
- Valida el formato de columnas
- Genera IDs únicos para cada asiento
- Posiciona asientos automáticamente

### ✅ **Organización por Secciones**

- Agrupa asientos por sección
- Crea etiquetas de texto para cada sección
- Genera rectángulos de fondo para organizar visualmente

### ✅ **Configuración Flexible**

- Ajusta espaciado y posiciones
- Personaliza tamaños de asientos
- Configuración en tiempo real

### ✅ **Integración Completa**

- Carga directa al canvas
- Descarga de archivos JSON
- Compatible con el sistema de guardado

## 🔧 Configuración Avanzada

### **Para Teatros Pequeños**

```
Posición X Base: 100
Posición Y Base: 40
Espaciado entre Asientos: 20
Espaciado entre Filas: 15
Ancho del Asiento: 18
Alto del Asiento: 18
```

### **Para Teatros Medianos**

```
Posición X Base: 150
Posición Y Base: 60
Espaciado entre Asientos: 25
Espaciado entre Filas: 20
Ancho del Asiento: 20
Alto del Asiento: 20
```

### **Para Teatros Grandes**

```
Posición X Base: 200
Posición Y Base: 80
Espaciado entre Asientos: 30
Espaciado entre Filas: 25
Ancho del Asiento: 25
Alto del Asiento: 25
```

## 🐛 Solución de Problemas

### **Error: "Columnas faltantes"**

- Verifica que tu Excel tenga las columnas: `Fila`, `Asiento`, `Seccion`, `Precio`
- Asegúrate de que los nombres de las columnas estén escritos exactamente así

### **Error: "Error al procesar el archivo"**

- Verifica que el archivo sea un Excel válido (.xlsx o .xls)
- Asegúrate de que no esté corrupto
- Intenta abrir el archivo en Excel y guardarlo de nuevo

### **Asientos mal posicionados**

- Ajusta los parámetros de espaciado
- Verifica que las letras de fila sean consecutivas (A, B, C...)
- Revisa que los números de asiento sean secuenciales

### **Secciones no organizadas**

- Asegúrate de que la columna `Seccion` tenga valores consistentes
- Verifica que no haya espacios extra en los nombres de sección

## 💡 Consejos

### **Preparación del Excel**

1. **Usa la primera hoja** del Excel
2. **Pon los encabezados** en la primera fila
3. **Elimina filas vacías** antes de la conversión
4. **Verifica que los datos** estén completos

### **Optimización de Posicionamiento**

1. **Prueba con pocos asientos** primero
2. **Ajusta el espaciado** según el tamaño de tu teatro
3. **Usa la vista previa** para verificar posiciones
4. **Guarda configuraciones** que funcionen bien

### **Organización de Secciones**

1. **Usa nombres descriptivos** para las secciones
2. **Mantén consistencia** en los nombres
3. **Agrupa asientos lógicamente** por sección
4. **Considera el flujo visual** del teatro

## 🎉 ¡Listo!

Una vez convertido, tu plano estará listo para:

- ✅ **Editar asientos individualmente**
- ✅ **Usar selección múltiple**
- ✅ **Asignar secciones masivamente**
- ✅ **Enumerar asientos automáticamente**
- ✅ **Guardar y cargar el plano**

¡El convertidor hace todo el trabajo pesado por ti!
