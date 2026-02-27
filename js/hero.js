/** Cards - MOCK  **/
const HERO_CARDS = [
  {
    idCSS: 'hero__card--one',
    title: 'Pesadilla antes de Navidad',
    ariaLabel: 'Pesadilla antes de Navidad',
    detailsHref: '#projects'
  },
  {
    idCSS: 'hero__card--two',
    title: 'Scar',
    ariaLabel: 'Scar - El Rey Leon',
    detailsHref: '#projects'
  },
  {
    idCSS: 'hero__card--three',
    title: 'Princesa Mononoke',
    ariaLabel: 'Princesa Mononoke',
    detailsHref: '#projects'
  },
  {
    idCSS: 'hero__card--four',
    title: 'Caitlyn - Arcane',
    ariaLabel: 'Caitlyn - Arcane',
    detailsHref: '#projects'
  }
];

/* Create card with mock data */

function createHeroCard(card) {
  const article = document.createElement('article');
  article.className = `hero__card ${card.idCSS}`;
  article.setAttribute('aria-label', card.ariaLabel);

  const inner = document.createElement('div');
  inner.className = 'hero__card-inner';

  const back = document.createElement('div');
  back.className = 'hero__card-face hero__card-face--back';

  const backIcon = document.createElement('img');
  backIcon.className = 'hero__card-back-mark';
  backIcon.src = '/src/assets/images/favicon.ico';

  const backTitle = document.createElement('span');
  backTitle.className = 'hero__card-title';
  backTitle.textContent = card.title;

  const detailsLink = document.createElement('a');
  detailsLink.className = 'hero__details-btn';
  detailsLink.href = card.detailsHref;
  detailsLink.textContent = 'Mostrar detalles';

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

/* load cards */
function loadHeroCards() {
  const gallery = document.querySelector('.hero__gallery');
  if (!gallery) return;

  const fragment = document.createDocumentFragment();
  HERO_CARDS.forEach((card) => {
    fragment.appendChild(createHeroCard(card));
  });

  gallery.replaceChildren(fragment);
}

function initHeroCardFlip() {
  const cards = document.querySelectorAll('.hero__card');
  if (!cards.length) return;

  const closeCard = (card) => {
    if (!card.classList.contains('card--flipped')) return;

    card.classList.remove('card--flipped');
    card.classList.add('card--unflip');

    window.setTimeout(() => {
      card.classList.remove('card--unflip');
    }, 380);
  };

  const openCard = (card) => {
    card.classList.remove('card--unflip');
    card.classList.add('card--flipped');
  };

  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      event.stopPropagation();

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
        event.stopPropagation();
      });
    }
  });

  document.addEventListener('click', () => {
    cards.forEach((card) => closeCard(card));
  });
}

loadHeroCards();
initHeroCardFlip();
