
"use strict";

/**
 * A.RISE | Site institucional
 * Arquivo: js/main.js
 *
 * Responsabilidades:
 * - Atualizar o ano do rodapé.
 * - Manter o comportamento institucional independente
 *   da experiência PIX DO DESTINO.
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
    const instagramLinks = document.querySelectorAll(
      'a[href="https://www.instagram.com/alvex.rise/"]'
    );

    instagramLinks.forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });
  }

  function initialize() {
    initializeYear();
    initializeExternalLinks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true,
    });
  } else {
    initialize();
  }
})();
