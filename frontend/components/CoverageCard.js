// ── COMPONENTE: CoverageCard ─────────────────────────────────────
// Tarjeta estructurada con especialidad, copago y hospital

const CoverageCard = {

  render(data) {
    if (!data.specialty) return "";

    const isEmergency = (data.specialty || "").toLowerCase().includes("emergencia");
    const cardClass   = isEmergency ? "rec-card emergency" : "rec-card";
    const headerIcon  = isEmergency ? "🚨" : "✅";
    const headerText  = isEmergency ? "Atención de emergencia" : "Recomendación de cobertura";
    const copagoClass = isEmergency ? "big-orange" : "big-green";

    const phone = data.phone
      ? `<div class="rec-row">
           <span class="rec-icon">📞</span>
           <div class="rec-detail">
             <span class="rec-key">Teléfono</span>
             <span class="rec-val">${esc(data.phone)}</span>
           </div>
         </div>`
      : "";

    const nextStep = data.next_step
      ? `<div class="rec-row">
           <span class="rec-icon">📋</span>
           <div class="rec-detail">
             <span class="rec-key">Siguiente paso</span>
             <span class="rec-val">${esc(data.next_step)}</span>
           </div>
         </div>`
      : "";

    const address = data.address
      ? `<span style="font-size:0.75rem;color:var(--text-muted);margin-top:0.1rem">${esc(data.address)}</span>`
      : "";

    const footer = data.consultation_id
      ? `<div class="rec-card-footer">
           <span class="rec-consult-id">ID: ${esc(data.consultation_id)}</span>
         </div>`
      : "";

    return `
      <div class="${cardClass}">
        <div class="rec-card-header">
          ${headerIcon} ${headerText}
        </div>
        <div class="rec-card-body">
          <div class="rec-row">
            <span class="rec-icon">🩺</span>
            <div class="rec-detail">
              <span class="rec-key">Especialidad sugerida</span>
              <span class="rec-val">${esc(data.specialty)}</span>
            </div>
          </div>
          <div class="rec-row">
            <span class="rec-icon">💰</span>
            <div class="rec-detail">
              <span class="rec-key">Tu copago</span>
              <span class="rec-val ${copagoClass}">${esc(data.copago || "—")}</span>
            </div>
          </div>
          <div class="rec-row">
            <span class="rec-icon">🏥</span>
            <div class="rec-detail">
              <span class="rec-key">Hospital recomendado</span>
              <span class="rec-val">${esc(data.hospital || "—")}</span>
              ${address}
            </div>
          </div>
          ${phone}
          ${nextStep}
        </div>
        ${footer}
      </div>`;
  },
};
