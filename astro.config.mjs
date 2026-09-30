// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://fairy-pitta.net",
  build: {
    // One request less before first paint; the sheet is a few KB.
    inlineStylesheets: "always",
  },
  prefetch: {
    defaultStrategy: "hover",
    prefetchAll: true,
  },
});
