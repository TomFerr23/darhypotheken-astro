import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://darhypotheken.nl",
  output: "static",
  adapter: vercel(),
  i18n: {
    defaultLocale: "nl",
    locales: ["nl", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    react(),
    sitemap({
      i18n: {
        defaultLocale: "nl",
        locales: { nl: "nl-NL", en: "en-US" },
      },
    }),
    sanity({
      projectId: "wg4j13ic",
      dataset: "production",
      studioBasePath: "/studio",
      useCdn: true,
      apiVersion: "2024-01-01",
    }),
  ],
});
