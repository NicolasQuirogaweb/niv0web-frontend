import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { HOME_SECTIONS } from "../../content/sections";
import { OrbRing } from "./OrbRing";
import "./ConsoleMenu.css";

const KEY_STEP = { ArrowDown: 1, ArrowUp: -1 };
const ORB_BARS = [0, 1, 2, 3, 4, 5, 6];

// Distancia entre el borde de la esfera y el arranque de las líneas: afuera del anillo y la escala.
const LINE_GAP = 52;
const SPARK_MS = 420;

// Con el foco en un campo de texto o en otro control, las flechas y Enter son de ese control.
const isOtherControl = (el) =>
  Boolean(el && el !== document.body && el.closest('input, textarea, select, button, a, [contenteditable="true"]'));

const prefersReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/**
 * Menú de secciones de los dos homes, al estilo de un dashboard de consola
 * (ADR 0005): una esfera con barras de sonido, rodeada por un anillo de barritas y una
 * escala que gira, unida por líneas a una lista de barras en 3D. Siempre hay una sección
 * elegida (la primera al entrar); la elige el mouse, el foco o las flechas ↑ ↓, y Enter
 * entra. Las flechas andan apenas se abre la página. Al cambiar de sección la esfera
 * reacciona: corre una chispa por la línea, la esfera da un golpe de luz y el anillo se enciende.
 */
export const ConsoleMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [lines, setLines] = useState([]);
  const activeRef = useRef(0);
  const linkRefs = useRef([]);
  const dotRefs = useRef([]);
  const pathRefs = useRef([]);
  const navRef = useRef(null);
  const rootRef = useRef(null);
  const orbRef = useRef(null);
  const svgRef = useRef(null);

  const sparkAlong = (index) => {
    const path = pathRefs.current[index];
    const svg = svgRef.current;
    if (!path?.getTotalLength || !svg) return;
    const spark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    spark.setAttribute("r", "4");
    spark.setAttribute("class", "console-spark");
    svg.appendChild(spark);
    const length = path.getTotalLength();
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - start) / SPARK_MS);
      const point = path.getPointAtLength(length * (1 - Math.pow(1 - progress, 3)));
      spark.setAttribute("cx", point.x);
      spark.setAttribute("cy", point.y);
      if (progress < 1) requestAnimationFrame(step);
      else spark.remove();
    };
    requestAnimationFrame(step);
  };

  const select = (index) => {
    if (index === activeRef.current) return;
    activeRef.current = index;
    setActive(index);
    const root = rootRef.current;
    if (!root) return;
    // Reinicia la animación del golpe aunque la anterior no haya terminado.
    root.classList.remove("is-kick");
    void root.offsetWidth;
    root.classList.add("is-kick");
    // Se vuelven a medir las líneas por si algo de la página se movió después de cargar.
    measureRef.current?.();
    if (!prefersReducedMotion()) sparkAlong(index);
  };

  const measureRef = useRef(null);

  // El listener de la página usa siempre la versión actual de select.
  const selectRef = useRef(select);
  useEffect(() => {
    selectRef.current = select;
  });

  useEffect(() => {
    const onKeyDown = (event) => {
      const focused = document.activeElement;
      const inMenu = navRef.current?.contains(focused);
      if (!inMenu && isOtherControl(focused)) return;
      const step = KEY_STEP[event.key];
      if (step) {
        event.preventDefault();
        const next = (activeRef.current + step + HOME_SECTIONS.length) % HOME_SECTIONS.length;
        selectRef.current(next);
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

  // Las líneas van del anillo a cada bolita: se miden en pantalla y se vuelven a medir si cambia el tamaño.
  const measureLines = useCallback(() => {
    const root = rootRef.current?.getBoundingClientRect();
    const orb = orbRef.current?.getBoundingClientRect();
    if (!root || !orb) return;
    const ox = orb.left - root.left + orb.width / 2;
    const oy = orb.top - root.top + orb.height / 2;
    const sx = ox + orb.width / 2 + LINE_GAP;
    setLines(
      HOME_SECTIONS.map((_, index) => {
        const dot = dotRefs.current[index]?.getBoundingClientRect();
        if (!dot) return "";
        const dx = dot.left - root.left;
        const dy = dot.top - root.top + dot.height / 2;
        const sy = oy + (dy - oy) * 0.35;
        return `M${sx},${sy} C${sx + 60},${sy} ${dx - 70},${dy} ${dx},${dy}`;
      })
    );
  }, []);

  useLayoutEffect(() => {
    measureRef.current = measureLines;
    measureLines();
    const late = setTimeout(measureLines, 1000);
    // La tipografía y el fondo cambian el tamaño de las barras después del primer render.
    document.fonts?.ready.then(measureLines);
    document.fonts?.addEventListener?.("loadingdone", measureLines);
    window.addEventListener("load", measureLines);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measureLines);
    observer?.observe(rootRef.current);
    observer?.observe(navRef.current);
    return () => {
      clearTimeout(late);
      observer?.disconnect();
      document.fonts?.removeEventListener?.("loadingdone", measureLines);
      window.removeEventListener("load", measureLines);
    };
  }, [measureLines]);

  return (
    <div className="console-menu" ref={rootRef}>
      <svg className="console-lines" ref={svgRef} aria-hidden="true">
        {HOME_SECTIONS.map(({ to }, index) => (
          <path
            key={to}
            ref={(el) => (pathRefs.current[index] = el)}
            d={lines[index] || "M0,0"}
            data-active={String(index === active)}
          />
        ))}
      </svg>
      <div className="console-orb" aria-hidden="true" ref={orbRef}>
        <OrbRing />
        <div className="console-orb-core" />
        <div className="console-orb-shock" />
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
                <span className="console-dot" aria-hidden="true" ref={(el) => (dotRefs.current[index] = el)} />
                <span className="console-blade">
                  <span className="console-blade-text">{t(labelKey)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
