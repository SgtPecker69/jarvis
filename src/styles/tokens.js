// The design system. One source of truth.
//
// Defined in JS because the app styles inline (`${C.cyan}55` for alpha), then
// mirrored onto :root as CSS custom properties so the stylesheet can use the
// same values. Change a colour here and it changes everywhere — that's the point.
//
// Direction: Apple's restraint and hierarchy, Instagram's motion and geometry,
// JARVIS's cyan. Glow is treated as light falling on a surface, not as an
// outline applied to every element.

export const C = {
  // ── ground ────────────────────────────────────────────────────────────────
  // Near-black with a blue cast. Cooler and deeper than a flat grey, so cyan
  // reads as emitted light rather than paint.
  bg:         "#04070E",
  bgRaised:   "#080D18",

  // Surfaces are layered by lightness, not by border weight. Apple's trick:
  // depth comes from the material, so borders can stay almost invisible.
  surface:    "rgba(20, 30, 48, 0.55)",
  surfaceHi:  "rgba(28, 40, 62, 0.72)",
  panel:      "rgba(8, 13, 24, 0.72)",
  panelSolid: "rgba(8, 13, 24, 0.96)",

  border:     "rgba(140, 190, 255, 0.10)",
  borderHi:   "rgba(0, 200, 255, 0.38)",
  borderDim:  "rgba(140, 190, 255, 0.06)",

  // ── accent ────────────────────────────────────────────────────────────────
  cyan:       "#22D3EE",
  cyanBright: "#67E8F9",
  cyanDeep:   "#0891B2",
  blue:       "#3B82F6",
  violet:     "#8B5CF6",   // the Instagram-ish end of the primary gradient

  // ── text ──────────────────────────────────────────────────────────────────
  // A real neutral ramp. The old palette tinted every level cyan, which is why
  // nothing looked resting. Labels were #2C5870 — too dark to read comfortably.
  textBright: "#F2F7FF",
  text:       "#C8D6EC",
  dimMid:     "#8095B4",
  dim:        "#5A6E8C",

  // ── state ─────────────────────────────────────────────────────────────────
  green:      "#34D399",
  orange:     "#FB923C",
  red:        "#F43F5E",
  yellow:     "#FBBF24",
  purple:     "#A78BFA",
};

// Kept so older code reading C.panel/C.dim keeps working unchanged.
export const RADIUS  = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 };
export const SPACE   = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 40 };

// Motion. One overshoot curve for anything that should feel physical, one
// standard curve for everything else. Durations stay short — Apple's feel comes
// from things arriving quickly and settling, not from long animations.
export const MOTION = {
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  ease:   "cubic-bezier(0.32, 0.72, 0, 1)",
  fast:   "160ms",
  base:   "260ms",
  slow:   "420ms",
};

/** Mirror the palette onto :root so CSS can use the same values. */
export function applyTokens(root = document.documentElement) {
  const set = (k, v) => root.style.setProperty(k, v);

  for (const [name, value] of Object.entries(C)) {
    set(`--c-${name.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`, value);
  }
  for (const [name, value] of Object.entries(RADIUS)) set(`--r-${name}`, `${value}px`);
  for (const [name, value] of Object.entries(SPACE))  set(`--s-${name}`, `${value}px`);
  set("--motion-spring", MOTION.spring);
  set("--motion-ease",   MOTION.ease);
  set("--motion-fast",   MOTION.fast);
  set("--motion-base",   MOTION.base);
  set("--motion-slow",   MOTION.slow);
}
