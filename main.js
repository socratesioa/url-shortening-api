document.addEventListener("DOMContentLoaded", () => {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("primaryNav");

  mobileMenu.setAttribute("tabindex", "-1");

  function getFocusableElements(container) {
    return Array.from(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );
  }

  function trapFocus(e, container) {
    const focusableItems = getFocusableElements(container);
    if (!focusableItems.length) return;

    if (!container.contains(document.activeElement)) return;

    const first = focusableItems[0];
    const last = focusableItems[focusableItems.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openMenu() {
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close Navigation Menu");
    mobileMenu.classList.add("active");
    document.body.classList.add("no-scroll");

    mobileMenu.focus();
  }

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open Navigation Menu");
    mobileMenu.classList.remove("active");
    document.body.classList.remove("no-scroll");

    menuToggle.focus();
  }

  menuToggle.addEventListener("click", () => {
    menuToggle.getAttribute("aria-expanded") === "true"
      ? closeMenu()
      : openMenu();
  });

  document.addEventListener("click", (e) => {
    const isMenuActive = mobileMenu.classList.contains("active");
    if (!isMenuActive) return;

    if (!mobileMenu.contains(e.target) && !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  mobileMenu.addEventListener("click", (e) => {
    if (e.target.closest("a") && mobileMenu.classList.contains("active")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    const isMenuActive = mobileMenu.classList.contains("active");
    if (!isMenuActive) return;

    const key = e.key.toLowerCase();
    if (key === "escape") {
      closeMenu();
    } else if (key === "tab") {
      trapFocus(e, mobileMenu);
    }
  });
});
