import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <button
      className="btn btn-ghost btn-circle text-xl btn-sm"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
};

export default ThemeSwitcher;
