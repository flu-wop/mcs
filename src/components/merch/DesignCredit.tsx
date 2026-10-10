// One shop-wide credit line. Individual product pages keep their own credit.
export default function DesignCredit({ className = '' }: { className?: string }) {
  return (
    <p className={`text-center text-[10px] tracking-[0.18em] uppercase text-[#8a7a60] font-['DM_Sans'] ${className}`}>
      All designs by{' '}
      <a href="https://dahiddengem.com" target="_blank" rel="noopener noreferrer"
        className="text-accent-text border-b border-accent/30 hover:border-accent transition-colors pb-px">
        Hidden Gem <span aria-hidden="true">↗</span>
      </a>
    </p>
  )
}
