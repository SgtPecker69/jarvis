// A small CSV reader. Exports from banks and fitness apps quote fields that
// contain commas, so splitting on "," loses rows — hence a real parser rather
// than a one-liner, but no dependency for it.

export function parseCsv(text) {
  const rows = [];
  let row = [], field = "", quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }   // "" is an escaped quote
        else quoted = false;
      } else field += c;
      continue;
    }

    if (c === '"')                     { quoted = true; }
    else if (c === ",")                { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field); field = "";
      if (row.some(v => v.trim() !== "")) rows.push(row);
      row = [];
    }
    else field += c;
  }

  row.push(field);
  if (row.some(v => v.trim() !== "")) rows.push(row);

  if (!rows.length) return { headers: [], records: [] };

  const headers = rows[0].map(h => h.trim());
  const records = rows.slice(1).map(r =>
    Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? "").trim()]))
  );
  return { headers, records };
}

/** Case- and space-insensitive header lookup: "Amount" matches "amount". */
export function pick(record, ...names) {
  const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const wanted = names.map(norm);
  for (const [key, value] of Object.entries(record)) {
    if (wanted.includes(norm(key))) return value;
  }
  return undefined;
}
