"use client";

type TrafficLightsProps = {
  focused: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
};

const LIGHTS = [
  { key: "close", color: "bg-traffic-red", label: "Fermer la fenêtre", glyph: CloseGlyph },
  {
    key: "minimize",
    color: "bg-traffic-yellow",
    label: "Réduire la fenêtre",
    glyph: MinimizeGlyph,
  },
  {
    key: "maximize",
    color: "bg-traffic-green",
    label: "Agrandir la fenêtre",
    glyph: MaximizeGlyph,
  },
] as const;

/** Traffic lights: plain dots at rest, glyphs appear on hover of the whole group (real macOS behavior). */
export function TrafficLights({
  focused,
  onClose,
  onMinimize,
  onToggleMaximize,
}: TrafficLightsProps) {
  const handlers: Record<(typeof LIGHTS)[number]["key"], () => void> = {
    close: onClose,
    minimize: onMinimize,
    maximize: onToggleMaximize,
  };

  return (
    <div className="group/lights flex items-center gap-(--traffic-light-gap)">
      {LIGHTS.map(({ key, color, label, glyph: Glyph }) => (
        <button
          key={key}
          type="button"
          aria-label={label}
          onClick={handlers[key]}
          className={`flex size-(--traffic-light-size) items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none ${
            focused ? color : "bg-traffic-inactive"
          }`}
        >
          <Glyph className="size-1.75 opacity-0 group-hover/lights:opacity-100" />
        </button>
      ))}
    </div>
  );
}

function CloseGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} fill="none" stroke="#4d0000" strokeWidth="1.2">
      <path d="M1 1l6 6M7 1L1 7" />
    </svg>
  );
}

function MinimizeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} fill="none" stroke="#5c4400" strokeWidth="1.2">
      <path d="M1 4h6" />
    </svg>
  );
}

function MaximizeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 8 8" className={className} fill="none" stroke="#003d0a" strokeWidth="1.2">
      <path d="M1.5 5.5l5-3M2 2.3v3M6.5 5.2v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
