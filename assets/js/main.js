// Reduce-motion flag
const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;
// Unified caption delay after image transition
const CAPTION_DELAY = reduceMotion ? 0 : 300; // ms
let heroCaptionTimer;

// Mobile menu toggle
const mobileBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");
mobileBtn?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.toggle("hidden") === false;
  mobileBtn.setAttribute("aria-expanded", String(isOpen));
  document.documentElement.style.overflow = isOpen ? "hidden" : "";
});
// ESC closes mobile menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !mobileMenu.classList.contains("hidden")) {
    mobileMenu.classList.add("hidden");
    mobileBtn.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
    mobileBtn.focus();
  }
});

// Back to top
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  toTop?.classList.toggle("hidden", window.scrollY < 400);
});
toTop?.addEventListener("click", () =>
  window.scrollTo({ top: 0, behavior: "smooth" })
);

// Current year
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();

// Init Swiper (hero) & AOS safely
window.addEventListener("DOMContentLoaded", () => {
  if (window.Swiper) {
    const heroSwiper = new Swiper(".hero-swiper", {
      loop: true,
      speed: 800,
      autoplay: reduceMotion
        ? false
        : { delay: 5000, disableOnInteraction: false },
      effect: reduceMotion ? "slide" : "fade",
      fadeEffect: { crossFade: true },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      on: {
        init(sw) {
          // Hide all captions initially, then reveal only the active one after first paint
          document
            .querySelectorAll(".hero-text")
            .forEach((el) => el.classList.remove("show"));
          const active = document.querySelector(
            ".hero-swiper .swiper-slide-active .hero-text"
          );
          if (heroCaptionTimer) clearTimeout(heroCaptionTimer);
          if (active)
            heroCaptionTimer = setTimeout(
              () => active.classList.add("show"),
              CAPTION_DELAY
            );
        },
        slideChangeTransitionStart(sw) {
          // Always hide captions at the start of a transition (manual or autoplay)
          if (heroCaptionTimer) clearTimeout(heroCaptionTimer);
          document
            .querySelectorAll(".hero-text")
            .forEach((el) => el.classList.remove("show"));
        },
        slideChangeTransitionEnd(sw) {
          // Reveal caption only after the image transition has finished
          const active = document.querySelector(
            ".hero-swiper .swiper-slide-active .hero-text"
          );
          if (heroCaptionTimer) clearTimeout(heroCaptionTimer);
          if (active)
            heroCaptionTimer = setTimeout(
              () => active.classList.add("show"),
              CAPTION_DELAY
            );
        },
      },
    });

    // Ensure autoplay resumes after user clicks nav arrows (safety in addition to disableOnInteraction:false)
    const nextBtn = document.querySelector(".swiper-button-next");
    const prevBtn = document.querySelector(".swiper-button-prev");
    [nextBtn, prevBtn].forEach((btn) =>
      btn?.addEventListener("click", () => {
        if (
          heroSwiper?.autoplay &&
          typeof heroSwiper.autoplay.start === "function"
        ) {
          heroSwiper.autoplay.start();
        }
      })
    );
  }
  if (window.AOS) {
    AOS.init({
      duration: 700,
      once: true,
      offset: 80,
      easing: "ease-out-cubic",
    });
  }
});

// Card tilt micro-interaction (disabled if reduce-motion)
if (!reduceMotion) {
  document.querySelectorAll(".card-tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const cx = e.clientX - r.left,
        cy = e.clientY - r.top;
      const rx = (cy / r.height - 0.5) * -6;
      const ry = (cx / r.width - 0.5) * 6;
      card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  });
}

// Hide mobile sticky CTA when contact section is in view
const stickyCta = document.querySelector(".md:hidden.fixed.inset-x-0.bottom-0");
const contactSection = document.getElementById("contact");
if (stickyCta && contactSection && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => {
      stickyCta.style.display = entry.isIntersecting ? "none" : "";
    },
    { threshold: 0.1 }
  ).observe(contactSection);
}
