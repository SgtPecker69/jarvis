// One icon set, one stroke weight, one grid. Emoji were doing this job before —
// they carry another vendor's design language into yours, they can't take your
// accent colour, and they render differently on every machine.

const PATHS = {
  flame:     "M12 3c0 3-4 4-4 8a4 4 0 0 0 8 0c0-1.6-.8-2.7-1.6-3.6M12 21a7 7 0 0 1-7-7c0-4.5 4-6 5.5-10",
  scale:     "M12 4v16M5 8h14M7 8l-3 6a3 3 0 0 0 6 0L7 8zm10 0l-3 6a3 3 0 0 0 6 0l-3-6z",
  moon:      "M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z",
  dumbbell:  "M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10",
  spark:     "M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z",
  clock:     "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.2 2",
  bolt:      "M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5z",
  home:      "M3.5 10.5 12 4l8.5 6.5V20a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-9.5z",
  heart:     "M12 20s-7-4.4-7-9.3A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7 2.7c0 4.9-7 9.3-7 9.3z",
  chart:     "M4 20V10M10 20V4M16 20v-7M22 20H2",
  calendar:  "M4 8h16M8 3v3M16 3v3M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
  book:      "M5 4h9a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H5V4zM19 7v13",
  plug:      "M9 3v6M15 3v6M6 9h12v3a6 6 0 0 1-12 0V9zM12 18v3",
  settings:  "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 7.5 19.4l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 14H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 7.5l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H10a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a2 2 0 1 1 0 4h-.1z",
  message:   "M21 12a8 8 0 0 1-8 8H7l-4 3v-3a8 8 0 0 1 0-16h6a8 8 0 0 1 8 8z",
  droplet:   "M12 3s6 6.3 6 10a6 6 0 1 1-12 0c0-3.7 6-10 6-10z",
  arrowUp:   "M12 19V5M6 11l6-6 6 6",
  arrowDown: "M12 5v14M18 13l-6 6-6-6",
  check:     "M4 12.5 9 17.5 20 6.5",
};

export function Icon({ name, size = 18, color = "currentColor", strokeWidth = 1.6, style = {} }) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: "block", ...style }}
      aria-hidden="true"
    >
      {d.split(" M").map((seg, i) => <path key={i} d={i ? "M" + seg : seg} />)}
    </svg>
  );
}
