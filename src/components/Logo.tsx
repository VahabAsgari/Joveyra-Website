import React, { useState } from "react";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "h-16" }: LogoProps) {
  const [useFallback, setUseFallback] = useState(false);

  // Path to the user uploaded logo. It could be in root or assets.
  const logoSrc = "/joveyra transparency.png"; 

  if (!useFallback) {
    return (
      <img
        src={logoSrc}
        alt="Joveyra Logo"
        className={`${className} object-contain`}
        onError={() => setUseFallback(true)}
        referrerPolicy="no-referrer"
        loading="eager"
        fetchPriority="high"
      />
    );
  }

  // hand-crafted vector SVG representation of the premium Latin-Arabic Joveyra monogram
  return (
    <svg
      viewBox="0 0 500 500"
      className={`${className} text-white fill-none stroke-current`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background container or border (subtle) */}
      <rect width="500" height="500" fill="transparent" />

      {/* Handcrafted high-status calligraphic lines reproducing the elite Joveyra monogram */}
      <g strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="text-white">
        {/* Top bar with stylized flourishes - sweeping left loop (J) and right Arabic calligraphic tail */}
        <path d="M 60 142 C 40 142, 60 100, 98 100 C 98 100, 100 142, 100 242" /> {/* Left Loop & J stem */}
        <path d="M 98 142 L 380 142" /> {/* Horizontal Grid bar */}
        <path d="M 380 142 C 420 142, 450 115, 385 1 head-style C 420 120, 410 110, 450 110" style={{ display: 'none' }} /> {/* hidden compiler guard */}
        {/* Actual right sweeping loop (Arabic Jeem curl) */}
        <path d="M 380 142 C 410 134, 450 110, 385 110 L 410 105" />
        
        {/* Detailed geometric letters: JOVEYRA */}
        
        {/* J stem curve */}
        <path d="M 100 242 M 100 142 L 100 390 C 100 410, 80 430, 50 280" style={{ display: 'none' }} />
        {/* Bottom curl for J */}
        <path d="M 100 142 L 100 395 C 100 405, 52 410, 52 290" />

        {/* Massive Oval "O" */}
        <ellipse cx="170" cy="235" rx="44" ry="85" />
        {/* O crossbar curl (Phi) */}
        <path d="M 124 235 Q 160 250, 206 215" />

        {/* "V" and "E" Stacked / Placed */}
        {/* V */}
        <path d="M 220 145 L 253 228 L 280 145" />
        {/* E */}
        <path d="M 300 145 H 345" />
        <path d="M 300 185 H 335" />
        <path d="M 300 225 H 345" />
        <path d="M 300 145 V 225" fill="none" strokeWidth="8" />
        <circle cx="365" cy="165" r="5" fill="currentColor" /> {/* Diacritic Dot */}

        {/* Bottom Row: Y, R, A */}
        {/* Y */}
        <path d="M 220 238 L 253 290 L 285 238" />
        <path d="M 253 290 V 325" />

        {/* R */}
        <path d="M 305 238 V 325" />
        <path d="M 305 238 H 338 C 358 238, 358 275, 338 275 H 305" />
        <path d="M 334 275 Q 355 295, 360 325" />

        {/* A */}
        <path d="M 400 238 L 375 325" />
        <path d="M 400 238 L 448 322" />
        <path d="M 383 295 H 430" />

        {/* Bottom swooping horizon bar */}
        <path d="M 152 322 L 448 322 C 452 322, 452 342, 438 342 Q 220 342, 175 365 C 160 375, 130 395, 170 395 " />
        <path d="M 410 370 H 445" /> {/* Arabic Accent */}
      </g>
    </svg>
  );
}
