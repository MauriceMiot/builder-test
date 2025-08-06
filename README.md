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

### Configuración de Cuadrícula

- Activar/desactivar cuadrícula
- Configurar tamaño de cuadrícula
- Configurar color y opacidad
- Activar/desactivar snap to grid
- Configurar tamaño de asientos

### Gestión de Planos

- Crear nuevos planos
- Guardar planos con nombre
- Cargar planos guardados
- Exportar/importar planos en formato JSON

## Instalación

```bash
npm install
npm run dev
```

## Uso

1. **Seleccionar herramienta**: Haz clic en una herramienta en la barra lateral izquierda
2. **Dibujar**: Para la mayoría de herramientas, arrastra el mouse en el canvas
3. **Crear asientos**: Selecciona la herramienta asiento y haz clic donde quieras colocarlo
4. **Editar**: Selecciona una forma para editarla en el panel de propiedades
5. **Guardar**: Usa el botón "Guardar Plano" para guardar tu trabajo

## Tecnologías

- Next.js 14
- React 18
- TypeScript
- Konva.js (para el canvas)
- Zustand (para el estado)
- Tailwind CSS (para los estilos)
