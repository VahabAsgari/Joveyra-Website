import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { CARDS } from "../data";
import MobileCardCarousel from "./MobileCardCarousel";
import { RegimeCascadeVisual, HighFrequencySignalVisual, ArbitrageDispersionVisual } from "./Visuals";

export default function ExpandableCards() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedId ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedId]);

  const selectedCard = CARDS.find((card) => card.id === selectedId);

  return (
    <div id="strategic-vectors" className="w-full">
      <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 w-full">
        {CARDS.map((card) => (
          <div 
            key={card.id} 
            className="flex flex-col group cursor-pointer"
            onClick={() => setSelectedId(card.id)}
          >
            <div className="w-full aspect-[1080/1350] rounded-[24px] overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 bg-zinc-950/70 relative shadow-lg">
              <img 
                src={card.image} 
                alt={card.shortLabel} 
                className={`w-full h-full object-cover ${
                  card.id === "regime" 
                    ? "object-[center_5%]" 
                    : card.id === "hf"
                    ? "object-[center_10%]"
                    : "object-[center_15%]"
                } transition-transform duration-700 ease-out group-hover:scale-[1.03] select-none`} 
                referrerPolicy="no-referrer" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-30 transition-opacity duration-300" />
            </div>
            <div className="mt-4 px-1 text-center">
              <h3 className="text-lg md:text-xl font-editorial text-neutral-300 group-hover:text-white transition-colors duration-200 font-light tracking-wide analog-text-subtle">
                {card.shortLabel}
              </h3>
            </div>
          </div>
        ))}
      </div>
      <div className="md:hidden">
        <MobileCardCarousel onCardClick={setSelectedId} />
      </div>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {selectedId && selectedCard && (
            <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/92 backdrop-blur-md cursor-pointer" onClick={() => setSelectedId(null)} aria-hidden="true" />
              <motion.div layoutId={`modal-container-${selectedId}`} initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} transition={{ type: "spring", stiffness: 220, damping: 25 }} className="relative w-full max-w-4xl bg-zinc-900 border border-white/[0.08] rounded-[24px] overflow-hidden shadow-2xl z-10 flex flex-col h-[640px] max-h-[90vh]">
                <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none z-0">
                  <img src={selectedCard.image} alt="" className="w-full h-full object-cover scale-[1.02] filter blur-[4px] opacity-[0.035] saturate-[0.20]" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-zinc-900/60" />
                </div>
                <button type="button" onClick={() => setSelectedId(null)} className="absolute top-4 right-4 z-20 p-1.5 rounded-full bg-white/[0.03] border border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200 cursor-pointer focus:outline-none animate-flicker" aria-label="Close expanded view">
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="relative z-10 px-6 py-6 sm:px-10 sm:py-8 md:px-12 md:py-8 flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch h-full min-h-0 overflow-hidden">
                    <div className="col-span-1 md:col-span-7 flex flex-col text-left h-full overflow-y-auto no-scrollbar pr-2 md:pr-6">
                      <div className="py-2">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight leading-tight mb-4 text-left pr-10 md:pr-0 animate-flicker">{selectedCard.title}</h2>
                        <div className="h-[1px] w-16 bg-white/20 mb-8" />
                        <div className="max-w-[45ch] book-justified">
                          <p className="text-base sm:text-lg lg:text-xl font-editorial text-neutral-300 font-light leading-relaxed tracking-wide book-justified whitespace-pre-line select-text">{selectedCard.text}</p>
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:flex col-span-5 h-full border-l border-white/[0.06] pl-8 flex-col justify-center relative select-none gap-4">
                      {selectedCard.id === "regime" && <RegimeCascadeVisual />}
                      {selectedCard.id === "hf" && <HighFrequencySignalVisual />}
                      {selectedCard.id === "arbitrage" && <ArbitrageDispersionVisual />}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

