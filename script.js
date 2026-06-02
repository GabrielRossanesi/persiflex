const WHATSAPP_NUMBER = "";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site da Persiflex e gostaria de solicitar um orçamento.";

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const whatsappLinks = document.querySelectorAll("[data-whatsapp]");
const revealElements = document.querySelectorAll(".reveal");
const localImages = document.querySelectorAll("[data-local-image]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

heroVisual?.classList.add("is-visible");

localImages.forEach((image) => {
  const frame = image.closest(".photo-frame");

  const markLoaded = () => {
    frame?.classList.add("image-loaded");
    frame?.classList.remove("image-failed");
  };

  const markFailed = () => {
    frame?.classList.add("image-failed");
    frame?.classList.remove("image-loaded");
    image.setAttribute("hidden", "");
  };

  image.addEventListener("load", markLoaded, { once: true });
  image.addEventListener("error", markFailed, { once: true });

  if (image.complete) {
    if (image.naturalWidth > 0) {
      markLoaded();
    } else {
      markFailed();
    }
  }
});

function buildWhatsAppUrl() {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
  const message = encodeURIComponent(WHATSAPP_MESSAGE);

  if (!phone) {
    return `https://wa.me/?text=${message}`;
  }

  return `https://wa.me/${phone}?text=${message}`;
}

function closeMobileMenu() {
  document.body.classList.remove("nav-open");
  navToggle?.classList.remove("is-active");
  navToggle?.setAttribute("aria-expanded", "false");
  siteNav?.classList.remove("is-open");

  if (siteNav) {
    siteNav.style.removeProperty("opacity");
    siteNav.style.removeProperty("transform");
    siteNav.style.removeProperty("transition");
  }
}

function updateHeaderState() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function syncDesktopNavigation() {
  if (window.innerWidth >= 980) {
    closeMobileMenu();
  }
}

whatsappLinks.forEach((link) => {
  link.setAttribute("href", buildWhatsAppUrl());
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener");
});

navToggle?.addEventListener("click", () => {
  const isOpen = siteNav?.classList.toggle("is-open");
  navToggle.classList.toggle("is-active", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  document.body.classList.toggle("nav-open", Boolean(isOpen));

  if (siteNav) {
    if (isOpen) {
      siteNav.style.setProperty("transition", "none", "important");
      siteNav.style.setProperty("opacity", "1", "important");
      siteNav.style.setProperty("transform", "translateY(0)", "important");
    } else {
      siteNav.style.removeProperty("opacity");
      siteNav.style.removeProperty("transform");
      siteNav.style.removeProperty("transition");
    }
  }
});

siteNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", syncDesktopNavigation, { passive: true });
updateHeaderState();
syncDesktopNavigation();

if (hero && heroVisual && !prefersReducedMotion.matches) {
  hero.addEventListener(
    "pointermove",
    (event) => {
      if (window.innerWidth < 900) {
        return;
      }

      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      heroVisual.style.setProperty("--hero-shift-x", `${x * 15}px`);
      heroVisual.style.setProperty("--hero-shift-y", `${y * 12}px`);

    },
    { passive: true }
  );

  hero.addEventListener("pointerleave", () => {
    heroVisual.style.removeProperty("--hero-shift-x");
    heroVisual.style.removeProperty("--hero-shift-y");
  });
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));

  requestAnimationFrame(() => {
    revealElements.forEach((element) => {
      const rect = element.getBoundingClientRect();

      if (rect.top < window.innerHeight * 0.94) {
        element.classList.add("is-visible");
        revealObserver.unobserve(element);
      }
    });
  });
} else {
  revealElements.forEach((element) => element.classList.add("is-visible"));
}
