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
