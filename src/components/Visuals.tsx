import React, { useState, useEffect } from "react";

// Box-Muller transform for standard Gaussian normal random generation
function randomNormal() {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); 
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function RegimeCascadeVisual() {
  const [tick, setTick] = useState(0);
  
  // Transition matrix P defined for Hamilton filter and simulation:
  // P[i][j] is transition from state i to state j. High self-transition (98%+) represents realistic regime persistence.
  const P = [
    [0.985, 0.012, 0.003],  // Bull stays Bull
    [0.015, 0.970, 0.015],  // Mean-Reverting stays Mean-Reverting
    [0.005, 0.025, 0.970]   // Turbulent Bear stays Turbulent
  ];

  // Mus and sigmas for Low Vol Bull, Mean-Reverting/Sideways, and High Vol Turbulent Bear
  const mus = [0.12, 0.01, -0.36];
  const sigmas = [0.09, 0.22, 0.58];

  const [priceHistory, setPriceHistory] = useState<{ price: number; regime: number; p0: number; p1: number; p2: number }[]>(() => {
    let curPrice = 100.0;
    let curRegime = 0;
    let filterProbs = [0.85, 0.10, 0.05]; // Initial prior
    
    const history = [];
    for (let i = 0; i < 44; i++) {
      // 1. Regime transition
      const roll = Math.random();
      const pRow = P[curRegime];
      let nextRegime = 0;
      if (roll < pRow[0]) {
        nextRegime = 0;
      } else if (roll < pRow[0] + pRow[1]) {
        nextRegime = 1;
      } else {
        nextRegime = 2;
      }

      // 2. Pricing return with Box-Muller Gaussian Noise
      const z = randomNormal();
      let drift = mus[nextRegime];
      if (nextRegime === 1) {
        // Mean reversion pull to 100
        drift += 0.02 * (100 - curPrice);
      }
      const vol = sigmas[nextRegime];
      const ret = drift + z * vol;
      let nextPrice = curPrice + ret;
      nextPrice = Math.max(72, Math.min(140, nextPrice));

      const observedReturn = nextPrice - curPrice;

      // 3. Hamilton estimator step (Bayesian recursive update)
      // Predict:
      const pred = [0, 0, 0];
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          pred[j] += filterProbs[k] * P[k][j];
        }
      }

      // Update densities:
      const dens = [0, 0, 0];
      for (let j = 0; j < 3; j++) {
        const diff = observedReturn - mus[j];
        const variance = sigmas[j] * sigmas[j];
        dens[j] = (1 / (Math.sqrt(2 * Math.PI) * sigmas[j])) * Math.exp(-(diff * diff) / (2 * variance));
      }

      const post = [pred[0] * dens[0], pred[1] * dens[1], pred[2] * dens[2]];
      const sum = post[0] + post[1] + post[2] || 1.0;
      filterProbs = [post[0] / sum, post[1] / sum, post[2] / sum];

      curPrice = nextPrice;
      curRegime = nextRegime;

      history.push({
        price: curPrice,
        regime: curRegime,
        p0: filterProbs[0],
        p1: filterProbs[1],
        p2: filterProbs[2]
      });
    }
    return history;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Update Monte Carlo Markov Chain dynamic step
  useEffect(() => {
    if (tick === 0) return;
    setPriceHistory(prev => {
      const lastPoint = prev[prev.length - 1];
      const curPrice = lastPoint.price;
      const curRegime = lastPoint.regime;
      const curFilter = [lastPoint.p0, lastPoint.p1, lastPoint.p2];

      const roll = Math.random();
      const pRow = P[curRegime];
      let nextRegime = 0;
      if (roll < pRow[0]) {
        nextRegime = 0;
      } else if (roll < pRow[0] + pRow[1]) {
        nextRegime = 1;
      } else {
        nextRegime = 2;
      }

      const z = randomNormal();
      let drift = mus[nextRegime];
      if (nextRegime === 1) {
        drift += 0.02 * (100 - curPrice);
      }
      const vol = sigmas[nextRegime];
      const ret = drift + z * vol;
      let nextPrice = curPrice + ret;
      nextPrice = Math.max(72, Math.min(140, nextPrice));

      const observedReturn = nextPrice - curPrice;

      // Hamilton predict step
      const pred = [0, 0, 0];
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 3; k++) {
          pred[j] += curFilter[k] * P[k][j];
        }
      }

      // Update densities
      const dens = [0, 0, 0];
      for (let j = 0; j < 3; j++) {
        const diff = observedReturn - mus[j];
        const variance = sigmas[j] * sigmas[j];
        dens[j] = (1 / (Math.sqrt(2 * Math.PI) * sigmas[j])) * Math.exp(-(diff * diff) / (2 * variance));
      }

      const post = [pred[0] * dens[0], pred[1] * dens[1], pred[2] * dens[2]];
      const sum = post[0] + post[1] + post[2] || 1.0;
      const nextFilter = [post[0] / sum, post[1] / sum, post[2] / sum];

      return [...prev.slice(1), {
        price: nextPrice,
        regime: nextRegime,
        p0: nextFilter[0],
        p1: nextFilter[1],
        p2: nextFilter[2]
      }];
    });
  }, [tick]);

  const activeRegime = priceHistory[priceHistory.length - 1].regime;

  const prices = priceHistory.map(p => p.price);
  const maxP = Math.max(...prices);
  const minP = Math.min(...prices);
  const range = (maxP - minP) || 1;

  const mapX = (idx: number) => 15 + idx * (180 / (priceHistory.length - 1));
  const mapY_Price = (p: number) => 48 - ((p - minP) / range) * 38;
  const mapY_Prob = (prob: number) => 102 - prob * 30;

  const stateLabels = ["LOW_VOL_BULL", "MEAN_REVERT", "HIGH_VOL_TURB"];
  const stateColors = ["text-emerald-400", "text-amber-400", "text-rose-400"];

  const time = tick * 0.05;
  const volVal = activeRegime === 0 
    ? 10.55 + Math.sin(time * 0.6) * 0.45 
    : activeRegime === 1 
    ? 17.15 + Math.cos(time * 0.4) * 0.70 
    : 32.40 + Math.sin(time * 0.9) * 2.10;

  const trendVal = activeRegime === 0
    ? 38.2 + Math.cos(time * 0.5) * 1.2
    : activeRegime === 1
    ? 12.4 + Math.sin(time * 0.3) * 0.9
    : 61.5 + Math.cos(time * 0.7) * 2.8;

  const sharpeVal = activeRegime === 0
    ? 2.45 + Math.sin(time * 0.4) * 0.04
    : activeRegime === 1
    ? 0.18 + Math.cos(time * 0.3) * 0.07
    : -1.82 + Math.sin(time * 0.8) * 0.18;

  // Render probability paths for visualizer
  const getProbPath = (key: 'p0' | 'p1' | 'p2') => {
    let d = "";
    priceHistory.forEach((pt, i) => {
      const x = mapX(i);
      const y = mapY_Prob(pt[key]);
      if (i === 0) d += `M ${x},${y}`;
      else d += ` L ${x},${y}`;
    });
    return d;
  };

  const getProbAreaPath = (key: 'p0' | 'p1' | 'p2') => {
    const lineD = getProbPath(key);
    if (!lineD) return "";
    const startX = mapX(0);
    const endX = mapX(priceHistory.length - 1);
    return `${lineD} L ${endX},102 L ${startX},102 Z`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-[280px] h-full max-h-[400px] flex flex-col justify-center py-2 text-zinc-400 font-mono text-[9px] gap-3">
        {/* Hidden Markov Model Panel */}
        <div className="relative w-full border border-white/[0.04] bg-zinc-950/40 rounded-xl p-3 flex flex-col justify-between" style={{ minHeight: "195px" }}>
          <div className="flex justify-between items-center text-zinc-500 border-b border-white/[0.03] pb-1">
            <span className="tracking-wider uppercase font-semibold text-[7px] text-zinc-500">Regime Filtering (HMM)</span>
            <span className={`font-bold uppercase text-[7.5px] tracking-wider transition-colors duration-300 ${stateColors[activeRegime]}`}>
              {stateLabels[activeRegime]}
            </span>
          </div>
          
          <div className="relative w-full flex-1 mt-1.5 h-[130px]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 110" fill="none">
              {/* True Regime Background Shaded Bands */}
              {priceHistory.map((pt, i) => {
                if (i === 0) return null;
                const x1 = mapX(i - 1);
                const x2 = mapX(i);
                
                const bgFill = 
                  pt.regime === 0 
                  ? "rgba(16,185,129,0.03)" 
                  : pt.regime === 1 
                  ? "rgba(245,158,11,0.03)" 
                  : "rgba(239,68,68,0.03)";

                return (
                  <rect
                    key={`bg-${i}`}
                    x={x1}
                    y={5}
                    width={x2 - x1 + 0.5}
                    height={43}
                    fill={bgFill}
                  />
                );
              })}

              {/* Reference Gridlines & Labels */}
              <line x1="15" y1="5" x2="195" y2="5" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
              <line x1="15" y1="26" x2="195" y2="26" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
              <line x1="15" y1="48" x2="195" y2="48" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <text x="15" y="11" fill="rgba(255,255,255,0.18)" className="text-[5px] font-semibold tracking-wider font-mono uppercase">ASSET PRICE & TRUE STATE</text>

              {/* Segmented natural market pricing line */}
              {priceHistory.map((pt, i) => {
                if (i === 0) return null;
                const prevPt = priceHistory[i - 1];
                const x1 = mapX(i - 1);
                const y1 = mapY_Price(prevPt.price);
                const x2 = mapX(i);
                const y2 = mapY_Price(pt.price);

                const strokeColor = 
                  pt.regime === 0 
                  ? "rgba(16,185,129,0.85)" 
                  : pt.regime === 1 
                  ? "rgba(245,158,11,0.85)" 
                  : "rgba(239,68,68,0.85)";

                return (
                  <line
                    key={`line-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={1.2}
                    strokeLinecap="round"
                    className="transition-all duration-150 ease-out"
                  />
                );
              })}

              {/* Probability filtering chart dividers */}
              <line x1="15" y1="72" x2="195" y2="72" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
              <line x1="15" y1="102" x2="195" y2="102" stroke="rgba(255,255,255,0.07)" strokeWidth="0.5" />
              <text x="15" y="67" fill="rgba(255,255,255,0.18)" className="text-[5px] font-semibold tracking-wider font-mono uppercase">POSTERIOR PROB (HAMILTON FILTER)</text>

              {/* Probabilities Area Fills & Boundary Lines */}
              <path d={getProbAreaPath('p0')} fill="rgba(16,185,129,0.04)" />
              <path d={getProbAreaPath('p1')} fill="rgba(245,158,11,0.04)" />
              <path d={getProbAreaPath('p2')} fill="rgba(239,68,68,0.04)" />

              <path d={getProbPath('p0')} stroke="#10b981" strokeWidth="0.8" strokeLinecap="round" className="transition-all duration-150" />
              <path d={getProbPath('p1')} stroke="#f59e0b" strokeWidth="0.8" strokeLinecap="round" className="transition-all duration-150" />
              <path d={getProbPath('p2')} stroke="#ef4444" strokeWidth="0.8" strokeLinecap="round" className="transition-all duration-150" />
            </svg>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 border-t border-white/[0.03] text-[6.5px] text-zinc-500 font-bold uppercase">
            <div className="flex flex-col">
              <span>Realized Vol</span>
              <span className="text-zinc-300 tabular-nums font-semibold mt-0.5">{volVal.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col text-center">
              <span>Trend (ADX)</span>
              <span className="text-zinc-300 tabular-nums font-semibold mt-0.5">{trendVal.toFixed(1)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span>Sharpe Est</span>
              <span className="text-zinc-300 tabular-nums font-semibold mt-0.5">{sharpeVal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Transition matrix */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[7.5px] text-zinc-500 uppercase tracking-wider pl-1 font-semibold">Regime Transition P(S_t | S_t-1)</span>
          <div className="grid grid-cols-4 gap-1 bg-zinc-950/30 p-2 rounded-xl border border-white/[0.04]">
            {P.map((row, rIdx) => (
              <React.Fragment key={rIdx}>
                <div className="text-[7px] text-zinc-500 flex items-center justify-left pl-1 uppercase font-semibold">Reg_{rIdx}</div>
                {row.map((val, cIdx) => {
                  const isActive = rIdx === cIdx;
                  const isTransitionActive = rIdx === activeRegime;
                  return (
                    <div 
                      key={cIdx} 
                      className={`text-center py-1 font-mono text-[8px] rounded-md border transition-all duration-300 tabular-nums ${
                        isActive 
                          ? isTransitionActive
                            ? "bg-white/[0.04] border-white/20 text-white font-bold shadow-sm shadow-white/[0.03]"
                            : "bg-white/[0.02] border-white/10 text-zinc-300 font-semibold" 
                          : "border-transparent text-zinc-650 hover:text-zinc-550"
                      }`}
                    >
                      {val.toFixed(4)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HighFrequencySignalVisual({ isMobileCarousel = false }: { isMobileCarousel?: boolean }) {
  const [market, setMarket] = useState({
    price: 104.18,
    spread: 0.012,
    ask6Vol: 1050,
    ask5Vol: 980,
    ask4Vol: 920,
    ask3Vol: 910,
    ask2Vol: 820,
    ask1Vol: 650,
    bid1Vol: 710,
    bid2Vol: 940,
    bid3Vol: 1050,
    bid4Vol: 1110,
    bid5Vol: 1160,
    bid6Vol: 1220,
  });

  const [events, setEvents] = useState<{ time: string, action: string, qty: number, venue: string }[]>(
    Array.from({length: 18}, (v, i) => {
      const min = Math.max(0, 1 + i);
      return { 
        time: "09:30:" + (min < 10 ? "0" + min : min), 
        action: i % 2 === 0 ? "FILL" : i % 3 === 0 ? "CANCEL" : "NEW", 
        qty: 100 + i * 110, 
        venue: ["IEX", "BATS", "NYSE", "ARCA"][i % 4] 
      };
    })
  );

  useEffect(() => {
    const venues = ["IEX", "BATS", "NYSE", "ARCA"];
    const actions = ["NEW", "FILL", "CANCEL"];
    const interval = setInterval(() => {
        setMarket(prev => ({
            price: Number((prev.price + (Math.random() * 0.016 - 0.008)).toFixed(3)),
            spread: Number((0.006 + Math.random() * 0.005).toFixed(4)),
            ask6Vol: Math.max(120, Math.min(1450, prev.ask6Vol + Math.floor(Math.random() * 110 - 55))),
            ask5Vol: Math.max(120, Math.min(1450, prev.ask5Vol + Math.floor(Math.random() * 110 - 55))),
            ask4Vol: Math.max(120, Math.min(1450, prev.ask4Vol + Math.floor(Math.random() * 110 - 55))),
            ask3Vol: Math.max(120, Math.min(1450, prev.ask3Vol + Math.floor(Math.random() * 110 - 55))),
            ask2Vol: Math.max(120, Math.min(1450, prev.ask2Vol + Math.floor(Math.random() * 110 - 55))),
            ask1Vol: Math.max(120, Math.min(1450, prev.ask1Vol + Math.floor(Math.random() * 110 - 55))),
            bid1Vol: Math.max(120, Math.min(1450, prev.bid1Vol + Math.floor(Math.random() * 110 - 55))),
            bid2Vol: Math.max(120, Math.min(1450, prev.bid2Vol + Math.floor(Math.random() * 110 - 55))),
            bid3Vol: Math.max(120, Math.min(1450, prev.bid3Vol + Math.floor(Math.random() * 110 - 55))),
            bid4Vol: Math.max(120, Math.min(1450, prev.bid4Vol + Math.floor(Math.random() * 110 - 55))),
            bid5Vol: Math.max(120, Math.min(1450, prev.bid5Vol + Math.floor(Math.random() * 110 - 55))),
            bid6Vol: Math.max(120, Math.min(1450, prev.bid6Vol + Math.floor(Math.random() * 110 - 55))),
        }));

        setEvents(prev => {
            const now = new Date();
            const newEvent = { 
                time: now.toLocaleTimeString().slice(-8), 
                action: actions[Math.floor(Math.random()*actions.length)], 
                qty: Math.floor(Math.random()*850)+100, 
                venue: venues[Math.floor(Math.random()*venues.length)] 
            };
            return [newEvent, ...prev.slice(0, 17)];
        });
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const totalAskVol = market.ask1Vol + market.ask2Vol + market.ask3Vol + market.ask4Vol + market.ask5Vol + market.ask6Vol;
  const totalBidVol = market.bid1Vol + market.bid2Vol + market.bid3Vol + market.bid4Vol + market.bid5Vol + market.bid6Vol;
  const totalVol = totalAskVol + totalBidVol || 1;
  
  const maxTierVol = Math.max(
    market.ask6Vol, market.ask5Vol, market.ask4Vol, market.ask3Vol, market.ask2Vol, market.ask1Vol, 
    market.bid1Vol, market.bid2Vol, market.bid3Vol, market.bid4Vol, market.bid5Vol, market.bid6Vol
  ) || 1;

  const ask6Weight = market.ask6Vol / maxTierVol;
  const ask5Weight = market.ask5Vol / maxTierVol;
  const ask4Weight = market.ask4Vol / maxTierVol;
  const ask3Weight = market.ask3Vol / maxTierVol;
  const ask2Weight = market.ask2Vol / maxTierVol;
  const ask1Weight = market.ask1Vol / maxTierVol;
  const bid1Weight = market.bid1Vol / maxTierVol;
  const bid2Weight = market.bid2Vol / maxTierVol;
  const bid3Weight = market.bid3Vol / maxTierVol;
  const bid4Weight = market.bid4Vol / maxTierVol;
  const bid5Weight = market.bid5Vol / maxTierVol;
  const bid6Weight = market.bid6Vol / maxTierVol;

  const bidRatio = totalBidVol / totalVol;
  const askRatio = totalAskVol / totalVol;

  return (
    <div className="w-full h-full flex items-center justify-center mx-auto self-center select-none">
      <div className={`w-full max-w-[280px] flex flex-col justify-center items-stretch bg-transparent self-center ${
        isMobileCarousel ? "h-full gap-0.75 p-0.5 text-[7px]" : "h-[415px] gap-1.5 p-1.5 text-[8px]"
      } font-mono text-zinc-400 overflow-hidden`}>

        {/* L2 Book Rows - 12 tiers (6 asks on top, 6 bids on bottom) */}
        <div className={`flex flex-col bg-zinc-950/40 border border-white/[0.03] rounded-xl ${
          isMobileCarousel ? "p-1 gap-[0.25px]" : "p-1.5 gap-[0.5px]"
        }`}>
          {/* Ask 6 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.02] transition-all duration-300 ease-out" 
              style={{ width: `${ask6Weight * 100}%` }}
            />
            <span className={`text-zinc-650 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 6</span>
            <span className={`z-10 tabular-nums text-rose-500/40 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread + 0.025).toFixed(3)}</span>
            <span className={`z-10 text-zinc-600 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask6Vol}</span>
          </div>

          {/* Ask 5 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.04] transition-all duration-300 ease-out" 
              style={{ width: `${ask5Weight * 100}%` }}
            />
            <span className={`text-zinc-[600] ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 5</span>
            <span className={`z-10 tabular-nums text-rose-500/50 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread + 0.020).toFixed(3)}</span>
            <span className={`z-10 text-zinc-550 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask5Vol}</span>
          </div>

          {/* Ask 4 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.06] transition-all duration-300 ease-out" 
              style={{ width: `${ask4Weight * 100}%` }}
            />
            <span className={`text-zinc-600 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 4</span>
            <span className={`z-10 tabular-nums text-rose-500/65 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread + 0.015).toFixed(3)}</span>
            <span className={`z-10 text-zinc-500 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask4Vol}</span>
          </div>

          {/* Ask 3 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.09] transition-all duration-300 ease-out" 
              style={{ width: `${ask3Weight * 100}%` }}
            />
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 3</span>
            <span className={`z-10 tabular-nums text-rose-400/80 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread + 0.010).toFixed(3)}</span>
            <span className={`z-10 text-zinc-400 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask3Vol}</span>
          </div>

          {/* Ask 2 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.13] transition-all duration-300 ease-out" 
              style={{ width: `${ask2Weight * 100}%` }}
            />
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 2</span>
            <span className={`z-10 tabular-nums text-rose-400/90 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread + 0.005).toFixed(3)}</span>
            <span className={`z-10 text-zinc-300 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask2Vol}</span>
          </div>

          {/* Ask 1 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute right-0 top-0 bottom-0 bg-rose-500/[0.18] transition-all duration-300 ease-out" 
              style={{ width: `${ask1Weight * 100}%` }}
            />
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Ask 1</span>
            <span className={`z-10 tabular-nums text-rose-400/95 font-semibold font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price + market.spread / 2).toFixed(3)}</span>
            <span className={`z-10 text-zinc-200 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.ask1Vol}</span>
          </div>

          {/* Spread / Mid-Price Line */}
          <div className={`flex justify-between items-center border-y border-white/[0.03] text-zinc-400 font-bold bg-zinc-950/25 px-1.5 ${
            isMobileCarousel ? "py-[1px] my-0.25 text-[5.5px]" : "py-[1.5px] my-0.5 text-[6.5px]"
          }`}>
            <span className="text-zinc-500 font-semibold">MID: {market.price.toFixed(3)}</span>
            <span className="text-zinc-500 tabular-nums uppercase">SPRD: {market.spread.toFixed(4)}</span>
          </div>

          {/* Bid 1 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.18] transition-all duration-300 ease-out" 
              style={{ width: `${bid1Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-200 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.bid1Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-400/95 font-semibold font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price - market.spread / 2).toFixed(3)}</span>
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 1</span>
          </div>

          {/* Bid 2 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.13] transition-all duration-300 ease-out" 
              style={{ width: `${bid2Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-300 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.bid2Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-400/90 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price - market.spread - 0.005).toFixed(3)}</span>
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 2</span>
          </div>

          {/* Bid 3 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.09] transition-all duration-300 ease-out" 
              style={{ width: `${bid3Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-400 font-bold tabular-nums ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{market.bid3Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-400/80 font-mono ${isMobileCarousel ? "text-[6px]" : "text-[7px]"}`}>{(market.price - market.spread - 0.010).toFixed(3)}</span>
            <span className={`text-zinc-500 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 3</span>
          </div>

          {/* Bid 4 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.06] transition-all duration-300 ease-out" 
              style={{ width: `${bid4Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-500 font-bold tabular-nums text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{market.bid4Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-500/65 font-mono text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{(market.price - market.spread - 0.015).toFixed(3)}</span>
            <span className={`text-zinc-[600] ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 4</span>
          </div>

          {/* Bid 5 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.04] transition-all duration-300 ease-out" 
              style={{ width: `${bid5Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-550 font-bold tabular-nums text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{market.bid5Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-500/50 font-mono text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{(market.price - market.spread - 0.020).toFixed(3)}</span>
            <span className={`text-zinc-650 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 5</span>
          </div>

          {/* Bid 6 */}
          <div className={`relative flex justify-between items-center rounded-[1px] overflow-hidden px-1.5 ${
            isMobileCarousel ? "h-[8.5px]" : "h-[11px]"
          }`}>
            <div 
              className="absolute left-0 top-0 bottom-0 bg-emerald-500/[0.02] transition-all duration-300 ease-out" 
              style={{ width: `${bid6Weight * 100}%` }}
            />
            <span className={`z-10 text-zinc-600 font-bold tabular-nums text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{market.bid6Vol}</span>
            <span className={`z-10 tabular-nums text-emerald-500/40 font-mono text-[7px] ${isMobileCarousel ? "text-[6px]" : ""}`}>{(market.price - market.spread - 0.025).toFixed(3)}</span>
            <span className={`text-zinc-650 ${isMobileCarousel ? "text-[5.5px]" : "text-[6.5px]"}`}>Bid 6</span>
          </div>
        </div>

        {/* Dynamic Weight Distribution Bar */}
        <div className="flex flex-col gap-0.5 px-0.5">
          <div className={`flex justify-between uppercase tracking-wider text-zinc-600 font-bold ${
            isMobileCarousel ? "text-[5px] pb-0" : "text-[6px] pb-[1px]"
          }`}>
            <span>Bid: {(bidRatio * 100).toFixed(0)}%</span>
            <span>Ask: {(askRatio * 100).toFixed(0)}%</span>
          </div>
          <div className={`bg-zinc-950 rounded-[1px] overflow-hidden flex border border-white/[0.02] ${
            isMobileCarousel ? "h-[2px]" : "h-1"
          }`}>
            <div 
              className="h-full bg-emerald-500/35 transition-all duration-500" 
              style={{ width: `${bidRatio * 100}%` }}
            />
            <div 
              className="h-full bg-rose-500/35 transition-all duration-500" 
              style={{ width: `${askRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Execution Stream (18 Orders total, scrollable window) */}
        {!isMobileCarousel && (
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col mt-0.5 border-t border-white/[0.03] pt-1.5 gap-[1px] h-[190px]">
             {events.map((e, i) => (
                  <div key={i} className="flex justify-between items-center text-[7px] py-[1px] text-zinc-500 hover:bg-white/[0.015] px-1 shrink-0 h-[10px]">
                      <span className="w-[45px] shrink-0 tabular-nums text-left text-[6.5px]">{e.time}</span>
                      <span className={`w-[40px] shrink-0 font-bold text-left text-[6.5px] ${e.action === "FILL" ? "text-emerald-500/80" : e.action === "CANCEL" ? "text-rose-500/80" : "text-zinc-300"}`}>{e.action}</span>
                      <span className="w-[50px] shrink-0 text-right tabular-nums text-[6.5px] font-semibold text-zinc-400 pr-1">{e.qty}</span>
                      <span className="w-[30px] shrink-0 text-right font-bold text-[6.5px] text-zinc-650">{e.venue}</span>
                  </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ArbitrageDispersionVisual() {
  const [riskMap, setRiskMap] = useState<{ v: number; t: number; c: number }[]>(
    Array(16).fill(null).map(() => ({ 
      v: 0.15 + Math.random() * 0.15, 
      t: 0.25, 
      c: Math.floor(Math.random() * 50) 
    }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRiskMap(prev => {
        const activeYellows = prev.filter(c => c.t === 0.55).length;
        const activeReds = prev.filter(c => c.t === 0.85).length;

        const next = prev.map(cell => {
          let newTarget = cell.t;
          let newCooldown = Math.max(0, cell.c - 1);

          // State Transition Hierarchy Logic
          if (newCooldown === 0) {
            const roll = Math.random();
            if (cell.t === 0.25) {
              // Baseline Green -> Yellow (Frequent enough to be visible) or White (Very Rare)
              if (roll < 0.12 && activeYellows < 4) { 
                newTarget = 0.55; 
                newCooldown = 8 + Math.floor(Math.random() * 8); 
              } else if (roll < 0.005) {
                newTarget = 0.03; 
                newCooldown = 15;
              }
            } else if (cell.t === 0.55) {
              // Yellow -> Red (Occasional Spike) or back to Green
              if (roll < 0.25 && activeReds < 2) {
                newTarget = 0.85;
                newCooldown = 6 + Math.floor(Math.random() * 4);
              } else {
                newTarget = 0.25;
                newCooldown = 12;
              }
            } else {
              // Red or White -> Return to Green baseline
              newTarget = 0.25;
              newCooldown = 15;
            }
          }

          // More responsive interpolation
          const drift = (newTarget - cell.v) * 0.15;
          const jitter = (Math.random() - 0.5) * 0.05; 
          const newV = Math.max(0.01, Math.min(0.98, cell.v + drift + jitter));

          return { v: newV, t: newTarget, c: newCooldown };
        });

        const total = next.reduce((a, b) => a + b.v, 0);
        if (total > 6.0) {
           const factor = 6.0 / total;
           return next.map(c => ({ ...c, v: c.v * factor }));
        }
        return next;
      });
    }, 600); 
    return () => clearInterval(interval);
  }, []);

  const getColor = (v: number) => {
    if (v < 0.09) return "rgba(255, 255, 255, 0.15)"; // White
    if (v < 0.45) return "rgba(16, 185, 129, 0.25)";  // Green
    if (v < 0.75) return "rgba(245, 158, 11, 0.35)";  // Yellow
    return "rgba(225, 29, 72, 0.45)";                // Red
  };

  const totalVal = riskMap.reduce((sum, cell) => sum + cell.v, 0);
  const displayScale = totalVal > 1.0 ? 1.0 / totalVal : 1.0;

  return (
    <div className="w-full h-full p-1 flex flex-col gap-1 text-[8px] font-mono text-zinc-400">
      <div className="text-zinc-500 uppercase border-b border-white/[0.05] pb-0.5 font-semibold">Portfolio Weighting</div>
      <div className="flex-1 grid grid-cols-4 gap-0.5">
      {riskMap.map((cell, i) => {
         const displayedVal = cell.v * displayScale;
         return (
           <div key={i} className="flex items-center justify-center transition-colors duration-[700ms] border border-white/[0.01]" style={{ backgroundColor: getColor(cell.v) }}>
              <span className="text-[6px] text-white/30 tabular-nums">{displayedVal.toFixed(3)}</span>
           </div>
         );
      })}
      </div>
      <div className="pt-0.5 border-t border-white/[0.05] text-[7px] flex justify-between uppercase font-medium">
         <span>Total Weight: {riskMap.reduce((sum, cell) => sum + cell.v * displayScale, 0).toFixed(3)}</span>
         <span className={riskMap.reduce((a,b)=>a+b.v,0)/16 > 0.4 ? "text-amber-400" : "text-emerald-400"}>Live Monitoring</span>
      </div>
    </div>
  );
}
