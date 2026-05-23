// ── SERVICIO: UI ─────────────────────────────────────────────────
// Todo lo que toca el DOM está aquí.
// Chat.js llama a UI, UI llama a los componentes.

const UI = {

  // Inicializar la UI al cargar la página
  init() {
    // ── cargar datos de la póliza desde sessionStorage ──
    const raw = sessionStorage.getItem('policyData');
    const policy = raw ? JSON.parse(raw).policy : {};

    document.getElementById('patientName').textContent = policy.paciente || '—';
    document.getElementById('patientId').textContent   = policy.id       || '—';
    document.getElementById('planName').textContent    = policy.plan     || '—';
    // ────────────────────────────────────────────────────

    this.renderWelcome();
    this.renderQuickButtons();
    this.setupMobilePolicy(policy);
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

  setupMobilePolicy(policy = {}) {
    const btn = document.getElementById("mobilePolicyBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        alert(`${policy.id || '—'} · ${policy.paciente || '—'} · ${policy.plan || '—'}`);
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