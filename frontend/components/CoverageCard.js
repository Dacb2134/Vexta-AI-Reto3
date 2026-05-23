// ── COMPONENTE: CoverageCard ─────────────────────────────────────
// Solo se muestra cuando needs_more_info es false Y hay hospital Y hay specialty

const CoverageCard = {

  render(data) {
    // No mostrar si aún recopilando info o faltan datos clave
    if (!data.specialty || !data.hospital || data.needs_more_info) return "";

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

    // Filtrar recomendaciones vacías antes de renderizar
    const recs = (data.recommendations || []).filter(r => r && r.trim() !== "");
    const recommendations = recs.length > 0
      ? `<div class="rec-row">
           <span class="rec-icon">💡</span>
           <div class="rec-detail">
             <span class="rec-key">Mientras esperas</span>
             <ul style="margin:0.2rem 0 0 1rem;padding:0">
               ${recs.map(r => `<li style="font-size:0.8rem;color:var(--text-muted)">${esc(r)}</li>`).join("")}
             </ul>
           </div>
         </div>`
      : "";

    // Urgency badge
    const urgencyConfig = {
      emergency: { color: "#EF4444", bg: "#FEF2F2", label: "EMERGENCIA"     },
      high:      { color: "#F59E0B", bg: "#FFFBEB", label: "ATENCIÓN URGENTE" },
      medium:    { color: "#3B82F6", bg: "#EFF6FF", label: "ESTA SEMANA"    },
      low:       { color: "#10B981", bg: "#ECFDF5", label: "CUANDO PUEDAS"  },
    };
    const urg = urgencyConfig[data.urgency_level] || urgencyConfig.low;
    const urgencyBadge = `<span style="
      font-size:0.65rem;font-weight:700;letter-spacing:0.06em;
      color:${urg.color};background:${urg.bg};
      padding:0.15rem 0.5rem;border-radius:10px;
      border:1px solid ${urg.color}30">${urg.label}</span>`;

    const footer = data.consultation_id
      ? `<div class="rec-card-footer">
           <span class="rec-consult-id">ID: ${esc(data.consultation_id)}</span>
         </div>`
      : "";

    return `
      <div class="${cardClass}">
        <div class="rec-card-header" style="display:flex;align-items:center;justify-content:space-between">
          <span>${headerIcon} ${headerText}</span>
          ${urgencyBadge}
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
              <span class="rec-val">${esc(data.hospital)}</span>
              ${address}
            </div>
          </div>
          ${phone}
          ${nextStep}
          ${recommendations}
        </div>
        ${footer}
      </div>`;
  },
};