import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "./components/Navbar";
import Logo from "./components/Logo";
import SineBackground from "./components/SineBackground";
import GaussianBackground from "./components/GaussianBackground";
import ExpandableCards from "./components/ExpandableCards";
import PanelSlider from "./components/PanelSlider";
import AudioPlayer from "./components/AudioPlayer";

// 1. HIGH-END 35MM CINEMATIC FILM GRAIN (SILVER HALIDE CRYSTAL ALGORITHM)
function FilmGrainEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let lastTime = 0;
    const fpsInterval = 1000 / 24; // Strict cinematic 24 FPS frame pacing

    // Set main canvas to sharp 1:1 native screen resolution
    const resizeMainCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeMainCanvas();
    window.addEventListener('resize', resizeMainCanvas);

    // Pre-render 4 distinct organic grain frames offscreen to avoid real-time loop overhead
    const numFrames = 4;
    const frameSize = 512;
    const cachedFrames: HTMLCanvasElement[] = [];

    for (let f = 0; f < numFrames; f++) {
      const fCanvas = document.createElement('canvas');
      fCanvas.width = frameSize;
      fCanvas.height = frameSize;
      const fCtx = fCanvas.getContext('2d');
      if (!fCtx) continue;
      const fImgData = fCtx.createImageData(frameSize, frameSize);
      const fData = fImgData.data;

      // Ultra-fine Silver Halide Emulation Loop
      for (let i = 0; i < fData.length; i += 4) {
        // Drop probability to 4% to ensure grains are strictly isolated 1px needles (No Clumping)
        const isGrain = Math.random() < 0.04; 
        
        // Use a calibrated mid-tone silver value (140) to kill harsh digital white contrast
        const grainValue = isGrain ? 140 : 0;
        
        fData[i] = grainValue;     // R
        fData[i + 1] = grainValue; // G
        fData[i + 2] = grainValue; // B
        fData[i + 3] = 255;        // Solid internal alpha for flawless screen blending
      }
      fCtx.putImageData(fImgData, 0, 0);
      cachedFrames.push(fCanvas);
    }

    const renderLoop = (timestamp: number) => {
      animationId = requestAnimationFrame(renderLoop);

      const elapsed = timestamp - lastTime;
      if (elapsed < fpsInterval) return;
      lastTime = timestamp - (elapsed % fpsInterval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (cachedFrames.length > 0) {
        // Pick a random pre-rendered micro-grain frame
        const randomFrame = cachedFrames[Math.floor(Math.random() * cachedFrames.length)];
        const pattern = ctx.createPattern(randomFrame, 'repeat');
        
        if (pattern) {
          // Chaotic matrix translation totally shatters any visual repeating grid lines
          const matrix = new DOMMatrix();
          matrix.translateSelf(Math.random() * frameSize, Math.random() * frameSize);
          pattern.setTransform(matrix);

          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    };

    animationId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeMainCanvas);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-[9999] w-full h-full pointer-events-none opacity-[0.16] transform-gpu"
      style={{ transform: 'translateZ(0)' }}
    />
  );
}

export default function App() {
  const [inquirySent, setInquirySent] = useState(false);
  const [allocationStr, setAllocationStr] = useState<string>("");
  const [logoError, setLogoError] = useState(false);

  const [formData, setFormData] = useState({
    institution: "",
    email: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw === '') {
      setAllocationStr('');
      return;
    }
    const val = parseInt(raw, 10);
    if (!isNaN(val)) {
      setAllocationStr(val.toLocaleString());
    }
  };

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.institution) return;
    setInquirySent(true);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#020203] text-white overflow-x-hidden select-none font-sans selection:bg-[#E5E5E5] selection:text-black">
      
      {/* SVG GLASS ENGINE & GOOEY FILTERS */}
      <svg className="absolute w-0 h-0 invisible pointer-events-none">
        <defs>
          <filter id="mercuryLiquidGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="35" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -12" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        /* Global Canvas Slow Drift */
        @keyframes liquidCanvasShift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(2vw, -1vh); }
        }

        /* NODE 1: Tailored for maximum length stretching and increased thickness */
        @keyframes liquidChaos1 {
          0%, 100% { 
            transform: translate(0vw, 0vh) rotate(0deg) scale(1); 
            border-radius: 45% 55% 50% 50% / 50% 45% 55% 50%;
          }
          30% { 
            transform: translate(36vw, 16vh) rotate(35deg) scale(1.85, 0.55); /* Severe elongation (high length, thin height) */
            border-radius: 65% 35% 70% 30% / 40% 65% 35% 60%;
          }
          55% { 
            transform: translate(12vw, 40vh) rotate(110deg) scale(0.8, 1.3); /* Vertical drag recovery */
            border-radius: 35% 65% 40% 60% / 55% 35% 65% 45%;
          }
          80% { 
            transform: translate(-22vw, 18vh) rotate(190deg) scale(1.2, 0.85); /* Smooth independent wobbly mass */
            border-radius: 55% 45% 70% 30% / 40% 60% 40% 60%;
          }
        }

        /* NODE 2: Opposing trajectory with extreme vertical stretch length scaling */
        @keyframes liquidChaos2 {
          0%, 100% { 
            transform: translate(0vw, 0vh) rotate(0deg) scale(1); 
            border-radius: 50% 50% 45% 55% / 45% 55% 50% 50%;
          }
          25% { 
            transform: translate(-32vw, -28vh) rotate(-55deg) scale(0.5, 1.9); /* Drastically stretched into a long vertical strand */
            border-radius: 40% 60% 35% 65% / 65% 35% 65% 35%;
          }
          45% { 
            transform: translate(22vw, -32vh) rotate(-135deg) scale(1.4, 0.75); /* Flattened horizontal puddle travel */
            border-radius: 70% 30% 60% 40% / 40% 70% 40% 60%;
          }
          75% { 
            transform: translate(-8vw, 12vh) rotate(-220deg) scale(0.85, 1.15); 
            border-radius: 45% 55% 65% 35% / 50% 40% 60% 50%;
          }
        }
        
        @keyframes scanline-roll {
          from { background-position: 0 0; }
          to { background-position: 0 100%; }
        }

        /* CINEMATIC STRANGER THINGS ECHO (Static Anchor, High-Frequency Alternating X-4 / X+4 Ghosting) */
        @keyframes analogHalationDrift {
          0%, 100% {
            /* Left side ghost active, featuring a subtle off-white core and a soft, clean white halation glow */
            text-shadow: 
              -4px 0px 1px rgba(255, 255, 255, 0.40),
              -4px 0px 4px rgba(255, 255, 255, 0.20);
          }
          50% {
            /* Right side ghost active, featuring a subtle off-white core and a soft, clean white halation glow */
            text-shadow: 
              4px 0px 1px rgba(255, 255, 255, 0.40),
              4px 0px 4px rgba(255, 255, 255, 0.20);
          }
        }

        /* SUBTLE GHOSTING (Alternating X-2 / X+2) for more restricted card subtexts */
        @keyframes analogHalationDriftSubtle {
          0%, 100% {
            text-shadow: 
              -2px 0px 1px rgba(255, 255, 255, 0.40),
              -2px 0px 4px rgba(255, 255, 255, 0.20);
          }
          50% {
            text-shadow: 
              2px 0px 1px rgba(255, 255, 255, 0.40),
              2px 0px 4px rgba(255, 255, 255, 0.20);
          }
        }

        .analog-text {
          display: block;
          color: #FAFAFA !important; /* Shifting the font color slightly towards a whiter, premium tone */
          
          /* Smooth ease-in-out wave at exactly 30 cycles/sec (0.0333s) */
          animation: analogHalationDrift 0.0333s infinite ease-in-out;
          animation-delay: var(--weave-delay, 0s);
          
          text-rendering: geometricPrecision;

          /* Promote element and its text-shadow to a single hardware-accelerated composite unit to block scroll translation drift */
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .analog-text-subtle {
          display: block;
          color: #FAFAFA !important;
          animation: analogHalationDriftSubtle 0.0333s infinite ease-in-out;
          animation-delay: var(--weave-delay, 0s);
          text-rendering: geometricPrecision;

          /* Promote element and its text-shadow to a single hardware-accelerated composite unit to block scroll translation drift */
          will-change: transform;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        @keyframes analogChartHalationDrift {
          0%, 100% {
            opacity: 1.00;
            filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.35)) drop-shadow(0px 0px 10px rgba(255, 255, 255, 0.15));
          }
          10% {
            opacity: 0.85;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.05));
          }
          20% {
            opacity: 0.98;
            filter: drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.22));
          }
          30% {
            opacity: 0.82;
            filter: none;
          }
          40% {
            opacity: 1.00;
            filter: drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.40)) drop-shadow(0px 0px 12px rgba(255, 255, 255, 0.18));
          }
          50% {
            opacity: 0.86;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.05));
          }
          60% {
            opacity: 0.97;
            filter: drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.22));
          }
          70% {
            opacity: 0.83;
            filter: none;
          }
          80% {
            opacity: 0.99;
            filter: drop-shadow(0px 0px 4px rgba(255, 255, 255, 0.30));
          }
          90% {
            opacity: 0.87;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.05));
          }
        }

        @keyframes analogChartHalationDriftSubtle {
          0%, 100% {
            opacity: 1.00;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.10)) drop-shadow(0px 0px 3px rgba(255, 255, 255, 0.04));
          }
          10% {
            opacity: 0.97;
            filter: none;
          }
          20% {
            opacity: 0.99;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.05));
          }
          30% {
            opacity: 0.96;
            filter: none;
          }
          40% {
            opacity: 1.00;
            filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.12)) drop-shadow(0px 0px 5px rgba(255, 255, 255, 0.06));
          }
          50% {
            opacity: 0.97;
            filter: none;
          }
          60% {
            opacity: 0.99;
            filter: drop-shadow(0px 0px 1px rgba(255, 255, 255, 0.08));
          }
          70% {
            opacity: 0.96;
            filter: none;
          }
          80% {
            opacity: 1.00;
            filter: drop-shadow(0px 0px 2px rgba(255, 255, 255, 0.10));
          }
          90% {
            opacity: 0.98;
            filter: none;
          }
        }

        .analog-chart {
          display: block;
          will-change: opacity, filter;
          animation: analogChartHalationDrift 0.25s infinite linear;
          animation-delay: var(--weave-delay, 0s);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        .analog-chart-subtle {
          display: block;
          will-change: opacity, filter;
          animation: analogChartHalationDriftSubtle 0.18s infinite linear;
          animation-delay: var(--weave-delay, 0s);
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}} />

      {/* 1. LIQUID MERCURY ENGINE */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div 
          className="absolute inset-0 w-full h-full opacity-15"
          style={{
            filter: 'url(#mercuryLiquidGoo)', 
            animation: 'liquidCanvasShift 50s infinite ease-in-out',
            willChange: 'transform'
          }}
        >
          {/* Node 1: Increased Base Diameter (29vw -> 33vw) */}
          <div 
            className="absolute top-[25%] left-[20%] w-[33vw] h-[33vw]" 
            style={{ 
              background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.98) 0%, rgba(71, 85, 105, 0.75) 45%, rgba(226, 232, 240, 0.9) 75%, transparent 85%)',
              animation: 'liquidChaos1 36s infinite ease-in-out',
              willChange: 'transform'
            }} 
          />
          
          {/* Node 2: Increased Base Diameter (24vw -> 27vw) + Maintained Desync Delay */}
          <div 
            className="absolute top-[35%] left-[45%] w-[27vw] h-[27vw]" 
            style={{ 
              background: 'radial-gradient(circle at center, rgba(30, 41, 59, 0.98) 0%, rgba(100, 116, 139, 0.7) 45%, rgba(241, 245, 249, 0.85) 75%, transparent 85%)',
              animation: 'liquidChaos2 42s infinite ease-in-out',
              animationDelay: '-14s', /* Forces complete independence from second 0 */
              willChange: 'transform'
            }} 
          />
        </div>
      </div>

      {/* 2. CRT ROLLING SCANLINES (Background Layer) */}
      <div className="fixed inset-0 z-10 pointer-events-none opacity-[0.06]"
           style={{ 
             background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0px, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 4px)',
             animation: 'scanline-roll 14s linear infinite' 
           }} />

      {/* 3. PURE FROSTED GLASS PANE (Soft Editorial Blur Overlay) */}
      <div className="fixed inset-0 z-20 backdrop-filter backdrop-blur-[24px] bg-transparent" />



      {/* ----------------------------------------------------------- */}
      {/* APPLICATION CONTENT LAYER (FLOATING ABOVE)                   */}
      {/* ----------------------------------------------------------- */}
      <div className="relative z-30 w-full min-h-screen bg-transparent pb-0">
        {/* Global Navigation links matching strictly formal nomenclature */}
        <Navbar />

        <main className="relative max-w-7xl mx-auto px-6 sm:px-10 antialiased pt-10">
          
          {/* ================= HERO SECTION & OVERVIEW ================= */}
          <section className="relative pt-2 pb-2 mb-2 sm:mb-4" id="hero">
            
            <div className="relative z-10 w-full flex flex-col items-center text-center mt-1">
              
              {/* HERO GLOW: Stretched ellipse/oval glow positioned behind Joveyra brand name */}
              <div 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[250px] rounded-[50%] bg-white/[0.04] blur-[120px] pointer-events-none -z-10"
              />
              
              {/* Primary Header Logo */}
              <img 
                src="/joveyra transparency.png" 
                alt="JOVEYRA" 
                className="h-[230px] sm:h-[320px] md:h-[410px] w-auto object-contain select-none -mt-4 -mb-4 sm:-mb-8 md:-mb-10 animate-flicker pointer-events-none"
                referrerPolicy="no-referrer"
                loading="eager"
                fetchPriority="high"
              />
              
              <div className="h-[1px] w-24 bg-white/20 mt-1 mb-4" />
              
              {/* Hero Intro: Perfectly center-aligned and beautifully unified */}
              <div className="max-w-7xl lg:max-w-[1350px] mx-auto px-8 md:px-12 book-justified">
                <p 
                  className="text-base sm:text-2xl md:text-3xl lg:text-[2.25rem] lg:leading-[1.45] font-editorial text-neutral-300 font-light tracking-wide analog-text book-justified"
                  style={{ 
                    '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`,
                    '--weave-duration': `${12 + Math.random() * 8}s` 
                  } as React.CSSProperties}
                >
                  Where Conventional Intuition Struggles Against Structural Complexity, Systematic Parameters Deliver Mathematical Clarity. We Filter Out Market Sentiment, Focusing Exclusively On Verifiable Anomalies, High-Frequency Microstructure Patterns, And Rigorous Empirical Frameworks.
                </p>
              </div>
              
            </div>
          </section>


          {/* ================= SECTION 2: CORE ARCHITECTURE (With Waves) ================= */}
          <section className="py-10 border-t border-white/10 relative overflow-hidden bg-black/20" id="architecture">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="flex flex-col gap-6">
                <div className="max-w-4xl text-left">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-none mb-4 animate-flicker">
                    Core Architecture
                  </h2>
                  <p 
                    className="text-base sm:text-lg md:text-2xl lg:text-3xl font-editorial text-neutral-300 font-light leading-relaxed tracking-wide analog-text book-justified"
                    style={{ 
                      '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`,
                      '--weave-duration': `${12 + Math.random() * 8}s` 
                     } as React.CSSProperties}
                  >
                    Engineered For Absolute Processing Efficiency, Our Operational Infrastructure Prioritizes Mathematical Capital Preservation And Multi-Layered Risk Management. We Build Low-Latency Proprietary Models Designed To Extract Non-Correlated Alpha Structures Across Global Liquidity Pools.
                  </p>
                </div>
                
                {/* Completely seamless integrated wider layout for waves */}
                <div className="w-full overflow-x-auto scrollbar-none py-1">
                  <div className="flex justify-center min-w-[860px]">
                    <div 
                      className="analog-chart"
                      style={{ 
                        '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`
                      } as React.CSSProperties}
                    >
                      <SineBackground />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ================= MODEL EVOLUTION (3 Expandable Cards) ================= */}
          <section className="py-14 border-t border-white/10 relative overflow-hidden bg-black/10" id="strategies">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="flex flex-col gap-10">
                <div className="w-full text-center mx-auto">
                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-none animate-flicker">
                    MODEL EVOLUTION
                  </h2>
                </div>
                
                {/* Three interactive soft-edged rectangular panels with vertical 1080x1350 frames */}
                <ExpandableCards />
              </div>
            </div>
          </section>


          {/* ================= SECTION 3: EMPIRICAL RIGOR (With LocalizedDot Grid) ================= */}
          <section className="py-10 border-t border-white/10 relative" id="empirical">
            


            <div className="max-w-5xl mx-auto px-6 relative z-10 text-left">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-none mb-3 animate-flicker">
                Empirical Rigor
              </h2>
              
              <p 
                className="text-base sm:text-lg md:text-xl lg:text-2xl font-editorial text-neutral-300 font-light leading-relaxed tracking-wide analog-text book-justified"
                style={{ 
                  '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`,
                  '--weave-duration': `${12 + Math.random() * 8}s` 
                } as React.CSSProperties}
              >
                Advanced Mathematical Research Governs Our Approach To Market Complexity. Through Relentless Out-Of-Sample Empirical Testing, Our Algorithmic Frameworks Dynamically Adapt To Changing Macro Regimes, Converting Vast Datasets Into Highly Structured, Execution-Ready Strategies.
              </p>
            </div>
          </section>


          {/* ================= SECTION: CORE PARAMETERS (Two Wide Automatic Sliders) ================= */}
          <section className="py-20 border-t border-white/10 relative overflow-hidden" id="parameters">
            {/* SOPHISTICATED LAYERED DESIGN BACKGROUND (INSTITUTIONAL / FINANCIAL MODERN) */}
            
            {/* 1. Fine Graph Grid Layer (Slightly opaque lines evoking analytical canvas) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
            
            {/* 2. Soft Dynamic Ambient Gradient Fields (Pulsing, high-end organic flow) */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full bg-slate-900/30 blur-[130px] mix-blend-screen pointer-events-none animate-glow-1 opacity-70" />
            <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[700px] h-[350px] rounded-full bg-zinc-900/35 blur-[130px] mix-blend-screen pointer-events-none animate-glow-2 opacity-60" />

            {/* 3. Mathematical Wave Curve (Representing deep algorithmic functions, signals & trends) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <svg className="w-full h-[300px] text-white/5" viewBox="0 0 1440 300" fill="none" preserveAspectRatio="none">
                <path 
                  d="M0,150 C180,240 360,60 540,150 C720,240 900,60 1080,150 C1260,240 1440,150 L1440,300 L0,300 Z" 
                  fill="url(#math-grad)" 
                  className="opacity-25"
                />
                <path 
                  d="M0,150 C180,240 360,60 540,150 C720,240 900,60 1080,150 C1260,240 1440,150" 
                  stroke="currentColor" 
                  strokeWidth="0.75" 
                  strokeDasharray="4 8"
                />
                <path 
                  d="M0,180 C200,90 400,210 600,120 C800,30 1000,270 1200,150 C1320,90 1440,150 1440,150" 
                  stroke="currentColor" 
                  strokeWidth="0.5" 
                  className="opacity-50"
                />
                <defs>
                  <linearGradient id="math-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.02)" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Main Wide Container supporting up to under 1980px total combined width */}
            <div className="max-w-[1580px] mx-auto px-6 sm:px-10 relative z-10 w-full animate-fade-in">
              {/* DESKTOP VIEW: Two separate columns/panels side-by-side */}
              <div className="hidden md:grid grid-cols-2 gap-8 lg:gap-12 w-full">
                {/* ----------------- LEFT PANEL ----------------- */}
                <PanelSlider 
                  id="left-parameter"
                  slides={[
                    "Over 80% of the re\u00ADsearch team holds ad\u00ADvanced de\u00ADgrees in math\u00ADe\u00ADmat\u00ADics, phys\u00ADics, and com\u00ADput\u00ADer sci\u00ADence.",
                    "To\u00ADtal fund ca\u00ADpac\u00ADi\u00ADty is strict\u00ADly capped to pro\u00ADtect strat\u00ADe\u00ADgy per\u00ADfor\u00ADmance and op\u00ADti\u00ADmal ex\u00ADe\u00ADcu\u00ADtion me\u00ADchan\u00ADics"
                  ]}
                  interval={4500}
                />

                {/* ----------------- RIGHT PANEL ----------------- */}
                <PanelSlider 
                  id="right-parameter"
                  slides={[
                    "Au\u00ADto\u00ADmat\u00ADed risk pro\u00ADto\u00ADcols are con\u00ADti\u00ADnu\u00ADous\u00ADly su\u00ADper\u00ADvised by ex\u00ADpe\u00ADri\u00ADenced mar\u00ADket pro\u00ADfes\u00ADsion\u00ADals",
                    "All quan\u00ADti\u00ADta\u00ADtive mod\u00ADels and ex\u00ADe\u00ADcu\u00ADtion in\u00ADfra\u00ADstruc\u00ADture are de\u00ADvel\u00ADoped strict\u00ADly in-house with ze\u00ADro re\u00ADli\u00ADance on third-party sys\u00ADtems"
                  ]}
                  interval={5200} /* Slightly offset to avoid robotic unison shifts */
                />
              </div>

              {/* MOBILE VIEW: Single continuous 4-item carousel */}
              <div className="block md:hidden w-full">
                <PanelSlider 
                  id="mobile-unified-parameter"
                  slides={[
                    "Over 80% of the research team holds advanced degrees in mathematics, physics, and computer science.",
                    "Total fund capacity is strictly capped to protect strategy performance and optimal execution mechanics.",
                    "Automated risk protocols are continuously supervised by experienced market professionals.",
                    "All quantitative models and execution infrastructure are developed strictly in-house with zero reliance on third-party systems."
                  ]}
                  interval={4800}
                />
              </div>
            </div>
          </section>


          {/* ================= SECTION 4: INTELLECTUAL CAPITAL (With Floating Crosshairs) ================= */}
          <section className="py-10 border-t border-white/10 relative overflow-hidden bg-black/20" id="intellectual">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 text-left relative self-start pt-4">


                  <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-none mb-6 animate-flicker">
                    Intellectual Capital
                  </h2>
                  <p 
                    className="text-base md:text-lg lg:text-xl font-editorial text-neutral-300 font-light leading-relaxed mb-6 tracking-wide analog-text book-justified"
                    style={{ 
                      '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`,
                      '--weave-duration': `${12 + Math.random() * 8}s` 
                    } as React.CSSProperties}
                  >
                    Strategic Longevity Within Quantitative Finance Depends Entirely On Intellectual Exceptionalism. We Cultivate A Highly Specialized Ecosystem For Advanced Mathematical Minds, Where Analytical Potential Is Transformed Into Computational Edges Through Deep, Cross-Disciplinary Collaboration.
                  </p>

                  <div className="border border-white/[0.05] p-5 rounded-xl bg-white/[0.01] max-w-sm hidden lg:block book-justified">
                    <div className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mb-1">PROBABILITY_ESTIMATION</div>
                    <span className="text-sm text-neutral-300 font-sans font-light leading-relaxed book-justified">
                      Continuous Estimation Updates Dynamically Based On Recursive Risk Analysis And Distribution Profiling.
                    </span>
                  </div>
                </div>
                
                {/* High Presence Gaussian distribution chart completely integrated without box framing */}
                <div className="lg:col-span-6 min-w-0 flex justify-center lg:justify-start lg:-ml-16 xl:-ml-10 relative z-0">
                  <div 
                    className="analog-chart-subtle"
                    style={{ 
                      '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`
                    } as React.CSSProperties}
                  >
                    <GaussianBackground />
                  </div>
                </div>
              </div>
            </div>
          </section>


          {/* ================= CONTROLS & CAPITAL ALLOCATION GATEWAY ================= */}
          <section className="py-10 border-t border-white/10 relative" id="contact">
            
            <div className="max-w-4xl mx-auto px-6 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-none mb-3 animate-flicker">
                  Institutional Access
                </h2>
                <p 
                  className="text-base md:text-lg lg:text-[1.125rem] font-editorial text-neutral-300 font-light max-w-3xl mx-auto leading-relaxed tracking-wide analog-text book-justified"
                  style={{ 
                    '--weave-delay': `${(Math.random() * -10).toFixed(2)}s`,
                    '--weave-duration': `${12 + Math.random() * 8}s` 
                  } as React.CSSProperties}
                >
                  Allocation Capacities Are Strictly Reserved For Accredited Institutional Partners. Provide Institutional Validation Details To Initiate Protocol Evaluation.
                </p>
              </div>

              {/* Portal Intake Registry Form */}
              <div className="w-full max-w-2xl mx-auto bg-white/[0.02] p-8 sm:p-12 rounded-2xl border border-white/[0.07] backdrop-blur-3xl relative overflow-hidden shadow-2xl">
                
                <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-white/[0.015] blur-[80px] pointer-events-none" />
                
                <AnimatePresence mode="wait">
                  {!inquirySent ? (
                    <motion.form 
                      key="inquiry"
                      onSubmit={handleInquirySubmit}
                      initial={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-8 text-left"
                    >
                      <div className="border-b border-white/[0.08] pb-4">
                        <h4 className="text-xl text-[#E5E5E5] font-serif font-semibold tracking-tight mb-1">
                          Systematic Intake Registry
                        </h4>
                        <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.25em]">
                          SECURE INGESTION PORTAL
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.25em]">
                            Institution Name
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.institution}
                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 text-white font-sans text-base py-2 focus:border-white focus:outline-none transition-colors animate-none"
                          />
                        </div>

                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] text-slate-500 font-mono uppercase tracking-[0.25em]">
                            Authorized Contact Email
                          </label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-transparent border-b border-white/20 text-white font-sans text-base py-2 focus:border-white focus:outline-none transition-colors animate-none"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 mt-2">
                        <label className="text-[9px] text-slate-400 font-mono uppercase tracking-[0.25em] flex justify-between select-none">
                          <span>Anticipated Capital Allocation (USD)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg font-mono">$</span>
                          <input
                            type="text"
                            value={allocationStr}
                            onChange={handleInputChange}
                            placeholder="10,000,000"
                            className="w-full bg-black/60 text-white text-lg font-mono px-12 py-4 rounded-lg border border-white/10 focus:border-white/30 outline-none transition-all placeholder:text-zinc-600"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 mt-4 bg-white text-black hover:bg-[#E5E5E5] font-sans font-semibold text-[11px] tracking-[0.25em] uppercase transition-all duration-300 shadow-md hover:shadow-xl active:scale-[0.99] cursor-pointer"
                      >
                        SUBMIT ALLOCATION INQUIRY
                      </button>
                    </motion.form>
                  ) : (
                    <motion.div 
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-10 text-center"
                     >
                      <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-6 bg-white/[0.03]">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                      <h4 className="text-2xl text-white font-serif font-bold tracking-tight mb-3">
                        Registry Confirmation
                      </h4>
                      <p className="text-base md:text-lg text-neutral-300 font-editorial font-light leading-relaxed max-w-md book-justified">
                        Your Institutional Registry For <span className="text-white font-medium">{formData.institution}</span> Has Been Processed. The Gateway Review Protocol Is Now Active.
                      </p>
                      <button
                        onClick={() => setInquirySent(false)}
                        className="mt-8 text-[10px] text-zinc-500 hover:text-white font-mono uppercase tracking-[0.25em] border-b border-white/20 pb-1 hover:border-white transition-all cursor-pointer"
                      >
                        [ RETURN TO PORTAL ]
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>

        </main>

        {/* FOOTER */}
        <footer className="border-t border-white/10 bg-black/50 py-16 text-slate-500 relative z-10 text-[9px] tracking-[0.25em]">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 flex flex-col items-center justify-center gap-3 text-center">
            <span className="text-white/80 font-sans font-medium uppercase">JOVEYRA HEDGE FUND®</span>
            <span className="text-white/30 uppercase">© ALL RIGHTS RESERVED</span>
          </div>
        </footer>
      </div>

      {/* LAYER 5: HIGH-PERFORMANCE CINEMATIC FILM GRAIN ENGINE */}
      <FilmGrainEngine />

      {/* SITE-LEVEL DYNAMIC ROTATING BACKGROUND MUSIC ENGINE */}
      <AudioPlayer />
    </div>
  );
}
