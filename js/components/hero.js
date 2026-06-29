(function () {
const HERO_CARD_CLASSES = [
  "hero__card--one",
  "hero__card--two",
  "hero__card--three",
  "hero__card--four"
];

const escapeCssUrl = (value) => String(value || "").replace(/["\\]/g, "\\$&");

function createHeroCard(card) {
  const article = document.createElement('article');
  article.className = `hero__card ${card.idCSS}`;
  article.setAttribute('aria-label', card.ariaLabel);
  article.style.setProperty("--hero-card-image", `url("${escapeCssUrl(card.imageSrc)}")`);

  const inner = document.createElement('div');
  inner.className = 'hero__card-inner';

  const back = document.createElement('div');
  back.className = 'hero__card-face hero__card-face--back';

  const backIcon = document.createElement('img');
  backIcon.className = 'hero__card-back-mark';
  backIcon.src = 'src/assets/images/icon-192x192.png';
  backIcon.alt = '';

  const backTitle = document.createElement('span');
  backTitle.className = 'hero__card-title';
  backTitle.textContent = card.title;

  const detailsLink = document.createElement('a');
  detailsLink.className = 'hero__details-btn';
  detailsLink.href = card.detailsHref;
  detailsLink.dataset.projectId = card.projectId;
  detailsLink.dataset.i18n = "hero.cardDetails";
  detailsLink.textContent = window.DGI18n?.t("hero.cardDetails") || 'Mostrar detalles';

  const front = document.createElement('div');
  front.className = 'hero__card-face hero__card-face--front';

  const frontContent = document.createElement('div');
  frontContent.className = 'hero__card-front-content';

  const frontTitle = document.createElement('span');
  frontTitle.className = 'hero__card-title';
  frontTitle.textContent = card.title;

  frontContent.appendChild(frontTitle);
  front.appendChild(frontContent);

  back.append(backIcon, backTitle, detailsLink);
  inner.append(back, front);
  article.appendChild(inner);

  return article;
}

function loadHeroCards(cards) {
  const gallery = document.querySelector('.hero__gallery');
  if (!gallery) return;

  const fragment = document.createDocumentFragment();
  cards.forEach((card) => {
    fragment.appendChild(createHeroCard(card));
  });

  gallery.replaceChildren(fragment);
}

function mapProjectToHeroCard(project, index) {
  return {
    idCSS: HERO_CARD_CLASSES[index],
    title: project.name,
    ariaLabel: project.name,
    detailsHref: '#projects-modal',
    projectId: project.id,
    imageSrc: project.cover.thumbSrc || project.cover.src || project.cover.fullSrc
  };
}

function openProjectDetail(projectId) {
  if (window.DGProjectsModal?.open) {
    window.DGProjectsModal.open(projectId);
    return;
  }

  window.DGPendingProjectModalId = projectId;
}

async function loadHeroCardsFromApi() {
  const gallery = document.querySelector('.hero__gallery');
  if (!gallery || !window.DGProjectsService || !window.DGProjectMapper) return;

  gallery.setAttribute("aria-busy", "true");

  try {
    const projectsDto = await window.DGProjectsService.getProjects();
    const heroCards = window.DGProjectMapper.mapProjects(projectsDto)
      .filter(project => !project.inProgress)
      .slice(0, HERO_CARD_CLASSES.length)
      .map(mapProjectToHeroCard);

    loadHeroCards(heroCards);
    window.DGI18n?.apply(gallery);
    initHeroCardFlip();
  } catch (error) {
    console.error("No se pudieron cargar las cartas del hero", error);
  } finally {
    gallery.removeAttribute("aria-busy");
  }
}

function initHeroCardFlip() {
  const cards = document.querySelectorAll('.hero__card');
  if (!cards.length) return;

  const setFlipping = (card, state) => {
    card.classList.toggle('card--flipping', state);
  };

  const closeCard = (card) => {
    if (!card.classList.contains('card--flipped') || card.classList.contains('card--flipping')) return;

    setFlipping(card, true);
    card.classList.remove('card--flipped');
    card.classList.add('card--unflip');

    window.setTimeout(() => {
      card.classList.remove('card--unflip');
      setFlipping(card, false);
    }, 380);
  };

  const openCard = (card) => {
    if (card.classList.contains('card--flipping')) return;

    setFlipping(card, true);
    card.classList.remove('card--unflip');
    card.classList.add('card--flipped');

    window.setTimeout(() => {
      setFlipping(card, false);
    }, 380);
  };

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      event.stopPropagation();
      if (card.classList.contains('card--flipping')) return;

      if (card.classList.contains('card--flipped')) {
        closeCard(card);
        return;
      }

      cards.forEach((otherCard) => {
        if (otherCard !== card) closeCard(otherCard);
      });

      openCard(card);
    });

    const detailsBtn = card.querySelector('.hero__details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openProjectDetail(detailsBtn.dataset.projectId);
      });
    }
  });

  document.addEventListener('click', () => {
    cards.forEach((card) => closeCard(card));
  });
}

loadHeroCardsFromApi();
})();
