// Reading Mark's own iMessage database. Read-only, local, and the reason this
// server can't run anywhere but the Mac — which is the architecture, not a bug.

import Database from "better-sqlite3";
import { homedir } from "os";
import { join } from "path";
import { existsSync } from "fs";

export const CHAT_DB = join(homedir(), "Library/Messages/chat.db");

// Seconds between the Unix epoch and Apple's (2001-01-01). Getting this wrong
// shifts every message by 31 years, silently — hence the named constant.
const APPLE_EPOCH_OFFSET = 978307200;

export const chatDbFound = () => existsSync(CHAT_DB);

export function getRecentMessages(days = 90) {
  if (!chatDbFound()) throw new Error("iMessage database not found");

  const db = new Database(CHAT_DB, { readonly: true, fileMustExist: true });

  const cutoffSecs = Date.now() / 1000 - days * 86400 - APPLE_EPOCH_OFFSET;
  const cutoffNano = cutoffSecs * 1e9;

  const rows = db.prepare(`
    SELECT
      m.text,
      m.is_from_me,
      m.date,
      COALESCE(h.id, '') AS contact,
      COALESCE(chat.display_name, '') AS group_name
    FROM message m
    LEFT JOIN chat_message_join cmj ON cmj.message_id = m.ROWID
    LEFT JOIN chat ON chat.ROWID = cmj.chat_id
    LEFT JOIN handle h ON h.ROWID = m.handle_id
    WHERE m.date > ?
      AND m.text IS NOT NULL
      AND LENGTH(TRIM(m.text)) > 0
    ORDER BY m.date ASC
  `).all(cutoffNano);

  db.close();

  const convos = {};
  for (const row of rows) {
    const key = row.group_name || row.contact || "Unknown";
    if (!convos[key]) convos[key] = [];
    convos[key].push({
      from: row.is_from_me ? "Me" : (row.contact || "Them"),
      text: row.text,
      date: new Date(row.date / 1e6 + APPLE_EPOCH_OFFSET * 1000).toISOString(),
    });
  }

  return convos;
}

export function formatConvosForClaude(convos) {
  const lines = [];
  for (const [name, msgs] of Object.entries(convos)) {
    if (msgs.length === 0) continue;
    lines.push(`\n=== Conversation: ${name} ===`);
    for (const m of msgs) {
      lines.push(`[${m.date.slice(0, 10)}] ${m.from}: ${m.text}`);
    }
  }
  return lines.join("\n");
}
