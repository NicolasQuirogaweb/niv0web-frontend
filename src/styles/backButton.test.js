// Los botones de "Volver al inicio" / "Volver" dejaron el neón: ahora llevan la misma
// letra con grano y temblor de película que los títulos (ADR 0014).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const src = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const cssFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return cssFiles(full);
    return name.endsWith(".css") ? [full] : [];
  });

// Cada bloque { ... } cuyo selector nombra al botón de volver.
const backButtonRules = () =>
  cssFiles(src).flatMap((file) => {
    const text = readFileSync(file, "utf8");
    return [...text.matchAll(/([^{}]*\.back-to-catalogue-btn[^{}]*)\{([^}]*)\}/g)].map(([, selector, body]) => ({
      file,
      selector: selector.trim(),
      body,
    }));
  });

describe("back buttons", () => {
  it("have no neon: no glow box-shadow and no hover zoom", () => {
    const neon = backButtonRules()
      .filter(({ body }) => /box-shadow|scale\(/.test(body))
      .map(({ file, selector }) => `${selector} (${file})`);
    expect(neon).toEqual([]);
  });

  it("are styled in one place, not repeated per page", () => {
    const visual = backButtonRules().filter(({ body }) => /border:|font-family|color:/.test(body));
    const files = [...new Set(visual.map(({ file }) => file))];
    expect(files).toEqual([join(src, "index.css")]);
  });

  it("carry the film grain and gate weave like the titles", () => {
    const film = readFileSync(join(src, "styles/film.css"), "utf8");
    expect(film).toContain(".back-to-catalogue-btn");
  });
});
