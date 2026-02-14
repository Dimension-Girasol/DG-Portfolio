function initHeader() {
  const toggleBtn = document.querySelector(".navbar__toggle-btn");
  const mobileMenu = document.querySelector(".navbar__mobile-menu");
  const mobileLinks = document.querySelectorAll(".nav__list-mobile a");

  if (!toggleBtn || !mobileMenu) return;

  const closeMenu = () => {
    mobileMenu.classList.remove("active");
    toggleBtn.classList.remove("active");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menú de navegación");
  };

  const toggleMenu = () => {
    const isOpen = mobileMenu.classList.toggle("active");
    toggleBtn.classList.toggle("active", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"
    );
  };

  toggleBtn.addEventListener("click", toggleMenu);

  mobileLinks.forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    const clickedInsideMenu = mobileMenu.contains(event.target);
    const clickedToggle = toggleBtn.contains(event.target);

    if (!clickedInsideMenu && !clickedToggle) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

initHeader();
