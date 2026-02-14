function loadComponents(id, file) {
    fetch(file)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
        });
}

loadComponents("header", "components/header.html");
loadComponents("hero", "components/hero.html");