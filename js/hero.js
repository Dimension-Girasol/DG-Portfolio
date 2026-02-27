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

initHeroCardFlip();
