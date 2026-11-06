const money = (locale, currency, value) =>
  new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

export const formatPackPrice = (pack, lang) => {
  if (lang === "en" && pack.priceUsd != null && pack.priceUsd !== "") {
    return money("en-US", "USD", pack.priceUsd);
  }
  return money(lang === "en" ? "en-US" : "es-AR", "ARS", pack.priceArs ?? 0);
};

export const formatBytes = (bytes) => {
  const mb = (bytes ?? 0) / 1024 / 1024;
  if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
  return `${Math.round(mb)} MB`;
};
