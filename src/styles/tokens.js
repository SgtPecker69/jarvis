// The design system. One source of truth.
//
// Defined in JS because the app styles inline (`${C.cyan}55` for alpha), then
// mirrored onto :root as CSS custom properties so the stylesheet uses the same
// values.
//
// Direction: editorial, not dashboard. The ground is neutral near-black so the
// accents read as emitted light; content sits in a bento of varied tiles rather
// than a column of identical cards; type carries the hierarchy — one very large
// number per tile, everything else quiet.

export const C = {
  // ── ground ────────────────────────────────────────────────────────────────
  // Neutral, not blue-tinted. A coloured ground makes every accent muddy; a
  // neutral one lets cyan and violet actually glow.
  bg:         "#08090C",
  bgDeep:     "#050609",

  // Surfaces are white at low alpha, so they pick up whatever light is behind
  // them. This is what makes glass read as glass instead of as grey paint.
  surface:    "rgba(255, 255, 255, 0.038)",
  surfaceHi:  "rgba(255, 255, 255, 0.062)",
  surfaceLow: "rgba(255, 255, 255, 0.022)",
  panel:      "rgba(12, 14, 20, 0.72)",
  panelSolid: "rgba(12, 14, 20, 0.96)",

  border:     "rgba(255, 255, 255, 0.075)",
  borderHi:   "rgba(255, 255, 255, 0.14)",
  borderDim:  "rgba(255, 255, 255, 0.045)",

  // ── accent ────────────────────────────────────────────────────────────────
  cyan:       "#3DDCFF",
  cyanBright: "#8BEDFF",
  cyanDeep:   "#0EA5C6",
  violet:     "#7C5CFF",
  blue:       "#4B7BFF",
  amber:      "#FFB020",

  // ── text ──────────────────────────────────────────────────────────────────
  textBright: "#FBFCFD",
  text:       "#DDE2EA",
  dimMid:     "#8A93A3",
  dim:        "#5C6472",

  // ── state ─────────────────────────────────────────────────────────────────
  green:      "#3DDC97",
  orange:     "#FF9F45",
  red:        "#FF5470",
  yellow:     "#FFC94A",
  purple:     "#A78BFA",
};

export const RADIUS = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 };
export const SPACE  = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28, xxl: 44 };

// One type scale, used everywhere. The jump from `display` to `micro` is the
// hierarchy — the old build had everything between 9px and 14px, which is why
// nothing led and nothing receded.
export const TYPE = {
  display: { fontSize: 56, fontWeight: 300, letterSpacing: "-0.04em", lineHeight: 1 },
  stat:    { fontSize: 44, fontWeight: 300, letterSpacing: "-0.035em", lineHeight: 1 },
  statSm:  { fontSize: 30, fontWeight: 350, letterSpacing: "-0.03em",  lineHeight: 1 },
  title:   { fontSize: 21, fontWeight: 600, letterSpacing: "-0.021em", lineHeight: 1.2 },
  body:    { fontSize: 15, fontWeight: 420, letterSpacing: "-0.011em", lineHeight: 1.5 },
  small:   { fontSize: 13, fontWeight: 440, letterSpacing: "-0.006em", lineHeight: 1.45 },
  micro:   { fontSize: 11, fontWeight: 600, letterSpacing: "0.075em", textTransform: "uppercase" },
};

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
