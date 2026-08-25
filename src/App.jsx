import { useState, useEffect, useCallback, useRef } from "react";
import { C, RADIUS, TYPE, MOTION, applyTokens } from "./styles/tokens.js";
import { Icon } from "./ui/Icon.jsx";
import { Bento, Tile, Stat, Track, Ring, Section, Row, Empty } from "./ui/kit.jsx";
import { Frame, Readout, Hub, Legend, CommandLine } from "./ui/holo.jsx";
import { HelmetFrame, BootOverlay, useBootSequence, useParallax } from "./ui/helmet.jsx";
import { CommandPalette, useCommandKey } from "./ui/command.jsx";
import "./App.css";

applyTokens();   // mirror the palette onto :root before anything renders

// ─── RECIPE DATA ───────────────────────────────────────────────────────────────
const RECIPES = [
  { id: 9,  name: "Ground Beef & Baby Bella Bowl",    cal: 310, protein: 42,   carbs: 11,   fat: 10,   meal: [1,2,3], tags: ["beef","bowl"],          time: 25, cuisine: "American"     },
  { id: 10, name: "Cottage Cheese Pizza",             cal: 780, protein: 88,   carbs: 38,   fat: 28,   meal: [4],     tags: ["pizza","cheese"],       time: 35, cuisine: "Italian"      },
  { id: 11, name: "Shrimp Ceviche",                   cal: 180, protein: 38,   carbs: 10,   fat: 1.5,  meal: [1,2,3], tags: ["shrimp","fresh"],        time: 45, cuisine: "Mexican"      },
  { id: 12, name: "Mediterranean Tuna Salad",         cal: 190, protein: 45,   carbs: 13,   fat: 1.5,  meal: [1,2,3], tags: ["tuna","salad"],          time: 10, cuisine: "Mediterranean"},
  { id: 13, name: "Crispy Chicken Cutlets",           cal: 630, protein: 94,   carbs: 12,   fat: 16,   meal: [2,3,4], tags: ["chicken","crispy"],      time: 20, cuisine: "American"     },
  { id: 14, name: "Taco Bell Crunchwrap Dupe",        cal: 568, protein: 84,   carbs: 84,   fat: 16,   meal: [4],     tags: ["beef","tacos"],          time: 20, cuisine: "Mexican"      },
  { id: 15, name: "McDouble Dupe",                    cal: 420, protein: 48,   carbs: 12,   fat: 18,   meal: [3,4],   tags: ["beef","burger"],         time: 15, cuisine: "American"     },
  { id: 16, name: "ShackBurger Dupe",                 cal: 468, protein: 59.6, carbs: 39.7, fat: 16.2, meal: [3,4],   tags: ["beef","burger"],         time: 15, cuisine: "American"     },
  { id: 17, name: "Protein Pancakes v2",              cal: 465, protein: 57,   carbs: 30,   fat: 6,    meal: [1],     tags: ["breakfast","pancakes"],  time: 20, cuisine: "American"     },
  { id: 21, name: "Crispy Chicken Nuggets",           cal: 500, protein: 74,   carbs: 16,   fat: 11,   meal: [2,3,4], tags: ["chicken","crispy"],      time: 20, cuisine: "American"     },
  { id: 22, name: "Sausage Pepper Protein Biscuits",  cal: 280, protein: 28,   carbs: 22,   fat: 8,    meal: [1,2],   tags: ["breakfast","sausage"],   time: 30, cuisine: "American"     },
  { id: 23, name: "Spicy Sesame Beef Udon",           cal: 400, protein: 56,   carbs: 56,   fat: 19,   meal: [4],     tags: ["beef","noodles"],        time: 25, cuisine: "Asian"        },
  { id: 24, name: "Birthday Cake Ninja Creami",       cal: 295, protein: 32,   carbs: 33,   fat: 4,    meal: [4,5],   tags: ["dessert","creami"],      time: 5,  cuisine: "American"     },
  { id: 25, name: "Earl Grey Ninja Creami",           cal: 270, protein: 30,   carbs: 27,   fat: 3.5,  meal: [4,5],   tags: ["dessert","creami"],      time: 5,  cuisine: "American"     },
  { id: 27, name: "Turkish Potato Omelette",          cal: 375, protein: 38,   carbs: 28,   fat: 9,    meal: [1],     tags: ["breakfast","eggs"],      time: 20, cuisine: "Mediterranean"},
  { id: 28, name: "Birria Tacos",                     cal: 530, protein: 54,   carbs: 30,   fat: 18,   meal: [3,4],   tags: ["beef","tacos"],          time: 60, cuisine: "Mexican"      },
  { id: 29, name: "Bold Chex Mix Dupe",               cal: 110, protein: 11,   carbs: 14,   fat: 5,    meal: [2,3],   tags: ["snack"],                 time: 30, cuisine: "American"     },
  { id: 30, name: "Dakgalbi Jeon",                    cal: 210, protein: 26,   carbs: 15,   fat: 5,    meal: [2,3],   tags: ["chicken","korean"],      time: 20, cuisine: "Korean"       },
  { id: 31, name: "Bulgogi Smash Tacos",              cal: 520, protein: 55,   carbs: 25,   fat: 16,   meal: [3,4],   tags: ["beef","tacos","korean"], time: 25, cuisine: "Korean"       },
];

const LIGHTING_SCENES = [
  { id: "wake",      label: "Wake Up",   icon: "☀️",  bri: 254, ct: 153, desc: "Cool bright"  },
  { id: "focus",     label: "Focus",     icon: "🧠",  bri: 220, ct: 200, desc: "Neutral"      },
  { id: "training",  label: "Training",  icon: "⚡",  bri: 254, ct: 153, desc: "High energy"  },
  { id: "wind_down", label: "Wind Down", icon: "🌙",  bri: 80,  ct: 400, desc: "Warm & dim"   },
  { id: "sleep",     label: "Sleep",     icon: "😴",  bri: 10,  ct: 500, desc: "Near off"     },
  { id: "meal_prep", label: "Meal Prep", icon: "🍳",  bri: 240, ct: 230, desc: "Bright & clear"},
];

const TARGET_CAL     = 1685;
const TARGET_PROTEIN = 170;

// ─── COLOR SYSTEM ──────────────────────────────────────────────────────────────
// Palette, spacing, radii and motion all live in the design system.
// Imported rather than defined here so one change reaches every view.
// ─── HELPERS ───────────────────────────────────────────────────────────────────
const isTrainingDay = () => [1,2,3,6].includes(new Date().getDay());
const isRestDay     = () => [0,4].includes(new Date().getDay());
const todayStr      = () => new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
const timeStr       = () => new Date().toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });

const getTodayRitual = () => {
  const d = new Date().getDay();
  if (d === 0) return "🥯 Bagel Pub + Meal Prep Day";
  if (d === 3) return "🍔 Wednesday Smash Burger Night";
  if (d === 6) return "🍟 Saturday McDonald's";
  return null;
};

const wxEmoji = (c) => {
  if (c === 0) return "☀️";
  if (c <= 3)  return "⛅";
  if (c <= 9)  return "🌫️";
  if (c <= 49) return "🌧️";
  if (c <= 79) return "❄️";
  if (c <= 99) return "⛈️";
  return "🌡️";
};
const wxDesc = (c) => {
  if (c === 0)  return "Clear";
  if (c <= 3)   return "Partly Cloudy";
  if (c <= 9)   return "Foggy";
  if (c <= 29)  return "Rain";
  if (c <= 49)  return "Drizzle";
  if (c <= 69)  return "Snow";
  if (c <= 79)  return "Sleet";
  if (c <= 99)  return "Thunderstorm";
  return "Unknown";
};

// ─── PKCE UTILITIES ────────────────────────────────────────────────────────────
function genVerifier() {
  const a = new Uint8Array(32);
  crypto.getRandomValues(a);
  return btoa(String.fromCharCode(...a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}
async function genChallenge(v) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(v));
  return btoa(String.fromCharCode(...new Uint8Array(d))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
}

// ─── LOCAL STORAGE HOOK ────────────────────────────────────────────────────────
// Settings and tokens only. Anything with history lives in SQLite — see the
// useMetrics hooks further down.
//
// This used to auto-push every write to a GitHub Gist via /api/config, which is
// how the API keys ended up publicly readable. That whole path is gone: the Gist
// sync is retired, the endpoint is deleted, and secrets belong in .env now.
function useLocalStorage(key, def) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : def; }
    catch { return def; }
  });
  const set = useCallback(v => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}

// ─── SPOTIFY HOOK ──────────────────────────────────────────────────────────────
function useSpotify() {
  const [clientId, setClientId] = useLocalStorage("jarvis_spotify_cid", "");
  const [token,    setToken]    = useLocalStorage("jarvis_spotify_token", "");
  const [expiry,   setExpiry]   = useLocalStorage("jarvis_spotify_expiry", 0);
  const [now,      setNow]      = useState(null);

  const connected = !!(token && Date.now() < expiry);
  const SCOPES = "user-read-playback-state user-modify-playback-state user-read-currently-playing";

  useEffect(() => {
    if (!connected) return;
    const poll = async () => {
      try {
        const r = await fetch("https://api.spotify.com/v1/me/player", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (r.status === 200) setNow(await r.json());
        else setNow(null);
      } catch { setNow(null); }
    };
    poll();
    const id = setInterval(poll, 5000);
    return () => clearInterval(id);
  }, [connected, token]);

  const login = async () => {
    if (!clientId) return;
    const v = genVerifier();
    const c = await genChallenge(v);
    localStorage.setItem("_sv", v);
    const p = new URLSearchParams({
      client_id: clientId, response_type: "code",
      redirect_uri: window.location.origin,
      code_challenge_method: "S256", code_challenge: c,
      scope: SCOPES, state: "spotify"
    });
    window.location.href = `https://accounts.spotify.com/authorize?${p}`;
  };

  const handleCallback = async (code) => {
    const v = localStorage.getItem("_sv");
    const r = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId, grant_type: "authorization_code",
        code, redirect_uri: window.location.origin, code_verifier: v
      })
    });
    const d = await r.json();
    if (d.access_token) {
      setToken(d.access_token);
      setExpiry(Date.now() + d.expires_in * 1000);
      localStorage.removeItem("_sv");
    }
  };

  // Returns null on success, error string on failure
  const control = async (cmd) => {
    if (!connected) return "Spotify not connected";
    const auth = { Authorization: `Bearer ${token}` };
    const json = { ...auth, "Content-Type": "application/json" };

    // Get best available device ID
    const getDeviceId = async () => {
      try {
        const r = await fetch("https://api.spotify.com/v1/me/player/devices", { headers: auth });
        if (!r.ok) return null;
        const d = await r.json();
        const active = d.devices?.find(x => x.is_active) || d.devices?.[0];
        return active?.id || null;
      } catch { return null; }
    };

    // PUT play endpoint, with device_id if available
    const doPlay = async (body) => {
      const did = await getDeviceId();
      const url = `https://api.spotify.com/v1/me/player/play${did ? `?device_id=${did}` : ""}`;
      const r = await fetch(url, { method: "PUT", headers: json, body: body ? JSON.stringify(body) : undefined });
      if (r.status === 204 || r.status === 200) return null; // success
      const d = await r.json().catch(() => ({}));
      return d?.error?.message || `Spotify error ${r.status}`;
    };

    try {
      if (cmd === "pause") {
        const r = await fetch("https://api.spotify.com/v1/me/player/pause", { method:"PUT", headers: auth });
        if (r.status !== 204 && r.status !== 200) return `Pause failed (${r.status})`;

      } else if (cmd === "play") {
        return await doPlay(null);

      } else if (cmd === "next") {
        const r = await fetch("https://api.spotify.com/v1/me/player/next", { method:"POST", headers: auth });
        if (r.status !== 204 && r.status !== 200) return `Skip failed (${r.status})`;

      } else if (cmd === "prev") {
        const r = await fetch("https://api.spotify.com/v1/me/player/previous", { method:"POST", headers: auth });
        if (r.status !== 204 && r.status !== 200) return `Prev failed (${r.status})`;

      } else if (cmd.startsWith("play:")) {
        // Clean filler words before searching
        const q = cmd.slice(5)
          .replace(/\b\w+\s+spotify\b/gi, "")   // strip "<preposition> spotify"
          .replace(/\bspotify\b/gi, "")           // strip bare "spotify"
          .replace(/\s+(?:for\s+me|please|right\s+now|now)\s*$/i, "")
          .replace(/\s+/g, " ").trim();
        if (!q) return "No search query";

        // Use Spotify field qualifiers for precise matching when "by" is present
        // e.g. "Fancy by Drake" → "track:Fancy artist:Drake"
        let searchQ = q;
        const byMatch = q.match(/^(.+?)\s+by\s+(.+)$/i);
        if (byMatch) searchQ = `track:${byMatch[1].trim()} artist:${byMatch[2].trim()}`;

        const sr = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQ)}&type=track&limit=1`,
          { headers: auth }
        );
        if (!sr.ok) return `Search failed (${sr.status})`;
        const sd = await sr.json();
        const track = sd.tracks?.items?.[0];
        if (!track) return `Couldn't find "${q}" on Spotify`;

        // Play via album context + offset — bypasses URI playback restrictions
        // on certain account types (direct uris: [...] returns 403)
        const err = await doPlay({
          context_uri: track.album.uri,
          offset: { uri: track.uri },
        });
        // Fallback: try direct URI play if context approach fails
        if (err) return await doPlay({ uris: [track.uri] });
        return null;
      }
      return null; // success
    } catch (e) {
      return e.message;
    }
  };

  const [devices, setDevices] = useState([]);

  const fetchDevices = async () => {
    if (!connected) return;
    try {
      const r = await fetch("https://api.spotify.com/v1/me/player/devices", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const d = await r.json();
      setDevices(d.devices || []);
    } catch {}
  };

  const transferPlayback = async (deviceId, play = true) => {
    if (!connected) return;
    try {
      await fetch("https://api.spotify.com/v1/me/player", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ device_ids: [deviceId], play }),
      });
      setTimeout(fetchDevices, 1000);
    } catch {}
  };

  const disconnect = () => { setToken(""); setExpiry(0); setNow(null); setDevices([]); };

  return { clientId, setClientId, connected, expiry, login, handleCallback, control, disconnect, nowPlaying: now, devices, fetchDevices, transferPlayback };
}

// ─── GOOGLE CALENDAR HOOK ──────────────────────────────────────────────────────
function useCalendar() {
  const [clientId, setClientId] = useLocalStorage("jarvis_gcal_cid", "");
  const [token,    setToken]    = useLocalStorage("jarvis_gcal_token", "");
  const [expiry,   setExpiry]   = useLocalStorage("jarvis_gcal_expiry", 0);
  const [events,   setEvents]   = useState([]);

  const connected = !!(token && Date.now() < expiry);
  const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

  useEffect(() => { if (connected) fetchEvents(); }, [connected]);

  const fetchEvents = async () => {
    if (!token) return;
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate()+1).toISOString();
      const r = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${start}&timeMax=${end}&orderBy=startTime&singleEvents=true&maxResults=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const d = await r.json();
      setEvents(d.items || []);
    } catch {}
  };

  // Implicit flow — token comes back in URL hash, no server-side exchange or client_secret needed.
  // Google's "Web application" OAuth client type requires client_secret for code exchange, which
  // we can't safely store client-side. Implicit flow is the correct approach for a pure JS app.
  const login = () => {
    if (!clientId) return;
    const p = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.origin,
      response_type: "token",   // implicit — access_token returned in URL hash
      scope: SCOPES,
      include_granted_scopes: "true",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  };

  // Called by the main component after it reads access_token from the URL hash
  const handleImplicitToken = (accessToken, expiresIn) => {
    setToken(accessToken);
    setExpiry(Date.now() + (parseInt(expiresIn) || 3600) * 1000);
    // Clean up any leftover PKCE state from old failed attempts
    localStorage.removeItem("_gv");
    localStorage.removeItem("_gcid");
  };

  const disconnect = () => { setToken(""); setExpiry(0); setEvents([]); };

  return { clientId, setClientId, connected, expiry, login, handleImplicitToken, disconnect, events, fetchEvents };
}

// ─── WEATHER HOOK ──────────────────────────────────────────────────────────────
function useWeather() {
  const [data, setData] = useState(null);
  const [city, setCity] = useState("");
  const [denied, setDenied] = useState(false);

  const fetch_ = useCallback(() => {
    if (!navigator.geolocation) return;
    setDenied(false);
    navigator.geolocation.getCurrentPosition(async ({ coords: { latitude: lat, longitude: lon } }) => {
      try {
        const [wr, gr] = await Promise.all([
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        ]);
        const wd = await wr.json();
        const gd = await gr.json();
        setData(wd.current);
        setCity(gd.address?.city || gd.address?.town || gd.address?.village || "");
      } catch {}
    }, () => setDenied(true));
  }, []);

  useEffect(() => { fetch_(); }, []);

  return { data, city, denied, retry: fetch_ };
}

// ─── WEBHOOKS HOOK ────────────────────────────────────────────────────────────
function useWebhooks() {
  const [webhooks, setWebhooks] = useLocalStorage("jarvis_webhooks", []);

  const add = (wh) => setWebhooks(prev => [...prev, { ...wh, id: Date.now().toString(), enabled: true }]);
  const update = (id, changes) => setWebhooks(prev => prev.map(w => w.id === id ? { ...w, ...changes } : w));
  const remove = (id) => setWebhooks(prev => prev.filter(w => w.id !== id));

  const trigger = async (id, payload) => {
    const wh = webhooks.find(w => w.id === id);
    if (!wh || !wh.enabled) return null;
    try {
      const res = await fetch(wh.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, _jarvis: true }),
      });
      if (!res.ok) return null;
      try { return await res.json(); } catch { return null; }
    } catch { return null; }
  };

  return { webhooks, add, update, remove, trigger };
}

// ─── CRYPTO HOOK ──────────────────────────────────────────────────────────────
function useCrypto() {
  const [prices, setPrices] = useState(null);
  const [enabled, setEnabled] = useLocalStorage("jarvis_crypto_enabled", false);

  useEffect(() => {
    if (!enabled) return;
    const load = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true");
        setPrices(await res.json());
      } catch {}
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [enabled]);

  return { prices, enabled, setEnabled };
}

// ─── OURA RING HOOK ────────────────────────────────────────────────────────────
// Helpers — sleep duration in seconds → "7h 30m"
const fmtDur = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return `${h}h ${String(m).padStart(2,"0")}m`;
};
const ouraColor = (score) => {
  if (!score) return C.text;
  if (score >= 85) return C.green;
  if (score >= 70) return C.yellow;
  return C.red;
};

function useOura() {
  const [token,   setToken]   = useLocalStorage("jarvis_oura_token", "");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const connected = !!token;

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10);
    const h = { Authorization: `Bearer ${token}` };
    const u = (ep) => `https://api.ouraring.com/v2/usercollection/${ep}?start_date=${start}&end_date=${today}`;
    try {
      const responses = await Promise.all([
        fetch(u("daily_readiness"), { headers: h }),
        fetch(u("daily_sleep"),     { headers: h }),
        fetch(u("sleep"),           { headers: h }), // sessions — has actual durations
        fetch(u("daily_activity"),  { headers: h }),
      ]);
      const bad = responses.find(r => !r.ok);
      if (bad) {
        setError(bad.status === 401 || bad.status === 403
          ? "Invalid token — check your Oura Personal Access Token"
          : `Oura API error ${bad.status}`);
        setLoading(false);
        return;
      }
      const [readiness, dailySleep, sessions, activity] = await Promise.all(responses.map(r => r.json()));
      setData({
        readiness:  readiness.data  || [],
        dailySleep: dailySleep.data || [],
        sessions:   (sessions.data  || []).filter(s => s.type === "long_sleep"), // primary night sleep only
        activity:   activity.data   || [],
      });
    } catch (e) {
      setError("Failed to reach Oura API — check your connection");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { if (token) refresh(); }, [token]); // eslint-disable-line

  const disconnect = () => { setToken(""); setData(null); setError(null); };

  return { token, setToken, connected, data, loading, error, refresh, disconnect };
}

// ─── JARVIS AI HOOK ────────────────────────────────────────────────────────────
// ElevenLabs voice IDs — pre-made voices, free tier API compatible
const ELEVEN_VOICES = [
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (American)"        },
  { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (American)"          },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (American)"         },
  { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (American)"          },
  { id: "TxGEqnHWrfWFTfGW9XjX", name: "Josh (American Male)"     },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam (American Male)"     },
];
const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel — confirmed free tier

function useJarvisAI({ macros, measurements, sleep: sleepData, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, oura, onAction }) {
  const [listening,  setListening]  = useState(false);
  const [thinking,   setThinking]   = useState(false);
  const [speaking,   setSpeaking]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [apiKey,      setApiKey]     = useLocalStorage("jarvis_api_key", "");
  const [groqKey,     setGroqKey]    = useLocalStorage("jarvis_groq_key", "");
  const [elevenKey,   setElevenKey]  = useLocalStorage("jarvis_eleven_key", "");
  const [voiceId,     setVoiceId]    = useLocalStorage("jarvis_voice_id", DEFAULT_VOICE_ID);
  const [chatHistory,   setChatHistory]  = useLocalStorage("jarvis_chat_history", []);
  const [memories,      setMemories]     = useLocalStorage("jarvis_memories", []);
  const [memoryFile,    setMemoryFile]   = useLocalStorage("jarvis_memory_file", "");
  const [memoryUpdated, setMemoryUpdated]= useLocalStorage("jarvis_memory_updated", null);
  const [continuousMode, setContinuousMode] = useLocalStorage("jarvis_continuous_mode", false);
  const updatingMemory    = useRef(false);
  const recogRef          = useRef(null);
  const audioRef          = useRef(null);
  const continuousModeRef = useRef(false);
  const startListeningRef = useRef(null);

  // Keep ref in sync with state so speak() callbacks see the latest value
  useEffect(() => { continuousModeRef.current = continuousMode; }, [continuousMode]);

  const clearHistory  = useCallback(() => setChatHistory([]), []);
  const clearMemories = useCallback(() => { setMemories([]); setMemoryFile(""); setMemoryUpdated(null); }, []);
  const deleteMemory  = useCallback((id) => setMemories(m => m.filter(x => x.id !== id)), []);

  const speak = useCallback(async (text) => {
    // Stop any current playback
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis.cancel();
    setResponse(text);

    if (elevenKey) {
      // ElevenLabs — human-quality voice
      setSpeaking(true);
      // If stored voiceId is no longer in our list (e.g. old library voice), reset to default
      const validVoiceId = ELEVEN_VOICES.find(v => v.id === voiceId) ? voiceId : DEFAULT_VOICE_ID;
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${validVoiceId}`, {
          method: "POST",
          headers: { "xi-api-key": elevenKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            model_id: "eleven_multilingual_v2",
            voice_settings: { stability: 0.42, similarity_boost: 0.88, style: 0.28, use_speaker_boost: true }
          })
        });
        if (!res.ok) throw new Error("ElevenLabs error " + res.status);
        const blob = await res.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        audio.onended = () => {
          setSpeaking(false); audioRef.current = null;
          if (continuousModeRef.current) setTimeout(() => startListeningRef.current?.(), 700);
        };
        audio.onerror = () => {
          setSpeaking(false); audioRef.current = null;
          if (continuousModeRef.current) setTimeout(() => startListeningRef.current?.(), 700);
        };
        audio.play();
      } catch (e) {
        setSpeaking(false);
        // Fall back to browser TTS
        fallbackSpeak(text);
      }
    } else {
      fallbackSpeak(text);
    }
  }, [elevenKey, voiceId]);

  const fallbackSpeak = (text) => {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.92; u.pitch = 1.08; u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name === "Karen") ||
                  voices.find(v => v.lang === "en-AU") ||
                  voices.find(v => v.name === "Samantha") ||
                  voices.find(v => v.lang.startsWith("en")) || null;
    if (voice) u.voice = voice;
    u.onstart = () => setSpeaking(true);
    u.onend   = () => {
      setSpeaking(false);
      if (continuousModeRef.current) setTimeout(() => startListeningRef.current?.(), 700);
    };
    window.speechSynthesis.speak(u);
  };

  const buildContext = useCallback(() => {
    const lw   = measurements.weight.slice(-1)[0]?.val;
    const lwa  = measurements.waist.slice(-1)[0]?.val;
    const avgS = sleepData.length ? (sleepData.slice(-7).reduce((a,b)=>a+b.hours,0) / Math.min(sleepData.length,7)).toFixed(1) : null;
    const np   = spotify.nowPlaying;
    const now  = new Date();
    const ritual = getTodayRitual();

    return `You are JARVIS (Just A Rather Very Intelligent System), Mark's personal AI assistant embedded in his home dashboard. Be precise, occasionally dry-witted, and slightly formal — like the AI from Iron Man. Responses are spoken aloud: 1-3 sentences maximum. No markdown, no bullet points, just clean natural speech.

CURRENT STATE:
Time: ${now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})} — ${now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"})}
Day type: ${isTrainingDay() ? "Training Day (Mon/Tue/Wed/Sat)" : isRestDay() ? "Rest Day (Sun/Thu)" : "Active Day"}${ritual ? `\nToday's ritual: ${ritual}` : ""}

NUTRITION:
Calories: ${Math.round(macros.cal)} / ${TARGET_CAL} (${Math.round(TARGET_CAL - macros.cal)} remaining)
Protein:  ${Math.round(macros.protein)}g / ${TARGET_PROTEIN}g (${Math.round(TARGET_PROTEIN - macros.protein)}g remaining)
Carbs: ${Math.round(macros.carbs)}g | Fat: ${Math.round(macros.fat)}g

BODY: Weight: ${lw ? lw + " lbs" : "not logged"} | Waist: ${lwa ? lwa + " cm (target 81-84cm)" : "not logged"} | Avg sleep (7d): ${avgS ? avgS + " hrs" : "no data"}${(() => { const r = oura?.data?.readiness?.slice(-1)[0]; const sl = oura?.data?.dailySleep?.slice(-1)[0]; const ses = oura?.data?.sessions?.slice(-1)[0]; return r || sl ? `\nOURA: Readiness ${r?.score ?? "—"}/100 | Sleep score ${sl?.score ?? "—"}/100 | Last night ${fmtDur(ses?.total_sleep_duration)} total (REM ${fmtDur(ses?.rem_sleep_duration)}, Deep ${fmtDur(ses?.deep_sleep_duration)})` : ""; })()}

ENVIRONMENT: Hue ${hue.connected ? "connected (" + hue.lights.length + " lights)" : "disconnected"} | Coffee: ${coffeeOn ? "on" : "off"} | Weather: ${weather.data ? Math.round(weather.data.temperature_2m) + "°F " + wxDesc(weather.data.weather_code) + (weather.city ? " in " + weather.city : "") : "unavailable"}${crypto?.prices ? `
CRYPTO: BTC $${crypto.prices.bitcoin?.usd?.toLocaleString()} (${crypto.prices.bitcoin?.usd_24h_change?.toFixed(1)}% 24h) | ETH $${crypto.prices.ethereum?.usd?.toLocaleString()} | SOL $${crypto.prices.solana?.usd?.toFixed(2)}` : ""}

SPOTIFY: ${np?.is_playing ? `Playing "${np.item?.name}" by ${np.item?.artists?.[0]?.name}` : spotify.connected ? "Connected, nothing playing" : "Not connected"}

CALENDAR: ${calendar.events?.length ? calendar.events.map(e => e.summary + (e.start?.dateTime ? " at " + new Date(e.start.dateTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "")).join("; ") : "No events today"}

JARVIS MEMORY FILE — your living knowledge of Mark (maintained and updated over time):
${memoryFile || "Memory file not yet initialised. Begin building it as you learn about Mark."}

ADDITIONAL MEMORY NOTES:
${memories.length ? memories.map(m => `- ${m.fact}`).join('\n') : "None yet."}

When Mark tells you something worth remembering or you observe something significant, append: <remember>one-sentence fact</remember>
When Mark explicitly asks you to remember something important, be sure to confirm you've noted it.

SPOTIFY STATUS: Fully working. Play, pause, skip, and search all function correctly. Never tell Mark play commands aren't working — they are. Always confirm music actions confidently. Ignore any previous conversation where you said otherwise.

ACTIONS — this is critical: whenever you control anything (Spotify, lights, macros, coffee), you MUST append the exact action tag at the end of your response. Never say you're doing something without including the tag — the tag is what actually triggers the action.
<action>{"type":"lighting","scene":"wake|focus|training|wind_down|sleep|meal_prep"}</action>
<action>{"type":"spotify","cmd":"play|pause|next|prev|play:Song Name Artist"}</action>
For play:, extract ONLY the song title and artist. Example: "play Fancy by Drake" → play:Fancy by Drake
<action>{"type":"log_macros","cal":0,"protein":0,"carbs":0,"fat":0}</action>
<action>{"type":"reset_macros"}</action>
<action>{"type":"coffee","on":true}</action>${webhooks?.webhooks?.filter(w=>w.enabled).length ? `
<action>{"type":"webhook","id":"WEBHOOK_ID"}</action>

CUSTOM WEBHOOKS (use webhook action with the exact id when triggered):
${webhooks.webhooks.filter(w=>w.enabled).map(w=>`- id:"${w.id}" name:"${w.name}" triggers on: ${w.triggers} — ${w.description}`).join('\n')}` : ''}`;
  }, [macros, measurements, sleepData, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, oura, memories, memoryFile]);

  const processCommand = useCallback(async (text) => {
    setThinking(true);
    setTranscript(text);

    // ── MUSIC FAST PATH ──────────────────────────────────────────────────────────
    // Fire Spotify commands immediately from the transcript — music starts playing
    // before the AI even responds, cutting perceived delay from ~10s to ~2s.
    let firedSpotifyCmd = null;
    if (spotify?.connected) {
      const l = text.toLowerCase().trim();
      const core = l
        .replace(/^(hey jarvis[,.]?\s*|jarvis[,.]?\s*|can you\s*|please\s*|could you\s*|will you\s*)/, "")
        .trim();
      if (/^(pause|pause the music|stop the music|stop playing)\b/.test(core)) {
        firedSpotifyCmd = "pause";
      } else if (/^(skip|next song|next track|next one|play next)\b/.test(core)) {
        firedSpotifyCmd = "next";
      } else if (/^(go back|previous song|previous track|last song)\b/.test(core)) {
        firedSpotifyCmd = "prev";
      } else if (/^(resume|unpause|continue playing)\b/.test(core) && !/\bplay\s+\w/.test(core)) {
        firedSpotifyCmd = "play";
      } else {
        const stripped = core
          .replace(/\b\w+\s+spotify\b/gi, "")   // strip "<preposition> spotify"
          .replace(/\bspotify\b/gi, "")           // strip bare "spotify"
          .replace(/\s+(?:for me|please|now|right now)\s*$/i, "")
          .replace(/\s+/g, " ").trim();
        const m = stripped.match(/^play\s+(.+)$/);
        if (m?.[1]?.trim()) firedSpotifyCmd = "play:" + m[1].trim();
      }
      if (firedSpotifyCmd) onAction({ type: "spotify", cmd: firedSpotifyCmd });
    }
    // ─────────────────────────────────────────────────────────────────────────────

    const system = buildContext();

    const tryDirect = async () => {
      if (!apiKey) throw new Error("no key");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600, system, messages: [...recentHistory, { role:"user", content:text }] })
      });
      return r.json();
    };

    const tryGroq = async () => {
      if (!groqKey) throw new Error("no groq key");
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          max_tokens: 600,
          messages: [{ role: "system", content: system }, ...recentHistory, { role: "user", content: text }]
        })
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error?.message || "Groq error");
      return { content: [{ text: d.choices?.[0]?.message?.content || "" }] };
    };

    const callProxy = async () => {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined, system, messages: [...recentHistory, { role:"user", content:text }] })
      });
      if (r.status === 404) return tryDirect();
      return r.json();
    };

    // Last 20 messages (10 exchanges) for context window
    const recentHistory = chatHistory.slice(-20);

    const sleepMs = ms => new Promise(res => setTimeout(res, ms));

    let data;
    const maxAttempts = 3;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        data = await callProxy();
      } catch {
        try { data = await tryDirect(); }
        catch {
          if (groqKey) { try { data = await tryGroq(); break; } catch {} }
          speak("I can't reach my processing core. Add your API key in Integrations."); setThinking(false); return;
        }
      }
      const isOverloaded  = data?.error?.type === "overloaded_error" || data?.error?.message?.toLowerCase().includes("overloaded");
      const isAuthError   = data?.error?.type === "authentication_error" || data?.error?.type === "permission_error" || data?.error?.message?.toLowerCase().includes("invalid x-api-key") || data?.error?.message?.toLowerCase().includes("invalid api key");
      if (isOverloaded || isAuthError) {
        // Instant fallback to Groq for either overload or bad key
        if (groqKey) { try { data = await tryGroq(); break; } catch {} }
        if (isAuthError) {
          speak("Authentication failed. Check your Anthropic API key in Integrations, or add a Groq key as a fallback."); setThinking(false); return;
        }
        if (attempt < maxAttempts - 1) { await sleepMs(1000 * (attempt + 1)); continue; }
        speak("Systems are overloaded. Add a Groq key in Integrations for instant fallback."); setThinking(false); return;
      }
      break;
    }

    if (data?.error) {
      // Catch-all for any remaining error — avoid speaking raw API messages aloud
      const msg = data.error.message || "";
      if (msg.toLowerCase().includes("key") || msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("credential")) {
        speak("There's an API authentication issue. Check your key in Integrations.");
      } else {
        speak("I ran into a technical issue. Try again in a moment.");
      }
      setThinking(false); return;
    }

    let txt = data?.content?.[0]?.text || "";

    // Parse action tags — skip Spotify if already fired via fast path
    const actionMatch = txt.match(/<action>([\s\S]*?)<\/action>/);
    if (actionMatch) {
      try {
        const act = JSON.parse(actionMatch[1].trim());
        if (!(act.type === "spotify" && firedSpotifyCmd)) await onAction(act);
      } catch {}
      txt = txt.replace(/<action>[\s\S]*?<\/action>/g, "").trim();
    }

    // Parse remember tags — store as long-term memories
    const rememberMatches = [...txt.matchAll(/<remember>([\s\S]*?)<\/remember>/g)];
    if (rememberMatches.length) {
      const newMems = rememberMatches.map(m => ({
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        fact: m[1].trim(),
        timestamp: new Date().toISOString(),
      }));
      setMemories(prev => [...prev, ...newMems].slice(-100));
      txt = txt.replace(/<remember>[\s\S]*?<\/remember>/g, "").trim();
    }

    // Append to conversation history (keep last 60 messages = 30 exchanges)
    const newHistory = [
      ...chatHistory,
      { role: "user",      content: text },
      { role: "assistant", content: txt  },
    ].slice(-60);
    setChatHistory(newHistory);

    speak(txt);
    setThinking(false);

    // Update memory file every 5 exchanges, non-blocking
    const exchangeCount = Math.floor(newHistory.length / 2);
    if (exchangeCount > 0 && exchangeCount % 5 === 0 && !updatingMemory.current) {
      updatingMemory.current = true;
      const recentConvo = newHistory.slice(-20).map(m =>
        `${m.role === "user" ? "Mark" : "JARVIS"}: ${m.content}`
      ).join('\n');
      const memPrompt = `You are JARVIS maintaining a memory file about Mark. Based on the recent conversation, update his comprehensive profile. Include everything you know: personality, preferences, goals (short and long term), fitness routine, diet, sleep habits, smart home setup, what he's currently working on, recurring patterns, notable things he's said, his communication style, and anything else significant. Write it as a rich, detailed profile in second person ("Mark is...", "He prefers..."). Be comprehensive — this is your permanent knowledge base about him. Under 400 words. Return ONLY the profile text.\n\nCURRENT MEMORY FILE:\n${memoryFile || "Not yet initialised."}\n\nRECENT CONVERSATION:\n${recentConvo}`;
      const doUpdate = async () => {
        try {
          let result;
          if (apiKey) {
            const r = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
              body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 600, system: "You maintain JARVIS's memory file about Mark. Return only the updated profile text.", messages: [{ role: "user", content: memPrompt }] })
            });
            const d = await r.json();
            result = d?.content?.[0]?.text;
          }
          if (!result && groqKey) {
            const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${groqKey}`, "Content-Type": "application/json" },
              body: JSON.stringify({ model: "llama3-8b-8192", max_tokens: 600, messages: [{ role: "system", content: "You maintain JARVIS's memory file. Return only the updated profile text." }, { role: "user", content: memPrompt }] })
            });
            const d = await r.json();
            result = d?.choices?.[0]?.message?.content;
          }
          if (result) { setMemoryFile(result); setMemoryUpdated(new Date().toISOString()); }
        } catch {}
        updatingMemory.current = false;
      };
      doUpdate();
    }
  }, [buildContext, apiKey, groqKey, chatHistory, setChatHistory, memoryFile, setMemoryFile, setMemoryUpdated, setMemories, onAction, speak, spotify]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { speak("Speech recognition requires Chrome or Edge."); return; }
    // Unlock audio context with a silent play so ElevenLabs audio isn't blocked
    // by Chrome's autoplay policy when the async AI response comes back later
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf; src.connect(ctx.destination); src.start(0);
      ctx.resume().catch(() => {});
    } catch {}
    if (recogRef.current) recogRef.current.abort();
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onresult = (e) => { setListening(false); processCommand(e.results[0][0].transcript); };
    r.onend    = () => setListening(false);
    r.onerror  = (ev) => {
      setListening(false);
      // In conversation mode restart after a no-speech timeout
      if (continuousModeRef.current && ev.error === "no-speech") {
        setTimeout(() => startListeningRef.current?.(), 400);
      }
    };
    recogRef.current = r;
    r.start();
  }, [processCommand, speak]);

  // Keep ref current so speak() callbacks can trigger it without stale closure
  startListeningRef.current = startListening;

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, thinking, speaking, transcript, response, startListening, stopListening, speak, processCommand, apiKey, setApiKey, groqKey, setGroqKey, elevenKey, setElevenKey, voiceId, setVoiceId, chatHistory, memories, memoryFile, setMemoryFile, memoryUpdated, clearHistory, clearMemories, deleteMemory, continuousMode, setContinuousMode };
}

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────────
// The card carries the whole system's weight — nearly every view is made of
// these. Depth now comes from the material (see .hud-card), not from corner
// brackets drawn on all four corners of every card. Decoration applied
// uniformly stops meaning anything; the accent survives as a single hairline.
// A plate: a hairline rule, a gold tick, a label, and the space beneath it.
// There is no box. Boxing every group is what made the earlier designs read as
// a web page rather than an instrument — see DECISIONS.md.
function HUDCard({ title, children, accent = C.gold, style = {}, className = "", glow = false }) {
  return (
    <div className={`plate ${className}`} style={{ marginBottom: 30, ...style }}>
      {title && (
        <div className="hud-label" style={{ color: C.dimMid, marginBottom: 16 }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

// A rule that fills. No glow — the value should read, not the container.
function GlowBar({ pct, color = C.gold, height = 1 }) {
  return (
    <div style={{
      height, marginTop: 13, background: C.lineSoft, position: "relative",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        width: `${Math.min(100, Math.max(0, pct || 0))}%`,
        background: color,
        transition: `width 900ms ${MOTION.lock}`,
      }} />
    </div>
  );
}

// A readout states a measurement: mono figure, thin at size, unit set apart,
// label above and quiet. The number leads; everything else recedes.
function Metric({ label, value, unit, sub, color = C.textBright, pct, barColor }) {
  return (
    <div>
      {label && <div className="hud-label" style={{ color: C.dim, marginBottom: 11 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span className="hud-num" style={{ ...TYPE.statSm, color }}>{value}</span>
        {unit && <span style={{ ...TYPE.small, color: C.dim }}>{unit}</span>}
      </div>
      {sub && <div style={{ ...TYPE.small, color: C.dim, marginTop: 6 }}>{sub}</div>}
      {pct !== undefined && <GlowBar pct={pct} color={barColor || C.lineHot} />}
    </div>
  );
}

function ArcReactor({ size = 60, state = "idle" }) {
  const palette = {
    idle:      { col:"#00C8FF", sec:"#0055CC" },
    listening: { col:"#FF1244", sec:"#FF5500" },
    thinking:  { col:"#FFD600", sec:"#FF8800" },
    speaking:  { col:"#00FF88", sec:"#00AA55" },
  };
  const { col, sec } = palette[state] || palette.idle;
  const thinking  = state === "thinking";
  const listening = state === "listening";
  const r = (n) => Math.round(size * n);

  return (
    <div style={{ width:size, height:size, position:"relative", flexShrink:0 }}>
      {/* Ambient background glow */}
      <div className="ambient-pulse" style={{
        position:"absolute", inset:-r(0.5),
        background:`radial-gradient(circle, ${col}14 0%, transparent 70%)`,
        borderRadius:"50%", pointerEvents:"none",
      }} />

      {/* Listening ripples */}
      {listening && [0,1,2].map(i => (
        <div key={i} style={{
          position:"absolute", inset:-r(0.15) - i*r(0.18),
          border:`1px solid ${col}88`, borderRadius:"50%",
          animation:`ripple-out ${1.4 + i*0.45}s ease-out infinite`,
          animationDelay:`${i*0.38}s`, pointerEvents:"none",
        }} />
      ))}

      {/* Ring 1 — outer, slow CW */}
      <div className={thinking ? "spin-cw-fast" : "spin-cw-slow"} style={{
        position:"absolute", inset:0,
        border:`2px solid ${col}`,
        borderRadius:"50%",
        boxShadow:`0 0 ${r(0.18)}px ${col}66, inset 0 0 ${r(0.1)}px ${col}22`,
      }} />

      {/* Ring 2 — dashed, slow CCW */}
      <div className={thinking ? "spin-ccw-med" : "spin-ccw-slow"} style={{
        position:"absolute", inset:r(0.12),
        border:`1px dashed ${col}77`, borderRadius:"50%",
      }} />

      {/* Ring 3 — solid medium */}
      <div className={thinking ? "spin-cw-med" : "spin-cw-slow"} style={{
        position:"absolute", inset:r(0.24),
        border:`1px solid ${col}44`, borderRadius:"50%",
      }} />

      {/* Ring 4 — inner fast CCW */}
      <div className={thinking ? "spin-ccw-fast" : "spin-ccw-med"} style={{
        position:"absolute", inset:r(0.36),
        border:`1px solid ${col}55`, borderRadius:"50%",
        borderTopColor: col, borderRightColor:"transparent",
      }} />

      {/* Core */}
      <div className={state === "speaking" ? "core-breathe-fast" : "core-breathe"} style={{
        position:"absolute", inset:r(0.44),
        background:`radial-gradient(circle at 38% 32%, ${col}, ${sec})`,
        borderRadius:"50%",
        boxShadow:`0 0 ${r(0.22)}px ${col}, 0 0 ${r(0.45)}px ${col}77, 0 0 ${r(0.7)}px ${col}33`,
      }} />
    </div>
  );
}

// Sentence case, not uppercase — uppercase everywhere was costing legibility for
// no hierarchy in return. The primary action gets the cyan→violet gradient; it's
// the only element on a screen allowed to have it, which is what makes it read
// as the primary action.
// The look lives in .hud-btn. Only the primary variant differs, and it differs
// by taking the gold — the one accent, used once per screen.
function HUDBtn({ onClick, children, variant = "default", style = {}, disabled = false }) {
  const accent = { primary: C.gold, success: C.green, danger: C.red }[variant];
  return (
    <button
      className="hud-btn"
      onClick={onClick}
      disabled={disabled}
      style={accent ? { borderColor: accent, color: accent, ...style } : style}
    >
      {children}
    </button>
  );
}

// An underline, not a box. Same reasoning as the plate.
function HUDInput({ label, style = {}, ...props }) {
  return (
    <div style={{ marginBottom: 20, ...style }}>
      {label && <div className="hud-label" style={{ color: C.dim, marginBottom: 9 }}>{label}</div>}
      <input className="hud-input" {...props} style={{
        width: "100%", padding: "9px 0", fontFamily: "inherit",
        fontSize: 16, fontWeight: 350, color: C.textBright,
      }} />
    </div>
  );
}

// A filled diamond reads as engaged and an open one as idle, without needing
// colour to carry the whole message.
function StatusDot({ on, label }) {
  return (
    <span className="hud-label" style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      color: on ? C.text : C.dim,
    }}>
      <span style={{ color: on ? C.gold : C.line }}>{on ? "\u25C6" : "\u25C7"}</span>
      {label}
    </span>
  );
}

// Device type icons
const deviceIcon = (type) => {
  if (!type) return "🔊";
  const t = type.toLowerCase();
  if (t === "computer")      return "💻";
  if (t === "smartphone")    return "📱";
  if (t === "speaker")       return "🔊";
  if (t === "tv")            return "📺";
  if (t === "game_console")  return "🎮";
  if (t === "cast_audio")    return "📡";
  return "🔊";
};

function NowPlaying({ spotify }) {
  const [showDevices, setShowDevices] = useState(false);
  const np = spotify.nowPlaying;
  if (!spotify.connected || !np?.item) return null;
  const paused  = !np.is_playing;
  const track   = np.item;
  const art     = track?.album?.images?.[0]?.url;
  const accent  = paused ? C.dimMid : C.green;

  const handleDeviceClick = () => {
    spotify.fetchDevices();
    setShowDevices(v => !v);
  };

  return (
    <div style={{ marginBottom:14, position:"relative" }}>
      <HUDCard style={{ padding:"12px 16px", marginBottom:0, opacity: paused ? 0.8 : 1, transition:"opacity 0.3s" }} accent={accent}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          {art && <img src={art} alt="" style={{ width:44, height:44, borderRadius:6, border:`1px solid ${accent}33`, filter: paused ? "grayscale(35%)" : "none", transition:"all 0.3s", flexShrink:0 }} />}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{track?.name}</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{track?.artists?.map(a=>a.name).join(", ")}</span>
              {paused && <span style={{ color:C.dimMid, fontSize:10, letterSpacing:"0.1em", flexShrink:0 }}>· PAUSED</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:5, alignItems:"center", flexShrink:0 }}>
            {[["prev","⏮"],["play","▶"],["next","⏭"]].map(([cmd,icon]) => (
              <button key={cmd} onClick={() => spotify.control(cmd==="play" ? (np.is_playing?"pause":"play") : cmd)}
                style={{ background: paused ? "rgba(255,255,255,0.04)" : `${C.green}0F`,
                  border:`1px solid ${paused ? C.dim+"44" : C.green+"33"}`,
                  borderRadius:5, padding:"5px 10px", color: paused ? C.dimMid : C.green,
                  fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
                {cmd==="play" ? (np.is_playing?"⏸":"▶") : icon}
              </button>
            ))}
            {/* Device picker button */}
            <button onClick={handleDeviceClick} title="Select playback device"
              style={{ background: showDevices ? `${C.cyan}15` : "rgba(255,255,255,0.03)",
                border:`1px solid ${showDevices ? C.cyan+"55" : C.borderDim}`,
                borderRadius:5, padding:"5px 9px", cursor:"pointer",
                color: showDevices ? C.cyan : C.dimMid, fontSize:13,
                transition:"all 0.2s", lineHeight:1 }}>
              {/* Speaker/cast SVG icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
              </svg>
            </button>
          </div>
        </div>
      </HUDCard>

      {/* Device picker dropdown */}
      {showDevices && (
        <div className="rise" style={{
          position:"absolute", right:0, top:"calc(100% + 6px)", zIndex:200,
          background:"rgba(0,8,24,0.97)", backdropFilter:"blur(20px)",
          WebkitBackdropFilter:"blur(20px)",
          border:`1px solid ${C.cyan}33`, borderRadius:12,
          padding:"10px 0", minWidth:240,
          boxShadow:`0 16px 48px rgba(0,0,0,0.7), 0 0 24px ${C.cyan}11`,
        }}>
          <div style={{ fontSize:8, letterSpacing:"0.22em", color:C.dim, padding:"0 14px 8px",
            textTransform:"uppercase", fontWeight:700, borderBottom:`1px solid ${C.borderDim}` }}>
            Connect to a Device
          </div>
          {spotify.devices.length === 0
            ? <div style={{ padding:"14px 16px", fontSize:12, color:C.dimMid }}>No devices found. Open Spotify on a device.</div>
            : spotify.devices.map(d => {
                const isActive = d.is_active;
                return (
                  <button key={d.id} onClick={() => { spotify.transferPlayback(d.id, !paused); setShowDevices(false); }}
                    style={{ width:"100%", background: isActive ? `${C.green}0C` : "transparent",
                      border:"none", borderBottom:`1px solid ${C.borderDim}`, padding:"11px 16px",
                      display:"flex", alignItems:"center", gap:10, cursor:"pointer",
                      transition:"background 0.15s", textAlign:"left" }}
                    onMouseEnter={e=>e.currentTarget.style.background=isActive?`${C.green}18`:`${C.cyan}08`}
                    onMouseLeave={e=>e.currentTarget.style.background=isActive?`${C.green}0C`:"transparent"}>
                    <span style={{ fontSize:18, lineHeight:1 }}>{deviceIcon(d.type)}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color: isActive ? C.green : C.text,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</div>
                      <div style={{ fontSize:10, color:C.dimMid, marginTop:1, letterSpacing:"0.06em" }}>
                        {d.type?.replace("_"," ")} {d.volume_percent != null ? `· ${d.volume_percent}%` : ""}
                      </div>
                    </div>
                    {isActive && (
                      <span style={{ fontSize:9, color:C.green, letterSpacing:"0.12em",
                        background:`${C.green}15`, padding:"2px 7px", borderRadius:4, flexShrink:0 }}>
                        ACTIVE
                      </span>
                    )}
                  </button>
                );
              })
          }
        </div>
      )}
    </div>
  );
}

// ─── JARVIS AI TAB ─────────────────────────────────────────────────────────────
function JarvisAITab({ macros, measurements, oura, hue, sleep, coffeeOn, jarvis }) {
  const [apiKey]            = useLocalStorage("jarvis_api_key", "");
  const [messages, setMessages] = useState([
    { role:"assistant", content:"JARVIS online. What do you need?" }
  ]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [listening, setListening] = useState(false);
  const [liveText,  setLiveText]  = useState(""); // interim speech transcript
  const endRef   = useRef(null);
  const recogRef = useRef(null);
  const sendRef  = useRef(null); // always-current send fn (avoids stale closure in mic handler)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const buildSystemPrompt = useCallback(() => {
    const today    = new Date();
    const dayName  = today.toLocaleDateString("en-US", { weekday:"long" });
    const hour     = today.getHours();
    const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
    const tStr     = today.toLocaleTimeString("en-US", { hour:"2-digit", minute:"2-digit" });

    const training = isTrainingDay();
    const rest     = isRestDay();
    const dayType  = training ? "TRAINING DAY" : rest ? "REST DAY" : "ACTIVE DAY";
    const ritual   = getTodayRitual();

    const lw  = measurements?.weight?.slice(-1)[0]?.value;
    const lwa = measurements?.waist?.slice(-1)[0]?.value;

    const oR  = oura?.data?.readiness?.slice(-1)[0];
    const oSl = oura?.data?.dailySleep?.slice(-1)[0];
    const oSe = oura?.data?.sessions?.slice(-1)[0];
    const ouraStr = oura?.connected && oR
      ? `Readiness ${oR.score}/100 | Sleep score ${oSl?.score ?? "—"}/100 | Last night ${fmtDur(oSe?.total_sleep_duration)} (REM ${fmtDur(oSe?.rem_sleep_duration)}, Deep ${fmtDur(oSe?.deep_sleep_duration)})`
      : "not connected";

    const avgS = sleep?.length
      ? (sleep.slice(-7).reduce((a,b)=>a+b.hours,0)/Math.min(sleep.length,7)).toFixed(1)
      : null;

    const remainCal     = Math.max(0, TARGET_CAL - macros.cal);
    const remainProtein = Math.max(0, TARGET_PROTEIN - macros.protein);

    const recipeList = RECIPES.map(r =>
      `  #${r.id} ${r.name} — ${r.cal} cal | ${r.protein}g P | ${r.carbs}g C | ${r.fat}g F | ${r.time}min | ${r.meal.map(m=>["","Breakfast","Lunch","Dinner","Post-workout","Dessert"][m]).join("/")}`
    ).join("\n");

    return `You are JARVIS — Mark's personal AI assistant for fitness, nutrition, and smart home optimization. Direct, concise, no-BS. You know everything about Mark's goals, schedule, and recipe library.

## NOW: ${dayName} ${tStr} (${timeOfDay}) — ${dayType}${ritual ? `\nToday's ritual: ${ritual}` : ""}

## MACROS TODAY
Calories: ${macros.cal} / ${TARGET_CAL} kcal — ${remainCal} remaining
Protein: ${macros.protein}g / ${TARGET_PROTEIN}g — ${remainProtein}g remaining
Carbs: ${macros.carbs}g | Fat: ${macros.fat}g

## BODY
Weight: ${lw ? lw + " lbs" : "not logged"} | Waist: ${lwa ? lwa + " cm (target 81-84cm)" : "not logged"}
7-day avg sleep: ${avgS ? avgS + " hrs" : "no data"}
Oura Ring: ${ouraStr}

## HOME
Hue lights: ${hue?.connected ? "connected" : "not connected"} | Coffee: ${coffeeOn ? "ON" : "OFF"}

## MARK'S PROFILE
Goals: Cut to 81-84cm waist, maintain muscle. Daily targets: ${TARGET_CAL} cal, ${TARGET_PROTEIN}g protein.
Schedule: Training days Mon/Tue/Wed/Sat. Rest Sun/Thu. Active (cardio) Fri.
Rituals: Bagel Sunday, Smash Burger Wednesday, McDonald's Saturday.

## KRANK RECIPE LIBRARY
${recipeList}

## LIGHTING SCENES (voice-activated: "Set lights to [scene]")
Wake Up · Focus · Training · Wind Down (warm amber, triggers melatonin) · Sleep · Meal Prep

## RULES
- Direct and concise. No filler. No "Great question!"
- Recommend recipes by number and name; show remaining macros after eating.
- If Oura readiness < 70, flag recovery risk before recommending hard training.
- Suggest lighting scenes by name when contextually relevant.
- Keep responses under 200 words unless the user asks for detail.`;
  }, [macros, measurements, oura, hue, sleep, coffeeOn]);

  const send = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;
    setInput("");
    setLiveText("");
    const newMessages = [...messages, { role:"user", content:msg }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          system: buildSystemPrompt(),
          messages: newMessages.map(m => ({ role:m.role, content:m.content })),
          apiKey,
          model: "claude-sonnet-4-5",
          maxTokens: 1000,
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text
        || data.error?.message
        || "Something went wrong. Check your API key in Integrations.";
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
      // Speak the reply via ElevenLabs / browser TTS
      jarvis?.speak?.(reply);
    } catch {
      setMessages(prev => [...prev, { role:"assistant", content:"Network error — check your connection." }]);
    }
    setLoading(false);
  }, [messages, loading, apiKey, buildSystemPrompt, jarvis]);

  // Keep sendRef current so the mic handler always calls the latest send closure
  sendRef.current = send;

  const startMic = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Speech recognition not supported — use Chrome or Safari");
      return;
    }
    const recog = new SR();
    recog.continuous     = false;
    recog.interimResults = true;
    recog.lang           = "en-US";

    recog.onstart  = () => { setListening(true); setLiveText(""); };
    recog.onend    = () => { setListening(false); setLiveText(""); };
    recog.onerror  = () => { setListening(false); setLiveText(""); };

    recog.onresult = (e) => {
      let interim = "", final = "";
      for (const r of e.results) {
        if (r.isFinal) final += r[0].transcript;
        else           interim += r[0].transcript;
      }
      setLiveText(interim || final);
      if (final.trim()) {
        setLiveText("");
        recog.stop();
        // Use sendRef so we never capture a stale closure
        setTimeout(() => sendRef.current?.(final.trim()), 50);
      }
    };

    recogRef.current = recog;
    recog.start();
  }, []); // no deps — relies on sendRef

  const stopMic = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
    setLiveText("");
  }, []);

  const QUICK = [
    "How am I doing today?",
    "What should I eat?",
    "Optimize my night",
    "Training check",
  ];

  const Avatar = () => (
    <div style={{
      width:26, height:26, borderRadius:"50%", flexShrink:0, marginRight:8,
      background:`linear-gradient(135deg, ${C.purple}, ${C.blue})`,
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:10, fontFamily:"'Orbitron',monospace", fontWeight:700, color:"#fff",
      boxShadow:`0 0 10px ${C.purple}55`,
    }}>J</div>
  );

  return (
    <>
      <HUDCard title="JARVIS AI" accent={C.purple} glow>
        {!apiKey && (
          <div style={{ padding:"10px 14px", borderRadius:8, marginBottom:14,
            background:"rgba(255,214,0,0.06)", border:`1px solid ${C.yellow}33`,
            fontSize:12, color:C.yellow }}>
            No API key set — add your Anthropic key in the Integrations tab to activate the AI brain.
          </div>
        )}

        {/* Messages */}
        <div style={{
          height:420, overflowY:"auto", display:"flex", flexDirection:"column",
          gap:10, marginBottom:14, paddingRight:4,
          scrollbarWidth:"thin", scrollbarColor:`${C.dim} transparent`,
        }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start", alignItems:"flex-start" }}>
              {m.role === "assistant" && <Avatar />}
              <div style={{
                maxWidth:"78%", padding:"10px 14px", fontSize:13, lineHeight:1.65,
                borderRadius: m.role==="user" ? "16px 16px 4px 16px" : "4px 16px 16px 16px",
                background: m.role==="user"
                  ? `linear-gradient(135deg, rgba(0,200,255,0.12), rgba(0,112,224,0.1))`
                  : "rgba(0,18,42,0.8)",
                border:`1px solid ${m.role==="user" ? C.cyan+"44" : C.border}`,
                color: m.role==="user" ? C.cyanBright : C.text,
                whiteSpace:"pre-wrap", wordBreak:"break-word",
              }}>{m.content}</div>
            </div>
          ))}

          {loading && (
            <div style={{ display:"flex", alignItems:"flex-start" }}>
              <Avatar />
              <div style={{
                padding:"12px 16px", borderRadius:"4px 16px 16px 16px",
                background:"rgba(0,18,42,0.8)", border:`1px solid ${C.border}`,
                display:"flex", gap:5, alignItems:"center",
              }}>
                {[0,1,2].map(d => (
                  <div key={d} style={{
                    width:6, height:6, borderRadius:"50%", background:C.purple,
                    animation:`jarvis-dot 1.2s ease-in-out ${d*0.18}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick actions */}
        <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
          {QUICK.map(q => (
            <button key={q} onClick={() => send(q)} disabled={loading || !apiKey}
              style={{
                padding:"6px 12px", borderRadius:20, fontSize:11, fontWeight:600,
                background:`${C.purple}10`, color: apiKey ? C.purple : C.dim,
                border:`1px solid ${apiKey ? C.purple+"30" : C.dim+"20"}`,
                cursor: loading || !apiKey ? "not-allowed" : "pointer",
                opacity: loading || !apiKey ? 0.5 : 1,
                letterSpacing:"0.04em", transition:"all 0.15s",
              }}>{q}</button>
          ))}
        </div>

        {/* Listening indicator */}
        {listening && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8,
            padding:"7px 12px", borderRadius:8,
            background:"rgba(255,18,68,0.07)", border:`1px solid ${C.red}33` }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:C.red,
              boxShadow:`0 0 8px ${C.red}`, animation:"ambient-pulse 0.8s ease-in-out infinite" }} />
            <span style={{ fontSize:12, color:C.red, fontWeight:600, flex:1 }}>
              {liveText || "Listening…"}
            </span>
            <button onClick={stopMic} style={{ background:"none", border:"none", color:C.red,
              cursor:"pointer", fontSize:11, fontWeight:600, padding:0 }}>Cancel</button>
          </div>
        )}

        {/* Input row */}
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Mic button */}
          <button
            onClick={listening ? stopMic : startMic}
            disabled={loading || !apiKey}
            title={listening ? "Stop listening" : "Speak to JARVIS"}
            style={{
              width:40, height:40, borderRadius:"50%", flexShrink:0,
              background: listening
                ? `rgba(255,18,68,0.18)`
                : `rgba(136,85,255,0.1)`,
              border:`1px solid ${listening ? C.red+"88" : C.purple+"44"}`,
              color: listening ? C.red : C.purple,
              cursor: loading || !apiKey ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:17, opacity: loading || !apiKey ? 0.4 : 1,
              transition:"all 0.2s",
              animation: listening ? "ambient-pulse 0.9s ease-in-out infinite" : "none",
            }}>
            {listening ? "⏹" : "🎙️"}
          </button>

          <div style={{ flex:1 }}>
            <HUDInput
              placeholder={listening ? "Speak now…" : apiKey ? "Ask JARVIS anything…" : "Add API key in Integrations to chat"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              disabled={loading || !apiKey || listening}
              style={{ marginBottom:0 }}
            />
          </div>
          <HUDBtn variant="primary" onClick={() => send(input)}
            disabled={loading || !input.trim() || !apiKey || listening}
            style={{ flexShrink:0, marginBottom:0 }}>Send</HUDBtn>
        </div>
      </HUDCard>
    </>
  );
}

// ─── BRIEFING TAB ──────────────────────────────────────────────────────────────
function BriefingTab({ macros, measurements, sleep: sd, workouts, hue, spotify, calendar, weather, jarvis, coffeeOn, oura, openPalette }) {
  const [cmd, setCmd] = useState("");

  const today     = new Date().toLocaleDateString();
  const lw        = measurements.weight.slice(-1)[0]?.val;
  const lwa       = measurements.waist.slice(-1)[0]?.val;
  const lastNight = sd.slice(-1)[0]?.hours;
  const trained   = workouts.some(w => w.date === today);
  const training  = isTrainingDay();
  const ritual    = getTodayRitual();
  const voiceState = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    jarvis.processCommand(cmd.trim());
    setCmd("");
  };

  // Adherence — the one number the whole system exists to produce.
  const commitments = [
    { label:"intake",   pct: Math.min(100, macros.cal/TARGET_CAL*100),
      read: `${Math.round(macros.cal)}`, of: `/ ${TARGET_CAL} kcal` },
    { label:"protein",  pct: Math.min(100, macros.protein/TARGET_PROTEIN*100),
      read: `${Math.round(macros.protein)}`, of: `/ ${TARGET_PROTEIN} g` },
    { label:"training", pct: trained ? 100 : 0,
      read: trained ? "done" : training ? "due" : "rest", of: training ? "session" : "recovery" },
    { label:"sleep",    pct: lastNight ? Math.min(100, lastNight/8*100) : 0,
      read: lastNight ?? "—", of: "/ 8 hrs" },
  ];
  const score = Math.round(commitments.reduce((a,c)=>a+c.pct,0) / commitments.length);

  const upcoming = (calendar.events ?? [])
    .filter(e => e.start?.dateTime && new Date(e.start.dateTime) > new Date())
    .sort((a,b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
  const next = upcoming[0];
  const mins = next ? Math.round((new Date(next.start.dateTime) - Date.now())/60000) : null;
  const until = mins == null ? null : mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h ${mins%60}m`;

  const lightsOn = (hue.lights ?? []).filter(l => l.on).length;

  // The line under the headline states the day in words. A helmet briefs you;
  // it doesn't hand you a spreadsheet.
  const brief = trained
    ? `Session logged. ${Math.max(0, TARGET_PROTEIN - macros.protein) > 0
        ? `Protein short by ${Math.round(TARGET_PROTEIN - macros.protein)} grams.` : "Targets clear."}`
    : training
      ? `Training due. ${Math.round(Math.max(0, TARGET_CAL - macros.cal))} calories and ${Math.round(Math.max(0, TARGET_PROTEIN - macros.protein))} grams of protein remain.`
      : isRestDay()
        ? "Recovery day. Maintenance calories, protein floor holds."
        : "Active recovery. Light movement, steady nutrition.";

  return (
    <>
      <div className="hud-label" style={{ color:C.dim, marginBottom:26 }}>
        {todayStr()}
      </div>

      {/* ── the headline. One number, one sentence, a great deal of space. ── */}
      <div style={{ marginBottom:14 }}>
        <span className="hud-num" style={{ ...TYPE.hero, color:C.textBright }}>
          {score}<span style={{ color:C.gold }}>%</span>
        </span>
      </div>
      <div className="hud-label" style={{ color:C.gold, marginBottom:20 }}>on plan</div>
      <p style={{ ...TYPE.body, color:C.dimMid, maxWidth:"46ch", margin:"0 0 54px" }}>{brief}</p>

      {/* ── commitments as a single strip of hairline gauges ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginBottom:56 }}>
        {commitments.map(c => (
          <div key={c.label} style={{ paddingRight:26 }}>
            <div className="hud-label" style={{ color:C.dim, marginBottom:11 }}>{c.label}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:7, marginBottom:13 }}>
              <span className="hud-num" style={{ ...TYPE.stat, color:C.textBright }}>{c.read}</span>
              <span style={{ ...TYPE.small, color:C.dim }}>{c.of}</span>
            </div>
            <div style={{ height:1, background:C.lineSoft, position:"relative" }}>
              <div style={{
                position:"absolute", inset:0, width:`${c.pct}%`,
                background: c.pct >= 100 ? C.gold : C.lineHot,
                transition:`width 900ms ${MOTION.lock}`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── command ── */}
      <form onSubmit={handleSubmit} style={{
        display:"flex", alignItems:"center", gap:14, marginBottom:8,
        borderBottom:`1px solid ${voiceState==="idle" ? C.line : C.gold}`,
        paddingBottom:12,
        transition:`border-color 500ms ${MOTION.ease}`,
      }}>
        <span className="hud-num" style={{ color:C.gold, fontSize:14 }}>&gt;</span>
        <input value={cmd} onChange={e=>setCmd(e.target.value)}
          placeholder="speak, type, or press ⌘K"
          style={{ flex:1, background:"none", border:"none", outline:"none",
                   color:C.textBright, fontFamily:"inherit", fontSize:15, fontWeight:350 }} />
        <button type="button"
          onClick={() => jarvis.listening ? jarvis.stopListening() : jarvis.startListening()}
          className="hud-label"
          style={{ background:"none", border:"none", cursor:"pointer",
                   color: voiceState==="idle" ? C.dim : C.gold }}>
          {voiceState === "idle" ? "voice" : voiceState}
        </button>
        <span className="hud-caret" style={{ background:C.gold }} />
      </form>

      {jarvis.transcript && (
        <div className="hud-label rise" style={{ color:C.red, marginBottom:10 }}>▸ {jarvis.transcript}</div>
      )}
      {jarvis.response && (
        <p className="rise" style={{ ...TYPE.body, color:C.text, maxWidth:"58ch", margin:"18px 0 0" }}>
          {jarvis.response}
        </p>
      )}

      <div style={{ marginTop:34 }}><NowPlaying spotify={spotify} /></div>

      {/* ── the rest of the base, as plates ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 46px", marginTop:44 }}>

        <div className="plate">
          <div className="hud-label" style={{ color:C.dimMid, marginBottom:16 }}>next</div>
          {next ? (
            <>
              <div style={{ display:"flex", alignItems:"baseline", gap:9 }}>
                <span className="hud-num" style={{ ...TYPE.statSm, color:C.textBright }}>
                  {new Date(next.start.dateTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
                </span>
                <span style={{ ...TYPE.small, color:C.gold }}>in {until}</span>
              </div>
              <div style={{ ...TYPE.body, color:C.dimMid, marginTop:6 }}>{next.summary}</div>
            </>
          ) : (
            <div style={{ ...TYPE.body, color:C.dim }}>
              {calendar.connected ? "Nothing scheduled." : "Calendar not linked."}
            </div>
          )}
        </div>

        <div className="plate">
          <div className="hud-label" style={{ color:C.dimMid, marginBottom:16 }}>surroundings</div>
          <div style={{ display:"flex", gap:40 }}>
            <div>
              <span className="hud-num" style={{ ...TYPE.statSm, color:C.textBright }}>
                {weather.data ? Math.round(weather.data.temperature_2m) : "—"}
              </span>
              <span style={{ ...TYPE.small, color:C.dim }}>°F</span>
              <div style={{ ...TYPE.small, color:C.dim, marginTop:6 }}>
                {weather.data ? wxDesc(weather.data.weather_code) : weather.denied ? "no location" : "locating"}
              </div>
            </div>
            <div>
              <span className="hud-num" style={{ ...TYPE.statSm, color: lightsOn ? C.gold : C.textBright }}>
                {hue.connected ? lightsOn : "—"}
              </span>
              <div style={{ ...TYPE.small, color:C.dim, marginTop:6 }}>
                {hue.connected ? "lights on" : "bridge offline"}
              </div>
            </div>
          </div>
        </div>

        <div className="plate">
          <div className="hud-label" style={{ color:C.dimMid, marginBottom:16 }}>body</div>
          {lw || lwa ? (
            <div style={{ display:"flex", gap:40 }}>
              <div>
                <span className="hud-num" style={{ ...TYPE.statSm, color:C.textBright }}>{lw ?? "—"}</span>
                <span style={{ ...TYPE.small, color:C.dim }}> lb</span>
                <div style={{ ...TYPE.small, color:C.dim, marginTop:6 }}>target 165–170</div>
              </div>
              <div>
                <span className="hud-num" style={{ ...TYPE.statSm, color: lwa && lwa <= 84 ? C.gold : C.textBright }}>
                  {lwa ?? "—"}
                </span>
                <span style={{ ...TYPE.small, color:C.dim }}> cm</span>
                <div style={{ ...TYPE.small, color:C.dim, marginTop:6 }}>target 81–84</div>
              </div>
            </div>
          ) : (
            // An empty state should hand you the action, not report absence.
            <div>
              <div style={{ ...TYPE.body, color:C.dimMid, marginBottom:12 }}>
                Nothing recorded yet.
              </div>
              <button className="hud-btn" onClick={openPalette}>
                Log weight
              </button>
              <div className="hud-label" style={{ color:C.dim, marginTop:11 }}>
                or press ⌘K and type “w 183”
              </div>
            </div>
          )}
        </div>

        <div className="plate">
          <div className="hud-label" style={{ color:C.dimMid, marginBottom:16 }}>systems</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"9px 20px" }}>
            {[["claude", !!jarvis.apiKey], ["spotify", spotify.connected],
              ["calendar", calendar.connected], ["oura", oura?.connected], ["hue", hue.connected]
            ].map(([name, on]) => (
              <div key={name} className="hud-label" style={{
                display:"flex", alignItems:"center", gap:9, color: on ? C.text : C.dim,
              }}>
                <span style={{ color: on ? C.gold : C.line }}>{on ? "◆" : "◇"}</span>
                {name}
              </div>
            ))}
          </div>
        </div>

        {ritual && (
          <div className="plate" style={{ gridColumn:"span 2" }}>
            <div className="hud-label" style={{ color:C.gold }}>{ritual}</div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── MACROS TAB ────────────────────────────────────────────────────────────────
// ─── ANALYTICS TAB ─────────────────────────────────────────────────────────────
function AnalyticsTab({ macros, macroHistory, measurements, sleep }) {
  const [Charts, setCharts] = useState(null);

  useEffect(() => {
    import("recharts").then(mod => setCharts(mod)).catch(() => {});
  }, []);

  const last14 = macroHistory.slice(-14);
  const last7s  = sleep.slice(-7);
  const wData   = measurements.weight.slice(-30);
  const waData  = measurements.waist.slice(-30);

  const avgCal     = last14.length ? Math.round(last14.reduce((a,b)=>a+b.cal,0)/last14.length) : null;
  const avgProtein = last14.length ? Math.round(last14.reduce((a,b)=>a+b.protein,0)/last14.length) : null;
  const avgSleep   = last7s.length  ? (last7s.reduce((a,b)=>a+b.hours,0)/last7s.length).toFixed(1) : null;
  const hitCal     = last14.filter(d => Math.abs(d.cal - TARGET_CAL) < 200).length;
  const hitProt    = last14.filter(d => d.protein >= TARGET_PROTEIN * 0.9).length;

  const ttStyle = { background:"rgba(0,10,26,0.92)", border:`1px solid ${C.cyan}33`, borderRadius:8, fontSize:11, color:C.text };
  const axTick  = { fill:C.dim, fontSize:9 };

  return (
    <>
      {/* Overview */}
      <HUDCard title="Performance Overview" accent={C.purple}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { label:"AVG CALORIES", val: avgCal ? `${avgCal}` : "—", unit:"kcal", color:C.cyan, sub: avgCal ? `${Math.round(avgCal/TARGET_CAL*100)}% of ${TARGET_CAL}` : "no data" },
            { label:"AVG PROTEIN",  val: avgProtein ? `${avgProtein}` : "—", unit:"g", color:C.green, sub: avgProtein ? `${Math.round(avgProtein/TARGET_PROTEIN*100)}% of ${TARGET_PROTEIN}g` : "no data" },
            { label:"AVG SLEEP",    val: avgSleep || "—", unit: avgSleep ? "hrs" : "", color:C.purple, sub: avgSleep ? (parseFloat(avgSleep) >= 7.5 ? "✓ Above goal" : "Below 7.5h") : "no data" },
          ].map(m => (
            <div key={m.label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:26, fontWeight:700, color:m.color, lineHeight:1 }}>
                {m.val}<span style={{ fontSize:12, color:C.dim, marginLeft:2 }}>{m.unit}</span>
              </div>
              <div style={{ fontSize:9, color:C.dimMid, letterSpacing:"0.12em", margin:"4px 0 2px" }}>{m.label}</div>
              <div style={{ fontSize:10, color:m.color, opacity:0.7 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Target hit badges */}
        {last14.length > 0 && (
          <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
            {[
              { label:`Calorie target: ${hitCal}/${last14.length} days`, color: hitCal >= last14.length*0.7 ? C.cyan : C.orange },
              { label:`Protein target: ${hitProt}/${last14.length} days`, color: hitProt >= last14.length*0.7 ? C.green : C.orange },
            ].map(b => (
              <span key={b.label} style={{ padding:"4px 12px", borderRadius:20, fontSize:11, fontWeight:600,
                background:`${b.color}10`, color:b.color, border:`1px solid ${b.color}30` }}>
                {b.label}
              </span>
            ))}
          </div>
        )}
      </HUDCard>

      {/* Macro history bars */}
      {last14.length > 0 ? (
        <HUDCard title="Macro History — Last 14 Days">
          {Charts ? (
            <>
              <Charts.ResponsiveContainer width="100%" height={180}>
                <Charts.BarChart data={last14.map(d => ({
                  date: new Date(d.date).toLocaleDateString("en-US",{month:"numeric",day:"numeric"}),
                  cal:  Math.round(d.cal),
                  prot: Math.round(d.protein),
                }))} margin={{ top:4, right:0, left:-28, bottom:0 }} barGap={2}>
                  <Charts.XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} />
                  <Charts.YAxis tick={axTick} axisLine={false} tickLine={false} />
                  <Charts.Tooltip contentStyle={ttStyle} />
                  <Charts.ReferenceLine y={TARGET_CAL} stroke={C.cyan} strokeDasharray="3 3" opacity={0.35} />
                  <Charts.Bar dataKey="cal"  name="Calories"   fill={C.cyan}  opacity={0.7} radius={[2,2,0,0]} />
                  <Charts.Bar dataKey="prot" name="Protein (g)" fill={C.green} opacity={0.7} radius={[2,2,0,0]} />
                </Charts.BarChart>
              </Charts.ResponsiveContainer>
              <div style={{ display:"flex", gap:16, marginTop:6, justifyContent:"center" }}>
                {[{c:C.cyan,l:"Calories"},{c:C.green,l:"Protein (g)"}].map(x => (
                  <div key={x.l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.dim }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:x.c }} />{x.l}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"30px 0", color:C.dim, fontSize:13 }}>Loading charts…</div>
          )}
        </HUDCard>
      ) : (
        <HUDCard title="Macro History">
          <div style={{ textAlign:"center", padding:"24px 0", color:C.dim, fontSize:13, lineHeight:1.7 }}>
            No history yet.<br />
            <span style={{ fontSize:11 }}>Macros snapshot daily at midnight — keep logging!</span>
          </div>
        </HUDCard>
      )}

      {/* Weight trend */}
      {wData.length > 1 && Charts && (
        <HUDCard title="Weight Trend">
          <Charts.ResponsiveContainer width="100%" height={150}>
            <Charts.LineChart data={wData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
              <Charts.XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} />
              <Charts.YAxis tick={axTick} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Charts.Tooltip contentStyle={ttStyle} />
              <Charts.Line type="monotone" dataKey="val" name="Weight (lbs)" stroke={C.cyan} strokeWidth={2} dot={{ fill:C.cyan, r:3 }} activeDot={{ r:5 }} />
            </Charts.LineChart>
          </Charts.ResponsiveContainer>
        </HUDCard>
      )}

      {/* Waist trend */}
      {waData.length > 1 && Charts && (
        <HUDCard title="Waist Trend">
          <Charts.ResponsiveContainer width="100%" height={150}>
            <Charts.LineChart data={waData} margin={{ top:4, right:4, left:-28, bottom:0 }}>
              <Charts.XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} />
              <Charts.YAxis tick={axTick} axisLine={false} tickLine={false} domain={["auto","auto"]} />
              <Charts.Tooltip contentStyle={ttStyle} />
              <Charts.ReferenceLine y={84} stroke={C.orange} strokeDasharray="3 3" opacity={0.45} label={{ value:"84cm", fill:C.orange, fontSize:9, position:"right" }} />
              <Charts.ReferenceLine y={81} stroke={C.green}  strokeDasharray="3 3" opacity={0.45} label={{ value:"81cm", fill:C.green,  fontSize:9, position:"right" }} />
              <Charts.Line type="monotone" dataKey="val" name="Waist (cm)" stroke={C.purple} strokeWidth={2} dot={{ fill:C.purple, r:3 }} activeDot={{ r:5 }} />
            </Charts.LineChart>
          </Charts.ResponsiveContainer>
        </HUDCard>
      )}

      {/* Sleep pattern */}
      {last7s.length > 0 && Charts && (
        <HUDCard title="Sleep Pattern — 7 Days" accent={C.purple}>
          <Charts.ResponsiveContainer width="100%" height={150}>
            <Charts.AreaChart data={last7s.map(d => ({ date:d.date, hours:d.hours }))} margin={{ top:4, right:4, left:-28, bottom:0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.purple} stopOpacity={0.38} />
                  <stop offset="95%" stopColor={C.purple} stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <Charts.XAxis dataKey="date" tick={axTick} axisLine={false} tickLine={false} />
              <Charts.YAxis tick={axTick} axisLine={false} tickLine={false} domain={[0,10]} />
              <Charts.Tooltip contentStyle={{ ...ttStyle, border:`1px solid ${C.purple}33` }} />
              <Charts.ReferenceLine y={8} stroke={C.purple} strokeDasharray="3 3" opacity={0.4} />
              <Charts.Area type="monotone" dataKey="hours" name="Sleep (hrs)" stroke={C.purple} fill="url(#sleepGrad)" strokeWidth={2} dot={{ fill:C.purple, r:3 }} />
            </Charts.AreaChart>
          </Charts.ResponsiveContainer>
        </HUDCard>
      )}

      {/* Insights */}
      <HUDCard title="Insights" accent={C.yellow}>
        {last14.length === 0 && wData.length === 0 ? (
          <div style={{ color:C.dim, fontSize:13, textAlign:"center", padding:"20px 0", lineHeight:1.7 }}>
            Start logging macros and measurements to see AI-powered insights here.
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[
              last14.length > 7 && hitCal >= Math.floor(last14.length*0.7) &&
                { icon:"🔥", text:`Calorie consistency is strong — hit target ${hitCal}/${last14.length} days`, color:C.cyan },
              last14.length > 7 && hitCal < Math.floor(last14.length*0.5) &&
                { icon:"⚠️", text:`Calorie tracking inconsistent — only ${hitCal}/${last14.length} days near target`, color:C.orange },
              last14.length > 7 && hitProt >= Math.floor(last14.length*0.7) &&
                { icon:"💪", text:`Protein target crushed — ${hitProt}/${last14.length} days above 90% goal`, color:C.green },
              last14.length > 7 && hitProt < Math.floor(last14.length*0.5) &&
                { icon:"📉", text:`Protein needs work — only ${hitProt}/${last14.length} days above 90% goal`, color:C.orange },
              avgSleep && parseFloat(avgSleep) >= 7.5 &&
                { icon:"😴", text:`Sleep averaging ${avgSleep}h — recovery is well-supported`, color:C.purple },
              avgSleep && parseFloat(avgSleep) < 7 &&
                { icon:"⚡", text:`Sleep debt building — ${avgSleep}h average vs 8h goal`, color:C.red },
              wData.length >= 2 && (() => {
                const diff = (wData[wData.length-1].val - wData[0].val).toFixed(1);
                if (Math.abs(diff) >= 0.5) return {
                  icon: diff < 0 ? "📉" : "📈",
                  text: `Weight ${diff < 0 ? "down" : "up"} ${Math.abs(diff)} lbs over last ${wData.length} measurements`,
                  color: diff < 0 ? C.green : C.orange,
                };
                return null;
              })(),
              waData.length >= 1 && (() => {
                const latest = waData[waData.length-1].val;
                if (latest > 84) return { icon:"🎯", text:`Waist at ${latest}cm — ${(latest-84).toFixed(1)}cm above target upper bound`, color:C.orange };
                if (latest <= 84) return { icon:"✅", text:`Waist at ${latest}cm — within the 81–84cm target range`, color:C.green };
                return null;
              })(),
            ].filter(Boolean).map((ins, i) => (
              <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:8,
                background:`${ins.color}09`, border:`1px solid ${ins.color}20`, fontSize:13, color:ins.color }}>
                <span style={{ flexShrink:0 }}>{ins.icon}</span>
                <span style={{ lineHeight:1.5 }}>{ins.text}</span>
              </div>
            ))}
            {[last14.length > 7 && hitCal >= Math.floor(last14.length*0.7), last14.length > 7 && hitCal < Math.floor(last14.length*0.5), last14.length > 7 && hitProt >= Math.floor(last14.length*0.7), last14.length > 7 && hitProt < Math.floor(last14.length*0.5), avgSleep && parseFloat(avgSleep) >= 7.5, avgSleep && parseFloat(avgSleep) < 7, wData.length >= 2, waData.length >= 1].every(x => !x) && (
              <div style={{ color:C.dim, fontSize:13 }}>Keep logging — insights appear with more data.</div>
            )}
          </div>
        )}
      </HUDCard>
    </>
  );
}

// ─── TRAINING TAB ──────────────────────────────────────────────────────────────
const EXERCISES = [
  "Bench Press","Incline Press","Decline Press","Cable Fly","Dumbbell Fly",
  "Squat","Leg Press","Romanian Deadlift","Leg Curl","Leg Extension",
  "Deadlift","Pull-up","Lat Pulldown","Row","Cable Row",
  "Overhead Press","Lateral Raise","Face Pull","Shrug",
  "Curl","Hammer Curl","Tricep Extension","Tricep Pushdown","Skull Crusher",
  "Hip Thrust","Calf Raise","Plank",
];

function TrainingTab({ workouts, logWorkout, clearDay, error, notify }) {
  const [view,     setView]     = useState("log");
  const [exercise, setExercise] = useState("");
  const [sets,     setSets]     = useState([{ weight:"", reps:"" }]);
  const [listening,setListening]= useState(false);
  const [saving,   setSaving]   = useState(false);
  const recogRef = useRef(null);

  const today        = new Date().toLocaleDateString();
  const todayWorkout = workouts.filter(w => w.date === today);
  const training     = isTrainingDay();

  const addSet    = () => setSets(p => [...p, { weight:"", reps:"" }]);
  const removeSet = (i) => setSets(p => p.filter((_,j) => j !== i));
  const updSet    = (i, f, v) => setSets(p => p.map((s,j) => j===i ? {...s,[f]:v} : s));

  const logSets = async () => {
    if (!exercise.trim()) { notify("Enter an exercise name", "error"); return; }
    const valid = sets.filter(s => s.weight && s.reps);
    if (!valid.length) { notify("Enter at least one complete set", "error"); return; }

    setSaving(true);
    try {
      await logWorkout({
        exercise: exercise.trim(),
        sets: valid.map(s => ({ weight: parseFloat(s.weight), reps: parseInt(s.reps) })),
      });
      setSets([{ weight:"", reps:"" }]);
      notify(`${exercise.trim()} logged ✓`, "success");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const clearToday = async () => {
    try {
      await clearDay(today);
      notify("Today's workout cleared", "success");
    } catch (e) {
      notify(e.message, "error");
    }
  };

  // Voice logging: "Bench Press 225 for 8"
  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { notify("Speech recognition requires Chrome", "error"); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    r.onresult = (e) => {
      setListening(false);
      const text = e.results[0][0].transcript.toLowerCase();
      const nums  = text.match(/\d+(\.\d+)?/g) || [];
      if (nums.length >= 2) {
        const found = EXERCISES.find(ex => text.includes(ex.toLowerCase()));
        if (found) setExercise(found);
        setSets([{ weight: nums[0], reps: nums[1] }]);
        notify(`Heard: ${found||"exercise"} ${nums[0]}lbs × ${nums[1]}`, "success");
      } else {
        notify("Try saying: 'Bench Press 225 for 8'", "error");
      }
    };
    recogRef.current = r;
    r.start();
  };

  const getPR = (name) => {
    const allSets = workouts.filter(w => w.exercise.toLowerCase() === name.toLowerCase()).flatMap(w => w.sets);
    if (!allSets.length) return null;
    return Math.max(...allSets.map(s => s.weight || 0));
  };

  // Group history by date
  const history = {};
  [...workouts].reverse().forEach(w => {
    if (!history[w.date]) history[w.date] = [];
    history[w.date].push(w);
  });
  const histDates = Object.keys(history).slice(0, 14);

  const totalVolume = todayWorkout.reduce((acc, w) =>
    acc + w.sets.reduce((a,s) => a + (s.weight||0)*(s.reps||0), 0), 0);

  return (
    <>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[["log","Log Workout"],["history","History"]].map(([v,l]) => (
          <button key={v} onClick={() => setView(v)} style={{
            flex:1, padding:"10px 0", borderRadius:8, fontSize:12, fontWeight:600,
            letterSpacing:"0.08em", cursor:"pointer", transition:"all 0.2s",
            background: view===v ? `${C.orange}16` : "rgba(255,128,0,0.04)",
            border:`1px solid ${view===v ? C.orange+"55" : C.borderDim}`,
            color: view===v ? C.orange : C.dimMid,
          }}>{l}</button>
        ))}
      </div>

      {view === "log" && (
        <>
          <HUDCard title={`Today — ${training ? "⚡ Training Day" : isRestDay() ? "◐ Rest Day" : "● Active Day"}`} accent={training ? C.orange : C.purple}>
            {/* Exercise + voice */}
            <div style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:14 }}>
              <div style={{ flex:1 }}>
                <HUDInput label="Exercise" placeholder="e.g. Bench Press"
                  value={exercise} onChange={e => setExercise(e.target.value)}
                  style={{ marginBottom:0 }} />
                {exercise.trim().length >= 2 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
                    {EXERCISES.filter(ex =>
                      ex.toLowerCase().includes(exercise.toLowerCase()) &&
                      ex.toLowerCase() !== exercise.toLowerCase()
                    ).slice(0,4).map(ex => (
                      <button key={ex} onClick={() => setExercise(ex)} style={{
                        padding:"3px 10px", borderRadius:20, fontSize:11, cursor:"pointer",
                        background:"rgba(255,128,0,0.08)", border:`1px solid ${C.orange}33`,
                        color:C.orange, fontWeight:600,
                      }}>{ex}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={startVoice} title="Voice log" style={{
                width:44, height:44, borderRadius:10, cursor:"pointer", flexShrink:0,
                background: listening ? `${C.orange}18` : "rgba(255,128,0,0.06)",
                border:`1px solid ${listening ? C.orange+"66" : C.borderDim}`,
                color: listening ? C.orange : C.dim, fontSize:20,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>{listening ? "🎙" : "🎤"}</button>
            </div>

            {/* Sets */}
            <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:C.dimMid, marginBottom:8, fontWeight:600 }}>SETS</div>
            {sets.map((s, i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-end", marginBottom:8 }}>
                <div style={{ width:18, fontSize:12, color:C.dim, textAlign:"center", paddingBottom:10 }}>{i+1}</div>
                <HUDInput type="number" placeholder="lbs" value={s.weight}
                  onChange={e => updSet(i,"weight",e.target.value)}
                  label={i===0 ? "Weight (lbs)" : ""} style={{ marginBottom:0, flex:1 }} />
                <HUDInput type="number" placeholder="reps" value={s.reps}
                  onChange={e => updSet(i,"reps",e.target.value)}
                  label={i===0 ? "Reps" : ""} style={{ marginBottom:0, flex:1 }} />
                {sets.length > 1 && (
                  <button onClick={() => removeSet(i)} style={{
                    background:"none", border:"none", color:C.dim, cursor:"pointer",
                    fontSize:20, padding:"0 4px", flexShrink:0, paddingBottom:8,
                  }}>×</button>
                )}
              </div>
            ))}

            <div style={{ display:"flex", gap:8, marginTop:6 }}>
              <HUDBtn onClick={addSet} style={{ flex:1 }}>+ Set</HUDBtn>
              <HUDBtn variant="primary" onClick={logSets} disabled={saving} style={{ flex:2 }}>
                {saving ? "Saving…" : "Log Exercise"}
              </HUDBtn>
            </div>

            {error && <div style={{ marginTop:10, fontSize:12, color:C.orange }}>{error}</div>}

            {/* PR badge */}
            {exercise.trim() && getPR(exercise.trim()) && (
              <div style={{ marginTop:12, padding:"8px 14px", borderRadius:8, fontSize:12,
                background:`${C.yellow}08`, border:`1px solid ${C.yellow}25`, color:C.yellow }}>
                🏆 PR: {getPR(exercise.trim())} lbs on {exercise.trim()}
              </div>
            )}
          </HUDCard>

          {/* Today's logged exercises */}
          {todayWorkout.length > 0 && (
            <HUDCard title="Logged Today">
              {totalVolume > 0 && (
                <div style={{ marginBottom:12, fontSize:12, color:C.dim }}>
                  Total volume: <span style={{ color:C.orange, fontWeight:600 }}>{totalVolume.toLocaleString()} lbs</span>
                </div>
              )}
              {todayWorkout.map((w, i) => (
                <div key={w.id} style={{ padding:"10px 0", borderBottom: i < todayWorkout.length-1 ? `1px solid ${C.borderDim}` : "none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{w.exercise}</span>
                    <span style={{ fontSize:11, color:C.dim }}>{w.sets.length} set{w.sets.length!==1?"s":""}</span>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {w.sets.map((s,j) => (
                      <span key={j} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                        background:"rgba(255,128,0,0.07)", border:`1px solid ${C.orange}30`, color:C.orange }}>
                        {s.weight}lbs × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop:10 }}>
                <HUDBtn onClick={clearToday}>Clear Today</HUDBtn>
              </div>
            </HUDCard>
          )}
        </>
      )}

      {view === "history" && (
        <HUDCard title="Workout History">
          {histDates.length === 0 ? (
            <div style={{ color:C.dim, fontSize:13, textAlign:"center", padding:"24px 0" }}>
              No workouts logged yet.<br />
              <span style={{ fontSize:11, marginTop:4, display:"block" }}>Switch to Log Workout to get started.</span>
            </div>
          ) : histDates.map(date => (
            <div key={date} style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:"0.14em", fontWeight:700, color: date===today ? C.orange : C.cyan,
                marginBottom:8, paddingBottom:6, borderBottom:`1px solid ${C.border}`,
                display:"flex", alignItems:"center", gap:8 }}>
                {date}
                {date === today && <span style={{ fontSize:9, color:C.green, padding:"1px 6px", borderRadius:3,
                  background:`${C.green}10`, border:`1px solid ${C.green}25` }}>TODAY</span>}
              </div>
              {history[date].map(w => (
                <div key={w.id} style={{ marginBottom:10 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:4 }}>{w.exercise}</div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {w.sets.map((s,j) => (
                      <span key={j} style={{ padding:"2px 8px", borderRadius:20, fontSize:11,
                        background:"rgba(0,212,255,0.05)", border:`1px solid ${C.borderDim}`, color:C.dim }}>
                        {s.weight}lbs × {s.reps}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </HUDCard>
      )}
    </>
  );
}

// ─── MACROS TAB ────────────────────────────────────────────────────────────────
function MacrosTab({ macros, setMacros, notify }) {
  const [inp, setInp] = useState({ cal:"", protein:"", carbs:"", fat:"" });
  const [apiKey]          = useLocalStorage("jarvis_api_key", "");
  const [photoLoading,   setPhotoLoading]   = useState(false);
  const [photoPreview,   setPhotoPreview]   = useState(null);
  const [photoEstimate,  setPhotoEstimate]  = useState(null);
  const photoRef = useRef(null);

  const log = () => {
    const n = v => parseFloat(v) || 0;
    setMacros({ cal:macros.cal+n(inp.cal), protein:macros.protein+n(inp.protein), carbs:macros.carbs+n(inp.carbs), fat:macros.fat+n(inp.fat) });
    setInp({ cal:"", protein:"", carbs:"", fat:"" });
    notify("Meal logged", "success");
  };

  const reset = () => { setMacros({ cal:0, protein:0, carbs:0, fat:0 }); notify("Macros reset for new day", "success"); };

  const handlePhoto = async (file) => {
    if (!file) return;
    if (!apiKey) { notify("No API key — add your Anthropic key in Integrations", "error"); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl  = e.target.result;
      const base64   = dataUrl.split(",")[1];
      const mimeType = file.type || "image/jpeg";
      setPhotoPreview(dataUrl);
      setPhotoEstimate(null);
      setPhotoLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({
            system: "You are a precise nutrition expert. Analyze food images and estimate macros accurately based on portion sizes visible.",
            messages:[{
              role:"user",
              content:[
                { type:"image", source:{ type:"base64", media_type:mimeType, data:base64 } },
                { type:"text",  text:`Estimate the macros for this meal. Return ONLY a valid JSON object (no markdown, no commentary):
{"name":"meal name","cal":number,"protein":number,"carbs":number,"fat":number,"notes":"brief notes on portions/assumptions"}` }
              ]
            }],
            apiKey,
            model:"claude-sonnet-4-5",
            maxTokens:300,
          }),
        });
        const data  = await res.json();
        const raw   = data.content?.[0]?.text || "{}";
        const match = raw.match(/\{[\s\S]*\}/);
        const est   = match ? JSON.parse(match[0]) : null;
        setPhotoEstimate(est);
      } catch {
        notify("Could not analyze photo — try again", "error");
      }
      setPhotoLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const logPhoto = () => {
    if (!photoEstimate) return;
    setMacros({
      cal:     macros.cal     + (photoEstimate.cal     || 0),
      protein: macros.protein + (photoEstimate.protein || 0),
      carbs:   macros.carbs   + (photoEstimate.carbs   || 0),
      fat:     macros.fat     + (photoEstimate.fat     || 0),
    });
    const name = photoEstimate.name || "Meal";
    setPhotoPreview(null);
    setPhotoEstimate(null);
    notify(`📸 ${name} logged!`, "success");
  };

  const calL  = Math.max(0, TARGET_CAL - macros.cal);
  const protL = Math.max(0, TARGET_PROTEIN - macros.protein);

  const rows = [
    { k:"cal",     label:"Calories", val:macros.cal,     target:TARGET_CAL,     unit:"",  color:C.cyan   },
    { k:"protein", label:"Protein",  val:macros.protein, target:TARGET_PROTEIN, unit:"g", color:C.green  },
    { k:"carbs",   label:"Carbs",    val:macros.carbs,   target:150,            unit:"g", color:C.yellow },
    { k:"fat",     label:"Fat",      val:macros.fat,     target:55,             unit:"g", color:C.blue   },
  ];

  return (
    <>
      <HUDCard title="Today's Macros">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {rows.map(m => (
            <Metric key={m.k} label={m.label} value={`${Math.round(m.val)}${m.unit}`} unit={`/ ${m.target}${m.unit}`}
              sub={`${Math.round(Math.max(0, m.target-m.val))}${m.unit} left`}
              color={m.val >= m.target ? C.orange : m.color}
              pct={m.val/m.target*100} barColor={m.color} />
          ))}
        </div>
      </HUDCard>

      <HUDCard title="Log a Meal">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          {rows.map(m => (
            <HUDInput key={m.k} label={m.label} type="number" placeholder="0"
              value={inp[m.k]} onChange={e=>setInp({...inp, [m.k]:e.target.value})}
              onKeyDown={e=>e.key==="Enter"&&log()} style={{ marginBottom:0 }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <HUDBtn variant="primary" onClick={log}>Log Meal</HUDBtn>
          <HUDBtn onClick={reset}>Reset Day</HUDBtn>
        </div>
      </HUDCard>

      <HUDCard title="Smart Suggestions">
        {RECIPES.filter(r => r.cal <= calL + 60 && r.protein >= 25).slice(0, 4).length === 0
          ? <div style={{ fontSize:13, color:C.dim }}>You've hit your targets for today. Excellent work, sir.</div>
          : RECIPES.filter(r => r.cal <= calL + 60 && r.protein >= 25).slice(0, 4).map(r => (
              <div key={r.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"10px 0", borderBottom:`1px solid ${C.borderDim}` }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:C.text }}>#{r.id} {r.name}</div>
                  <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{r.protein}g P · {r.carbs}g C · {r.fat}g F · {r.time}min</div>
                </div>
                <div style={{ textAlign:"right", marginLeft:12 }}>
                  <div style={{ fontSize:16, fontWeight:700, color:C.cyan }}>{r.cal}</div>
                  <div style={{ fontSize:10, color:C.dim }}>cal</div>
                </div>
              </div>
            ))
        }
      </HUDCard>

      {/* Photo food logging */}
      <input ref={photoRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handlePhoto(f); e.target.value=""; }} />

      <HUDCard title="Log by Photo" accent={C.purple}>
        {!photoPreview ? (
          <div style={{ display:"flex", gap:8 }}>
            <HUDBtn onClick={() => photoRef.current?.click()} style={{ flex:1 }}>
              📸 Take Photo
            </HUDBtn>
            <HUDBtn onClick={() => { const inp = document.createElement("input"); inp.type="file"; inp.accept="image/*"; inp.onchange = e => { const f = e.target.files?.[0]; if(f) handlePhoto(f); }; inp.click(); }} style={{ flex:1 }}>
              🖼 Choose Image
            </HUDBtn>
          </div>
        ) : (
          <div>
            {/* Preview */}
            <div style={{ position:"relative", marginBottom:14, borderRadius:10, overflow:"hidden", maxHeight:200 }}>
              <img src={photoPreview} alt="food" style={{ width:"100%", objectFit:"cover", maxHeight:200, display:"block" }} />
              {photoLoading && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,3,10,0.75)", backdropFilter:"blur(4px)",
                  display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:8, height:8, borderRadius:"50%", background:C.purple,
                        animation:`jarvis-dot 1.4s ease-in-out ${i*0.16}s infinite` }} />
                    ))}
                  </div>
                  <div style={{ fontSize:12, color:C.purple }}>Analyzing with Claude Vision…</div>
                </div>
              )}
            </div>

            {/* Estimate */}
            {photoEstimate && !photoLoading && (
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:C.textBright, marginBottom:10 }}>
                  {photoEstimate.name}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:10 }}>
                  {[
                    { k:"cal",     l:"Cal",     c:C.cyan   },
                    { k:"protein", l:"Protein", c:C.green  },
                    { k:"carbs",   l:"Carbs",   c:C.yellow },
                    { k:"fat",     l:"Fat",     c:C.orange },
                  ].map(m => (
                    <div key={m.k} style={{ textAlign:"center" }}>
                      <div style={{ fontSize:18, fontWeight:700, color:m.c }}>{photoEstimate[m.k] || 0}</div>
                      <div style={{ fontSize:10, color:C.dim }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                {photoEstimate.notes && (
                  <div style={{ fontSize:11, color:C.dimMid, marginBottom:12, lineHeight:1.5,
                    padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:6 }}>
                    {photoEstimate.notes}
                  </div>
                )}
                <div style={{ display:"flex", gap:8 }}>
                  <HUDBtn variant="success" onClick={logPhoto} style={{ flex:2 }}>Log This Meal</HUDBtn>
                  <HUDBtn onClick={() => { setPhotoPreview(null); setPhotoEstimate(null); }} style={{ flex:1 }}>Retake</HUDBtn>
                </div>
              </div>
            )}

            {!photoEstimate && !photoLoading && (
              <HUDBtn onClick={() => { setPhotoPreview(null); }} style={{ width:"100%" }}>Cancel</HUDBtn>
            )}
          </div>
        )}
        {!photoPreview && (
          <div style={{ marginTop:10, fontSize:11, color:C.dim, lineHeight:1.5 }}>
            Snap a photo of your meal — Claude Vision will estimate the macros and log them instantly.
          </div>
        )}
      </HUDCard>
    </>
  );
}

// ─── ENVIRONMENT TAB ───────────────────────────────────────────────────────────
function EnvironmentTab({ hue, setHue, coffeeOn, setCoffeeOn, sceneLoading, applyScene, notify }) {
  const [hueInp, setHueInp] = useState({ ip:hue.bridgeIp||"", username:hue.username||"" });

  const connectHue = async () => {
    const ip = hueInp.ip.trim(), user = hueInp.username.trim();
    if (!ip || !user) { notify("Enter bridge IP and API key", "error"); return; }
    try {
      // Through the server — the browser can't reach a LAN bridge over plain HTTP.
      const res  = await fetch("/api/hue/lights", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ ip, username:user }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not reach the bridge");

      setHue({ connected:true, bridgeIp:ip, username:user, lights:data.lights });
      notify(`Hue Bridge connected — ${data.lights.length} lights`, "success");
    } catch (e) {
      notify(e.message, "error");   // say what actually went wrong, not just "failed"
    }
  };

  return (
    <>
      {/* Lighting Scenes */}
      <HUDCard title="Lighting Scenes">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          {LIGHTING_SCENES.map(s => (
            <button key={s.id} onClick={() => applyScene(s)} disabled={!!sceneLoading}
              style={{
                background: sceneLoading===s.id ? `rgba(0,212,255,0.12)` : "rgba(0,212,255,0.03)",
                border:`1px solid ${sceneLoading===s.id ? C.cyan+"66" : C.borderDim}`,
                borderRadius:4, padding:"14px 8px", cursor:"pointer", textAlign:"center",
                transition:"all 0.2s", opacity:sceneLoading&&sceneLoading!==s.id?0.5:1
              }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontSize:12, fontWeight:600, color:C.text, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:10, color:C.dim }}>{s.desc}</div>
            </button>
          ))}
        </div>
      </HUDCard>

      {/* Coffee Maker */}
      <HUDCard title="Coffee Maker">
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>TP-Link Tapo Smart Plug</div>
            <div style={{ fontSize:12, color:C.dim, marginTop:2 }}>
              <StatusDot on={coffeeOn} label={coffeeOn ? "ON — brewing" : "OFF"} />
            </div>
          </div>
          <HUDBtn variant={coffeeOn?"success":"default"} onClick={() => { setCoffeeOn(!coffeeOn); notify(coffeeOn?"Coffee maker off":"☕ Coffee maker on","success"); }} style={{ minWidth:90 }}>
            {coffeeOn ? "☕ On" : "Off"}
          </HUDBtn>
        </div>
        <div style={{ marginTop:12, fontSize:12, color:C.dim, borderTop:`1px solid ${C.borderDim}`, paddingTop:10 }}>
          Integrate via Apple Shortcuts + HomeKit for full voice automation.
        </div>
      </HUDCard>

      {/* Hue Bridge */}
      <HUDCard title="Philips Hue Bridge" accent={hue.connected ? C.green : C.cyan}>
        {hue.connected ? (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
              <div>
                <StatusDot on={true} label={`Connected — ${hue.lights.length} lights`} />
                <div style={{ fontSize:11, color:C.dim, marginTop:4 }}>{hue.bridgeIp}</div>
              </div>
              <HUDBtn variant="danger" onClick={() => { setHue({ connected:false, bridgeIp:"", username:"", lights:[] }); notify("Disconnected","success"); }}>
                Disconnect
              </HUDBtn>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {hue.lights.map(l => (
                <div key={l.id} style={{ padding:"4px 10px", borderRadius:4, fontSize:11,
                  background:"rgba(0,255,153,0.07)", border:`1px solid ${C.green}33`, color:C.green }}>
                  {l.name}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize:12, color:C.dim, marginBottom:10, lineHeight:1.5 }}>
              Find your bridge IP at <span style={{ color:C.cyan }}>discovery.meethue.com</span> and generate a username via the Hue app developer tools.
            </div>
            <div style={{ fontSize:11, color:C.orange, marginBottom:14, padding:"8px 12px",
              background:"rgba(255,128,0,0.07)", border:`1px solid ${C.orange}33`, borderRadius:6, lineHeight:1.5 }}>
              ⚠ <strong>Local network only.</strong> Hue works when accessing Jarvis from your home network (or running it locally with <code>npm run dev</code>). Browser security blocks local device requests from the public Vercel URL.
            </div>
            <HUDInput label="Bridge IP" placeholder="192.168.x.x" value={hueInp.ip}
              onChange={e=>setHueInp({...hueInp, ip:e.target.value})} />
            <HUDInput label="API Key / Username" placeholder="your-hue-api-key" value={hueInp.username}
              onChange={e=>setHueInp({...hueInp, username:e.target.value})} />
            <HUDBtn variant="primary" onClick={connectHue}>Connect Bridge</HUDBtn>
          </div>
        )}
      </HUDCard>

      {/* Automation Schedule */}
      <HUDCard title="Automation Schedule">
        {[
          { time:"Morning",    action:"Wake Up lighting scene activates",               icon:"☀️" },
          { time:"4:30 PM",    action:"Pre-workout reminder + Training scene (train days)", icon:"⚡" },
          { time:"11:00 PM",   action:"Wind Down scene activates",                      icon:"🌙" },
          { time:"Sunday",     action:"Meal Prep mode + Bagel Pub reminder",            icon:"🥯" },
          { time:"Wednesday",  action:"Smash Burger Night reminder",                    icon:"🍔" },
        ].map((a, i) => (
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"8px 0",
            borderBottom: i < 4 ? `1px solid ${C.borderDim}` : "none" }}>
            <div style={{ fontSize:18, minWidth:24 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{a.action}</div>
              <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{a.time}</div>
            </div>
          </div>
        ))}
        <div style={{ marginTop:10, fontSize:11, color:C.dim, padding:"8px 12px",
          background:"rgba(0,212,255,0.04)", borderRadius:4, lineHeight:1.5 }}>
          Set these up in Apple Shortcuts for background automation. JARVIS scenes run on demand and Shortcuts execute them automatically.
        </div>
      </HUDCard>
    </>
  );
}

// ─── RECIPE DETAIL MODAL ──────────────────────────────────────────────────────
function RecipeDetailModal({ recipe, onClose, onSave, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [edit, setEdit] = useState({
    ingredients:  recipe.ingredients?.join("\n")  || "",
    instructions: recipe.instructions?.join("\n") || "",
    imageUrl:     recipe.imageUrl || "",
  });

  const hasDetails = recipe.ingredients?.length > 0 || recipe.instructions?.length > 0;
  const heroSrc    = recipe.imageData || recipe.imageUrl || "";
  const mealMap    = { 1:"Breakfast", 2:"Lunch", 3:"Dinner", 4:"Post-workout", 5:"Dessert" };

  const save = () => {
    onSave({
      ...recipe,
      ingredients:  edit.ingredients.split("\n").map(s=>s.trim()).filter(Boolean),
      instructions: edit.instructions.split("\n").map(s=>s.trim()).filter(Boolean),
      imageUrl:     edit.imageUrl.trim(),
    });
    setEditMode(false);
  };

  const ta = { width:"100%", background:"rgba(0,200,255,0.04)", border:`1px solid ${C.border}`,
    borderRadius:8, padding:"10px 14px", color:C.text, fontSize:13, outline:"none",
    fontFamily:"inherit", boxSizing:"border-box", resize:"vertical", lineHeight:1.6 };

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(0,3,10,0.93)",
        backdropFilter:"blur(14px) saturate(160%)", overflowY:"auto",
        padding:"16px", display:"flex", justifyContent:"center" }}>
      <div style={{ width:"100%", maxWidth:680, height:"fit-content",
        background:"rgba(0,8,22,0.99)", border:`1px solid ${C.cyan}18`,
        borderRadius:16, overflow:"hidden", marginTop:16, marginBottom:40,
        boxShadow:`0 32px 80px rgba(0,0,0,0.9), 0 0 60px ${C.purple}0A`,
        animation:"fadeInUp 0.22s ease" }}>

        {/* Hero */}
        {heroSrc ? (
          <div style={{ position:"relative", height:200, overflow:"hidden" }}>
            <img src={heroSrc} alt={recipe.name}
              style={{ width:"100%", height:"100%", objectFit:"cover", opacity:0.75 }} />
            <div style={{ position:"absolute", inset:0,
              background:"linear-gradient(to bottom, rgba(0,3,10,0.25) 0%, rgba(0,8,22,0.96) 100%)" }} />
            <button onClick={onClose} style={{ position:"absolute", top:12, right:12,
              width:32, height:32, background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)",
              border:`1px solid ${C.border}`, borderRadius:"50%", color:C.text,
              cursor:"pointer", fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        ) : (
          <div style={{ display:"flex", justifyContent:"flex-end", padding:"14px 20px 0" }}>
            <button onClick={onClose} style={{ background:"none", border:"none",
              color:C.dim, cursor:"pointer", fontSize:22, lineHeight:1, padding:4 }}>×</button>
          </div>
        )}

        <div style={{ padding: heroSrc ? "0 20px 28px" : "4px 20px 28px" }}>
          {/* Title row */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
            gap:12, marginBottom:16, marginTop: heroSrc ? -4 : 12 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:22, fontWeight:700, color:C.textBright, lineHeight:1.2, marginBottom:8 }}>
                {recipe.name}
              </div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                {recipe.cuisine && (
                  <span style={{ padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:600,
                    background:`${C.purple}12`, color:C.purple, border:`1px solid ${C.purple}30` }}>
                    {recipe.cuisine}</span>
                )}
                {recipe.meal?.map(m => (
                  <span key={m} style={{ padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:600,
                    background:"rgba(0,200,255,0.07)", color:C.cyan, border:`1px solid ${C.border}` }}>
                    {mealMap[m]||`Meal ${m}`}</span>
                ))}
                {recipe.tags?.map(t => (
                  <span key={t} style={{ padding:"2px 8px", borderRadius:3, fontSize:10,
                    color:C.dim, border:`1px solid ${C.borderDim}` }}>{t}</span>
                ))}
                {recipe.source !== "builtin" && (
                  <span style={{ padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:700,
                    background:`${C.green}10`, color:C.green, border:`1px solid ${C.green}25` }}>Imported</span>
                )}
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:30, fontWeight:700, color:C.cyan, lineHeight:1 }}>{recipe.cal}</div>
              <div style={{ fontSize:11, color:C.dim }}>cal · {recipe.time}min</div>
            </div>
          </div>

          {/* Macro bars */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22,
            padding:"14px 0", borderTop:`1px solid ${C.borderDim}`, borderBottom:`1px solid ${C.borderDim}` }}>
            {[
              { label:"Protein", value:recipe.protein, color:C.green,  max:60  },
              { label:"Carbs",   value:recipe.carbs,   color:C.cyan,   max:120 },
              { label:"Fat",     value:recipe.fat,     color:C.orange, max:50  },
            ].map(m => (
              <div key={m.label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:22, fontWeight:700, color:m.color }}>
                  {m.value}<span style={{ fontSize:12, color:C.dim }}>g</span>
                </div>
                <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", marginBottom:5 }}>
                  {m.label.toUpperCase()}
                </div>
                <div style={{ height:3, borderRadius:3, background:C.borderDim }}>
                  <div style={{ width:`${Math.min(100,(m.value/m.max)*100)}%`, height:"100%",
                    background:m.color, borderRadius:3, boxShadow:`0 0 6px ${m.color}66` }} />
                </div>
              </div>
            ))}
          </div>

          {!editMode ? (
            <>
              {recipe.ingredients?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, color:C.dimMid, letterSpacing:"0.14em", fontWeight:700, marginBottom:10 }}>
                    INGREDIENTS
                  </div>
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} style={{ display:"flex", gap:8, fontSize:13, color:C.text,
                      lineHeight:1.5, marginBottom:5 }}>
                      <span style={{ color:C.cyan, fontWeight:700, flexShrink:0 }}>·</span>{ing}
                    </div>
                  ))}
                </div>
              )}

              {recipe.instructions?.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, color:C.dimMid, letterSpacing:"0.14em", fontWeight:700, marginBottom:10 }}>
                    INSTRUCTIONS
                  </div>
                  {recipe.instructions.map((step, i) => (
                    <div key={i} style={{ display:"flex", gap:10, fontSize:13, color:C.text,
                      lineHeight:1.55, marginBottom:10 }}>
                      <div style={{ minWidth:24, height:24, borderRadius:"50%", flexShrink:0,
                        background:`${C.purple}18`, border:`1px solid ${C.purple}35`,
                        color:C.purple, fontSize:11, fontWeight:700,
                        display:"flex", alignItems:"center", justifyContent:"center", marginTop:1 }}>{i+1}</div>
                      {step}
                    </div>
                  ))}
                </div>
              )}

              {!hasDetails && (
                <div style={{ padding:"20px", borderRadius:8, textAlign:"center",
                  background:"rgba(255,255,255,0.015)", border:`1px dashed ${C.borderDim}`, marginBottom:18 }}>
                  <div style={{ fontSize:28, marginBottom:8 }}>📝</div>
                  <div style={{ fontSize:13, color:C.dim }}>
                    No details yet — tap below to add ingredients and instructions
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:8 }}>
                <HUDBtn onClick={() => setEditMode(true)} style={{ flex:1 }}>
                  {hasDetails ? "✏ Edit Recipe" : "+ Add Details"}
                </HUDBtn>
                {recipe.source !== "builtin" && (
                  <HUDBtn variant="danger" onClick={() => { onDelete(); onClose(); }}
                    style={{ padding:"9px 14px" }}>Delete</HUDBtn>
                )}
              </div>
            </>
          ) : (
            <div>
              <HUDInput label="Photo URL (optional)"
                placeholder="https://example.com/photo.jpg"
                value={edit.imageUrl}
                onChange={e => setEdit({...edit, imageUrl:e.target.value})} />
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
                  color:C.dimMid, marginBottom:6, fontWeight:600 }}>INGREDIENTS — one per line</div>
                <textarea value={edit.ingredients} rows={7}
                  onChange={e => setEdit({...edit, ingredients:e.target.value})}
                  placeholder={"200g chicken breast\n1 tbsp olive oil\n2 cloves garlic\n..."} style={ta} />
              </div>
              <div style={{ marginBottom:18 }}>
                <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase",
                  color:C.dimMid, marginBottom:6, fontWeight:600 }}>INSTRUCTIONS — one step per line</div>
                <textarea value={edit.instructions} rows={7}
                  onChange={e => setEdit({...edit, instructions:e.target.value})}
                  placeholder={"Preheat oven to 400°F.\nSeason chicken with salt and pepper.\n..."} style={ta} />
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <HUDBtn variant="success" onClick={save} style={{ flex:1 }}>Save Recipe</HUDBtn>
                <HUDBtn onClick={() => {
                  setEdit({ ingredients:recipe.ingredients?.join("\n")||"",
                    instructions:recipe.instructions?.join("\n")||"", imageUrl:recipe.imageUrl||"" });
                  setEditMode(false);
                }}>Cancel</HUDBtn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── RECIPE CARD ──────────────────────────────────────────────────────────────
function RecipeCard({ recipe, onSelect }) {
  const [hov, setHov] = useState(false);
  const hasImg = recipe.imageData || recipe.imageUrl;
  const mealShort = { 1:"B", 2:"L", 3:"D", 4:"PW", 5:"DS" };

  return (
    <div onClick={() => onSelect(recipe)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ border:`1px solid ${hov ? C.cyan+"44" : C.borderDim}`,
        borderRadius:10, marginBottom:8, cursor:"pointer", overflow:"hidden",
        background: hov ? "rgba(0,200,255,0.025)" : "rgba(0,212,255,0.015)",
        transition:"all 0.18s",
        boxShadow: hov ? `0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px ${C.cyan}11` : "none" }}>

      {hasImg && (
        <div style={{ height:90, overflow:"hidden", position:"relative" }}>
          <img src={recipe.imageData || recipe.imageUrl} alt={recipe.name}
            style={{ width:"100%", height:"100%", objectFit:"cover",
              opacity: hov ? 0.8 : 0.65, transition:"opacity 0.2s" }} />
          <div style={{ position:"absolute", inset:0,
            background:"linear-gradient(to bottom, transparent 20%, rgba(0,8,22,0.92))" }} />
        </div>
      )}

      <div style={{ padding: hasImg ? "8px 14px 12px" : "13px 16px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, flexWrap:"wrap" }}>
              {recipe.source !== "builtin" && (
                <span style={{ fontSize:9, padding:"1px 6px", borderRadius:3, fontWeight:700,
                  background:`${C.green}12`, color:C.green, border:`1px solid ${C.green}25`,
                  letterSpacing:"0.05em", flexShrink:0 }}>IMPORTED</span>
              )}
              <span style={{ fontSize:10, color:C.dim }}>#{recipe.id}</span>
              <span style={{ fontSize:14, fontWeight:600, color:C.textBright,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                maxWidth:"calc(100% - 40px)" }}>{recipe.name}</span>
            </div>
            <div style={{ fontSize:11, color:C.dim }}>
              <span style={{ color:C.green, fontWeight:600 }}>{recipe.protein}g P</span>
              {" · "}{recipe.carbs}g C{" · "}{recipe.fat}g F{" · "}{recipe.time}min
              {recipe.meal?.length > 0 &&
                <span style={{ color:C.dimMid }}>{" · "}{recipe.meal.map(m=>mealShort[m]||m).join("/")}</span>}
            </div>
            {recipe.ingredients?.length > 0 && (
              <div style={{ fontSize:11, color:C.dimMid, marginTop:4,
                whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {recipe.ingredients.slice(0,2).join(" · ")}
                {recipe.ingredients.length > 2 && ` +${recipe.ingredients.length-2} more`}
              </div>
            )}
          </div>
          <div style={{ textAlign:"right", marginLeft:12, flexShrink:0 }}>
            <div style={{ fontSize:20, fontWeight:700, color:C.cyan }}>{recipe.cal}</div>
            <div style={{ fontSize:9, color:C.dim }}>cal</div>
            <div style={{ marginTop:5, fontSize:11,
              color: hov ? C.cyan : C.dim, transition:"color 0.18s" }}>View →</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPES TAB ───────────────────────────────────────────────────────────────
function RecipesTab() {
  const [apiKey]        = useLocalStorage("jarvis_api_key", "");
  const [customRecipes,  setCustomRecipes]  = useLocalStorage("jarvis_custom_recipes", []);
  const [recipeDetails,  setRecipeDetails]  = useLocalStorage("jarvis_recipe_details", {});

  const [f,           setF]           = useState({ search:"", meal:"all", cuisine:"all", maxCal:2000 });
  const [selected,    setSelected]    = useState(null);
  const [uploadPhase, setUploadPhase] = useState("idle"); // idle|loading|preview|done
  const [uploadMsg,   setUploadMsg]   = useState("");
  const [previews,    setPreviews]    = useState([]);
  const fileRef = useRef(null);

  // Merge built-in + custom recipes
  const allRecipes = [
    ...RECIPES.map(r => ({
      ...r, source:"builtin",
      ingredients:  recipeDetails[r.id]?.ingredients  || [],
      instructions: recipeDetails[r.id]?.instructions || [],
      imageUrl:     recipeDetails[r.id]?.imageUrl     || "",
      imageData:    recipeDetails[r.id]?.imageData    || "",
    })),
    ...customRecipes.map(r => ({ ...r, source: r.source || "uploaded" })),
  ];

  const cuisines = [...new Set(allRecipes.map(r => r.cuisine))].sort();
  const filtered = allRecipes.filter(r => {
    const mS = r.name.toLowerCase().includes(f.search.toLowerCase())
      || r.tags?.some(t => t.includes(f.search.toLowerCase()));
    const mM = f.meal === "all" || r.meal?.includes(parseInt(f.meal));
    const mC = f.cuisine === "all" || r.cuisine === f.cuisine;
    return mS && mM && mC && r.cal <= f.maxCal;
  });

  // ── PDF processing ──
  const processPDF = async (file) => {
    if (!apiKey) { setUploadMsg("No API key — add your Anthropic key in Integrations first."); return; }
    setUploadPhase("loading");
    setUploadMsg("Loading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      const buf = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      const n   = pdf.numPages;
      setUploadMsg(`Extracting ${n} page${n !== 1 ? "s" : ""}…`);

      let fullText = "";
      const thumbs = [];

      for (let p = 1; p <= n; p++) {
        const page = await pdf.getPage(p);
        // Text
        const tc  = await page.getTextContent();
        fullText += `\n\n=== PAGE ${p} ===\n${tc.items.map(i => i.str).join(" ")}`;
        // Thumbnail at 150px wide
        const nativeVp = page.getViewport({ scale:1 });
        const scale    = 150 / nativeVp.width;
        const vp       = page.getViewport({ scale });
        const canvas   = document.createElement("canvas");
        canvas.width   = Math.round(vp.width);
        canvas.height  = Math.round(vp.height);
        await page.render({ canvasContext:canvas.getContext("2d"), viewport:vp }).promise;
        thumbs.push({ page:p, dataUrl:canvas.toDataURL("image/jpeg", 0.5) });
      }

      setUploadMsg("Analyzing with Claude…");
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          system: "Extract recipes from text and return a valid JSON array only. No markdown, no commentary.",
          messages:[{ role:"user", content:
            `Extract ALL complete recipes. Return a JSON array where each item has exactly:
{"name":"string","cal":number,"protein":number,"carbs":number,"fat":number,"time":number,
 "cuisine":"American|Italian|Mexican|Asian|Mediterranean|Korean|Other",
 "meal":[1,2,3],"tags":["string"],"ingredients":["string"],"instructions":["string"],"sourcePage":number}
meal: 1=Breakfast 2=Lunch 3=Dinner 4=Post-workout 5=Dessert. Estimate macros if not listed.
Return ONLY the JSON array starting with [ and ending with ].

TEXT:
${fullText.slice(0, 22000)}` }],
          apiKey, model:"claude-sonnet-4-5", maxTokens:4000,
        }),
      });

      const data  = await res.json();
      const raw   = data.content?.[0]?.text || "[]";
      const match = raw.match(/\[[\s\S]*\]/);
      let extracted = [];
      try { extracted = JSON.parse(match ? match[0] : raw); }
      catch {
        setUploadMsg("Couldn't parse recipes from this PDF. Try a clearer PDF.");
        setUploadPhase("idle"); return;
      }
      if (!extracted.length) {
        setUploadMsg("No recipes found — the PDF may not contain structured recipes.");
        setUploadPhase("idle"); return;
      }

      // Attach page thumbnail to each recipe
      const ts = Date.now();
      const withThumbs = extracted.map((r, i) => {
        const pg    = r.sourcePage || Math.min(i+1, thumbs.length);
        const thumb = thumbs.find(t => t.page === pg) || thumbs[0];
        return {
          ...r, id:`custom_${ts}_${i}`, source:"uploaded",
          imageData: thumb?.dataUrl || "",
          meal:         Array.isArray(r.meal)         ? r.meal         : [3],
          tags:         Array.isArray(r.tags)         ? r.tags         : [],
          ingredients:  Array.isArray(r.ingredients)  ? r.ingredients  : [],
          instructions: Array.isArray(r.instructions) ? r.instructions : [],
        };
      });

      setPreviews(withThumbs);
      setUploadPhase("preview");

    } catch (e) {
      setUploadMsg("Error processing PDF: " + e.message);
      setUploadPhase("idle");
    }
  };

  const importRecipes = (list) => {
    setCustomRecipes(prev => [...prev, ...list]);
    setPreviews([]);
    setUploadPhase("done");
    setUploadMsg(`Imported ${list.length} recipe${list.length !== 1 ? "s" : ""}!`);
    setTimeout(() => { setUploadPhase("idle"); setUploadMsg(""); }, 4000);
  };

  const handleSave = (updated) => {
    if (updated.source === "builtin") {
      setRecipeDetails(prev => ({
        ...prev,
        [updated.id]: {
          ingredients: updated.ingredients, instructions: updated.instructions,
          imageUrl: updated.imageUrl, imageData: updated.imageData || "",
        },
      }));
    } else {
      setCustomRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    }
    setSelected(updated);
  };

  const handleDelete = (id) => {
    setCustomRecipes(prev => prev.filter(r => r.id !== id));
    setSelected(null);
  };

  const selStyle = {
    background:"rgba(0,212,255,0.05)", border:`1px solid ${C.border}`,
    borderRadius:4, padding:"9px 12px", color:C.text, fontSize:13, outline:"none",
  };

  return (
    <>
      {selected && (
        <RecipeDetailModal recipe={selected} onClose={() => setSelected(null)}
          onSave={handleSave} onDelete={() => handleDelete(selected.id)} />
      )}

      {/* ── PDF Import ── */}
      <HUDCard title="Import Recipes from PDF" accent={C.purple}>
        {uploadPhase === "idle" && (
          <>
            <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
              Upload a recipe book PDF — Claude will extract all recipes including ingredients,
              instructions, and macros automatically.
              {!apiKey && <span style={{ color:C.yellow }}> Add your Anthropic key in Integrations first.</span>}
            </div>
            <input type="file" accept=".pdf" ref={fileRef} style={{ display:"none" }}
              onChange={e => { if (e.target.files[0]) processPDF(e.target.files[0]); e.target.value=""; }} />
            <div
              onClick={() => apiKey && fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file?.type === "application/pdf" && apiKey) processPDF(file);
              }}
              style={{ border:`2px dashed ${apiKey ? C.purple+"60" : C.dim+"30"}`,
                borderRadius:10, padding:"28px 20px", textAlign:"center",
                cursor: apiKey ? "pointer" : "not-allowed",
                opacity: apiKey ? 1 : 0.55, transition:"border-color 0.2s" }}>
              <div style={{ fontSize:32, marginBottom:8 }}>📄</div>
              <div style={{ fontSize:13, color: apiKey ? C.purple : C.dim, fontWeight:600, marginBottom:4 }}>
                Drop PDF here or tap to browse
              </div>
              <div style={{ fontSize:11, color:C.dim }}>
                Recipe books, guides, meal plans — any PDF with recipes
              </div>
            </div>
          </>
        )}

        {uploadPhase === "loading" && (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:14 }}>
              {[0,1,2].map(d => (
                <div key={d} style={{ width:8, height:8, borderRadius:"50%", background:C.purple,
                  animation:`jarvis-dot 1.2s ease-in-out ${d*0.2}s infinite` }} />
              ))}
            </div>
            <div style={{ fontSize:13, color:C.purple, fontWeight:600 }}>{uploadMsg}</div>
          </div>
        )}

        {uploadPhase === "preview" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>
                {previews.length} recipe{previews.length !== 1 ? "s" : ""} found
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <HUDBtn onClick={() => { setPreviews([]); setUploadPhase("idle"); }}>Discard</HUDBtn>
                <HUDBtn variant="primary" onClick={() => importRecipes(previews)}>Import All</HUDBtn>
              </div>
            </div>
            <div style={{ maxHeight:280, overflowY:"auto", display:"flex", flexDirection:"column",
              gap:6, scrollbarWidth:"thin", scrollbarColor:`${C.dim} transparent` }}>
              {previews.map((r, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px",
                  background:"rgba(0,16,40,0.6)", border:`1px solid ${C.border}`, borderRadius:8 }}>
                  {r.imageData && (
                    <img src={r.imageData} alt="" style={{ width:44, height:48,
                      objectFit:"cover", borderRadius:5, flexShrink:0 }} />
                  )}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:2,
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.name}</div>
                    <div style={{ fontSize:11, color:C.dim }}>
                      {r.cal} cal · {r.protein}g P · {r.ingredients?.length||0} ingredients
                    </div>
                  </div>
                  <HUDBtn onClick={() => importRecipes([r])} style={{ padding:"5px 10px", fontSize:10 }}>Add</HUDBtn>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadPhase === "done" && (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:28, marginBottom:8 }}>✅</div>
            <div style={{ fontSize:13, color:C.green, fontWeight:600 }}>{uploadMsg}</div>
          </div>
        )}
      </HUDCard>

      {/* ── Filter ── */}
      <HUDCard title={`Recipe Library — ${allRecipes.length} Recipes`}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input placeholder="Search recipes or tags..." value={f.search}
            onChange={e => setF({...f, search:e.target.value})}
            style={{ width:"100%", background:"rgba(0,212,255,0.04)", border:`1px solid ${C.border}`,
              borderRadius:4, padding:"9px 12px", color:C.text, fontSize:13, outline:"none",
              fontFamily:"inherit" }} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <select style={selStyle} value={f.meal} onChange={e => setF({...f, meal:e.target.value})}>
              <option value="all">All meals</option>
              {[1,2,3,4,5].map(n => (
                <option key={n} value={n}>{["","Breakfast","Lunch","Dinner","Post-workout","Dessert"][n]}</option>
              ))}
            </select>
            <select style={selStyle} value={f.cuisine} onChange={e => setF({...f, cuisine:e.target.value})}>
              <option value="all">All cuisines</option>
              {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", marginBottom:5 }}>
              MAX CALORIES: <span style={{ color:C.cyan }}>{f.maxCal}</span>
            </div>
            <input type="range" min={100} max={2000} step={50} value={f.maxCal}
              onChange={e => setF({...f, maxCal:parseInt(e.target.value)})}
              style={{ width:"100%", accentColor:C.cyan }} />
          </div>
        </div>
      </HUDCard>

      <div style={{ fontSize:11, color:C.dim, letterSpacing:"0.1em", marginBottom:10 }}>
        {filtered.length} RECIPES SHOWN — TAP ANY TO VIEW FULL DETAILS
      </div>

      {filtered.map(r => <RecipeCard key={r.id} recipe={r} onSelect={setSelected} />)}
    </>
  );
}

// ─── BODY TAB ─────────────────────────────────────────────────────────────────
function BodyTab({ measurements, addMeasurement, error, notify }) {
  const [inp,    setInp]    = useState({ weight:"", waist:"" });
  const [saving, setSaving] = useState(false);
  const lw  = measurements.weight.slice(-1)[0]?.val;
  const lwa = measurements.waist.slice(-1)[0]?.val;

  const save = async () => {
    const w = parseFloat(inp.weight), wa = parseFloat(inp.waist);
    if (!w && !wa) { notify("Enter a weight or a waist measurement", "error"); return; }

    setSaving(true);
    try {
      await addMeasurement({ weight: w || null, waist: wa || null });
      setInp({ weight:"", waist:"" });
      notify("Saved to database ✓", "success");
    } catch (e) {
      notify(e.message, "error");   // a failed save says so; it never looks like it worked
    } finally {
      setSaving(false);
    }
  };

  const waistTarget = 82.5;
  const waistPct = lwa ? Math.max(0, Math.min(100, (1 - Math.max(0, lwa - waistTarget)/10)*100)) : 0;

  return (
    <>
      <HUDCard title="Log Measurements">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <HUDInput label="Weight (lbs)" type="number" placeholder="0" value={inp.weight}
            onChange={e=>setInp({...inp,weight:e.target.value})} style={{ marginBottom:0 }} />
          <HUDInput label="Waist (cm)" type="number" placeholder="0" value={inp.waist}
            onChange={e=>setInp({...inp,waist:e.target.value})} style={{ marginBottom:0 }} />
        </div>
        <HUDBtn variant="primary" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save Measurements"}
        </HUDBtn>
        {error && (
          <div style={{ marginTop:10, fontSize:12, color:C.orange }}>{error}</div>
        )}
      </HUDCard>

      <HUDCard title="Waist Goal Tracker" accent={lwa && lwa <= 84 ? C.green : C.orange}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
          <div>
            <span style={{ fontSize:32, fontWeight:700, color: lwa && lwa <= 84 ? C.green : lwa ? C.orange : C.text }}>
              {lwa || "—"}
            </span>
            <span style={{ fontSize:13, color:C.dim, marginLeft:4 }}>cm</span>
          </div>
          <div style={{ fontSize:12, color:C.dim }}>Target: 81–84 cm</div>
        </div>
        {lwa && (
          <>
            <GlowBar pct={waistPct} color={lwa <= 84 ? C.green : C.orange} height={6} />
            <div style={{ fontSize:12, color:C.dim, marginTop:8 }}>
              {lwa <= 81 ? `✅ In target range — ${(lwa-81).toFixed(1)}cm above lower bound`
               : lwa <= 84 ? "✅ In target range"
               : `${(lwa-84).toFixed(1)}cm above target upper bound`}
            </div>
          </>
        )}
      </HUDCard>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {measurements.weight.length > 0 && (
          <HUDCard title="Weight History">
            {[...measurements.weight].reverse().slice(0,10).map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"6px 0", borderBottom:`1px solid ${C.borderDim}`, fontSize:12 }}>
                <span style={{ color:C.dim }}>{m.date}</span>
                <span style={{ fontWeight:600, color:C.text }}>{m.val} lbs</span>
              </div>
            ))}
          </HUDCard>
        )}
        {measurements.waist.length > 0 && (
          <HUDCard title="Waist History">
            {[...measurements.waist].reverse().slice(0,10).map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between",
                padding:"6px 0", borderBottom:`1px solid ${C.borderDim}`, fontSize:12 }}>
                <span style={{ color:C.dim }}>{m.date}</span>
                <span style={{ fontWeight:600, color:m.val<=84?C.green:C.orange }}>{m.val} cm</span>
              </div>
            ))}
          </HUDCard>
        )}
      </div>
    </>
  );
}

// ─── SLEEP TAB ────────────────────────────────────────────────────────────────
function SleepTab({ sleep, logSleep, error, notify, oura }) {
  const [inp,     setInp]     = useState({ hours:"", bedtime:"" });
  const [patInp,  setPatInp]  = useState("");
  const [saving,  setSaving]  = useState(false);
  const avgS = sleep.length ? (sleep.slice(-7).reduce((a,b)=>a+b.hours,0)/Math.min(sleep.length,7)).toFixed(1) : null;
  const debt = avgS ? Math.max(0,(8-parseFloat(avgS))*7).toFixed(1) : null;

  const log = async () => {
    const h = parseFloat(inp.hours);
    if (!h) { notify("Enter sleep hours", "error"); return; }

    setSaving(true);
    try {
      await logSleep({ hours: h, bedtime: inp.bedtime });
      setInp({ hours:"", bedtime:"" });
      notify("Sleep logged ✓", "success");
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Oura derived metrics ──
  const oR  = oura?.data?.readiness?.slice(-1)[0];
  const oSl = oura?.data?.dailySleep?.slice(-1)[0];
  const oSe = oura?.data?.sessions?.slice(-1)[0];
  const oAct= oura?.data?.activity?.slice(-1)[0];
  const oAvgSleep = oura?.data?.sessions?.length
    ? (oura.data.sessions.slice(-7).reduce((a,s)=>a+(s.total_sleep_duration||0),0) / Math.min(oura.data.sessions.slice(-7).length,7))
    : null;
  const oDebt = oAvgSleep ? Math.max(0, (8*3600 - oAvgSleep) * 7 / 3600).toFixed(1) : null;

  return (
    <>
      {/* ── Oura Ring Section ── */}
      {!oura?.connected ? (
        <HUDCard title="Oura Ring" accent={C.purple}>
          <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
            Connect your Oura Ring to see real-time readiness, sleep quality, and recovery metrics.{" "}
            <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noreferrer"
              style={{ color:C.cyan, textDecoration:"none" }}>
              Get your Personal Access Token ↗
            </a>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <HUDInput label="Personal Access Token" type="password" placeholder="Paste token here..."
              value={patInp} onChange={e=>setPatInp(e.target.value)}
              style={{ marginBottom:0, flex:1 }} />
          </div>
          <HUDBtn variant="primary" style={{ marginTop:10 }} onClick={() => {
            if (!patInp.trim()) { notify("Paste your Oura token", "error"); return; }
            oura.setToken(patInp.trim());
            setPatInp("");
            notify("Oura token saved — loading data…", "success");
          }}>Connect Oura Ring</HUDBtn>
        </HUDCard>
      ) : (
        <>
          <HUDCard title="Oura Ring" accent={C.purple}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:C.green, boxShadow:`0 0 6px ${C.green}` }} />
                <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>Connected</span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <HUDBtn onClick={oura.refresh} style={{ padding:"5px 12px", fontSize:11 }}
                  disabled={oura.loading}>{oura.loading ? "Loading…" : "↻ Refresh"}</HUDBtn>
                <HUDBtn onClick={oura.disconnect} style={{ padding:"5px 12px", fontSize:11, color:C.red, borderColor:C.red+"44" }}>
                  Disconnect
                </HUDBtn>
              </div>
            </div>

            {oura.error && (
              <div style={{ padding:"8px 12px", borderRadius:8, background:"rgba(255,18,68,0.08)", border:`1px solid ${C.red}33`,
                fontSize:12, color:C.red, marginBottom:14 }}>{oura.error}</div>
            )}

            {oura.data && (
              <>
                {/* Row 1: readiness + sleep score + activity */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:10 }}>
                  <Metric label="Readiness" value={oR?.score ?? "—"}
                    sub={oR?.score >= 85 ? "Optimal" : oR?.score >= 70 ? "Good" : oR?.score ? "Low" : "—"}
                    color={ouraColor(oR?.score)} pct={oR?.score} barColor={ouraColor(oR?.score)} />
                  <Metric label="Sleep Score" value={oSl?.score ?? "—"}
                    sub={oSl?.score >= 85 ? "Excellent" : oSl?.score >= 70 ? "Good" : oSl?.score ? "Fair" : "—"}
                    color={ouraColor(oSl?.score)} pct={oSl?.score} barColor={ouraColor(oSl?.score)} />
                  <Metric label="Activity" value={oAct?.score ?? "—"}
                    sub={oAct?.score >= 85 ? "High" : oAct?.score >= 70 ? "Good" : oAct?.score ? "Low" : "—"}
                    color={ouraColor(oAct?.score)} pct={oAct?.score} barColor={ouraColor(oAct?.score)} />
                </div>

                {/* Row 2: last night breakdown */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:10 }}>
                  <Metric label="Total Sleep" value={fmtDur(oSe?.total_sleep_duration)} color={C.text} />
                  <Metric label="REM" value={fmtDur(oSe?.rem_sleep_duration)} color={C.purple} />
                  <Metric label="Deep" value={fmtDur(oSe?.deep_sleep_duration)} color={C.blue} />
                </div>

                {/* Row 3: 7d avg + sleep debt */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:10 }}>
                  <Metric label="7-Day Avg Sleep"
                    value={oAvgSleep ? fmtDur(oAvgSleep) : "—"} color={C.text} />
                  <Metric label="Sleep Debt (8h target)"
                    value={oDebt ? `${oDebt}h` : "—"}
                    color={!oDebt ? C.text : parseFloat(oDebt) > 5 ? C.red : parseFloat(oDebt) > 2 ? C.yellow : C.green} />
                </div>
              </>
            )}

            {!oura.data && !oura.loading && !oura.error && (
              <div style={{ fontSize:12, color:C.dim, textAlign:"center", padding:"16px 0" }}>
                No data yet — tap Refresh to load your Oura metrics.
              </div>
            )}
          </HUDCard>
        </>
      )}

      <HUDCard title="Log Sleep">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <HUDInput label="Hours Slept" type="number" step="0.5" placeholder="7.5"
            value={inp.hours} onChange={e=>setInp({...inp,hours:e.target.value})} style={{ marginBottom:0 }} />
          <HUDInput label="Bedtime" type="time"
            value={inp.bedtime} onChange={e=>setInp({...inp,bedtime:e.target.value})} style={{ marginBottom:0 }} />
        </div>
        <HUDBtn variant="primary" onClick={log} disabled={saving}>
          {saving ? "Saving…" : "Log Sleep"}
        </HUDBtn>
        {error && <div style={{ marginTop:10, fontSize:12, color:C.orange }}>{error}</div>}
      </HUDCard>

      <HUDCard title="Sleep Overview">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <Metric label="7-Day Avg" value={avgS||"—"} unit="hrs"
            color={!avgS?C.text:parseFloat(avgS)>=7?C.green:parseFloat(avgS)>=6?C.yellow:C.red} />
          <Metric label="Sleep Debt" value={debt||"—"} unit="hrs"
            color={!debt?C.text:parseFloat(debt)>5?C.red:parseFloat(debt)>2?C.yellow:C.green} />
          <Metric label="Entries" value={sleep.length} color={C.text} />
        </div>
      </HUDCard>

      {sleep.length > 0 && (
        <HUDCard title="Sleep Log">
          {[...sleep].reverse().slice(0,14).map((s,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"7px 0", borderBottom:`1px solid ${C.borderDim}`, fontSize:12 }}>
              <div>
                <span style={{ color:C.dim }}>{s.date}</span>
                {s.bedtime && <span style={{ color:C.dim, marginLeft:10 }}>Bed {s.bedtime}</span>}
              </div>
              <span style={{ fontWeight:600, color:s.hours>=7?C.green:s.hours>=6?C.yellow:C.red }}>
                {s.hours}h
              </span>
            </div>
          ))}
        </HUDCard>
      )}

      <HUDCard title="Optimization Protocol">
        {[
          { tip:"Wind Down Lighting at 11pm", detail:"Warm amber triggers melatonin onset. Use the scene in the Home tab, or say 'Set lights to wind down'." },
          { tip:"Blackout Curtains",          detail:"South-facing window + any bedtime before 6am needs them. Priority acquisition." },
          { tip:"Target Bedtime: 12am",       detail:"Every hour shifted from 4am to midnight recovers ~4hrs weekly sleep debt. Compound effect is significant." },
        ].map((t,i) => (
          <div key={i} style={{ marginBottom:i<2?14:0, paddingBottom:i<2?14:0, borderBottom:i<2?`1px solid ${C.borderDim}`:"none" }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text, marginBottom:3 }}>{t.tip}</div>
            <div style={{ fontSize:12, color:C.dim, lineHeight:1.55 }}>{t.detail}</div>
          </div>
        ))}
      </HUDCard>
    </>
  );
}

// ─── INTEGRATIONS TAB ─────────────────────────────────────────────────────────
function IntegrationsTab({ jarvis, spotify, calendar, crypto, webhooks }) {
  const [open,    setOpen]    = useState({});
  const [newWH,   setNewWH]   = useState({ name:"", url:"", triggers:"", description:"" });
  const [adding,  setAdding]  = useState(false);
  const [testing, setTesting] = useState(null);

  const toggle = id => setOpen(s => ({ ...s, [id]: !s[id] }));

  // Integrations as a list of plates, expanded in place. The emoji that used to
  // sit here came from another vendor's design language and couldn't take the
  // accent; a diamond mark carries the same state and belongs to this palette.
  const IntCard = ({ id, icon, title, status, statusOk, children }) => (
    <div className="plate" style={{ marginBottom: 0, paddingBottom: open[id] ? 24 : 16 }}>
      <button
        onClick={() => toggle(id)}
        aria-expanded={!!open[id]}
        style={{
          display: "flex", alignItems: "center", gap: 14, width: "100%",
          background: "none", border: "none", padding: 0, cursor: "pointer",
          textAlign: "left", fontFamily: "inherit",
        }}
      >
        <span style={{ color: statusOk ? C.gold : C.line, fontSize: 11 }}>
          {statusOk ? "\u25C6" : "\u25C7"}
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ ...TYPE.body, color: C.textBright }}>{title}</div>
          <div className="hud-label" style={{ color: statusOk ? C.dimMid : C.dim, marginTop: 4 }}>
            {status}
          </div>
        </div>
        <span className="hud-label" style={{ marginLeft: "auto", color: C.dim }}>
          {open[id] ? "close" : "open"}
        </span>
      </button>

      {open[id] && <div className="rise" style={{ marginTop: 22 }}>{children}</div>}
    </div>
  );

  const testWebhook = async (wh) => {
    setTesting(wh.id);
    try {
      await fetch(wh.url, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ _jarvis:true, test:true, name:wh.name, timestamp:new Date().toISOString() }),
      });
    } catch {}
    setTesting(null);
  };

  const saveWebhook = () => {
    if (!newWH.name || !newWH.url) return;
    webhooks.add(newWH);
    setNewWH({ name:"", url:"", triggers:"", description:"" });
    setAdding(false);
  };

  return (
    <>
      <div style={{ fontSize:10, letterSpacing:"0.15em", color:C.dim, marginBottom:16 }}>◆ INTEGRATIONS HUB</div>

      {/* ── AI CORE ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, fontWeight:600 }}>AI CORE</div>

      <IntCard id="claude" icon="🧠" title="Claude AI Brain"
        status={jarvis.apiKey ? "API key configured" : "API key required"}
        statusOk={!!jarvis.apiKey}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
          Get your key at <span style={{ color:C.cyan }}>console.anthropic.com</span> → API Keys.
          For Vercel, set <span style={{ color:C.cyan }}>ANTHROPIC_API_KEY</span> in project environment vars instead.
        </div>
        <HUDInput label="Anthropic API Key" type="password" placeholder="sk-ant-..."
          value={jarvis.apiKey} onChange={e => jarvis.setApiKey(e.target.value)} />
        <div style={{ fontSize:11, color:C.dim, marginTop:-4 }}>Stored in localStorage only.</div>
      </IntCard>

      <IntCard id="groq" icon="⚡" title="Groq (AI Fallback)"
        status={jarvis.groqKey ? "Active — instant fallback when Claude is overloaded" : "Not configured — add key to eliminate overload errors"}
        statusOk={!!jarvis.groqKey}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
          Free API at <span style={{ color:C.cyan }}>console.groq.com</span> → API Keys. No credit card needed.<br/>
          When Claude is overloaded, Jarvis instantly switches to Groq's Llama model — you won't notice the difference.
        </div>
        <HUDInput label="Groq API Key" type="password" placeholder="gsk_..."
          value={jarvis.groqKey} onChange={e => jarvis.setGroqKey(e.target.value)} />
        <div style={{ fontSize:11, color:C.dim, marginTop:-4 }}>Free tier: 14,400 requests/day. More than enough.</div>
      </IntCard>

      <IntCard id="eleven" icon="🎙️" title="ElevenLabs Voice"
        status={jarvis.elevenKey ? "Human-quality voice active" : "Using browser TTS — add key for real voice"}
        statusOk={!!jarvis.elevenKey}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
          Free tier at <span style={{ color:C.cyan }}>elevenlabs.io</span> → Profile → API Key. 10k chars/month free.
        </div>
        <HUDInput label="ElevenLabs API Key" type="password" placeholder="your-elevenlabs-api-key"
          value={jarvis.elevenKey} onChange={e => jarvis.setElevenKey(e.target.value)} />
        <div style={{ fontSize:12, color:C.dim, marginBottom:8 }}>Voice</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:4 }}>
          {ELEVEN_VOICES.map(v => (
            <button key={v.id} onClick={() => jarvis.setVoiceId(v.id)} style={{
              padding:"9px 12px", border:`1px solid ${jarvis.voiceId===v.id ? C.cyan : C.border}`,
              background: jarvis.voiceId===v.id ? "rgba(0,212,255,0.12)" : "transparent",
              color: jarvis.voiceId===v.id ? C.cyan : C.text,
              borderRadius:6, cursor:"pointer", textAlign:"left", fontSize:12, transition:"all 0.2s",
            }}>
              {jarvis.voiceId===v.id ? "● " : ""}{v.name}
            </button>
          ))}
        </div>
      </IntCard>

      {/* ── CONNECTED SERVICES ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, marginTop:18, fontWeight:600 }}>CONNECTED SERVICES</div>

      <IntCard id="spotify" icon="🎵" title="Spotify"
        status={spotify.connected ? "Connected" : "Not connected"}
        statusOk={spotify.connected}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
          1. <span style={{ color:C.cyan }}>developer.spotify.com/dashboard</span> → Create app<br/>
          2. Settings → Redirect URIs → Add: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          3. Copy Client ID below
        </div>
        <HUDInput label="Spotify Client ID" placeholder="your-client-id"
          value={spotify.clientId} onChange={e => spotify.setClientId(e.target.value)} />
        {spotify.connected
          ? <HUDBtn variant="danger" onClick={spotify.disconnect}>Disconnect</HUDBtn>
          : <HUDBtn variant="primary" onClick={spotify.login} disabled={!spotify.clientId}>Connect Spotify</HUDBtn>}
      </IntCard>

      <IntCard id="gcal" icon="📅" title="Google Calendar"
        status={calendar.connected ? "Connected" : "Not connected"}
        statusOk={calendar.connected}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
          1. <span style={{ color:C.cyan }}>console.cloud.google.com</span> → Enable Calendar API<br/>
          2. Credentials → OAuth 2.0 → Web application → Authorised JavaScript origins: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          3. Same credential → Authorised redirect URIs: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          4. Copy Client ID below
        </div>
        <HUDInput label="Google OAuth Client ID" placeholder="your-id.apps.googleusercontent.com"
          value={calendar.clientId} onChange={e => calendar.setClientId(e.target.value)} />
        {calendar.connected
          ? <HUDBtn variant="danger" onClick={calendar.disconnect}>Disconnect</HUDBtn>
          : <HUDBtn variant="primary" onClick={calendar.login} disabled={!calendar.clientId}>Connect Calendar</HUDBtn>}
        <div style={{ fontSize:11, color: calendar.connected && calendar.expiry && (calendar.expiry - Date.now() < 10*60*1000) ? C.orange : C.dim, marginTop:8 }}>
          {calendar.connected && calendar.expiry
            ? (() => { const mins = Math.max(0, Math.round((calendar.expiry - Date.now()) / 60000)); return mins < 2 ? "⚠ Token expired — reconnect now" : mins < 60 ? `⚠ Token expires in ${mins} min — reconnect soon` : "Token expires in ~1hr — reconnect as needed."; })()
            : "Token expires in 1hr — reconnect as needed."}
        </div>
      </IntCard>

      <IntCard id="hue" icon="💡" title="Philips Hue"
        status="Configure in Home tab — local network only"
        statusOk={false}>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.6 }}>
          Hue Bridge setup is in the <span style={{ color:C.cyan }}>Home</span> tab → scroll to Bridge Setup.
          Control lights by voice: <em>"Set lights to focus"</em>, <em>"Wind down mode"</em>, etc.
        </div>
        <div style={{ fontSize:11, color:C.orange, marginTop:10, lineHeight:1.5 }}>
          ⚠ Browser security blocks HTTP requests to local IPs from an HTTPS page. Hue only works when accessing Jarvis from your home network or running it locally.
        </div>
      </IntCard>

      {/* ── DATA FEEDS ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, marginTop:18, fontWeight:600 }}>DATA FEEDS</div>

      <IntCard id="weather" icon="🌤️" title="Weather" status="Always on — Open-Meteo (free)" statusOk={true}>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.6 }}>
          Uses your browser's geolocation + Open-Meteo free API. No key needed. Allow location access when prompted.
        </div>
      </IntCard>

      <IntCard id="crypto" icon="₿" title="Crypto Prices (CoinGecko)"
        status={crypto.enabled ? "Live — BTC / ETH / SOL" : "Disabled"}
        statusOk={crypto.enabled}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          Free CoinGecko API — no key required. Updates every 60 seconds when enabled.
          Ask Jarvis: <em>"What's Bitcoin at?"</em>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={() => crypto.setEnabled(!crypto.enabled)} style={{
            padding:"8px 20px", borderRadius:6, fontSize:12, fontWeight:600, cursor:"pointer",
            background: crypto.enabled ? "rgba(255,34,85,0.15)" : "rgba(0,212,255,0.12)",
            border: `1px solid ${crypto.enabled ? C.red+"55" : C.cyan+"55"}`,
            color: crypto.enabled ? C.red : C.cyan,
          }}>
            {crypto.enabled ? "Disable" : "Enable"}
          </button>
          {crypto.prices && (
            <div style={{ display:"flex", gap:12, fontSize:12 }}>
              {crypto.prices.bitcoin && <span style={{ color:C.orange }}>BTC ${crypto.prices.bitcoin.usd?.toLocaleString()}</span>}
              {crypto.prices.ethereum && <span style={{ color:C.purple }}>ETH ${crypto.prices.ethereum.usd?.toLocaleString()}</span>}
              {crypto.prices.solana && <span style={{ color:C.green }}>SOL ${crypto.prices.solana.usd?.toFixed(2)}</span>}
            </div>
          )}
        </div>
      </IntCard>

      {/* ── CUSTOM WEBHOOKS ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, marginTop:18, fontWeight:600 }}>CUSTOM WEBHOOKS</div>
      <div style={{ fontSize:12, color:C.dim, marginBottom:12, lineHeight:1.6 }}>
        Connect anything via webhook. Build a scenario in <span style={{ color:C.cyan }}>make.com</span> or <span style={{ color:C.cyan }}>zapier.com</span> (both free), copy the webhook URL, and Jarvis will call it by voice.
      </div>

      {webhooks.webhooks.map(wh => (
        <div key={wh.id} style={{ background:"rgba(0,18,42,0.6)", border:`1px solid ${wh.enabled ? C.cyan+"33" : C.border}`,
          borderRadius:10, padding:"14px 16px", marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:wh.description?6:0 }}>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{wh.name}</div>
              {wh.description && <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{wh.description}</div>}
              {wh.triggers && <div style={{ fontSize:11, color:C.blue, marginTop:4 }}>Triggers: <em>"{wh.triggers}"</em></div>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexShrink:0, marginLeft:12 }}>
              <button onClick={() => testWebhook(wh)} disabled={testing===wh.id} style={{
                padding:"5px 10px", fontSize:11, borderRadius:5, cursor:"pointer",
                background:"rgba(0,212,255,0.08)", border:`1px solid ${C.cyan}44`, color:C.cyan,
              }}>{testing===wh.id ? "…" : "Test"}</button>
              <button onClick={() => webhooks.update(wh.id, { enabled:!wh.enabled })} style={{
                padding:"5px 10px", fontSize:11, borderRadius:5, cursor:"pointer",
                background: wh.enabled ? "rgba(0,255,153,0.08)" : "rgba(61,98,117,0.2)",
                border:`1px solid ${wh.enabled ? C.green+"44" : C.dim+"44"}`,
                color: wh.enabled ? C.green : C.dim,
              }}>{wh.enabled ? "On" : "Off"}</button>
              <button onClick={() => webhooks.remove(wh.id)} style={{
                padding:"5px 10px", fontSize:11, borderRadius:5, cursor:"pointer",
                background:"rgba(255,34,85,0.08)", border:`1px solid ${C.red}44`, color:C.red,
              }}>✕</button>
            </div>
          </div>
        </div>
      ))}

      {adding ? (
        <div style={{ background:"rgba(0,18,42,0.8)", border:`1px solid ${C.cyan}44`, borderRadius:10, padding:16, marginBottom:10 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.cyan, marginBottom:14, letterSpacing:"0.08em" }}>NEW WEBHOOK</div>
          <HUDInput label="Name" placeholder="e.g. Order Supplements"
            value={newWH.name} onChange={e => setNewWH({...newWH, name:e.target.value})} />
          <HUDInput label="Webhook URL" placeholder="https://hook.make.com/..."
            value={newWH.url} onChange={e => setNewWH({...newWH, url:e.target.value})} />
          <HUDInput label="Trigger phrases (what you say to Jarvis)"
            placeholder="e.g. order supplements, buy protein"
            value={newWH.triggers} onChange={e => setNewWH({...newWH, triggers:e.target.value})} />
          <HUDInput label="Description (what this does)"
            placeholder="e.g. Places a repeat order for my supplement stack"
            value={newWH.description} onChange={e => setNewWH({...newWH, description:e.target.value})} />
          <div style={{ display:"flex", gap:8 }}>
            <HUDBtn variant="primary" onClick={saveWebhook} disabled={!newWH.name || !newWH.url}>Save Webhook</HUDBtn>
            <HUDBtn onClick={() => { setAdding(false); setNewWH({ name:"", url:"", triggers:"", description:"" }); }}>Cancel</HUDBtn>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} style={{
          width:"100%", padding:"13px", borderRadius:10, fontSize:13, fontWeight:600,
          background:"rgba(0,212,255,0.05)", border:`1px dashed ${C.cyan}44`,
          color:C.cyan, cursor:"pointer", letterSpacing:"0.06em", transition:"all 0.2s",
        }}>+ ADD WEBHOOK</button>
      )}

      {/* ── MEMORY ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, marginTop:24, fontWeight:600 }}>MEMORY</div>

      {/* Living Memory File */}
      <HUDCard style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>◆ JARVIS Memory File</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>
              {jarvis.memoryUpdated
                ? `Last updated ${new Date(jarvis.memoryUpdated).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})} · Auto-deepens every 5 exchanges`
                : "Auto-builds after 5 conversations — grows richer over time"}
            </div>
          </div>
          {jarvis.memoryFile && <HUDBtn variant="danger" onClick={() => { jarvis.setMemoryFile(""); }}>Reset</HUDBtn>}
        </div>
        {jarvis.memoryFile ? (
          <div style={{ position:"relative" }}>
            <textarea
              value={jarvis.memoryFile}
              onChange={e => jarvis.setMemoryFile(e.target.value)}
              style={{
                width:"100%", minHeight:180, padding:"12px", borderRadius:8, resize:"vertical",
                background:"rgba(0,212,255,0.04)", border:`1px solid ${C.cyan}33`,
                color:C.text, fontSize:12, lineHeight:1.7, fontFamily:"inherit",
                boxSizing:"border-box",
              }}
            />
            <div style={{ fontSize:10, color:C.dim, marginTop:6 }}>
              You can edit this directly — Jarvis will use whatever's here as its knowledge of you.
            </div>
          </div>
        ) : (
          <div style={{ padding:"16px 12px", background:"rgba(0,212,255,0.03)", borderRadius:8,
            border:`1px dashed ${C.cyan}22`, textAlign:"center" }}>
            <div style={{ fontSize:12, color:C.dim, marginBottom:8 }}>Memory file not yet built.</div>
            <div style={{ fontSize:11, color:C.dim, lineHeight:1.6 }}>
              Have 5 conversations with Jarvis and it will automatically synthesise everything it's learned into a permanent profile — your preferences, goals, habits, personality, and everything you've told it.
            </div>
          </div>
        )}
      </HUDCard>

      {/* Memory Notes */}
      <HUDCard style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:jarvis.memories.length ? 12 : 0 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Memory Notes</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{jarvis.memories.length} note{jarvis.memories.length !== 1 ? "s" : ""} · Tell Jarvis "remember that…" to add one</div>
          </div>
          {jarvis.memories.length > 0 && <HUDBtn variant="danger" onClick={jarvis.clearMemories}>Clear</HUDBtn>}
        </div>
        {jarvis.memories.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {[...jarvis.memories].reverse().map(m => (
              <div key={m.id} style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                padding:"10px 12px", background:"rgba(0,212,255,0.04)", borderRadius:8, border:`1px solid ${C.borderDim}` }}>
                <div>
                  <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{m.fact}</div>
                  <div style={{ fontSize:10, color:C.dim, marginTop:3 }}>{new Date(m.timestamp).toLocaleDateString("en-US",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</div>
                </div>
                <button onClick={() => jarvis.deleteMemory(m.id)} style={{
                  background:"none", border:"none", color:C.dim, cursor:"pointer",
                  fontSize:16, padding:"0 0 0 12px", flexShrink:0,
                }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </HUDCard>

      {/* Conversation History */}
      <HUDCard style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Conversation History</div>
            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{Math.floor(jarvis.chatHistory.length / 2)} exchanges stored · last 20 sent with every command</div>
          </div>
          {jarvis.chatHistory.length > 0 && <HUDBtn variant="danger" onClick={jarvis.clearHistory}>Clear</HUDBtn>}
        </div>
      </HUDCard>

      {/* ── SYSTEM INFO ── */}
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.cyan, marginBottom:8, marginTop:24, fontWeight:600 }}>SYSTEM</div>
      <HUDCard>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            ["AI Model",    "Claude Haiku 4.5"],
            ["AI Fallback", jarvis.groqKey ? "Groq Llama ●" : "None ○"],
            ["Voice STT",   "Web Speech API"],
            ["Voice TTS",   jarvis.elevenKey ? "ElevenLabs ●" : "Browser TTS ○"],
            ["Weather",     "Open-Meteo (free)"],
            ["Music",       spotify.connected ? "Spotify ●" : "Spotify ○"],
            ["Calendar",    calendar.connected ? "Google ●" : "Google ○"],
            ["Crypto",      crypto.enabled ? "CoinGecko ●" : "Disabled ○"],
            ["Webhooks",    `${webhooks.webhooks.filter(w=>w.enabled).length} active`],
          ].map(([k, v]) => (
            <div key={k} style={{ padding:"8px 0", borderBottom:`1px solid ${C.borderDim}` }}>
              <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", textTransform:"uppercase" }}>{k}</div>
              <div style={{ fontSize:13, color:C.text, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>
      </HUDCard>
    </>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ jarvis }) {
  return (
    <>
      <HUDCard title="Claude AI Configuration" accent={C.purple}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          Your Anthropic API key powers both the AI chat tab and the voice assistant.
          Stored locally and synced via Cloud Sync in Integrations.
        </div>
        <HUDInput label="Anthropic API Key" type="password" placeholder="sk-ant-..."
          value={jarvis.apiKey} onChange={e => jarvis.setApiKey(e.target.value)} />
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:"50%",
            background: jarvis.apiKey ? C.green : C.dim,
            boxShadow: jarvis.apiKey ? `0 0 8px ${C.green}` : "none",
          }} />
          <span style={{ fontSize:11, color: jarvis.apiKey ? C.green : C.dim }}>
            {jarvis.apiKey ? "API key set — AI chat and voice assistant active" : "No key — add one to enable AI features"}
          </span>
        </div>
      </HUDCard>

      <HUDCard title="About JARVIS">
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.9 }}>
          {[
            ["AI Chat model",    "claude-sonnet-4-5"],
            ["Voice AI model",   "claude-haiku-4-5-20251001"],
            ["Recipes",          `${RECIPES.length} KRANK recipes`],
            ["Voice",            "ElevenLabs · Browser TTS fallback"],
            ["Sync",             "GitHub Gist (Integrations tab)"],
            ["Oura API",         "v2 — readiness, sleep, activity"],
          ].map(([k, v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"2px 0",
              borderBottom:`1px solid ${C.borderDim}` }}>
              <span style={{ color:C.dimMid }}>{k}</span>
              <span style={{ color:C.text, fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      </HUDCard>
    </>
  );
}

// ─── FLOATING ORB ─────────────────────────────────────────────────────────────
function FloatingOrb({ jarvis }) {
  const state = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";
  const col = { idle:C.cyan, listening:C.red, thinking:C.yellow, speaking:C.green }[state];
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:200 }}>
      <button onClick={jarvis.listening ? jarvis.stopListening : jarvis.startListening}
        style={{
          background:"rgba(0,8,20,0.85)", backdropFilter:"blur(20px)",
          border:`1px solid ${col}33`,
          borderRadius:"50%", width:64, height:64,
          cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:`0 0 24px ${col}33, 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)`,
          transition:"box-shadow 0.3s, border-color 0.3s",
        }}
        title="Talk to JARVIS">
        <ArcReactor size={44} state={state} />
      </button>
    </div>
  );
}

// ─── PLANS TAB ────────────────────────────────────────────────────────────────
const STATUS_META = {
  accepted:  { label: "Accepted",  color: "#00FF88", icon: "✓" },
  tentative: { label: "Tentative", color: "#FFD600", icon: "?" },
  pending:   { label: "Pending",   color: "#00C8FF", icon: "…" },
  declined:  { label: "Declined",  color: "#FF1244", icon: "✕" },
  past:      { label: "Past",      color: "#4A7D9A", icon: "↩" },
};

function PlansTab({ apiKey }) {
  const [plans,      setPlans]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [scannedAt,  setScannedAt]  = useState(null);
  const [days,       setDays]       = useState(90);
  const [filter,     setFilter]     = useState("all");

  const scan = async () => {
    if (!apiKey) { setError("Add your Anthropic API key in Settings first."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/plans/scan?days=${days}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": apiKey },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scan failed");
      // Sort: upcoming first, then by date, then past/unknown at end
      const sorted = (data.plans || []).sort((a, b) => {
        const order = { accepted:0, tentative:1, pending:2, declined:3, past:4 };
        return (order[a.status] ?? 5) - (order[b.status] ?? 5);
      });
      setPlans(sorted);
      setScannedAt(data.scannedAt);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const visible = plans
    ? (filter === "all" ? plans : plans.filter(p => p.status === filter))
    : [];

  const counts = plans
    ? Object.fromEntries(Object.keys(STATUS_META).map(s => [s, plans.filter(p => p.status === s).length]))
    : {};

  return (
    <>
      <HUDCard title="iMessage Plans Scanner" accent={C.purple}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:16, lineHeight:1.6 }}>
          Scans your local iMessage history and uses Claude AI to surface plans, meetups, and commitments you may have forgotten about.
        </div>

        <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap", marginBottom:16 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:C.dimMid }}>Look back</span>
            {[30, 60, 90, 180].map(d => (
              <button key={d} onClick={() => setDays(d)} style={{
                padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer",
                border:`1px solid ${days===d ? C.purple : C.border}`,
                background: days===d ? `${C.purple}22` : "transparent",
                color: days===d ? C.purple : C.dimMid,
                fontWeight: days===d ? 700 : 400,
              }}>{d}d</button>
            ))}
          </div>

          <button onClick={scan} disabled={loading} style={{
            marginLeft:"auto", padding:"8px 20px", borderRadius:8, fontSize:12, fontWeight:700,
            cursor: loading ? "not-allowed" : "pointer",
            border:`1px solid ${C.purple}88`,
            background: loading ? `${C.purple}11` : `${C.purple}22`,
            color: loading ? C.dimMid : C.purple,
            letterSpacing:"0.06em",
            boxShadow: loading ? "none" : `0 0 16px ${C.purple}33`,
            transition:"all 0.2s",
          }}>
            {loading ? "Scanning…" : plans ? "Re-scan" : "Scan Messages"}
          </button>
        </div>

        {loading && (
          <div style={{ textAlign:"center", padding:"32px 0", color:C.purple, fontSize:12 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🔍</div>
            Analyzing your iMessage history with Claude AI…<br/>
            <span style={{ color:C.dim, fontSize:11 }}>This may take 20–40 seconds for large histories.</span>
          </div>
        )}

        {error && (
          <div style={{ padding:"12px 16px", borderRadius:8, background:`${C.red}11`, border:`1px solid ${C.red}33`, color:C.red, fontSize:12, marginBottom:12 }}>
            {error}
          </div>
        )}

        {scannedAt && !loading && (
          <div style={{ fontSize:10, color:C.dim, marginBottom:12 }}>
            Last scanned {new Date(scannedAt).toLocaleString()} · {plans.length} plan{plans.length!==1?"s":""} found
          </div>
        )}

        {plans && !loading && (
          <>
            {/* Status filter chips */}
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              <button onClick={() => setFilter("all")} style={{
                padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer",
                border:`1px solid ${filter==="all" ? C.cyan : C.border}`,
                background: filter==="all" ? `${C.cyan}18` : "transparent",
                color: filter==="all" ? C.cyan : C.dimMid,
                fontWeight: filter==="all" ? 700 : 400,
              }}>All ({plans.length})</button>
              {Object.entries(STATUS_META).map(([s, m]) => counts[s] > 0 && (
                <button key={s} onClick={() => setFilter(s)} style={{
                  padding:"4px 12px", borderRadius:20, fontSize:11, cursor:"pointer",
                  border:`1px solid ${filter===s ? m.color : C.border}`,
                  background: filter===s ? `${m.color}18` : "transparent",
                  color: filter===s ? m.color : C.dimMid,
                  fontWeight: filter===s ? 700 : 400,
                }}>{m.icon} {m.label} ({counts[s]})</button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:C.dim, fontSize:12 }}>
                No {filter !== "all" ? filter : ""} plans found in the last {days} days.
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {visible.map((plan, i) => {
                  const meta = STATUS_META[plan.status] || STATUS_META.pending;
                  return (
                    <div key={i} style={{
                      padding:"14px 16px", borderRadius:10,
                      border:`1px solid ${meta.color}33`,
                      background:`${meta.color}08`,
                      backdropFilter:"blur(8px)",
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:10 }}>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:C.textBright, marginBottom:4 }}>
                            {plan.title}
                          </div>
                          {plan.details && (
                            <div style={{ fontSize:11, color:C.dimMid, marginBottom:4, lineHeight:1.5 }}>
                              {plan.details}
                            </div>
                          )}
                          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                            {plan.contact && (
                              <span style={{ fontSize:10, color:C.dim }}>
                                👤 {plan.contact}
                              </span>
                            )}
                            {plan.conversation && plan.conversation !== plan.contact && (
                              <span style={{ fontSize:10, color:C.dim }}>
                                💬 {plan.conversation}
                              </span>
                            )}
                            {plan.date && (
                              <span style={{ fontSize:10, color:C.cyan }}>
                                📅 {plan.date}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{
                          padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700,
                          border:`1px solid ${meta.color}55`,
                          background:`${meta.color}15`,
                          color: meta.color,
                          whiteSpace:"nowrap",
                          flexShrink:0,
                        }}>
                          {meta.icon} {meta.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {!plans && !loading && !error && (
          <div style={{ textAlign:"center", padding:"40px 0", color:C.dim, fontSize:12 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>💬</div>
            Hit <span style={{ color:C.purple }}>Scan Messages</span> to analyze your iMessage history<br/>and surface any plans you may have forgotten about.
          </div>
        )}
      </HUDCard>
    </>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
// ─── SQLITE-BACKED STATE ──────────────────────────────────────────────────────
// Everything logged by hand now lives in the database, not localStorage. One
// hook knows how to talk to /api/metrics; the view hooks below just declare
// which metrics they need and hand back the shape the views already expected.

const SERVER_DOWN = "Can't reach the Jarvis server. Is `npm run dev` running?";

function useMetrics(specs) {
  const [series, setSeries] = useState(() => Object.fromEntries(specs.map(s => [s.key, []])));
  const [error,  setError]  = useState(null);
  const specsRef = useRef(specs);   // callers define these at module scope; never changes

  const load = useCallback(async () => {
    try {
      const results = await Promise.all(specsRef.current.map(s =>
        fetch(`/api/metrics?metric=${s.metric}&source=manual`).then(r => r.json())
      ));
      setSeries(Object.fromEntries(specsRef.current.map((s, i) => [
        s.key,
        (results[i].rows ?? []).map(r => ({
          date: new Date(r.ts).toLocaleDateString(), val: r.value, ts: r.ts,
        })),
      ])));
      setError(null);
    } catch {
      setError(SERVER_DOWN);   // named failure, not silence
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // One timestamp for everything written together, so a night's hours and its
  // bedtime land on the same row when read back.
  const add = useCallback(async (values, ts = new Date().toISOString()) => {
    for (const s of specsRef.current) {
      if (values[s.key] == null) continue;
      const res = await fetch("/api/metrics", {
        method:  "POST",
        headers: { "Content-Type":"application/json" },
        body:    JSON.stringify({ source:"manual", metric:s.metric, value:values[s.key], unit:s.unit, ts }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Save failed");
    }
    await load();
  }, [load]);

  return { series, add, error, reload: load };
}

// ── body: weight paired with waist ──
const BODY_METRICS = [
  { key:"weight", metric:"weight_lb", unit:"lb" },
  { key:"waist",  metric:"waist_cm",  unit:"cm" },
];

function useMeasurements() {
  const { series, add, error } = useMetrics(BODY_METRICS);
  return { measurements: series, addMeasurement: add, error };
}

// ── macro history ──
// One row per day, written when the day rolls over. The UNIQUE(source, metric, ts)
// constraint means re-snapshotting the same day corrects it instead of duplicating.
const MACRO_METRICS = [
  { key:"cal",     metric:"macro_cal",     unit:"kcal" },
  { key:"protein", metric:"macro_protein", unit:"g"    },
  { key:"carbs",   metric:"macro_carbs",   unit:"g"    },
  { key:"fat",     metric:"macro_fat",     unit:"g"    },
];

// "8/22/2026" → ISO at noon UTC, so a timezone shift can't move it a day.
function localDateToISO(date) {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date ?? "");
  if (!m) return new Date(date).toISOString();
  return new Date(Date.UTC(+m[3], +m[1] - 1, +m[2], 12)).toISOString();
}

function useMacroHistory() {
  const { series, add, error } = useMetrics(MACRO_METRICS);

  // Fold the four series into the [{ date, cal, protein, carbs, fat }] the
  // Analytics view already reads.
  const byTs = new Map();
  for (const spec of MACRO_METRICS) {
    for (const row of series[spec.key]) {
      if (!byTs.has(row.ts)) byTs.set(row.ts, { date: row.date, ts: row.ts });
      byTs.get(row.ts)[spec.key] = row.val;
    }
  }
  const macroHistory = [...byTs.values()]
    .sort((a, b) => a.ts.localeCompare(b.ts))
    .map(d => ({ cal:0, protein:0, carbs:0, fat:0, ...d }));

  const snapshotMacros = useCallback(
    (date, macros) => add({
      cal:     Math.round(macros.cal),
      protein: Math.round(macros.protein),
      carbs:   Math.round(macros.carbs),
      fat:     Math.round(macros.fat),
    }, localDateToISO(date)),
    [add]
  );

  return { macroHistory, snapshotMacros, error };
}

// ── workouts ──
// These are events, not metrics: an exercise with sets, not a single number.
// The views expect [{ id, date, exercise, sets, ts }], so that's what comes back.
function useWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [error,    setError]    = useState(null);

  const load = useCallback(async () => {
    try {
      const { rows } = await fetch("/api/events?kind=workout").then(r => r.json());
      setWorkouts((rows ?? []).map(r => ({
        id:       r.id,
        date:     new Date(r.start_ts).toLocaleDateString(),
        exercise: r.title,
        sets:     r.payload?.sets ?? [],
        ts:       r.start_ts,
      })));
      setError(null);
    } catch {
      setError(SERVER_DOWN);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const logWorkout = useCallback(async ({ exercise, sets }) => {
    const ts  = new Date().toISOString();
    const res = await fetch("/api/events", {
      method:  "POST",
      headers: { "Content-Type":"application/json" },
      body:    JSON.stringify({
        source:"manual", kind:"workout", title:exercise, start_ts:ts,
        external_id:`workout:${ts}:${exercise}`, payload:{ sets },
      }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Save failed");
    await load();
  }, [load]);

  const clearDay = useCallback(async (date) => {
    const doomed = workouts.filter(w => w.date === date);
    for (const w of doomed) {
      const res = await fetch(`/api/events/${w.id}`, { method:"DELETE" });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Delete failed");
    }
    await load();
  }, [workouts, load]);

  return { workouts, logWorkout, clearDay, error };
}

// ── sleep ──
// Hours is a real metric so Oura and Whoop can write the same one later and be
// compared against it. Bedtime is stored as minutes past midnight for the same
// reason — a number is chartable, "23:30" isn't.
const SLEEP_METRICS = [
  { key:"hours",   metric:"sleep_hours", unit:"h"   },
  { key:"bedtime", metric:"bedtime_min", unit:"min" },
];

const toMinutes = (hhmm) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? "");
  return m ? (+m[1]) * 60 + (+m[2]) : null;
};
const toClock = (mins) =>
  mins == null ? "" : `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;

function useSleepLog() {
  const { series, add, error } = useMetrics(SLEEP_METRICS);

  // The views want one row per night — [{ date, hours, bedtime }] — so fold the
  // two series back together on the timestamp they were written with.
  const bedtimes = new Map(series.bedtime.map(b => [b.ts, b.val]));
  const sleep = series.hours.map(h => ({
    date:    h.date,
    hours:   h.val,
    bedtime: toClock(bedtimes.get(h.ts) ?? null),
    ts:      h.ts,
  }));

  const logSleep = useCallback(
    ({ hours, bedtime }) => add({ hours, bedtime: toMinutes(bedtime) }),
    [add]
  );

  return { sleep, logSleep, error };
}

export default function Jarvis() {
  const [tab,           setTab]          = useState("briefing");
  const [macros,        setMacros]       = useLocalStorage("jarvis_macros",       { cal:0, protein:0, carbs:0, fat:0 });
  const { macroHistory, snapshotMacros, error: macroError } = useMacroHistory();
  const [macroDate,     setMacroDate]    = useLocalStorage("jarvis_macro_date",    "");
  const { workouts, logWorkout, clearDay, error: workoutsError } = useWorkouts();
  const [briefingDate,  setBriefingDate] = useLocalStorage("jarvis_briefing_date", "");
  const { measurements, addMeasurement, error: measurementsError } = useMeasurements();
  const { sleep, logSleep, error: sleepError } = useSleepLog();
  const [hue,           setHue]          = useLocalStorage("jarvis_hue",          { connected:false, bridgeIp:"", username:"", lights:[] });
  const [coffeeOn,      setCoffeeOn]     = useLocalStorage("jarvis_coffee",       false);
  const [sceneLoading,  setSceneLoading] = useState(null);
  const [notification,  setNotification] = useState(null);

  const spotify    = useSpotify();
  const calendar   = useCalendar();
  const weather    = useWeather();
  const webhooks   = useWebhooks();
  const crypto     = useCrypto();
  const oura       = useOura();
  const speakRef   = useRef(null); // always-current speak fn for handlers defined before jarvis

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3200);
  }, []);

  // Handle OAuth callbacks on mount
  useEffect(() => {
    // ── Google Calendar: implicit flow — token in URL hash (#access_token=...) ──
    if (window.location.hash) {
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      if (accessToken) {
        window.history.replaceState({}, "", window.location.pathname);
        calendar.handleImplicitToken(accessToken, hash.get("expires_in"));
        return;
      }
    }

    // ── Spotify: PKCE code flow — code in URL query string (?code=...&state=spotify) ──
    const p = new URLSearchParams(window.location.search);
    const code  = p.get("code");
    const state = p.get("state");
    if (code && state === "spotify") {
      window.history.replaceState({}, "", window.location.pathname);
      spotify.handleCallback(code).catch(() => {});
    }
  }, []);

  // The bridge is on the LAN over plain HTTP, which a browser can't reach from
  // an HTTPS page. The server can, so the call goes through it.
  const applyScene = useCallback(async (scene) => {
    setSceneLoading(scene.id);
    try {
      if (hue.connected && hue.lights.length > 0) {
        const res = await fetch("/api/hue/state", {
          method:  "PUT",
          headers: { "Content-Type":"application/json" },
          body:    JSON.stringify({
            ip:       hue.bridgeIp,
            username: hue.username,
            lightIds: hue.lights.map(l => l.id),
            state:    { on:scene.bri>0, bri:scene.bri, ct:scene.ct, transitiontime:10 },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Bridge did not respond");

        notify(
          data.failed?.length
            ? `${scene.label} — ${data.applied} of ${data.applied + data.failed.length} lights`
            : `${scene.label} scene activated`,
          data.failed?.length ? "error" : "success"
        );
      } else {
        notify(`${scene.label} — connect Hue Bridge to control lights`, "success");
      }
    } catch (e) {
      notify(`Lights: ${e.message}`, "error");
    } finally {
      setSceneLoading(null);
    }
  }, [hue]);

  const handleAction = useCallback(async (action) => {
    switch (action.type) {
      case "lighting": {
        const s = LIGHTING_SCENES.find(x => x.id === action.scene);
        if (s) applyScene(s);
        break;
      }
      case "spotify": {
        const err = await spotify.control(action.cmd);
        if (err) notify("Spotify: " + err, "error");
        break;
      }
      case "log_macros":
        setMacros(m => ({
          cal:     m.cal     + (action.cal     || 0),
          protein: m.protein + (action.protein || 0),
          carbs:   m.carbs   + (action.carbs   || 0),
          fat:     m.fat     + (action.fat     || 0),
        }));
        notify("Macros logged by JARVIS", "success");
        break;
      case "reset_macros":
        setMacros({ cal:0, protein:0, carbs:0, fat:0 });
        break;
      case "coffee":
        setCoffeeOn(action.on);
        notify(action.on ? "☕ Coffee maker on" : "Coffee maker off", "success");
        break;
      case "webhook": {
        const result = await webhooks.trigger(action.id, {
          timestamp: new Date().toISOString(),
          context: { macros, coffeeOn },
        });
        if (result?.message) speakRef.current?.(result.message);
        else notify("Webhook triggered", "success");
        break;
      }
    }
  }, [applyScene, spotify, setMacros, setCoffeeOn, webhooks, macros, coffeeOn]);

  const jarvis = useJarvisAI({ macros, measurements, sleep, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, oura, onAction:handleAction });
  speakRef.current = jarvis.speak; // keep ref fresh every render

  // ── Auto-snapshot macros at day boundary ─────────────────────────────────────
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    if (macroDate && macroDate !== today) {
      // New day detected — write yesterday's macros to the database and reset.
      // If the write fails the day is lost, so say so rather than failing quietly.
      if (macros.cal > 0 || macros.protein > 0) {
        snapshotMacros(macroDate, macros)
          .catch(() => notify(`Couldn't save ${macroDate}'s macros to the database`, "error"));
      }
      setMacros({ cal:0, protein:0, carbs:0, fat:0 });
    }
    if (!macroDate || macroDate !== today) setMacroDate(today);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Morning briefing auto-play ─────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toLocaleDateString();
    const hour  = new Date().getHours();
    if (!jarvis.apiKey || briefingDate === today || hour >= 10 || hour < 6) return;
    setBriefingDate(today);
    const t = setTimeout(() => {
      setTab("ai");
      setTimeout(() => {
        jarvis.processCommand("Good morning. Give me a quick briefing — today's day type, my macro targets, and one priority for the day. Keep it to 2–3 sentences.");
      }, 800);
    }, 2500);
    return () => clearTimeout(t);
  }, [jarvis.apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const TABS = [
    ["briefing",      "Today",        "spark"    ],
    ["ai",            "Jarvis",       "message"  ],
    ["body",          "Body",         "scale"    ],
    ["training",      "Training",     "dumbbell" ],
    ["sleep",         "Sleep",        "moon"     ],
    ["macros",        "Macros",       "flame"    ],
    ["analytics",     "Trends",       "chart"    ],
    ["plans",         "Plans",        "calendar" ],
    ["environment",   "Devices",      "home"     ],
    ["recipes",       "Recipes",      "book"     ],
    ["integrations",  "Connections",  "plug"     ],
    ["settings",      "Settings",     "settings" ],
  ];

  const training = isTrainingDay();

  const jarvisState = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";

  // ── sliding tab indicator ───────────────────────────────────────────────────
  // Measure the active tab and move one pill to it, rather than lighting each
  // tab independently. Also scrolls the tab into view, so selecting something at
  // the edge of the strip doesn't leave it half off-screen.
  const stripRef = useRef(null);
  const tabRefs  = useRef({});
  const [indicator, setIndicator] = useState({ x: 0, w: 0 });

  useEffect(() => {
    const move = () => {
      const el = tabRefs.current[tab];
      if (!el) return;
      setIndicator({ x: el.offsetLeft, w: el.offsetWidth });
      el.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
    };
    move();

    // Re-measure when the strip resizes; label widths change with the viewport.
    const ro = new ResizeObserver(move);
    if (stripRef.current) ro.observe(stripRef.current);
    return () => ro.disconnect();
  }, [tab]);

  const booting = useBootSequence(1600);
  const drift   = useParallax(3);   // content sits on the far plane, barely moving

  // ── command palette ─────────────────────────────────────────────────────────
  const [paletteOpen, setPaletteOpen] = useState(false);
  useCommandKey(setPaletteOpen);

  // Logging from the palette writes straight to the database, from any screen.
  const runLog = useCallback(async ({ verb, value }) => {
    try {
      if (verb === "weight") { await addMeasurement({ weight: value }); notify(`Weight ${value} lb recorded`); }
      if (verb === "waist")  { await addMeasurement({ waist: value });  notify(`Waist ${value} cm recorded`); }
      if (verb === "sleep")  { await logSleep({ hours: value });        notify(`Sleep ${value} hrs recorded`); }
    } catch (e) {
      notify(e.message, "error");
    }
  }, [addMeasurement, logSleep, notify]);

  return (
    <div style={{
      minHeight:"100vh", color:C.text, position:"relative",
      background: C.bgDeep, overflowX:"hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@200;300;400;500&family=IBM+Plex+Mono:wght@300;400&display=swap" rel="stylesheet" />

      {booting && (
        <BootOverlay lines={[
          "mark 42 · initialising",
          "biometrics · linked",
          "local systems · nominal",
          "welcome back, sir",
        ]} />
      )}

      {/* The visor. Fixed to your view, not to the page. */}
      <HelmetFrame
        booting={booting}
        status={jarvisState === "idle" ? "standing by" : jarvisState}
        tone={jarvisState === "listening" ? C.red : jarvisState === "thinking" ? C.amber : C.gold}
        right={[timeStr()]}
        left={[`${[spotify.connected, calendar.connected, oura.connected, hue.connected].filter(Boolean).length} of 4 systems online`, "⌘K"]}
      />

      {notification && (
        <div style={{
          position:"fixed", bottom:38, left:"50%", zIndex:450,
          transform:"translateX(-50%)", padding:"11px 22px",
          animation:`toast-in 300ms ${MOTION.lock}`,
          background:C.bgDeep,
          border:`1px solid ${notification.type==="error" ? C.red : C.gold}`,
          color: notification.type==="error" ? C.red : C.goldBright,
          fontFamily:'"IBM Plex Mono", monospace', fontSize:11,
          letterSpacing:"0.18em", textTransform:"uppercase", whiteSpace:"nowrap",
        }}>
          {notification.msg}
        </div>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        tabs={TABS.map(([id, label]) => [id, label])}
        currentTab={tab}
        onNavigate={setTab}
        onLog={runLog}
        onAsk={q => { setTab("briefing"); jarvis.processCommand(q); }}
      />

      {/* ── RAIL — navigation at the edge of vision ── */}
      <nav className="rail no-scrollbar">
        {TABS.map(([id, label]) => (
          <button key={id}
            className={`rail-item${tab===id?" active":""}`}
            onClick={()=>setTab(id)}
          >{label}</button>
        ))}
      </nav>

      {/* Content — keyed on the tab so switching replays the stagger */}
      <div key={tab} className="hud-content"
        style={{
          padding:"132px 44px 132px", maxWidth:800,
          margin:"0 auto 0 max(196px, calc(50% - 400px))",
          position:"relative", zIndex:2,
          transform:`translate3d(${drift.x}px, ${drift.y}px, 0)`,
        }}>
        {tab==="ai"            && <JarvisAITab macros={macros} measurements={measurements} oura={oura} hue={hue} sleep={sleep} coffeeOn={coffeeOn} jarvis={jarvis} />}
        {tab==="plans"         && <PlansTab apiKey={jarvis.apiKey} />}
        {tab==="briefing"      && <BriefingTab openPalette={() => setPaletteOpen(true)} macros={macros} measurements={measurements} sleep={sleep} workouts={workouts} hue={hue} spotify={spotify} calendar={calendar} weather={weather} jarvis={jarvis} coffeeOn={coffeeOn} notify={notify} oura={oura} />}
        {tab==="macros"        && <MacrosTab macros={macros} setMacros={setMacros} notify={notify} />}
        {tab==="training"      && <TrainingTab workouts={workouts} logWorkout={logWorkout} clearDay={clearDay} error={workoutsError} notify={notify} />}
        {tab==="analytics"     && <AnalyticsTab macros={macros} macroHistory={macroHistory} measurements={measurements} sleep={sleep} />}
        {tab==="environment"   && <EnvironmentTab hue={hue} setHue={setHue} coffeeOn={coffeeOn} setCoffeeOn={setCoffeeOn} sceneLoading={sceneLoading} applyScene={applyScene} notify={notify} />}
        {tab==="recipes"       && <RecipesTab />}
        {tab==="body"          && <BodyTab measurements={measurements} addMeasurement={addMeasurement} error={measurementsError} notify={notify} />}
        {tab==="sleep"         && <SleepTab sleep={sleep} logSleep={logSleep} error={sleepError} notify={notify} oura={oura} />}
        {tab==="integrations"  && <IntegrationsTab jarvis={jarvis} spotify={spotify} calendar={calendar} crypto={crypto} webhooks={webhooks} />}
        {tab==="settings"      && <SettingsTab jarvis={jarvis} />}
      </div>

    </div>
  );
}
