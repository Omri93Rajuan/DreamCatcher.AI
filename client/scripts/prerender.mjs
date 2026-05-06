import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const serverEntry = path.join(rootDir, "dist-ssr", "entry-server.js");
const siteUrl = "https://dreamaicatcher.com";

const {
  render,
  getPrerenderRoutes,
  getSeoForPath,
  renderSeoHead,
  getSitemapEntries,
} = await import(pathToFileURL(serverEntry).href);

const template = await readFile(path.join(distDir, "index.html"), "utf8");

function stripExistingSeo(html) {
  return html
    .replace(/\s*<title>[\s\S]*?<\/title>/gi, "")
    .replace(/\s*<meta\s+name=["']description["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\s+name=["']keywords["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\s+name=["']robots["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\s+name=["']author["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\s+name=["']twitter:card["'][^>]*\/?>/gi, "")
    .replace(/\s*<link\s+rel=["']canonical["'][^>]*\/?>/gi, "")
    .replace(/\s*<meta\s+property=["'](?:og:[^"']+|article:[^"']+)["'][^>]*\/?>/gi, "")
    .replace(/\s*<script\s+type=["']application\/ld\+json["'][\s\S]*?<\/script>/gi, "");
}

function htmlForRoute(appHtml, seo) {
  const withApp = stripExistingSeo(template).replace(
    '<div id="root"></div>',
    `<div id="root">${appHtml}</div>`,
  );

  return withApp.replace("</head>", `    ${renderSeoHead(seo)}\n  </head>`);
}

function routeFile(route) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, route.replace(/^\/+/, ""), "index.html");
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(route) {
  return new URL(route, siteUrl).href;
}

function sitemapXml(entries) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = entries
    .map(({ path: route, lastmod }) => {
      const date = lastmod
        ? new Date(lastmod).toISOString().slice(0, 10)
        : today;
      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(route))}</loc>`,
        `    <lastmod>${escapeXml(date)}</lastmod>`,
        "  </url>",
      ].join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    "</urlset>",
    "",
  ].join("\n");
}

function redirects(entries) {
  const lines = entries
    .map(({ path: route }) => route)
    .filter((route) => route !== "/")
    .map((route) => `${route} ${route}/index.html 200`);

  return [...lines, "/* /index.html 200", ""].join("\n");
}

for (const route of getPrerenderRoutes()) {
  const appHtml = await render(route);
  const file = routeFile(route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, htmlForRoute(appHtml, getSeoForPath(route)), "utf8");
  console.log(`prerendered ${route}`);
}

await writeFile(
  path.join(distDir, "sitemap.xml"),
  sitemapXml(getSitemapEntries()),
  "utf8",
);

await writeFile(
  path.join(distDir, "robots.txt"),
  ["User-agent: *", "Allow: /", "", "Sitemap: https://dreamaicatcher.com/sitemap.xml", ""].join("\n"),
  "utf8",
);

await writeFile(
  path.join(distDir, "_redirects"),
  redirects(getSitemapEntries()),
  "utf8",
);

console.log("wrote sitemap.xml, robots.txt, and _redirects");
