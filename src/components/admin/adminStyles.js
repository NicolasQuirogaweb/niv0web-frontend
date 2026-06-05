export const s = {
  bg: "#0a0a0a",
  surface: "#111",
  surfaceAlt: "#1a1a1a",
  border: "#222",
  borderLight: "#2a2a2a",
  text: "#e0e0e0",
  textMuted: "#888",
  textDim: "#555",
  accent: "#7c6ff0",
  accentHover: "#6a5ad8",
  danger: "#e53935",
  success: "#43a047",
  radius: 6,
};

export const badge = (role) => ({
  fontSize: 11,
  padding: "3px 8px",
  borderRadius: 4,
  background: role === "admin" ? "#1b3a1b" : "#222",
  color: role === "admin" ? "#81c784" : "#999",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});
