import "./OrbRing.css";

// Anillo de 64 barritas que laten y escala de marcas que gira, el adorno de la esfera
// del home (ADR 0005) para usar alrededor de otras cosas redondas (ADR 0010).
// El tamaño sale de las variables CSS --ring-r y --ticks-out del contenedor.
export const RING_BARS = Array.from({ length: 64 }, (_, k) => ({
  angle: (k * 360) / 64,
  delay: -((Math.sin(k * 1.7) * 0.5 + 0.5) * 1.2).toFixed(2),
  duration: (0.7 + ((k * 37) % 10) / 14).toFixed(2),
}));

export const OrbRing = () => (
  <>
    <div className="orb-ticks" />
    <div className="orb-ticks orb-ticks--major" />
    <div className="orb-ring">
      {RING_BARS.map(({ angle, delay, duration }) => (
        <i key={angle} style={{ "--angle": `${angle}deg`, "--delay": `${delay}s`, "--duration": `${duration}s` }}>
          <b />
        </i>
      ))}
    </div>
  </>
);
