// ── SERVICIO: Chat ───────────────────────────────────────────────
// Controlador principal. Conecta UI ↔ API.
// Aquí vive la lógica del chat: historial, envío, recepción.

const Chat = {
  history:   [],
  isLoading: false,

  // Inicializar eventos al cargar la página
  init() {
    // Botón enviar
    document.getElementById("sendBtn")
      .addEventListener("click", () => this.send());

    // Enter para enviar
    document.getElementById("msgInput")
      .addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.send();
        }
      });
  },

  // Cargar conversación anterior desde el historial
  loadConversation(item) {
    document.getElementById("messages").innerHTML = "";
    this.history = [];

    UI.addUserMessage(item.symptom);
    this.history.push({ role: "user", content: item.symptom });

    const data = {
      full_response:   item.response || "(Sin respuesta guardada)",
      specialty:       item.specialty  || null,
      copago:          item.copago     ? `$${item.copago}` : null,
      hospital:        item.hospital   || null,
      address:         null,
      phone:           null,
      next_step:       null,
      consultation_id: item.consultation_id,
    };
    const card = CoverageCard.render(data);
    document.getElementById("messages")
      .insertAdjacentHTML("beforeend", MessageBubble.bot(data.full_response, card));
    scrollBottom();
    this.history.push({ role: "assistant", content: item.response || "" });
  },

  // Enviar desde los botones de preguntas frecuentes
  sendQuick(text) {
    document.getElementById("msgInput").value = text;
    this.send();
  },

  // Enviar mensaje principal
  async send() {
    const input = document.getElementById("msgInput");
    const text  = input.value.trim();

    if (!text || this.isLoading) return;

    input.value = "";
    this.isLoading = true;
    UI.setLoading(true);

    // Mostrar burbuja del usuario inmediatamente
    UI.addUserMessage(text);
    this.history.push({ role: "user", content: text });

    // Mostrar typing indicator
    TypingIndicator.show();

    try {
      const data = await ApiService.sendMessage(text, this.history);

      TypingIndicator.hide();
      UI.addBotResponse(data);

      this.history.push({ role: "assistant", content: data.full_response });

    } catch (err) {
      TypingIndicator.hide();
      UI.addErrorMessage(err.message);

    } finally {
      this.isLoading = false;
      UI.setLoading(false);
    }
  },
};

// ── ARRANCAR TODO AL CARGAR LA PÁGINA ───────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  UI.init();
  Chat.init();
});
