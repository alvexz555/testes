"use strict";

/**
 * A.RISE | PIX DO DESTINO
 *
 * Fluxo:
 * intro -> processing -> reveal
 *       -> donation -> instagram -> portfolio
 *
 * Nenhuma transação financeira é realizada.
 */

(() => {
  const PROCESSING_DURATION = 1800;
  const IMPACT_DURATION = 850;

  /*
   * CONFIGURAÇÃO
   *
   * Substitua a string vazia pela chave Pix real.
   * Enquanto estiver vazia, a cópia permanece desativada.
   */
  const PIX_KEY = "";

  /*
   * O HTML está dentro da pasta pix-do-destino/.
   * "../" aponta para a página principal do site.
   */
  const PORTFOLIO_URL = "../";
  const INSTAGRAM_URL = "https://www.instagram.com/alvex.rise/";

  const screenNames = [
    "intro",
    "processing",
    "reveal",
    "donation",
    "instagram",
  ];

  const screens = Object.fromEntries(
    screenNames.map((name) => [
      name,
      document.querySelector(
        `[data-pix-screen="${name}"]`
      ),
    ])
  );

  const startButton = document.querySelector("[data-pix-start]");
  const restartButton = document.querySelector("[data-pix-restart]");
  const donationButton = document.querySelector("[data-pix-donation]");
  const instagramStepButton = document.querySelector(
    "[data-pix-instagram-step]"
  );
  const continueButton = document.querySelector("[data-pix-continue]");
  const copyButton = document.querySelector("[data-pix-copy]");

  const pixKeyDisplay = document.querySelector(
    "[data-pix-key-display]"
  );

  const pixStatus = document.querySelector("[data-pix-status]");
  const impactOverlay = document.querySelector("[data-pix-impact]");
  const instagramLink = document.querySelector("[data-pix-instagram]");
  const yearElement = document.querySelector("[data-current-year]");

  let processingTimer = null;
  let impactTimer = null;
  let isProcessing = false;
  let isCopying = false;

  function validateStructure() {
    const requiredElements = [
      ...Object.values(screens),
      startButton,
      restartButton,
      donationButton,
      instagramStepButton,
      continueButton,
      copyButton,
      pixKeyDisplay,
      pixStatus,
      impactOverlay,
      instagramLink,
    ];

    if (requiredElements.every(Boolean)) {
      return true;
    }

    console.error(
      "[PIX DO DESTINO] Estrutura incompleta. Confira os atributos data-pix-* do HTML."
    );

    return false;
  }

  function clearProcessingTimer() {
    if (processingTimer !== null) {
      window.clearTimeout(processingTimer);
      processingTimer = null;
    }

    isProcessing = false;
  }

  function clearImpactTimer() {
    if (impactTimer !== null) {
      window.clearTimeout(impactTimer);
      impactTimer = null;
    }

    impactOverlay.hidden = true;
    impactOverlay.classList.remove("is-active");
  }

  function playImpact() {
    clearImpactTimer();

    /*
     * Reinicia a animação sem criar elementos adicionais.
     */
    impactOverlay.hidden = false;
    impactOverlay.classList.remove("is-active");

    void impactOverlay.offsetWidth;

    impactOverlay.classList.add("is-active");

    impactTimer = window.setTimeout(() => {
      impactOverlay.hidden = true;
      impactOverlay.classList.remove("is-active");
      impactTimer = null;
    }, IMPACT_DURATION);
  }

  function focusScreen(screen) {
    const heading = screen.querySelector("h1");

    if (!heading) {
      return;
    }

    heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }

  function showScreen(screenName, options = {}) {
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
      screen.setAttribute("aria-hidden", String(!isActive));
    });

    if (options.impact) {
      playImpact();
    } else {
      clearImpactTimer();
    }

    if (options.focus !== false) {
      focusScreen(selectedScreen);
    }
  }

  function startExperience() {
    if (isProcessing) {
      return;
    }

    clearProcessingTimer();
    clearImpactTimer();

    isProcessing = true;
    startButton.disabled = true;

    showScreen("processing");

    processingTimer = window.setTimeout(() => {
      processingTimer = null;
      isProcessing = false;
      startButton.disabled = false;

      showScreen("reveal", { impact: true });
    }, PROCESSING_DURATION);
  }

  function restartExperience() {
    clearProcessingTimer();
    clearImpactTimer();

    startButton.disabled = false;

    showScreen("intro");
    startButton.focus({ preventScroll: true });
  }

  function goToDonation() {
    clearProcessingTimer();
    showScreen("donation");
  }

  function goToInstagramStep() {
    showScreen("instagram");
  }

  function goToPortfolio() {
    clearProcessingTimer();
    clearImpactTimer();

    window.location.assign(PORTFOLIO_URL);
  }

  async function copyPixKey() {
    if (!PIX_KEY.trim() || isCopying) {
      return;
    }

    isCopying = true;
    copyButton.disabled = true;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(PIX_KEY);
      } else {
        /*
         * Alternativa para contextos sem Clipboard API.
         */
        const temporaryInput = document.createElement("textarea");

        temporaryInput.value = PIX_KEY;
        temporaryInput.setAttribute("readonly", "");
        temporaryInput.style.position = "fixed";
        temporaryInput.style.opacity = "0";

        document.body.appendChild(temporaryInput);
        temporaryInput.select();

        const copied = document.execCommand("copy");

        temporaryInput.remove();

        if (!copied) {
          throw new Error("Não foi possível copiar a chave.");
        }
      }

      pixStatus.textContent = "Chave Pix copiada. Obrigado pelo apoio!";
      copyButton.textContent = "Chave copiada ✓";
    } catch (error) {
      console.error("[PIX DO DESTINO] Erro ao copiar a chave:", error);

      pixStatus.textContent =
        "Não foi possível copiar automaticamente. Selecione a chave acima e copie manualmente.";
    } finally {
      isCopying = false;
      copyButton.disabled = !PIX_KEY.trim();
    }
  }

  function configureDonation() {
    const hasPixKey = PIX_KEY.trim().length > 0;

    pixKeyDisplay.textContent = hasPixKey
      ? PIX_KEY
      : "Chave Pix ainda não configurada.";

    copyButton.disabled = !hasPixKey;

    pixStatus.textContent = hasPixKey
      ? "A contribuição é totalmente opcional."
      : "Configure sua chave Pix no arquivo pix.js para habilitar a cópia.";
  }

  function initialize() {
    if (!validateStructure()) {
      return;
    }

    if (yearElement) {
      yearElement.textContent = String(new Date().getFullYear());
    }

    instagramLink.href = INSTAGRAM_URL;

    configureDonation();

    startButton.addEventListener("click", startExperience);
    restartButton.addEventListener("click", restartExperience);
    donationButton.addEventListener("click", goToDonation);
    instagramStepButton.addEventListener(
      "click",
      goToInstagramStep
    );
    continueButton.addEventListener("click", goToPortfolio);
    copyButton.addEventListener("click", copyPixKey);

    showScreen("intro", { focus: false });

    console.info(
      "[PIX DO DESTINO] Experiência inicializada corretamente."
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
