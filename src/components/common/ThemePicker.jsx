import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ACCENT_PRESETS, accentRgb, applyAccent, loadAccentHue, saveAccentHue } from "../../utils/theme";
import "./ThemePicker.css";

const STEP = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
const EDGE = 8; // margen mínimo con el borde de la pantalla

/**
 * Selector del color de acento, al lado del de idioma (ADR 0012). Un botón con un LED del
 * color actual abre una ventanita de "Preferences" de DAW: seis colores listos y un fader
 * para cualquier tono. Cambia todo el sitio en vivo y queda guardado para la próxima visita.
 */
export const ThemePicker = () => {
  const { t } = useTranslation();
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
        <i className="tp-led" aria-hidden="true" />
        <span aria-hidden="true">{t("theme.button")}</span>
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
