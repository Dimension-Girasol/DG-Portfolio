function initProjectsFilter() {
  const section = document.querySelector("#projects");

  if (!section) return;
  const filters = section.querySelectorAll(".projects__filter");
  const cards = section.querySelectorAll(".project-card");
  const loading = section.querySelector(".projects__loading");

  // TODO: - Get dynamic data from database

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
      const owner = card.dataset.owner;
      const show = selected === "all" || owner === selected;
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

      const selected = filter.dataset.filter;
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
}

initProjectsFilter();
