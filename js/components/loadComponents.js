const loadedScripts = new Map();
// Promesas de las secciones inyectadas: hasta que no se resuelven, los anclajes
// (#about, #merch...) no existen y el navegador no puede hacer scroll a ellos.
const componentLoads = [];
const DG_SHARED_PROJECT_SCRIPTS = [
  "server/api/apiConfig.js",
  "server/api/projectModel.js",
  "server/api/projectMapper.js",
  "js/config/projectsService.js"
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
componentLoads.push(loadComponent("header", "components/header.html", () => {
  loadScript("js/components/header.js");
}));

// Register HTMLs
/**** INDEX ****/
componentLoads.push(loadComponent("hero", "components/hero/hero.html", () => {
  loadComponent("card-hero", "components/hero/card-hero.html", () => {
    loadScripts([...DG_SHARED_PROJECT_SCRIPTS, "js/components/hero.js"]);
  });
}));

/**** HOW ****/
componentLoads.push(loadComponent("how-root", "components/how/how.html", () => {
  loadScript("js/components/how.js");
}));

/**** ABOUT ****/
componentLoads.push(loadComponent("about-root", "components/about/about.html", () => {
  loadScript("js/components/about.js");
}));

/**** PROJECTS (incluye el grabado láser, integrado dentro de la sección) ****/
componentLoads.push(loadComponent("projects-root", "components/projects/projects.html", () => {
  loadComponent("card-gallery-projects", "components/projects/card-gallery-projects.html", () => {
    loadComponent("laser-inline", "components/laser/laser.html", () => {
      loadComponent("modal-detail-project", "components/projects/modal-detail-project.html", () => {
        loadScripts([...DG_SHARED_PROJECT_SCRIPTS, "js/components/projects.js"]);
      });
    });
  });
}));

/**** MERCH ****/
componentLoads.push(loadComponent("merch-root", "components/merch/merch.html", () => {
  loadScript("js/components/merch.js");
}));

/**** FAQs ****/
// Si estamos en la página de FAQ, el contenido ya está en el HTML, solo cargamos el script.
if (document.body.dataset.page === 'faq') {
  loadScript("js/components/faq.js");
}

/**** Footer ****/
componentLoads.push(loadComponent("footer", "components/footer.html", () => {
  if (window.dgSyncThemeAssets) window.dgSyncThemeAssets();
}));

/**** NAVEGACIÓN A SECCIONES (#about, #merch, #projects...) ****/
const isHomePath = (pathname) => pathname === "/" || pathname.endsWith("/index.html");

const getHashTarget = (hash) => {
  if (!hash || hash.length < 2) return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
};

// Mientras cargan imágenes, la API de proyectos, etc., la página cambia de altura
// y la sección destino se desplaza. Se mantiene alineada unos segundos, salvo que
// la persona empiece a hacer scroll por su cuenta.
const keepSectionAligned = (target, duration = 4000) => {
  if (typeof ResizeObserver !== "function") return;
  const userEvents = ["wheel", "touchstart", "keydown", "mousedown"];
  let timerId;
  const observer = new ResizeObserver(() => target.scrollIntoView({ behavior: "instant", block: "start" }));
  const stop = () => {
    observer.disconnect();
    clearTimeout(timerId);
    userEvents.forEach((type) => window.removeEventListener(type, stop));
  };
  userEvents.forEach((type) => window.addEventListener(type, stop, { passive: true }));
  timerId = setTimeout(stop, duration);
  observer.observe(document.body);
};

// 1) Al llegar desde otra página (o tras recargar) con #seccion en la URL:
//    el navegador busca el ancla antes de que las secciones existan, así que se
//    hace el scroll cuando ya están insertadas.
Promise.allSettled(componentLoads).then(() => {
  const target = getHashTarget(window.location.hash);
  if (!target) return;
  target.scrollIntoView({ behavior: "instant", block: "start" });
  keepSectionAligned(target);
});

// 2) Enlaces a secciones de la home estando ya en la home: "/" e "/index.html"
//    son la misma página, pero el navegador recargaba al pasar de una a otra
//    (index.html#about desde "/", o /#merch desde "/index.html").
document.addEventListener("click", (event) => {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest("a[href*='#']");
  if (!link || (link.target && link.target !== "_self")) return;

  const url = new URL(link.href, window.location.href);
  if (url.origin !== window.location.origin) return;
  if (!isHomePath(url.pathname) || !isHomePath(window.location.pathname)) return;

  const target = getHashTarget(url.hash);
  if (!target) return;

  event.preventDefault();
  if (window.location.hash !== url.hash) {
    history.pushState(null, "", url.hash);
    // pushState no lanza hashchange; projects.js lo usa para cambiar a la pestaña Láser
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
  target.scrollIntoView({ behavior: "smooth", block: "start" });
});
