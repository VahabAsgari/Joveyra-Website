import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  items: React.ReactNode[];
  itemKey: (index: number) => string;
  onItemClick?: (index: number) => void;
  defaultIndex?: number;
}

export default function InfiniteStack({ items, itemKey, onItemClick, defaultIndex = 0 }: Props) {
  const [index, setIndex] = useState(defaultIndex);
  const length = items.length;

  const [resetKey, setResetKey] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Automatic cycling (looping) on mobile/wherever rendered, resetting timer on user interaction
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % length);
    }, 4800);
    return () => clearInterval(timer);
  }, [length, resetKey]);

  const handleDragEnd = (_: any, info: any) => {
    const swipeOffset = info.offset.x;
    if (swipeOffset < -30) {
      setIndex((prev) => (prev + 1) % length);
      setResetKey((prev) => prev + 1); // Reset the autoplay interval
    } else if (swipeOffset > 30) {
      setIndex((prev) => (prev - 1 + length) % length);
      setResetKey((prev) => prev + 1); // Reset the autoplay interval
    }
  };

  return (
    <div className="relative w-full h-[480px] overflow-hidden flex items-center justify-center">
      <AnimatePresence initial={false}>
        {items.map((item, i) => {
          let distance = i - index;
          if (distance > length / 2) distance -= length;
          if (distance < -length / 2) distance += length;

          const isActive = distance === 0;

          return (
            <motion.div
              key={itemKey(i)}
              drag="x"
              dragDirectionLock={true}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(event, info) => {
                handleDragEnd(event, info);
                setTimeout(() => setIsDragging(false), 50);
              }}
              onTap={() => {
                if (!isDragging && isActive) {
                  onItemClick?.(i);
                }
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: Math.abs(distance) > 1 ? 0 : 1,
                x: distance * 100,
                scale: isActive ? 1 : 0.85,
                zIndex: length - Math.abs(distance),
                filter: isActive ? "blur(0px)" : "blur(3px)",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute w-[88%] sm:w-[80%] max-w-[380px] cursor-grab active:cursor-grabbing rounded-[24px] overflow-hidden"
              style={{
                willChange: "transform",
                pointerEvents: Math.abs(distance) <= 1 ? "auto" : "none"
              }}
            >
              <div className="w-full h-full rounded-[24px] overflow-hidden backface-hidden">
                {item}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
