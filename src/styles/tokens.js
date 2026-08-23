// The design system — "Mark 42": the view from inside the helmet.
//
// Black, one gold, warm ivory. The discipline that separates a title sequence
// from a gamer overlay is that the accent appears once per screen and nothing
// else glows. Space does the work that glow was doing before.
//
// Mirrored onto :root at boot so CSS and inline styles read the same values.

export const C = {
  // ── the void ──────────────────────────────────────────────────────────────
  bg:        "#060606",
  bgDeep:    "#030303",
  bgLift:    "#0C0B09",   // warm, so surfaces sit on the gold side of neutral

  // Frame and rule work. Warm greys — a cool grey against gold reads as dirt.
  line:      "#2A2622",
  lineSoft:  "#191713",
  lineHot:   "#4A4034",

  // Kept for views not yet converted.
  surface:   "rgba(255, 248, 232, 0.030)",
  surfaceHi: "rgba(255, 248, 232, 0.055)",
  border:    "#2A2622",
  borderHi:  "#4A4034",
  borderDim: "#191713",
  panel:     "rgba(8, 7, 6, 0.82)",
  panelSolid:"rgba(8, 7, 6, 0.97)",

  // ── the accent. One per screen. ───────────────────────────────────────────
  gold:      "#C9A227",
  goldBright:"#F0C64B",
  goldDeep:  "#7A6115",

  // ── ink ───────────────────────────────────────────────────────────────────
  textBright:"#F5F0E6",
  text:      "#D8D0C0",
  dimMid:    "#8A7F6C",
  dim:       "#6E6558",

  // ── status. Desaturated, so nothing competes with the gold. ───────────────
  green:     "#7A9E5B",
  red:       "#C4553D",
  amber:     "#C9A227",
  violet:    "#7E6E9E",
  cyan:      "#5B8C93",

  // Aliases so unconverted views keep rendering.
  cyanBright:"#7FB3BA",
  cyanDeep:  "#3E6166",
  blue:      "#5B8C93",
  orange:    "#C4713D",
  yellow:    "#C9A227",
  purple:    "#7E6E9E",
};

export const RADIUS = { sm: 0, md: 0, lg: 0, xl: 0, pill: 999 };
export const SPACE  = { xs: 4, sm: 8, md: 14, lg: 22, xl: 34, xxl: 56 };

// Thin at large sizes, and only at large sizes. A 200-weight face below ~24px
// disappears; the small end carries weight instead.
export const TYPE = {
  hero:    { fontSize: 104, fontWeight: 200, letterSpacing: "-0.05em",  lineHeight: 0.88 },
  display: { fontSize: 62,  fontWeight: 200, letterSpacing: "-0.045em", lineHeight: 0.94 },
  stat:    { fontSize: 34,  fontWeight: 200, letterSpacing: "-0.035em", lineHeight: 1 },
  statSm:  { fontSize: 25,  fontWeight: 250, letterSpacing: "-0.03em",  lineHeight: 1 },
  title:   { fontSize: 19,  fontWeight: 400, letterSpacing: "-0.015em", lineHeight: 1.25 },
  body:    { fontSize: 15,  fontWeight: 350, letterSpacing: "-0.006em", lineHeight: 1.65 },
  small:   { fontSize: 13,  fontWeight: 400, letterSpacing: "0",        lineHeight: 1.5 },
  micro:   { fontSize: 10.5,fontWeight: 500, letterSpacing: "0.24em",   textTransform: "uppercase" },
};

export const MOTION = {
  // Mechanical, not bouncy. A helmet locks into place.
  lock:   "cubic-bezier(0.16, 1, 0.3, 1)",
  ease:   "cubic-bezier(0.32, 0.72, 0, 1)",
  spring: "cubic-bezier(0.16, 1, 0.3, 1)",
  fast:   "180ms",
  base:   "300ms",
  slow:   "560ms",
};

export function applyTokens(root = document.documentElement) {
  const set = (k, v) => root.style.setProperty(k, v);
  for (const [name, value] of Object.entries(C)) {
    set(`--c-${name.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}`, value);
  }
  for (const [name, value] of Object.entries(RADIUS)) set(`--r-${name}`, `${value}px`);
  for (const [name, value] of Object.entries(SPACE))  set(`--s-${name}`, `${value}px`);
  set("--motion-lock",   MOTION.lock);
  set("--motion-spring", MOTION.lock);
  set("--motion-ease",   MOTION.ease);
  set("--motion-fast",   MOTION.fast);
  set("--motion-base",   MOTION.base);
  set("--motion-slow",   MOTION.slow);
}
