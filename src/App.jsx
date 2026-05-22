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
  bg:        "#000814",
  panel:     "rgba(0, 18, 42, 0.92)",
  border:    "rgba(0, 212, 255, 0.18)",
  borderDim: "rgba(0, 212, 255, 0.07)",
  cyan:      "#00d4ff",
  blue:      "#0096ff",
  text:      "#c8e8ff",
  dim:       "#3d6275",
  green:     "#00ff99",
  orange:    "#ff8c00",
  red:       "#ff2255",
  yellow:    "#ffd600",
  purple:    "#8b5cf6",
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

function useJarvisAI({ macros, measurements, sleep: sleepData, hue, spotify, calendar, weather, coffeeOn, onAction }) {
  const [listening,  setListening]  = useState(false);
  const [thinking,   setThinking]   = useState(false);
  const [speaking,   setSpeaking]   = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response,   setResponse]   = useState("");
  const [apiKey,     setApiKey]     = useLocalStorage("jarvis_api_key", "");
  const [elevenKey,  setElevenKey]  = useLocalStorage("jarvis_eleven_key", "");
  const [voiceId,    setVoiceId]    = useLocalStorage("jarvis_voice_id", DEFAULT_VOICE_ID);
  const recogRef  = useRef(null);
  const audioRef  = useRef(null);

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
        audio.onended = () => { setSpeaking(false); audioRef.current = null; };
        audio.onerror = () => { setSpeaking(false); audioRef.current = null; };
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
    u.onend   = () => setSpeaking(false);
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

ENVIRONMENT: Hue ${hue.connected ? "connected (" + hue.lights.length + " lights)" : "disconnected"} | Coffee: ${coffeeOn ? "on" : "off"} | Weather: ${weather.data ? Math.round(weather.data.temperature_2m) + "°F " + wxDesc(weather.data.weather_code) + (weather.city ? " in " + weather.city : "") : "unavailable"}

SPOTIFY: ${np?.is_playing ? `Playing "${np.item?.name}" by ${np.item?.artists?.[0]?.name}` : spotify.connected ? "Connected, nothing playing" : "Not connected"}

CALENDAR: ${calendar.events?.length ? calendar.events.map(e => e.summary + (e.start?.dateTime ? " at " + new Date(e.start.dateTime).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"}) : "")).join("; ") : "No events today"}

AVAILABLE ACTIONS (append to end of response, only when taking an action):
<action>{"type":"lighting","scene":"wake|focus|training|wind_down|sleep|meal_prep"}</action>
<action>{"type":"spotify","cmd":"play|pause|next|prev|play:search query"}</action>
<action>{"type":"log_macros","cal":0,"protein":0,"carbs":0,"fat":0}</action>
<action>{"type":"reset_macros"}</action>
<action>{"type":"coffee","on":true}</action>`;
  }, [macros, measurements, sleepData, hue, spotify, calendar, weather, coffeeOn]);

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
        body: JSON.stringify({ model: "claude-3-5-haiku-20241022", max_tokens: 400, system, messages: [{ role:"user", content:text }] })
      });
      return r.json();
    };

    const callProxy = async () => {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey || undefined, system, messages: [{ role:"user", content:text }] })
      });
      if (r.status === 404) return tryDirect();
      return r.json();
    };

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    let data;
    const maxAttempts = 5;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        data = await callProxy();
      } catch {
        try { data = await tryDirect(); }
        catch { speak("I can't reach my processing core. Please add your Anthropic API key in Settings."); setThinking(false); return; }
      }
      const isOverloaded = data?.error?.type === "overloaded_error" || data?.error?.message?.toLowerCase().includes("overloaded");
      if (isOverloaded) {
        if (attempt < maxAttempts - 1) { await sleep(Math.min(1000 * Math.pow(2, attempt), 8000)); continue; }
        speak("Still overloaded after several retries. Give it a few seconds and try again."); setThinking(false); return;
      }
      break;
    }

    if (data?.error) { speak("I encountered an issue: " + (data.error.message || "unknown error.")); setThinking(false); return; }

    let txt = data?.content?.[0]?.text || "";
    const match = txt.match(/<action>([\s\S]*?)<\/action>/);
    if (match) {
      try { onAction(JSON.parse(match[1].trim())); } catch {}
      txt = txt.replace(/<action>[\s\S]*?<\/action>/, "").trim();
    }
    speak(txt);
    setThinking(false);
  }, [buildContext, apiKey, onAction, speak]);

  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { speak("Speech recognition requires Chrome or Edge."); return; }
    if (recogRef.current) recogRef.current.abort();
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = false;
    r.onstart  = () => setListening(true);
    r.onresult = (e) => { setListening(false); processCommand(e.results[0][0].transcript); };
    r.onend    = () => setListening(false);
    r.onerror  = () => setListening(false);
    recogRef.current = r;
    r.start();
  }, [processCommand, speak]);

  const stopListening = useCallback(() => {
    recogRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, thinking, speaking, transcript, response, startListening, stopListening, speak, processCommand, apiKey, setApiKey, elevenKey, setElevenKey, voiceId, setVoiceId };
}

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────────
function HUDCard({ title, children, accent = C.cyan, style = {}, className = "" }) {
  const b = (t, r, bo, l) => ({
    position:"absolute", width:10, height:10, borderColor:accent, borderStyle:"solid", borderWidth:0,
    ...(t  !== undefined && { top:-1,    borderTopWidth:2    }),
    ...(bo !== undefined && { bottom:-1, borderBottomWidth:2 }),
    ...(l  !== undefined && { left:-1,   borderLeftWidth:2   }),
    ...(r  !== undefined && { right:-1,  borderRightWidth:2  }),
    opacity: 0.75,
  });
  return (
    <div className={`fade-in ${className}`} style={{ position:"relative", background:C.panel, border:`1px solid ${accent}18`, borderRadius:3, padding:"16px 20px", marginBottom:14, ...style }}>
      <div style={b(0,undefined,undefined,0)} />
      <div style={b(0,0,undefined,undefined)} />
      <div style={b(undefined,undefined,0,0)} />
      <div style={b(undefined,0,0,undefined)} />
      {title && <div style={{ fontSize:10, letterSpacing:"0.15em", textTransform:"uppercase", color:accent, marginBottom:14, fontWeight:700, opacity:0.9 }}>◆ {title}</div>}
      {children}
    </div>
  );
}

function GlowBar({ pct, color = C.cyan, height = 3 }) {
  return (
    <div style={{ width:"100%", height, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden", marginTop:8 }}>
      <div className="progress-bar-fill" style={{
        width:`${Math.min(100, pct || 0)}%`, height:"100%",
        background:`linear-gradient(90deg, ${color}77, ${color})`,
        borderRadius:2, boxShadow:`0 0 6px ${color}88`, transition:"width 1s ease"
      }} />
    </div>
  );
}

function Metric({ label, value, unit, sub, color = C.text, pct, barColor }) {
  return (
    <div style={{ background:"rgba(0,212,255,0.02)", border:`1px solid ${C.borderDim}`, borderRadius:4, padding:"12px 14px" }}>
      <div style={{ fontSize:10, letterSpacing:"0.12em", color:C.dim, marginBottom:5, textTransform:"uppercase" }}>{label}</div>
      <div style={{ display:"flex", alignItems:"baseline", gap:3 }}>
        <span style={{ fontSize:22, fontWeight:700, color, letterSpacing:"-0.02em", fontVariantNumeric:"tabular-nums" }}>{value}</span>
        {unit && <span style={{ fontSize:11, color:C.dim }}>{unit}</span>}
      </div>
      {sub && <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{sub}</div>}
      {pct !== undefined && <GlowBar pct={pct} color={barColor || color} />}
    </div>
  );
}

function ArcReactor({ size = 60, state = "idle" }) {
  const col = { idle:"#00d4ff", listening:"#ff2255", thinking:"#ffd600", speaking:"#00ff99" }[state] || C.cyan;
  const spin    = state === "thinking";
  const pulseR  = state === "idle" || state === "speaking";
  const pulseC  = state === "idle" || state === "speaking";
  const isListen= state === "listening";
  return (
    <div style={{ width:size, height:size, position:"relative" }}>
      {isListen && [1,2,3].map(i => (
        <div key={i} style={{
          position:"absolute", inset: -i*14,
          border:`1px solid ${col}`, borderRadius:"50%",
          animation:`ripple ${0.9+i*0.35}s ease-out infinite`,
          animationDelay:`${i*0.18}s`, opacity:0.4, pointerEvents:"none"
        }} />
      ))}
      <div className={spin ? "arc-spin" : pulseR ? "arc-pulse-ring" : ""}
        style={{ position:"absolute", inset:0, border:`2px solid ${col}`, borderRadius:"50%", boxShadow:`0 0 10px ${col}55` }} />
      <div style={{ position:"absolute", inset:8, border:`1px solid ${col}44`, borderRadius:"50%" }} />
      <div style={{ position:"absolute", inset:14, border:`1px solid ${col}22`, borderRadius:"50%" }} />
      <div className={pulseC ? "arc-core-pulse" : ""}
        style={{
          position:"absolute", inset:20,
          background:`radial-gradient(circle, ${col}, ${col}99)`,
          borderRadius:"50%", boxShadow:`0 0 12px ${col}, 0 0 25px ${col}66`
        }} />
    </div>
  );
}

function HUDBtn({ onClick, children, variant = "default", style = {}, disabled = false }) {
  const bg = {
    primary: `linear-gradient(135deg, ${C.cyan}22, ${C.blue}33)`,
    success: `linear-gradient(135deg, ${C.green}22, ${C.green}11)`,
    danger:  `linear-gradient(135deg, ${C.red}22, ${C.red}11)`,
    default: "rgba(255,255,255,0.04)",
  }[variant];
  const border = {
    primary: `1px solid ${C.cyan}55`,
    success: `1px solid ${C.green}55`,
    danger:  `1px solid ${C.red}55`,
    default: `1px solid rgba(255,255,255,0.1)`,
  }[variant];
  const color = {
    primary: C.cyan,
    success: C.green,
    danger:  C.red,
    default: C.text,
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:bg, border, color, borderRadius:4, padding:"9px 16px",
      fontSize:13, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
      letterSpacing:"0.04em", transition:"all 0.15s", opacity:disabled?0.5:1,
      boxShadow:variant!=="default"?`0 0 12px ${color}22`:"none",
      ...style
    }}>{children}</button>
  );
}

function HUDInput({ label, style = {}, ...props }) {
  return (
    <div style={{ marginBottom:12, ...style }}>
      {label && <div style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:C.dim, marginBottom:5 }}>{label}</div>}
      <input {...props} style={{
        width:"100%", background:"rgba(0,212,255,0.04)", border:`1px solid ${C.border}`,
        borderRadius:4, padding:"9px 12px", color:C.text, fontSize:13, outline:"none",
        fontFamily:"inherit", boxSizing:"border-box"
      }} />
    </div>
  );
}

function StatusDot({ on, label }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:12, color: on ? C.green : C.dim }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background: on ? C.green : C.dim,
        boxShadow: on ? `0 0 6px ${C.green}` : "none" }} />
      {label}
    </span>
  );
}

function NowPlaying({ spotify }) {
  const np = spotify.nowPlaying;
  if (!spotify.connected || !np?.is_playing) return null;
  const track = np.item;
  const art   = track?.album?.images?.[0]?.url;
  return (
    <HUDCard style={{ padding:"12px 16px", marginBottom:14 }} accent={C.green}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        {art && <img src={art} alt="" style={{ width:44, height:44, borderRadius:4, border:`1px solid ${C.green}33` }} />}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{track?.name}</div>
          <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{track?.artists?.map(a=>a.name).join(", ")}</div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {[["prev","⏮"],["play","▶"],["next","⏭"]].map(([cmd,icon]) => (
            <button key={cmd} onClick={() => spotify.control(cmd==="play"? (np.is_playing?"pause":"play") : cmd)}
              style={{ background:"rgba(0,255,153,0.06)", border:`1px solid ${C.green}33`, borderRadius:4,
                padding:"5px 10px", color:C.green, fontSize:13, cursor:"pointer" }}>
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

  return (
    <>
      {/* ── Voice Interface ── */}
      <HUDCard style={{ textAlign:"center", padding:"28px 20px" }}>
        <div style={{ fontSize:10, letterSpacing:"0.2em", color:C.dim, marginBottom:16 }}>J.A.R.V.I.S  INTERFACE</div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
          <button onClick={jarvis.listening ? jarvis.stopListening : jarvis.startListening}
            style={{ background:"none", border:"none", cursor:"pointer", padding:12 }}>
            <ArcReactor size={90} state={voiceState} />
          </button>
        </div>

        {jarvis.transcript && (
          <div className="fade-in-up" style={{ fontSize:13, color:"#ff7799", marginBottom:10, fontStyle:"italic", letterSpacing:"0.01em" }}>
            "{jarvis.transcript}"
          </div>
        )}
        {jarvis.response && (
          <div className="fade-in-up" style={{ fontSize:14, color:C.text, lineHeight:1.65, marginBottom:14, maxWidth:480, margin:"0 auto 14px" }}>
            {jarvis.response}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display:"flex", gap:8, maxWidth:420, margin:"0 auto" }}>
          <input value={cmd} onChange={e=>setCmd(e.target.value)}
            placeholder="Type a command, or tap the reactor to speak..."
            style={{ flex:1, background:"rgba(0,212,255,0.04)", border:`1px solid ${C.border}`,
              borderRadius:4, padding:"9px 13px", color:C.text, fontSize:13, outline:"none", fontFamily:"inherit" }} />
          <HUDBtn variant="primary" onClick={handleSubmit} style={{ padding:"9px 14px" }}>Send</HUDBtn>
        </form>

        <div style={{ fontSize:10, letterSpacing:"0.14em", color:C.dim, marginTop:12 }}>
          {voiceState==="listening"?"● LISTENING — speak now"
           :voiceState==="thinking"?"◆ PROCESSING..."
           :voiceState==="speaking"?"▶ RESPONDING"
           :"TAP REACTOR · TYPE · OR SPEAK A COMMAND"}
        </div>

        {!jarvis.apiKey && (
          <div style={{ fontSize:11, color:C.orange, marginTop:12, padding:"7px 14px",
            background:"rgba(255,140,0,0.07)", border:`1px solid ${C.orange}33`, borderRadius:4, display:"inline-block" }}>
            ⚠ Anthropic API key required — configure in Settings
          </div>
        )}
      </HUDCard>

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

// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab({ jarvis, spotify, calendar }) {
  const [show, setShow] = useState({ claude:false, eleven:false, spotify:false, gcal:false });
  const toggle = k => setShow(s => ({ ...s, [k]:!s[k] }));

  const Section = ({ id, title, status, children }) => (
    <HUDCard style={{ marginBottom:10 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer" }}
        onClick={()=>toggle(id)}>
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:C.text }}>{title}</div>
          <div style={{ fontSize:11, color:status.ok?C.green:C.dim, marginTop:2 }}>{status.label}</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <StatusDot on={status.ok} label="" />
          <span style={{ color:C.dim, fontSize:16 }}>{show[id]?"▲":"▼"}</span>
        </div>
      </div>
      {show[id] && <div style={{ marginTop:16, borderTop:`1px solid ${C.borderDim}`, paddingTop:16 }}>{children}</div>}
    </HUDCard>
  );

  return (
    <>
      <div style={{ fontSize:10, letterSpacing:"0.15em", color:C.dim, marginBottom:16 }}>◆ SYSTEM CONFIGURATION</div>

      {/* Claude / AI */}
      <Section id="claude" title="Claude AI Brain"
        status={{ ok:!!jarvis.apiKey, label:jarvis.apiKey?"API key configured":"API key required for voice commands" }}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          Get your API key at <span style={{ color:C.cyan }}>console.anthropic.com</span> → API Keys.<br/>
          For Vercel production, set <span style={{ color:C.cyan }}>ANTHROPIC_API_KEY</span> as an environment variable in your Vercel project settings.<br/>
          For local dev, enter your key below — it's sent directly to Anthropic's API.
        </div>
        <HUDInput label="Anthropic API Key" type="password" placeholder="sk-ant-..."
          value={jarvis.apiKey} onChange={e=>jarvis.setApiKey(e.target.value)} />
        <div style={{ fontSize:11, color:C.dim, marginTop:-6 }}>Stored in localStorage. Never logged or sent anywhere except Anthropic.</div>
      </Section>

      {/* ElevenLabs Voice */}
      <Section id="eleven" title="ElevenLabs Voice (Premium TTS)"
        status={{ ok:!!jarvis.elevenKey, label:jarvis.elevenKey?"Human-quality voice active":"Using browser TTS (robotic) — add key for real voice" }}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          Get a free API key at <span style={{ color:C.cyan }}>elevenlabs.io</span> → Profile → API Key.<br/>
          Free tier gives 10,000 characters/month — plenty for daily use.<br/>
          Jessica is the default: Australian female, calm and natural.
        </div>
        <HUDInput label="ElevenLabs API Key" type="password" placeholder="your-elevenlabs-api-key"
          value={jarvis.elevenKey} onChange={e=>jarvis.setElevenKey(e.target.value)} />
        <div style={{ fontSize:12, color:C.dim, marginBottom:8, marginTop:4 }}>Voice Selection</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
          {ELEVEN_VOICES.map(v => (
            <button key={v.id} onClick={()=>jarvis.setVoiceId(v.id)}
              style={{
                padding:"10px 12px", border:`1px solid ${jarvis.voiceId===v.id?C.cyan:C.border}`,
                background: jarvis.voiceId===v.id ? "rgba(0,212,255,0.12)" : "rgba(0,18,42,0.6)",
                color: jarvis.voiceId===v.id ? C.cyan : C.text,
                borderRadius:6, cursor:"pointer", textAlign:"left", fontSize:12,
                transition:"all 0.2s",
              }}>
              {jarvis.voiceId===v.id && <span style={{ marginRight:6 }}>●</span>}
              {v.name}
            </button>
          ))}
        </div>
        <div style={{ fontSize:11, color:C.dim }}>API key stored in localStorage only. Falls back to browser TTS if key is missing or request fails.</div>
      </Section>

      {/* Spotify */}
      <Section id="spotify" title="Spotify"
        status={{ ok:spotify.connected, label:spotify.connected?"Connected":"Not connected" }}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          1. Go to <span style={{ color:C.cyan }}>developer.spotify.com/dashboard</span><br/>
          2. Create an app → Settings → Add redirect URI: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          3. Copy the Client ID and paste below
        </div>
        <HUDInput label="Spotify Client ID" placeholder="your-spotify-client-id"
          value={spotify.clientId} onChange={e=>spotify.setClientId(e.target.value)} />
        {spotify.connected
          ? <div style={{ display:"flex", gap:8 }}>
              <HUDBtn variant="danger" onClick={spotify.disconnect}>Disconnect Spotify</HUDBtn>
            </div>
          : <HUDBtn variant="primary" onClick={spotify.login} disabled={!spotify.clientId}>Connect Spotify</HUDBtn>
        }
      </Section>

      {/* Google Calendar */}
      <Section id="gcal" title="Google Calendar"
        status={{ ok:calendar.connected, label:calendar.connected?"Connected":"Not connected" }}>
        <div style={{ fontSize:12, color:C.dim, marginBottom:14, lineHeight:1.6 }}>
          1. Go to <span style={{ color:C.cyan }}>console.cloud.google.com</span> → Create project<br/>
          2. Enable <strong style={{ color:C.text }}>Google Calendar API</strong><br/>
          3. OAuth consent screen → External → Add your email as test user<br/>
          4. Credentials → Create → Web application<br/>
          5. Add redirect URI: <span style={{ color:C.cyan }}>{window.location.origin}</span><br/>
          6. Copy Client ID below — no secret needed
        </div>
        <HUDInput label="Google OAuth Client ID" placeholder="your-client-id.apps.googleusercontent.com"
          value={calendar.clientId} onChange={e=>calendar.setClientId(e.target.value)} />
        {calendar.connected
          ? <HUDBtn variant="danger" onClick={calendar.disconnect}>Disconnect Calendar</HUDBtn>
          : <HUDBtn variant="primary" onClick={calendar.login} disabled={!calendar.clientId}>Connect Google Calendar</HUDBtn>
        }
        <div style={{ fontSize:11, color:C.dim, marginTop:10 }}>Token expires in 1 hour — reconnect as needed.</div>
      </Section>

      {/* About */}
      <HUDCard title="System Info">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {[
            ["AI Model",      "Claude Haiku"],
            ["Voice STT",     "Web Speech API"],
            ["Voice TTS",     jarvis.elevenKey?"ElevenLabs ●":"Browser TTS ○"],
            ["Weather",       "Open-Meteo"],
            ["Music",         spotify.connected?"Spotify ●":"Spotify ○"],
            ["Calendar",      calendar.connected?"Google ●":"Google ○"],
          ].map(([k,v]) => (
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

// ─── FLOATING ORB ─────────────────────────────────────────────────────────────
function FloatingOrb({ jarvis }) {
  const state = jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle";
  return (
    <div style={{ position:"fixed", bottom:20, right:20, zIndex:200 }}>
      <button onClick={jarvis.listening ? jarvis.stopListening : jarvis.startListening}
        style={{ background:"none", border:"none", cursor:"pointer", padding:0, display:"block" }}
        title="Talk to JARVIS">
        <ArcReactor size={48} state={state} />
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
    }
  }, [applyScene, spotify, setMacros, setCoffeeOn]);

  const jarvis = useJarvisAI({ macros, measurements, sleep, hue, spotify, calendar, weather, coffeeOn, onAction:handleAction });

  const TABS = [
    ["briefing",    "Briefing"  ],
    ["macros",      "Macros"    ],
    ["environment", "Home"      ],
    ["recipes",     "Recipes"   ],
    ["body",        "Body"      ],
    ["sleep",       "Sleep"     ],
    ["settings",    "Settings"  ],
  ];

  const training = isTrainingDay();

  return (
    <div style={{ fontFamily:"'DM Sans','SF Pro Display',system-ui,sans-serif", minHeight:"100vh", background:C.bg, color:C.text }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* HUD visual effects */}
      <div className="hud-scanlines" />
      <div className="hud-scan-beam" />

      {/* Toast notification */}
      {notification && (
        <div style={{
          position:"fixed", bottom:80, left:"50%", transform:"translateX(-50%)",
          padding:"10px 20px", borderRadius:6, fontSize:13, fontWeight:600, zIndex:300,
          whiteSpace:"nowrap", animation:"notification-in 0.3s ease",
          background: notification.type==="error" ? "rgba(255,34,85,0.15)" : "rgba(0,255,153,0.1)",
          border: `1px solid ${notification.type==="error" ? C.red+"55" : C.green+"55"}`,
          color: notification.type==="error" ? C.red : C.green,
          boxShadow: `0 0 20px ${notification.type==="error" ? C.red : C.green}22`,
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom:`1px solid ${C.borderDim}`, background:"rgba(0,8,20,0.97)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ padding:"12px 20px 0", maxWidth:760, margin:"0 auto" }}>
          {/* Top row */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <ArcReactor size={36}
                state={jarvis.listening?"listening":jarvis.thinking?"thinking":jarvis.speaking?"speaking":"idle"} />
              <div>
                <div style={{ fontSize:10, letterSpacing:"0.25em", color:C.cyan, fontWeight:700, opacity:0.8 }}>J.A.R.V.I.S</div>
                <div style={{ fontSize:11, color:C.dim }}>Just A Rather Very Intelligent System</div>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, color: training ? C.orange : C.dim, fontWeight:600 }}>
                {training ? "⚡ TRAINING DAY" : isRestDay() ? "😴 REST DAY" : "● ACTIVE DAY"}
              </div>
              <div style={{ display:"flex", gap:8, marginTop:4, justifyContent:"flex-end" }}>
                <StatusDot on={spotify.connected}  label="Spotify"  />
                <StatusDot on={calendar.connected} label="Calendar" />
                <StatusDot on={hue.connected}      label="Hue"      />
              </div>
            </div>
          </div>

          {/* Macro pills */}
          <div style={{ display:"flex", gap:6, marginBottom:10, flexWrap:"wrap" }}>
            {[
              { label:`${Math.round(TARGET_CAL - macros.cal)} cal left`, color: macros.cal >= TARGET_CAL ? C.orange : C.cyan },
              { label:`${Math.round(TARGET_PROTEIN - macros.protein)}g protein left`, color: macros.protein >= TARGET_PROTEIN ? C.orange : C.green },
              weather.data && { label:`${Math.round(weather.data.temperature_2m)}°F ${wxEmoji(weather.data.weather_code)}`, color:C.blue },
              { label:`${new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}`, color:C.dim },
            ].filter(Boolean).map((p, i) => (
              <span key={i} style={{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600,
                background:`${p.color}18`, color:p.color, border:`1px solid ${p.color}33` }}>
                {p.label}
              </span>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:0, overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(([id, label]) => (
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"10px 15px", fontSize:12, fontWeight: tab===id ? 700 : 500,
                color: tab===id ? C.cyan : C.dim,
                borderBottom: tab===id ? `2px solid ${C.cyan}` : "2px solid transparent",
                background:"none", border:"none", borderBottom: tab===id ? `2px solid ${C.cyan}` : "2px solid transparent",
                cursor:"pointer", whiteSpace:"nowrap", letterSpacing:"0.04em",
                transition:"color 0.2s",
                textShadow: tab===id ? `0 0 8px ${C.cyan}88` : "none",
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding:"20px 20px 100px", maxWidth:760, margin:"0 auto" }}>
        {tab==="briefing"    && <BriefingTab macros={macros} measurements={measurements} sleep={sleep} hue={hue} spotify={spotify} calendar={calendar} weather={weather} jarvis={jarvis} coffeeOn={coffeeOn} notify={notify} />}
        {tab==="macros"      && <MacrosTab macros={macros} setMacros={setMacros} notify={notify} />}
        {tab==="environment" && <EnvironmentTab hue={hue} setHue={setHue} coffeeOn={coffeeOn} setCoffeeOn={setCoffeeOn} sceneLoading={sceneLoading} applyScene={applyScene} notify={notify} />}
        {tab==="recipes"     && <RecipesTab />}
        {tab==="body"        && <BodyTab measurements={measurements} setMeasurements={setMeasurements} notify={notify} />}
        {tab==="sleep"       && <SleepTab sleep={sleep} setSleep={setSleep} notify={notify} />}
        {tab==="settings"    && <SettingsTab jarvis={jarvis} spotify={spotify} calendar={calendar} />}
      </div>

      {/* Floating orb (non-briefing tabs) */}
      {tab !== "briefing" && <FloatingOrb jarvis={jarvis} />}
    </div>
  );
}
