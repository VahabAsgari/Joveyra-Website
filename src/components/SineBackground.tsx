import React, { useEffect, useRef } from "react";

export default function SineBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  
  // Real dimensions for an institutional, wide viewport
  const width = 860;
  const height = 280;

  // Track dynamic regime states for info readout
  const activeRegimeRef = useRef<string>("INTEGRATED_DRIFT");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High density Retina-ready pixel scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Use real physical elapsed time to ensure speed never drops or slows down under scrolling load or frame rate changes.
      // Scaled to match the exact natural timing of 0.35 increment at 60fps (60 * 0.35 / 1000 = 0.021).
      const t = performance.now() * 0.021; 

      // 1. GRID SYSTEM (Subtle background alignment lines)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
      ctx.lineWidth = 0.5;

      const gridSpacingX = 50;
      for (let x = gridSpacingX; x < width; x += gridSpacingX) {
        ctx.beginPath();
        ctx.moveTo(x, 10);
        ctx.lineTo(x, height - 10);
        ctx.stroke();
      }

      const gridSpacingY = 35;
      for (let y = gridSpacingY; y < height; y += gridSpacingY) {
        ctx.beginPath();
        ctx.moveTo(10, y);
        ctx.lineTo(width - 10, y);
        ctx.stroke();
      }

      // Horizontal micro scanlines
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.0);
      }

      // Gradient helper to fade lines out at the margins
      const createStyleGradient = (baseAlpha: number) => {
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        grad.addColorStop(0, "rgba(255, 255, 255, 0)");
        grad.addColorStop(0.12, `rgba(255, 255, 255, ${baseAlpha})`);
        grad.addColorStop(0.88, `rgba(255, 255, 255, ${baseAlpha})`);
        grad.addColorStop(1, "rgba(255, 255, 255, 0)");
        return grad;
      };

      // 2. DIVERGING MULTI-AXIS WAVE MODELING WITH PRONOUNCED DOWNWARD SLOPE & SECTIVE SWEEP INDEX
      // All phase speeds are positive (+), ensuring consistent left-to-right drift.
      // Every wave has a custom, low-frequency bendFactor representing its tendency to transition 
      // into a curved downward-sloping shape at the end. These sways are completely decoupled.

      const bendFactor1 = 0.5 + 0.5 * Math.sin(t * 0.008 + 0.5);
      const bendFactor2 = 0.5 + 0.5 * Math.sin(t * 0.006 + 2.1);
      const bendFactor3 = 0.5 + 0.5 * Math.cos(t * 0.005 + 3.8);
      const bendFactor4 = 0.5 + 0.5 * Math.sin(t * 0.010 + 5.2);

      // --- WAVE 1: PRIMARY TIMELINE (Downward leaning with active amplitude changes)
      const slope1 = 0.11 + 0.03 * Math.sin(t * 0.015) + 0.01 * Math.cos(t * 0.007); 
      const bias1 = 12 * Math.sin(t * 0.010);
      const amp1 = 38 + 14 * Math.cos(t * 0.018);
      const freq1 = 0.017 + 0.003 * Math.sin(t * 0.013);
      const phase1 = t * 0.024 + 0.25 * Math.sin(t * 0.018);

      // --- WAVE 2: BEARISH OPPOSING CYCLE (Runs in left-to-right flow, different layout)
      const slope2 = 0.09 + 0.02 * Math.cos(t * 0.012) + 0.01 * Math.sin(t * 0.006); 
      const bias2 = 16 * Math.cos(t * 0.015) - 6;
      const amp2 = 25 + 10 * Math.sin(t * 0.015);
      const freq2 = 0.029 + 0.005 * Math.cos(t * 0.011);
      const phase2 = t * 0.028 + 0.30 * Math.cos(t * 0.014); // Fixed to positive flow!

      // --- WAVE 3: MID-TERM INTEGRATED SWELL (Slow backdrop with distinct downward incline)
      const slope3 = 0.07 + 0.02 * Math.sin(t * 0.008) + 0.005 * Math.cos(t * 0.004);
      const bias3 = 22 * Math.sin(t * 0.007);
      const amp3 = 45 + 16 * Math.sin(t * 0.009);
      const freq3 = 0.011 + 0.002 * Math.cos(t * 0.007);
      const phase3 = t * 0.014 + 0.15 * Math.sin(t * 0.009);

      // --- WAVE 4: SENSORY TRACKER (Rapid, textured dotted cycle)
      const slope4 = 0.10 + 0.025 * Math.cos(t * 0.019) + 0.01 * Math.sin(t * 0.009);
      const bias4 = -6 * Math.sin(t * 0.016);
      const amp4 = 12 + 5 * Math.sin(t * 0.026);
      const freq4 = 0.038 + 0.007 * Math.sin(t * 0.020);
      const phase4 = t * 0.036 + 0.35 * Math.cos(t * 0.025);

      // Generates coordinates. They share a similar starting vertical region to maintain visual cohesion,
      // but diverge immediately style-wise. When a wave's bendFactor is high, the oscillation dims 
      // towards the right edge and transitions smoothly into an elegant swooping downward curve.
      const getWaveY = (x: number, slope: number, bias: number, amp: number, freq: number, phase: number, bendFactor: number) => {
        const xCentered = x - width / 2;
        
        // Starts elevated to support the downward incline path
        const commonOriginY = -25 + 6 * Math.sin(t * 0.003);
        
        const p = (x - 15) / (width - 30); // Horizontal progress coordinate (0 to 1)
        
        // Sinusoidal blend curve has a high initial slope, preventing any flat start
        const divergenceBlend = Math.sin(p * Math.PI / 2);
        
        // When bendFactor is high, damp the wave's oscillation on the right side and replace it with a smooth curve
        const rightProgress = Math.max(0, (p - 0.25) / 0.75);
        const activeWaveFade = 1.0 - (bendFactor * Math.pow(rightProgress, 1.6));
        
        const individualTrendY = bias + (slope * xCentered);
        const individualWaveY = (amp * activeWaveFade) * Math.sin(freq * xCentered - phase);
        
        // Beautiful, parabolically accelerated downward curved swoop at the end
        const swoopDownwardY = 25 * bendFactor * Math.pow(rightProgress, 2.5);
        
        const targetDeflection = (individualTrendY + individualWaveY + swoopDownwardY) * divergenceBlend;
        
        // Gentle taper at the absolute right bounds to preserve edge visual beauty
        const rightTaper = p > 0.88 ? Math.sin((1.0 - p) / 0.12 * (Math.PI / 2)) : 1.0;
        
        const calculatedY = (height / 2) + (commonOriginY * (1.0 - divergenceBlend) + targetDeflection) * rightTaper;

        // Constraints: Ensure points stay strictly inside the grid bounding zone [38, 242] so they never overlap labels
        const minY = 38;
        const maxY = 242;
        return Math.max(minY, Math.min(maxY, calculatedY));
      };

      // 3. DRAW EXTREMELY SUBTLE BACKGROUND WAVES WITH ZERO HARD BOX FRAMING OR EXTRA BANDS
      
      // WAVE 3: LIQUIDITY SWELL
      ctx.beginPath();
      ctx.strokeStyle = createStyleGradient(0.18);
      ctx.lineWidth = 1.25;
      for (let x = 15; x <= width - 15; x++) {
        const y = getWaveY(x, slope3, bias3, amp3, freq3, phase3, bendFactor3);
        if (x === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // WAVE 2: BEARISH OPPOSING CYCLE
      ctx.beginPath();
      ctx.strokeStyle = createStyleGradient(0.24);
      ctx.lineWidth = 0.85;
      for (let x = 15; x <= width - 15; x++) {
        const y = getWaveY(x, slope2, bias2, amp2, freq2, phase2, bendFactor2);
        if (x === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // WAVE 1: PRIMARY TIMELINE (Central downward-leaning visual anchor)
      ctx.beginPath();
      ctx.strokeStyle = createStyleGradient(0.45);
      ctx.lineWidth = 1.05;
      for (let x = 15; x <= width - 15; x++) {
        const y = getWaveY(x, slope1, bias1, amp1, freq1, phase1, bendFactor1);
        if (x === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // WAVE 4: SENSORY TRACKER
      ctx.beginPath();
      ctx.strokeStyle = createStyleGradient(0.20);
      ctx.lineWidth = 0.75;
      ctx.setLineDash([3, 6]);
      for (let x = 15; x <= width - 15; x++) {
        const y = getWaveY(x, slope4, bias4, amp4, freq4, phase4, bendFactor4);
        if (x === 15) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 4. ON-SCREEN SYSTEM TEXT DETAILS (Kept ultra-subtle for premium desk terminal feel)
      if (slope1 > 0.22 && slope2 > 0.18) {
        activeRegimeRef.current = "REGIME: ACCELERATING_DOWNWARD_CROSSOVER";
      } else if (slope1 > 0.18 && slope2 > 0.14) {
        activeRegimeRef.current = "REGIME: BEARISH_LIQUIDITY_DRAIN_ACTIVE";
      } else {
        activeRegimeRef.current = "REGIME: MEAN_REVERTING_DRAIN_EQUILIBRIUM";
      }

      ctx.fillStyle = "rgba(255, 255, 255, 0.40)";
      ctx.font = "7px " + '"JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText("ENGINE: MULTIBAND_STOCHASTIC_WAVES", 14, 20);

      const calculatedIncline1 = (slope1 * 100).toFixed(2);
      const calculatedIncline2 = (slope2 * 100).toFixed(2);
      ctx.textAlign = 'right';
      ctx.fillText(
        `${activeRegimeRef.current} | S1: +${calculatedIncline1}% (LEAN) | S2: +${calculatedIncline2}% (LEAN)`,
        width - 14,
        20
      );
      ctx.textAlign = 'left';

      ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
      ctx.fillText("MULTIPLE_INDEPENDENT_HORIZON_SYSTEM", 14, height - 12);
      ctx.textAlign = 'right';
      ctx.fillText("DECIM_REG: INDEPENDENT_SLOPE_ACTIVE", width - 14, height - 12);
      ctx.textAlign = 'left';

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-[860px] h-[280px] relative select-none pointer-events-none">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        style={{ width: `${width}px`, height: `${height}px` }}
        className="block bg-transparent" 
      />
    </div>
  );
}
