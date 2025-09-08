# Builder Test - Editor de Planos

Una aplicación web para crear y editar planos con diferentes herramientas de dibujo.

## Funcionalidades

### Herramientas de Dibujo

- **Rectángulo**: Dibuja rectángulos arrastrando el mouse
- **Círculo**: Dibuja círculos arrastrando el mouse
- **Óvalo**: Dibuja óvalos arrastrando el mouse
- **Triángulo**: Dibuja triángulos arrastrando el mouse
- **Estadio**: Dibuja formas de estadio arrastrando el mouse
- **Polígono Regular**: Dibuja polígonos regulares con configurable número de lados
- **Polígono Irregular**: Dibuja polígonos irregulares haciendo clic en los vértices
- **Texto**: Agrega texto al plano
- **Dibujo Libre**: Dibuja libremente con el mouse

### Sistema de Asientos

- **Asiento**: Crea asientos con un solo clic en cualquier lugar del plano

  - Selecciona la herramienta "Asiento" (💺) en la barra de herramientas
  - Haz clic en cualquier lugar del plano para crear un asiento
  - Los asientos se ajustan automáticamente al tamaño de la cuadrícula configurada
  - El tamaño del asiento se calcula como: `seatSize² * gridSize` píxeles
  - Los asientos siempre se alinean perfectamente con la cuadrícula
  - El sistema valida automáticamente que no haya conflictos de posición
  - Se muestra feedback visual cuando se crea un asiento exitosamente

- **Enumeración Rápida**: Sistema inteligente para numerar asientos por filas
  - Botón 🔢 en la barra de herramientas
  - Selecciona una fila y configura el patrón de numeración
  - Patrones disponibles: Secuencial, De 2 en 2, Personalizado
  - Dirección configurable: Izquierda→Derecha o Derecha→Izquierda
  - Vista previa antes de aplicar
  - Numeración automática de toda la fila de una vez

### Selección y Manipulación

- **Selección Simple**: Haz clic en cualquier elemento para seleccionarlo
- **Selección Múltiple**: Mantén Ctrl/Cmd y haz clic para seleccionar múltiples elementos
- **Selección por Área**: Usa la herramienta de selección para seleccionar elementos en un área
- **Eliminación Múltiple**: Selecciona varios elementos y presiona Delete o Backspace para eliminarlos todos
- **Movimiento Grupal**: Selecciona múltiples asientos y usa las flechas del teclado para moverlos juntos

### Configuración de Cuadrícula

- Activar/desactivar cuadrícula
- Configurar tamaño de cuadrícula
- Configurar color y opacidad
- Activar/desactivar snap to grid
- Configurar tamaño de asientos

### Sistema de Zoom

- Zoom in/out con botones o rueda del mouse
- Todas las operaciones funcionan correctamente con cualquier nivel de zoom
- Selección por área, pegado y dibujo se ajustan automáticamente al zoom
- Coordenadas precisas independientemente del nivel de zoom

### Gestión de Planos

- Crear nuevos planos
- Guardar planos con nombre
- Cargar planos guardados
- Exportar/importar planos en formato JSON
- Sistema de historial con Undo/Redo (hasta 50 acciones)

## Instalación

```bash
npm install
npm run dev
```

## Uso

1. **Seleccionar herramienta**: Haz clic en una herramienta en la barra lateral izquierda
2. **Dibujar**: Para la mayoría de herramientas, arrastra el mouse en el canvas
3. **Crear asientos**: Selecciona la herramienta asiento y haz clic donde quieras colocarlo
4. **Enumerar asientos rápidamente**: Usa el botón 🔢 para numerar filas completas
5. **Seleccionar múltiples elementos**: Mantén Ctrl/Cmd y haz clic en los elementos
6. **Eliminar múltiples elementos**: Selecciona varios elementos y presiona Delete
7. **Deshacer/Rehacer**: Usa Ctrl+Z para deshacer y Ctrl+Y para rehacer acciones
8. **Editar**: Selecciona una forma para editarla en el panel de propiedades
9. **Guardar**: Usa el botón "Guardar Plano" para guardar tu trabajo

## Atajos de Teclado

- **Ctrl/Cmd + Z**: Deshacer última acción
- **Ctrl/Cmd + Y**: Rehacer acción deshecha
- **Delete/Backspace**: Eliminar elemento(s) seleccionado(s)
- **Ctrl/Cmd + C**: Copiar elementos seleccionados
- **Ctrl/Cmd + V**: Pegar elementos copiados
- **Ctrl/Cmd + Shift + ↑**: Traer elemento al frente
- **Ctrl/Cmd + Shift + ↓**: Enviar elemento atrás
- **Flechas**: Mover elementos seleccionados (para asientos)
- **Enter**: Finalizar polígono irregular
- **Escape**: Cancelar operación actual

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Konva.js (para el canvas)
- Zustand (para el estado)
- Tailwind CSS (para los estilos)
