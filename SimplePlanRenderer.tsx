"use client";

import { Stage, Layer } from "react-konva";
import SimpleTextRenderer from "./SimpleTextRenderer";
import SimpleRectangleRenderer from "./SimpleRectangleRenderer";
import SimpleCircleRenderer from "./SimpleCircleRenderer";
import SimpleStadiumRenderer from "./SimpleStadiumRenderer";
import { SimplePlanData, CanvasConfig } from "./types";

interface SimplePlanRendererProps {
  data: SimplePlanData;
  config: CanvasConfig;
}

export default function SimplePlanRenderer({
  data,
  config,
}: SimplePlanRendererProps) {
  return (
    <div className="w-full h-full">
      <Stage width={config.width} height={config.height}>
        <Layer>
          {/* Fondo del canvas */}
          {config.backgroundColor && (
            <SimpleRectangleRenderer
              x={0}
              y={0}
              width={config.width}
              height={config.height}
              fill={config.backgroundColor}
              stroke="transparent"
              strokeWidth={0}
            />
          )}

          {/* Renderizar todos los rectángulos */}
          {data.rectangles.map((rectangle, index) => (
            <SimpleRectangleRenderer key={`rect-${index}`} {...rectangle} />
          ))}

          {/* Renderizar todos los círculos */}
          {data.circles?.map((circle, index) => (
            <SimpleCircleRenderer key={`circle-${index}`} {...circle} />
          ))}

          {/* Renderizar todos los estadios */}
          {data.stadiums?.map((stadium, index) => (
            <SimpleStadiumRenderer key={`stadium-${index}`} {...stadium} />
          ))}

          {/* Renderizar todos los textos */}
          {data.texts.map((text, index) => (
            <SimpleTextRenderer key={`text-${index}`} {...text} />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
