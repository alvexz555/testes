"use strict";

/**
 * A.RISE | Portfolio
 * Arquivo: js/main.js
 *
 * Responsabilidades:
 * - Atualizar o ano do rodapé.
 * - Preparar links externos.
 * - Controlar a navegação mobile.
 */

(() => {
  function initializeYear() {
    const yearElements = document.querySelectorAll(
      "[data-current-year]"
    );

    const currentYear = new Date().getFullYear();

    yearElements.forEach((element) => {
      element.textContent = String(currentYear);
    });
  }

  function initializeExternalLinks() {
    const externalLinks = document.querySelectorAll(
      'a[href="https://www.instagram.com/alvex.rise/"]'
    );

    externalLinks.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function initializeMobileNavigation() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("#main-navigation");

    if (!toggle || !navigation) {
      return;
    }

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      navigation.classList.remove("is-open");
    }

    function toggleMenu() {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";

      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Abrir menu" : "Fechar menu"
      );

      navigation.classList.toggle("is-open", !isOpen);
    }

    toggle.addEventListener("click", toggleMenu);

    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 761px)").matches) {
        closeMenu();
      }
    });
  }

  function initialize() {
    initializeYear();
    initializeExternalLinks();
    initializeMobileNavigation();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true,
    });
  } else {
    initialize();
  }
})();
