(() => {
    const key = "dg-theme";
    const saved = localStorage.getItem(key);
    const theme = saved === "light" || saved === "dark" ? saved : "light";
    document.documentElement.dataset.theme = theme;
})();
