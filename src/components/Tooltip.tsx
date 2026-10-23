import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  title: string;
  concept: string;
  formula?: string;
  units?: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  title,
  concept,
  formula,
  units,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position classes
  let posClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-2.5';
  let arrowClasses = 'top-full left-1/2 -translate-x-1/2 border-t-slate-800 border-x-transparent border-b-transparent';

  if (position === 'bottom') {
    posClasses = 'top-full left-1/2 -translate-x-1/2 mt-2.5';
    arrowClasses = 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 border-x-transparent border-t-transparent';
  } else if (position === 'left') {
    posClasses = 'right-full top-1/2 -translate-y-1/2 mr-2.5';
    arrowClasses = 'left-full top-1/2 -translate-y-1/2 border-l-slate-800 border-y-transparent border-r-transparent';
  } else if (position === 'right') {
    posClasses = 'left-full top-1/2 -translate-y-1/2 ml-2.5';
    arrowClasses = 'right-full top-1/2 -translate-y-1/2 border-r-slate-800 border-y-transparent border-l-transparent';
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
      tabIndex={0}
      role="tooltip"
    >
      {children}

      {isVisible && (
        <div
          className={`absolute z-50 w-72 p-3 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl text-left pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 ${posClasses}`}
        >
          {/* Header with Title & Info Icon */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1.5 mb-1.5">
            <Info size={13} className="text-sky-400 shrink-0" />
            <span className="font-bold text-xs text-white tracking-wide">{title}</span>
            {units && (
              <span className="ml-auto font-mono text-[10px] text-slate-400 font-semibold px-1.5 py-0.5 rounded bg-slate-800">
                {units}
              </span>
            )}
          </div>

          {/* Core Concept Explanation */}
          <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
            {concept}
          </p>

          {/* Formula Callout */}
          {formula && (
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Formula:</span>
              <span className="text-sky-300 font-semibold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                {formula}
              </span>
            </div>
          )}

          {/* Triangular Arrow Pointer */}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses}`} />
        </div>
      )}
    </div>
  );
};
