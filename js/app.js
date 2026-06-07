// ── APP STATE ─────────────────────────────────────────────
const App = {
  currentUser:     null,
  currentProfile:  null,
  currentPage:     'dashboard',
  selectedDoctorId: null,
  doctors:         [],
  appointments:    [],
  specialisations: []
};

// ── PAGE ROUTER ───────────────────────────────────────────
window.showPage = function(pageId) {
  document.querySelectorAll('.page').forEach(p => {
    p.style.display = 'none';
    p.classList.remove('active');
  });
  const page = document.getElementById('page-' + pageId);
  if (page) { page.style.display = 'block'; page.classList.add('active'); }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`[data-page="${pageId}"]`);
  if (nav) nav.classList.add('active');
  App.currentPage = pageId;
  if (pageId === 'doctors')      renderDoctors();
  if (pageId === 'appointments') renderAppointments();
  if (pageId === 'booking')      initBooking();
  if (pageId === 'dashboard')    renderDashboard();
  if (pageId === 'profile')      renderProfile();
}

// ── TOAST ─────────────────────────────────────────────────
window.showToast = function(msg, type = 'info') {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#2db67d"><path d="M20 6L9 17l-5-5"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#e05252"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#0dbdbd"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>`
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── MODAL ─────────────────────────────────────────────────
window.openModal  = id => document.getElementById(id)?.classList.add('open');
window.closeModal = id => document.getElementById(id)?.classList.remove('open');

// ── FORMAT DATE ───────────────────────────────────────────
window.formatDate = function(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

// ── SIDEBAR ───────────────────────────────────────────────
window.setSidebarUser = function(profile) {
  const names    = (profile.full_name || 'U N').split(' ');
  const initials = names.map(n => n[0] || '').join('').toUpperCase().slice(0, 2);
  const nameEl   = document.getElementById('sidebar-username');
  const roleEl   = document.getElementById('sidebar-role');
  const initEl   = document.getElementById('sidebar-initials');
  if (nameEl) nameEl.textContent = profile.full_name || 'Patient';
  if (roleEl) roleEl.textContent = (profile.role || 'patient').charAt(0).toUpperCase() + (profile.role || 'patient').slice(1);
  if (initEl) initEl.textContent = initials || '?';
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {

  // Hide everything until auth confirmed
  document.querySelector('.app-shell').style.visibility = 'hidden';

  // ── AUTH GUARD ──────────────────────────────────────────
  let session = null;
  try {
    const { data } = await db.auth.getSession();
    session = data?.session || null;
  } catch(e) {
    console.error('Session check error:', e);
  }

  if (!session) {
    window.location.replace('login.html');
    return;
  }

  // Session valid — show the shell
  document.querySelector('.app-shell').style.visibility = 'visible';
  App.currentUser = session.user;

  // ── LOAD PROFILE ────────────────────────────────────────
  try {
    const { data: profile, error } = await db
      .from('profiles').select('*').eq('id', session.user.id).single();
    if (error) throw error;
    App.currentProfile = profile;
    setSidebarUser(profile);
  } catch(e) {
    console.warn('Profile fallback:', e.message);
    App.currentProfile = { full_name: session.user.email, role: 'patient', email: session.user.email };
    setSidebarUser(App.currentProfile);
  }

  // ── NAV LISTENERS ────────────────────────────────────────
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  // ── LOGOUT ───────────────────────────────────────────────
  document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await db.auth.signOut();
    window.location.replace('login.html');
  });

  // ── PRELOAD DATA ─────────────────────────────────────────
  try {
    const { data: doctors, error: dErr } = await db
      .from('doctors')
      .select('*, specialisations!specialisation_id(name)')
      .order('full_name');
    if (dErr) console.warn('Doctors fetch:', dErr.message);
    else App.doctors = doctors || [];

    const { data: specs, error: sErr } = await db
      .from('specialisations').select('*').order('name');
    if (sErr) console.warn('Specs fetch:', sErr.message);
    else App.specialisations = specs || [];
  } catch(e) {
    console.warn('Preload error:', e.message);
  }

  // ── SHOW DASHBOARD ───────────────────────────────────────
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  showPage('dashboard');
});