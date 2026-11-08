// Color de acento elegido por el visitante (ADR 0012). Se guarda solo el tono (0–359);
// la saturación y la luz son las del ámbar original, así todo color se lee igual de bien
// sobre el fondo oscuro y con el texto oscuro de los botones.

const KEY = "accentHue";
const SAT = 0.87;
const LIGHT = 0.69;
const STRONG_SAT = 0.89;
const STRONG_LIGHT = 0.78;

export const DEFAULT_HUE = 38; // ámbar #f5c26b

export const ACCENT_PRESETS = [
  { id: "amber", hue: DEFAULT_HUE },
  { id: "red", hue: 354 },
  { id: "magenta", hue: 285 },
  { id: "cyan", hue: 205 },
  { id: "mint", hue: 160 },
  { id: "lime", hue: 85 },
];

const hslToRgb = (hue, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const h = (((hue % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((h % 2) - 1));
  const [r, g, b] =
    h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x];
  const m = l - c / 2;
  return [r, g, b].map((v) => Math.round((v + m) * 255));
};

export const accentRgb = (hue) => hslToRgb(hue, SAT, LIGHT);

// Pisa los tokens de tokens.css en <html>; los derivados (soft, line, glow) se recalculan solos.
export const applyAccent = (hue, root = document.documentElement) => {
  root.style.setProperty("--color-accent-rgb", accentRgb(hue).join(" "));
  root.style.setProperty("--color-accent-strong", `rgb(${hslToRgb(hue, STRONG_SAT, STRONG_LIGHT).join(" ")})`);
};

const isHue = (n) => Number.isInteger(n) && n >= 0 && n < 360;

export const loadAccentHue = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const hue = raw === null ? NaN : Number(raw);
    return isHue(hue) ? hue : DEFAULT_HUE;
  } catch {
    return DEFAULT_HUE;
  }
};

export const saveAccentHue = (hue) => {
  try {
    localStorage.setItem(KEY, String(hue));
  } catch {
    // Sin almacenamiento (modo privado, bloqueado): el color dura hasta recargar.
  }
};
