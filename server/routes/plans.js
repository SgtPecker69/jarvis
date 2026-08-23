// iMessage → Claude → social plans. The original Mac-as-API route, and the
// template the rest of this server follows.

import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { chatDbFound, getRecentMessages, formatConvosForClaude } from "../imessage.js";

export const plans = Router();

plans.get("/health", (_req, res) => {
  res.json({ ok: true, dbFound: chatDbFound() });
});

plans.post("/scan", async (req, res) => {
  // .env first — the point of local-first is that the browser never holds a key.
  // The header is the old path, kept working until the key moves to .env.
  const apiKey = process.env.ANTHROPIC_API_KEY || req.headers["x-api-key"];
  if (!apiKey) {
    return res.status(400).json({ error: "No Anthropic key. Set ANTHROPIC_API_KEY in .env" });
  }

  const days = parseInt(req.query.days) || 90;

  let convos;
  try {
    convos = getRecentMessages(days);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  const convoText = formatConvosForClaude(convos);
  if (!convoText.trim()) {
    return res.json({ plans: [], scannedAt: new Date().toISOString(), days });
  }

  const today = new Date().toISOString().slice(0, 10);

  const prompt = `Today is ${today}. You are analyzing iMessage conversations to find social plans, events, or commitments.

For each plan you find, extract:
- title: short description (e.g. "Dinner with Jake", "Brunch at Farmhouse")
- contact: who it's with (name or number)
- date: the date/time if mentioned (ISO format or human-readable). If past, include it. If unknown, null.
- status: one of "accepted", "tentative", "declined", "pending", "past"
  - accepted = clearly confirmed by both parties
  - tentative = maybe, might, trying to figure out, no firm answer yet
  - declined = cancelled or said no
  - pending = asked but no reply yet
  - past = date has already passed
- details: any relevant details (location, activity, etc.)
- conversation: which conversation it came from

Return a JSON object: { "plans": [ ...array of plan objects... ] }

Only return plans that are actual social commitments or events being discussed. Ignore casual references to past events unless they indicate upcoming plans. Include ALL plans regardless of how far in the future or past.

MESSAGES:
${convoText.slice(0, 80000)}`;

  try {
    const message = await new Anthropic({ apiKey }).messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.json({ plans: [], scannedAt: new Date().toISOString(), days });

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({ plans: parsed.plans || [], scannedAt: new Date().toISOString(), days });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
