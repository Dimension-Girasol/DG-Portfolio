function initHeader() {
  // Element IDs
  const toggleBtn = document.querySelector(".navbar__toggle-btn");
  const toggleIcon = document.querySelector(".navbar__toggle-icon");
  const mobileMenu = document.querySelector(".navbar__mobile-menu");
  const mobileLinks = document.querySelectorAll(".nav__list-mobile a");

  if (!toggleBtn || !mobileMenu) return;

  // Set menu images (Open/Close)
  // Get dataSet from HTML and set value for default
  const openIcon = toggleBtn.dataset.openIcon || "/src/assets/images/header/menu-icon.png";
  const closeIcon = toggleBtn.dataset.closeIcon || "/src/assets/images/header/close_menu-icon.png";

  const updateToggleIcon = (isOpen) => {
    if (!toggleIcon) return; // exists?
    toggleIcon.src = isOpen ? closeIcon : openIcon;
  };

  // Navbar state for default <- CLOSED -> show: menu-icon
  updateToggleIcon(false);

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
