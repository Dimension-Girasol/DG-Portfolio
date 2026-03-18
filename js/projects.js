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

  const modalStage = section.querySelector(".projects__modal-stage");
  const canHoverFinePointer =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resetZoomPosition = () => {
    if (!canHoverFinePointer || !modalStage) return;
    modalStage.style.setProperty("--zoom-x", "50%");
    modalStage.style.setProperty("--zoom-y", "50%");
  };

  const updateZoomPositionFromPointerEvent = (event) => {
    if (!canHoverFinePointer || !modalStage) return;
    if (!modal.classList.contains("is-open")) return;

    const rect = modalStage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const y = clamp((event.clientY - rect.top) / rect.height, 0, 1);

    modalStage.style.setProperty("--zoom-x", `${x * 100}%`);
    modalStage.style.setProperty("--zoom-y", `${y * 100}%`);
  };

  if (canHoverFinePointer && modalStage) {
    modalStage.addEventListener("pointerenter", resetZoomPosition);
    modalStage.addEventListener("pointermove", updateZoomPositionFromPointerEvent);
    modalStage.addEventListener("pointerleave", resetZoomPosition);
  }

  const FILE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
  const MAX_FILES_PER_FOLDER = 40;

  const setModalState = (open) => {
    modal.classList.toggle("is-open", open);
    modal.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("modal-open", open);
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

  const checkImageExists = (src) =>
    new Promise((resolve) => {
      const probe = new Image();
      probe.onload = () => resolve(true);
      probe.onerror = () => resolve(false);
      probe.src = src;
    });

  const loadFolderImages = async (folderPath, title) => {
    if (folderCache.has(folderPath)) {
      return folderCache.get(folderPath);
    }

    const discovered = [];
    let missesInRow = 0;

    for (let index = 0; index <= MAX_FILES_PER_FOLDER; index += 1) {
      let foundAtIndex = false;

      for (const ext of FILE_EXTENSIONS) {
        const src = `${folderPath}/${index}.${ext}`;
        // eslint-disable-next-line no-await-in-loop
        const exists = await checkImageExists(src);
        if (exists) {
          discovered.push({
            src,
            alt: `${title} - imagen ${discovered.length + 1}`
          });
          foundAtIndex = true;
          break;
        }
      }

      if (foundAtIndex) {
        missesInRow = 0;
      } else {
        missesInRow += 1;
      }

      if (discovered.length && missesInRow >= 6) {
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
    const folderImages = folderPath ? await loadFolderImages(folderPath, title) : [];
    const images = folderImages.length ? folderImages : fallbackImages;

    modalTitle.textContent = title;
    currentImages = images;
    currentIndex = 0;

    buildThumbs();
    renderActiveImage();

    lastFocusedElement = document.activeElement;
    setModalState(true);
    modal.querySelector(".projects__modal-close, .projects-modal__close")?.focus();
  };

  galleriesWrap.addEventListener("click", (event) => {
    if (event.target.closest(".projects__modal-thumb, .projects-modal__thumb")) return;
    const card = event.target.closest(".gallery");
    if (!card || !galleriesWrap.contains(card)) return;
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
