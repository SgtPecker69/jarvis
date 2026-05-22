import { useState, useEffect, useCallback } from "react";

const RECIPES = [
  { id: 9, name: "Ground Beef & Baby Bella Bowl", cal: 310, protein: 42, carbs: 11, fat: 10, meal: [1,2,3], tags: ["beef","bowl"], time: 25, cuisine: "American" },
  { id: 10, name: "Cottage Cheese Pizza", cal: 780, protein: 88, carbs: 38, fat: 28, meal: [4], tags: ["pizza","cheese"], time: 35, cuisine: "Italian" },
  { id: 11, name: "Shrimp Ceviche", cal: 180, protein: 38, carbs: 10, fat: 1.5, meal: [1,2,3], tags: ["shrimp","fresh"], time: 45, cuisine: "Mexican" },
  { id: 12, name: "Mediterranean Tuna Salad", cal: 190, protein: 45, carbs: 13, fat: 1.5, meal: [1,2,3], tags: ["tuna","salad"], time: 10, cuisine: "Mediterranean" },
  { id: 13, name: "Crispy Chicken Cutlets", cal: 630, protein: 94, carbs: 12, fat: 16, meal: [2,3,4], tags: ["chicken","crispy"], time: 20, cuisine: "American" },
  { id: 14, name: "Taco Bell Crunchwrap Dupe", cal: 568, protein: 84, carbs: 84, fat: 16, meal: [4], tags: ["beef","tacos"], time: 20, cuisine: "Mexican" },
  { id: 15, name: "McDouble Dupe", cal: 420, protein: 48, carbs: 12, fat: 18, meal: [3,4], tags: ["beef","burger"], time: 15, cuisine: "American" },
  { id: 16, name: "ShackBurger Dupe", cal: 468, protein: 59.6, carbs: 39.7, fat: 16.2, meal: [3,4], tags: ["beef","burger"], time: 15, cuisine: "American" },
  { id: 17, name: "Protein Pancakes v2", cal: 465, protein: 57, carbs: 30, fat: 6, meal: [1], tags: ["breakfast","pancakes"], time: 20, cuisine: "American" },
  { id: 21, name: "Crispy Chicken Nuggets", cal: 500, protein: 74, carbs: 16, fat: 11, meal: [2,3,4], tags: ["chicken","crispy"], time: 20, cuisine: "American" },
  { id: 22, name: "Sausage Pepper Protein Biscuits", cal: 280, protein: 28, carbs: 22, fat: 8, meal: [1,2], tags: ["breakfast","sausage"], time: 30, cuisine: "American" },
  { id: 23, name: "Spicy Sesame Beef Udon", cal: 400, protein: 56, carbs: 56, fat: 19, meal: [4], tags: ["beef","noodles","udon"], time: 25, cuisine: "Asian" },
  { id: 24, name: "Birthday Cake Ninja Creami", cal: 295, protein: 32, carbs: 33, fat: 4, meal: [4,5], tags: ["dessert","creami"], time: 5, cuisine: "American" },
  { id: 25, name: "Earl Grey Ninja Creami", cal: 270, protein: 30, carbs: 27, fat: 3.5, meal: [4,5], tags: ["dessert","creami"], time: 5, cuisine: "American" },
  { id: 27, name: "Turkish Potato Omelette", cal: 375, protein: 38, carbs: 28, fat: 9, meal: [1], tags: ["breakfast","eggs"], time: 20, cuisine: "Mediterranean" },
  { id: 28, name: "Birria Tacos", cal: 530, protein: 54, carbs: 30, fat: 18, meal: [3,4], tags: ["beef","tacos"], time: 60, cuisine: "Mexican" },
  { id: 29, name: "Bold Chex Mix Dupe", cal: 110, protein: 11, carbs: 14, fat: 5, meal: [2,3], tags: ["snack"], time: 30, cuisine: "American" },
  { id: 30, name: "Dakgalbi Jeon", cal: 210, protein: 26, carbs: 15, fat: 5, meal: [2,3], tags: ["chicken","korean"], time: 20, cuisine: "Korean" },
  { id: 31, name: "Bulgogi Smash Tacos", cal: 520, protein: 55, carbs: 25, fat: 16, meal: [3,4], tags: ["beef","tacos","korean"], time: 25, cuisine: "Korean" },
];

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const FULL_DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const LIGHTING_SCENES = [
  { id: "wake", label: "Wake Up", icon: "☀️", bri: 254, ct: 153, desc: "Cool bright light" },
  { id: "focus", label: "Focus", icon: "🧠", bri: 220, ct: 200, desc: "Neutral productive" },
  { id: "training", label: "Training", icon: "⚡", bri: 254, ct: 153, desc: "High energy" },
  { id: "wind_down", label: "Wind Down", icon: "🌙", bri: 80, ct: 400, desc: "Warm & dim" },
  { id: "sleep", label: "Sleep", icon: "😴", bri: 10, ct: 500, desc: "Near off, warm" },
  { id: "meal_prep", label: "Meal Prep", icon: "🍳", bri: 240, ct: 230, desc: "Bright & clear" },
];

const MOCK_HUE_STATE = {
  connected: false,
  bridgeIp: "",
  username: "",
  lights: [],
};

function useLocalStorage(key, defaultVal) {
  const [val, setVal] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultVal;
    } catch { return defaultVal; }
  });
  const set = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}

function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Good night";
}

function todayStr() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function isTrainingDay() {
  const d = new Date().getDay();
  return [1,2,3,6].includes(d); // Mon Tue Wed Sat
}

function isRestDay() {
  const d = new Date().getDay();
  return [0,4].includes(d); // Sun Thu
}

function getTodayRitual() {
  const d = new Date().getDay();
  if (d === 0) return "🥯 Bagel Pub + Meal Prep Day";
  if (d === 3) return "🍔 Wednesday Smash Burger Night";
  if (d === 6) return "🍟 Saturday McDonald's";
  return null;
}

export default function Jarvis() {
  const [tab, setTab] = useState("briefing");
  const [macros, setMacros] = useLocalStorage("jarvis_macros", { cal: 0, protein: 0, carbs: 0, fat: 0 });
  const [measurements, setMeasurements] = useLocalStorage("jarvis_measurements", { weight: [], waist: [] });
  const [sleep, setSleep] = useLocalStorage("jarvis_sleep", []);
  const [hue, setHue] = useLocalStorage("jarvis_hue", MOCK_HUE_STATE);
  const [hueInput, setHueInput] = useState({ ip: hue.bridgeIp || "", username: hue.username || "" });
  const [lightStatus, setLightStatus] = useState({});
  const [sceneLoading, setSceneLoading] = useState(null);
  const [recipeFilter, setRecipeFilter] = useState({ search: "", meal: "all", cuisine: "all", maxCal: 800 });
  const [logInput, setLogInput] = useState({ cal: "", protein: "", carbs: "", fat: "" });
  const [measureInput, setMeasureInput] = useState({ weight: "", waist: "" });
  const [sleepInput, setSleepInput] = useState({ hours: "", bedtime: "" });
  const [coffeeOn, setCoffeeOn] = useLocalStorage("jarvis_coffee", false);
  const [notification, setNotification] = useState(null);

  const targetCal = 1685;
  const targetProtein = 170;

  const todayRitual = getTodayRitual();
  const training = isTrainingDay();
  const rest = isRestDay();

  const latestWeight = measurements.weight.length ? measurements.weight[measurements.weight.length - 1].val : null;
  const latestWaist = measurements.waist.length ? measurements.waist[measurements.waist.length - 1].val : null;
  const avgSleep = sleep.length ? (sleep.slice(-7).reduce((a,b) => a + b.hours, 0) / Math.min(sleep.length, 7)).toFixed(1) : null;
  const sleepDebt = avgSleep ? Math.max(0, (8 - parseFloat(avgSleep)) * 7).toFixed(1) : null;

  const calLeft = Math.max(0, targetCal - macros.cal);
  const proteinLeft = Math.max(0, targetProtein - macros.protein);
  const calPct = Math.min(100, Math.round((macros.cal / targetCal) * 100));
  const proteinPct = Math.min(100, Math.round((macros.protein / targetProtein) * 100));

  function notify(msg, type = "success") {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }

  async function callHueApi(path, method = "GET", body = null) {
    if (!hue.bridgeIp || !hue.username) return null;
    const url = `http://${hue.bridgeIp}/api/${hue.username}${path}`;
    const opts = { method, headers: { "Content-Type": "application/json" } };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(url, opts);
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  async function connectHue() {
    const ip = hueInput.ip.trim();
    const user = hueInput.username.trim();
    if (!ip || !user) { notify("Enter bridge IP and username", "error"); return; }
    const data = await fetch(`http://${ip}/api/${user}/lights`).then(r => r.json()).catch(() => null);
    if (!data || data[0]?.error) { notify("Could not connect to Hue Bridge", "error"); return; }
    const lights = Object.entries(data).map(([id, l]) => ({ id, name: l.name, on: l.state.on, bri: l.state.bri }));
    setHue({ connected: true, bridgeIp: ip, username: user, lights });
    notify("Connected to Hue Bridge!");
  }

  async function applyScene(scene) {
    setSceneLoading(scene.id);
    if (hue.connected && hue.lights.length > 0) {
      const promises = hue.lights.map(l =>
        callHueApi(`/lights/${l.id}/state`, "PUT", { on: scene.bri > 0, bri: scene.bri, ct: scene.ct, transitiontime: 10 })
      );
      await Promise.all(promises);
      notify(`${scene.label} mode activated`);
    } else {
      await new Promise(r => setTimeout(r, 600));
      notify(`${scene.label} — connect Hue Bridge to control lights`);
    }
    setSceneLoading(null);
  }

  async function toggleCoffee() {
    const next = !coffeeOn;
    setCoffeeOn(next);
    notify(next ? "☕ Coffee maker on" : "Coffee maker off");
  }

  function logMacros() {
    const c = parseFloat(logInput.cal) || 0;
    const p = parseFloat(logInput.protein) || 0;
    const ca = parseFloat(logInput.carbs) || 0;
    const f = parseFloat(logInput.fat) || 0;
    setMacros({ cal: macros.cal + c, protein: macros.protein + p, carbs: macros.carbs + ca, fat: macros.fat + f });
    setLogInput({ cal: "", protein: "", carbs: "", fat: "" });
    notify("Macros logged");
  }

  function resetMacros() {
    setMacros({ cal: 0, protein: 0, carbs: 0, fat: 0 });
    notify("Macros reset for new day");
  }

  function logMeasurement() {
    const w = parseFloat(measureInput.weight);
    const wa = parseFloat(measureInput.waist);
    const date = new Date().toLocaleDateString();
    const newM = { ...measurements };
    if (w) newM.weight = [...measurements.weight, { date, val: w }].slice(-30);
    if (wa) newM.waist = [...measurements.waist, { date, val: wa }].slice(-30);
    setMeasurements(newM);
    setMeasureInput({ weight: "", waist: "" });
    notify("Measurements saved");
  }

  function logSleep() {
    const h = parseFloat(sleepInput.hours);
    if (!h) { notify("Enter sleep hours", "error"); return; }
    const date = new Date().toLocaleDateString();
    setSleep([...sleep, { date, hours: h, bedtime: sleepInput.bedtime }].slice(-30));
    setSleepInput({ hours: "", bedtime: "" });
    notify("Sleep logged");
  }

  const filteredRecipes = RECIPES.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(recipeFilter.search.toLowerCase()) ||
      r.tags.some(t => t.includes(recipeFilter.search.toLowerCase()));
    const matchMeal = recipeFilter.meal === "all" || r.meal.includes(parseInt(recipeFilter.meal));
    const matchCuisine = recipeFilter.cuisine === "all" || r.cuisine === recipeFilter.cuisine;
    const matchCal = r.cal <= recipeFilter.maxCal;
    return matchSearch && matchMeal && matchCuisine && matchCal;
  });

  const cuisines = [...new Set(RECIPES.map(r => r.cuisine))].sort();

  const styles = {
    app: { fontFamily: "'DM Sans', 'SF Pro Display', system-ui, sans-serif", minHeight: "100vh", background: "#0a0a0f", color: "#e8e8f0" },
    header: { padding: "20px 24px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" },
    headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
    greeting: { fontSize: 13, color: "#6b6b8a", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 },
    title: { fontSize: 26, fontWeight: 600, color: "#e8e8f0", letterSpacing: "-0.02em" },
    date: { fontSize: 13, color: "#6b6b8a", marginTop: 2 },
    statusPills: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
    pill: (color) => ({ padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 500, background: color + "22", color: color, border: `1px solid ${color}44` }),
    tabs: { display: "flex", gap: 0, overflowX: "auto" },
    tab: (active) => ({ padding: "10px 16px", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#a78bfa" : "#6b6b8a", borderBottom: active ? "2px solid #a78bfa" : "2px solid transparent", background: "none", border: "none", borderBottom: active ? "2px solid #a78bfa" : "2px solid transparent", cursor: "pointer", whiteSpace: "nowrap", transition: "color 0.2s" }),
    content: { padding: "20px 24px", maxWidth: 720, margin: "0 auto" },
    card: { background: "#13131f", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 },
    cardTitle: { fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "#6b6b8a", marginBottom: 12, fontWeight: 600 },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
    metricCard: { background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 10, padding: "12px 14px" },
    metricLabel: { fontSize: 11, color: "#6b6b8a", marginBottom: 4, letterSpacing: "0.06em" },
    metricValue: { fontSize: 22, fontWeight: 600, color: "#e8e8f0", letterSpacing: "-0.02em" },
    metricUnit: { fontSize: 12, color: "#6b6b8a", marginLeft: 3 },
    progressBar: (pct, color) => ({ width: "100%", height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginTop: 8, position: "relative" }),
    progressFill: (pct, color) => ({ width: `${pct}%`, height: "100%", background: color, borderRadius: 2, transition: "width 0.5s ease" }),
    btn: (variant = "default") => ({
      padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "none", transition: "all 0.15s",
      background: variant === "primary" ? "#a78bfa" : variant === "danger" ? "#ef4444" : variant === "success" ? "#10b981" : "rgba(255,255,255,0.07)",
      color: variant === "primary" || variant === "danger" || variant === "success" ? "#fff" : "#c8c8e0",
    }),
    input: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e8e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" },
    sceneGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 },
    sceneBtn: (active, loading) => ({ background: loading ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${active ? "#a78bfa" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "12px 8px", cursor: "pointer", textAlign: "center", transition: "all 0.2s", opacity: loading ? 0.7 : 1 }),
    recipeCard: { background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 10 },
    tag: { display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 500, background: "rgba(167,139,250,0.12)", color: "#a78bfa", marginRight: 4 },
    select: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 12px", color: "#e8e8f0", fontSize: 13, outline: "none" },
    notification: (type) => ({ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", padding: "10px 20px", borderRadius: 10, background: type === "error" ? "#ef444422" : "#10b98122", border: `1px solid ${type === "error" ? "#ef4444" : "#10b981"}`, color: type === "error" ? "#ef4444" : "#10b981", fontSize: 14, fontWeight: 500, zIndex: 1000, whiteSpace: "nowrap" }),
    ritual: { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 14, color: "#fbbf24", display: "flex", alignItems: "center", gap: 8 },
    waistProgress: { marginTop: 8 },
    waistBar: { width: "100%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginTop: 6, position: "relative" },
    separator: { height: 1, background: "rgba(255,255,255,0.05)", margin: "12px 0" },
  };

  const waistTarget = 82.5;
  const waistPct = latestWaist ? Math.min(100, Math.round((1 - Math.max(0, latestWaist - waistTarget) / 10) * 100)) : 0;

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {notification && <div style={styles.notification(notification.type)}>{notification.msg}</div>}

      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <div style={styles.greeting}>JARVIS</div>
            <div style={styles.title}>{timeGreeting()}, Mark</div>
            <div style={styles.date}>{todayStr()}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>TODAY</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: training ? "#10b981" : "#6b6b8a" }}>
              {training ? "⚡ Training Day" : rest ? "😴 Rest Day" : "Active Day"}
            </div>
          </div>
        </div>

        {todayRitual && <div style={styles.ritual}>{todayRitual}</div>}

        <div style={styles.statusPills}>
          <span style={styles.pill("#a78bfa")}>{Math.round(calLeft)} cal left</span>
          <span style={styles.pill("#10b981")}>{Math.round(proteinLeft)}g protein left</span>
          {latestWaist && <span style={styles.pill(latestWaist <= 84 ? "#10b981" : "#f59e0b")}>{latestWaist}cm waist</span>}
          {avgSleep && <span style={styles.pill(parseFloat(avgSleep) >= 7 ? "#10b981" : "#ef4444")}>{avgSleep}h avg sleep</span>}
          <span style={styles.pill(hue.connected ? "#10b981" : "#6b6b8a")}>{hue.connected ? "Hue ●" : "Hue ○"}</span>
        </div>

        <div style={styles.tabs}>
          {[["briefing","Briefing"],["macros","Macros"],["environment","Home"],["recipes","Recipes"],["body","Body"],["sleep","Sleep"]].map(([id, label]) => (
            <button key={id} style={styles.tab(tab === id)} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      <div style={styles.content}>

        {tab === "briefing" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Today's targets</div>
              <div style={styles.grid2}>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>CALORIES</div>
                  <div><span style={styles.metricValue}>{Math.round(macros.cal)}</span><span style={styles.metricUnit}>/ {targetCal}</span></div>
                  <div style={styles.progressBar(calPct)}><div style={styles.progressFill(calPct, "#a78bfa")} /></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>PROTEIN</div>
                  <div><span style={styles.metricValue}>{Math.round(macros.protein)}g</span><span style={styles.metricUnit}>/ {targetProtein}g</span></div>
                  <div style={styles.progressBar(proteinPct)}><div style={styles.progressFill(proteinPct, "#10b981")} /></div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Body progress</div>
              <div style={styles.grid2}>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>WEIGHT</div>
                  <div><span style={styles.metricValue}>{latestWeight || "—"}</span><span style={styles.metricUnit}>lbs</span></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>WAIST</div>
                  <div><span style={styles.metricValue}>{latestWaist || "—"}</span><span style={styles.metricUnit}>cm</span></div>
                  {latestWaist && (
                    <div style={styles.waistBar}>
                      <div style={{ ...styles.progressFill(waistPct, latestWaist <= 84 ? "#10b981" : "#f59e0b") }} />
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginTop: 4 }}>Target: 81–84cm</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Recovery</div>
              <div style={styles.grid3}>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>AVG SLEEP</div>
                  <div><span style={styles.metricValue}>{avgSleep || "—"}</span><span style={styles.metricUnit}>hrs</span></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>SLEEP DEBT</div>
                  <div><span style={{ ...styles.metricValue, color: sleepDebt > 5 ? "#ef4444" : "#e8e8f0" }}>{sleepDebt || "—"}</span><span style={styles.metricUnit}>hrs</span></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>TODAY</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: training ? "#10b981" : "#6b6b8a", marginTop: 4 }}>{training ? "Train" : rest ? "Rest" : "Active"}</div>
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Quick environment</div>
              <div style={styles.sceneGrid}>
                {LIGHTING_SCENES.slice(0, 6).map(s => (
                  <button key={s.id} style={styles.sceneBtn(false, sceneLoading === s.id)} onClick={() => applyScene(s)}>
                    <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#c8c8e0" }}>{s.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "macros" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Today's macros</div>
              <div style={styles.grid2}>
                {[
                  { label: "Calories", val: macros.cal, target: targetCal, unit: "", color: "#a78bfa" },
                  { label: "Protein", val: macros.protein, target: targetProtein, unit: "g", color: "#10b981" },
                  { label: "Carbs", val: macros.carbs, target: 150, unit: "g", color: "#f59e0b" },
                  { label: "Fat", val: macros.fat, target: 55, unit: "g", color: "#06b6d4" },
                ].map(m => (
                  <div key={m.label} style={styles.metricCard}>
                    <div style={styles.metricLabel}>{m.label.toUpperCase()}</div>
                    <div><span style={{ ...styles.metricValue, color: m.color }}>{Math.round(m.val)}{m.unit}</span><span style={styles.metricUnit}>/ {m.target}{m.unit}</span></div>
                    <div style={styles.progressBar()}><div style={styles.progressFill(Math.min(100, Math.round(m.val/m.target*100)), m.color)} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Log a meal</div>
              <div style={styles.grid2}>
                {["cal","protein","carbs","fat"].map(k => (
                  <div key={k}>
                    <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4, textTransform: "uppercase" }}>{k === "cal" ? "Calories" : k.charAt(0).toUpperCase() + k.slice(1)}</div>
                    <input style={styles.input} type="number" placeholder="0" value={logInput[k]} onChange={e => setLogInput({...logInput, [k]: e.target.value})} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button style={styles.btn("primary")} onClick={logMacros}>Log Meal</button>
                <button style={styles.btn()} onClick={resetMacros}>Reset Day</button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Meal suggestions for remaining macros</div>
              {RECIPES.filter(r => r.cal <= calLeft + 50 && r.protein >= 30).slice(0, 3).map(r => (
                <div key={r.id} style={{ ...styles.recipeCard, marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>#{r.id} {r.name}</div>
                    <div style={{ fontSize: 13, color: "#a78bfa" }}>{r.cal} cal</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 4 }}>{r.protein}g P · {r.carbs}g C · {r.fat}g F</div>
                </div>
              ))}
              {RECIPES.filter(r => r.cal <= calLeft + 50 && r.protein >= 30).length === 0 && (
                <div style={{ color: "#6b6b8a", fontSize: 13 }}>You've hit your targets for today 🎯</div>
              )}
            </div>
          </>
        )}

        {tab === "environment" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Hue Bridge connection</div>
              {hue.connected ? (
                <div>
                  <div style={{ color: "#10b981", fontSize: 13, marginBottom: 12 }}>● Connected to {hue.bridgeIp} — {hue.lights.length} lights</div>
                  <button style={styles.btn("danger")} onClick={() => { setHue(MOCK_HUE_STATE); notify("Disconnected"); }}>Disconnect</button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 12 }}>Enter your Hue Bridge IP and username to control lights. Find your IP at <span style={{ color: "#a78bfa" }}>discovery.meethue.com</span></div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>BRIDGE IP</div>
                    <input style={styles.input} placeholder="192.168.x.x" value={hueInput.ip} onChange={e => setHueInput({...hueInput, ip: e.target.value})} />
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>USERNAME (API KEY)</div>
                    <input style={styles.input} placeholder="your-hue-api-key" value={hueInput.username} onChange={e => setHueInput({...hueInput, username: e.target.value})} />
                  </div>
                  <button style={styles.btn("primary")} onClick={connectHue}>Connect Bridge</button>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Lighting scenes</div>
              <div style={styles.sceneGrid}>
                {LIGHTING_SCENES.map(s => (
                  <button key={s.id} style={styles.sceneBtn(false, sceneLoading === s.id)} onClick={() => applyScene(s)}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c8c8e0", marginBottom: 3 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#6b6b8a" }}>{s.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Coffee maker</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>Smart Plug</div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 2 }}>TP-Link Tapo / Smart plug</div>
                </div>
                <button style={{ ...styles.btn(coffeeOn ? "success" : "default"), minWidth: 90 }} onClick={toggleCoffee}>
                  {coffeeOn ? "☕ On" : "Off"}
                </button>
              </div>
              <div style={styles.separator} />
              <div style={{ fontSize: 12, color: "#6b6b8a" }}>Connect your Tapo plug via the Tapo app, then integrate with HomeKit to enable full automation.</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Automation schedule</div>
              {[
                { time: "Morning", trigger: "On wake", action: "Wake Up lighting scene", icon: "☀️" },
                { time: "4:30 PM", trigger: "Training days", action: "Pre-workout reminder + Training scene", icon: "⚡" },
                { time: "11:00 PM", trigger: "Daily", action: "Wind Down scene activates", icon: "🌙" },
                { time: "Sunday", trigger: "Weekly", action: "Meal Prep mode + Bagel Pub reminder", icon: "🥯" },
                { time: "Wednesday", trigger: "Weekly", action: "Smash Burger Night reminder", icon: "🍔" },
              ].map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ fontSize: 18, minWidth: 24 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#c8c8e0" }}>{a.action}</div>
                    <div style={{ fontSize: 11, color: "#6b6b8a", marginTop: 2 }}>{a.time} · {a.trigger}</div>
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 4, padding: "8px 10px", background: "rgba(167,139,250,0.06)", borderRadius: 8 }}>
                Set these up in Apple Shortcuts for background automation. Jarvis scenes fire on demand — Shortcuts run them automatically.
              </div>
            </div>
          </>
        )}

        {tab === "recipes" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>KRANK recipe library — {RECIPES.length} recipes</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input style={styles.input} placeholder="Search recipes or tags..." value={recipeFilter.search} onChange={e => setRecipeFilter({...recipeFilter, search: e.target.value})} />
                <div style={{ display: "flex", gap: 8 }}>
                  <select style={styles.select} value={recipeFilter.meal} onChange={e => setRecipeFilter({...recipeFilter, meal: e.target.value})}>
                    <option value="all">All meals</option>
                    <option value="1">Meal 1</option>
                    <option value="2">Meal 2</option>
                    <option value="3">Meal 3</option>
                    <option value="4">Meal 4</option>
                  </select>
                  <select style={styles.select} value={recipeFilter.cuisine} onChange={e => setRecipeFilter({...recipeFilter, cuisine: e.target.value})}>
                    <option value="all">All cuisines</option>
                    {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>MAX CALORIES: {recipeFilter.maxCal}</div>
                  <input type="range" min={100} max={800} step={50} value={recipeFilter.maxCal} onChange={e => setRecipeFilter({...recipeFilter, maxCal: parseInt(e.target.value)})} style={{ width: "100%", accentColor: "#a78bfa" }} />
                </div>
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 12 }}>{filteredRecipes.length} recipes shown</div>

            {filteredRecipes.map(r => (
              <div key={r.id} style={styles.recipeCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: "#6b6b8a", fontWeight: 600 }}>#{r.id}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0" }}>{r.name}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#6b6b8a", marginBottom: 8 }}>
                      {r.protein}g P · {r.carbs}g C · {r.fat}g F · {r.time}min · Meal {r.meal.join("/")}
                    </div>
                    <div>{r.tags.map(t => <span key={t} style={styles.tag}>{t}</span>)}</div>
                  </div>
                  <div style={{ textAlign: "right", marginLeft: 12 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#a78bfa" }}>{r.cal}</div>
                    <div style={{ fontSize: 10, color: "#6b6b8a" }}>cal</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "body" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Log measurements</div>
              <div style={styles.grid2}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>WEIGHT (lbs)</div>
                  <input style={styles.input} type="number" placeholder="0" value={measureInput.weight} onChange={e => setMeasureInput({...measureInput, weight: e.target.value})} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>WAIST (cm)</div>
                  <input style={styles.input} type="number" placeholder="0" value={measureInput.waist} onChange={e => setMeasureInput({...measureInput, waist: e.target.value})} />
                </div>
              </div>
              <button style={{ ...styles.btn("primary"), marginTop: 14 }} onClick={logMeasurement}>Save</button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Waist goal tracker</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <div><span style={{ fontSize: 28, fontWeight: 600, color: "#e8e8f0" }}>{latestWaist || "—"}</span><span style={{ fontSize: 13, color: "#6b6b8a" }}> cm</span></div>
                <div style={{ fontSize: 13, color: "#6b6b8a" }}>Target 81–84cm</div>
              </div>
              {latestWaist && (
                <>
                  <div style={styles.waistBar}>
                    <div style={{ width: `${waistPct}%`, height: "100%", background: latestWaist <= 84 ? "#10b981" : "#f59e0b", borderRadius: 4, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 6 }}>
                    {latestWaist <= 81 ? "✅ In target range!" : latestWaist <= 84 ? "✅ In target range" : `${(latestWaist - 84).toFixed(1)}cm above target`}
                  </div>
                </>
              )}
            </div>

            {measurements.weight.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>Weight history (last 10)</div>
                {[...measurements.weight].reverse().slice(0, 10).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 13, color: "#6b6b8a" }}>{m.date}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0" }}>{m.val} lbs</span>
                  </div>
                ))}
              </div>
            )}

            {measurements.waist.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>Waist history (last 10)</div>
                {[...measurements.waist].reverse().slice(0, 10).map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 13, color: "#6b6b8a" }}>{m.date}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: m.val <= 84 ? "#10b981" : "#f59e0b" }}>{m.val} cm</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "sleep" && (
          <>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Log sleep</div>
              <div style={styles.grid2}>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>HOURS SLEPT</div>
                  <input style={styles.input} type="number" step="0.5" placeholder="7.5" value={sleepInput.hours} onChange={e => setSleepInput({...sleepInput, hours: e.target.value})} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#6b6b8a", marginBottom: 4 }}>BEDTIME</div>
                  <input style={styles.input} type="time" value={sleepInput.bedtime} onChange={e => setSleepInput({...sleepInput, bedtime: e.target.value})} />
                </div>
              </div>
              <button style={{ ...styles.btn("primary"), marginTop: 14 }} onClick={logSleep}>Log Sleep</button>
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitle}>Sleep overview</div>
              <div style={styles.grid3}>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>7-DAY AVG</div>
                  <div><span style={{ ...styles.metricValue, color: avgSleep >= 7 ? "#10b981" : "#ef4444" }}>{avgSleep || "—"}</span><span style={styles.metricUnit}>hrs</span></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>DEBT</div>
                  <div><span style={{ ...styles.metricValue, color: sleepDebt > 5 ? "#ef4444" : "#e8e8f0" }}>{sleepDebt || "—"}</span><span style={styles.metricUnit}>hrs</span></div>
                </div>
                <div style={styles.metricCard}>
                  <div style={styles.metricLabel}>ENTRIES</div>
                  <div><span style={styles.metricValue}>{sleep.length}</span></div>
                </div>
              </div>
            </div>

            {sleep.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardTitle}>Recent sleep log</div>
                {[...sleep].reverse().slice(0, 10).map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <div>
                      <span style={{ fontSize: 13, color: "#6b6b8a" }}>{s.date}</span>
                      {s.bedtime && <span style={{ fontSize: 12, color: "#6b6b8a", marginLeft: 8 }}>Bed: {s.bedtime}</span>}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: s.hours >= 7 ? "#10b981" : s.hours >= 6 ? "#f59e0b" : "#ef4444" }}>{s.hours}h</span>
                  </div>
                ))}
              </div>
            )}

            <div style={styles.card}>
              <div style={styles.cardTitle}>Sleep optimization tips</div>
              {[
                { tip: "Wind Down lighting at 11pm", detail: "Warm amber light triggers melatonin. Use the scene in Home tab." },
                { tip: "Blackout curtains", detail: "South-facing window + 4am bedtime = brutal without them. Priority purchase." },
                { tip: "Target bedtime: 12am", detail: "Shifting from 4am to midnight adds 4hrs sleep debt recovery weekly." },
              ].map((t, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#c8c8e0" }}>{t.tip}</div>
                  <div style={{ fontSize: 12, color: "#6b6b8a", marginTop: 3 }}>{t.detail}</div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
