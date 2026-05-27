type SaleBadgeProps = {
  percent: number;
  /** Container positioning (tailwind). */
  insetClassName?: string;
  className?: string;
};

/**
 * Sale tag anchored top-right inside the stacking context — inset so clips from parent overflow are rare.
 */
export default function SaleDiscountCorner({
  percent,
  insetClassName = 'right-2 top-2 sm:right-3 sm:top-3',
  className = '',
}: SaleBadgeProps) {
  const p = Math.round(percent);
  if (p < 1 || p > 99) return null;

  return (
    <span
      className={`pointer-events-none absolute z-[45] whitespace-nowrap rounded border border-white/85 bg-[#DC2626] px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-tighter text-white shadow-md ${insetClassName} ${className}`}
      aria-hidden
    >
      -{p}%
    </span>
  );
}
