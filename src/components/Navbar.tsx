import React, { useEffect, useState } from "react";
import Logo from "./Logo";

const NAV_LINKS = [
  { id: "hero", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "strategies", label: "Evolution" },
  { id: "empirical", label: "Methodology" },
  { id: "contact", label: "Capital Access" },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // 1. Precise top-of-page check (Hero)
      if (scrollY < 120) {
        setActiveSection("hero");
        return;
      }
      
      // 2. Precise bottom-of-page ceiling check (Capital Access / Contact)
      if (scrollY + viewportHeight >= docHeight - 80) {
        setActiveSection(NAV_LINKS[NAV_LINKS.length - 1].id);
        return;
      }

      // 3. Middle viewport element tracking
      const elements = NAV_LINKS.map(link => document.getElementById(link.id)).filter(Boolean) as HTMLElement[];
      let bestSection = "";
      let minDistance = Infinity;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        
        // Check if section is currently intersecting our active reading zone
        const isPartiallyVisible = rect.top <= viewportHeight * 0.7 && rect.bottom >= viewportHeight * 0.2;
        if (isPartiallyVisible) {
          const elementCenter = rect.top + rect.height / 2;
          const viewportCenter = viewportHeight / 2;
          const distance = Math.abs(elementCenter - viewportCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            bestSection = el.id;
          }
        }
      });

      if (bestSection) {
        setActiveSection(bestSection);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed top-4 left-0 w-full px-4 z-50 flex justify-center">
      <nav 
        className="w-full max-w-4xl bg-black/90 border border-white/5 backdrop-blur-md px-6 py-3 rounded-full flex items-center transition-all duration-300"
      >
        <div className="w-full flex items-center justify-start sm:justify-center gap-x-4 sm:gap-x-8 whitespace-nowrap overflow-x-auto no-scrollbar">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`relative px-2 py-1 text-[10px] sm:text-[11px] tracking-widest transition-colors duration-300 uppercase select-none ${
                  isActive ? "text-white font-medium" : "text-white/50 hover:text-white/80"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
