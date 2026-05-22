// ── COMPONENTE: CoverageCard ─────────────────────────────────────
// Genera la tarjeta estructurada con especialidad, copago y hospital

const CoverageCard = {

  render(data) {
    if (!data.specialty) return "";

    const phone    = data.phone    ? `<div class="rec-row"><span class="rec-icon">📞</span><div class="rec-detail"><span class="rec-key">Teléfono</span><span class="rec-val">${esc(data.phone)}</span></div></div>` : "";
    const nextStep = data.next_step ? `<div class="rec-row"><span class="rec-icon">📝</span><div class="rec-detail"><span class="rec-key">Siguiente paso</span><span class="rec-val">${esc(data.next_step)}</span></div></div>` : "";
    const address  = data.address  ? `<span style="font-size:0.75rem;color:var(--text-muted)">${esc(data.address)}</span>` : "";
    const consultId = data.consultation_id ? `<div style="font-size:0.68rem;color:var(--text-muted);padding:0.4rem 0.9rem 0.6rem;border-top:1px solid var(--border)">ID consulta: ${esc(data.consultation_id)}</div>` : "";

    return `
      <div class="rec-card">
        <div class="rec-card-header">Recomendación de cobertura</div>
        <div class="rec-card-body">
          <div class="rec-row">
            <span class="rec-icon">🏥</span>
            <div class="rec-detail">
              <span class="rec-key">Especialidad sugerida</span>
              <span class="rec-val">${esc(data.specialty)}</span>
            </div>
          </div>
          <div class="rec-row">
            <span class="rec-icon">💰</span>
            <div class="rec-detail">
              <span class="rec-key">Tu copago</span>
              <span class="rec-val big-green">${esc(data.copago || "—")}</span>
            </div>
          </div>
          <div class="rec-row">
            <span class="rec-icon">📍</span>
            <div class="rec-detail">
              <span class="rec-key">Hospital recomendado</span>
              <span class="rec-val">${esc(data.hospital || "—")}</span>
              ${address}
            </div>
          </div>
          ${phone}
          ${nextStep}
        </div>
        ${consultId}
      </div>`;
  },
};
