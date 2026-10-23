
"use strict";

/* =========================================
   WATTSON CORE
   Interface e comunicação com a API
   ========================================= */

/* Configuração */

const API_URL =
  window.API_URL ||
  "https://payment-necessary-kit-deviation.trycloudflare.com/api/think";

const REQUEST_TIMEOUT = 60000;
const MAX_ACTIVITIES = 20;

/* Elementos da interface */

const elements = {
  systemStatus: document.getElementById("systemStatus"),
  coreTitle: document.getElementById("coreTitle"),
  coreActivity: document.getElementById("coreActivity"),
  corePanelStatus: document.getElementById("corePanelStatus"),

  systemState: document.getElementById("systemState"),
  memoryState: document.getElementById("memoryState"),
  robotState: document.getElementById("robotState"),

  chatHistory: document.getElementById("chatHistory"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  sendButton: document.getElementById("sendButton"),
  sendButtonText: document.getElementById("sendButtonText"),

  clearChatButton: document.getElementById("clearChatButton"),
  translateButton: document.getElementById("translateButton"),

  activityList: document.getElementById("activityList"),
  languageButtons: document.querySelectorAll(".language-button"),
};

/* Estado local */

const state = {
  busy: false,
  language: "pt-BR",
  activities: [],
  messages: [],
  requestController: null,
};

/* Utilidades */

function getTime() {
  return new Date().toLocaleTimeString(
    state.language,
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}

function scrollChatToBottom() {
  elements.chatHistory.scrollTop =
    elements.chatHistory.scrollHeight;
}

function setCoreState(mode, description) {
  const states = {
    idle: {
      status: "PRONTO",
      activity: "Aguardando uma mensagem.",
      panel: "EXPERIMENTAL",
    },
    thinking: {
      status: "PROCESSANDO",
      activity: "Wattson está processando sua mensagem.",
      panel: "EM EXECUÇÃO",
    },
    online: {
      status: "CONECTADO",
      activity: "Resposta recebida da API.",
      panel: "EXPERIMENTAL",
    },
    error: {
      status: "INDISPONÍVEL",
      activity: "Não foi possível concluir a solicitação.",
      panel: "VERIFICAR CONEXÃO",
    },
  };

  const config = states[mode] || states.idle;

  if (elements.systemStatus) {
    elements.systemStatus.dataset.status = mode;

    const statusText =
      elements.systemStatus.querySelector(".status-text");

    if (statusText) {
      statusText.textContent = config.status;
    }
  }

  if (elements.coreActivity) {
    elements.coreActivity.textContent =
      description || config.activity;
  }

  if (elements.corePanelStatus) {
    elements.corePanelStatus.textContent = config.panel;
  }

  if (elements.systemState) {
    elements.systemState.textContent = config.status;
    elements.systemState.dataset.state = mode;
  }

  if (elements.coreTitle) {
    elements.coreTitle.textContent = "Wattson Core";
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;

  if (elements.sendButton) {
    elements.sendButton.disabled = isBusy;
    elements.sendButton.setAttribute(
      "aria-busy",
      String(isBusy)
    );
  }

  if (elements.messageInput) {
    elements.messageInput.disabled = isBusy;
  }

  if (elements.sendButtonText) {
    elements.sendButtonText.textContent =
      isBusy ? "..." : "Enviar";
  }
}

/* Registro de atividades */

function logActivity(type, description) {
  const activity = {
    time: getTime(),
    type,
    description,
  };

  state.activities.unshift(activity);
  state.activities = state.activities.slice(0, MAX_ACTIVITIES);

  renderActivities();
}

function renderActivities() {
  if (!elements.activityList) return;

  elements.activityList.replaceChildren();

  if (state.activities.length === 0) {
    const empty = document.createElement("p");
    empty.className = "activity-empty";
    empty.textContent = "Nenhuma atividade registrada.";

    elements.activityList.appendChild(empty);
    return;
  }

  state.activities.forEach((activity) => {
    const row = document.createElement("div");
    row.className = "activity-item";

    const time = document.createElement("span");
    time.className = "activity-time";
    time.textContent = activity.time;

    const type = document.createElement("span");
    type.className = "activity-type";
    type.textContent = activity.type;

    const message = document.createElement("span");
    message.className = "activity-message";
    message.textContent = activity.description;

    row.append(time, type, message);
    elements.activityList.appendChild(row);
  });
}

/* Mensagens do chat */

function addMessage(role, text) {
  const isUser = role === "user";

  const article = document.createElement("article");
  article.className = `message ${isUser ? "user" : "assistant"}`;

  const avatar = document.createElement("div");
  avatar.className = "message-avatar";
  avatar.setAttribute("aria-hidden", "true");
  avatar.textContent = isUser ? "A" : "W";

  const content = document.createElement("div");
  content.className = "message-content";

  const header = document.createElement("div");
  header.className = "message-header";

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = isUser ? "VOCÊ" : "WATTSON";

  const time = document.createElement("time");
  time.className = "message-time";
  time.textContent = getTime();
  time.dateTime = new Date().toISOString();

  const messageText = document.createElement("p");
  messageText.className = "message-text";
  messageText.textContent = text;

  header.append(label, time);
  content.append(header, messageText);
  article.append(avatar, content);

  elements.chatHistory.appendChild(article);

  state.messages.push({
    role,
    content: text,
    time: new Date().toISOString(),
  });

  scrollChatToBottom();

  return article;
}

/* Extração da resposta da API */

function extractResponse(data) {
  if (typeof data === "string") {
    return data;
  }

  if (!data || typeof data !== "object") {
    return "";
  }

  const candidates = [
    data.response,
    data.reply,
    data.message,
    data.answer,
    data.output,
    data.result,
    data.content,
    data.data?.response,
    data.data?.reply,
    data.data?.message,
    data.data?.answer,
    data.data?.output,
    data.data?.content,
    data.choices?.[0]?.message?.content,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

/* Comunicação com a API */

async function askWattson(message) {
  const controller = new AbortController();
  state.requestController = controller;

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  );

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },

      body: JSON.stringify({
        message,
      }),

      signal: controller.signal,
    });

    const rawBody = await response.text();

    let data;

    try {
      data = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      data = rawBody;
    }

    if (!response.ok) {
      const serverMessage =
        typeof data === "object" && data !== null
          ? data.detail || data.error || data.message
          : "";

      throw new Error(
        serverMessage ||
        `A API respondeu com o erro HTTP ${response.status}.`
      );
    }

    const answer = extractResponse(data);

    if (!answer) {
      throw new Error(
        "A API respondeu, mas não encontrei o texto da resposta. Verifique o formato retornado pelo backend."
      );
    }

    return answer;
  } finally {
    clearTimeout(timeout);
    state.requestController = null;
  }
}

/* Envio de mensagens */

async function sendMessage(text) {
  const message = text.trim();

  if (!message || state.busy) return;

  addMessage("user", message);
  elements.messageInput.value = "";

  setBusy(true);
  setCoreState("thinking");
  logActivity("ENVIO", "Mensagem enviada para a API.");

  try {
    const answer = await askWattson(message);

    addMessage("assistant", answer);

    setCoreState("online");
    logActivity("RESPOSTA", "Resposta recebida da API.");
  } catch (error) {
    let errorMessage =
      "Não foi possível obter uma resposta do Wattson.";

    if (error.name === "AbortError") {
      errorMessage =
        "A solicitação demorou demais e foi interrompida. Tente novamente.";
    } else if (
      error instanceof TypeError
    ) {
      errorMessage =
        "Falha de conexão. Verifique a internet, a disponibilidade da API e a configuração de CORS do servidor.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    addMessage("assistant", `Erro: ${errorMessage}`);

    setCoreState("error", errorMessage);
    logActivity("ERRO", errorMessage);

    console.error("[Wattson Core]", error);
  } finally {
    setBusy(false);

    if (elements.messageInput) {
      elements.messageInput.focus();
    }
  }
}

/* Eventos do formulário */

if (elements.messageForm) {
  elements.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    sendMessage(elements.messageInput.value);
  });
}

/* Limpar conversa */

function clearChat() {
  if (state.busy) return;

  elements.chatHistory.replaceChildren();

  state.messages = [];

  addMessage(
    "assistant",
    "Olá. Eu sou o Wattson Core. Como posso ajudar?"
  );

  setCoreState("idle");
  logActivity("SISTEMA", "Conversa limpa.");

  elements.messageInput?.focus();
}

elements.clearChatButton?.addEventListener(
  "click",
  clearChat
);

/* Seletor de idioma */

function setLanguage(language) {
  if (!["pt-BR", "en-US"].includes(language)) return;

  state.language = language;

  elements.languageButtons.forEach((button) => {
    const active = button.dataset.lang === language;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (elements.messageInput) {
    elements.messageInput.placeholder =
      language === "en-US"
        ? "Write a message..."
        : "Escreva uma mensagem...";
  }

  logActivity(
    "IDIOMA",
    language === "en-US"
      ? "Interface selecionada: inglês."
      : "Interface selecionada: português."
  );
}

elements.languageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.lang);
  });
});

/* Tradução */

elements.translateButton?.addEventListener("click", () => {
  if (state.busy) return;

  const lastAssistantMessage = [...state.messages]
    .reverse()
    .find((message) => message.role === "assistant");

  if (!lastAssistantMessage) {
    logActivity("TRADUÇÃO", "Não há resposta para traduzir.");
    return;
  }

  const targetLanguage =
    state.language === "pt-BR"
      ? "inglês"
      : "português brasileiro";

  const translationRequest =
    `Traduza para ${targetLanguage} o texto abaixo. ` +
    "Retorne somente a tradução, preservando o sentido:\n\n" +
    lastAssistantMessage.content;

  sendMessage(translationRequest);
});

/* Inicialização */

function initializeWattson() {
  setCoreState("idle");
  setBusy(false);
  renderActivities();

  if (elements.memoryState) {
    elements.memoryState.textContent = "Não verificada";
  }

  if (elements.robotState) {
    elements.robotState.textContent = "Não conectado";
  }

  logActivity(
    "INICIALIZAÇÃO",
    "Interface Wattson Core carregada."
  );

  console.info("[Wattson Core] Interface inicializada.");
}

initializeWattson();
