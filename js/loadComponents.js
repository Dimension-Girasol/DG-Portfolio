const loadedScripts = new Map();
const DG_SHARED_PROJECT_SCRIPTS = [
  "js/apiConfig.js",
  "js/projectModel.js",
  "js/projectMapper.js",
  "js/projectsService.js"
];

async function loadComponent(id, file, callback) {
  const root = document.getElementById(id);
  if (!root) return;

  const response = await fetch(file);
  const data = await response.text();
  root.innerHTML = data;
  window.DGI18n?.apply(root);

  if (callback) callback();
}

function loadScript(src) {
  if (loadedScripts.has(src)) return loadedScripts.get(src);

  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}

function loadScripts(srcs, callback) {
  return srcs
    .reduce((chain, src) => chain.then(() => loadScript(src)), Promise.resolve())
    .then(() => {
      if (callback) callback();
    })
    .catch((error) => console.error("No se pudo cargar un script", error));
}

// Register JSs functionality from html
loadComponent("header", "components/header.html", () => {
  loadScript("js/header.js");
});

// Register HTMLs
/**** INDEX ****/
loadComponent("hero", "components/hero/hero.html", () => {
  loadComponent("card-hero", "components/hero/card-hero.html", () => {
    loadScripts([...DG_SHARED_PROJECT_SCRIPTS, "js/hero.js"]);
  });
});

/**** HOW ****/
loadComponent("how-root", "components/how/how.html", () => {
  loadScript("js/how.js");
});

/**** ABOUT ****/
loadComponent("about-root", "components/about/about.html");

/**** PROJECTS ****/
loadComponent("projects", "components/projects/projects.html", () => {
  loadComponent("card-gallery-projects", "components/projects/card-gallery-projects.html", () => {
    loadComponent("modal-detail-project", "components/projects/modal-detail-project.html", () => {
      loadScripts([...DG_SHARED_PROJECT_SCRIPTS, "js/projects.js"]);
    });
  });
});

/**** Footer ****/
loadComponent("footer", "components/footer.html", () => {
  if (window.dgSyncThemeAssets) window.dgSyncThemeAssets();
});
