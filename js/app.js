document.addEventListener("DOMContentLoaded", () => {
    // Selección de elementos del DOM
    const toggleButton = document.querySelector(".navbar__toggle-btn");
    const mobileMenu = document.querySelector(".navbar__mobile-menu");


    const toggleMenu = () => {
        mobileMenu.style.display =
            mobileMenu.style.display === "none" || mobileMenu.style.display === ""
            ? "flex"
            : "none";
    };

    // Ocultar el menu desplegable
    const hideMenuResize = () => {
        mobileMenu.style.display = "none";
    }

    toggleButton.addEventListener("click", toggleMenu); // Ocultar/mostrar menu
    window.addEventListener("resize", hideMenuResize); // Ver cuando cambia la pantalla de tamaño
    window.addEventListener("load", hideMenuResize); // Al cargar la página, ocultar menú
});