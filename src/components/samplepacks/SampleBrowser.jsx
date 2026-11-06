import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./SampleBrowser.css";

// Navegador de samples al estilo del browser de FL Studio: carpetas que se abren
// y samples que suenan al tocarlos. Teclado según el patrón de árbol de WAI-ARIA;
// el árbol usa preventDefault en cada tecla que maneja para que useConsoleNav
// (flechas de la página, ADR 0008) la deje pasar.

export const flattenFolders = (folders) => folders.flatMap((folder) => folder.samples);

const formatDuration = (sec) => {
  const total = Math.round(sec);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const folderKey = (i) => `f${i}`;
const sampleKey = (i, j) => `s${i}:${j}`;
const folderOf = (key) => (key.startsWith("s") ? folderKey(key.slice(1).split(":")[0]) : key);

export function SampleBrowser({ folders, player }) {
  const { t } = useTranslation();
  const uid = useId();
  const treeRef = useRef(null);
  const [open, setOpen] = useState(() => new Set([0]));
  const [focusKey, setFocusKey] = useState(folderKey(0));

  // Índice de reproducción de cada sample: su posición en flattenFolders.
  let counter = 0;
  const flatIndex = folders.map((folder) => folder.samples.map(() => counter++));

  const visible = folders.flatMap((folder, i) => [
    folderKey(i),
    ...(open.has(i) ? folder.samples.map((_, j) => sampleKey(i, j)) : []),
  ]);
  // Si la carpeta del item enfocado se cierra, el tabindex pasa a la carpeta.
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

  const focusItem = (key) => {
    setFocusKey(key);
    treeRef.current?.querySelector(`[data-key="${key}"]`)?.focus();
  };

  const activate = (key) => {
    if (key.startsWith("f")) {
      toggleFolder(Number(key.slice(1)));
    } else {
      const [i, j] = key.slice(1).split(":").map(Number);
      player.toggleTrack(flatIndex[i][j]);
    }
  };

  const onKeyDown = (event) => {
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
          if (!open.has(folderIndex)) toggleFolder(folderIndex);
          else if (folders[folderIndex].samples.length) focusItem(sampleKey(folderIndex, 0));
        }
        break;
      case "ArrowLeft":
        if (isFolder) {
          if (open.has(folderIndex)) toggleFolder(folderIndex);
        } else {
          focusItem(folderKey(folderIndex));
        }
        break;
      case "Enter":
      case " ":
        activate(key);
        break;
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  const playing = player.currentIndex != null ? flattenFolders(folders)[player.currentIndex] : null;
  const playingFolder = playing ? folders.find((folder) => folder.samples.includes(playing)) : null;
  const progress = player.duration > 0 ? Math.round((player.currentTime / player.duration) * 100) : 0;

  return (
    <div className="sample-browser">
      <div className="sample-browser-now" aria-live="polite">
        {playing ? (
          <span className="sample-browser-now-title">{`${playingFolder.name} · ${playing.title}`}</span>
        ) : (
          <span className="sample-browser-now-idle">{t("samplePacks.browserIdle")}</span>
        )}
        <div
          className="sample-browser-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="sample-browser-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ul
        className="sample-browser-tree"
        role="tree"
        aria-label={t("samplePacks.browserLabel")}
        ref={treeRef}
        onKeyDown={onKeyDown}
      >
        {folders.map((folder, i) => {
          const isOpen = open.has(i);
          const key = folderKey(i);
          return (
            <li
              key={key}
              role="treeitem"
              aria-expanded={isOpen}
              aria-labelledby={`${uid}-${key}`}
              data-key={key}
              tabIndex={tabKey === key ? 0 : -1}
              className="sample-browser-folder"
              onClick={(event) => {
                if (event.target.closest('[role="treeitem"]') !== event.currentTarget) return;
                setFocusKey(key);
                toggleFolder(i);
              }}
            >
              <div className="sample-browser-row">
                <span className="sample-browser-icon sample-browser-icon-folder" aria-hidden="true" />
                <span id={`${uid}-${key}`} className="sample-browser-name">
                  {folder.name}
                </span>
              </div>
              {isOpen && (
                <ul role="group" className="sample-browser-group">
                  {folder.samples.map((sample, j) => {
                    const sKey = sampleKey(i, j);
                    const index = flatIndex[i][j];
                    return (
                      <li
                        key={sample._id}
                        role="treeitem"
                        aria-selected={player.currentIndex === index}
                        aria-labelledby={`${uid}-${sKey}`}
                        data-key={sKey}
                        tabIndex={tabKey === sKey ? 0 : -1}
                        className="sample-browser-sample"
                        onClick={() => {
                          setFocusKey(sKey);
                          player.toggleTrack(index);
                        }}
                      >
                        <div className="sample-browser-row">
                          <span className="sample-browser-icon sample-browser-icon-sample" aria-hidden="true" />
                          <span id={`${uid}-${sKey}`} className="sample-browser-name">
                            {sample.title}
                          </span>
                          {sample.durationSec ? (
                            <span className="sample-browser-duration">{formatDuration(sample.durationSec)}</span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
