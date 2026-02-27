async function loadComponent(id, file, callback) {
  const response = await fetch(file);
  const data = await response.text();
  document.getElementById(id).innerHTML = data;

  if (callback) callback();
}

function loadScript(src) {
  const script = document.createElement("script");
  script.src = src;
  document.body.appendChild(script);
}

// Register JSs functionality from html
loadComponent("header", "components/header.html", () => {
  loadScript("js/header.js");
});

// Register HTMLs
/**** INDEX ****/
loadComponent("hero", "components/hero/hero.html", () => {
  loadComponent("card-hero", "components/hero/card-hero.html", () => {
    loadScript("js/hero.js");
  });
});

/**** PROJECTS ****/
loadComponent("projects", "components/projects.html", () => {
  loadScript("js/projects.js");
});

/**** Footer ****/
loadComponent("footer", "components/footer.html");
