import React from "react";
import { CARDS } from "../data";
import InfiniteStack from "./InfiniteStack";
import { RegimeCascadeVisual, HighFrequencySignalVisual, ArbitrageDispersionVisual } from "./Visuals";

interface Props {
  onCardClick: (id: string) => void;
}

export default function MobileCardCarousel({ onCardClick }: Props) {
  const getMobileImage = (imagePath: string) => {
    if (imagePath.includes("HF-10.png")) return "/HF-10 Mobile.png";
    if (imagePath.includes("MR-22.png")) return "/MR-22 Mobile.png";
    if (imagePath.includes("AH-Website.png")) return "/AH-Website2 Mobile.png";
    return imagePath;
  };

  const items = CARDS.map((card) => {
    const mobileImage = getMobileImage(card.image);
    const isRegime = card.id === "regime";
    return (
      <div
        key={card.id}
        className="w-full aspect-[1080/1350] rounded-[24px] overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl flex flex-col cursor-pointer"
      >
        <div className={`relative w-full overflow-hidden ${card.id === "hf" ? "h-[45%]" : "h-[60%]"}`}>
          <img
            src={mobileImage}
            alt={card.shortLabel}
            className={`w-full h-full object-cover select-none ${
              isRegime 
                ? "object-[center_10%]" 
                : card.id === "hf"
                ? "object-[center_18%]"
                : "object-[center_28%]"
            }`}
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black to-transparent">
            <h3 className="text-white text-center font-editorial">{card.shortLabel}</h3>
          </div>
        </div>
        <div className="flex-1 w-full p-4 bg-zinc-950 overflow-hidden">
          {card.id === "regime" && <RegimeCascadeVisual />}
          {card.id === "hf" && <HighFrequencySignalVisual isMobileCarousel={true} />}
          {card.id === "arbitrage" && <ArbitrageDispersionVisual />}
        </div>
      </div>
    );
  });

  return (
    <InfiniteStack 
      items={items} 
      itemKey={(i) => CARDS[i].id}
      onItemClick={(index) => onCardClick(CARDS[index].id)}
      defaultIndex={2}
    />
  );
}
