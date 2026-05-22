// ── COMPONENTE: TypingIndicator ──────────────────────────────────
// Los 3 puntos animados mientras el agente procesa

const TypingIndicator = {

  show() {
    const msgs = document.getElementById("messages");
    msgs.insertAdjacentHTML("beforeend", `
      <div class="msg-row bot" id="typing-indicator">
        <div class="msg-avatar">◎</div>
        <div class="msg-content">
          <div class="bubble bot typing-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
          </div>
        </div>
      </div>`);
    scrollBottom();
  },

  hide() {
    const el = document.getElementById("typing-indicator");
    if (el) el.remove();
  },
};
