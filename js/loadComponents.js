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
loadComponent("hero", "components/hero.html");
loadComponent("footer", "components/footer.html");
