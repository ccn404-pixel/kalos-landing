import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import styleX from "vite-plugin-stylex";

export default defineConfig({
  site: "https://kalostechnology.com",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [styleX()],
  },
});
