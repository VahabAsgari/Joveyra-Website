import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import InfiniteStack from "./InfiniteStack";

interface PanelSliderProps {
  id: string;
  slides: string[];
  interval?: number;
}

export default function PanelSlider({ id, slides, interval = 6000 }: PanelSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [slides.length, interval, isMobile]);

  const mobileItems = slides.map((slide, idx) => {
    // Strip soft-hyphens on mobile to keep text cohesive and readable
    const cleanSlide = slide.replace(/\u00AD/g, "");
    return (
      <div
        key={`slide-${idx}`}
        className="relative w-full h-[400px] sm:h-[440px] md:h-[480px] bg-zinc-900 border border-white/10 rounded-[24px] p-8 sm:p-10 md:p-12 flex flex-col justify-center shadow-2xl backdrop-blur-md select-none text-left overflow-y-auto"
      >
        <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-editorial text-neutral-200 font-light leading-relaxed tracking-wide text-left">
          {cleanSlide}
        </p>
      </div>
    );
  });

  if (isMobile) {
    return (
      <div className="w-full">
        <InfiniteStack items={mobileItems} itemKey={(i) => `${id}-slide-${i}`} />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div id={id} className="relative w-full h-[400px] sm:h-[440px] md:h-[480px] bg-zinc-900 border border-white/10 rounded-[24px] p-8 sm:p-10 md:p-12 flex flex-col justify-between shadow-2xl backdrop-blur-md select-none book-justified">
        <div className="relative z-10 flex-1 flex flex-col justify-start pt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="w-full book-justified"
            >
              <p className="text-2xl sm:text-3xl font-editorial text-neutral-200 font-light leading-snug tracking-wide book-justified">
                {slides[currentIndex]}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-white/5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className="relative py-2 flex-1 outline-none"
              title={`Switch to slide ${idx + 1}`}
            >
              <div className="h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-white transition-all duration-500 ${
                    currentIndex === idx ? "w-full opacity-60" : "w-0"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
