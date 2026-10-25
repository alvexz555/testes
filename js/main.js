"use strict";

/**
 * A.RISE | Site institucional
 * Arquivo: js/main.js
 *
 * Responsabilidades:
 * - Atualizar o ano do rodapé.
 * - Controlar o menu para dispositivos móveis.
 * - Fechar o menu após a navegação.
 * - Configurar links externos do Instagram.
 */

(() => {
  function initializeYear() {
    const yearElements = document.querySelectorAll("[data-current-year]");
    const currentYear = String(new Date().getFullYear());

    yearElements.forEach((element) => {
      element.textContent = currentYear;
    });
  }

  function initializeExternalLinks() {
    const externalLinks = document.querySelectorAll(
      'a[href^="https://www.instagram.com/"]'
    );

    externalLinks.forEach((link) => {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  }

  function initializeMobileMenu() {
    const toggle = document.querySelector("[data-menu-toggle]");
    const navigation = document.querySelector("#main-navigation");

    if (!toggle || !navigation) {
      return;
    }

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      navigation.classList.remove("is-open");
      document.body.classList.remove("menu-open");
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fechar menu");
      navigation.classList.add("is-open");
      document.body.classList.add("menu-open");
    }

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";

      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) {
        closeMenu();
      }
    });
  }

  function initialize() {
    initializeYear();
    initializeExternalLinks();
    initializeMobileMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
