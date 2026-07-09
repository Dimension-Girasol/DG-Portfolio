(function () {
  const faqItems = document.querySelectorAll(".faq-item");

  if (!faqItems.length) {
    return;
  }

  faqItems.forEach((item) => {
    item.addEventListener("click", () => {
      item.classList.toggle("active");
    });
  });
})();