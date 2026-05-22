import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

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
const C = {
  bg:         "#00060F",
  panel:      "rgba(0, 10, 26, 0.72)",
  panelSolid: "rgba(0, 10, 26, 0.96)",
  border:     "rgba(0, 200, 255, 0.13)",
  borderHi:   "rgba(0, 200, 255, 0.45)",
  borderDim:  "rgba(0, 200, 255, 0.05)",
  cyan:       "#00C8FF",
  cyanBright: "#40DFFF",
  blue:       "#0070E0",
  text:       "#C4E4FF",
  textBright: "#E8F6FF",
  dim:        "#2C5870",
  dimMid:     "#4A7D9A",
  green:      "#00FF88",
  orange:     "#FF8000",
  red:        "#FF1244",
  yellow:     "#FFD600",
  purple:     "#8855FF",
};

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

  const control = async (cmd) => {
    if (!connected) return;
    const h = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    try {
      if (cmd === "pause")   await fetch("https://api.spotify.com/v1/me/player/pause",    { method:"PUT",  headers:h });
      else if (cmd === "play")    await fetch("https://api.spotify.com/v1/me/player/play",     { method:"PUT",  headers:h });
      else if (cmd === "next")    await fetch("https://api.spotify.com/v1/me/player/next",     { method:"POST", headers:h });
      else if (cmd === "prev")    await fetch("https://api.spotify.com/v1/me/player/previous", { method:"POST", headers:h });
      else if (cmd.startsWith("play:")) {
        const q   = cmd.slice(5);
        const sr  = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track,playlist&limit=1`, { headers:h });
        const sd  = await sr.json();
        const uri = sd.playlists?.items?.[0]?.uri || sd.tracks?.items?.[0]?.uri;
        if (uri) {
          const body = uri.includes("playlist") ? { context_uri: uri } : { uris: [uri] };
          await fetch("https://api.spotify.com/v1/me/player/play", { method:"PUT", headers:h, body:JSON.stringify(body) });
        }
      }
    } catch {}
  };

  const disconnect = () => { setToken(""); setExpiry(0); setNow(null); };

  return { clientId, setClientId, connected, login, handleCallback, control, disconnect, nowPlaying: now };
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

  const login = async () => {
    if (!clientId) return;
    const v = genVerifier();
    const c = await genChallenge(v);
    localStorage.setItem("_gv",   v);
    localStorage.setItem("_gcid", clientId);
    const p = new URLSearchParams({
      client_id: clientId, redirect_uri: window.location.origin,
      response_type: "code", scope: SCOPES,
      code_challenge_method: "S256", code_challenge: c,
      access_type: "online", state: "gcal"
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  };

  const handleCallback = async (code) => {
    const v   = localStorage.getItem("_gv");
    const cid = localStorage.getItem("_gcid") || clientId;
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: cid, code_verifier: v, code,
        grant_type: "authorization_code", redirect_uri: window.location.origin
      })
    });
    const d = await r.json();
    if (d.access_token) {
      setToken(d.access_token);
      setExpiry(Date.now() + (d.expires_in || 3600) * 1000);
      localStorage.removeItem("_gv");
    }
  };

  const disconnect = () => { setToken(""); setExpiry(0); setEvents([]); };

  return { clientId, setClientId, connected, login, handleCallback, disconnect, events, fetchEvents };
}

// ─── WEATHER HOOK ──────────────────────────────────────────────────────────────
function useWeather() {
  const [data, setData] = useState(null);
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) return;
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
    }, () => {});
  }, []);

  return { data, city };
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

// ─── JARVIS AI HOOK ────────────────────────────────────────────────────────────
// ElevenLabs voice IDs — curated natural female voices
const ELEVEN_VOICES = [
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica (Australian)"     },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte (British)"      },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily (British)"           },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (American)"         },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura (American)"         },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda (Warm American)"  },
];
const DEFAULT_VOICE_ID = "cgSgspJ2msm6clMCkdW9"; // Jessica — Australian female

function useJarvisAI({ macros, measurements, sleep: sleepData, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, onAction }) {
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
      try {
        const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || DEFAULT_VOICE_ID}`, {
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

BODY: Weight: ${lw ? lw + " lbs" : "not logged"} | Waist: ${lwa ? lwa + " cm (target 81-84cm)" : "not logged"} | Avg sleep (7d): ${avgS ? avgS + " hrs" : "no data"}

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

AVAILABLE ACTIONS (append to end of response, only when taking an action):
<action>{"type":"lighting","scene":"wake|focus|training|wind_down|sleep|meal_prep"}</action>
<action>{"type":"spotify","cmd":"play|pause|next|prev|play:search query"}</action>
<action>{"type":"log_macros","cal":0,"protein":0,"carbs":0,"fat":0}</action>
<action>{"type":"reset_macros"}</action>
<action>{"type":"coffee","on":true}</action>${webhooks?.webhooks?.filter(w=>w.enabled).length ? `
<action>{"type":"webhook","id":"WEBHOOK_ID"}</action>

CUSTOM WEBHOOKS (use webhook action with the exact id when triggered):
${webhooks.webhooks.filter(w=>w.enabled).map(w=>`- id:"${w.id}" name:"${w.name}" triggers on: ${w.triggers} — ${w.description}`).join('\n')}` : ''}`;
  }, [macros, measurements, sleepData, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, memories, memoryFile]);

  const processCommand = useCallback(async (text) => {
    setThinking(true);
    setTranscript(text);
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
        body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 400, system, messages: [...recentHistory, { role:"user", content:text }] })
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
          max_tokens: 400,
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
      const isOverloaded = data?.error?.type === "overloaded_error" || data?.error?.message?.toLowerCase().includes("overloaded");
      if (isOverloaded) {
        // Instant fallback to Groq if available
        if (groqKey) { try { data = await tryGroq(); break; } catch {} }
        if (attempt < maxAttempts - 1) { await sleepMs(1000 * (attempt + 1)); continue; }
        speak("Systems are overloaded. Add a Groq key in Integrations for instant fallback."); setThinking(false); return;
      }
      break;
    }

    if (data?.error) { speak("I encountered an issue: " + (data.error.message || "unknown error.")); setThinking(false); return; }

    let txt = data?.content?.[0]?.text || "";

    // Parse action tags
    const actionMatch = txt.match(/<action>([\s\S]*?)<\/action>/);
    if (actionMatch) {
      try { onAction(JSON.parse(actionMatch[1].trim())); } catch {}
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
  }, [buildContext, apiKey, groqKey, chatHistory, setChatHistory, memoryFile, setMemoryFile, setMemoryUpdated, setMemories, onAction, speak]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { speak("Speech recognition requires Chrome or Edge."); return; }
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
function HUDCard({ title, children, accent = C.cyan, style = {}, className = "", glow = false }) {
  const corner = (pos) => {
    const sz = 20, s = { position:"absolute", width:sz, height:sz, pointerEvents:"none" };
    const b2 = `2px solid ${accent}`;
    if (pos==="tl") return {...s, top:-1, left:-1, borderTop:b2, borderLeft:b2, borderRadius:"13px 0 0 0"};
    if (pos==="tr") return {...s, top:-1, right:-1, borderTop:b2, borderRight:b2, borderRadius:"0 13px 0 0"};
    if (pos==="bl") return {...s, bottom:-1, left:-1, borderBottom:b2, borderLeft:b2, borderRadius:"0 0 0 13px"};
    return {...s, bottom:-1, right:-1, borderBottom:b2, borderRight:b2, borderRadius:"0 0 13px 0"};
  };
  return (
    <div className={`hud-card fade-in-up ${className}`} style={{
      position:"relative",
      background:"rgba(0,10,26,0.7)",
      backdropFilter:"blur(24px) saturate(160%)",
      WebkitBackdropFilter:"blur(24px) saturate(160%)",
      border:`1px solid ${accent}18`,
      borderRadius:14,
      padding:"18px 20px",
      marginBottom:14,
      boxShadow:`0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)`,
      ...style,
    }}>
      {["tl","tr","bl","br"].map(p => <div key={p} style={corner(p)} />)}
      {glow && <div style={{ position:"absolute", inset:0, borderRadius:14, background:`radial-gradient(ellipse at 50% 0%, ${accent}0A 0%, transparent 65%)`, pointerEvents:"none" }} />}
      {title && (
        <div style={{ fontSize:9, letterSpacing:"0.22em", textTransform:"uppercase", color:accent, marginBottom:14, fontWeight:700, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ width:4, height:4, borderRadius:"50%", background:accent, boxShadow:`0 0 8px ${accent}`, flexShrink:0, display:"inline-block" }} />
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

function GlowBar({ pct, color = C.cyan, height = 4 }) {
  return (
    <div style={{ width:"100%", height, background:"rgba(255,255,255,0.04)", borderRadius:height, overflow:"hidden", marginTop:10, position:"relative" }}>
      <div className="progress-bar-fill" style={{
        width:`${Math.min(100, pct || 0)}%`, height:"100%",
        background:`linear-gradient(90deg, ${color}55, ${color}CC, ${color})`,
        borderRadius:height,
        boxShadow:`0 0 10px ${color}88, 0 0 20px ${color}33`,
        transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",
        position:"relative",
      }}>
        <div style={{ position:"absolute", right:0, top:"50%", transform:"translateY(-50%)", width:3, height:"140%", background:color, borderRadius:2, boxShadow:`0 0 8px ${color}` }} />
      </div>
    </div>
  );
}

function Metric({ label, value, unit, sub, color = C.text, pct, barColor }) {
  return (
    <div style={{
      background:"rgba(0,200,255,0.03)",
      border:`1px solid ${C.borderDim}`,
      borderRadius:10, padding:"14px 16px",
      position:"relative", overflow:"hidden",
    }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg, transparent, ${color}22, transparent)` }} />
      <div style={{ fontSize:9, letterSpacing:"0.18em", color:C.dimMid, marginBottom:6, textTransform:"uppercase", fontWeight:600 }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:4 }}>
        <span className="data-num" style={{ fontSize:26, fontWeight:700, color, lineHeight:1 }}>{value}</span>
        {unit && <span style={{ fontSize:11, color:C.dimMid, marginBottom:2 }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize:11, color:C.dimMid, marginTop:4 }}>{sub}</div>}
      {pct !== undefined && <GlowBar pct={pct} color={barColor || color} />}
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

function HUDBtn({ onClick, children, variant = "default", style = {}, disabled = false }) {
  const variants = {
    primary: { bg:`linear-gradient(135deg, rgba(0,200,255,0.15), rgba(0,112,224,0.2))`, border:`1px solid ${C.cyan}55`, color:C.cyan, shadow:`0 0 20px ${C.cyan}22` },
    success: { bg:`linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,200,100,0.08))`, border:`1px solid ${C.green}55`, color:C.green, shadow:`0 0 20px ${C.green}22` },
    danger:  { bg:`linear-gradient(135deg, rgba(255,18,68,0.15), rgba(200,0,50,0.1))`,   border:`1px solid ${C.red}55`,   color:C.red,   shadow:`0 0 20px ${C.red}22`  },
    default: { bg:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)", color:C.text, shadow:"none" },
  };
  const v = variants[variant] || variants.default;
  return (
    <button className="hud-btn" onClick={onClick} disabled={disabled} style={{
      background:v.bg, border:v.border, color:v.color,
      borderRadius:8, padding:"9px 18px",
      fontSize:12, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
      letterSpacing:"0.06em", opacity:disabled?0.4:1,
      boxShadow:v.shadow, textTransform:"uppercase",
      ...style,
    }}>{children}</button>
  );
}

function HUDInput({ label, style = {}, ...props }) {
  return (
    <div style={{ marginBottom:14, ...style }}>
      {label && <div style={{ fontSize:9, letterSpacing:"0.18em", textTransform:"uppercase", color:C.dimMid, marginBottom:6, fontWeight:600 }}>{label}</div>}
      <input className="hud-input" {...props} style={{
        width:"100%",
        background:"rgba(0,200,255,0.04)",
        border:`1px solid ${C.border}`,
        borderRadius:8, padding:"10px 14px",
        color:C.text, fontSize:13, outline:"none",
        fontFamily:"inherit", boxSizing:"border-box",
        transition:"border-color 0.2s, box-shadow 0.2s",
      }} />
    </div>
  );
}

function StatusDot({ on, label }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:on ? C.green : C.dimMid, fontWeight:500, letterSpacing:"0.04em" }}>
      <span style={{
        width:7, height:7, borderRadius:"50%",
        background:on ? C.green : C.dimMid,
        boxShadow:on ? `0 0 8px ${C.green}, 0 0 16px ${C.green}55` : "none",
        flexShrink:0,
        animation:on ? "ambient-pulse 3s ease-in-out infinite" : "none",
      }} />
      {label}
    </span>
  );
}

function NowPlaying({ spotify }) {
  const np = spotify.nowPlaying;
  if (!spotify.connected || !np?.item) return null;
  const paused = !np.is_playing;
  const track = np.item;
  const art   = track?.album?.images?.[0]?.url;
  return (
    <HUDCard style={{ padding:"12px 16px", marginBottom:14, opacity: paused ? 0.75 : 1, transition:"opacity 0.3s" }} accent={paused ? C.dimMid : C.green}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {art && <img src={art} alt="" style={{ width:44, height:44, borderRadius:4, border:`1px solid ${paused ? C.dim : C.green}33`, filter: paused ? "grayscale(40%)" : "none", transition:"filter 0.3s" }} />}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{track?.name}</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>
            {track?.artists?.map(a=>a.name).join(", ")}
            {paused && <span style={{ marginLeft:8, color:C.dimMid, fontSize:10, letterSpacing:"0.1em" }}>· PAUSED</span>}
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["prev","⏮"],["play","▶"],["next","⏭"]].map(([cmd,icon]) => (
            <button key={cmd} onClick={() => spotify.control(cmd==="play"? (np.is_playing?"pause":"play") : cmd)}
              style={{ background: paused ? "rgba(255,255,255,0.04)" : "rgba(0,255,153,0.06)", border:`1px solid ${paused ? C.dim+"44" : C.green+"33"}`, borderRadius:4,
                padding:"5px 10px", color: paused ? C.dimMid : C.green, fontSize:13, cursor:"pointer", transition:"all 0.2s" }}>
              {cmd==="play" ? (np.is_playing?"⏸":"▶") : icon}
            </button>
          ))}
        </div>
      </div>
    </HUDCard>
  );
}

// ─── BRIEFING TAB ──────────────────────────────────────────────────────────────
function BriefingTab({ macros, measurements, sleep: sd, hue, spotify, calendar, weather, jarvis, coffeeOn }) {
  const [time, setTime] = useState(timeStr());
  const [cmd,  setCmd]  = useState("");

  useEffect(() => {
    const id = setInterval(() => setTime(timeStr()), 1000);
    return () => clearInterval(id);
  }, []);

  const lw    = measurements.weight.slice(-1)[0]?.val;
  const lwa   = measurements.waist.slice(-1)[0]?.val;
  const avgS  = sd.length ? (sd.slice(-7).reduce((a,b)=>a+b.hours,0)/Math.min(sd.length,7)).toFixed(1) : null;
  const calL  = Math.max(0, TARGET_CAL - macros.cal);
  const protL = Math.max(0, TARGET_PROTEIN - macros.protein);
  const ritual= getTodayRitual();
  const training = isTrainingDay();
  const voiceState = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    jarvis.processCommand(cmd.trim());
    setCmd("");
  };

  const stateColor = { idle:C.cyan, listening:C.red, thinking:C.yellow, speaking:C.green }[voiceState];
  const idleLabel  = jarvis.continuousMode ? "LISTENING CONTINUOUSLY" : "TAP TO SPEAK";
  const stateLabel = { idle:idleLabel, listening:"LISTENING", thinking:"PROCESSING", speaking:"RESPONDING" }[voiceState];

  return (
    <>
      {/* ── Voice Interface — HERO ── */}
      <div style={{
        position:"relative", marginBottom:14, overflow:"hidden",
        background:"rgba(0,8,22,0.75)",
        backdropFilter:"blur(28px) saturate(180%)",
        WebkitBackdropFilter:"blur(28px) saturate(180%)",
        border:`1px solid ${stateColor}22`,
        borderRadius:20,
        padding:"32px 24px 28px",
        boxShadow:`0 0 60px ${stateColor}0D, 0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)`,
        transition:"border-color 0.5s, box-shadow 0.5s",
        textAlign:"center",
      }}>
        {/* Corner brackets */}
        {[["tl","top","left"],["tr","top","right"],["bl","bottom","left"],["br","bottom","right"]].map(([k,v,h])=>(
          <div key={k} style={{ position:"absolute", width:24, height:24, [v]:-1, [h]:-1, pointerEvents:"none",
            [`border${v.charAt(0).toUpperCase()+v.slice(1)}`]:`2px solid ${stateColor}`,
            [`border${h.charAt(0).toUpperCase()+h.slice(1)}`]:`2px solid ${stateColor}`,
            borderRadius: k==="tl"?"20px 0 0 0":k==="tr"?"0 20px 0 0":k==="bl"?"0 0 0 20px":"0 0 20px 0",
            transition:"border-color 0.5s",
          }} />
        ))}

        {/* Top ambient glow */}
        <div style={{ position:"absolute", top:0, left:"20%", right:"20%", height:1,
          background:`linear-gradient(90deg, transparent, ${stateColor}88, transparent)`,
          boxShadow:`0 0 16px ${stateColor}66`, transition:"background 0.5s" }} />

        {/* Label */}
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:8, letterSpacing:"0.35em",
          color:stateColor, marginBottom:28, opacity:0.7, transition:"color 0.5s" }}>
          J · A · R · V · I · S
        </div>

        {/* Arc Reactor — the hero */}
        <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
          <button onClick={() => {
              if (jarvis.continuousMode) {
                // Tap exits conversation mode entirely
                jarvis.setContinuousMode(false);
                jarvis.stopListening();
              } else {
                jarvis.listening ? jarvis.stopListening() : jarvis.startListening();
              }
            }}
            style={{ background:"none", border:"none", cursor:"pointer", padding:16, borderRadius:"50%",
              transition:"transform 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
            <ArcReactor size={110} state={voiceState} />
          </button>
        </div>

        {/* State indicator */}
        <div style={{ fontFamily:"'Orbitron',monospace", fontSize:9, letterSpacing:"0.28em",
          color:stateColor, marginBottom:16, transition:"color 0.5s",
          textShadow:`0 0 16px ${stateColor}88` }}>
          {stateLabel}
        </div>

        {/* Mode toggle — Manual vs Conversation */}
        <div style={{ display:"inline-flex", borderRadius:10, overflow:"hidden",
          border:`1px solid ${C.border}`, marginBottom:20, flexShrink:0 }}>
          {[["manual","MANUAL"],["conversation","CONVERSATION"]].map(([mode, label]) => {
            const active = (mode === "conversation") === jarvis.continuousMode;
            const accent = mode === "conversation" ? C.green : C.cyan;
            return (
              <button key={mode} onClick={() => {
                const goConversation = mode === "conversation";
                jarvis.setContinuousMode(goConversation);
                // Auto-start listening when switching into conversation mode
                if (goConversation && !jarvis.listening && !jarvis.thinking && !jarvis.speaking) {
                  setTimeout(() => jarvis.startListening(), 150);
                } else if (!goConversation) {
                  jarvis.stopListening();
                }
              }} style={{
                background: active ? `${accent}1A` : "transparent",
                border: "none",
                borderRight: mode === "manual" ? `1px solid ${C.border}` : "none",
                padding:"7px 18px",
                fontSize:9, letterSpacing:"0.2em", fontFamily:"'Orbitron',monospace",
                fontWeight:600, cursor:"pointer",
                color: active ? accent : C.dimMid,
                transition:"all 0.2s",
                boxShadow: active ? `inset 0 0 12px ${accent}18` : "none",
              }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* Transcript */}
        {jarvis.transcript && (
          <div className="fade-in-up" style={{
            fontSize:13, color:C.red, marginBottom:12, fontStyle:"italic",
            opacity:0.9, letterSpacing:"0.02em",
          }}>
            "{jarvis.transcript}"
          </div>
        )}

        {/* Response */}
        {jarvis.response && (
          <div className="fade-in-up" style={{
            fontSize:15, color:C.textBright, lineHeight:1.7, marginBottom:20,
            maxWidth:520, margin:"0 auto 20px", fontWeight:400,
          }}>
            {jarvis.response}
          </div>
        )}

        {/* Text input */}
        <form onSubmit={handleSubmit} style={{ display:"flex", gap:10, maxWidth:460, margin:"0 auto" }}>
          <input className="hud-input" value={cmd} onChange={e=>setCmd(e.target.value)}
            placeholder="Type a command…"
            style={{ flex:1, background:"rgba(0,200,255,0.05)", border:`1px solid ${C.border}`,
              borderRadius:10, padding:"11px 16px", color:C.text, fontSize:13,
              outline:"none", fontFamily:"inherit", transition:"border-color 0.2s, box-shadow 0.2s" }} />
          <HUDBtn variant="primary" onClick={handleSubmit} style={{ padding:"11px 20px", borderRadius:10 }}>Send</HUDBtn>
        </form>

        {!jarvis.apiKey && (
          <div style={{ fontSize:11, color:C.orange, marginTop:16,
            padding:"8px 16px", background:"rgba(255,128,0,0.08)",
            border:`1px solid ${C.orange}33`, borderRadius:8, display:"inline-block", letterSpacing:"0.04em" }}>
            ⚠ Add your Anthropic API key in Integrations to activate
          </div>
        )}
      </div>

      {/* ── Now Playing ── */}
      <NowPlaying spotify={spotify} />

      {/* ── Ritual Banner ── */}
      {ritual && (
        <div style={{ background:"rgba(255,214,0,0.06)", border:`1px solid rgba(255,214,0,0.2)`,
          borderRadius:4, padding:"10px 16px", marginBottom:14, fontSize:14, color:C.yellow,
          display:"flex", alignItems:"center", gap:8 }}>
          {ritual}
        </div>
      )}

      {/* ── Time & Weather ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14 }}>
        <HUDCard style={{ padding:"14px 16px", marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", marginBottom:4 }}>LOCAL TIME</div>
          <div style={{ fontSize:26, fontWeight:700, color:C.cyan, letterSpacing:"0.06em", fontVariantNumeric:"tabular-nums" }}>{time}</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:3 }}>{todayStr()}</div>
        </HUDCard>
        <HUDCard style={{ padding:"14px 16px", marginBottom:0 }}>
          <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", marginBottom:4 }}>ENVIRONMENT</div>
          {weather.data
            ? <>
                <div style={{ fontSize:26, fontWeight:700, color:C.text }}>{wxEmoji(weather.data.weather_code)} {Math.round(weather.data.temperature_2m)}°F</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:3 }}>{wxDesc(weather.data.weather_code)}{weather.city ? " · "+weather.city : ""} · {weather.data.relative_humidity_2m}% RH</div>
              </>
            : <div style={{ fontSize:12, color:C.dim, marginTop:6 }}>Allow location access for weather data</div>
          }
        </HUDCard>
      </div>

      {/* ── Nutrition ── */}
      <HUDCard title="Nutrition Status">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          <Metric label="Calories" value={Math.round(macros.cal)} unit={`/ ${TARGET_CAL}`} sub={`${Math.round(calL)} remaining`}
            color={macros.cal >= TARGET_CAL ? C.orange : C.cyan} pct={macros.cal/TARGET_CAL*100} barColor={C.cyan} />
          <Metric label="Protein" value={`${Math.round(macros.protein)}g`} unit={`/ ${TARGET_PROTEIN}g`} sub={`${Math.round(protL)}g remaining`}
            color={macros.protein >= TARGET_PROTEIN ? C.orange : C.green} pct={macros.protein/TARGET_PROTEIN*100} barColor={C.green} />
        </div>
      </HUDCard>

      {/* ── Body & Recovery ── */}
      <HUDCard title="Body & Recovery">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
          <Metric label="Weight" value={lw || "—"} unit="lbs" color={C.text} />
          <Metric label="Waist" value={lwa || "—"} unit="cm" sub="Target 81-84"
            color={!lwa ? C.text : lwa <= 84 ? C.green : C.orange}
            pct={lwa ? Math.max(0, Math.min(100, (1-(lwa-83)/10)*100)) : 0}
            barColor={lwa && lwa <= 84 ? C.green : C.orange} />
          <Metric label="Avg Sleep" value={avgS || "—"} unit="hrs"
            color={!avgS ? C.text : parseFloat(avgS) >= 7 ? C.green : C.red} />
        </div>
      </HUDCard>

      {/* ── Calendar ── */}
      {calendar.connected && calendar.events.length > 0 && (
        <HUDCard title="Today's Schedule" accent={C.blue}>
          {calendar.events.map((e, i) => {
            const t = e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "All day";
            return (
              <div key={i} style={{ display:"flex", gap:14, padding:"8px 0", borderBottom: i < calendar.events.length-1 ? `1px solid ${C.borderDim}` : "none" }}>
                <div style={{ fontSize:11, color:C.blue, minWidth:52, paddingTop:1, fontVariantNumeric:"tabular-nums" }}>{t}</div>
                <div style={{ fontSize:13, color:C.text }}>{e.summary}</div>
              </div>
            );
          })}
        </HUDCard>
      )}

      {/* ── Day Protocol ── */}
      <HUDCard title={training?"⚡ Training Day Protocol":isRestDay()?"😴 Rest Day Protocol":"🏃 Active Day"}
        accent={training ? C.orange : isRestDay() ? C.purple : C.dim}>
        <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>
          {training
            ? "Prioritize compound lifts and high protein intake. Pre-workout window: 4:30–5:00 PM. Hit protein target before the session."
            : isRestDay()
            ? "Recovery and mobility focus. Light activity only. Maintain maintenance calories and hit your protein floor."
            : "Active recovery day. Light movement, steady nutrition. Push to close out your macro targets by end of day."}
        </div>
      </HUDCard>
    </>
  );
}

// ─── MACROS TAB ────────────────────────────────────────────────────────────────
function MacrosTab({ macros, setMacros, notify }) {
  const [inp, setInp] = useState({ cal:"", protein:"", carbs:"", fat:"" });

  const log = () => {
    const n = v => parseFloat(v) || 0;
    setMacros({ cal:macros.cal+n(inp.cal), protein:macros.protein+n(inp.protein), carbs:macros.carbs+n(inp.carbs), fat:macros.fat+n(inp.fat) });
    setInp({ cal:"", protein:"", carbs:"", fat:"" });
    notify("Meal logged", "success");
  };

  const reset = () => { setMacros({ cal:0, protein:0, carbs:0, fat:0 }); notify("Macros reset for new day", "success"); };

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
      const d = await fetch(`http://${ip}/api/${user}/lights`).then(r=>r.json());
      if (!d || d[0]?.error) throw new Error("auth fail");
      const lights = Object.entries(d).map(([id,l]) => ({ id, name:l.name, on:l.state.on, bri:l.state.bri }));
      setHue({ connected:true, bridgeIp:ip, username:user, lights });
      notify("Hue Bridge connected", "success");
    } catch { notify("Could not connect to Hue Bridge", "error"); }
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
            <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.5 }}>
              Find your bridge IP at <span style={{ color:C.cyan }}>discovery.meethue.com</span> and generate a username via the Hue app developer tools.
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

// ─── RECIPES TAB ───────────────────────────────────────────────────────────────
function RecipesTab() {
  const [f, setF] = useState({ search:"", meal:"all", cuisine:"all", maxCal:800 });
  const cuisines = [...new Set(RECIPES.map(r=>r.cuisine))].sort();

  const filtered = RECIPES.filter(r => {
    const mS = r.name.toLowerCase().includes(f.search.toLowerCase()) || r.tags.some(t=>t.includes(f.search.toLowerCase()));
    const mM = f.meal==="all" || r.meal.includes(parseInt(f.meal));
    const mC = f.cuisine==="all" || r.cuisine===f.cuisine;
    return mS && mM && mC && r.cal <= f.maxCal;
  });

  const sel = { background:"rgba(0,212,255,0.05)", border:`1px solid ${C.border}`, borderRadius:4, padding:"9px 12px", color:C.text, fontSize:13, outline:"none" };

  return (
    <>
      <HUDCard title={`KRANK Library — ${RECIPES.length} Recipes`}>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <input placeholder="Search recipes or tags..." value={f.search}
            onChange={e=>setF({...f,search:e.target.value})}
            style={{ width:"100%", background:"rgba(0,212,255,0.04)", border:`1px solid ${C.border}`,
              borderRadius:4, padding:"9px 12px", color:C.text, fontSize:13, outline:"none", fontFamily:"inherit" }} />
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <select style={sel} value={f.meal} onChange={e=>setF({...f,meal:e.target.value})}>
              <option value="all">All meals</option>
              {[1,2,3,4,5].map(n=><option key={n} value={n}>Meal {n}</option>)}
            </select>
            <select style={sel} value={f.cuisine} onChange={e=>setF({...f,cuisine:e.target.value})}>
              <option value="all">All cuisines</option>
              {cuisines.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize:10, color:C.dim, letterSpacing:"0.1em", marginBottom:5 }}>
              MAX CALORIES: <span style={{ color:C.cyan }}>{f.maxCal}</span>
            </div>
            <input type="range" min={100} max={800} step={50} value={f.maxCal}
              onChange={e=>setF({...f,maxCal:parseInt(e.target.value)})}
              style={{ width:"100%", accentColor:C.cyan }} />
          </div>
        </div>
      </HUDCard>

      <div style={{ fontSize:11, color:C.dim, letterSpacing:"0.1em", marginBottom:12 }}>
        {filtered.length} RECIPES SHOWN
      </div>

      {filtered.map(r => (
        <div key={r.id} style={{ background:"rgba(0,212,255,0.02)", border:`1px solid ${C.borderDim}`,
          borderRadius:4, padding:"14px 16px", marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:10, color:C.dim, fontWeight:700 }}>#{r.id}</span>
                <span style={{ fontSize:14, fontWeight:600, color:C.text }}>{r.name}</span>
              </div>
              <div style={{ fontSize:11, color:C.dim, marginBottom:8 }}>
                <span style={{ color:C.green }}>{r.protein}g P</span> · {r.carbs}g C · {r.fat}g F · {r.time}min · Meal {r.meal.join("/")}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                {r.tags.map(t => (
                  <span key={t} style={{ padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:600,
                    background:"rgba(0,212,255,0.08)", color:C.cyan, border:`1px solid ${C.border}` }}>
                    {t}
                  </span>
                ))}
                <span style={{ padding:"2px 8px", borderRadius:3, fontSize:10, fontWeight:600,
                  background:"rgba(139,92,246,0.08)", color:C.purple, border:`1px solid ${C.purple}44` }}>
                  {r.cuisine}
                </span>
              </div>
            </div>
            <div style={{ textAlign:"right", marginLeft:16 }}>
              <div style={{ fontSize:20, fontWeight:700, color:C.cyan }}>{r.cal}</div>
              <div style={{ fontSize:10, color:C.dim }}>cal</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// ─── BODY TAB ─────────────────────────────────────────────────────────────────
function BodyTab({ measurements, setMeasurements, notify }) {
  const [inp, setInp] = useState({ weight:"", waist:"" });
  const lw  = measurements.weight.slice(-1)[0]?.val;
  const lwa = measurements.waist.slice(-1)[0]?.val;

  const save = () => {
    const w = parseFloat(inp.weight), wa = parseFloat(inp.waist);
    const date = new Date().toLocaleDateString();
    const m = { ...measurements };
    if (w)  m.weight = [...measurements.weight,  { date, val:w  }].slice(-30);
    if (wa) m.waist  = [...measurements.waist,   { date, val:wa }].slice(-30);
    setMeasurements(m);
    setInp({ weight:"", waist:"" });
    notify("Measurements saved", "success");
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
        <HUDBtn variant="primary" onClick={save}>Save Measurements</HUDBtn>
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
function SleepTab({ sleep, setSleep, notify }) {
  const [inp, setInp] = useState({ hours:"", bedtime:"" });
  const avgS = sleep.length ? (sleep.slice(-7).reduce((a,b)=>a+b.hours,0)/Math.min(sleep.length,7)).toFixed(1) : null;
  const debt = avgS ? Math.max(0,(8-parseFloat(avgS))*7).toFixed(1) : null;

  const log = () => {
    const h = parseFloat(inp.hours);
    if (!h) { notify("Enter sleep hours", "error"); return; }
    setSleep([...sleep, { date:new Date().toLocaleDateString(), hours:h, bedtime:inp.bedtime }].slice(-30));
    setInp({ hours:"", bedtime:"" });
    notify("Sleep logged", "success");
  };

  return (
    <>
      <HUDCard title="Log Sleep">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
          <HUDInput label="Hours Slept" type="number" step="0.5" placeholder="7.5"
            value={inp.hours} onChange={e=>setInp({...inp,hours:e.target.value})} style={{ marginBottom:0 }} />
          <HUDInput label="Bedtime" type="time"
            value={inp.bedtime} onChange={e=>setInp({...inp,bedtime:e.target.value})} style={{ marginBottom:0 }} />
        </div>
        <HUDBtn variant="primary" onClick={log}>Log Sleep</HUDBtn>
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

  const IntCard = ({ id, icon, title, status, statusOk, children }) => (
    <div style={{ background:"rgba(0,18,42,0.7)", border:`1px solid ${statusOk ? C.cyan+"33" : C.border}`,
      borderRadius:10, marginBottom:10, overflow:"hidden", transition:"border-color 0.3s" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 16px", cursor:"pointer" }} onClick={() => toggle(id)}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:20 }}>{icon}</span>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{title}</div>
            <div style={{ fontSize:11, color:statusOk ? C.green : C.dim, marginTop:2 }}>{status}</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:statusOk ? C.green : C.dim,
            boxShadow:statusOk ? `0 0 6px ${C.green}` : "none" }} />
          <span style={{ color:C.dim, fontSize:13 }}>{open[id] ? "▲" : "▼"}</span>
        </div>
      </div>
      {open[id] && (
        <div style={{ padding:"0 16px 16px", borderTop:`1px solid ${C.borderDim}` }}>
          <div style={{ height:14 }} />
          {children}
        </div>
      )}
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
          2. Credentials → OAuth 2.0 Web app → Redirect URI: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          3. Copy Client ID below
        </div>
        <HUDInput label="Google OAuth Client ID" placeholder="your-id.apps.googleusercontent.com"
          value={calendar.clientId} onChange={e => calendar.setClientId(e.target.value)} />
        {calendar.connected
          ? <HUDBtn variant="danger" onClick={calendar.disconnect}>Disconnect</HUDBtn>
          : <HUDBtn variant="primary" onClick={calendar.login} disabled={!calendar.clientId}>Connect Calendar</HUDBtn>}
        <div style={{ fontSize:11, color:C.dim, marginTop:8 }}>Token expires in 1hr — reconnect as needed.</div>
      </IntCard>

      <IntCard id="hue" icon="💡" title="Philips Hue"
        status="Configure in Home tab"
        statusOk={false}>
        <div style={{ fontSize:12, color:C.dim, lineHeight:1.6 }}>
          Hue Bridge setup is in the <span style={{ color:C.cyan }}>Home</span> tab → scroll to Bridge Setup.
          Control lights by voice: <em>"Set lights to focus"</em>, <em>"Wind down mode"</em>, etc.
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
            <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{Math.floor(jarvis.chatHistory.length / 2)} exchanges stored · last 10 sent with every command</div>
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
function SettingsTab({ jarvis, spotify, calendar, webhooks }) {
  return (
    <IntegrationsTab jarvis={jarvis} spotify={spotify} calendar={calendar}
      crypto={{ enabled:false, setEnabled:()=>{}, prices:null }} webhooks={webhooks} />
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

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Jarvis() {
  const [tab,           setTab]          = useState("briefing");
  const [macros,        setMacros]       = useLocalStorage("jarvis_macros",       { cal:0, protein:0, carbs:0, fat:0 });
  const [measurements,  setMeasurements] = useLocalStorage("jarvis_measurements", { weight:[], waist:[] });
  const [sleep,         setSleep]        = useLocalStorage("jarvis_sleep",        []);
  const [hue,           setHue]          = useLocalStorage("jarvis_hue",          { connected:false, bridgeIp:"", username:"", lights:[] });
  const [coffeeOn,      setCoffeeOn]     = useLocalStorage("jarvis_coffee",       false);
  const [sceneLoading,  setSceneLoading] = useState(null);
  const [notification,  setNotification] = useState(null);

  const spotify  = useSpotify();
  const calendar = useCalendar();
  const weather  = useWeather();
  const webhooks = useWebhooks();
  const crypto   = useCrypto();

  const notify = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3200);
  }, []);

  // Handle OAuth callbacks on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const code  = p.get("code");
    const state = p.get("state");
    if (code && state) {
      window.history.replaceState({}, "", window.location.pathname);
      if (state === "spotify") spotify.handleCallback(code).catch(()=>{});
      if (state === "gcal")    calendar.handleCallback(code).catch(()=>{});
    }
  }, []);

  const callHueApi = async (path, method = "GET", body = null) => {
    if (!hue.bridgeIp || !hue.username) return null;
    const opts = { method, headers: { "Content-Type":"application/json" } };
    if (body) opts.body = JSON.stringify(body);
    try { return await fetch(`http://${hue.bridgeIp}/api/${hue.username}${path}`, opts).then(r=>r.json()); }
    catch { return null; }
  };

  const applyScene = useCallback(async (scene) => {
    setSceneLoading(scene.id);
    if (hue.connected && hue.lights.length > 0) {
      await Promise.all(hue.lights.map(l =>
        callHueApi(`/lights/${l.id}/state`, "PUT", { on:scene.bri>0, bri:scene.bri, ct:scene.ct, transitiontime:10 })
      ));
      notify(`${scene.label} scene activated`, "success");
    } else {
      await new Promise(r => setTimeout(r, 500));
      notify(`${scene.label} — connect Hue Bridge to control lights`, "success");
    }
    setSceneLoading(null);
  }, [hue]);

  const handleAction = useCallback(async (action) => {
    switch (action.type) {
      case "lighting": {
        const s = LIGHTING_SCENES.find(x => x.id === action.scene);
        if (s) applyScene(s);
        break;
      }
      case "spotify":
        spotify.control(action.cmd);
        break;
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
        if (result?.message) jarvis?.speak(result.message);
        else notify("Webhook triggered", "success");
        break;
      }
    }
  }, [applyScene, spotify, setMacros, setCoffeeOn, webhooks, macros, coffeeOn]);

  const jarvis = useJarvisAI({ macros, measurements, sleep, hue, spotify, calendar, weather, coffeeOn, webhooks, crypto, onAction:handleAction });

  const TABS = [
    ["briefing",      "Briefing"      ],
    ["macros",        "Macros"        ],
    ["environment",   "Home"          ],
    ["recipes",       "Recipes"       ],
    ["body",          "Body"          ],
    ["sleep",         "Sleep"         ],
    ["integrations",  "Integrations"  ],
  ];

  const training = isTrainingDay();

  const jarvisState = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";

  return (
    <div style={{ fontFamily:"'DM Sans','SF Pro Display',system-ui,sans-serif", minHeight:"100vh", color:C.text, position:"relative",
      background:`radial-gradient(ellipse 110% 55% at 50% -5%, rgba(0,90,200,0.16) 0%, transparent 65%), radial-gradient(ellipse 70% 50% at 95% 100%, rgba(0,40,100,0.18) 0%, transparent 60%), ${C.bg}` }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Orbitron:wght@400;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Layered HUD atmosphere */}
      <div className="hud-grid" />
      <div className="hud-scanlines" />
      <div className="hud-scan-beam" />

      {/* Toast */}
      {notification && (
        <div style={{
          position:"fixed", bottom:90, left:"50%", transform:"translateX(-50%)",
          padding:"11px 24px", borderRadius:10, fontSize:12, fontWeight:600, zIndex:300,
          whiteSpace:"nowrap", animation:"notification-in 0.3s ease",
          backdropFilter:"blur(20px)",
          background: notification.type==="error" ? "rgba(255,18,68,0.18)" : "rgba(0,255,136,0.1)",
          border: `1px solid ${notification.type==="error" ? C.red+"66" : C.green+"55"}`,
          color: notification.type==="error" ? C.red : C.green,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${notification.type==="error" ? C.red : C.green}22`,
          letterSpacing:"0.04em",
        }}>
          {notification.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(0,5,15,0.88)",
        backdropFilter:"blur(28px) saturate(160%)",
        WebkitBackdropFilter:"blur(28px) saturate(160%)",
        borderBottom:`1px solid rgba(0,200,255,0.08)`,
        boxShadow:"0 1px 0 rgba(0,200,255,0.05), 0 8px 32px rgba(0,0,0,0.4)",
      }}>
        {/* Subtle top accent line */}
        <div style={{ height:1, background:`linear-gradient(90deg, transparent 0%, ${C.cyan}55 30%, ${C.cyan}99 50%, ${C.cyan}55 70%, transparent 100%)`, boxShadow:`0 0 12px ${C.cyan}44` }} />

        <div style={{ padding:"10px 20px 0", maxWidth:760, margin:"0 auto" }}>
          {/* Top row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            {/* Logo + reactor */}
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <ArcReactor size={40} state={jarvisState} />
              <div>
                <div style={{ fontFamily:"'Orbitron',monospace", fontSize:13, letterSpacing:"0.3em", color:C.cyan, fontWeight:700,
                  textShadow:`0 0 20px ${C.cyan}88, 0 0 40px ${C.cyan}44` }}>
                  J.A.R.V.I.S
                </div>
                <div style={{ fontSize:10, color:C.dimMid, letterSpacing:"0.08em", marginTop:1 }}>Just A Rather Very Intelligent System</div>
              </div>
            </div>

            {/* Right status */}
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, letterSpacing:"0.12em", fontWeight:700, fontFamily:"'Orbitron',monospace",
                color: training ? C.orange : isRestDay() ? C.purple : C.green,
                textShadow:`0 0 12px currentColor`,
                marginBottom:6,
              }}>
                {training ? "⚡ TRAINING DAY" : isRestDay() ? "◐ REST DAY" : "● ACTIVE DAY"}
              </div>
              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <StatusDot on={spotify.connected}  label="Spotify"  />
                <StatusDot on={calendar.connected} label="Cal"      />
                <StatusDot on={hue.connected}      label="Hue"      />
              </div>
            </div>
          </div>

          {/* Status pills */}
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[
              { label:`${Math.round(TARGET_CAL - macros.cal)} kcal`, color: macros.cal >= TARGET_CAL ? C.orange : C.cyan },
              { label:`${Math.round(TARGET_PROTEIN - macros.protein)}g protein`, color: macros.protein >= TARGET_PROTEIN ? C.orange : C.green },
              weather.data && { label:`${Math.round(weather.data.temperature_2m)}° ${wxEmoji(weather.data.weather_code)}`, color:C.blue },
              { label: new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}), color:C.dimMid },
            ].filter(Boolean).map((p, i) => (
              <span key={i} style={{
                padding:"4px 12px", borderRadius:20, fontSize:10, fontWeight:600,
                background:`${p.color}12`, color:p.color,
                border:`1px solid ${p.color}30`,
                letterSpacing:"0.06em",
                boxShadow:`inset 0 1px 0 ${p.color}15`,
              }}>{p.label}</span>
            ))}
          </div>

          {/* Tab bar */}
          <div style={{ display:"flex", gap:0, overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(([id, label]) => (
              <button key={id} className={`tab-btn${tab===id?" active":""}`} onClick={()=>setTab(id)} style={{
                padding:"10px 14px", fontSize:11, fontWeight: tab===id ? 700 : 500,
                color: tab===id ? C.cyan : C.dimMid,
                background:"none", border:"none",
                cursor:"pointer", whiteSpace:"nowrap",
                letterSpacing:"0.1em", textTransform:"uppercase",
                textShadow: tab===id ? `0 0 12px ${C.cyan}` : "none",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"24px 20px 120px", maxWidth:760, margin:"0 auto", position:"relative", zIndex:1 }}>
        {tab==="briefing"      && <BriefingTab macros={macros} measurements={measurements} sleep={sleep} hue={hue} spotify={spotify} calendar={calendar} weather={weather} jarvis={jarvis} coffeeOn={coffeeOn} notify={notify} />}
        {tab==="macros"        && <MacrosTab macros={macros} setMacros={setMacros} notify={notify} />}
        {tab==="environment"   && <EnvironmentTab hue={hue} setHue={setHue} coffeeOn={coffeeOn} setCoffeeOn={setCoffeeOn} sceneLoading={sceneLoading} applyScene={applyScene} notify={notify} />}
        {tab==="recipes"       && <RecipesTab />}
        {tab==="body"          && <BodyTab measurements={measurements} setMeasurements={setMeasurements} notify={notify} />}
        {tab==="sleep"         && <SleepTab sleep={sleep} setSleep={setSleep} notify={notify} />}
        {tab==="integrations"  && <IntegrationsTab jarvis={jarvis} spotify={spotify} calendar={calendar} crypto={crypto} webhooks={webhooks} />}
      </div>

      {/* Floating orb */}
      {tab !== "briefing" && <FloatingOrb jarvis={jarvis} />}
    </div>
  );
}
