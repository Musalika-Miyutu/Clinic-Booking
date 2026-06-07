let activeSpecialty = 'All';

async function renderDoctors() {
  const search = document.getElementById('doctor-search')?.value?.toLowerCase() || '';
  const grid = document.getElementById('doctors-grid');
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--slate)">
    <div style="width:32px;height:32px;border:3px solid var(--teal);border-top-color:transparent;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px"></div>
    Loading doctors…
  </div>`;

  try {
    let doctors = App.doctors.length ? App.doctors : await DB.getDoctors();
    App.doctors = doctors;

    const filtered = doctors.filter(d => {
      const spec = d.specialisations?.name || '';
      const matchSpec = activeSpecialty === 'All' || spec === activeSpecialty;
      const matchSearch = d.full_name.toLowerCase().includes(search) || spec.toLowerCase().includes(search);
      return matchSpec && matchSearch;
    });

    grid.innerHTML = '';
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <h3>No doctors found</h3>
        <p>Try adjusting your search or filter</p>
      </div>`;
      return;
    }

    filtered.forEach(d => {
      const spec = d.specialisations?.name || 'General';
      const rating = d.rating || 4.5;
      const stars = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
      grid.innerHTML += `
        <div class="doctor-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:14px">
            <div class="doctor-avatar" style="background:${d.avatar_color || 'var(--teal)'}">${d.avatar_initials || '?'}</div>
            <span class="badge ${d.is_available ? 'badge-success' : 'badge-danger'}">${d.is_available ? 'Available' : 'Unavailable'}</span>
          </div>
          <h3>${d.full_name}</h3>
          <p class="specialty">${spec}</p>
          <div class="rating" style="margin-bottom:10px">
            <span style="color:#f5a623;font-size:13px">${stars}</span>
            <span style="margin-left:6px">${rating} · ${d.experience_years || '?'} yrs exp</span>
          </div>
          <button class="btn btn-primary btn-sm book-btn"
            onclick="initiateBooking('${d.id}')"
            ${d.is_available ? '' : 'disabled style="opacity:0.5;cursor:not-allowed"'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Book Appointment
          </button>
        </div>`;
    });
  } catch(e) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <h3>Failed to load doctors</h3><p>${e.message}</p>
    </div>`;
  }
}

window.initiateBooking = function(doctorId) {
  App.selectedDoctorId = doctorId;
  showPage('booking');
}

// Specialty chips — populated dynamically from DB
async function renderSpecialtyChips() {
  const wrap = document.getElementById('specialty-chips');
  if (!wrap) return;
  try {
    const specs = App.specialisations.length ? App.specialisations : await DB.getSpecialisations();
    wrap.innerHTML = `<div class="chip specialty-chip active" data-specialty="All">All</div>`;
    specs.forEach(s => {
      wrap.innerHTML += `<div class="chip specialty-chip" data-specialty="${s.name}">${s.name}</div>`;
    });
    wrap.querySelectorAll('.specialty-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        wrap.querySelectorAll('.specialty-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        activeSpecialty = chip.dataset.specialty;
        renderDoctors();
      });
    });
  } catch(e) { console.error(e); }
}

document.addEventListener('DOMContentLoaded', () => {
  renderSpecialtyChips();
  const searchInput = document.getElementById('doctor-search');
  if (searchInput) searchInput.addEventListener('input', renderDoctors);
});

// Spin animation
const style = document.createElement('style');
style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(style);