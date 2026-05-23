// ── SERVICIO: UI ─────────────────────────────────────────────────
// Todo lo que toca el DOM está aquí.
// Chat.js llama a UI, UI llama a los componentes.

const UI = {
  _policy: null,

  init() {
    const raw = sessionStorage.getItem('policyData');
    const policy = raw ? JSON.parse(raw).policy : {};
    this._policy = policy;

    this.populateSidebar(policy);
    this.renderWelcome();
    this.renderQuickButtons();
    this.setupMobilePolicy();
    this.setupClearBtn();
    this.loadHistory(policy.id);
  },

  // ── Cargar póliza desde el backend ────────────────────────────
  async loadPolicy() {
    try {
      const data = await ApiService.getPolicy(CONFIG.POLICY_ID);
      this._policy = data.policy;
      this.populateSidebar(data.policy);
    } catch (err) {
      this.setFooterStatus("error", "Error al conectar con Notion");
      // Fallback: mostrar el ID de config al menos
      document.getElementById("patientId").textContent = CONFIG.POLICY_ID;
    }
  },

  populateSidebar(policy) {
    document.getElementById("patientName").textContent = policy.paciente || "—";
    document.getElementById("patientId").textContent   = policy.id || CONFIG.POLICY_ID;
    document.getElementById("planName").textContent    = policy.plan || "—";

    document.getElementById("copagoConsulta").textContent = `$${policy.copago_consulta ?? "—"}`;
    document.getElementById("copagoEspec").textContent    = `$${policy.copago_especialista ?? "—"}`;
    document.getElementById("copagoEmerg").textContent    = `$${policy.copago_emergencia ?? "—"}`;
    document.getElementById("deducible").textContent      = policy.deducible ? `$${policy.deducible}` : "—";

    // Badge de estado
    const badge   = document.getElementById("statusBadge");
    const active  = policy.estado === "Activa";
    badge.className = `status-badge${active ? "" : " inactive"}`;
    badge.innerHTML = `<span class="status-dot"></span>${esc(policy.estado || "Desconocido")}`;

    // Aseguradora
    const asegEl = document.getElementById("aseguradoraBadge");
    if (policy.aseguradora) {
      asegEl.textContent     = policy.aseguradora;
      asegEl.style.display   = "inline-block";
    }

    // Coberturas activas
    if (policy.coberturas && policy.coberturas.length > 0) {
      document.getElementById("coverageTags").innerHTML = policy.coberturas
        .map(c => `<span class="coverage-tag">${esc(c)}</span>`)
        .join("");
      document.getElementById("coberturasSection").style.display = "block";
    }

    this.setFooterStatus("ok", `Sincronizado · ${policy.aseguradora || "Notion"}`);
  },

  // ── Historial de consultas ────────────────────────────────────
  async loadHistory(policyId) {
    if (!policyId) return;
    try {
      const data = await ApiService.getHistory(policyId);
      if (data.history && data.history.length > 0) {
        this.renderHistory(data.history);
      }
    } catch (err) {
      // si falla el historial no bloqueamos nada
    }
  },

  renderHistory(items) {
    const section = document.getElementById("historialSection");
    const list    = document.getElementById("historyList");

    // Extraer fecha del consultation_id si el campo date viene vacío
    function parseFecha(h) {
      if (h.date) return new Date(h.date);
      const m = (h.consultation_id || "").match(/CONS-(\d{4})(\d{2})(\d{2})/);
      return m ? new Date(`${m[1]}-${m[2]}-${m[3]}`) : null;
    }

    function grupoLabel(fecha) {
      if (!fecha) return "Anteriores";
      const hoy  = new Date();
      const diff = Math.floor((hoy - fecha) / 86400000);
      if (diff === 0) return "Hoy";
      if (diff === 1) return "Ayer";
      if (diff < 7)  return "Esta semana";
      return "Anteriores";
    }

    // Guardar items para acceder desde onclick
    this._historyItems = items;

    // Agrupar por fecha
    const grupos = {};
    items.slice(0, 20).forEach((h, i) => {
      const fecha = parseFecha(h);
      const grupo = grupoLabel(fecha);
      if (!grupos[grupo]) grupos[grupo] = [];
      grupos[grupo].push({ ...h, _fecha: fecha, _idx: i });
    });

    const orden = ["Hoy", "Ayer", "Esta semana", "Anteriores"];
    list.innerHTML = orden
      .filter(g => grupos[g])
      .map(g => `
        <div class="history-group-label">${g}</div>
        ${grupos[g].map(h => `
          <div class="history-item" onclick="Chat.loadConversation(UI._historyItems[${h._idx}])">
            <span class="history-symptom">${esc(h.symptom)}</span>
            <span class="history-specialty">${esc(h.specialty || "")}</span>
          </div>`).join("")}
      `).join("");

    section.style.display = "block";
  },

  setFooterStatus(type, text) {
    document.getElementById("footerStatus").innerHTML =
      `<span class="footer-dot ${esc(type)}"></span><p>${esc(text)}</p>`;
  },

  // ── Bienvenida ────────────────────────────────────────────────
  renderWelcome() {
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend",
      MessageBubble.bot(
        "Hola, soy PulseAI. Cuéntame qué síntoma tienes y cruzaré tu póliza para decirte a qué especialidad ir y cuánto pagarás de copago.",
        `<div class="welcome-card">
          <div class="welcome-card-title">¿Cómo puedo ayudarte?</div>
          <div class="welcome-hints">
            <span class="welcome-hint"><span class="hint-dot"></span>Describe tu síntoma con detalle</span>
            <span class="welcome-hint"><span class="hint-dot"></span>Te digo la especialidad exacta</span>
            <span class="welcome-hint"><span class="hint-dot"></span>Te muestro tu copago y el hospital más cercano</span>
          </div>
        </div>`
      )
    );
  },

  // ── Botones rápidos ───────────────────────────────────────────
  renderQuickButtons() {
    const container = document.getElementById("quickBtns");
    container.innerHTML = CONFIG.QUICK_QUESTIONS
      .map(q => `<button class="quick-btn" onclick="Chat.sendQuick('${q}')">${q}</button>`)
      .join("");
  },

  // ── Botón "Nueva consulta" ────────────────────────────────────
  setupClearBtn() {
    document.getElementById("clearBtn").addEventListener("click", () => this.clearChat());
  },

  clearChat() {
    document.getElementById("messages").innerHTML = "";
    this.renderWelcome();
    Chat.history = [];
  },

  // ── Móvil: ver póliza ─────────────────────────────────────────
  setupMobilePolicy() {
    const btn = document.getElementById("mobilePolicyBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const p = this._policy;
      if (p) {
        alert(
          `${p.paciente} · ${p.id}\n` +
          `${p.plan} · ${p.aseguradora || ""}\n` +
          `Consulta: $${p.copago_consulta} · Especialista: $${p.copago_especialista} · Emergencia: $${p.copago_emergencia}`
        );
      } else {
        alert(CONFIG.POLICY_ID);
      }
    });
  },

  // ── Mensajes ──────────────────────────────────────────────────
  addUserMessage(text) {
    document.getElementById("messages")
      .insertAdjacentHTML("beforeend", MessageBubble.user(text));
    scrollBottom();
  },

  addBotResponse(data) {
    const card = CoverageCard.render(data);
    document.getElementById("messages")
      .insertAdjacentHTML("beforeend", MessageBubble.bot(data.full_response, card));
    scrollBottom();
    // Recargar historial 2.5s después para que Notion alcance a guardar
    setTimeout(() => { if (this._policy) this.loadHistory(this._policy.id); }, 2500);
  },

  addErrorMessage(errorText) {
    document.getElementById("messages")
      .insertAdjacentHTML("beforeend",
        MessageBubble.bot(`Lo siento, hubo un error: ${errorText}`)
      );
    scrollBottom();
  },

  setLoading(isLoading) {
    document.getElementById("sendBtn").disabled = isLoading;
  },
};

// ── UTILS globales ───────────────────────────────────────────────

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