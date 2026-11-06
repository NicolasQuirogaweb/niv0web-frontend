import { memo, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatBytes } from "../../utils/formatPrice";
import "./SampleBrowser.css";

// Browser de samples como una ventana de FL Studio (ADR 0007): barra con luces y datos del
// pack, pantalla que muestra lo elegido (carpeta o sample) con su forma de onda, buscador,
// árbol de carpetas y samples, y pie con los atajos.
// Teclado según el patrón de árbol de WAI-ARIA; el árbol usa preventDefault en cada tecla
// que maneja para que useConsoleNav (flechas y Esc de la página, ADR 0008) la deje pasar.

export const flattenFolders = (folders) => folders.flatMap((folder) => folder.samples);

// Menos de 10 s con décimas ("2.4 s", así se distinguen los one-shots); desde ahí m:ss.
export const formatDuration = (sec) => {
  const tenths = Math.round(sec * 10) / 10;
  if (tenths < 0.1) return "<0.1 s";
  if (tenths < 10) return `${tenths.toFixed(1)} s`;
  const total = Math.round(sec);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

// Forma de onda decorativa: la misma semilla da siempre la misma forma.
const hash = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const randomFrom = (seed) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// Alturas entre 0 y 1. `decay` alto = golpe corto (one-shot); `beats` > 0 = un loop con golpes.
export const waveBars = (seed, count, { decay = 1.6, beats = 0 } = {}) => {
  const rand = randomFrom(hash(String(seed)));
  const attack = 1 + Math.floor(rand() * 2);
  const phase = beats ? rand() * 0.6 : 0;
  return Array.from({ length: count }, (_, k) => {
    const x = k / Math.max(1, count - 1);
    let envelope;
    if (beats) envelope = 0.3 + 0.7 * Math.exp(-3.5 * ((x * beats + phase) % 1));
    else envelope = k < attack ? (k + 1) / (attack + 1) : Math.exp(-decay * x);
    const value = 0.1 + 0.9 * envelope * (0.6 + 0.4 * rand());
    return Math.round(Math.min(1, Math.max(0.06, value)) * 1000) / 1000;
  });
};

// La onda siempre ocupa todo el ancho (como en una DAW), pero un golpe corto cae más rápido.
const decayFor = (sec) => (!sec ? 1.6 : sec < 0.5 ? 3.4 : sec < 2 ? 2.4 : sec < 10 ? 1.4 : 0.4);

// Búsqueda sin mayúsculas ni tildes ("cafe" encuentra "Café").
const fold = (text) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Parte el título en [antes, coincidencia, después] para marcar lo encontrado.
const splitMatch = (title, folded) => {
  const chars = [...title];
  let norm = "";
  const map = [];
  chars.forEach((ch, idx) => {
    for (const c of fold(ch)) {
      norm += c;
      map.push(idx);
    }
  });
  const at = norm.indexOf(folded);
  if (at < 0) return null;
  const start = map[at];
  const end = map[at + folded.length - 1] + 1;
  return [chars.slice(0, start).join(""), chars.slice(start, end).join(""), chars.slice(end).join("")];
};

const extensionOf = (url) => {
  const ext = (url || "").split(/[?#]/)[0].split(".").pop();
  return ext && /^[a-z0-9]{2,4}$/i.test(ext) && ext !== url ? ext.toUpperCase() : null;
};

const folderKey = (i) => `f${i}`;
const sampleKey = (i, j) => `s${i}:${j}`;
const folderOf = (key) => (key.startsWith("s") ? folderKey(key.slice(1).split(":")[0]) : key);
const parseSample = (key) => key.slice(1).split(":").map(Number);

const MINI_BARS = 13;
const MINI_PITCH = 3;
const WAVE_BARS = 44;

const MiniWave = ({ seed, decay }) => {
  const d = waveBars(seed, MINI_BARS, { decay })
    .map((h, k) => {
      const half = Math.max(0.6, h * 6.5);
      return `M${k * MINI_PITCH + 1.5} ${7 - half}V${7 + half}`;
    })
    .join("");
  return (
    <svg className="sb-mini" viewBox={`0 0 ${MINI_BARS * MINI_PITCH} 14`} aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
};

const SampleRow = memo(function SampleRow({ sample, number, rowKey, labelId, tabbable, selected, playing, parts }) {
  return (
    <li
      role="treeitem"
      aria-selected={selected}
      aria-current={playing ? "true" : undefined}
      aria-labelledby={labelId}
      data-key={rowKey}
      tabIndex={tabbable ? 0 : -1}
      className={`sb-sample${playing ? " is-playing" : ""}`}
    >
      <div className="sb-row">
        <span className="sb-num" aria-hidden="true">
          {String(number).padStart(3, "0")}
        </span>
        <span className="sb-eq" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sb-dot" aria-hidden="true" />
        <span id={labelId} className="sb-name">
          {parts ? (
            <>
              {parts[0]}
              <mark>{parts[1]}</mark>
              {parts[2]}
            </>
          ) : (
            sample.title
          )}
        </span>
        <MiniWave seed={sample._id || sample.title} decay={decayFor(sample.durationSec)} />
        <span className="sb-dur">{sample.durationSec > 0 ? formatDuration(sample.durationSec) : ""}</span>
      </div>
    </li>
  );
});

export function SampleBrowser({ folders, player, packTitle = "", zipBytes = null }) {
  const { t } = useTranslation();
  const uid = useId();
  const treeRef = useRef(null);
  const [open, setOpen] = useState(() => new Set([0]));
  const [focusKey, setFocusKey] = useState(folderKey(0));
  const [selectedKey, setSelectedKey] = useState(null);
  const [query, setQuery] = useState("");

  // Índice de reproducción de cada sample: su posición en flattenFolders (sin filtrar).
  const { flatIndex, positions } = useMemo(() => {
    let counter = 0;
    const where = [];
    const index = folders.map((folder, i) =>
      folder.samples.map((_, j) => {
        where.push([i, j]);
        return counter++;
      })
    );
    return { flatIndex: index, positions: where };
  }, [folders]);

  const folded = fold(query.trim());
  const searching = folded.length > 0;

  // Con búsqueda: por carpeta, los samples que coinciden (y cómo marcarlos).
  const matches = useMemo(() => {
    if (!searching) return null;
    return folders.map((folder) =>
      folder.samples.reduce((acc, sample, j) => {
        const parts = splitMatch(sample.title || "", folded);
        if (parts) acc.push({ j, parts });
        return acc;
      }, [])
    );
  }, [folders, folded, searching]);

  const isOpen = (i) => (searching ? true : open.has(i));
  const shownFolders = folders.map((_, i) => i).filter((i) => !searching || matches[i].length > 0);
  const shownSamples = (i) =>
    searching ? matches[i] : isOpen(i) ? folders[i].samples.map((_, j) => ({ j, parts: null })) : [];

  const visible = shownFolders.flatMap((i) => [folderKey(i), ...shownSamples(i).map(({ j }) => sampleKey(i, j))]);
  // Si la carpeta del item enfocado se cierra (o la búsqueda lo esconde), el tabindex pasa a otro visible.
  const tabKey = visible.includes(focusKey)
    ? focusKey
    : visible.includes(folderOf(focusKey))
      ? folderOf(focusKey)
      : visible[0];

  const toggleFolder = (i) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const select = (key) => {
    setFocusKey(key);
    setSelectedKey(key);
  };

  const focusItem = (key) => {
    select(key);
    treeRef.current?.querySelector(`[data-key="${key}"]`)?.focus();
  };

  const play = (key) => {
    const [i, j] = parseSample(key);
    player.toggleTrack(flatIndex[i][j]);
  };

  const activate = (key) => {
    if (key.startsWith("f")) toggleFolder(Number(key.slice(1)));
    else play(key);
  };

  const clearSearch = () => setQuery("");

  const onTreeKeyDown = (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const key = event.target.closest?.('[role="treeitem"]')?.dataset.key;
    if (!key) return;
    const pos = visible.indexOf(key);
    const isFolder = key.startsWith("f");
    const folderIndex = Number(folderOf(key).slice(1));
    let handled = true;

    switch (event.key) {
      case "ArrowDown":
        if (pos < visible.length - 1) focusItem(visible[pos + 1]);
        break;
      case "ArrowUp":
        if (pos > 0) focusItem(visible[pos - 1]);
        break;
      case "Home":
        focusItem(visible[0]);
        break;
      case "End":
        focusItem(visible[visible.length - 1]);
        break;
      case "ArrowRight":
        if (isFolder) {
          if (!isOpen(folderIndex)) toggleFolder(folderIndex);
          else if (visible[pos + 1]?.startsWith("s")) focusItem(visible[pos + 1]);
        }
        break;
      case "ArrowLeft":
        if (isFolder) {
          if (!searching && open.has(folderIndex)) toggleFolder(folderIndex);
        } else {
          focusItem(folderKey(folderIndex));
        }
        break;
      case "Enter":
      case " ":
        activate(key);
        break;
      case "Escape":
        // Con búsqueda, Esc la limpia; sin búsqueda, sigue de largo y la página vuelve atrás.
        if (searching) clearSearch();
        else handled = false;
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  const onTreeClick = (event) => {
    const key = event.target.closest('[role="treeitem"]')?.dataset.key;
    if (!key) return;
    select(key);
    activate(key);
  };

  // El foco (teclado o toque) también elige: la pantalla muestra lo enfocado.
  const onTreeFocus = (event) => {
    const el = event.target.closest?.('[role="treeitem"]');
    if (el === event.target) select(el.dataset.key);
  };

  const onSearchKeyDown = (event) => {
    if (event.key === "Escape" && query) {
      // Que useConsoleNav no lo tome como "volver".
      event.preventDefault();
      event.stopPropagation();
      clearSearch();
    } else if (event.key === "ArrowDown" && visible.length) {
      event.preventDefault();
      focusItem(tabKey);
    }
  };

  // Qué muestra la pantalla: lo elegido; si no se eligió nada, lo que suena.
  const playingPos = player.currentIndex != null ? positions[player.currentIndex] : null;
  const playingKey = playingPos ? sampleKey(...playingPos) : null;
  const shownKey = selectedKey || playingKey;
  const shownFolderIndex = shownKey ? Number(folderOf(shownKey).slice(1)) : null;
  const shownFolder = shownFolderIndex != null ? folders[shownFolderIndex] : null;
  const shownSample = shownKey?.startsWith("s")
    ? folders[parseSample(shownKey)[0]]?.samples[parseSample(shownKey)[1]]
    : null;
  const shownIsPlaying = shownKey != null && shownKey === playingKey;

  const rawProgress = shownIsPlaying && player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;
  const progress = Number.isFinite(rawProgress) ? Math.min(100, Math.max(0, Math.round(rawProgress))) : 0;

  const bars = useMemo(() => {
    if (!shownFolder) return waveBars("idle", WAVE_BARS, { decay: 0.4 }).map((h) => h * 0.25);
    if (!shownSample) return waveBars(`folder:${shownFolder.name}`, WAVE_BARS, { beats: 3 + (hash(shownFolder.name) % 4) });
    return waveBars(shownSample._id || shownSample.title, WAVE_BARS, { decay: decayFor(shownSample.durationSec) });
  }, [shownFolder, shownSample]);
  const litBars = Math.round((progress / 100) * WAVE_BARS);

  const totalSamples = positions.length;
  const stats = [
    t("samplePacks.folderCount", { count: folders.length }),
    t("samplePacks.sampleCount", { count: totalSamples }),
    zipBytes != null ? t("samplePacks.browserZip", { size: formatBytes(zipBytes) }) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  let meta = "";
  if (shownSample) {
    meta = [shownSample.durationSec > 0 ? formatDuration(shownSample.durationSec) : null, extensionOf(shownSample.audioFile)]
      .filter(Boolean)
      .join(" · ");
  } else if (shownFolder) {
    meta = t("samplePacks.sampleCount", { count: shownFolder.samples.length });
  }

  // Contador de lo que lleva sonando: arranca en "0.0 s", no en "<0.1 s".
  const elapsed =
    shownIsPlaying && Number.isFinite(player.currentTime)
      ? player.currentTime < 0.05
        ? "0.0 s"
        : formatDuration(player.currentTime)
      : null;

  return (
    <div className={`sb${player.isPlaying ? " is-live" : ""}`}>
      <div className="sb-bar">
        <span className="sb-lights" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="sb-title">{t("samplePacks.browserTitle")}</span>
        <span className="sb-stats">{stats}</span>
      </div>

      <div className={`sb-screen${shownSample ? " is-sample" : shownFolder ? " is-folder" : " is-idle"}`}>
        <div className="sb-readout">
          <div className="sb-path">
            <span>{packTitle}</span>
            {shownFolder && (
              <>
                <span className="sb-path-sep"> / </span>
                <b>{shownFolder.name}</b>
              </>
            )}
            {shownSample && (
              <>
                <span className="sb-path-sep"> / </span>
                <span className="sb-path-sample">{shownSample.title}</span>
              </>
            )}
          </div>
          <div className="sb-now" title={shownSample?.title || shownFolder?.name || undefined}>
            {shownSample?.title || shownFolder?.name || t("samplePacks.browserIdle")}
          </div>
          <div className="sb-meta">{meta}</div>
        </div>

        <div className="sb-scope">
          <div className="sb-scope-top" aria-hidden="true">
            <span className={`sb-led${player.isPlaying ? " is-on" : ""}`}>{t("samplePacks.browserPreview")}</span>
            <span className="sb-time">{elapsed}</span>
          </div>
          <div
            className="sb-wave"
            {...(shownSample
              ? {
                  role: "progressbar",
                  "aria-label": t("samplePacks.browserProgress"),
                  "aria-valuemin": 0,
                  "aria-valuemax": 100,
                  "aria-valuenow": progress,
                }
              : { "aria-hidden": "true" })}
          >
            {bars.map((h, k) => (
              <i key={k} className={k < litBars ? "is-on" : undefined} style={{ "--h": h }} />
            ))}
            {shownIsPlaying && <span className="sb-playhead" style={{ "--p": `${progress}%` }} />}
          </div>
        </div>
      </div>

      <div className="sb-search">
        <span className="sb-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="sb-search-input"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder={t("samplePacks.browserSearch")}
          aria-label={t("samplePacks.browserSearchLabel")}
          aria-controls={`${uid}-tree`}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button type="button" className="sb-search-clear" onClick={clearSearch} aria-label={t("samplePacks.browserClear")}>
            ×
          </button>
        )}
      </div>

      <div className="sb-scroll">
        <ul
          id={`${uid}-tree`}
          className="sb-tree"
          role="tree"
          aria-label={t("samplePacks.browserLabel")}
          ref={treeRef}
          onKeyDown={onTreeKeyDown}
          onClick={onTreeClick}
          onFocus={onTreeFocus}
        >
          {shownFolders.map((i) => {
            const folder = folders[i];
            const key = folderKey(i);
            const expanded = isOpen(i);
            const rows = shownSamples(i);
            return (
              <li
                key={key}
                role="treeitem"
                aria-expanded={expanded}
                aria-selected={shownKey === key}
                aria-labelledby={`${uid}-${key}`}
                data-key={key}
                tabIndex={tabKey === key ? 0 : -1}
                className={`sb-folder${expanded ? " is-open" : ""}`}
              >
                <div className="sb-row">
                  <span className="sb-chev" aria-hidden="true" />
                  <span className="sb-folder-icon" aria-hidden="true" />
                  <span id={`${uid}-${key}`} className="sb-name">
                    {folder.name}
                  </span>
                  <span className="sb-count" aria-hidden="true">
                    {searching ? `${rows.length} / ${folder.samples.length}` : folder.samples.length}
                  </span>
                </div>
                {expanded && rows.length > 0 && (
                  <ul role="group" className="sb-group">
                    {rows.map(({ j, parts }) => {
                      const sample = folder.samples[j];
                      const sKey = sampleKey(i, j);
                      return (
                        <SampleRow
                          key={sample._id || sKey}
                          sample={sample}
                          number={j + 1}
                          rowKey={sKey}
                          labelId={`${uid}-${sKey}`}
                          tabbable={tabKey === sKey}
                          selected={shownKey === sKey}
                          playing={playingKey === sKey}
                          parts={parts}
                        />
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        {searching && visible.length === 0 && (
          <p className="sb-empty" role="status">
            {t("samplePacks.browserNoResults", { query: query.trim() })}
          </p>
        )}
      </div>

      <div className="sb-foot">
        <span className="sb-hints">{t("samplePacks.browserHints")}</span>
        <span className="sb-brand">{t("samplePacks.browserFooter", { title: packTitle })}</span>
      </div>
    </div>
  );
}
