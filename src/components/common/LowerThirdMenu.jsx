import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { HOME_SECTIONS } from "../../content/sections";
import "./LowerThirdMenu.css";

// La fila de secciones es horizontal, así que ← → también mueven, además de ↑ ↓ (ADR 0008).
const KEY_STEP = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

// Con el foco en un campo de texto o en otro control, las flechas y Enter son de ese control.
const isOtherControl = (el) =>
  Boolean(el && el !== document.body && el.closest('input, textarea, select, button, a, [contenteditable="true"]'));

/**
 * Menú de secciones de los dos homes como el zócalo de un videoclip (ADR 0011): abajo a
 * la izquierda, la sección elegida en grande con la letra subiendo, una rayita ámbar con
 * su bajada y, debajo, la fila con las cinco. Deja el video de fondo libre. Siempre hay
 * una sección elegida (la primera al entrar); la eligen el mouse, el foco o las flechas,
 * y Enter entra. Las flechas andan apenas se abre la página.
 */
export const LowerThirdMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const linkRefs = useRef([]);
  const navRef = useRef(null);

  const select = (index) => {
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      // Atajos del navegador (Alt + ← es "atrás") y teclas que ya usó otro widget quedan como están.
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      const focused = document.activeElement;
      const inMenu = navRef.current?.contains(focused);
      if (!inMenu && isOtherControl(focused)) return;
      const step = KEY_STEP[event.key];
      if (step) {
        event.preventDefault();
        const next = (activeRef.current + step + HOME_SECTIONS.length) % HOME_SECTIONS.length;
        select(next);
        linkRefs.current[next]?.focus();
      } else if (event.key === "Enter" && !inMenu) {
        // Dentro del menú el link ya abre su sección solo.
        event.preventDefault();
        navigate(HOME_SECTIONS[activeRef.current].to);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navigate]);

  const current = HOME_SECTIONS[active];
  const title = t(current.labelKey);

  return (
    <div className="lt-menu">
      {/* El nombre grande repite el link elegido: se puede clickear, pero los lectores de pantalla usan la lista. */}
      <Link to={current.to} className="lt-title" aria-hidden="true" tabIndex={-1}>
        {/* key: cada cambio de sección vuelve a montar las letras y la animación arranca de nuevo. */}
        <span className="lt-title-clip" key={current.to}>
          {[...title].map((char, index) => (
            <span key={index} className="lt-char" style={{ "--i": index }}>
              {char === " " ? " " : char}
            </span>
          ))}
        </span>
      </Link>
      <p className="lt-sub" key={`sub-${current.to}`} aria-hidden="true">
        {t(current.subKey)}
      </p>
      <nav aria-label={t("home.menuLabel")} ref={navRef}>
        <ul className="lt-list">
          {HOME_SECTIONS.map(({ to, labelKey }, index) => (
            <li key={to}>
              <Link
                to={to}
                ref={(el) => (linkRefs.current[index] = el)}
                className="lt-link"
                data-active={String(index === active)}
                onMouseEnter={() => select(index)}
                onFocus={() => select(index)}
              >
                {t(labelKey)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
