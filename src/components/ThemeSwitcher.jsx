import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    // read once on mount
    if (typeof window === "undefined") return "synthwave";
    return localStorage.getItem("theme") || "synthwave";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "synthwave" ? "black" : "synthwave"));
  const isDark = theme === "black";

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-circle btn-sm"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "synthwave" : "black"} theme`}
    >
      {/* DaisyUI swap uses a hidden checkbox to control which icon shows */}
      <input
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        aria-hidden="true"
      />

      {/* When checked -> show .swap-on; when unchecked -> show .swap-off */}
      <Sun size={18} className="swap-on" />   {/* shown in dark mode (to switch back to light) */}
      <Moon size={18} className="swap-off" /> {/* shown in light mode (to switch to dark) */}
    </label>
  );
};

export default ThemeSwitcher;
