export function inferColumnTypes(rows, headers) {
  // returns { numeric: [], categorical: [], all: [] }
  const numeric = [];
  const categorical = [];
  const all = headers ?? Object.keys(rows?.[0] ?? {});

  for (const col of all) {
    let seen = 0;
    let numericCount = 0;

    for (const r of rows) {
      const v = r[col];
      if (v === null || v === undefined || v === "") continue;
      seen++;
      const n = Number(String(v).replace(",", "."));
      if (!Number.isNaN(n) && Number.isFinite(n)) numericCount++;
      if (seen >= 25) break; // sample
    }

    // If most sampled values are numbers => numeric
    if (seen > 0 && numericCount / seen >= 0.8) numeric.push(col);
    else categorical.push(col);
  }

  return { numeric, categorical, all };
}

export function toNumber(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function groupByCategory(rows, categoryCol, valueCol) {
  const map = new Map();
  for (const r of rows) {
    const cat = String(r[categoryCol] ?? "").trim();
    const val = toNumber(r[valueCol]);
    if (!cat || val === null) continue;
    map.set(cat, (map.get(cat) ?? 0) + val);
  }
  const labels = Array.from(map.keys());
  const values = labels.map((k) => map.get(k));
  return { labels, values };
}

export function topN(labels, values, n = 12) {
  const zipped = labels.map((l, i) => ({ l, v: values[i] }));
  zipped.sort((a, b) => b.v - a.v);
  const sliced = zipped.slice(0, n);
  return { labels: sliced.map(x => x.l), values: sliced.map(x => x.v) };
}

export const COLORS = [
  "#2563eb", // blue
  "#16a34a", // green
  "#dc2626", // red
  "#9333ea", // purple
  "#ea580c", // orange
  "#0891b2", // cyan
  "#ca8a04", // yellow
  "#4b5563"  // gray
];
