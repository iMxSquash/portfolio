"use client";

import { IconArrowsDiagonal, IconMinus, IconX } from "@tabler/icons-react";

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
  return <IconX className={className} color="#4d0000" stroke={3} />;
}

function MinimizeGlyph({ className }: { className?: string }) {
  return <IconMinus className={className} color="#5c4400" stroke={3} />;
}

function MaximizeGlyph({ className }: { className?: string }) {
  return <IconArrowsDiagonal className={className} color="#003d0a" stroke={3} />;
}
