import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getDiscoveryStyle } from '@/lib/discoveryEngine';

function DiscoveryCard({ discovery, onNext, isLast }) {
  const style = getDiscoveryStyle(discovery.tier || discovery.type);
  const playerNames = discovery.players?.map(p => p.name) || discovery.players || [];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ type: "spring", bounce: 0.35, duration: 0.6 }}
      className={cn(
        "rounded-2xl border-2 p-6 text-center shadow-2xl max-w-sm mx-auto",
        style.border, style.bg
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
        className="text-4xl mb-3"
      >
        {style.star}
      </motion.div>

      <p className={cn("text-[10px] uppercase tracking-widest font-bold mb-2", style.text)}>
        {discovery.subtitle || "Discovery Revealed"}
      </p>

      <div className="space-y-0.5 mb-4">
        {playerNames.map((name, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="font-bold text-base"
          >
            {name}
          </motion.p>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className={cn("font-black text-xl mb-2", style.text)}>
          {discovery.title || discovery.name}
        </h2>
        {discovery.synergy || discovery.reward ? (
          <span className={cn("text-xs font-bold px-3 py-1 rounded-full", style.badge)}>
            {discovery.synergy || discovery.reward}
          </span>
        ) : null}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={onNext}
        className={cn(
          "mt-5 w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all",
          "border-2", style.border, style.text, "hover:opacity-80 active:scale-95"
        )}
      >
        {isLast ? "VIEW RESULTS" : "NEXT"}
      </motion.button>
    </motion.div>
  );
}

export default function DiscoveryReveal({ discoveries, onComplete }) {
  const [index, setIndex] = useState(-1);
  const [scanning, setScanning] = useState(true);
  const [scanText, setScanText] = useState("ANALYSING");

  useEffect(() => {
    const texts = ["ANALYSING", "SCANNING", "CHECKING", "PROCESSING"];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i < texts.length) {
        setScanText(texts[i]);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          if (discoveries.length === 0) {
            onComplete();
          } else {
            setIndex(0);
          }
        }, 400);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    if (index >= discoveries.length - 1) {
      onComplete();
    } else {
      setIndex(i => i + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <AnimatePresence mode="wait">
        {scanning && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center space-y-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-2 border-blue-400/30 border-t-blue-400 rounded-full mx-auto"
            />
            <p className="font-mono text-sm text-blue-400">{scanText}</p>
          </motion.div>
        )}

        {!scanning && index >= 0 && index < discoveries.length && (
          <motion.div key={`discovery-${index}`} className="w-full max-w-sm">
            <div className="text-center mb-4">
              <p className="text-[10px] font-mono uppercase">
                {index + 1} of {discoveries.length}
              </p>
            </div>
            <DiscoveryCard
              discovery={discoveries[index]}
              onNext={handleNext}
              isLast={index === discoveries.length - 1}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
