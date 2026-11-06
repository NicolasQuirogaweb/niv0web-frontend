import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { OrbRing } from "./OrbRing";
import "./CatalogConsole.css";

const COUNT_KEY = { beats: "card.items_beats", loops: "card.items_loops" };

/**
 * Catálogos como el menú del home (ADR 0010): a la izquierda, en el lugar de la
 * esfera, un vinilo girando con la tapa del catálogo elegido como etiqueta; a la
 * derecha, los catálogos como barras en 3D. Siempre hay uno elegido (el primero al
 * entrar); lo eligen el mouse, el foco o las flechas (useConsoleNav de la página).
 * La lista se desplaza sola cuando hay muchos.
 */
export const CatalogConsole = ({ items, resourceType, getHref, getMeta, getBadge, renderLabelFallback }) => {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  const countKey = COUNT_KEY[resourceType] ?? COUNT_KEY.beats;
  const hrefOf = getHref ?? ((item) => `/${resourceType}/playlist/${item._id}`);
  const metaOf = getMeta ?? ((item) => t(countKey, { count: item?.itemsCount ?? 0 }));
  const badgeOf = getBadge ?? (() => null);
  const currentBadge = current ? badgeOf(current) : null;
  const labelFallback = current && !current.imageUrl && renderLabelFallback ? renderLabelFallback(current) : null;

  return (
    <div className="catalog-console">
      <div className="catalog-record" aria-hidden="true">
        <OrbRing />
        <div className="catalog-record-disc">
          <div
            key={current?._id}
            className="catalog-record-label"
            style={current?.imageUrl ? { backgroundImage: `url(${current.imageUrl})` } : undefined}
          >
            {labelFallback}
          </div>
          <div className="catalog-record-hole" />
        </div>
        <p className="catalog-record-caption">
          <span className="catalog-record-name">{current?.title}</span>
          {currentBadge && <span className="catalog-record-badge">{currentBadge}</span>}
          <span className="catalog-record-count">{current ? metaOf(current) : t(countKey, { count: 0 })}</span>
        </p>
      </div>

      <nav className="catalog-nav" aria-label={t("catalog.listLabel")}>
        <ul className="catalog-list">
          {items.map((item, index) => (
            <li key={item._id} className="catalog-item">
              <Link
                to={hrefOf(item)}
                className="catalog-link"
                data-active={String(index === active)}
                data-nav-item=""
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
              >
                <span className="catalog-dot" aria-hidden="true" />
                <span className="catalog-blade">
                  <span className="catalog-blade-title">{item.title}</span>
                  {badgeOf(item) && <span className="catalog-blade-badge">{badgeOf(item)}</span>}
                  <span className="catalog-blade-count">{metaOf(item)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
