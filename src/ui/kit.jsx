// The bento kit.
//
// The old build had one card component used twelve times down a column, which
// is why every screen read the same. These tiles span a grid, so a view has a
// shape: one thing is large and leads, the rest support it.

import { C, RADIUS, TYPE, MOTION } from "../styles/tokens.js";
import { Icon } from "./Icon.jsx";

/** The grid every view sits in. Tiles declare their own span. */
export function Bento({ children, style = {} }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(6, 1fr)",
      gap: 12,
      ...style,
    }}>
      {children}
    </div>
  );
}

/**
 * One tile. `span` is columns out of 6 — 6 full width, 3 half, 2 third.
 * `tone` paints the tile as a colour field rather than tinting its border,
 * which is what lets one tile lead a screen.
 */
export function Tile({
  children, span = 3, tone, icon, label, action,
  interactive = false, style = {}, className = "", onClick,
}) {
  const field = tone
    ? `linear-gradient(150deg, ${tone}22 0%, ${tone}0A 46%, rgba(255,255,255,0.02) 100%)`
    : `linear-gradient(160deg, rgba(255,255,255,0.055) 0%, rgba(255,255,255,0.018) 60%)`;

  return (
    <div
      className={`tile ${interactive || onClick ? "tile-interactive" : ""} ${className}`}
      onClick={onClick}
      style={{
        gridColumn: `span ${span}`,
        position: "relative",
        borderRadius: RADIUS.lg,
        padding: "18px 20px 20px",
        background: field,
        border: `1px solid ${tone ? tone + "26" : C.border}`,
        overflow: "hidden",
        ...style,
      }}
    >
      {/* A single specular highlight along the top edge. Real glass catches
          light on one edge, not all four. */}
      <div style={{
        position: "absolute", top: 0, left: 20, right: 20, height: 1,
        background: `linear-gradient(90deg, transparent, ${tone ? tone + "80" : "rgba(255,255,255,0.28)"}, transparent)`,
        pointerEvents: "none",
      }} />

      {(label || icon || action) && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {icon && <Icon name={icon} size={15} color={tone || C.dimMid} />}
          {label && <span style={{ ...TYPE.micro, color: tone || C.dimMid }}>{label}</span>}
          {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
        </div>
      )}

      {children}
    </div>
  );
}

/**
 * The number is the tile. Light weight at large size is what makes a figure
 * read as data rather than as a headline — the old build used 700-weight
 * everywhere, which shouts and flattens.
 */
export function Stat({ value, unit, sub, tone = C.textBright, size = "stat" }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="data-num" style={{ ...TYPE[size], color: tone }}>{value}</span>
        {unit && (
          <span style={{ ...TYPE.small, color: C.dimMid, fontWeight: 500 }}>{unit}</span>
        )}
      </div>
      {sub && <div style={{ ...TYPE.small, color: C.dim, marginTop: 7 }}>{sub}</div>}
    </div>
  );
}

/** A thin progress track. No glow — the value should read, not the container. */
export function Track({ pct, tone = C.cyan, style = {} }) {
  return (
    <div style={{
      height: 4, borderRadius: 4, marginTop: 14,
      background: "rgba(255,255,255,0.08)", overflow: "hidden", ...style,
    }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, pct || 0))}%`,
        height: "100%", borderRadius: 4,
        background: `linear-gradient(90deg, ${tone}99, ${tone})`,
        transition: `width 900ms ${MOTION.ease}`,
      }} />
    </div>
  );
}

/**
 * A progress ring. Two tiles on a screen using rings and the rest using bars
 * would be noise, so this is for the one metric a view is actually about.
 */
export function Ring({ pct = 0, size = 108, stroke = 7, tone = C.cyan, children }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke="rgba(255,255,255,0.075)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
                stroke={tone} strokeWidth={stroke} strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - clamped / 100)}
                style={{ transition: `stroke-dashoffset 1s ${MOTION.ease}`,
                         filter: `drop-shadow(0 0 6px ${tone}66)` }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        {children}
      </div>
    </div>
  );
}

/** Section heading. Used between bentos to break a long view into chapters. */
export function Section({ title, sub, action }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, margin: "30px 2px 14px" }}>
      <div>
        <div style={{ ...TYPE.title, color: C.textBright }}>{title}</div>
        {sub && <div style={{ ...TYPE.small, color: C.dim, marginTop: 3 }}>{sub}</div>}
      </div>
      {action && <div style={{ marginLeft: "auto" }}>{action}</div>}
    </div>
  );
}

/** A row in a list. Lists beat tiles when the items are homogeneous. */
export function Row({ left, right, sub, tone, onClick }) {
  return (
    <div
      onClick={onClick}
      className={onClick ? "row-interactive" : ""}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 4px",
        borderBottom: `1px solid ${C.borderDim}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ ...TYPE.body, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {left}
        </div>
        {sub && <div style={{ ...TYPE.small, color: C.dim, marginTop: 2 }}>{sub}</div>}
      </div>
      {right != null && (
        <div className="data-num" style={{
          marginLeft: "auto", ...TYPE.body, fontWeight: 560, color: tone || C.textBright,
        }}>
          {right}
        </div>
      )}
    </div>
  );
}

/** Empty states say what to do, not "no data". */
export function Empty({ icon = "spark", text, hint }) {
  return (
    <div style={{ padding: "22px 4px", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Icon name={icon} size={17} color={C.dim} style={{ marginTop: 2 }} />
      <div>
        <div style={{ ...TYPE.body, color: C.dimMid }}>{text}</div>
        {hint && <div style={{ ...TYPE.small, color: C.dim, marginTop: 3 }}>{hint}</div>}
      </div>
    </div>
  );
}
