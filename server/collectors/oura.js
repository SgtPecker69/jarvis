// Oura → metrics. Ported from the browser hook, which could only run while the
// page was open. Here it runs whether or not anything is looking at it.
//
// Needs OURA_TOKEN in .env (Personal Access Token from
// cloud.ouraring.com/personal-access-tokens).

const API = "https://api.ouraring.com/v2/usercollection";

const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

// Metrics are timestamped at noon UTC on the day they describe, matching what
// the manual entries do, so a day has one row per source per metric and the
// UNIQUE constraint makes a re-run a correction rather than a duplicate.
const dayTs = (d) => `${d}T12:00:00.000Z`;

async function get(endpoint, token, days) {
  const url = `${API}/${endpoint}?start_date=${day(days)}&end_date=${day(0)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });

  if (!res.ok) {
    throw new Error(
      res.status === 401 || res.status === 403
        ? "Oura rejected the token — check OURA_TOKEN in .env"
        : `Oura API error ${res.status} on ${endpoint}`
    );
  }
  return (await res.json()).data ?? [];
}

export const oura = {
  name: "oura",
  enabled: () => !!process.env.OURA_TOKEN,
  reason:  "OURA_TOKEN not set in .env",

  async collect({ days = 14 } = {}) {
    const token = process.env.OURA_TOKEN;
    const rows  = [];

    const [readiness, dailySleep, sessions, activity] = await Promise.all([
      get("daily_readiness", token, days),
      get("daily_sleep",     token, days),
      get("sleep",           token, days),
      get("daily_activity",  token, days),
    ]);

    const add = (metric, value, unit, d) => {
      if (value == null || !d) return;
      rows.push({ source: "oura", metric, value: Number(value), unit, ts: dayTs(d) });
    };

    for (const r of readiness)  add("readiness_score", r.score, null, r.day);
    for (const s of dailySleep) add("sleep_score",     s.score, null, s.day);
    for (const a of activity) {
      add("steps",         a.steps,             "steps", a.day);
      add("active_kcal",   a.active_calories,   "kcal",  a.day);
    }

    // Only the main night's sleep — naps would otherwise double a day's hours.
    for (const s of sessions.filter(x => x.type === "long_sleep")) {
      add("sleep_hours", s.total_sleep_duration ? s.total_sleep_duration / 3600 : null, "h",  s.day);
      add("rem_hours",   s.rem_sleep_duration   ? s.rem_sleep_duration   / 3600 : null, "h",  s.day);
      add("deep_hours",  s.deep_sleep_duration  ? s.deep_sleep_duration  / 3600 : null, "h",  s.day);
      add("resting_hr",  s.lowest_heart_rate,  "bpm", s.day);
      add("hrv",         s.average_hrv,        "ms",  s.day);
    }

    return rows;
  },
};
