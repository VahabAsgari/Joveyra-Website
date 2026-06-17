import React, { useEffect, useRef } from "react";

export default function DynamicNoise() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    
    // Render at a small, optimized size to create organic 80s movie film stock grain
    const noiseWidth = 160;
    const noiseHeight = 160;
    canvas.width = noiseWidth;
    canvas.height = noiseHeight;

    const imgData = ctx.createImageData(noiseWidth, noiseHeight);
    const buffer = new Uint32Array(imgData.data.buffer);

    const renderNoise = () => {
      const len = buffer.length;
      for (let i = 0; i < len; i++) {
        // High variation for rich 80s colored film movie grain look
        const val = Math.floor(Math.random() * 255);
        // Pack into 32-bit pixel: Alpha, Blue, Green, Red
        // Soft active noise index
        const alpha = Math.floor(Math.random() * 45) + 20; // soft visible active opacity
        buffer[i] = (alpha << 24) | (val << 16) | (val << 8) | val;
      }

      ctx.putImageData(imgData, 0, 0);
      animId = requestAnimationFrame(renderNoise);
    };

    renderNoise();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50 mix-blend-overlay opacity-90"
      style={{ imageRendering: "pixelated" }}
      id="noise-canvas"
    />
  );
}
