function initProjectsFilter() {
  const section = document.querySelector("#projects");

  if (!section || section.dataset.filterReady === "true") return;
  section.dataset.filterReady = "true";

  const filters = section.querySelectorAll(".projects__filter");
  const cards = section.querySelectorAll(".gallery");
  const loading = section.querySelector(".projects__loading");
  if (!filters.length || !cards.length) return;

  const LOADING_TIME_MS = 350;
  let loadingTimerId;

  const updateActiveFilter = (selected) => {
    filters.forEach((filter) => {
      const isActive = filter.dataset.filter === selected;
      filter.classList.toggle("is-active", isActive);
      filter.setAttribute("aria-pressed", String(isActive));
    });
  };

  const updateCards = (selected) => {
    cards.forEach((card) => {
      const creators = Array.from(
        card.querySelectorAll(".gallery__tag-creator")
      )
        .map((tag) => tag.textContent.trim().toLowerCase())
        .filter(Boolean);

      const show = selected === "all" || creators.includes(selected);
      card.classList.toggle("is-hidden", !show);
    });
  };

  const setLoading = (state, selected) => {
    section.classList.toggle("is-loading", state);
    if (!loading) return;

    if (!state) {
      loading.textContent = "";
      return;
    }

    const label = selected === "all" ? "todos" : selected;
    loading.textContent = "Cargando proyectos de " + label + "...";
  };

  filters.forEach((filter) => {
    filter.addEventListener("click", () => {
      if (section.classList.contains("is-loading")) return;

      const selected = (filter.dataset.filter || "all").toLowerCase();
      const alreadyActive = filter.classList.contains("is-active");
      if (alreadyActive) return;

      updateActiveFilter(selected);
      setLoading(true, selected);

      clearTimeout(loadingTimerId);
      loadingTimerId = window.setTimeout(() => {
        updateCards(selected);
        setLoading(false);
      }, LOADING_TIME_MS);
    });
  });

  const initialActive = section.querySelector(".projects__filter.is-active");
  const initialSelected = (initialActive?.dataset.filter || "all").toLowerCase();
  updateActiveFilter(initialSelected);
  updateCards(initialSelected);
  setLoading(false);
}

function initProjectsModal() {
  const section = document.querySelector("#projects");
  if (!section || section.dataset.modalReady === "true") return;
  section.dataset.modalReady = "true";

  const modal = section.querySelector("#projects-modal");
  const modalImage =
    section.querySelector("#projects__modal-image") ||
    section.querySelector("#projects-modal-image");
  const modalThumbs = section.querySelector("#projects-modal-thumbs");
  const modalTitle =
    section.querySelector("#projects__modal-title") ||
    section.querySelector("#projects-modal-title");
  const modalCounter = section.querySelector("#projects-modal-counter");
  const prevButton = section.querySelector("#projects-modal-prev");
  const nextButton = section.querySelector("#projects-modal-next");
  const closeTriggers = section.querySelectorAll("[data-modal-close]");
  const galleriesWrap = section.querySelector("#card-gallery-projects");
  if (
    !modal ||
    !modalImage ||
    !modalThumbs ||
    !modalTitle ||
    !modalCounter ||
    !prevButton ||
    !nextButton ||
    !galleriesWrap
  ) {
    return;
  }

  let lastFocusedElement = null;
  let currentImages = [];
  let currentIndex = 0;
  const folderCache = new Map();
  let modalRequestId = 0;
  let isZoomActive = false;
  const ZOOM_SCALE = 2.4;

  const modalStage = section.querySelector(".projects__modal-stage");
  const canHoverFinePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resetZoomPosition = () => {
    if (!canHoverFinePointer || !modalStage) return;
    modalStage.style.setProperty("--zoom-x", "50%");
    modalStage.style.setProperty("--zoom-y", "50%");
    isZoomActive = false;
    modalStage.classList.remove("is-zoomed");
    modalStage.style.cursor = "zoom-in";
    modalImage.style.setProperty("transform", "scale(1)", "important");
    modalImage.style.setProperty("transform-origin", "50% 50%", "important");
  };

  const updateZoomPositionFromPointerEvent = (event) => {
    if (!canHoverFinePointer || !modalStage || !isZoomActive) return;
    if (!modal.classList.contains("is-open")) return;

    const rect = modalStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    modalStage.style.setProperty("--zoom-x", `${x * 100}%`);
    modalStage.style.setProperty("--zoom-y", `${y * 100}%`);
    modalImage.style.setProperty("transform-origin", `${x * 100}% ${y * 100}%`, "important");
  };

  const toggleZoom = (event) => {
    if (!canHoverFinePointer || !modalStage) return;
    isZoomActive = !isZoomActive;
    if (isZoomActive) {
      modalStage.classList.add("is-zoomed");
      modalStage.style.cursor = "zoom-out";
      modalImage.style.setProperty("transform", `scale(${ZOOM_SCALE})`, "important");
      updateZoomPositionFromPointerEvent(event);
    } else {
      resetZoomPosition();
    }
  };

  if (canHoverFinePointer && modalStage) {
    modalStage.style.cursor = "zoom-in";
    modalImage.style.setProperty("transition", "transform 0.3s ease-out", "important");
    modalStage.addEventListener("click", toggleZoom);
    modalStage.addEventListener("pointermove", updateZoomPositionFromPointerEvent);
    modalStage.addEventListener("pointerleave", resetZoomPosition);
  }

  const FILE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
  const MAX_FILES_PER_FOLDER = 40;

  const setModalState = (open) => {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
    document.documentElement.classList.toggle("modal-open", open);
  };

  const renderActiveImage = () => {
    if (!currentImages.length) return;

    const image = currentImages[currentIndex];
    modalImage.src = image.src;
    modalImage.alt = image.alt;
    modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    resetZoomPosition();

    modalThumbs.querySelectorAll(".projects__modal-thumb, .projects-modal__thumb").forEach((thumb, index) => {
      thumb.classList.toggle("is-active", index === currentIndex);
      thumb.setAttribute("aria-current", index === currentIndex ? "true" : "false");
    });
  };

  const changeImage = (direction) => {
    if (!currentImages.length) return;
    const total = currentImages.length;
    currentIndex = (currentIndex + direction + total) % total;
    renderActiveImage();
  };

  const buildThumbs = () => {
    modalThumbs.innerHTML = currentImages
      .map(
        (image, index) => `
          <button
            class="projects__modal-thumb ${index === currentIndex ? "is-active" : ""}"
            type="button"
            data-modal-index="${index}"
            aria-label="Ver imagen ${index + 1}">
            <img src="${image.src}" alt="${image.alt}" loading="lazy" />
          </button>
        `
      )
      .join("");
  };

  // Diccionario Mock de datos.
  // Añade aquí las rutas de tus proyectos y los nombres exactos de sus imágenes
  // para que la carga sea instantánea en móviles y no haga peticiones a ciegas.
  const PROJECTS_MOCK_DATA = {
    "/src/assets/images/projects/gallery/ansiedad": ["1.png", "2.png", "3.png", "4.png"],
    "/src/assets/images/projects/gallery/caitlyn": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    "/src/assets/images/projects/gallery/hornet": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    "/src/assets/images/projects/gallery/katarina": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"],
    "/src/assets/images/projects/gallery/mononoke": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"],
    "/src/assets/images/projects/gallery/pesadilla": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg", "8.jpg", "9.jpg"],
    "/src/assets/images/projects/gallery/scar": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg"],
    "/src/assets/images/projects/gallery/tanjiro": ["0.jpg", "1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"]
  };

  const checkImageExists = (src) =>
    new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(src);
      probe.onerror = () => resolve(null);
      probe.src = src;
    });

  const loadFolderImages = async (folderPath, title) => {
    if (folderCache.has(folderPath)) {
      return folderCache.get(folderPath);
    }

    // 1. Carga instantánea si la carpeta está registrada en el mock
    if (PROJECTS_MOCK_DATA[folderPath]) {
      const mockImages = PROJECTS_MOCK_DATA[folderPath].map((filename, index) => ({
        src: `${folderPath}/${filename}`,
        alt: `${title} - imagen ${index + 1}`
      }));
      folderCache.set(folderPath, mockImages);
      return mockImages;
    }

    // 2. Si no está en el mock, usamos la búsqueda en paralelo (mucho más rápida)
    const discovered = [];
    let missesInRow = 0;

    for (let index = 0; index <= MAX_FILES_PER_FOLDER; index += 1) {
      // Disparamos la comprobación de todas las extensiones a la vez para este número
      const promises = FILE_EXTENSIONS.map((ext) => checkImageExists(`${folderPath}/${index}.${ext}`));
      const results = await Promise.all(promises);
      const validSrc = results.find((src) => src !== null);

      if (validSrc) {
        discovered.push({
          src: validSrc,
          alt: `${title} - imagen ${discovered.length + 1}`
        });
        missesInRow = 0;
      } else {
        missesInRow += 1;
      }

      // Abortamos muy rápido: si ya encontramos fotos y fallan 2 números seguidos, paramos
      if (discovered.length && missesInRow >= 2) {
        break;
      }
    }

    folderCache.set(folderPath, discovered);
    return discovered;
  };

  const closeModal = () => {
    setModalState(false);
    modalImage.src = "";
    modalImage.alt = "";
    modalThumbs.innerHTML = "";
    modalCounter.textContent = "";
    currentImages = [];
    currentIndex = 0;
    resetZoomPosition();

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  };

  const getFolderPathFromCard = (card) => {
    const coverSrc = card.querySelector(".gallery__images-cover img")?.getAttribute("src");
    if (!coverSrc) return null;
    const lastSlash = coverSrc.lastIndexOf("/");
    if (lastSlash === -1) return null;
    return coverSrc.slice(0, lastSlash);
  };

  const getFallbackImagesFromCard = (card, title) =>
    Array.from(
      card.querySelectorAll(".gallery__images-cover img, .gallery__images-more .gallery__thumb > img")
    )
      .map((img, index) => ({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || `${title} - imagen ${index + 1}`
      }))
      .filter((image) => image.src)
      .filter((image, index, all) => all.findIndex((item) => item.src === image.src) === index);

  const openModalFromCard = async (card) => {
    const title = card.querySelector(".gallery__info p")?.textContent?.trim() || "Proyecto";
    const folderPath = getFolderPathFromCard(card);
    const fallbackImages = getFallbackImagesFromCard(card, title);
    const requestId = (modalRequestId += 1);

    modalTitle.textContent = title;
    currentImages = fallbackImages;
    currentIndex = 0;

    buildThumbs();
    renderActiveImage();

    lastFocusedElement = document.activeElement;

    requestAnimationFrame(() => {
      setModalState(true);
      modal.querySelector(".projects__modal-close, .projects-modal__close")?.focus({ preventScroll: true });
    });

    if (!folderPath) return;

    const folderImages = await loadFolderImages(folderPath, title);
    if (requestId !== modalRequestId) return;
    if (!modal.classList.contains("is-open")) return;
    if (!folderImages.length) return;

    currentImages = folderImages;
    currentIndex = 0;
    buildThumbs();
    renderActiveImage();
  };

  galleriesWrap.addEventListener("click", (event) => {
    if (event.target.closest(".projects__modal-thumb, .projects-modal__thumb")) return;
    const card = event.target.closest(".gallery");
    if (!card || !galleriesWrap.contains(card)) return;
    event.preventDefault();
    openModalFromCard(card);
  });

  galleriesWrap.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const card = event.target.closest(".gallery");
    if (!card || !galleriesWrap.contains(card)) return;
    event.preventDefault();
    openModalFromCard(card);
  });

  closeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", closeModal);
  });

  prevButton.addEventListener("click", () => changeImage(-1));
  nextButton.addEventListener("click", () => changeImage(1));

  modalThumbs.addEventListener("click", (event) => {
    const button = event.target.closest(".projects__modal-thumb, .projects-modal__thumb");
    if (!button) return;
    const index = Number(button.dataset.modalIndex);
    if (Number.isNaN(index)) return;
    currentIndex = index;
    renderActiveImage();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
      return;
    }

    if (!modal.classList.contains("is-open")) return;

    if (event.key === "ArrowLeft") {
      changeImage(-1);
    } else if (event.key === "ArrowRight") {
      changeImage(1);
    }
  });

  galleriesWrap.querySelectorAll(".gallery").forEach((card) => {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    const title = card.querySelector(".gallery__info p")?.textContent?.trim() || "Proyecto";
    card.setAttribute("aria-label", `Abrir galería de ${title}`);
  });
}

initProjectsFilter();
initProjectsModal();
