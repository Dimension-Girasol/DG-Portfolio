(function () {
  function initAboutTimelineToggle() {
    // Localizamos algún elemento interno del cronograma (como el primer año)
    const firstTimelineItem = document.querySelector('[data-i18n="about.timeline.2020.title"]');
    if (!firstTimelineItem) return;

    // Subimos en el árbol del DOM para encontrar el contenedor padre del cronograma (ul o div)
    const timelineContainer = firstTimelineItem.closest('ul') || firstTimelineItem.closest('.about__timeline') || firstTimelineItem.parentElement.parentElement;
    if (!timelineContainer) return;

    // Evitar añadir el botón más de una vez si se recarga el componente
    if (document.querySelector('.about__toggle-btn')) return;

    // Creamos el botón desplegable
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'about__toggle-btn';
    
    // Aplicamos estilos base para que coincida con la paleta de la web
    toggleBtn.style.padding = '12px 24px';
    toggleBtn.style.display = 'block';
    toggleBtn.style.border = '1px solid var(--strokeBubble)';
    toggleBtn.style.borderRadius = '8px';
    toggleBtn.style.backgroundColor = 'var(--white)';
    toggleBtn.style.color = 'var(--greyCustom)';
    toggleBtn.style.fontFamily = '"ArquitectaBold", sans-serif';
    toggleBtn.style.fontSize = '1.1rem';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.transition = 'all 0.2s ease';

    toggleBtn.addEventListener('mouseover', () => {
      toggleBtn.style.backgroundColor = 'var(--orangeCustom)';
      toggleBtn.style.borderColor = 'var(--orangeCustom)';
      toggleBtn.style.color = 'var(--white)';
    });

    toggleBtn.addEventListener('mouseout', () => {
      toggleBtn.style.backgroundColor = 'var(--white)';
      toggleBtn.style.borderColor = 'var(--strokeBubble)';
      toggleBtn.style.color = 'var(--greyCustom)';
    });

    let isVisible = false;

    const updateButtonText = () => {
      const key = isVisible ? "about.timeline.hide" : "about.timeline.show";
      toggleBtn.textContent = window.DGI18n?.t(key) || (isVisible ? "Ocultar cronograma" : "Mostrar cronograma");
      toggleBtn.setAttribute("data-i18n", key);
    };

    // Lógica dinámica para posicionar el botón según el tamaño de la pantalla
    const aboutText = document.querySelector('[data-i18n="about.text"]');
    const mq = window.matchMedia("(max-width: 900px)");

    const placeButton = () => {
      if (mq.matches) {
        if (isVisible) {
          // En móvil, desplegado: al final del cronograma
          timelineContainer.parentNode.insertBefore(toggleBtn, timelineContainer.nextSibling);
          toggleBtn.style.margin = '-25px auto 0';
          timelineContainer.style.marginTop = '20px';
        } else {
          // En móvil, oculto: debajo de la imagen (antes del cronograma)
          timelineContainer.parentNode.insertBefore(toggleBtn, timelineContainer);
          toggleBtn.style.margin = '-15px auto 0';
          timelineContainer.style.marginTop = '-30px';
        }
      } else {
        // En escritorio: debajo del texto
        if (aboutText && aboutText.parentNode) {
          aboutText.parentNode.insertBefore(toggleBtn, aboutText.nextSibling);
        }
        toggleBtn.style.margin = 'auto 0 0';
        timelineContainer.style.marginTop = '-30px'; 
      }
    };

    // Preparamos los estilos iniciales para la animación
    timelineContainer.style.transition = 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    timelineContainer.style.opacity = '0';
    timelineContainer.style.transform = 'translateY(-15px)';
    timelineContainer.style.display = 'none'; // Oculto por defecto
    updateButtonText();
    placeButton();

    // Escuchamos los cambios de tamaño de pantalla en tiempo real
    if (mq.addEventListener) mq.addEventListener('change', placeButton);
    else mq.addListener(placeButton);

    toggleBtn.addEventListener('click', () => {
      isVisible = !isVisible;
      
      if (isVisible) {
        placeButton(); // Movemos el botón abajo antes de mostrar el cronograma
        timelineContainer.style.display = '';
        // Forzamos un 'reflow' para que el navegador aplique la transición desde 0
        void timelineContainer.offsetWidth;
        timelineContainer.style.opacity = '1';
        timelineContainer.style.transform = 'translateY(0)';

        // Hacemos scroll suave hacia el cronograma solo en móviles
        if (mq.matches) {
          setTimeout(() => {
            const offset = 80; // Altura aproximada de la cabecera (navbar)
            const top = timelineContainer.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }, 100); // Pequeño retraso para que la animación fluya bien
        }
      } else {
        timelineContainer.style.opacity = '0';
        timelineContainer.style.transform = 'translateY(-15px)';

        if (mq.matches) {
          // Scroll suave hacia arriba (hacia la imagen) al ocultar
          const aboutImage = document.querySelector('.about__image-container');
          setTimeout(() => {
            const offset = 80;
            const top = (aboutImage || timelineContainer).getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
          }, 10);
        }

        setTimeout(() => { 
          if (!isVisible) {
            timelineContainer.style.display = 'none'; 
            placeButton(); // Reubicamos el botón arriba al terminar la animación
          }
        }, 500);
      }
      
      updateButtonText();
    });
  }

  initAboutTimelineToggle();
})();