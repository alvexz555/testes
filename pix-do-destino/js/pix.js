
"use strict";

/**
 * A.RISE | PIX DO DESTINO
 * Arquivo: pix-do-destino/js/pix.js
 *
 * Fluxo:
 * intro -> processing -> reveal
 *
 * Nenhuma transação financeira é realizada.
 */

(() => {
  const PROCESSING_DURATION = 1800;

  const screens = {
    intro: document.querySelector(
      '[data-pix-screen="intro"]'
    ),

    processing: document.querySelector(
      '[data-pix-screen="processing"]'
    ),

    reveal: document.querySelector(
      '[data-pix-screen="reveal"]'
    ),
  };

  const startButton = document.querySelector(
    "[data-pix-start]"
  );

  const restartButton = document.querySelector(
    "[data-pix-restart]"
  );

  let processingTimer = null;
  let isProcessing = false;

  /**
   * Verifica se o HTML possui todos os elementos necessários.
   */
  function validateStructure() {
    const requiredElements = [
      screens.intro,
      screens.processing,
      screens.reveal,
      startButton,
      restartButton,
    ];

    const isValid = requiredElements.every(Boolean);

    if (!isValid) {
      console.error(
        "[PIX DO DESTINO] Não foi possível iniciar.",
        "Confira os elementos data-pix-* do HTML."
      );
    }

    return isValid;
  }

  /**
   * Exibe uma etapa e oculta as outras.
   */
  function showScreen(screenName) {
    const selectedScreen = screens[screenName];

    if (!selectedScreen) {
      console.error(
        `[PIX DO DESTINO] Etapa desconhecida: ${screenName}`
      );
      return;
    }

    Object.entries(screens).forEach(([name, screen]) => {
      const isActive = name === screenName;

      screen.hidden = !isActive;
      screen.setAttribute(
        "aria-hidden",
        String(!isActive)
      );
    });
  }

  /**
   * Cancela qualquer processamento pendente.
   */
  function clearProcessingTimer() {
    if (processingTimer !== null) {
      window.clearTimeout(processingTimer);
      processingTimer = null;
    }

    isProcessing = false;
  }

  /**
   * Inicia a experiência.
   */
  function startExperience() {
    if (isProcessing) {
      return;
    }

    clearProcessingTimer();
    isProcessing = true;

    showScreen("processing");

    processingTimer = window.setTimeout(() => {
      processingTimer = null;
      isProcessing = false;

      showScreen("reveal");

      // Move o foco para o título da revelação, se possível.
      const revealTitle = screens.reveal.querySelector("h1");

      if (revealTitle) {
        revealTitle.setAttribute("tabindex", "-1");
        revealTitle.focus({ preventScroll: true });
      }
    }, PROCESSING_DURATION);
  }

  /**
   * Reinicia a experiência sem recarregar a página.
   */
  function restartExperience() {
    clearProcessingTimer();

    showScreen("intro");
    startButton.focus();
  }

  /**
   * Inicializa o comportamento.
   */
  function initialize() {
    if (!validateStructure()) {
      return;
    }

    startButton.addEventListener(
      "click",
      startExperience
    );

    restartButton.addEventListener(
      "click",
      restartExperience
    );

    // Estado inicial: somente a primeira tela aparece.
    showScreen("intro");

    console.info(
      "[PIX DO DESTINO] Experiência inicializada."
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true,
    });
  } else {
    initialize();
  }
})();
