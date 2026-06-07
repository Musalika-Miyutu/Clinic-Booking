let apptFilter = 'all';

async function renderAppointments() {
  const container = document.getElementById('appointments-list');
  if (!container) return;
  container.innerHTML = `<div style="text-align:center;padding:48px;color:var(--slate)">
    <div style="width:32px;height:32px;border:3px solid var(--teal);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px"></div>
    Loading appointments…
  </div>`;

  try {
    App.appointments = await DB.getMyAppointments(App.currentUser.id, apptFilter === 'all' ? null : apptFilter);
  } catch(e) {
    container.innerHTML = `<div class="empty-state"><h3>Failed to load</h3><p>${e.message}</p></div>`;
    return;
  }

  container.innerHTML = '';

  if (App.appointments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="56" height="56" style="margin:0 auto 16px;color:var(--slate-light)">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h3>No appointments found</h3>
        <p>Book your first appointment with one of our doctors</p>
        <button class="btn btn-primary" onclick="showPage('booking')">Book Now</button>
      </div>`;
    return;
  }

  const statusMap  = { confirmed:'badge-success', pending:'badge-warning', completed:'badge-navy', cancelled:'badge-danger' };
  const colorMap   = { confirmed:'#2db67d', pending:'#f5a623', completed:'#163352', cancelled:'#e05252' };

  App.appointments.forEach(apt => {
    const docName   = apt.doctors?.full_name || '—';
    const specialty = apt.doctors?.specialisations?.name || '—';
    const color     = colorMap[apt.status] || 'var(--teal)';
    const canCancel = ['pending','confirmed'].includes(apt.status);

    container.innerHTML += `
      <div class="card" style="margin-bottom:14px;display:flex;align-items:center;gap:20px;padding:20px 24px">
        <div style="width:52px;height:52px;border-radius:14px;background:${color}18;
          display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
            <strong style="font-family:var(--font-display);font-size:16px">${docName}</strong>
            <span class="badge badge-teal">${specialty}</span>
            <span class="badge ${statusMap[apt.status]}">${apt.status}</span>
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;color:var(--slate);font-size:13px">
            <span>📅 ${formatDate(apt.appointment_date)}</span>
            <span>🕐 ${apt.appointment_time?.slice(0,5) || '—'}</span>
            <span>📋 ${apt.appointment_type || 'Consultation'}</span>
          </div>
          ${apt.notes ? `<div style="font-size:12px;color:var(--slate);margin-top:6px;font-style:italic">"${apt.notes}"</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          ${canCancel ? `<button class="btn btn-secondary btn-sm" onclick="cancelApt('${apt.id}')">Cancel</button>` : ''}
          ${apt.status === 'completed' ? `<button class="btn btn-ghost btn-sm">Review</button>` : ''}
        </div>
      </div>`;
  });
}

window.cancelApt = async function(id) {
  if (!confirm('Cancel this appointment?')) return;
  try {
    await DB.cancelAppointment(id);
    showToast('Appointment cancelled', 'info');
    renderAppointments();
  } catch(e) {
    showToast(e.message || 'Failed to cancel', 'error');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.appt-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.appt-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      apptFilter = btn.dataset.filter;
      renderAppointments();
    });
  });
});