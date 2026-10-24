
"use strict";

/**
 * A.RISE | PIX DO DESTINO
 * Experiência humorística, sem transações financeiras.
 *
 * Fluxo:
 * intro -> processing -> reveal
 */

(() => {
  const screens = {
    intro: document.querySelector('[data-pix-screen="intro"]'),
    processing: document.querySelector(
      '[data-pix-screen="processing"]'
    ),
    reveal: document.querySelector('[data-pix-screen="reveal"]'),
  };

  const startButton = document.querySelector("[data-pix-start]");
  const restartButton = document.querySelector("[data-pix-restart]");

  const processingDuration = 1800;

  let processingTimer = null;

  // Não executar se o HTML da experiência estiver incompleto.
  const requiredElements = [
    screens.intro,
    screens.processing,
    screens.reveal,
    startButton,
    restartButton,
  ];

  if (requiredElements.some((element) => !element)) {
    console.error(
      "[PIX DO DESTINO] Estrutura HTML incompleta. " +
      "Confira os atributos data-pix-*."
    );
    return;
  }

  function showScreen(screenName) {
    Object.entries(screens).forEach(([name, element]) => {
      const isActive = name === screenName;

      element.hidden = !isActive;
      element.setAttribute("aria-hidden", String(!isActive));
    });
  }

  function stopProcessing() {
    if (processingTimer !== null) {
      window.clearTimeout(processingTimer);
      processingTimer = null;
    }
  }

  function startExperience() {
    stopProcessing();

    showScreen("processing");

    processingTimer = window.setTimeout(() => {
      processingTimer = null;
      showScreen("reveal");
    }, processingDuration);
  }

  function restartExperience() {
    stopProcessing();
    showScreen("intro");
    startButton.focus();
  }

  startButton.addEventListener("click", startExperience);
  restartButton.addEventListener("click", restartExperience);

  // A experiência começa sempre na tela inicial.
  showScreen("intro");
})();
