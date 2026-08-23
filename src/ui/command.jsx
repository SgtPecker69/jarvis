// The command palette.
//
// Jarvis is something you talk to, so the fastest path to anything should be
// typing at it — not hunting a rail with twelve items. Cmd-K anywhere opens
// this; it navigates, logs data, and forwards anything it doesn't recognise to
// Claude.
//
// The important design decision: logging is *parsed here*, so "w 183" writes a
// weight from any screen without navigating to Body first. Four clicks became
// four keystrokes.

import { useEffect, useMemo, useRef, useState } from "react";
import { C, TYPE, MOTION } from "../styles/tokens.js";

/* ── parsing ────────────────────────────────────────────────────────────────
   Deliberately forgiving about form and strict about numbers: "w 183",
   "weight 183", "183 lb" all log a weight, but anything without a real number
   falls through to Claude rather than silently logging nothing. */

const NUM = "([0-9]+(?:\\.[0-9]+)?)";

const PARSERS = [
  { verb: "weight",
    re: new RegExp(`^(?:w|wt|weight|mass)\\s+${NUM}|^${NUM}\\s*(?:lb|lbs|pounds)$`, "i"),
    describe: v => `Log weight — ${v} lb` },
  { verb: "waist",
    re: new RegExp(`^(?:waist)\\s+${NUM}|^${NUM}\\s*cm$`, "i"),
    describe: v => `Log waist — ${v} cm` },
  { verb: "sleep",
    re: new RegExp(`^(?:s|sleep|slept)\\s+${NUM}|^${NUM}\\s*(?:h|hr|hrs|hours)$`, "i"),
    describe: v => `Log sleep — ${v} hrs` },
];

function parseLog(input) {
  const q = input.trim();
  for (const p of PARSERS) {
    const m = p.re.exec(q);
    if (!m) continue;
    const value = Number(m[1] ?? m[2]);
    if (!Number.isFinite(value) || value <= 0) continue;
    return { verb: p.verb, value, label: p.describe(value) };
  }
  return null;
}

/** Subsequence match, so "trn" finds "Training" — cheap and predictable. */
function fuzzy(needle, haystack) {
  const n = needle.toLowerCase(), h = haystack.toLowerCase();
  if (!n) return true;
  let i = 0;
  for (const ch of h) if (ch === n[i]) i++;
  return i === n.length;
}

export function CommandPalette({ open, onClose, tabs, onNavigate, onLog, onAsk, currentTab }) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  useEffect(() => {
    if (!open) return;
    setQuery(""); setCursor(0);
    // Focus after paint, or the browser hands focus back to whatever opened it.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim();
    const out = [];

    const log = parseLog(q);
    if (log) out.push({ kind: "log", label: log.label, hint: "enter to record", run: () => onLog(log) });

    for (const [id, label] of tabs) {
      if (!fuzzy(q, label)) continue;
      out.push({
        kind: "go", label,
        hint: id === currentTab ? "current" : "go",
        run: () => onNavigate(id),
      });
    }

    // Anything typed that isn't a log or a view is a question for Claude.
    if (q && !log) out.push({ kind: "ask", label: `Ask Jarvis — “${q}”`, hint: "enter to send", run: () => onAsk(q) });

    return out;
  }, [query, tabs, currentTab, onLog, onNavigate, onAsk]);

  useEffect(() => { setCursor(c => Math.min(c, Math.max(0, items.length - 1))); }, [items.length]);

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current?.children[cursor]?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  if (!open) return null;

  const onKeyDown = (e) => {
    if (e.key === "Escape")      { e.preventDefault(); onClose(); }
    if (e.key === "ArrowDown")   { e.preventDefault(); setCursor(c => Math.min(c + 1, items.length - 1)); }
    if (e.key === "ArrowUp")     { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === "Enter")       {
      e.preventDefault();
      const item = items[cursor];
      if (item) { item.run(); onClose(); }
    }
  };

  return (
    <div
      onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 600,
        background: "rgba(3,3,3,0.72)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "14vh",
        animation: `fadeIn 140ms ${MOTION.ease}`,
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label="Command palette"
        onKeyDown={onKeyDown}
        style={{
          width: "min(620px, calc(100vw - 40px))",
          background: C.bg,
          border: `1px solid ${C.gold}`,
          animation: `cmd-in 220ms ${MOTION.lock}`,
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", gap: 13,
          padding: "17px 20px", borderBottom: `1px solid ${C.line}`,
        }}>
          <span className="hud-num" style={{ color: C.gold, fontSize: 14 }}>&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            placeholder="jump, log, or ask"
            aria-label="Command"
            style={{
              flex: 1, background: "none", border: "none", outline: "none",
              color: C.textBright, fontFamily: "inherit", fontSize: 16, fontWeight: 350,
            }}
          />
          <kbd className="hud-label" style={{ color: C.dim }}>esc</kbd>
        </div>

        <div ref={listRef} style={{ maxHeight: "48vh", overflowY: "auto" }}>
          {items.length === 0 && (
            <div className="hud-label" style={{ color: C.dim, padding: "22px 20px" }}>
              nothing matches
            </div>
          )}

          {items.map((item, i) => (
            <button
              key={`${item.kind}-${item.label}`}
              onMouseEnter={() => setCursor(i)}
              onClick={() => { item.run(); onClose(); }}
              style={{
                display: "flex", alignItems: "center", gap: 14, width: "100%",
                padding: "13px 20px", border: "none", cursor: "pointer",
                textAlign: "left", fontFamily: "inherit",
                background: i === cursor ? "rgba(201,162,39,0.10)" : "transparent",
                borderLeft: `2px solid ${i === cursor ? C.gold : "transparent"}`,
                color: i === cursor ? C.textBright : C.text,
                transition: `background 90ms linear`,
              }}
            >
              <span className="hud-label" style={{
                color: item.kind === "log" ? C.gold : C.dim, minWidth: 34,
              }}>
                {item.kind === "go" ? "go" : item.kind === "log" ? "rec" : "ask"}
              </span>
              <span style={{ ...TYPE.body, flex: 1 }}>{item.label}</span>
              <span className="hud-label" style={{ color: C.dim }}>{item.hint}</span>
            </button>
          ))}
        </div>

        <div style={{
          display: "flex", gap: 18, padding: "11px 20px",
          borderTop: `1px solid ${C.line}`,
        }}>
          {[["↑↓", "move"], ["↵", "run"], ["w 183", "log weight"], ["s 7.5", "log sleep"]].map(([k, v]) => (
            <span key={k} className="hud-label" style={{ color: C.dim }}>
              <span style={{ color: C.dimMid }}>{k}</span> {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Cmd-K / Ctrl-K anywhere, and "/" when not already typing. */
export function useCommandKey(setOpen) {
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA)$/.test(e.target?.tagName) || e.target?.isContentEditable;
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault(); setOpen(o => !o);
      } else if (e.key === "/" && !typing) {
        e.preventDefault(); setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);
}
