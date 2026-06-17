import React from "react";

export default function BackgroundOrbs() {
  return (
    <>
      <style>{`
        @keyframes obsidianFlow1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(120px, 60px) scale(1.2); }
          66% { transform: translate(-80px, 40px) scale(0.95); }
        }
        @keyframes obsidianFlow2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-100px, -80px) scale(1.1); }
          66% { transform: translate(70px, -50px) scale(1.2); }
        }
      `}</style>

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#050507]">
        
        {/* LAYER 1: Highly Vibrant Fluid Source (Amplified colors to cut through the 120px frost layer) */}
        <div className="absolute inset-0 opacity-70 mix-blend-screen">
          <div 
            className="absolute top-[-15%] left-[-10%] w-[85vw] h-[85vw] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, rgba(30, 41, 59, 0.15) 40%, rgba(0,0,0,0) 70%)',
              animation: 'obsidianFlow1 32s infinite ease-in-out',
              willChange: 'transform'
            }}
          />
          <div 
            className="absolute bottom-[-15%] right-[-10%] w-[95vw] h-[95vw] rounded-full"
            style={{ 
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(15, 23, 42, 0.15) 45%, rgba(0,0,0,0) 70%)',
              animation: 'obsidianFlow2 28s infinite ease-in-out',
              willChange: 'transform'
            }}
          />
        </div>

        {/* LAYER 2: Native Webkit Frosted Glass Layer (Guaranteed execution via inline styles) */}
        <div 
          className="absolute inset-0 bg-black/60" 
          style={{ 
            backdropFilter: 'blur(120px)', 
            WebkitBackdropFilter: 'blur(120px)' 
          }} 
        />

        {/* LAYER 3: Cinematic Fine Grain Matrix */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.90' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat' 
          }} 
        />
      </div>
    </>
  );
}
