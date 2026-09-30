import type { APIContext } from "astro"
import { absoluteUrl, indexablePages } from "../lib/site-map"

const escape = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

const isoDate = (date: Date) => date.toISOString().slice(0, 10)

export function GET(context: APIContext) {
  const site = context.site!

  const entries = indexablePages().map((entry) => {
    const loc = `    <loc>${escape(absoluteUrl(entry.path, site))}</loc>`
    const lastmod = entry.date ? `\n    <lastmod>${isoDate(entry.date)}</lastmod>` : ""
    return `  <url>\n${loc}${lastmod}\n  </url>`
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n")

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  })
}
