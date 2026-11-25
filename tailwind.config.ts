import type { Config } from "tailwindcss";

// Paleta oficial Pilaris. Cinza (#7E8C8D) e âmbar (#CD8032) não atingem contraste AA
// para texto pequeno sobre branco: usar apenas em bordas, ícones, detalhes e textos grandes.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#1A365D",
        ink: "#2D3E50",
        amber: "#CD8032",
        stone: "#7E8C8D",
      },
      fontFamily: {
        serif: ['"Bodoni Moda Variable"', "Didot", "Georgia", "serif"],
        sans: ['"Jost Variable"', "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      maxWidth: { page: "90rem" },
    },
  },
  plugins: [],
};
export default config;
