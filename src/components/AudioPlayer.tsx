import React, { useEffect, useRef, useState } from "react";

interface AudioPlayerProps {
  localAudioPath?: string;
}

export default function AudioPlayer({
  localAudioPath = "/ambient.mp3"
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioSource, setAudioSource] = useState(localAudioPath);
  const fadeIntervalRef = useRef<number | null>(null);

  const fadeAudio = (toVolume: number, duration: number, onComplete?: () => void) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    const startVolume = audio.volume;
    const volumeDiff = toVolume - startVolume;
    if (volumeDiff === 0) {
      if (onComplete) onComplete();
      return;
    }

    const stepTime = 16; // ~60 FPS update path
    const totalSteps = duration / stepTime;
    let currentStep = 0;

    fadeIntervalRef.current = window.setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / totalSteps, 1);
      audio.volume = startVolume + volumeDiff * progress;

      if (progress >= 1) {
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
        }
        if (onComplete) onComplete();
      }
    }, stepTime);
  };

  // Auto-start check on browser entrance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0; // Prepare for smooth fade in
    audio.play()
      .then(() => {
        setIsPlaying(true);
        fadeAudio(1, 800); // Soft fade-in over 800ms
      })
      .catch(() => {
        // Autoplay blocked by standard browser policy. User will play via interaction.
        console.log("Audio autoplay waiting for direct interactive button gesture.");
        audio.volume = 0;
      });

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  const handleAudioError = () => {
    console.warn("Audio file could not be played:", audioSource);
  };

  // Safe and precise state toggle control
  const toggleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      setIsPlaying(false);
      fadeAudio(0, 500, () => {
        audio.pause();
      });
    } else {
      setIsPlaying(true);
      if (audio.paused) {
        audio.volume = 0;
        audio.play()
          .then(() => {
            fadeAudio(1, 500);
          })
          .catch((err) => {
            console.error("Direct play requested but failed: ", err);
          });
      } else {
        // If already playing but in middle of fading out, smoothly fade back up
        fadeAudio(1, 500);
      }
    }
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-40 select-none"
      style={{ contentVisibility: "auto" }}
    >
      <audio
        ref={audioRef}
        src={audioSource}
        loop
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onError={handleAudioError}
      />

      {/* 
        PREMIUM TRANSLUCENT SQUARE CONTROLLER
        - Blends with page elements through a controlled translucent backdrop-blur lens.
        - Unified material surface: Background fills, light gradients, and borders are drawn on the same SVG structure, ensuring 100% perfect corner-to-edge material consistency.
        - Features a continuous, looping single-path perimeter outer-border orbit propagating smoothly through corners.
        - Absolute layout and typography stability at all times (perfectly static, zero sub-pixel shifting).
      */}
      <button
        onClick={toggleAudio}
        className="w-[74px] h-[74px] flex flex-col items-center justify-center text-center rounded-lg group cursor-pointer relative overflow-hidden backdrop-blur-md outline-none border-none select-none transition-shadow duration-1000"
        aria-label="Toggle Core Audio Experience"
      >
        {/* 
          Layer 1: HIGH-PRECISION UNIFIED SHADING SYSTEM & OUTLINE (SVG Coordinate Space) 
          Slightly inset elements (x="1.5", y="1.5", w="71", h="71") inside the 74x74 viewport 
          so that the thick stroke border and corners never touch limits and won't get cut off.
        */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none rounded-[inherit]" 
          viewBox="0 0 74 74" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Passive/Inactive warm platinum sunlight-style illumination */}
            <radialGradient id="passiveShading" cx="75%" cy="15%" r="100%">
              <stop offset="0%" stopColor="#f5ebe0" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0.45" />
            </radialGradient>

            {/* Active/Playing warm platinum sunlight-style illumination */}
            <radialGradient id="activeShading" cx="75%" cy="15%" r="100%">
              <stop offset="0%" stopColor="#f5ebe0" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#09090b" stopOpacity="0.8" />
            </radialGradient>
          </defs>

          {/* Base Shading Layer: Passive Base Paint */}
          <rect
            x="1.5"
            y="1.5"
            width="71"
            height="71"
            rx="6.5"
            fill="url(#passiveShading)"
            className="transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isPlaying ? 0 : 1 }}
          />

          {/* Active Shading Layer: Crossfades over Passive Base Paint */}
          <rect
            x="1.5"
            y="1.5"
            width="71"
            height="71"
            rx="6.5"
            fill="url(#activeShading)"
            className="transition-opacity duration-1000 ease-in-out"
            style={{ opacity: isPlaying ? 1 : 0 }}
          />

          {/* Static structural base outline */}
          <rect
            x="1.5"
            y="1.5"
            width="71"
            height="71"
            rx="6.5"
            className={`transition-colors duration-1000 ease-in-out ${
              isPlaying ? "stroke-white/20" : "stroke-white/10"
            }`}
            strokeWidth="1.5"
          />

          {/* High-fidelity continuous revolving perimeter segment (seamless corner propagation) */}
          <rect
            x="1.5"
            y="1.5"
            width="71"
            height="71"
            rx="6.5"
            className={`transition-all duration-1000 ease-in-out ${
              isPlaying ? "stroke-white/50 opacity-100" : "stroke-white/25 opacity-40"
            }`}
            strokeWidth="1.5"
            strokeLinecap="round"
            style={{
              strokeDasharray: "40 234",
              animation: "perimeterOrbit 6s linear infinite"
            }}
          />
        </svg>

        {/* Layer 2: Infinitely looping, seamless reflection/light-glint sweep */}
        <span 
          className="absolute inset-0 w-full h-full rounded-[inherit] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent pointer-events-none"
          style={{
            transform: "skewX(-15deg)",
            animation: "luxuryGlanceSweep 8s cubic-bezier(0.25, 1, 0.5, 1) infinite"
          }}
        />

        {/* 
          Layer 3: Centered, group-synchronized experience messaging
          - Fully static layout to guarantee absolute stability.
          - Perfect, unified state transition of text colors.
        */}
        <div className="flex flex-col gap-1 items-center justify-center font-mono text-[7px] font-bold tracking-[0.24em] leading-tight pointer-events-none select-none relative z-10 text-center">
          <span className={`transition-colors duration-1000 ease-in-out ${isPlaying ? "text-white" : "text-white/50 group-hover:text-white/85"}`}>
            AUDIO
          </span>
          <span className={`transition-colors duration-1000 ease-in-out font-extrabold ${isPlaying ? "text-white" : "text-white/50 group-hover:text-white/85"}`}>
            EXPERIENCE
          </span>
        </div>

        {/* 
          Layer 4: Minimal organic state-line indicator
          - Fully synchronized transition curve (same timing, same ease-in-out, same transition engine).
        */}
        <div 
          className={`absolute bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-[1.5px] pointer-events-none z-10 rounded-full transition-all duration-1000 ease-in-out ${
            isPlaying ? "bg-white/70" : "bg-white/10 group-hover:bg-white/40"
          }`} 
        />
      </button>

      {/* Styled animation matrices injected cleanly */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes luxuryGlanceSweep {
          0% {
            transform: translateX(-180%) skewX(-15deg);
            opacity: 0;
          }
          10% {
            opacity: 0;
          }
          20% {
            opacity: 0.12;
          }
          45% {
            opacity: 0.12;
          }
          55% {
            transform: translateX(180%) skewX(-15deg);
            opacity: 0;
          }
          100% {
            transform: translateX(180%) skewX(-15deg);
            opacity: 0;
          }
        }
        @keyframes perimeterOrbit {
          from {
            stroke-dashoffset: 274;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
      `}} />
    </div>
  );
}
