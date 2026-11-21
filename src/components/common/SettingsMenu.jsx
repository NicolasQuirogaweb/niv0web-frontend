import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ACCENT_PRESETS, accentRgb, applyAccent, loadAccentHue, saveAccentHue } from "../../utils/theme";
import "./SettingsMenu.css";

const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const EDGE = 8; // margen mínimo con el borde de la pantalla

/**
 * Ajustes de toda la app (ADR 0012): un botón de engranaje abre una ventanita de
 * "Preferences" de DAW con el idioma y el color de acento (seis colores listos y un fader
 * para cualquier tono). Todo cambia en vivo y queda guardado para la próxima visita.
 */
export const SettingsMenu = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState(loadAccentHue);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();

  const choose = (next) => {
    setHue(next);
    applyAccent(next);
    saveAccentHue(next);
  };

  const close = (refocus) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  };

  // La ventana se abre alineada a la derecha del botón; en un celular eso la deja cortada a la
  // izquierda. Antes de pintarla, se corre lo justo para quedar entera dentro de la pantalla.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    // Se mide con el contenedor y el ancho real: el rect de la ventana está achicado por la animación de entrada.
    const right = wrapRef.current.getBoundingClientRect().right;
    const left = right - panel.offsetWidth;
    let shift = 0;
    if (left < EDGE) shift = EDGE - left;
    else if (right > window.innerWidth - EDGE) shift = window.innerWidth - EDGE - right;
    if (shift) panel.style.right = `${-shift}px`;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  // Esc cierra desde el botón o desde la ventana, sin que la página vuelva atrás.
  const onWrapKey = (e) => {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      close(true);
    }
  };

  // Las flechas del panel son del panel: que la navegación de la página no se mueva.
  const onPanelKey = (e) => {
    const step = STEP[e.key];
    const swatches = [...e.currentTarget.querySelectorAll(".tp-swatch")];
    const at = swatches.indexOf(e.target);
    if (step && at >= 0) {
      e.preventDefault();
      swatches[(at + step + swatches.length) % swatches.length].focus();
    }
  };

  const lang = i18n.language?.startsWith("en") ? "en" : "es";
  const chooseLang = (next) => {
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const preset = ACCENT_PRESETS.find((p) => p.hue === hue);

  return (
    <div className="tp" ref={wrapRef} onKeyDown={onWrapKey}>
      <button
        ref={triggerRef}
        type="button"
        className="tp-trigger"
        aria-label={t("theme.open")}
        title={t("theme.open")}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        {/* Engranaje simétrico (forma del ícono "settings" de Lucide, ISC): el círculo queda en el centro exacto. */}
        <svg className="tp-gear" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <i className="tp-led" aria-hidden="true" />
      </button>
      {open && (
        <div ref={panelRef} id={panelId} className="tp-panel" role="dialog" aria-label={t("theme.title")} onKeyDown={onPanelKey}>
          <div className="tp-bar" aria-hidden="true">
            <b />
            <b />
            <b />
            <span>{t("theme.bar")}</span>
          </div>
          <div className="tp-body">
            <div className="tp-section-title" aria-hidden="true">{t("theme.language")}</div>
            <div className="tp-langs">
              {[["es", "Español"], ["en", "English"]].map(([code, name]) => (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  className="tp-lang"
                  aria-pressed={lang === code}
                  onClick={() => chooseLang(code)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="tp-section-title" aria-hidden="true">{t("theme.color")}</div>
            <div className="tp-swatches">
              {ACCENT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="tp-swatch"
                  style={{ "--sw": accentRgb(p.hue).join(" ") }}
                  aria-label={t(`theme.presets.${p.id}`)}
                  title={t(`theme.presets.${p.id}`)}
                  aria-pressed={p.hue === hue}
                  onClick={() => choose(p.hue)}
                />
              ))}
            </div>
            <input
              className="tp-fader"
              type="range"
              min="0"
              max="359"
              value={hue}
              aria-label={t("theme.hue")}
              onChange={(e) => choose(Number(e.target.value))}
            />
            <div className="tp-readout" aria-live="polite">
              <span>{t("theme.accent")}</span>
              <em>{preset ? t(`theme.presets.${preset.id}`) : `${hue}°`}</em>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
