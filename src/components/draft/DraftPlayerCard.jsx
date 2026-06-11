import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function DraftPlayerCard({ player, onSelect, index = 0, disabled = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("bg-white border border-gray-200 rounded-sm overflow-hidden", disabled && "opacity-40")}
    >
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-sm font-semibold">{player.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-gray-500 uppercase">{player.nationality}</span>
          <span className="text-[10px] text-gray-300">•</span>
          <span className="text-[10px] text-gray-500">{player.era || player.decade}</span>
        </div>
      </div>
      <button
        onClick={disabled ? undefined : onSelect}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 text-xs font-bold uppercase transition-colors",
          disabled
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:bg-blue-50"
        )}
      >
        {disabled ? "FULL" : "SELECT"}
      </button>
    </motion.div>
  );
}
