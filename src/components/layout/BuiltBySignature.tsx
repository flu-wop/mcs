// src/components/layout/BuiltBySignature.tsx
export function BuiltBySignature() {
  return (
    <div className="w-full py-6 border-t border-studio-border/60">
      <p className="text-center text-[11px] tracking-[0.15em] font-mono text-mist">
        BUILT BY{" "}
        <a
          href="https://in-flu-ential.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold-light transition-colors duration-200"
        >
          IN-FLU-ENTIAL LLC
        </a>
      </p>
    </div>
  );
}
