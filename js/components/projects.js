(function () {
  const FALLBACK_IMAGE = "src/assets/images/favicon.ico"; // Imagen de reemplazo si alguna falla
  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const projectStore = new Map();
  const t = (key, params) => window.DGI18n?.t(key, params) || key;

  const setProjectsLoading = (section, state, message) => {
    const loading = section.querySelector(".projects__loading");
    section.classList.toggle("is-loading", state);
    if (loading) loading.textContent = message || "";
  };

  const getVisibleImages = (project) => {
    const images = project.images.length ? project.images : [project.cover];
    return images.slice(0, 4);
  };

  const renderTags = (tags, className) =>
    tags.map((tag) => `<span class="gallery__tag ${className}">${escapeHtml(tag)}</span>`).join("");

  const renderThumb = (image, index, total) => {
    const remaining = Math.max(total - 4, 0);
    const isMore = index === 3 && remaining > 0;

    return `
      <div class="gallery__thumb ${isMore ? "gallery__thumb-more" : ""}" ${isMore ? `data-more="+${remaining}"` : ""}>
        <img src="${escapeHtml(image.thumbSrc || image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';" />
        ${
          isMore
            ? `<span class="gallery__more-badge" aria-hidden="true">
                <img src="src/assets/images/projects/gallery/album-icon.svg" alt="" />
                +${remaining}
              </span>`
            : ""
        }
      </div>
    `;
  };

  const renderProjectCard = (project) => {
    const visibleImages = getVisibleImages(project);
    const detailImages = visibleImages.slice(1, 4);
    const authors = project.authors.length ? project.authors : ["Dimension Girasol"];
    const tags = project.tags.length ? project.tags : [t("projects.defaultTag")];

    return `
      <article class="gallery" data-project-id="${escapeHtml(project.id)}">
        <div class="gallery__images">
          <div class="gallery__images-cover">
            <img src="${escapeHtml(project.cover.src)}" alt="${escapeHtml(project.cover.alt)}" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';" />
          </div>
          <div class="gallery__images-more">
            ${detailImages.map((image, index) => renderThumb(image, index + 1, project.images.length)).join("")}
          </div>
        </div>
        <div class="gallery__info">
          <p>${escapeHtml(project.name)}</p>
          <div class="gallery__creator" aria-label="Creador del proyecto">
            ${renderTags(authors, "gallery__tag-creator")}
          </div>
          <div class="gallery__types" aria-label="Tipos del proyecto">
            ${renderTags(tags, "gallery__tag-type")}
          </div>
        </div>
      </article>
    `;
  };

  const prepareCardsAccessibility = (galleriesWrap) => {
    galleriesWrap.querySelectorAll(".gallery").forEach((card) => {
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      const title = card.querySelector(".gallery__info p")?.textContent?.trim() || t("projects.modalTitle");
      card.setAttribute("aria-label", t("projects.openGallery", { title }));
    });
  };

  function initProjectsFilter() {
    const section = document.querySelector("#projects");

    if (!section || section.dataset.filterReady === "true") return;
    section.dataset.filterReady = "true";

    const filters = section.querySelectorAll(".projects__filter");
    const loading = section.querySelector(".projects__loading");
    if (!filters.length) return;

    // Fallback for author filter images
    filters.forEach((filter) => {
      filter.querySelectorAll("img.projects__icon").forEach((img) => {
        if (img.hasAttribute("onerror")) return;
        img.setAttribute("onerror", `this.onerror=null;this.src='${FALLBACK_IMAGE}';`);
      });
    });

    const LOADING_TIME_MS = 250;
    let loadingTimerId;
    let currentPage = 1;
    let itemsPerPage = window.innerWidth <= 900 ? 4 : 8;

    const paginationWrap = section.querySelector("#projects-pagination");
    const prevBtn = section.querySelector("#projects-page-prev");
    const nextBtn = section.querySelector("#projects-page-next");
    const pageInfo = section.querySelector("#projects-page-info");

    // Agrupamos visualmente los botones y el texto en el mismo contenedor
    if (paginationWrap && prevBtn && nextBtn && pageInfo) {
      paginationWrap.append(prevBtn, pageInfo, nextBtn);
    }

    const updateActiveFilter = (selected) => {
      filters.forEach((filter) => {
        const isActive = filter.dataset.filter === selected;
        filter.classList.toggle("is-active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
      });
    };

    const updateCards = (selected) => {
      const cards = Array.from(section.querySelectorAll(".gallery"));

      const matchingCards = cards.filter((card) => {
        const creators = Array.from(card.querySelectorAll(".gallery__tag-creator"))
          .map((tag) => tag.textContent.trim().toLowerCase())
          .filter(Boolean);

        return selected === "all" || creators.includes(selected);
      });

      const totalPages = Math.max(1, Math.ceil(matchingCards.length / itemsPerPage));
      if (currentPage > totalPages) currentPage = totalPages;

      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const visibleCards = new Set(matchingCards.slice(startIndex, endIndex));

      cards.forEach((card) => {
        card.classList.toggle("is-hidden", !visibleCards.has(card));
      });

      if (paginationWrap && prevBtn && nextBtn && pageInfo) {
        paginationWrap.style.display = totalPages <= 1 ? "none" : "flex";
        pageInfo.textContent = `${currentPage} de ${totalPages}`;
        prevBtn.style.display = currentPage <= 1 ? "none" : "inline-flex";
        nextBtn.style.display = currentPage >= totalPages ? "none" : "inline-flex";
      }
    };

    window.addEventListener("resize", () => {
      const newItemsPerPage = window.innerWidth <= 900 ? 4 : 8;
      if (newItemsPerPage !== itemsPerPage) {
        itemsPerPage = newItemsPerPage;
        currentPage = 1;
        const selected = section.querySelector(".projects__filter.is-active")?.dataset.filter || "all";
        updateCards(selected);
      }
    });

    const setFilterLoading = (state, selected) => {
      section.classList.toggle("is-loading", state);
      if (!loading) return;

      if (!state) {
        loading.textContent = "";
        return;
      }

      const label = selected === "all" ? t("projects.all") : selected;
      loading.textContent = t("projects.loadingByAuthor", { author: label });
    };

    filters.forEach((filter) => {
      filter.addEventListener("click", () => {
        if (section.classList.contains("is-loading")) return;

        const selected = (filter.dataset.filter || "all").toLowerCase();
        const alreadyActive = filter.classList.contains("is-active");
        if (alreadyActive) return;

        currentPage = 1;
        updateActiveFilter(selected);
        setFilterLoading(true, selected);

        clearTimeout(loadingTimerId);
        loadingTimerId = window.setTimeout(() => {
          updateCards(selected);
          setFilterLoading(false);
        }, LOADING_TIME_MS);
      });
    });

    const scrollToProjects = () => {
      const galleryWrap = section.querySelector("#card-gallery-projects") || section;
      const offset = 100; // Altura del navbar + un pequeño margen de respiración
      const top = galleryWrap.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          const selected = section.querySelector(".projects__filter.is-active")?.dataset.filter || "all";
          updateCards(selected);
          scrollToProjects();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentPage++;
        const selected = section.querySelector(".projects__filter.is-active")?.dataset.filter || "all";
        updateCards(selected);
        scrollToProjects();
      });
    }

    const initialActive = section.querySelector(".projects__filter.is-active");
    const initialSelected = (initialActive?.dataset.filter || "all").toLowerCase();
    updateActiveFilter(initialSelected);
    updateCards(initialSelected);
    if (loading) loading.textContent = "";
  }

  function initProjectsModal() {
    const section = document.querySelector("#projects");
    if (!section || section.dataset.modalReady === "true") return;
    section.dataset.modalReady = "true";

    const modal = section.querySelector("#projects-modal");
    const modalImage = section.querySelector("#projects__modal-image") || section.querySelector("#projects-modal-image");
    const modalThumbs = section.querySelector("#projects-modal-thumbs");
    const modalTitle = section.querySelector("#projects__modal-title") || section.querySelector("#projects-modal-title");
    const modalCounter = section.querySelector("#projects-modal-counter");
    const prevButton = section.querySelector("#projects-modal-prev");
    const nextButton = section.querySelector("#projects-modal-next");
    const closeTriggers = section.querySelectorAll("[data-modal-close]");
    const galleriesWrap = section.querySelector("#card-gallery-projects");
    if (!modal || !modalImage || !modalThumbs || !modalTitle || !modalCounter || !prevButton || !nextButton || !galleriesWrap) {
      return;
    }

    let lastFocusedElement = null;
    let currentImages = [];
    let currentIndex = 0;
    let modalRequestId = 0;
    let imageRequestId = 0;
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

    const setModalState = (open) => {
      modal.classList.toggle("is-open", open);
      modal.setAttribute("aria-hidden", String(!open));
      document.body.classList.toggle("modal-open", open);
      document.documentElement.classList.toggle("modal-open", open);
    };

    const setImageLoading = (state) => {
      modalStage?.classList.toggle("is-loading", state);
    };

    const preloadImage = (src) =>
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(src);
        image.onerror = reject;
        image.src = src;
      });

    const getModalImageSrc = (image) => image.src || image.fullSrc || image.thumbSrc;

    const preloadAdjacentImages = () => {
      if (currentImages.length < 2) return;

      const previous = currentImages[(currentIndex - 1 + currentImages.length) % currentImages.length];
      const next = currentImages[(currentIndex + 1) % currentImages.length];

      [previous, next].forEach((image) => {
        const src = getModalImageSrc(image);
        if (!src) return;
        const preload = new Image();
        preload.src = src;
      });
    };

    const renderActiveImage = () => {
      if (!currentImages.length) return;

      const image = currentImages[currentIndex];
      const nextSrc = getModalImageSrc(image);
      const requestId = (imageRequestId += 1);

      if (!nextSrc) {
        setImageLoading(false);
        return;
      }

      modalImage.alt = image.alt;
      modalCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
      resetZoomPosition();
      setImageLoading(true);

      // Assign aditional scr to prevent double animation to show modal
      if (!modalImage.getAttribute("src")) {
        modalImage.src = image.thumbSrc || image.src || nextSrc;
      }

      preloadImage(nextSrc)
        .catch(() => nextSrc)
        .then((loadedSrc) => {
          if (requestId !== imageRequestId) return;
          modalImage.src = loadedSrc || nextSrc;
          setImageLoading(false);
          preloadAdjacentImages();
        });

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
              aria-label="${escapeHtml(t("projects.modalViewImage", { index: index + 1 }))}">
              <img src="${escapeHtml(image.thumbSrc || image.src)}" alt="${escapeHtml(image.alt)}" loading="lazy" />
            </button>
          `
        )
        .join("");
    };

    const closeModal = () => {
      setModalState(false);
      modalImage.removeAttribute("src");
      modalImage.alt = "";
      modalThumbs.innerHTML = "";
      modalCounter.textContent = "";
      currentImages = [];
      currentIndex = 0;
      imageRequestId += 1;
      setImageLoading(false);
      resetZoomPosition();

      if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
        lastFocusedElement.focus();
      }
    };

    const setProjectInModal = (project) => {
      modalTitle.textContent = project.name;
      currentImages = project.images.length ? project.images : [project.cover];
      currentIndex = 0;
      buildThumbs();
      renderActiveImage();
    };

    const openModalByProjectId = async (projectId) => {
      const cachedProject = projectStore.get(String(projectId));
      const requestId = (modalRequestId += 1);

      if (cachedProject) {
        setProjectInModal(cachedProject);
      } else {
        modalTitle.textContent = t("projects.modalTitle");
        modalImage.removeAttribute("src");
        modalImage.alt = "";
        modalThumbs.innerHTML = "";
        modalCounter.textContent = "";
        currentImages = [];
        currentIndex = 0;
        setImageLoading(true);
      }

      lastFocusedElement = document.activeElement;

      requestAnimationFrame(() => {
        setModalState(true);
        modal.querySelector(".projects__modal-close, .projects-modal__close")?.focus({ preventScroll: true });
      });

      if (!projectId || !window.DGProjectsService || !window.DGProjectMapper) return;

      try {
        const dto = await window.DGProjectsService.getProjectById(projectId);
        if (requestId !== modalRequestId || !modal.classList.contains("is-open")) return;

        const detailProject = window.DGProjectMapper.mapProject(dto);
        projectStore.set(String(detailProject.id), detailProject);
        
        // Prevent render if API return same data that saving on cache
        const isSameData = cachedProject && 
          cachedProject.images.length === detailProject.images.length &&
          cachedProject.images.every((img, i) => img.id === detailProject.images[i]?.id);

        if (!isSameData) {
          setProjectInModal(detailProject);
        }
      } catch (error) {
        console.error("No se pudo cargar el detalle del proyecto", error);
        setImageLoading(false);
      }
    };

    const openModalFromCard = (card) => {
      openModalByProjectId(card.dataset.projectId);
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

    prepareCardsAccessibility(galleriesWrap);

    window.DGProjectsModal = {
      open: openModalByProjectId
    };

    if (window.DGPendingProjectModalId) {
      const pendingProjectId = window.DGPendingProjectModalId;
      window.DGPendingProjectModalId = null;
      openModalByProjectId(pendingProjectId);
    }
  }

  async function renderProjectsFromApi() {
    const section = document.querySelector("#projects");
    const galleriesWrap = section?.querySelector("#card-gallery-projects");
    const gallery = galleriesWrap?.querySelector("[data-projects-gallery]") || galleriesWrap;
    if (!section || !gallery || !window.DGProjectsService || !window.DGProjectMapper) return;

    try {
      setProjectsLoading(section, true, t("projects.loading"));
      const projectsDto = await window.DGProjectsService.getProjects();
      const projects = window.DGProjectMapper.mapProjects(projectsDto);

      projectStore.clear();
      projects.forEach((project) => projectStore.set(String(project.id), project));

      gallery.innerHTML = projects.length
        ? projects.map(renderProjectCard).join("")
        : `<p class="projects__empty">${escapeHtml(t("projects.empty"))}</p>`;

      setProjectsLoading(section, false);
      initProjectsFilter();
      initProjectsModal();
      prepareCardsAccessibility(galleriesWrap);
    } catch (error) {
      console.error("No se pudieron cargar los proyectos", error);
      gallery.innerHTML = `<p class="projects__error">${escapeHtml(t("projects.error"))}</p>`;
      setProjectsLoading(section, false);
      initProjectsFilter();
      initProjectsModal();
    }
  }

  document.addEventListener("dg:languagechange", () => {
    const section = document.querySelector("#projects");
    const galleriesWrap = section?.querySelector("#card-gallery-projects");
    if (galleriesWrap) prepareCardsAccessibility(galleriesWrap);
  });

  renderProjectsFromApi();
})();
