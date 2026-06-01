let activeSpecialty = 'All';

function renderDoctors() {
  const search = document.getElementById('doctor-search')?.value?.toLowerCase() || '';
  const filtered = App.doctors.filter(d => {
    const matchSpec = activeSpecialty === 'All' || d.specialty === activeSpecialty;
    const matchSearch = d.name.toLowerCase().includes(search) || d.specialty.toLowerCase().includes(search);
    return matchSpec && matchSearch;
  });

  const grid = document.getElementById('doctors-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <h3>No doctors found</h3>
        <p>Try adjusting your search or specialty filter</p>
      </div>`;
    return;
  }

  filtered.forEach(d => {
    const stars = '★'.repeat(Math.round(d.rating)) + '☆'.repeat(5 - Math.round(d.rating));
    grid.innerHTML += `
      <div class="doctor-card" data-id="${d.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
          <div class="doctor-avatar" style="background:${d.color}">${d.initials}</div>
          <span class="badge ${d.available ? 'badge-success' : 'badge-danger'}">${d.available ? 'Available' : 'Unavailable'}</span>
        </div>
        <h3>${d.name}</h3>
        <p class="specialty">${d.specialty}</p>
        <div class="rating" style="margin-bottom:10px">
          <span style="color:#f5a623;font-size:13px">${stars}</span>
          <span style="margin-left:6px">${d.rating} &nbsp;·&nbsp; ${d.exp} experience</span>
        </div>
        <div class="doctor-meta">
          <span class="badge badge-teal">${d.slots} open slots</span>
        </div>
        <button class="btn btn-primary btn-sm book-btn"
          onclick="initiateBooking('${d.id}')"
          ${d.available ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"'}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book Appointment
        </button>
      </div>`;
  });
}

function initiateBooking(doctorId) {
  App.selectedDoctorId = doctorId;
  showPage('booking');
  showToast('Booking page loaded — select your slot', 'info');
}

// Specialty filter chips
document.addEventListener('DOMContentLoaded', () => {
  const chips = document.querySelectorAll('.specialty-chip');
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeSpecialty = chip.dataset.specialty;
      renderDoctors();
    });
  });

  const searchInput = document.getElementById('doctor-search');
  if (searchInput) {
    searchInput.addEventListener('input', renderDoctors);
  }
});