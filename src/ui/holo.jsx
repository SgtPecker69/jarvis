// Holographic instrument kit.
//
// The reference is the MCU JARVIS interface, which is not a page: it's line-art
// projected into a void. Nothing here has a solid fill. Depth comes from layered
// strokes at different opacities, geometry is radial rather than rectangular,
// and frames are chamfered with bracket ticks instead of rounded.
//
// The failure mode this is avoiding is the previous build's: glow sprayed onto
// ordinary web components. Here the instruments are drawn as instruments — real
// arcs, real tick marks, real sweep — so the light has something to describe.

import { C, MOTION } from "../styles/tokens.js";

/* ── frame ──────────────────────────────────────────────────────────────────
   A panel is a cut rectangle: corners chamfered, one hairline stroke, no fill
   beyond a breath of tint. The corner ticks are drawn short and only on two
   corners — brackets on all four was the old build's tell. */

export function Frame({ children, label, accent = C.cyan, span = 6, style = {}, dense = false }) {
  const cut = 14;
  const clip = `polygon(${cut}px 0, 100% 0, 100% calc(100% - ${cut}px), calc(100% - ${cut}px) 100%, 0 100%, 0 ${cut}px)`;

  return (
    <div style={{ gridColumn: `span ${span}`, position: "relative", ...style }}>
      {/* stroke layer — the frame itself is a clipped border, drawn once */}
      <div style={{
        position: "absolute", inset: 0, clipPath: clip,
        background: `linear-gradient(150deg, ${accent}1A, transparent 55%)`,
        border: `1px solid ${accent}38`,
        pointerEvents: "none",
      }} />

      {/* corner ticks — two corners, short, aligned to the chamfer */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <path d={`M0 ${cut + 18} L0 ${cut} L${cut} 0 L${cut + 18} 0`}
              fill="none" stroke={accent} strokeWidth="1.5" opacity="0.9" />
      </svg>

      <div style={{ position: "relative", padding: dense ? "14px 16px" : "18px 20px 20px" }}>
        {label && (
          <div style={{
            display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
          }}>
            <span style={{
              width: 14, height: 1, background: accent, opacity: 0.8, flexShrink: 0,
            }} />
            <span className="holo-label" style={{ color: accent }}>{label}</span>
            <span style={{
              flex: 1, height: 1, marginLeft: 2,
              background: `linear-gradient(90deg, ${accent}44, transparent)`,
            }} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ── readout ────────────────────────────────────────────────────────────────
   Instrumentation, not a headline: monospace, unit set apart, the label small
   and above. A readout states a measurement. */

export function Readout({ label, value, unit, tone = C.cyanBright, size = 34, sub }) {
  return (
    <div>
      {label && <div className="holo-label" style={{ color: C.dimMid, marginBottom: 7 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="holo-num" style={{
          fontSize: size, color: tone, lineHeight: 1,
          textShadow: `0 0 18px ${tone}55`,
        }}>{value}</span>
        {unit && <span className="holo-label" style={{ color: C.dimMid }}>{unit}</span>}
      </div>
      {sub && <div className="holo-label" style={{ color: C.dim, marginTop: 7 }}>{sub}</div>}
    </div>
  );
}

/* ── arc gauge ──────────────────────────────────────────────────────────────
   The bar's replacement. An arc with its own tick scale reads as an instrument
   and, unlike a bar, tolerates being stacked concentrically. */

export function Arc({ pct = 0, tone = C.cyan, radius, stroke = 3, ticks = 0, gap = 90 }) {
  const size  = (radius + stroke) * 2;
  const sweep = 360 - gap;
  const circ  = 2 * Math.PI * radius;
  const shown = (sweep / 360) * circ;
  const value = Math.min(100, Math.max(0, pct));

  return (
    <g>
      <circle r={radius} fill="none" stroke={`${tone}22`} strokeWidth={stroke}
              strokeDasharray={`${shown} ${circ}`} strokeLinecap="butt"
              transform={`rotate(${90 + gap / 2})`} />
      <circle r={radius} fill="none" stroke={tone} strokeWidth={stroke}
              strokeDasharray={`${shown * value / 100} ${circ}`} strokeLinecap="butt"
              transform={`rotate(${90 + gap / 2})`}
              style={{ transition: `stroke-dasharray 1.1s ${MOTION.ease}`,
                       filter: `drop-shadow(0 0 5px ${tone}AA)` }} />
      {ticks > 0 && Array.from({ length: ticks }, (_, i) => {
        const a = ((90 + gap / 2) + (sweep * i) / (ticks - 1)) * Math.PI / 180;
        const r1 = radius + stroke / 2 + 3, r2 = r1 + 4;
        return <line key={i}
          x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
          x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
          stroke={tone} strokeWidth="1" opacity="0.35" />;
      })}
    </g>
  );
}

/* ── the hub ────────────────────────────────────────────────────────────────
   One instrument carrying every headline number as a concentric ring, with a
   radar sweep over it. This is the thing the screen is built around — the
   previous designs had no focal point at all, which is why they read as a list.
*/

export function Hub({ rings = [], size = 300, children, sweeping = true }) {
  const half = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {/* radar sweep, behind the instrument */}
      {sweeping && (
        <div className="holo-sweep" style={{
          position: "absolute", inset: "8%", borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${C.cyan}00 0deg, ${C.cyan}00 300deg, ${C.cyan}26 355deg, ${C.cyan}55 360deg)`,
          maskImage: "radial-gradient(circle, transparent 34%, #000 36%, #000 99%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 34%, #000 36%, #000 99%, transparent 100%)",
        }} />
      )}

      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${half} ${half})`}>
          {/* fixed graticule */}
          <circle r={half - 3}  fill="none" stroke={`${C.cyan}1F`} strokeWidth="1" />
          <circle r={half - 12} fill="none" stroke={`${C.cyan}12`} strokeWidth="1" strokeDasharray="2 6" />

          {/* outer bearing ticks — every 15°, long every 90° */}
          {Array.from({ length: 24 }, (_, i) => {
            const a = (i * 15) * Math.PI / 180;
            const long = i % 6 === 0;
            const r1 = half - 3, r2 = half - (long ? 12 : 7);
            return <line key={i}
              x1={Math.cos(a) * r1} y1={Math.sin(a) * r1}
              x2={Math.cos(a) * r2} y2={Math.sin(a) * r2}
              stroke={C.cyan} strokeWidth={long ? 1.4 : 1} opacity={long ? 0.5 : 0.22} />;
          })}

          {rings.map((r, i) => (
            <Arc key={i} pct={r.pct} tone={r.tone} radius={half - 26 - i * 15}
                 stroke={r.stroke ?? 4} ticks={r.ticks ?? 0} gap={r.gap ?? 100} />
          ))}
        </g>
      </svg>

      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", pointerEvents: "none",
      }}>
        {children}
      </div>
    </div>
  );
}

/* ── legend ─────────────────────────────────────────────────────────────────
   The hub's rings are only readable with a key, and the key doubles as the
   detail view: name, value, and the ring's colour as its swatch. */

export function Legend({ items }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{
            width: 18, height: 2, background: it.tone, flexShrink: 0,
            boxShadow: `0 0 8px ${it.tone}`,
          }} />
          <div style={{ minWidth: 0 }}>
            <div className="holo-label" style={{ color: C.dimMid }}>{it.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
              <span className="holo-num" style={{ fontSize: 19, color: it.tone }}>{it.value}</span>
              {it.unit && <span className="holo-label" style={{ color: C.dim }}>{it.unit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── command line ───────────────────────────────────────────────────────────
   JARVIS is spoken to. A prompt says that; a rounded search field doesn't. */

export function CommandLine({ value, onChange, onSubmit, placeholder = "awaiting instruction", state }) {
  const tone = state === "listening" ? C.red
             : state === "thinking"  ? C.amber
             : state === "speaking"  ? C.green
             : C.cyan;

  return (
    <form onSubmit={onSubmit} style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "13px 18px",
      border: `1px solid ${tone}3D`,
      background: `linear-gradient(90deg, ${tone}0F, transparent 70%)`,
      clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
      transition: `border-color 500ms ${MOTION.ease}, background 500ms ${MOTION.ease}`,
    }}>
      <span className="holo-num" style={{ color: tone, fontSize: 15, opacity: 0.9 }}>&gt;</span>
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="holo-input"
        style={{
          flex: 1, background: "none", border: "none", outline: "none",
          color: C.textBright, fontSize: 14,
        }}
      />
      <span className="holo-caret" style={{ background: tone }} />
    </form>
  );
}
