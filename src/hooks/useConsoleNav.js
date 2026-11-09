import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Navegación con teclado como en una consola, igual que el menú del home (ADR 0008).
// Cada página marca lo que se puede elegir con `data-nav-item`. Si lo que hay que
// apretar es un botón de adentro (el play de un tema, el botón de una licencia),
// el item lo dice con `data-nav-press="<selector>"`.
//
// - Las flechas andan apenas se abre la página y van al item más cercano en esa dirección.
// - Lo elegido lleva `data-nav-active="true"` (lo usa el CSS para el brillo ámbar).
// - Enter aprieta lo elegido; Esc vuelve a `back`.
// - Si un widget de adentro ya usó la tecla (`preventDefault`), la página no la toca.
// - Campos de texto, sliders y atajos del navegador (Alt/Ctrl/⌘) quedan como están.

const ITEM = "[data-nav-item]";
const OWN_KEYS = 'input, textarea, select, [contenteditable="true"], [role="slider"]';
const DIRECTIONS = {
  ArrowRight: [1, 0],
  ArrowLeft: [-1, 0],
  ArrowDown: [0, 1],
  ArrowUp: [0, -1],
};

const center = (el) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, visible: r.width > 0 || r.height > 0 };
};

// El item más cercano en la dirección pedida: pesa el doble lo que se desvía de la línea recta.
export const nearestInDirection = (from, items, [dx, dy]) => {
  const a = center(from);
  let best = null;
  let bestScore = Infinity;
  items.forEach((item) => {
    if (item === from) return;
    const b = center(item);
    if (!b.visible) return;
    const along = (b.x - a.x) * dx + (b.y - a.y) * dy;
    if (along <= 1) return;
    const across = Math.abs((b.x - a.x) * dy) + Math.abs((b.y - a.y) * dx);
    const score = along + across * 2;
    if (score < bestScore) {
      bestScore = score;
      best = item;
    }
  });
  return best;
};

const pressTarget = (item) => (item.dataset.navPress && item.querySelector(item.dataset.navPress)) || item;

export const useConsoleNav = ({ back } = {}) => {
  const navigate = useNavigate();
  const activeRef = useRef(null);

  useEffect(() => {
    const setActive = (item) => {
      if (activeRef.current === item) return;
      activeRef.current?.removeAttribute("data-nav-active");
      activeRef.current = item;
      item?.setAttribute("data-nav-active", "true");
    };

    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (document.activeElement?.closest?.(OWN_KEYS)) return;
      // Un widget con teclas propias (el árbol de samples) ya usó esta tecla.
      if (event.defaultPrevented) return;

      const direction = DIRECTIONS[event.key];
      if (direction) {
        const items = [...document.querySelectorAll(ITEM)];
        if (!items.length) return;
        event.preventDefault();
        const current = activeRef.current?.isConnected ? activeRef.current : null;
        const next = current ? nearestInDirection(current, items, direction) : items[0];
        if (!next) return;
        setActive(next);
        pressTarget(next).focus();
        next.scrollIntoView?.({ block: "nearest" });
        return;
      }

      if (event.key === "Enter") {
        const item = activeRef.current;
        const focused = document.activeElement;
        // Con el foco en el item, el navegador ya aprieta el link o el botón solo.
        if (!item?.isConnected || item.contains(focused)) return;
        // Con el foco en otro control (idioma, color, un link), Enter es de ese control.
        if (focused && focused !== document.body) return;
        event.preventDefault();
        pressTarget(item).click();
        return;
      }

      if (event.key === "Escape" && back) {
        event.preventDefault();
        navigate(back);
      }
    };

    // El mouse y el foco también eligen, así Enter abre lo último que tocaste.
    const onPoint = (event) => {
      const item = event.target.closest?.(ITEM);
      if (item) setActive(item);
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mouseover", onPoint);
    document.addEventListener("focusin", onPoint);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mouseover", onPoint);
      document.removeEventListener("focusin", onPoint);
      setActive(null);
    };
  }, [back, navigate]);
};
