(() => {
  document.documentElement.classList.add("js-enabled");
  window.lucide?.createIcons();
  const languageButton = document.querySelector("[data-language-toggle]");
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const year = document.querySelector("[data-year]");
  const feedback = document.querySelector("[data-form-feedback]");
  const form = document.querySelector("[data-contact-form]");
  const cards = [...document.querySelectorAll("[data-review-card]")];
  let currentReview = 0;

  const translations = {
    uk: {
      title: "Рекламна агенція — стратегія та просування бізнесу",
      menuOpen: "Відкрити меню",
      menuClose: "Закрити меню",
      formReady: "Відкриваємо вашу поштову програму, щоб надіслати заявку.",
      reviewPrevious: "Попередній відгук",
      reviewNext: "Наступний відгук",
    },
    en: {
      title: "Advertising Agency — Business Strategy & Growth",
      menuOpen: "Open menu",
      menuClose: "Close menu",
      formReady: "Opening your email app to send the inquiry.",
      reviewPrevious: "Previous review",
      reviewNext: "Next review",
    },
  };

  function setLanguage(language) {
    const nextLanguage = language === "en" ? "en" : "uk";
    document.documentElement.lang = nextLanguage;
    const pageTitle = document.querySelector("[data-page-title]");
    document.title = pageTitle?.getAttribute(`data-${nextLanguage}`) || translations[nextLanguage].title;
    const pageDescription = document.querySelector('meta[name="description"]');
    const localizedDescription = pageDescription?.getAttribute(`data-description-${nextLanguage}`);
    if (localizedDescription) pageDescription.setAttribute("content", localizedDescription);
    document.querySelectorAll("[data-uk][data-en]:not([data-page-title])").forEach((element) => {
      const value = element.getAttribute(`data-${nextLanguage}`);
      if (!value) return;
      if (value.includes("<br")) element.innerHTML = value;
      else element.textContent = value;
    });
    document.querySelectorAll("[data-aria-label-uk][data-aria-label-en]").forEach((element) => {
      element.setAttribute("aria-label", element.getAttribute(`data-aria-label-${nextLanguage}`));
    });
    document.querySelectorAll("[data-placeholder-uk][data-placeholder-en]").forEach((element) => {
      element.placeholder = element.getAttribute(`data-placeholder-${nextLanguage}`);
    });
    if (languageButton) {
      languageButton.textContent = nextLanguage === "uk" ? "EN" : "UA";
      languageButton.setAttribute("aria-label", nextLanguage === "uk" ? "Switch to English" : "Перемкнути на українську");
    }
    if (menuButton) {
      const menuIsOpen = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-label", menuIsOpen ? translations[nextLanguage].menuClose : translations[nextLanguage].menuOpen);
    }
    document.querySelector("[data-review-prev]")?.setAttribute("aria-label", translations[nextLanguage].reviewPrevious);
    document.querySelector("[data-review-next]")?.setAttribute("aria-label", translations[nextLanguage].reviewNext);
    if (feedback) feedback.textContent = "";
    try { localStorage.setItem("agency-language", nextLanguage); } catch { /* Storage may be unavailable in a private browser context. */ }
  }

  function showReview(index) {
    if (!cards.length) return;
    currentReview = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === currentReview);
      card.setAttribute("aria-hidden", cardIndex === currentReview ? "false" : "true");
    });
    const counter = document.querySelector("[data-review-current]");
    if (counter) counter.textContent = String(currentReview + 1).padStart(2, "0");
  }

  function closeMenu() {
    if (!menuButton || !nav) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", translations[document.documentElement.lang]?.menuOpen || translations.uk.menuOpen);
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  languageButton?.addEventListener("click", () => {
    setLanguage(document.documentElement.lang === "uk" ? "en" : "uk");
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? translations[document.documentElement.lang].menuOpen : translations[document.documentElement.lang].menuClose);
    nav?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuButton?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuButton.focus();
    }
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.querySelector("[data-review-prev]")?.addEventListener("click", () => showReview(currentReview - 1));
  document.querySelector("[data-review-next]")?.addEventListener("click", () => showReview(currentReview + 1));

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const phone = String(values.get("phone") || "").trim();
    const message = String(values.get("message") || "").trim();
    const method = String(values.get("service") || "");
    const privacyConsent = form.elements.namedItem("privacy-consent")?.checked;
    const email = String(values.get("email") || "").trim();
    const subject = document.documentElement.lang === "uk" ? "Запит на рекламні послуги" : "Advertising services inquiry";
    const body = [
      `${document.documentElement.lang === "uk" ? "Ім’я" : "Name"}: ${name}`,
      `${document.documentElement.lang === "uk" ? "Телефон" : "Phone"}: ${phone}`,
      `${document.documentElement.lang === "uk" ? "Email" : "Email"}: ${email}`,
      `${document.documentElement.lang === "uk" ? "Напрям" : "Service"}: ${method}`,
      `${document.documentElement.lang === "uk" ? "Згода з політикою конфіденційності" : "Privacy policy consent"}: ${privacyConsent ? "yes" : "no"}`,
      `${document.documentElement.lang === "uk" ? "Повідомлення" : "Message"}: ${message || "—"}`,
    ].join("\n");
    feedback.textContent = translations[document.documentElement.lang].formReady;
    window.location.href = `mailto:info@lawport.pro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  if (year) year.textContent = new Date().getFullYear();
  showReview(0);
  let preferredLanguage = "uk";
  try { preferredLanguage = localStorage.getItem("agency-language") || "uk"; } catch { /* Keep Ukrainian as the default. */ }
  setLanguage(preferredLanguage);

  const revealElements = [...document.querySelectorAll(".reveal")];
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  }
})();
