export const fmt = (n) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n ?? 0);

export const fmtDec = (n) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n ?? 0);

export const pct = (n) => ((n ?? 0) * 100).toFixed(1) + "%";
