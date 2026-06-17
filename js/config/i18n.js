(function () {
  const storageKey = "dg-language";
  const defaultLanguage = "es";

  const resources = {
    es: {
      "nav.home": "Inicio",
      "nav.projects": "Proyectos",
      "nav.about": "Conócenos",
      "nav.contact": "Contacto",
      "nav.openMenu": "Abrir menú de navegación",
      "nav.closeMenu": "Cerrar menú de navegación",
      "theme.light": "Activar modo claro",
      "theme.dark": "Activar modo oscuro",
      "language.toggle": "Cambiar idioma",
      "language.current": "ES",
      "document.title.home": "Dimensión Girasol",
      "document.title.contact": "Contacto - Dimensión Girasol",

      "hero.title": "Arte digital convertido en realidad",
      "hero.tag": "Impresion 3D - Figuras - Miniaturas - Grabado Láser",
      "hero.text": "Especialistas en impresión 3D en resina y filamento, pintura de miniaturas y grabado láser.",
      "hero.cta": "Ver proyectos",
      "hero.cardDetails": "Mostrar detalles",

      "how.tag": "¿Tienes una idea?",
      "how.title": "La hacemos realidad",
      "how.text": "Trabajamos siguiendo los siguientes pasos:",
      "how.step1.title": "Tu idea",
      "how.step1.text": "Ponte en contacto con nosotros y cuéntanos tu idea junto las referencias, tamaño y acabado deseado.",
      "how.step2.title": "Propuesta y presupuesto",
      "how.step2.text": "Materiales, tiempos y precio claros antes de empezar.",
      "how.step3.title": "Preparación y producción",
      "how.step3.text": "Laminamos los archivos y los pasamos a la impresion 3D o láser con control de calidad en cada fase.",
      "how.step4.title": "Postprocesado y pintura",
      "how.step4.text": "Tratamiento de la pieza y posible pintura a mano + barnizado.",
      "how.step5.title": "Envio",
      "how.step5.text": "Fotos finales y coordinacion de entrega o envío en un cuidadoso embalaje.",

      "about.tag": "Conócenos",
      "about.title": "Somos Dimensión Girasol",
      "about.text": "Nacimos de la curiosidad y la pasión por el arte digital y la creación física. Lo que empezó como un pasatiempo se ha convertido en nuestro proyecto de vida, donde cada figura que imprimimos, pintamos y preparamos lleva un pedacito de nosotros.",
      "about.socialLabel": "Nos puedes encontrar en nuestras redes sociales",
      "about.whatsapp": "Escríbenos",
      "about.contactTitle": "Hablemos de tu idea",
      "about.timeline.2020.title": "Nuestros inicios",
      "about.timeline.2020.text": "Compramos nuestra primera impresora 3D de filamento. Empezamos a experimentar, aprender y crear nuestras primeras piezas.",
      "about.timeline.2021.title": "Primeros encargos",
      "about.timeline.2021.text": "Comenzamos a pintar miniaturas y a recibir los primeros pedidos. Nos dimos cuenta de que podíamos hacer felices a los demás con nuestro arte.",
      "about.timeline.2022.title": "El salto a la resina",
      "about.timeline.2022.text": "Adquirimos impresoras de resina, dando un salto gigante en el nivel de detalle y la calidad de nuestras figuras.",
      "about.timeline.2023.title": "Nuevas fronteras",
      "about.timeline.2023.text": "Incorporamos el grabado láser a nuestro taller y empezamos a asistir a nuestros primeros eventos y ferias locales.",
      "about.timeline.2024.title": "Dimensión Girasol",
      "about.timeline.2024.text": "Nos consolidamos como marca y ampliamos nuestro catálogo, poniendo el mismo mimo y cariño en cada nuevo proyecto.",

      "contact.tag": "Contáctanos",
      "contact.title": "Cuéntanos tu idea",
      "contact.text": "Rellena el formulario con una breve descripcion de lo que necesitas y un email de contacto. Te responderemos lo antes posible.",
      "contact.name": "Nombre",
      "contact.namePlaceholder": "Tu nombre",
      "contact.email": "Email de contacto",
      "contact.emailPlaceholder": "tu@email.com",
      "contact.requestType": "Tipo de peticion",
      "contact.requestPlaceholder": "Selecciona una opción",
      "contact.request3d": "Impresion 3D",
      "contact.requestPaint": "Pintura de figura",
      "contact.requestLaser": "Grabado láser",
      "contact.requestOther": "Otro",
      "contact.message": "Petición",
      "contact.messagePlaceholder": "Cuánto mas detalle nos des, mejor podremos orientarte.",
      "contact.submit": "Enviar petición",
      "contact.note": "El formulario abrirá tu correo para enviar la petición.",

      "projects.tag": "Nuestros proyectos",
      "projects.title": "Echa un vistazo a nuestra colección",
      "projects.text": "Filtra por artista para descubrir distintas figuras hechas en impresion 3D y pintadas a mano.",
      "projects.filterLabel": "Filtrar proyectos",
      "projects.filterJorge": "Filtrar proyectos de Jorge",
      "projects.filterAll": "Mostrar todos los proyectos",
      "projects.filterEsther": "Filtrar proyectos de Esther",
      "projects.bubbleJorge": "¡Soy Jorge! Echa un vistazo a mis proyectos",
      "projects.bubbleAll": "Ver todos",
      "projects.bubbleEsther": "¡Soy Esther! Mira mis proyectos",
      "projects.loading": "Cargando proyectos...",
      "projects.loadingByAuthor": "Cargando proyectos de {author}...",
      "projects.all": "todos",
      "projects.defaultTag": "proyecto",
      "projects.empty": "Todaváa no hay proyectos publicados.",
      "projects.error": "No se pudieron cargar los proyectos. Intántalo de nuevo más tarde.",
      "projects.openGallery": "Abrir galeria de {title}",
      "projects.modalTitle": "Proyecto",
      "projects.modalClose": "Cerrar modal",
      "projects.modalPrev": "Anterior imagen",
      "projects.modalNext": "Siguiente imagen",
      "projects.modalLoadingImage": "Cargando imagen",
      "projects.modalViewImage": "Ver imagen {index}",
      "projects.pagePrev": "Anterior",
      "projects.pageNext": "Siguiente",

      "footer.aboutTitle": "Sobre nosotros",
      "footer.aboutLink": "Quiénes somos",
      "footer.helpTitle": "Ayuda",
      "footer.faq": "Preguntas y respuestas",
      "footer.shopping": "Compras",
      "footer.shipping": "Envíos",
      "footer.contactTitle": "Contacto",
    },
    en: {
      "nav.home": "Home",
      "nav.projects": "Projects",
      "nav.about": "About us",
      "nav.contact": "Contact",
      "nav.openMenu": "Open navigation menu",
      "nav.closeMenu": "Close navigation menu",
      "theme.light": "Switch to light mode",
      "theme.dark": "Switch to dark mode",
      "language.toggle": "Change language",
      "language.current": "EN",
      "document.title.home": "Dimension Girasol",
      "document.title.contact": "Contact - Dimension Girasol",

      "hero.title": "Digital art brought to life",
      "hero.tag": "3D Printing - Figures - Miniatures - Laser Engraving",
      "hero.text": "Specialists in resin and filament 3D printing, miniature painting and laser engraving.",
      "hero.cta": "View projects",
      "hero.cardDetails": "Show details",

      "how.tag": "Got an idea?",
      "how.title": "We make it real",
      "how.text": "We work through these steps:",
      "how.step1.title": "Your idea",
      "how.step1.text": "Contact us and tell us your idea, references, size and desired finish.",
      "how.step2.title": "Proposal and quote",
      "how.step2.text": "Clear materials, timelines and pricing before we begin.",
      "how.step3.title": "Preparation and production",
      "how.step3.text": "We slice the files and move them to 3D printing or laser work with quality checks at every stage.",
      "how.step4.title": "Post-processing and painting",
      "how.step4.text": "Piece treatment and optional hand painting plus varnishing.",
      "how.step5.title": "Shipping",
      "how.step5.text": "Final photos and delivery or shipping coordination with careful packaging.",

      "about.tag": "About us",
      "about.title": "We are Dimension Girasol",
      "about.text": "We were born from curiosity and a passion for digital art and physical creation. What started as a hobby has become our life project, where every figure we print, paint, and prepare carries a piece of us.",
      "about.socialLabel": "Dimension Girasol social links",
      "about.whatsapp": "Text us",
      "about.contactTitle": "Let's talk about your idea",
      "about.timeline.2020.title": "Our beginnings",
      "about.timeline.2020.text": "We bought our first filament 3D printer. We started experimenting, learning, and creating our first pieces.",
      "about.timeline.2021.title": "First orders",
      "about.timeline.2021.text": "We started painting miniatures and receiving our first orders. We realized we could make others happy with our art.",
      "about.timeline.2022.title": "Leap to resin",
      "about.timeline.2022.text": "We acquired resin printers, taking a giant leap in the level of detail and quality of our figures.",
      "about.timeline.2023.title": "New frontiers",
      "about.timeline.2023.text": "We added laser engraving to our workshop and started attending our first local events and fairs.",
      "about.timeline.2024.title": "Dimension Girasol",
      "about.timeline.2024.text": "We established ourselves as a brand and expanded our catalog, putting the same care and love into every new project.",

      "contact.tag": "Contact us",
      "contact.title": "Tell us your idea",
      "contact.text": "Fill out the form with a short description of what you need and a contact email. We will reply as soon as possible.",
      "contact.name": "Name",
      "contact.namePlaceholder": "Your name",
      "contact.email": "Contact email",
      "contact.emailPlaceholder": "you@email.com",
      "contact.requestType": "Request type",
      "contact.requestPlaceholder": "Select an option",
      "contact.request3d": "3D printing",
      "contact.requestPaint": "Figure painting",
      "contact.requestLaser": "Laser engraving",
      "contact.requestOther": "Other",
      "contact.message": "Request",
      "contact.messagePlaceholder": "The more detail you give us, the better we can guide you.",
      "contact.submit": "Send request",
      "contact.note": "The form will open your email client to send the request.",

      "projects.tag": "Our projects",
      "projects.title": "Take a look at our collection",
      "projects.text": "Filter by artist to discover different 3D-printed and hand-painted figures.",
      "projects.filterLabel": "Filter projects",
      "projects.filterJorge": "Filter Jorge projects",
      "projects.filterAll": "Show all projects",
      "projects.filterEsther": "Filter Esther projects",
      "projects.bubbleJorge": "I'm Jorge! Take a look at my projects",
      "projects.bubbleAll": "View all",
      "projects.bubbleEsther": "I'm Esther! See my projects",
      "projects.loading": "Loading projects...",
      "projects.loadingByAuthor": "Loading {author} projects...",
      "projects.all": "all",
      "projects.defaultTag": "project",
      "projects.empty": "There are no published projects yet.",
      "projects.error": "Projects could not be loaded. Please try again later.",
      "projects.openGallery": "Open {title} gallery",
      "projects.modalTitle": "Project",
      "projects.modalClose": "Close modal",
      "projects.modalPrev": "Previous image",
      "projects.modalNext": "Next image",
      "projects.modalLoadingImage": "Loading image",
      "projects.modalViewImage": "View image {index}",
      "projects.pagePrev": "Previous",
      "projects.pageNext": "Next",

      "footer.aboutTitle": "About us",
      "footer.aboutLink": "Who we are",
      "footer.helpTitle": "Help",
      "footer.faq": "Questions and answers",
      "footer.shopping": "Purchases",
      "footer.shipping": "Shipping",
      "footer.contactTitle": "Contact",
      "footer.copy": "(c) 2026 Dimension Girasol. All rights reserved."
    }
  };

  const interpolate = (text, params = {}) =>
    String(text || "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");

  const getSavedLanguage = () => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "es" || saved === "en") return saved;
    } catch {
      // ignore
    }

    return defaultLanguage;
  };

  let currentLanguage = getSavedLanguage();

  const t = (key, params) => interpolate(resources[currentLanguage]?.[key] || resources[defaultLanguage]?.[key] || key, params);

  const apply = (root = document) => {
    document.documentElement.lang = currentLanguage;
    const page = document.body?.dataset.page || "home";
    document.title = t(`document.title.${page}`);

    root.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });

    root.querySelectorAll("[data-i18n-html]").forEach((element) => {
      element.innerHTML = t(element.dataset.i18nHtml);
    });

    root.querySelectorAll("[data-i18n-attr]").forEach((element) => {
      element.dataset.i18nAttr.split(",").forEach((entry) => {
        const [attr, key] = entry.split(":").map((value) => value.trim());
        if (attr && key) element.setAttribute(attr, t(key));
      });
    });

    document.dispatchEvent(new CustomEvent("dg:languagechange", { detail: { language: currentLanguage } }));
  };

  const setLanguage = (language) => {
    if (!resources[language]) return;
    currentLanguage = language;
    try {
      localStorage.setItem(storageKey, language);
    } catch {
      // ignore
    }
    apply(document);
  };

  const toggleLanguage = () => setLanguage(currentLanguage === "es" ? "en" : "es");

  window.DGI18n = {
    apply,
    getLanguage: () => currentLanguage,
    setLanguage,
    t,
    toggleLanguage
  };

  apply(document);
})();
