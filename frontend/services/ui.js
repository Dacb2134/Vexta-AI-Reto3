// ── SERVICIO: UI ─────────────────────────────────────────────────
// Todo lo que toca el DOM está aquí.
// Chat.js llama a UI, UI llama a los componentes.

const UI = {

  // Inicializar la UI al cargar la página
  init() {
    this.renderWelcome();
    this.renderQuickButtons();
    this.setupMobilePolicy();
  },

  renderWelcome() {
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend",
      MessageBubble.bot("Hola 👋 Soy PulseAI. Cuéntame qué síntoma tienes y cruzaré tu póliza para decirte exactamente a qué especialidad ir y cuánto pagarás de copago.")
    );
  },

  renderQuickButtons() {
    const container = document.getElementById("quickBtns");
    container.innerHTML = CONFIG.QUICK_QUESTIONS
      .map(q => `<button class="quick-btn" onclick="Chat.sendQuick('${q}')">${q}</button>`)
      .join("");
  },

  setupMobilePolicy() {
    const btn = document.getElementById("mobilePolicyBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        alert(`POL-2024-001 · Ana Torres · Premium Gold\nConsulta: $25 · Especialista: $45 · Emergencia: $100`);
      });
    }
  },

  // Agregar burbuja de usuario
  addUserMessage(text) {
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend", MessageBubble.user(text));
    scrollBottom();
  },

  // Agregar respuesta del bot con tarjeta opcional
  addBotResponse(data) {
    const card = CoverageCard.render(data);
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend", MessageBubble.bot(data.full_response, card));
    scrollBottom();
  },

  // Agregar burbuja de error
  addErrorMessage(errorText) {
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend",
      MessageBubble.bot(`Lo siento, hubo un error: ${errorText}`)
    );
    scrollBottom();
  },

  // Estado del botón de enviar
  setLoading(isLoading) {
    document.getElementById("sendBtn").disabled = isLoading;
  },
};

// ── UTILS globales (usadas por componentes) ──────────────────────

function scrollBottom() {
  const msgs = document.getElementById("messages");
  msgs.scrollTop = msgs.scrollHeight;
}

function timestamp() {
  return new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
