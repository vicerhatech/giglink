import { createContext, useContext, useEffect, useState } from "react";
import "./themes.css";

const ThemeContext = createContext(null);
export const THEMES = [{ id: "forest", name: "Forest & Gold", color: "#254f40" }, { id: "ocean", name: "Ocean Blue", color: "#235c7b" }, { id: "plum", name: "Soft Plum", color: "#70486f" }];
function readPreference() {
  try {
    const stored = JSON.parse(localStorage.getItem("giglink_appearance"));
    return { mode: ["light", "dark", "system"].includes(stored?.mode) ? stored.mode : "system", theme: THEMES.some(item => item.id === stored?.theme) ? stored.theme : "forest" };
  } catch { return { mode: "system", theme: "forest" }; }
}
function apply(preference) {
  document.documentElement.dataset.mode = preference.mode === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : preference.mode;
  document.documentElement.dataset.theme = preference.theme;
}
apply(readPreference());

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  useEffect(() => {
    apply(preference);
    try { localStorage.setItem("giglink_appearance", JSON.stringify(preference)); } catch { /* Private browsing may disable persistence. */ }
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => apply(preference);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preference]);
  return <ThemeContext.Provider value={{ ...preference, setMode: mode => setPreference(value => ({ ...value, mode })), setTheme: theme => setPreference(value => ({ ...value, theme })) }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  return <button className="theme-toggle" type="button" aria-label={`Switch to ${dark ? "light" : "dark"} mode`} onClick={() => setMode(dark ? "light" : "dark")}>{dark ? "☀" : "☾"}</button>;
}
