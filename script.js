const WHATSAPP_NUMBER = "554198750189";
const WHATSAPP_MESSAGE = "Olá! Vim pelo site da Persiflex e gostaria de solicitar um orçamento.";

const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const hero = document.querySelector(".hero");
const heroVisual = document.querySelector(".hero-visual");
const whatsappLinks = document.querySelectorAll("[data-whatsapp], [data-whatsapp-item]");
const revealElements = document.querySelectorAll(".reveal");
const localImages = document.querySelectorAll("[data-local-image]");
const modelCarousel = document.querySelector("[data-model-carousel]");
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

function initModelCarousel() {
  const track = modelCarousel?.querySelector("[data-model-track]");
  const prevButton = modelCarousel?.querySelector("[data-model-prev]");
  const nextButton = modelCarousel?.querySelector("[data-model-next]");
  const dotsContainer = modelCarousel?.querySelector("[data-model-dots]");

  if (!track || !prevButton || !nextButton || !dotsContainer) {
    return;
  }

  const cards = Array.from(track.querySelectorAll(".model-card"));
  let activeIndex = 0;
  let maxIndex = 0;
  let dots = [];
  let autoplayTimer = 0;
  let resumeTimer = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragDeltaX = 0;
  let dragStartTranslate = 0;
  const pauseReasons = new Set();
  const autoplayInterval = 5000;
  const autoplayResumeDelay = 8000;

  const getStep = () => {
    if (cards.length < 2) {
      return cards[0]?.getBoundingClientRect().width || track.clientWidth;
    }

    return Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft);
  };

  const getVisibleCount = () => {
    const step = getStep();
    return Math.max(1, Math.min(cards.length, Math.round((track.clientWidth + 1) / step)));
  };

  const getValidIndices = () => {
    const step = getVisibleCount();
    const indices = [];
    let current = 0;
    while (current < maxIndex) {
      indices.push(current);
      current += step;
    }
    if (!indices.includes(maxIndex)) {
      indices.push(maxIndex);
    }
    return indices;
  };

  const clampIndex = (index) => {
    const validIndices = getValidIndices();
    if (validIndices.includes(index)) {
      return index;
    }
    let closestVal = validIndices[0] || 0;
    let minDiff = Infinity;
    validIndices.forEach((val) => {
      const diff = Math.abs(val - index);
      if (diff < minDiff) {
        minDiff = diff;
        closestVal = val;
      }
    });
    return closestVal;
  };

  const canAutoplay = () => !prefersReducedMotion.matches && !document.hidden && maxIndex > 0 && pauseReasons.size === 0;

  const setTrackTranslate = (translateX, shouldAnimate = true) => {
    if (!shouldAnimate) {
      track.style.setProperty("transition", "none");
    } else {
      track.style.removeProperty("transition");
    }

    track.style.transform = `translate3d(${translateX}px, 0, 0)`;
  };

  const settleTransition = () => {
    requestAnimationFrame(() => track.style.removeProperty("transition"));
  };

  const getNextIndex = (currentIndex, direction) => {
    syncMaxIndex();
    const validIndices = getValidIndices();
    let idx = validIndices.indexOf(currentIndex);
    if (idx === -1) {
      let closestIdx = 0;
      let minDiff = Infinity;
      validIndices.forEach((val, i) => {
        const diff = Math.abs(val - currentIndex);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      });
      idx = closestIdx;
    }

    if (direction === 1) {
      if (idx >= validIndices.length - 1) {
        return validIndices[0]; // Wrap back to the beginning
      }
      return validIndices[idx + 1];
    } else {
      if (idx <= 0) {
        return validIndices[validIndices.length - 1]; // Wrap to the end
      }
      return validIndices[idx - 1];
    }
  };

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = 0;
  };

  const startAutoplay = () => {
    if (!canAutoplay() || autoplayTimer) {
      return;
    }

    autoplayTimer = window.setInterval(() => {
      scrollToIndex(getNextIndex(activeIndex, 1));
    }, autoplayInterval);
  };

  const pauseAutoplay = (reason, shouldResume = false) => {
    pauseReasons.add(reason);
    stopAutoplay();

    if (!shouldResume || prefersReducedMotion.matches) {
      return;
    }

    window.clearTimeout(resumeTimer);
    resumeTimer = window.setTimeout(() => {
      pauseReasons.delete(reason);
      startAutoplay();
    }, autoplayResumeDelay);
  };

  const resumeAutoplay = (reason) => {
    pauseReasons.delete(reason);
    startAutoplay();
  };

  const syncMaxIndex = () => {
    maxIndex = Math.max(0, cards.length - getVisibleCount());
    activeIndex = clampIndex(activeIndex);
  };

  const updateDots = (index = activeIndex) => {
    activeIndex = clampIndex(index);
    const validIndices = getValidIndices();

    dots.forEach((dot, dotIndex) => {
      const dotCardIndex = validIndices[dotIndex];
      const isActive = dotCardIndex === activeIndex;
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  const scrollToIndex = (index) => {
    syncMaxIndex();
    activeIndex = clampIndex(index);
    const targetLeft = Math.max(0, activeIndex * getStep());
    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";

    setTrackTranslate(-targetLeft, behavior === "smooth");

    if (behavior !== "smooth") {
      settleTransition();
    }

    updateDots(activeIndex);
  };

  const navigateManually = (index) => {
    pauseAutoplay("manual", true);
    scrollToIndex(index);
  };

  const renderDots = () => {
    syncMaxIndex();
    dotsContainer.innerHTML = "";
    const validIndices = getValidIndices();

    dots = validIndices.map((cardIndex, dotIndex) => {
      const dot = document.createElement("button");
      dot.className = "model-carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Ir para grupo ${dotIndex + 1} de modelos`);
      dot.addEventListener("click", () => navigateManually(cardIndex));
      dotsContainer.appendChild(dot);
      return dot;
    });

    updateDots(activeIndex);
  };

  prevButton.addEventListener("click", () => navigateManually(getNextIndex(activeIndex, -1)));
  nextButton.addEventListener("click", () => navigateManually(getNextIndex(activeIndex, 1)));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateManually(getNextIndex(activeIndex, -1));
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateManually(getNextIndex(activeIndex, 1));
    }
  });

  modelCarousel.addEventListener("mouseenter", () => pauseAutoplay("hover"));
  modelCarousel.addEventListener("mouseleave", () => resumeAutoplay("hover"));
  modelCarousel.addEventListener("focusin", () => pauseAutoplay("focus"));
  modelCarousel.addEventListener("focusout", () => resumeAutoplay("focus"));

  track.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("a, button")) {
      return;
    }

    pauseAutoplay("manual", true);
    isDragging = true;
    dragStartX = event.clientX;
    dragDeltaX = 0;
    dragStartTranslate = -activeIndex * getStep();
    track.classList.add("is-dragging");
    track.setPointerCapture?.(event.pointerId);
  });

  track.addEventListener("pointermove", (event) => {
    if (!isDragging) {
      return;
    }

    dragDeltaX = event.clientX - dragStartX;

    if (Math.abs(dragDeltaX) > 4) {
      event.preventDefault();
    }

    setTrackTranslate(dragStartTranslate + dragDeltaX, false);
  });

  const finishDrag = (event) => {
    if (!isDragging) {
      return;
    }

    isDragging = false;
    track.classList.remove("is-dragging");
    track.releasePointerCapture?.(event.pointerId);

    const threshold = getStep() * 0.18;

    if (Math.abs(dragDeltaX) > threshold) {
      navigateManually(getNextIndex(activeIndex, dragDeltaX < 0 ? 1 : -1));
    } else {
      scrollToIndex(activeIndex);
    }
  };

  track.addEventListener("pointerup", finishDrag);
  track.addEventListener("pointercancel", finishDrag);
  track.addEventListener("wheel", () => pauseAutoplay("manual", true), { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAutoplay("visibility");
    } else {
      resumeAutoplay("visibility");
    }
  });

  prefersReducedMotion.addEventListener("change", () => {
    stopAutoplay();

    if (!prefersReducedMotion.matches) {
      startAutoplay();
    }
  });

  window.addEventListener(
    "resize",
    () => {
      stopAutoplay();
      renderDots();
      requestAnimationFrame(() => {
        scrollToIndex(activeIndex);
        startAutoplay();
      });
    },
    { passive: true }
  );

  renderDots();
  startAutoplay();
}

initModelCarousel();

function buildWhatsAppUrl(messageText = WHATSAPP_MESSAGE) {
  const phone = WHATSAPP_NUMBER.replace(/\D/g, "");
  const message = encodeURIComponent(messageText);

  if (!phone) {
    return `https://wa.me/?text=${message}`;
  }

  return `https://wa.me/${phone}?text=${message}`;
}

function buildModelWhatsAppMessage(itemName) {
  return `Olá! Vim pelo site da Persiflex e tenho interesse em ${itemName}. Gostaria de solicitar um orçamento.`;
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
  const itemName = link.dataset.whatsappItem;
  const message = itemName ? buildModelWhatsAppMessage(itemName) : WHATSAPP_MESSAGE;

  link.setAttribute("href", buildWhatsAppUrl(message));
  link.setAttribute("target", "_blank");
  link.setAttribute("rel", "noopener noreferrer");
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
