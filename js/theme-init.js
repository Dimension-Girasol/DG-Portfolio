(() => {
    const key = "dg-theme";
    const saved = localStorage.getItem(key);
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved === "light" || saved === "dark" ? saved : prefersDark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
})();
