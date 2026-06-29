(function () {
  const FALLBACK_IMAGE = "src/assets/images/icon-192x192.png"; // Imagen de reemplazo si alguna falla
  const PLACEHOLDER_IMAGE = "src/assets/images/projects/in-progress/in-progress-480.jpg"; // Imagen para rellenar huecos vacíos
  const escapeHtml = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const projectStore = new Map();
  let allProjects = [];
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

  const renderImageSizeAttrs = (image) =>
    image.width && image.height ? ` width="${escapeHtml(image.width)}" height="${escapeHtml(image.height)}"` : "";

  const renderThumb = (image, index, total) => {
    const remaining = Math.max(total - 4, 0);
    const isMore = index === 3 && remaining > 0;

    return `
      <div class="gallery__thumb ${isMore ? "gallery__thumb-more" : ""}" ${isMore ? `data-more="+${remaining}"` : ""}>
        <img src="${escapeHtml(image.thumbSrc || image.src)}" alt="${escapeHtml(image.alt)}"${renderImageSizeAttrs(image)} loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';" />
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

    // Rellenamos los huecos vacíos con la imagen por defecto si hay menos de 3 miniaturas
    while (detailImages.length < 3) {
      detailImages.push({
        src: PLACEHOLDER_IMAGE,
        thumbSrc: PLACEHOLDER_IMAGE,
        alt: "En construcción"
      });
    }

    const authors = project.authors.length ? project.authors : ["Dimension Girasol"];
    const tags = project.tags.length ? project.tags : [t("projects.defaultTag")];

    const inProgressTag = project.inProgress
      ? `<span class="gallery__in-progress-tag">${escapeHtml(t("projects.statusInProgress"))}</span>`
      : "";

    const getYear = (dateString) => {
      if (!dateString) return null;
      return new Date(dateString).getFullYear();
    };

    const startYear = getYear(project.initDate);
    const endYear = getYear(project.endDate);
    let dateInfo = "";
    if (startYear && endYear && startYear !== endYear) {
      dateInfo = `${startYear}-${endYear}`;
    } else if (startYear || endYear) {
      dateInfo = `${startYear || endYear}`;
    }

    const designerName = project.designer?.name || (typeof project.designer === 'string' ? project.designer : null);

    return `
      <article class="gallery" data-project-id="${escapeHtml(project.id)}">
        <div class="gallery__images">
          <div class="gallery__images-cover">
            ${inProgressTag}
            <img src="${escapeHtml(project.cover.thumbSrc || project.cover.src)}" alt="${escapeHtml(project.cover.alt)}"${renderImageSizeAttrs(project.cover)} loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';" />
          </div>
          <div class="gallery__images-more">
            ${detailImages.map((image, index) => renderThumb(image, index + 1, project.images.length)).join("")}
          </div>
        </div>
        <div class="gallery__info">
          <div class="gallery__title-wrapper">
            <p>${escapeHtml(project.name)}</p>
            ${dateInfo ? `<span class="gallery__date">${escapeHtml(dateInfo)}</span>` : ""}
          </div>
          <div class="gallery__authorship">
            ${designerName ? `<div class="gallery__designer" aria-label="Diseñador del proyecto">${renderTags([designerName], "gallery__tag-designer")}</div>` : ""}
            <div class="gallery__creator" aria-label="Creador del proyecto">
              ${renderTags(authors, "gallery__tag-creator")}
            </div>
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
    const filtersContainer = section.querySelector(".projects__filters");
    const loading = section.querySelector(".projects__loading");
    if (!filters.length) return;

    // Fallback for author filter images
    filters.forEach((filter) =>
      filter.querySelectorAll("img.projects__icon").forEach((img) => {
        const wrapper = img.closest(".projects__icon-wrap");
        if (!wrapper) return;

        const handleImageLoad = () => wrapper.classList.remove("is-loading");

        // If image is already loaded/cached, don't show spinner
        if (img.complete && img.naturalHeight !== 0) {
          handleImageLoad();
        } else {
          wrapper.classList.add("is-loading");
          img.addEventListener("load", handleImageLoad, { once: true });
          img.addEventListener("error", handleImageLoad, { once: true });
        }

        if (!img.hasAttribute("onerror"))
          img.setAttribute("onerror", `this.onerror=null;this.src='${FALLBACK_IMAGE}';`);
      })
    );

    const LOADING_TIME_MS = 250;
    let loadingTimerId;
    let currentPage = 1;
    let itemsPerPage = window.innerWidth <= 900 ? 4 : 8;
    let currentSort = "dateDesc";

    let paginationWrap = section.querySelector("#projects-pagination");
    if (!paginationWrap) {
      paginationWrap = document.createElement("div");
      paginationWrap.id = "projects-pagination";
      paginationWrap.className = "projects__pagination";
      
      const gallery = section.querySelector("[data-projects-gallery]") || section.querySelector("#card-gallery-projects");
      if (gallery && gallery.parentNode) {
        gallery.after(paginationWrap);
      }
    }

    paginationWrap.innerHTML = "";

    const prevBtn = document.createElement("button");
    prevBtn.id = "projects-page-prev";
    prevBtn.className = "projects__pagination-btn projects__pagination-btn--prev";
    prevBtn.setAttribute("aria-label", t("projects.pagePrev"));
    prevBtn.innerHTML = "&lt;";

    const pageInfo = document.createElement("span");
    pageInfo.id = "projects-page-info";
    pageInfo.className = "projects__pagination-info";

    const nextBtn = document.createElement("button");
    nextBtn.id = "projects-page-next";
    nextBtn.className = "projects__pagination-btn projects__pagination-btn--next";
    nextBtn.setAttribute("aria-label", t("projects.pageNext"));
    nextBtn.innerHTML = "&gt;";

    paginationWrap.append(prevBtn, pageInfo, nextBtn);

    const sorterContainer = document.createElement("div");
    sorterContainer.className = "projects__sorter";
    const sorterLabel = document.createElement("label");
    sorterLabel.htmlFor = "project-sorter";
    sorterLabel.dataset.i18n = "projects.sortByLabel";
    const sorterSelect = document.createElement("select");
    sorterSelect.id = "project-sorter";
    sorterSelect.className = "projects__sorter-select";
    
    const sortOptions = {
      dateDesc: "projects.sort.dateDesc",
      nameAsc: "projects.sort.nameAsc",
      inProgress: "projects.sort.inProgress",
      finished: "projects.sort.finished",
    };
    Object.entries(sortOptions).forEach(([value, key]) => {
      const option = document.createElement("option");
      option.value = value;
      option.dataset.i18n = key;
      if (value === currentSort) option.selected = true;
      sorterSelect.appendChild(option);
    });
    sorterContainer.append(sorterLabel, sorterSelect);
    if (loading) {
      loading.after(sorterContainer);
    } else {
      filtersContainer.after(sorterContainer);
    }
    window.DGI18n?.apply(sorterContainer);

    sorterSelect.addEventListener("change", (event) => {
      currentSort = event.target.value;
      currentPage = 1;
      const selectedFilter = (section.querySelector(".projects__filter.is-active")?.dataset.filter || "all").toLowerCase();
      updateCards(selectedFilter);
    });

    const updateActiveFilter = (selected) => {
      filters.forEach((filter) => {
        const isActive = filter.dataset.filter === selected;
        filter.classList.toggle("is-active", isActive);
        filter.setAttribute("aria-pressed", String(isActive));
      });
    };

    const updateCards = (selected) => {
      const gallery = section.querySelector("[data-projects-gallery]") || section.querySelector("#card-gallery-projects");
      if (!gallery) return;

      // 1. Filter
      let filteredProjects =
        selected === "all"
          ? [...allProjects]
          : allProjects.filter((p) => p.authors.some((a) => a.toLowerCase() === selected));

      // 1.5 Filter by Status
      if (currentSort === "inProgress") {
        filteredProjects = filteredProjects.filter((p) => p.inProgress);
      } else if (currentSort === "finished") {
        filteredProjects = filteredProjects.filter((p) => !p.inProgress);
      }

      // 2. Sort
      switch (currentSort) {
        case "nameAsc":
          filteredProjects.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "dateDesc":
          filteredProjects.sort((a, b) => new Date(b.initDate || b.createdAt || 0).getTime() - new Date(a.initDate || a.createdAt || 0).getTime());
          break;
        default:
          // Al no haber nada seleccionado, se respeta el orden original del backend
          break;
      }

      // 3. Paginate
      const totalPages = Math.max(1, Math.ceil(filteredProjects.length / itemsPerPage));
      if (currentPage > totalPages) currentPage = totalPages;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const projectsToRender = filteredProjects.slice(startIndex, endIndex);

      // 4. Render
      gallery.innerHTML = projectsToRender.length ? projectsToRender.map(renderProjectCard).join("") : `<p class="projects__empty">${escapeHtml(t("projects.empty"))}</p>`;
      prepareCardsAccessibility(gallery.parentElement);
      updatePaginationUI(totalPages);
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

    const updatePaginationUI = (totalPages) => {
      if (!paginationWrap || !prevBtn || !nextBtn || !pageInfo) return;
      const hasPagination = totalPages > 1;
      paginationWrap.style.display = hasPagination ? "flex" : "none";      
      if (hasPagination) {
        pageInfo.textContent = t("projects.pageInfo", { currentPage, totalPages });
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
      }
    };

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
          const selected = (section.querySelector(".projects__filter.is-active")?.dataset.filter || "all").toLowerCase();
          updateCards(selected);
          scrollToProjects();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        currentPage++;
        const selected = (section.querySelector(".projects__filter.is-active")?.dataset.filter || "all").toLowerCase();
        updateCards(selected);
        scrollToProjects();
      });
    }

    const initialActive = section.querySelector(".projects__filter.is-active");
    const initialSelected = (initialActive?.dataset.filter || "all").toLowerCase();
    updateActiveFilter(initialSelected);
    updateCards(initialSelected);
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
      allProjects = window.DGProjectMapper.mapProjects(projectsDto);
      allProjects.forEach((project) => projectStore.set(String(project.id), project));

      initProjectsFilter();

      setProjectsLoading(section, false);
      initProjectsModal();
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
