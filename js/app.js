// ── APP STATE ──────────────────────────────────────────
const App = {
  currentUser: {
    id: 'u1',
    name: 'Musalika James Miyutu',
    role: 'patient', // 'patient' | 'admin' | 'doctor'
    email: 'musalika.miyutu@email.com',
    initials: 'JM'
  },
  currentPage: 'dashboard',
  // Simulate DB
  doctors: [
    { id:'d1', name:'Dr. Jeromy Ngoma', specialty:'Cardiology', exp:'12 yrs', rating:4.9, slots:14, color:'#0a8f8f', initials:'AB', available:true },
    { id:'d2', name:'Dr. Levyson Simakampa', specialty:'Neurology', exp:'8 yrs', rating:4.7, slots:9, color:'#163352', initials:'CO', available:true },
    { id:'d3', name:'Dr. Beyar Bilonda', specialty:'Paediatrics', exp:'15 yrs', rating:4.8, slots:11, color:'#6b3fa0', initials:'NP', available:true },
    { id:'d4', name:'Dr. Penjani Ngwata', specialty:'Orthopaedics', exp:'10 yrs', rating:4.6, slots:7, color:'#c47e00', initials:'EZ', available:false },
    { id:'d5', name:'Dr. Leah Chilonga', specialty:'Dermatology', exp:'6 yrs', rating:4.5, slots:12, color:'#e05252', initials:'FD', available:true },
    { id:'d6', name:'Dr. Nancy Bwalya', specialty:'General Practice', exp:'20 yrs', rating:4.9, slots:18, color:'#2db67d', initials:'ST', available:true },
  ],
  appointments: [
    { id:'a1', patientName:'Musalika James Miyutu', doctor:'Dr. Jeromy Ngoma', specialty:'Cardiology', date:'2026-06-05', time:'09:00', status:'confirmed', type:'Consultation' },
    { id:'a2', patientName:'Musalika James Miyutu', doctor:'Dr. Levyson Simakampa', specialty:'Paediatrics', date:'2026-06-10', time:'14:30', status:'pending', type:'Follow-up' },
    { id:'a3', patientName:'Musalika James Miyutu', doctor:'Dr. Beyar Bilonda', specialty:'General Practice', date:'2026-05-28', time:'11:00', status:'completed', type:'Consultation' },
    { id:'a4', patientName:'Musalika James Miyutu', doctor:'Dr. Leah Chilonga', specialty:'Dermatology', date:'2026-05-20', time:'10:00', status:'cancelled', type:'Check-up' },
  ]
};

// ── PAGE ROUTER ──────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');
  App.currentPage = pageId;
  // Render page-specific content
  if (pageId === 'doctors') renderDoctors();
  if (pageId === 'appointments') renderAppointments();
  if (pageId === 'booking') initBooking();
  if (pageId === 'dashboard') renderDashboard();
}

// ── TOAST NOTIFICATIONS ──────────────────────────────────
function showToast(msg, type = 'info') {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#2db67d"><path d="M20 6L9 17l-5-5"/></svg>`,
    error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#e05252"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px;color:#0dbdbd"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="0.5" fill="currentColor"/></svg>`
  };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── MODAL HELPER ─────────────────────────────────────────
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

// ── FORMAT DATE ──────────────────────────────────────────
function formatDate(str) {
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { weekday:'short', day:'numeric', month:'short', year:'numeric' });
}

// ── INIT ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set user info in sidebar
  const uName = document.getElementById('sidebar-username');
  const uRole = document.getElementById('sidebar-role');
  const uInitials = document.getElementById('sidebar-initials');
  if (uName) uName.textContent = App.currentUser.name;
  if (uRole) uRole.textContent = App.currentUser.role.charAt(0).toUpperCase() + App.currentUser.role.slice(1);
  if (uInitials) uInitials.textContent = App.currentUser.initials;

  // Nav listeners
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => showPage(item.dataset.page));
  });

  // Initial page
  showPage('dashboard');
});