import type { LiquidGlassRefractionMode } from "./liquid-glass";

/**
 * Liquid Glass SVG refraction — ported from the liquid-glass-tailwind
 * skill's verified `references/refraction.md` implementation. Chromium
 * only; every other engine keeps the CSS blur+saturate fallback declared by
 * the `liquid-glass` Tailwind utility (see `globals.css`). Read the
 * reference before touching this file — every rule below maps to a trap
 * that produced a silent, wrong result the first time round (oversized/
 * shifted maps from percentage-sized filters, asymmetric displacement from
 * building the map with gradients instead of a canvas SDF, etc.).
 */

const SVG_NS = "http://www.w3.org/2000/svg";
/** Size (px) of the liquid-glass-tailwind demo's own square (index.html) — the element `scale`/`aberration` were tuned against. See `rebuild()`. */
const REFERENCE_SIZE = 220;
let defsEl: SVGSVGElement | null = null;
let uid = 0;

function isRefractionSupported(): boolean {
  const probe = document.createElement("div");
  probe.style.cssText = "backdrop-filter: url(#probe)";
  return (
    probe.style.backdropFilter === "url(#probe)" || probe.style.backdropFilter === 'url("#probe")'
  );
}

function prefersOptOut(): boolean {
  return (
    matchMedia("(prefers-reduced-transparency: reduce)").matches ||
    matchMedia("(prefers-contrast: more)").matches
  );
}

function getDefs(): SVGSVGElement {
  if (defsEl && defsEl.isConnected) return defsEl;
  const existing = document.getElementById("liquid-glass-defs");
  if (existing) {
    defsEl = existing as unknown as SVGSVGElement;
    return defsEl;
  }
  const svg = document.createElementNS(SVG_NS, "svg") as SVGSVGElement;
  svg.id = "liquid-glass-defs";
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.position = "absolute";
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  document.body.prepend(svg);
  defsEl = svg;
  return svg;
}

// Signed distance to a rounded rectangle centered in (w, h); negative inside.
function roundedRectSdf(x: number, y: number, w: number, h: number, r: number): number {
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}

/**
 * mode 'diagonal': constant down-right displacement direction, the SDF only
 * shapes the band and its strength. The whole ring refracts: sampling goes
 * outward at the bottom-right (positive lens) and inward at the top-left
 * (negative lens) — glass lit from the top-left, matching the sheen.
 * mode 'symmetric': outward SDF normals, classic magnifier rim on all edges.
 */
function buildDisplacementMap(
  w: number,
  h: number,
  r: number,
  edge: number,
  mode: LiquidGlassRefractionMode,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL();
  const img = ctx.createImageData(w, h);
  const data = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const inside = -roundedRectSdf(x + 0.5, y + 0.5, w, h, r);
      let nx = 0;
      let ny = 0;
      if (inside < edge) {
        const t = Math.min(1, Math.max(0, 1 - inside / edge));
        const mag = t * t; // full at the border, eased to zero at the band's inner limit
        if (mode === "symmetric") {
          const gx =
            roundedRectSdf(x + 1.5, y + 0.5, w, h, r) - roundedRectSdf(x - 0.5, y + 0.5, w, h, r);
          const gy =
            roundedRectSdf(x + 0.5, y + 1.5, w, h, r) - roundedRectSdf(x + 0.5, y - 0.5, w, h, r);
          const len = Math.hypot(gx, gy) || 1;
          nx = (gx / len) * mag;
          ny = (gy / len) * mag;
        } else {
          nx = Math.SQRT1_2 * mag;
          ny = Math.SQRT1_2 * mag;
        }
      }
      const i = (y * w + x) * 4;
      data[i] = Math.round(128 + nx * 127);
      data[i + 1] = Math.round(128 + ny * 127);
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

export type LiquidGlassRefractionOptions = {
  /** Base displacement in px. Verified default 48, reads well 30-70. */
  scale?: number;
  /** Per-channel scale spread; 0 disables chromatic aberration. Verified default 8, reads well 0-16. */
  aberration?: number;
  mode?: LiquidGlassRefractionMode;
};

export type LiquidGlassRefractionController = {
  update: (next?: LiquidGlassRefractionOptions) => void;
  destroy: () => void;
};

/**
 * Attaches a per-element, pixel-sized refraction filter to `el` and keeps
 * it in sync with a ResizeObserver. Returns a controller so callers can
 * change scale/aberration/mode (or force a rebuild, e.g. after a
 * border-radius change that didn't affect element size) without recreating
 * the filter's DOM.
 *
 * Returns null if refraction isn't supported or the user opted out via
 * prefers-reduced-transparency / prefers-contrast — callers should treat
 * that as "the CSS fallback is already in effect, nothing more to do".
 */
export function attachLiquidGlassRefraction(
  el: HTMLElement,
  options: LiquidGlassRefractionOptions = {},
): LiquidGlassRefractionController | null {
  if (!isRefractionSupported() || prefersOptOut()) return null;

  const state = {
    scale: options.scale ?? 48,
    aberration: options.aberration ?? 8,
    mode: options.mode ?? "diagonal",
  };

  const id = `liquid-glass-refraction-${uid++}`;
  const defs = getDefs();

  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("color-interpolation-filters", "sRGB");
  // filterUnits defaults to objectBoundingBox: the numeric x/y/width/height
  // set below (in rebuild) would then be read as fractions of the target's
  // own box, not CSS pixels — e.g. width="640" becomes 64000% of the box.
  // Chromium renders that oversized region tiled, visible as a hard seam
  // splitting the surface into quadrants. Pin both to userSpaceOnUse so the
  // numbers mean exactly what rebuild() sets them to: element-local pixels.
  filter.setAttribute("filterUnits", "userSpaceOnUse");
  filter.setAttribute("primitiveUnits", "userSpaceOnUse");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("preserveAspectRatio", "none");
  feImage.setAttribute("result", "map");
  filter.appendChild(feImage);

  const feBlur = document.createElementNS(SVG_NS, "feGaussianBlur");
  feBlur.setAttribute("in", "SourceGraphic");
  feBlur.setAttribute("stdDeviation", "1.5");
  feBlur.setAttribute("result", "soft");
  filter.appendChild(feBlur);

  const channels = (["R", "G", "B"] as const).map((channel) => {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "soft");
    disp.setAttribute("in2", "map");
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    filter.appendChild(disp);

    const values = {
      R: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
      G: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
      B: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
    }[channel];
    const colorMatrix = document.createElementNS(SVG_NS, "feColorMatrix");
    colorMatrix.setAttribute("values", values);
    colorMatrix.setAttribute("result", `chan${channel}`);
    filter.appendChild(colorMatrix);

    return disp;
  });
  const [dispR, dispG, dispB] = channels;

  const blend1 = document.createElementNS(SVG_NS, "feBlend");
  blend1.setAttribute("in", "chanR");
  blend1.setAttribute("in2", "chanG");
  blend1.setAttribute("mode", "screen");
  blend1.setAttribute("result", "chanRG");
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, "feBlend");
  blend2.setAttribute("in", "chanRG");
  blend2.setAttribute("in2", "chanB");
  blend2.setAttribute("mode", "screen");
  filter.appendChild(blend2);

  defs.appendChild(filter);

  function applyScales(sizeFactor: number) {
    const scale = state.scale * sizeFactor;
    const aberration = state.aberration * sizeFactor;
    dispR.setAttribute("scale", String(scale + aberration));
    dispG.setAttribute("scale", String(scale));
    dispB.setAttribute("scale", String(scale - aberration));
  }

  function rebuild(w: number, h: number) {
    // A CSS radius larger than half the box (e.g. Tailwind's `rounded-full`,
    // which resolves to `calc(infinity * 1px)`) renders visually clamped to
    // min(w, h) / 2 — but getComputedStyle() returns the raw ~16.7M px
    // value, not that clamped one. Fed straight into the SDF, a radius that
    // dwarfs the element makes every pixel read as "at the edge" (full-
    // strength displacement everywhere) and collapses the direction field
    // into a sign(x - w/2) / sign(y - h/2) step function — a hard seam
    // along both center axes, visible as a 4-quadrant grid. Clamp to what
    // the shape actually renders as.
    const rawRadius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 16;
    const radius = Math.min(rawRadius, w / 2, h / 2);
    const edge = Math.min(42, w / 6, h / 6);
    // scale/aberration are absolute px, tuned (per the skill's verified
    // table) against a 220px reference element. Applied unscaled to a much
    // thinner surface — e.g. Spotlight's ~62px-tall pill — the displacement
    // can exceed the element's own size and sample content far outside any
    // sane "local" area, reading as a broken streak instead of a lens.
    // Scaling by the element's own smallest dimension keeps the tuned
    // aesthetic proportionally consistent regardless of what it's applied to.
    const sizeFactor = Math.min(w, h) / REFERENCE_SIZE;
    for (const attr of ["x", "y"]) {
      filter.setAttribute(attr, "0");
      feImage.setAttribute(attr, "0");
    }
    filter.setAttribute("width", String(w));
    filter.setAttribute("height", String(h));
    feImage.setAttribute("width", String(w));
    feImage.setAttribute("height", String(h));
    feImage.setAttribute("href", buildDisplacementMap(w, h, radius, edge, state.mode));
    applyScales(sizeFactor);
    // var() in an inline style resolves against the element, so the
    // enhanced chain keeps honoring the theme knobs at every level
    // (global, subtree, per element) instead of freezing hard-coded
    // values — --glass-blur-refract included, never hard-code it.
    el.style.backdropFilter = `blur(var(--glass-blur-refract, 3px)) url("#${id}") saturate(var(--glass-saturate, 180%)) brightness(var(--glass-brightness, 1.08))`;
    el.style.setProperty("-webkit-backdrop-filter", el.style.backdropFilter);
  }

  let lastW = 0;
  let lastH = 0;
  const resizeObserver = new ResizeObserver((entries) => {
    const box = entries[entries.length - 1].contentRect;
    const w = Math.round(el.offsetWidth);
    const h = Math.round(el.offsetHeight);
    if (w > 0 && h > 0 && box.width > 0) {
      lastW = w;
      lastH = h;
      rebuild(w, h);
    }
  });
  resizeObserver.observe(el);

  // ResizeObserver callbacks ride the rendering steps and can be throttled
  // (e.g. an occluded window): rebuild immediately for elements that are
  // already laid out, and let the observer cover resizes and late layout.
  const w0 = Math.round(el.offsetWidth);
  const h0 = Math.round(el.offsetHeight);
  if (w0 > 0 && h0 > 0) {
    lastW = w0;
    lastH = h0;
    rebuild(w0, h0);
  }

  return {
    update(next = {}) {
      Object.assign(state, next);
      if (lastW > 0 && lastH > 0) rebuild(lastW, lastH);
    },
    destroy() {
      resizeObserver.disconnect();
      filter.remove();
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
    },
  };
}
