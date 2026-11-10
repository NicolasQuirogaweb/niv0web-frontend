import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import "./CatalogConsole.css";

const COUNT_KEY = { beats: "card.items_beats", loops: "card.items_loops" };

/**
 * Catálogos como la contratapa de un disco (ADR 0015): una hoja de papel con el
 * lado A y el lado B numerados (A1, A2… B1…), la cantidad al final de cada línea
 * punteada y, abajo, el elegido en grande con la letra subiendo, como el menú del
 * home. Siempre hay uno elegido (el primero al entrar); lo eligen el mouse, el foco
 * o las flechas (useConsoleNav de la página). Lleva el grano y el temblor de película.
 */
export const CatalogConsole = ({ items, resourceType, getHref, getMeta, getBadge }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  const countKey = COUNT_KEY[resourceType] ?? COUNT_KEY.beats;
  const hrefOf = getHref ?? ((item) => `/${resourceType}/playlist/${item._id}`);
  const metaOf = getMeta ?? ((item) => t(countKey, { count: item?.itemsCount ?? 0 }));
  const badgeOf = getBadge ?? (() => null);

  const half = Math.ceil(items.length / 2);
  const sides = [
    { side: "A", start: 0, list: items.slice(0, half) },
    { side: "B", start: half, list: items.slice(half) },
  ].filter(({ list }) => list.length > 0);

  const currentBadge = current ? badgeOf(current) : null;
  const title = current?.title ?? "";

  return (
    <div className="sleeve">
      <header className="sleeve-head" aria-hidden="true">
        <span>NIVØ BEATS</span>
        <span>{t("catalog.total", { count: items.length })}</span>
      </header>

      <nav className="sleeve-sides" aria-label={t("catalog.listLabel")}>
        {sides.map(({ side, start, list }) => {
          const label = t("catalog.side", { side });
          return (
            <div key={side} className="sleeve-side">
              <p className="sleeve-side-title" aria-hidden="true">{label}</p>
              <ol className="sleeve-list" aria-label={label}>
                {list.map((item, j) => {
                  const index = start + j;
                  const badge = badgeOf(item);
                  return (
                    <li key={item._id}>
                      <Link
                        to={hrefOf(item)}
                        className="sleeve-row"
                        data-active={String(index === active)}
                        data-nav-item=""
                        onMouseEnter={() => setActive(index)}
                        onFocus={() => setActive(index)}
                      >
                        <span className="sleeve-row-n">{side}{j + 1}</span>
                        <span className="sleeve-row-name">{item.title}</span>
                        <span className="sleeve-row-dots" aria-hidden="true" />
                        <span className="sleeve-row-end" aria-hidden="true">{badge ?? item.itemsCount ?? 0}</span>
                        {/* La cantidad completa para lectores de pantalla; a la vista va solo el número. */}
                        <span className="sr-only">{metaOf(item)}{badge ? ` · ${badge}` : ""}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </nav>

      {/* El elegido en grande repite el link de la lista: los lectores de pantalla usan la lista. */}
      <footer className="sleeve-feature" aria-hidden="true">
        <p className="sleeve-feature-title">
          {/* key: cada cambio de catálogo vuelve a montar las letras y la animación arranca de nuevo. */}
          <span className="sleeve-feature-clip" key={current?._id}>
            {[...title].map((char, index) => (
              <span key={index} className="sleeve-char" style={{ "--i": index }}>
                {char === " " ? " " : char}
              </span>
            ))}
          </span>
        </p>
        <p className="sleeve-feature-sub" key={`sub-${current?._id}`}>
          <span>{current ? metaOf(current) : ""}</span>
          {currentBadge && <span className="sleeve-feature-badge">{currentBadge}</span>}
        </p>
      </footer>
    </div>
  );
};
