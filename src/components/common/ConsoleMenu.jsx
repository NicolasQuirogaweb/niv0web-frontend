import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { HOME_SECTIONS } from "../../content/sections";
import "./ConsoleMenu.css";

const KEY_STEP = { ArrowDown: 1, ArrowUp: -1 };
const ORB_BARS = [0, 1, 2, 3, 4, 5, 6];

// Con el foco en un campo de texto o en otro control, las flechas y Enter son de ese control.
const isOtherControl = (el) =>
  Boolean(el && el !== document.body && el.closest("input, textarea, select, button, a, [contenteditable='true']"));

/**
 * Menú de secciones de los dos homes, al estilo de un dashboard de consola
 * (ADR 0005): un círculo con barras de sonido que respira y una lista de barras. Siempre
 * hay una sección elegida (la primera al entrar); la elige el mouse, el foco
 * o las flechas ↑ ↓, y Enter entra. Como en la consola, las flechas andan apenas se
 * abre la página, sin hacer clic en el menú primero.
 */
export const ConsoleMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const linkRefs = useRef([]);
  const navRef = useRef(null);

  const select = (index) => {
    activeRef.current = index;
    setActive(index);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      const focused = document.activeElement;
      const inMenu = navRef.current?.contains(focused);
      if (!inMenu && isOtherControl(focused)) return;
      const step = KEY_STEP[event.key];
      if (step) {
        event.preventDefault();
        const next = (activeRef.current + step + HOME_SECTIONS.length) % HOME_SECTIONS.length;
        activeRef.current = next;
        setActive(next);
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

  return (
    <div className="console-menu">
      <div className="console-orb" aria-hidden="true">
        <div className="console-orb-bars">
          {ORB_BARS.map((bar) => (
            <span key={bar} className="console-orb-bar" />
          ))}
        </div>
      </div>
      <nav className="console-nav" aria-label={t("home.menuLabel")} ref={navRef}>
        <ul className="console-list">
          {HOME_SECTIONS.map(({ to, labelKey }, index) => (
            <li key={to} className="console-item">
              <Link
                to={to}
                ref={(el) => (linkRefs.current[index] = el)}
                className="console-link"
                data-active={String(index === active)}
                onMouseEnter={() => select(index)}
                onFocus={() => select(index)}
              >
                <span className="console-dot" aria-hidden="true" />
                <span className="console-blade">{t(labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
