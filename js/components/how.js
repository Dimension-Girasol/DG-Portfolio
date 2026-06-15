(() => {
  const HOW_SELECTOR = ".how";
  const ITEM_SELECTOR = "ul.infoGraphic > li";
  const ACTIVE_CLASS = "is-inview";
  const MOBILE_MQ = "(hover: none) and (pointer: coarse)";

  const howSection = document.querySelector(HOW_SELECTOR);
  if (!howSection) return;

  const items = Array.from(howSection.querySelectorAll(ITEM_SELECTOR));
  if (items.length === 0) return;

  const mq = window.matchMedia(MOBILE_MQ);

  let observer = null;
  let rafId = 0;
  let activeItem = null;
  const visibleItems = new Set();

  const applyActive = (next) => {
    if (activeItem === next) return;
    if (activeItem) activeItem.classList.remove(ACTIVE_CLASS);
    if (next) next.classList.add(ACTIVE_CLASS);
    activeItem = next;
  };

  const scheduleUpdate = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      updateActive();
    });
  };

  const updateActive = () => {
    if (visibleItems.size === 0) {
      applyActive(null);
      return;
    }

    const viewportCenter = (window.innerHeight || 0) / 2;
    let best = null;
    let bestDist = Infinity;

    for (const li of visibleItems) {
      const rect = li.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(center - viewportCenter);
      if (dist < bestDist) {
        bestDist = dist;
        best = li;
      }
    }

    applyActive(best);
  };

  const cleanup = () => {
    if (observer) observer.disconnect();
    observer = null;

    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;

    visibleItems.clear();
    applyActive(null);

    for (const li of items) li.classList.remove(ACTIVE_CLASS);
  };

  const enable = () => {
    cleanup();

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target;
          if (entry.isIntersecting) visibleItems.add(target);
          else visibleItems.delete(target);
        }
        scheduleUpdate();
      },
      { threshold: [0.25, 0.5, 0.75], rootMargin: "0px 0px -10% 0px" }
    );

    for (const li of items) observer.observe(li);
    scheduleUpdate();
  };

  const sync = () => {
    if (mq.matches) enable();
    else cleanup();
  };

  if (mq.addEventListener) mq.addEventListener("change", sync);
  else mq.addListener(sync);

  sync();
})();
