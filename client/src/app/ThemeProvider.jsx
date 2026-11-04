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
  const [systemDark, setSystemDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    apply(preference);
    try { localStorage.setItem("giglink_appearance", JSON.stringify(preference)); } catch { /* Private browsing may disable persistence. */ }
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => { apply(preference); setSystemDark(query.matches); };
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [preference]);
  return <ThemeContext.Provider value={{ ...preference, isDark: preference.mode === "dark" || preference.mode === "system" && systemDark, setMode: mode => setPreference(value => ({ ...value, mode })), setTheme: theme => setPreference(value => ({ ...value, theme })) }}>{children}</ThemeContext.Provider>;
}
export function useTheme() { return useContext(ThemeContext); }
export function ThemeToggle() {
  const { isDark, setMode } = useTheme();
  return <button className="theme-toggle" type="button" title={`Switch to ${isDark ? "light" : "dark"} mode`} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} onClick={() => setMode(isDark ? "light" : "dark")}>{isDark ? "☀" : "☾"}</button>;
}
