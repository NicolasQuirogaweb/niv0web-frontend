import { Link } from "react-router-dom";
import "./GlassCard.css";

// Card de vidrio + ecualizador (ADR 0003): tapa desenfocada de fondo, tapa nítida
// al frente y un panel de vidrio abajo. Toda la card es un único link: interno
// con `to` (catálogos) o externo con `href` (abre en otra pestaña, ej. Spotify).
export const GlassCard = ({ to, href, imageUrl, title, meta, className = "" }) => {
  const cover = imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined;
  const body = (
    <>
      <span className="card-blur" style={cover} aria-hidden="true" />
      <span className="card-cover" style={cover} aria-hidden="true" />
      <span className="card-glass">
        <span className="card-title">{title}</span>
        <span className="card-meta">
          <span className="card-tag">{meta}</span>
          <span className="card-eq" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </span>
      </span>
    </>
  );
  const classes = `glass-card ${className}`.trim();

  return to ? (
    <Link to={to} className={classes}>{body}</Link>
  ) : (
    <a href={href} className={classes} target="_blank" rel="noopener noreferrer">{body}</a>
  );
};
