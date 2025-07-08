import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // Configuración para manejar módulos de Konva
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;
