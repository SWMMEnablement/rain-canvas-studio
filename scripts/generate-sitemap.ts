// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pattern permalinks are read from the pattern catalog source so the sitemap stays in sync.
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://rain-canvas-studio.lovable.app";

const src = readFileSync(resolve("src/components/PatternSelector.tsx"), "utf8");
const selectorIds = Array.from(src.matchAll(/^\s*id:\s*['"]([a-z0-9_]+)['"]/gim), (m) => m[1]);
// Wizard-only patterns: keys of the exported patternNames map (what /patterns/:slug resolves against).
const wiz = readFileSync(resolve("src/components/StormWizard.tsx"), "utf8");
const start = wiz.indexOf("export const patternNames");
const block = wiz.slice(start, wiz.indexOf("\n};", start));
const wizardIds = Array.from(block.matchAll(/^\s*['"]?([a-z0-9_]+)['"]?\s*:\s*['"]/gim), (m) => m[1]);
const ids = Array.from(new Set([...selectorIds, ...wizardIds])).sort();

const urls = [
  `  <url>\n    <loc>${BASE_URL}/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>`,
  ...ids.map(
    (id) => `  <url>\n    <loc>${BASE_URL}/patterns/${encodeURIComponent(id)}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`,
  ),
];

writeFileSync(
  resolve("public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
);
console.log(`sitemap.xml written (${urls.length} entries)`);
