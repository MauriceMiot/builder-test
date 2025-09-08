// Tipos para los componentes simplificados de renderizado

export interface SimpleTextProps {
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  fontStyle?: "normal" | "bold" | "italic";
  draggable?: boolean;
}

export interface SimpleRectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  cornerRadius?: number;
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  opacity?: number;
}

export interface SimpleCircleProps {
  x: number; // centro X
  y: number; // centro Y
  radius: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  opacity?: number;
}

export interface SimpleStadiumProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  draggable?: boolean;
  opacity?: number;
}

// Tipo para datos de plano simplificado
export interface SimplePlanData {
  texts: SimpleTextProps[];
  rectangles: SimpleRectangleProps[];
  circles?: SimpleCircleProps[];
  stadiums?: SimpleStadiumProps[];
}

// Tipo para configuración del canvas
export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor?: string;
}
