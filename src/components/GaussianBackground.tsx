import React, { useEffect, useRef } from "react";

export default function GaussianBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High-fidelity absolute dimensions with a sleek, compact height to prevent vertical bloat
  const width = 640;
  const height = 280;

  // Master clock for continuous, fluid, step-free animation flow
  const clockRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Retina support scaling factor
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    let animationFrameId: number;

    let lastDrawTime = 0;
    const fpsInterval = 1000 / 19; // Limit rendering to 19 FPS for discrete stepper effect

    const render = (time: number) => {
      animationFrameId = requestAnimationFrame(render);
      
      if (!lastDrawTime) lastDrawTime = time;
      const elapsed = time - lastDrawTime;
      
      if (elapsed < fpsInterval) return;
      lastDrawTime = time - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      // Use real physical elapsed time to ensure speed never drops or slows down under scrolling load or frame rate changes.
      // Scaled to match the exact natural timing (1.14 units of code-phase per second).
      const t = time * 0.00114;

      // 1. STRATEGIC STATE TRAJECTORY RING (Traversal of symmetric baseline -> skewness -> bimodal split -> return transition)
      // Represented by infinitely differentiable sines/cosines over code phase, ensuring 100% continuous flow
      const stateAngle = t * 0.11; // Full stately cycle is ~55-60 seconds, which gives clear progress visibility
      
      const pSym = Math.pow(0.5 + 0.5 * Math.cos(stateAngle), 1.6);
      const pSkew = Math.pow(0.5 + 0.5 * Math.sin(stateAngle), 1.6);
      const pBimodal = Math.pow(0.5 - 0.5 * Math.cos(stateAngle), 1.6);
      
      // Partition of unity normalization with subtle padding ensures zero jumps, zero pointy corners, and flawless return to baseline
      const totalW = pSym + pSkew + pBimodal + 0.02;
      const wSym = pSym / totalW;
      const wSkew = pSkew / totalW;
      const wBimodal = pBimodal / totalW;

      // --- REGIME 1: PRIMARY MARKET CLUSTER
      // Centered at 320. In skew mode, it shifts left/right elegantly. In bimodal, it shifts left to accommodate mode 2.
      const skewMeanShift = -75 * Math.sin(t * 0.18); // shifts smoothly and visibly over time
      const bimodalMean1 = 225;
      const mean1 = 320 * wSym + (320 + skewMeanShift) * wSkew + bimodalMean1 * wBimodal;
      
      // Volatility (Sigma) is crisp and narrow in baseline (52px) and expands smoothly in skew/bimodal to show elegant tails
      const sigma1 = 52 * wSym + 76 * wSkew + 48 * wBimodal;
      
      // Skewness is exactly 0 in baseline/bimodal, and becomes highly pronounced in skew mode
      const skew1 = 0 * wSym + (2.8 * Math.sin(t * 0.22)) * wSkew + 0 * wBimodal;

      // Height of primary cluster (elevated overall as requested for strong structural presence and non-compressed curves)
      const height1 = 172 * wSym + 132 * wSkew + 105 * wBimodal;

      // --- REGIME 2: FLOATING SECONDARY CLUSTER (For bimodal regime splits)
      const mean2 = 415 + 20 * Math.cos(t * 0.15);
      const sigma2 = 46 + 4 * Math.sin(t * 0.11);
      const skew2 = -0.5 * wBimodal; // subtle negative skew matching realistic bimodal assets
      const height2 = 98 * wBimodal; // elevated and fades completely/smoothly to 0 in symmetric/skew regimes

      // Skew Normal visual height generator
      const skewNormalVisualHeight = (x: number, mean: number, sigma: number, skew: number, peakHeight: number) => {
        if (peakHeight <= 0) return 0;
        const z = (x - mean) / sigma;
        const bell = Math.exp(-0.5 * z * z);
        
        // Exact normal Cumulative Distribution Function (CDF) approximation
        const alphaZ = skew * z;
        const cdf = 1 / (1 + Math.exp(-1.5976 * alphaZ * (1 + 0.04417 * alphaZ * alphaZ)));
        
        return peakHeight * bell * (2 * cdf);
      };

      // Combined profiles
      const getProfileY = (xVal: number) => {
        const p1 = skewNormalVisualHeight(xVal, mean1, sigma1, skew1, height1);
        const p2 = skewNormalVisualHeight(xVal, mean2, sigma2, skew2, height2);
        return p1 + p2;
      };

      const paddingX = 40;
      const baselineY = height - 35;
      const activeWidth = width - paddingX * 2;

      // 2. FINE GRID SYSTEM (Subtle ambient positioning grid)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 0.5;

      const cols = 12;
      const rows = 8;
      for (let c = 1; c < cols; c++) {
        const cx = (width / cols) * c;
        ctx.beginPath();
        ctx.moveTo(cx, 15);
        ctx.lineTo(cx, height - 15);
        ctx.stroke();
      }
      for (let r = 1; r < rows; r++) {
        const ry = (height / rows) * r;
        ctx.beginPath();
        ctx.moveTo(15, ry);
        ctx.lineTo(width - 15, ry);
        ctx.stroke();
      }

      // Horizontal micro monitor scanlines
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.0);
      }

      // 3. GENERATE BIMODAL TO UNIMODAL PROFILE POINTS
      const curvePoints: { x: number; y: number }[] = [];
      for (let x = paddingX; x <= width - paddingX; x += 3) {
        const profileHeight = getProfileY(x);
        const yValue = baselineY - profileHeight;
        curvePoints.push({ x, y: yValue });
      }

      // 4. DRAW PROFILE GRADIENT FILL (Extremely muted background glow)
      if (curvePoints.length > 0) {
        const gradient = ctx.createLinearGradient(0, baselineY - 180, 0, baselineY);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.09)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.03)");
        gradient.addColorStop(1, "rgba(255, 255, 255, 0.00)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(curvePoints[0].x, baselineY);
        curvePoints.forEach((pt) => {
          ctx.lineTo(pt.x, pt.y);
        });
        ctx.lineTo(curvePoints[curvePoints.length - 1].x, baselineY);
        ctx.closePath();
        ctx.fill();
      }

      // 5. LIVE ORDER BOOK HISTOGRAM PILLARS (Slightly reduced bands as requested)
      const barCount = 36;
      const barWidth = activeWidth / barCount;
      const barGap = 3.0;
      
      for (let i = 0; i < barCount; i++) {
        const barLeft = paddingX + i * barWidth;
        const barCenter = barLeft + barWidth / 2;

        const theoreticalHeight = getProfileY(barCenter);

        // Exceptionally calm, continuous statistical fluctuations (completely stable, zero jitter)
        const orderFluctuation = 0.4 * Math.sin(t * 1.2 + i * 0.15) + 0.15 * Math.cos(t * 1.8 - i * 0.08);
        const barHeight = Math.max(3.0, theoreticalHeight + orderFluctuation);
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        ctx.rect(barLeft + barGap / 2, baselineY - barHeight, barWidth - barGap, barHeight);
        ctx.fill();
        ctx.stroke();
      }

      // 6. MAIN PROFILE SHAPE OUTLINE (Brighter, elegant outline tracing the distribution peaks)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      curvePoints.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();

      // 7. HORIZON BASELINE (Understated lower grid axis)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(paddingX, baselineY);
      ctx.lineTo(width - paddingX, baselineY);
      ctx.stroke();

      // Draw mode guidelines as fluid, thin dotted vertical lines (very low intensity)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.setLineDash([2, 5]);
      
      if (mean1 >= paddingX && mean1 <= width - paddingX) {
        ctx.beginPath();
        ctx.moveTo(mean1, baselineY - 150);
        ctx.lineTo(mean1, baselineY + 10);
        ctx.stroke();
      }
      if (height2 > 0 && mean2 >= paddingX && mean2 <= width - paddingX) {
        ctx.beginPath();
        ctx.moveTo(mean2, baselineY - 150);
        ctx.lineTo(mean2, baselineY + 10);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // 8. TICK LABELS (μ1 and μ2 tracking Mode positions)
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.font = "6px " + '"JetBrains Mono", monospace';
      
      if (mean1 >= paddingX && mean1 <= width - paddingX) {
        ctx.fillText("μ1_REG", mean1 - 10, baselineY + 16);
      }
      if (height2 > 0 && mean2 >= paddingX && mean2 <= width - paddingX) {
        ctx.fillText("μ2_REG", mean2 - 10, baselineY + 16);
      }

      // 9. STATISTICS LOG CODES
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "7px " + '"JetBrains Mono", monospace';
      
      let stateLabel = "SYMMETRIC_UNIMODAL_NORMAL";
      if (wSkew > wSym && wSkew > wBimodal) {
        stateLabel = "SKEWED_UNIMODAL_DISTRIBUTION";
      } else if (wBimodal > wSym && wBimodal > wSkew) {
        stateLabel = "BIMODAL_LIQUIDITY_SPLIT";
      }

      ctx.textAlign = 'left';
      ctx.fillText(`MODEL: STATE_TRANSITIONAL_GAUSSIAN (${stateLabel})`, 14, 20);

      const computedAvgSigma = ((sigma1 * height1 + sigma2 * height2) / (height1 + height2)).toFixed(2);
      ctx.textAlign = 'right';
      ctx.fillText(
        `AVG_DISP (σ): ${computedAvgSigma} | MODE_1: ${mean1.toFixed(1)}p | STATE_IND: symmetric(${wSym.toFixed(2)}) skew(${wSkew.toFixed(2)}) bimodal(${wBimodal.toFixed(2)})`,
        width - 14,
        32
      );
      ctx.textAlign = 'left';

      ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
      ctx.fillText("RECURSIVE_DENSITY_PROFILING_ACTIVE", 14, height - 12);

      animationFrameId = requestAnimationFrame(render);
    };

    render(performance.now());

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="w-[640px] h-[280px] relative select-none pointer-events-none">
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
