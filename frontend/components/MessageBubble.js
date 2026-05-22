// ── COMPONENTE: MessageBubble ────────────────────────────────────
// Genera el HTML de una burbuja de mensaje (usuario o bot)

const MessageBubble = {

  user(text) {
    return `
      <div class="msg-row user">
        <div class="msg-avatar user-av">Tú</div>
        <div class="msg-content">
          <div class="bubble user">${esc(text)}</div>
          <span class="msg-time">${timestamp()}</span>
        </div>
      </div>`;
  },

  bot(text, extra = "") {
    return `
      <div class="msg-row bot">
        <div class="msg-avatar">◎</div>
        <div class="msg-content">
          <div class="bubble bot">${esc(text)}</div>
          ${extra}
          <span class="msg-time">${timestamp()}</span>
        </div>
      </div>`;
  },
};
