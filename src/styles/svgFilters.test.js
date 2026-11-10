// Los filtros SVG (tinta gastada, grano de película) viven en index.html y el CSS
// los usa con url(#id). Si un id no existe, el navegador ignora el filtro en silencio
// y la textura desaparece sin ningún error: este test lo atrapa.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const html = readFileSync(join(root, "index.html"), "utf8");

const cssFiles = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return cssFiles(full);
    return name.endsWith(".css") ? [full] : [];
  });

const css = cssFiles(join(root, "src")).map((file) => ({ file, text: readFileSync(file, "utf8") }));

describe("SVG filters", () => {
  it("every url(#id) used in the CSS is defined in index.html", () => {
    const missing = [];
    for (const { file, text } of css) {
      for (const [, id] of text.matchAll(/url\(#([\w-]+)\)/g)) {
        if (!html.includes(`id="${id}"`)) missing.push(`${id} (${file})`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("titles and big display text in every section carry the moving film grain, except the admin", () => {
    const film = css.find(({ file }) => file.endsWith("film.css"))?.text ?? "";
    expect(film).toMatch(/animation:\s*film-grain\b[^;]*,\s*film-weave\b/); // grano + temblor de proyector
    expect(film).toMatch(/@keyframes film-weave/);
    // El grano reemplaza a la tinta gastada: las dos juntas dejaban la letra agujereada.
    expect(css.some(({ text }) => text.includes("ink-worn"))).toBe(false);
    for (const target of ["h1", "h2", "h3", ".catalog-record-name", ".license-price", ".about-quote blockquote", ".sb-now"]) {
      expect(film).toContain(target);
    }
    expect(film).toContain(":not([data-admin] *)");
    expect(readFileSync(join(root, "src/components/admin/AdminLayout.jsx"), "utf8")).toContain("data-admin");
    expect(readFileSync(join(root, "src/index.jsx"), "utf8")).toContain('import "./styles/film.css"');
  });

  it("the home menu letters carry the moving film grain", () => {
    const menu = css.find(({ file }) => file.endsWith("LowerThirdMenu.css")).text;
    expect(menu).toMatch(/animation:\s*film-grain/);
    for (const frame of ["film-grain-1", "film-grain-2", "film-grain-3", "film-grain-4"]) {
      expect(html).toContain(`id="${frame}"`);
    }
  });
});
