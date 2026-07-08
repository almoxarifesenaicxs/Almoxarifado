const THEME_KEY = "@senai:theme";

export type ThemeMode = "light" | "dark";

export function getTemaSalvo(): ThemeMode {
  return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
}

export function aplicarTema(theme: ThemeMode) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
}

export function alternarTema(): ThemeMode {
  const proximoTema = document.documentElement.classList.contains("dark")
    ? "light"
    : "dark";

  aplicarTema(proximoTema);
  return proximoTema;
}
