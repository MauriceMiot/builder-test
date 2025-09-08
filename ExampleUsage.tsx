"use client";

import { Stage, Layer } from "react-konva";
import SimpleTextRenderer from "./SimpleTextRenderer";
import SimpleRectangleRenderer from "./SimpleRectangleRenderer";

export default function ExampleUsage() {
  return (
    <div className="w-full h-full">
      <Stage width={800} height={600}>
        <Layer>
          {/* Ejemplo de rectángulos */}
          <SimpleRectangleRenderer
            x={50}
            y={50}
            width={200}
            height={150}
            fill="#3B82F6"
            stroke="#1E40AF"
            strokeWidth={2}
          />

          <SimpleRectangleRenderer
            x={300}
            y={100}
            width={100}
            height={100}
            fill="#10B981"
            stroke="#059669"
            strokeWidth={2}
            cornerRadius={10}
          />

          {/* Ejemplo de textos */}
          <SimpleTextRenderer
            x={50}
            y={220}
            text="Texto de ejemplo"
            fontSize={16}
            fontFamily="Arial"
            fill="#000000"
          />

          <SimpleTextRenderer
            x={300}
            y={220}
            text="Texto centrado"
            fontSize={18}
            fontFamily="Arial"
            fill="#1E40AF"
            align="center"
            fontStyle="bold"
          />

          <SimpleTextRenderer
            x={500}
            y={220}
            text="Texto con borde"
            fontSize={20}
            fontFamily="Arial"
            fill="#EF4444"
            stroke="#DC2626"
            strokeWidth={1}
          />
        </Layer>
      </Stage>
    </div>
  );
}
