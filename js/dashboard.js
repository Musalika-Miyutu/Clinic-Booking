async function renderDashboard() {
  // Update greeting
  const greet = document.getElementById('dashboard-greeting');
  if (greet && App.currentProfile) {
    const firstName = App.currentProfile.full_name.split(' ')[0];
    const hour = new Date().getHours();
    const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
    greet.textContent = `Good ${tod}, ${firstName} 👋`;
  }

  // Load appointments
  try {
    App.appointments = await DB.getMyAppointments(App.currentUser.id);
  } catch(e) { console.error(e); App.appointments = []; }

  const upcoming  = App.appointments.filter(a => ['confirmed','pending'].includes(a.status));
  const completed = App.appointments.filter(a => a.status === 'completed');
  const available = App.doctors.filter(d => d.is_available);

  document.getElementById('stat-upcoming').textContent  = upcoming.length;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-doctors').textContent   = available.length;

  // Recent appointments table
  const tbody = document.getElementById('recent-appointments-body');
  if (tbody) {
    tbody.innerHTML = '';
    if (App.appointments.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--slate)">No appointments yet — <a style="color:var(--teal);cursor:pointer;font-weight:600" onclick="showPage('booking')">book your first one</a></td></tr>`;
    } else {
      App.appointments.slice(0, 5).forEach(apt => {
        const docName    = apt.doctors?.full_name || '—';
        const specialty  = apt.doctors?.specialisations?.name || '—';
        const statusMap  = { confirmed:'badge-success', pending:'badge-warning', completed:'badge-navy', cancelled:'badge-danger' };
        tbody.innerHTML += `
          <tr>
            <td><strong>${docName}</strong></td>
            <td><span class="badge badge-teal">${specialty}</span></td>
            <td>${formatDate(apt.appointment_date)}</td>
            <td>${apt.appointment_time?.slice(0,5) || '—'}</td>
            <td><span class="badge ${statusMap[apt.status] || 'badge-navy'}">${apt.status}</span></td>
            <td><button class="btn btn-ghost btn-sm" onclick="viewAppointmentModal('${apt.id}')">View</button></td>
          </tr>`;
      });
    }
  }

  // Featured doctors
  const doctorWrap = document.getElementById('featured-doctors');
  if (doctorWrap) {
    doctorWrap.innerHTML = '';
    App.doctors.slice(0, 3).forEach(d => {
      const spec = d.specialisations?.name || '';
      doctorWrap.innerHTML += `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div class="user-avatar" style="background:${d.avatar_color || 'var(--teal)'};flex-shrink:0">${d.avatar_initials || '?'}</div>
          <div style="flex:1;min-width:0">
            <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${d.full_name}</div>
            <div style="font-size:12px;color:var(--teal)">${spec}</div>
          </div>
          <button class="btn btn-primary btn-sm" onclick="initiateBooking('${d.id}')">Book</button>
        </div>`;
    });
  }
}

window.viewAppointmentModal = function(id) {
  const apt = App.appointments.find(a => a.id === id);
  if (!apt) return;
  const statusMap = { confirmed:'badge-success', pending:'badge-warning', completed:'badge-navy', cancelled:'badge-danger' };
  document.getElementById('modal-apt-details').innerHTML = `
    <div style="display:grid;gap:14px;font-size:14px">
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Doctor</span><strong>${apt.doctors?.full_name || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Specialty</span><span>${apt.doctors?.specialisations?.name || '—'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Date</span><strong>${formatDate(apt.appointment_date)}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Time</span><strong style="color:var(--teal)">${apt.appointment_time?.slice(0,5) || '—'}</strong></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Type</span><span>${apt.appointment_type || '—'}</span></div>
      <div style="display:flex;justify-content:space-between"><span style="color:var(--slate)">Status</span><span class="badge ${statusMap[apt.status]}">${apt.status}</span></div>
      ${apt.notes ? `<div><span style="color:var(--slate)">Notes</span><p style="margin-top:6px;padding:10px;background:var(--cream);border-radius:8px">${apt.notes}</p></div>` : ''}
    </div>`;
  openModal('modal-appointment-detail');
}