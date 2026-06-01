let apptFilter = 'all';

function renderAppointments() {
  const filtered = apptFilter === 'all'
    ? App.appointments
    : App.appointments.filter(a => a.status === apptFilter);

  const container = document.getElementById('appointments-list');
  if (!container) return;
  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <h3>No appointments here</h3>
        <p>Book your first appointment with one of our doctors</p>
        <button class="btn btn-primary" onclick="showPage('booking')">Book Now</button>
      </div>`;
    return;
  }

  const statusMap = {
    confirmed: 'badge-success', pending: 'badge-warning',
    completed: 'badge-navy', cancelled: 'badge-danger'
  };
  const iconMap = {
    confirmed: '#2db67d', pending: '#f5a623',
    completed: '#163352', cancelled: '#e05252'
  };

  filtered.forEach(apt => {
    const isPast = new Date(apt.date) < new Date();
    container.innerHTML += `
      <div class="card" style="margin-bottom:14px;display:flex;align-items:center;gap:20px;padding:20px 24px">
        <div style="width:52px;height:52px;border-radius:14px;background:${iconMap[apt.status]}18;
          display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <svg viewBox="0 0 24 24" fill="none" stroke="${iconMap[apt.status]}" stroke-width="2" width="24" height="24">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px">
            <strong style="font-family:var(--font-display);font-size:16px">${apt.doctor}</strong>
            <span class="badge badge-teal">${apt.specialty}</span>
            <span class="badge ${statusMap[apt.status]}">${apt.status}</span>
          </div>
          <div style="display:flex;gap:20px;flex-wrap:wrap;color:var(--slate);font-size:13px">
            <span>📅 ${formatDate(apt.date)}</span>
            <span>🕐 ${apt.time}</span>
            <span>📋 ${apt.type}</span>
          </div>
        </div>
        <div style="display:flex;gap:8px;flex-shrink:0">
          ${apt.status === 'pending' || apt.status === 'confirmed' ? `
            <button class="btn btn-secondary btn-sm" onclick="cancelAppointment('${apt.id}')">Cancel</button>
          ` : ''}
          ${apt.status === 'completed' ? `
            <button class="btn btn-ghost btn-sm">Leave Review</button>
          ` : ''}
        </div>
      </div>`;
  });
}

function cancelAppointment(id) {
  const apt = App.appointments.find(a => a.id === id);
  if (!apt) return;
  apt.status = 'cancelled';
  showToast('Appointment cancelled successfully', 'info');
  renderAppointments();
}

// Tab filter setup
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