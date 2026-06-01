function renderDashboard() {
  const upcoming = App.appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completed = App.appointments.filter(a => a.status === 'completed');

  // Update stats
  document.getElementById('stat-upcoming').textContent = upcoming.length;
  document.getElementById('stat-completed').textContent = completed.length;
  document.getElementById('stat-doctors').textContent = App.doctors.filter(d => d.available).length;

  // Recent appointments list
  const tbody = document.getElementById('recent-appointments-body');
  if (!tbody) return;
  tbody.innerHTML = '';
  App.appointments.slice(0, 5).forEach(apt => {
    const statusMap = {
      confirmed: 'badge-success', pending: 'badge-warning',
      completed: 'badge-navy', cancelled: 'badge-danger'
    };
    tbody.innerHTML += `
      <tr>
        <td><strong>${apt.doctor}</strong></td>
        <td><span class="badge badge-teal">${apt.specialty}</span></td>
        <td>${formatDate(apt.date)}</td>
        <td>${apt.time}</td>
        <td><span class="badge ${statusMap[apt.status]}">${apt.status}</span></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="viewAppointment('${apt.id}')">View</button>
        </td>
      </tr>`;
  });

  // Featured doctors
  const doctorWrap = document.getElementById('featured-doctors');
  if (!doctorWrap) return;
  doctorWrap.innerHTML = '';
  App.doctors.slice(0, 3).forEach(d => {
    doctorWrap.innerHTML += `
      <div class="doctor-card" onclick="bookDoctor('${d.id}')">
        <div class="doctor-avatar" style="background:${d.color}">${d.initials}</div>
        <h3>${d.name}</h3>
        <p class="specialty">${d.specialty}</p>
        <div class="rating">
          <svg viewBox="0 0 24 24" fill="#f5a623" width="14" height="14"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          ${d.rating} &nbsp;·&nbsp; ${d.exp} exp
        </div>
        <div class="doctor-meta">
          <span class="badge ${d.available ? 'badge-success' : 'badge-danger'}">${d.available ? 'Available' : 'Unavailable'}</span>
          <span class="badge badge-teal">${d.slots} slots</span>
        </div>
        <button class="btn btn-primary btn-sm book-btn">Book Appointment</button>
      </div>`;
  });
}

function viewAppointment(id) {
  const apt = App.appointments.find(a => a.id === id);
  if (!apt) return;
  const statusMap = { confirmed: 'badge-success', pending: 'badge-warning', completed: 'badge-navy', cancelled: 'badge-danger' };
  document.getElementById('modal-apt-details').innerHTML = `
    <div style="display:grid;gap:14px">
      <div><strong>Doctor:</strong> ${apt.doctor}</div>
      <div><strong>Specialty:</strong> ${apt.specialty}</div>
      <div><strong>Date:</strong> ${formatDate(apt.date)}</div>
      <div><strong>Time:</strong> ${apt.time}</div>
      <div><strong>Type:</strong> ${apt.type}</div>
      <div><strong>Status:</strong> <span class="badge ${statusMap[apt.status]}">${apt.status}</span></div>
    </div>`;
  openModal('modal-appointment-detail');
}

function bookDoctor(id) {
  App.selectedDoctorId = id;
  showPage('booking');
}