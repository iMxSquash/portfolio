"use client";

import { useId } from "react";
import { useTrashStore } from "@/stores/useTrashStore";

/**
 * Recreated in SVG (not the official asset, see os-macos-ui skill): wire
 * wastebasket, crumpled paper only drawn when the trash actually has
 * content — the dock/desktop icon reflects `useTrashStore` live.
 */
export function TrashIcon() {
  const isEmpty = useTrashStore((state) => state.items.length === 0);
  // Can render more than once per page (dock + Spotlight results) — gradient
  // ids must be unique per instance, not shared literals.
  const uid = useId();

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`trash-bg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E5E5EA" />
          <stop offset="100%" stopColor="#C7C7CC" />
        </linearGradient>
        <linearGradient id={`trash-metal-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#AEAEB2" />
          <stop offset="100%" stopColor="#8E8E93" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#trash-bg-${uid})`} />
      {!isEmpty ? (
        <path
          d="M 30 28 L 42 14 L 58 20 L 50 34 Z"
          fill="#F2F2F2"
          stroke="#AEAEB2"
          strokeWidth="1.5"
        />
      ) : null}
      <path
        d="M 26 32 L 74 32 L 68 84 A 6 6 0 0 1 62 90 L 38 90 A 6 6 0 0 1 32 84 Z"
        fill={`url(#trash-metal-${uid})`}
      />
      <rect x="22" y="26" width="56" height="8" rx="2" fill="#6E6E73" />
      <rect x="42" y="16" width="16" height="10" rx="2" fill="#6E6E73" />
      <g stroke="#E5E5EA" strokeWidth="2.5" strokeLinecap="round">
        <line x1="40" y1="42" x2="42" y2="78" />
        <line x1="50" y1="42" x2="50" y2="78" />
        <line x1="60" y1="42" x2="58" y2="78" />
      </g>
    </svg>
  );
}
