import type { CSSProperties } from "react";

/**
 * Feeds the `--range-fraction` custom property that `input[type="range"]` in
 * globals.css uses to paint the filled part of the track.
 */
export function getRangeStyle(value: number, min: number, max: number): CSSProperties {
  const fraction = max > min ? (value - min) / (max - min) : 0;
  return { "--range-fraction": fraction } as CSSProperties;
}
