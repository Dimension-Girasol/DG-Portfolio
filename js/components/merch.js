(() => {
  const merchSection = document.querySelector(".merch");
  if (!merchSection) return;

  merchSection.querySelectorAll(".merch__pin-badge").forEach((badge) => {
    const img = badge.querySelector("img");
    if (!img) return;

    const clearLoading = () => badge.classList.remove("is-img-loading");

    if (img.complete && img.naturalWidth !== 0) {
      clearLoading();
    } else {
      badge.classList.add("is-img-loading");
      img.addEventListener("load", clearLoading, { once: true });
      img.addEventListener("error", clearLoading, { once: true });
    }
  });

  // Al pulsar un pin, "vuela" desde su sitio hasta el centro de la pantalla
  // y se hace grande para verlo mejor. Se cierra siempre igual (pulsando
  // fuera, el botón de cerrar, Escape o haciendo scroll): con un fundido.
  const zoom = document.createElement("div");
  zoom.className = "merch__zoom";
  zoom.setAttribute("role", "dialog");
  zoom.setAttribute("aria-modal", "true");
  zoom.setAttribute("aria-hidden", "true");
  zoom.innerHTML = `
    <div class="merch__zoom-backdrop" data-zoom-close></div>
    <div class="merch__zoom-circle">
      <span class="merch__zoom-image-wrap">
        <img class="merch__zoom-image" alt="" />
      </span>
      <span class="merch__zoom-label"></span>
    </div>
    <button type="button" class="merch__zoom-close" aria-label="Cerrar" data-zoom-close>
      <span aria-hidden="true">x</span>
    </button>
  `;
  document.body.appendChild(zoom);

  const zoomCircle = zoom.querySelector(".merch__zoom-circle");
  const zoomImage = zoom.querySelector(".merch__zoom-image");
  const zoomLabel = zoom.querySelector(".merch__zoom-label");

  let sourceTrigger = null;
  let closeTimeoutId = null;

  const placeCircle = (rect) => {
    zoomCircle.style.top = `${rect.top}px`;
    zoomCircle.style.left = `${rect.left}px`;
    zoomCircle.style.width = `${rect.width}px`;
    zoomCircle.style.height = `${rect.height}px`;
  };

  const getTargetSize = () => {
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.6;
    return Math.min(Math.max(size, 220), 620);
  };

  // Se cierra siempre igual (pulsando la X, el fondo, Escape o haciendo
  // scroll): un fundido + encogido suave en el sitio donde está, sin mover
  // top/left/width/height, para que nunca "persiga" un objetivo que se ha
  // movido por el scroll y se vea arrastrado.
  const closeZoom = ({ restoreFocus = true } = {}) => {
    if (!sourceTrigger) return;

    const trigger = sourceTrigger;
    sourceTrigger = null;

    zoom.classList.remove("is-open");
    zoom.setAttribute("aria-hidden", "true");

    window.clearTimeout(closeTimeoutId);
    closeTimeoutId = window.setTimeout(() => {
      zoom.style.visibility = "hidden";
      trigger.classList.remove("is-source");
      trigger.setAttribute("aria-pressed", "false");
      if (restoreFocus) trigger.focus({ preventScroll: true });
    }, 340);
  };

  const openZoom = (trigger) => {
    if (sourceTrigger === trigger) {
      closeZoom();
      return;
    }
    if (sourceTrigger) closeZoom({ restoreFocus: false });

    const badge = trigger.querySelector(".merch__pin-badge");
    const img = badge.querySelector("img");
    const label = trigger.querySelector(".merch__pin-label");
    const rect = badge.getBoundingClientRect();

    window.clearTimeout(closeTimeoutId);
    zoom.style.visibility = "visible";
    zoomImage.src = img.currentSrc || img.src;
    zoomImage.alt = img.alt;
    zoomLabel.textContent = label ? label.textContent : "";

    placeCircle(rect);
    void zoomCircle.offsetWidth; // fuerza el reflow para animar desde la posición inicial

    zoom.classList.add("is-open");
    zoom.setAttribute("aria-hidden", "false");

    const size = getTargetSize();
    zoomCircle.style.top = `${(window.innerHeight - size) / 2}px`;
    zoomCircle.style.left = `${(window.innerWidth - size) / 2}px`;
    zoomCircle.style.width = `${size}px`;
    zoomCircle.style.height = `${size}px`;

    trigger.classList.add("is-source");
    trigger.setAttribute("aria-pressed", "true");
    sourceTrigger = trigger;
    zoom.querySelector(".merch__zoom-close")?.focus({ preventScroll: true });
  };

  merchSection.querySelectorAll(".merch__pin-trigger").forEach((trigger) => {
    trigger.setAttribute("aria-pressed", "false");
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      openZoom(trigger);
    });
  });

  zoom.addEventListener("click", (event) => {
    if (event.target.closest("[data-zoom-close]")) closeZoom();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeZoom();
  });

  window.addEventListener("scroll", () => closeZoom({ restoreFocus: false }), { passive: true });
  window.addEventListener("resize", () => closeZoom({ restoreFocus: false }));
})();
