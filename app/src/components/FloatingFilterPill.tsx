import { SlidersHorizontal } from 'lucide-react';

interface FloatingFilterPillProps {
  onClick: () => void;
  activeFilterCount?: number;
}

export default function FloatingFilterPill({ onClick, activeFilterCount = 0 }: FloatingFilterPillProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[100] lg:hidden flex items-center gap-2 bg-[var(--nc-purple)] text-white pl-4 pr-5 py-3 rounded-full shadow-lg shadow-[var(--nc-purple)]/30 hover:shadow-xl hover:shadow-[var(--nc-purple)]/40 hover:scale-105 transition-all duration-300"
      aria-label="Open filters"
    >
      <SlidersHorizontal size={16} />
      <span className="text-[11px] uppercase tracking-wider font-medium">Filters</span>
      {activeFilterCount > 0 && (
        <span className="ml-0.5 w-5 h-5 bg-white text-[var(--nc-purple)] text-[10px] font-bold rounded-full flex items-center justify-center">
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
