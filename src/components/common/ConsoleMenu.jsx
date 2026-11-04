import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { HOME_SECTIONS } from "../../content/sections";
import "./ConsoleMenu.css";

const KEY_STEP = { ArrowDown: 1, ArrowUp: -1 };

/**
 * Menú de secciones de los dos homes, al estilo de un dashboard de consola
 * (ADR 0005): un círculo con NIV0 que respira y una lista de barras. Siempre
 * hay una sección elegida (la primera al entrar); la elige el mouse, el foco
 * o las flechas ↑ ↓, y Enter entra.
 */
export const ConsoleMenu = () => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const linkRefs = useRef([]);

  const onKeyDown = (event, index) => {
    const step = KEY_STEP[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (index + step + HOME_SECTIONS.length) % HOME_SECTIONS.length;
    linkRefs.current[next]?.focus();
  };

  return (
    <div className="console-menu">
      <div className="console-orb" aria-hidden="true">
        <span className="console-orb-word">NIV0</span>
      </div>
      <nav className="console-nav" aria-label={t("home.menuLabel")}>
        <ul className="console-list">
          {HOME_SECTIONS.map(({ to, labelKey }, index) => (
            <li key={to} className="console-item">
              <Link
                to={to}
                ref={(el) => (linkRefs.current[index] = el)}
                className="console-link"
                data-active={String(index === active)}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
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
