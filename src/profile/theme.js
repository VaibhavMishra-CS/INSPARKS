const STORAGE_KEY = "inspark-theme";

export function getTheme() {
  return (
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem(STORAGE_KEY) ||
    "dark"
  );
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Wires a checkbox input to reflect and control the current theme.
// Call this once, after the checkbox markup exists in the DOM.
export function bindThemeToggle(inputEl) {
  if (!inputEl) return;
  inputEl.checked = getTheme() === "light";
  inputEl.addEventListener("change", () => {
    setTheme(inputEl.checked ? "light" : "dark");
  });
}