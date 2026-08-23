// The helmet.
//
// Everything before this put the HUD *in* the content — glowing panels stacked
// down the middle of the page. Inside a helmet it's the opposite: the centre of
// your view is clear, because you need to see through it, and the instruments
// live at the edge of vision.
//
// So the frame here is fixed to the viewport, not to the page: corner brackets
// at the four corners of your view, readouts pinned to the edges, a vignette
// you're looking through. The content scrolls behind it. The frame also sits on
// a nearer parallax plane than the content, which is what sells the projection
// as floating in front of you rather than printed on the page.

import { useEffect, useRef, useState } from "react";
import { C, TYPE } from "../styles/tokens.js";

/* ── parallax ───────────────────────────────────────────────────────────────
   Pointer position drives two layers at different depths. Small amounts — 6px
   at the far plane. Any more and it reads as a gimmick instead of glass. */

export function useParallax(strength = 1) {
  const [p, setP] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = null;
    const onMove = (e) => {
      if (frame) return;                       // one update per painted frame
      frame = requestAnimationFrame(() => {
        frame = null;
        setP({
          x: (e.clientX / window.innerWidth  - 0.5) * 2,
          y: (e.clientY / window.innerHeight - 0.5) * 2,
        });
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { x: p.x * strength, y: p.y * strength };
}

/* ── corner bracket ─────────────────────────────────────────────────────────
   Drawn at the corners of the *viewport*, once — not around every card. That
   distinction is the whole difference between a frame and a decoration. */

function Bracket({ corner, tone }) {
  const [v, h] = corner.split("");            // "tl" → t,l
  const vert = v === "t" ? { top: 0 } : { bottom: 0 };
  const horz = h === "l" ? { left: 0 } : { right: 0 };
  const flipX = h === "r" ? -1 : 1;
  const flipY = v === "b" ? -1 : 1;

  return (
    <svg width="86" height="86" viewBox="0 0 86 86" aria-hidden="true"
         style={{ position: "absolute", ...vert, ...horz,
                  transform: `scale(${flipX}, ${flipY})`, overflow: "visible" }}>
      <path d="M2 62 L2 22 L22 2 L62 2" fill="none" stroke={tone} strokeWidth="1.25" opacity="0.85" />
      <path d="M10 60 L10 26 L26 10 L60 10" fill="none" stroke={tone} strokeWidth="0.75" opacity="0.32" />
      <circle cx="2" cy="62" r="1.75" fill={tone} />
    </svg>
  );
}

/* ── edge readout ───────────────────────────────────────────────────────────
   Peripheral instrumentation: always present, never in the way, readable only
   when you look at it. Exactly how a real HUD behaves. */

function Edge({ children, style }) {
  return (
    <div style={{
      position: "absolute", display: "flex", alignItems: "center", gap: 10,
      ...TYPE.micro, color: C.dimMid, whiteSpace: "nowrap", ...style,
    }}>
      {children}
    </div>
  );
}

/**
 * The fixed overlay. Renders above everything, ignores pointer events, and
 * carries the frame plus whatever peripheral readouts the app wants at the
 * edges of vision.
 */
export function HelmetFrame({ status = "standing by", tone = C.gold, left = [], right = [], booting }) {
  const par = useParallax(7);

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 400, pointerEvents: "none",
      transform: `translate3d(${-par.x}px, ${-par.y}px, 0)`,
      transition: "transform 200ms linear",
    }}>
      {/* faceplate vignette — you are looking through an aperture */}
      <div style={{
        position: "absolute", inset: -40,
        background:
          "radial-gradient(ellipse 86% 78% at 50% 48%, transparent 58%, rgba(0,0,0,0.34) 84%, rgba(0,0,0,0.62) 100%)",
      }} />

      {/* the four corners of vision */}
      <div className={booting ? "hud-bracket boot" : "hud-bracket"} style={{ position: "absolute", inset: 20 }}>
        {["tl", "tr", "bl", "br"].map(c => <Bracket key={c} corner={c} tone={tone} />)}
      </div>

      {/* visor curvature — an arc across the top of vision, not a straight edge */}
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"
           style={{ position: "absolute", top: 24, left: "8%", width: "84%", height: 34 }}>
        <path d="M0 11 Q50 0 100 11" fill="none" stroke={tone} strokeWidth="0.35"
              opacity="0.35" vectorEffect="non-scaling-stroke" />
      </svg>

      <Edge style={{ top: 30, left: 122 }}>
        <span style={{ color: tone }}>◆</span>{status}
      </Edge>

      <Edge style={{ top: 30, right: 122, justifyContent: "flex-end" }}>
        {right.map((r, i) => <span key={i}>{r}</span>)}
      </Edge>

      <Edge style={{ bottom: 32, left: 122 }}>
        {left.map((l, i) => <span key={i}>{l}</span>)}
      </Edge>

      {/* the sweep: one pass of light across the visor, slow */}
      <div className="hud-visor-sweep" />
    </div>
  );
}

/* ── power-on ───────────────────────────────────────────────────────────────
   The helmet boots. Three beats — frame, calibration, content — then it's out
   of the way for the rest of the session. Runs once per mount, not per tab. */

export function useBootSequence(ms = 1500) {
  const [booting, setBooting] = useState(true);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) { setBooting(false); return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      done.current = true; setBooting(false); return;
    }
    const t = setTimeout(() => { done.current = true; setBooting(false); }, ms);
    return () => clearTimeout(t);
  }, [ms]);

  return booting;
}

export function BootOverlay({ lines }) {
  return (
    <div className="hud-boot" style={{
      position: "fixed", inset: 0, zIndex: 500, pointerEvents: "none",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 9,
      background: C.bgDeep,
    }}>
      {lines.map((l, i) => (
        <div key={i} className="hud-boot-line" style={{
          ...TYPE.micro, color: i === lines.length - 1 ? C.gold : C.dim,
          animationDelay: `${i * 130}ms`,
        }}>{l}</div>
      ))}
    </div>
  );
}

/* ── reticle ────────────────────────────────────────────────────────────────
   Targeting brackets that lock onto whatever is focused. Used sparingly: the
   active nav item only, so the frame has one thing it's tracking. */

export function Reticle({ tone = C.gold, size = 7 }) {
  return (
    <>
      <span style={{ position: "absolute", left: -3, top: -3, width: size, height: size,
                     borderTop: `1px solid ${tone}`, borderLeft: `1px solid ${tone}` }} />
      <span style={{ position: "absolute", right: -3, bottom: -3, width: size, height: size,
                     borderBottom: `1px solid ${tone}`, borderRight: `1px solid ${tone}` }} />
    </>
  );
}
