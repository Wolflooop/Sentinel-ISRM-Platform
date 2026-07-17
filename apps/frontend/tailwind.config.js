/** @type {import('tailwindcss').Config} */
export default {
  // El toggle de tema (ThemeProvider + ThemeToggle) alterna la clase `dark`
  // en <html>; con "class" Tailwind activa las variantes dark: solo cuando
  // esa clase está presente, en vez de seguir la preferencia del SO en cada
  // render.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Nombres semánticos respaldados por variables CSS (ver
        // src/index.css). El componente nunca cambia de clase entre modo
        // claro/oscuro — solo cambia el valor de la variable detrás de ella.
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
