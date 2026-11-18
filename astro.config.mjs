// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fairy-pitta.net",
  build: {
    // One request less before first paint; the sheet is a few KB.
    inlineStylesheets: "always",
  },
  // The project index became the Work page at /, and the projects from the
  // job are listed there too.
  redirects: {
    "/projects": "/",
    "/work": "/#selected-work",
  },
  // The glob loader renders every Markdown file with Astro's pipeline, but the
  // pages use markdownToHtml (src/lib/markdown.ts) and its own highlighter, so
  // Shiki would only do unused work and warn about languages it lacks.
  markdown: {
    syntaxHighlight: false,
  },
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },
});
