function initHeader() {
  // Element IDs
  const toggleBtn = document.querySelector(".navbar__toggle-btn");
  const toggleIcon = document.querySelector(".navbar__toggle-icon");
  const mobileMenu = document.querySelector(".navbar__mobile-menu");
  const mobileLinks = document.querySelectorAll(".nav__list-mobile a");
  const themeToggleBtn = document.querySelector(".theme-toggle");
  const themeToggleIcon = themeToggleBtn?.querySelector(".theme-toggle__icon");

  if (!toggleBtn || !mobileMenu) return;

  const themeStorageKey = "dg-theme";

  const getTheme = () =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light";

  const getPreferredTheme = () => {
    try {
      const saved = localStorage.getItem(themeStorageKey);
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      // ignore
    }
    const prefersDark =
      window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  };

  const resolveMenuIcon = (kind, theme) => {
    const isOpenIcon = kind === "open";

    const lightAttr = isOpenIcon ? "openIconLight" : "closeIconLight";
    const darkAttr = isOpenIcon ? "openIconDark" : "closeIconDark";

    const lightFallback = isOpenIcon
      ? "/src/assets/images/header/menu-icon-light.svg"
      : "/src/assets/images/header/close_menu-icon-light.svg";
    const darkFallback = isOpenIcon
      ? "/src/assets/images/header/menu-icon-dark.svg"
      : "/src/assets/images/header/close_menu-icon_dark.svg";

    const legacyAttr = isOpenIcon ? "openIcon" : "closeIcon";
    const light = toggleBtn.dataset[lightAttr] || toggleBtn.dataset[legacyAttr] || lightFallback;
    const dark = toggleBtn.dataset[darkAttr] || toggleBtn.dataset[legacyAttr] || darkFallback;

    return theme === "dark" ? dark : light;
  };

  const updateToggleIcon = (isOpen) => {
    if (!toggleIcon) return;
    const theme = getTheme();
    toggleIcon.src = isOpen ? resolveMenuIcon("close", theme) : resolveMenuIcon("open", theme);
  };

  const syncThemedImages = (theme) => {
    document.querySelectorAll("img.themed-image").forEach((img) => {
      const light = img.dataset.srcLight;
      const dark = img.dataset.srcDark;
      if (!light && !dark) return;
      img.src = theme === "dark" ? dark || light : light || dark;
    });
  };

  const syncThemeAssets = (theme = getTheme()) => {
    syncThemedImages(theme);
    updateToggleIcon(mobileMenu.classList.contains("active"));
  };

  window.dgSyncThemeAssets = () => syncThemeAssets(getTheme());

  const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;

    if (themeToggleBtn) {
      const isDark = theme === "dark";
      themeToggleBtn.setAttribute("aria-pressed", String(isDark));
      themeToggleBtn.setAttribute(
        "aria-label",
        isDark ? "Activar modo claro" : "Activar modo oscuro"
      );
    }

    if (themeToggleIcon) {
      const isDark = theme === "dark";
      themeToggleIcon.classList.toggle("fa-solid", isDark);
      themeToggleIcon.classList.toggle("fa-regular", !isDark);
    }

    syncThemeAssets(theme);
  };

  const animateThemeToggle = () => {
    if (!themeToggleBtn) return;
    themeToggleBtn.classList.remove("is-animating");
    void themeToggleBtn.offsetWidth;
    themeToggleBtn.classList.add("is-animating");
  };

  if (themeToggleBtn) {
    applyTheme(getPreferredTheme());

    themeToggleBtn.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme || "light";
      const next = current === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(themeStorageKey, next);
      } catch {
        // ignore
      }
      applyTheme(next);
      animateThemeToggle();
    });

    themeToggleBtn.addEventListener("animationend", () => {
      themeToggleBtn.classList.remove("is-animating");
    });
  }

  // Navbar state for default <- CLOSED -> show: menu-icon
  syncThemeAssets(getTheme());

  const closeMenu = () => {
    // Change state
    mobileMenu.classList.remove("active");
    toggleBtn.classList.remove("active");

    // Accesibility
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menú de navegación");
    updateToggleIcon(false);
  };

  const toggleMenu = () => {
    // Flag
    const isOpen = mobileMenu.classList.toggle("active");
    toggleBtn.classList.toggle("active", isOpen);

    // Accesbility
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
    updateToggleIcon(isOpen); // set menu state to change icon
  };

  // Execute toggleMenu() -> set state 
  // (open? -> close / close? -> open)
  toggleBtn.addEventListener("click", toggleMenu);

  // Get element of menu was clicked
  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Click outside? -> close menu
  document.addEventListener("click", (event) => {
    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = toggleBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });

  // Close menu press "Escape" keyboard
  /* document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  }); */
}

initHeader();
