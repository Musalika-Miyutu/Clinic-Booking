let selectedDate = null;
let selectedSlot = null;
let currentMonth, currentYear;

const slotsByDay = {
  1: ['08:00','09:00','10:30','14:00','15:30'],
  2: ['09:00','11:00','13:00','16:00'],
  3: ['08:30','10:00','11:30','14:30'],
  4: ['09:30','10:30','13:30','15:00','16:30'],
  5: ['08:00','09:00','10:00','14:00','15:00','16:00'],
};

function initBooking() {
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  renderCalendar(currentMonth, currentYear);
  renderBookingDoctor();
}

function renderBookingDoctor() {
  const doctor = App.doctors.find(d => d.id === App.selectedDoctorId) || App.doctors[0];
  const wrap = document.getElementById('booking-doctor-info');
  if (!wrap || !doctor) return;
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px">
      <div class="doctor-avatar" style="background:${doctor.color};width:52px;height:52px;font-size:18px">${doctor.initials}</div>
      <div>
        <h3 style="font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--navy)">${doctor.name}</h3>
        <p style="color:var(--teal);font-size:13px;font-weight:600">${doctor.specialty}</p>
        <p style="color:var(--slate);font-size:12px">${doctor.exp} experience · ${doctor.rating}★</p>
      </div>
    </div>`;
}

function renderCalendar(month, year) {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = `${months[month]} ${year}`;

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const grid = document.getElementById('cal-days-grid');
  grid.innerHTML = '';

  // Empty cells
  for (let i = 0; i < firstDay; i++) {
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    grid.appendChild(el);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day';
    el.textContent = d;

    const thisDate = new Date(year, month, d);
    const isPast = thisDate < today && !(thisDate.toDateString() === today.toDateString());
    const dayOfWeek = thisDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isPast || isWeekend) { el.classList.add('past'); }
    else {
      if (slotsByDay[d % 5 + 1]) el.classList.add('has-slots');
      el.addEventListener('click', () => selectDay(d, month, year, el));
    }

    if (thisDate.toDateString() === today.toDateString()) el.classList.add('today');

    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    if (selectedDate === dateStr) el.classList.add('selected');

    grid.appendChild(el);
  }

  clearSlots();
}

function selectDay(day, month, year, el) {
  document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
  selectedSlot = null;
  renderSlots(day);
  updateBookingSummary();
}

function renderSlots(day) {
  const slots = slotsByDay[day % 5 + 1] || ['09:00','10:00','11:00'];
  const bookedIdx = [1]; // simulate one booked slot
  const wrap = document.getElementById('time-slots-wrap');
  wrap.innerHTML = '';
  slots.forEach((time, i) => {
    const div = document.createElement('div');
    div.className = 'time-slot' + (bookedIdx.includes(i) ? ' booked' : '');
    div.textContent = time;
    if (!bookedIdx.includes(i)) {
      div.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        div.classList.add('selected');
        selectedSlot = time;
        updateBookingSummary();
      });
    }
    wrap.appendChild(div);
  });
  document.getElementById('slots-section').style.display = 'block';
}

function clearSlots() {
  const wrap = document.getElementById('time-slots-wrap');
  if (wrap) wrap.innerHTML = '';
  const sec = document.getElementById('slots-section');
  if (sec) sec.style.display = 'none';
}

function updateBookingSummary() {
  const el = document.getElementById('booking-summary');
  if (!el) return;
  if (selectedDate && selectedSlot) {
    el.style.display = 'block';
    document.getElementById('summary-date').textContent = formatDate(selectedDate);
    document.getElementById('summary-time').textContent = selectedSlot;
    const doc = App.doctors.find(d => d.id === App.selectedDoctorId) || App.doctors[0];
    document.getElementById('summary-doctor').textContent = doc.name;
    document.getElementById('summary-specialty').textContent = doc.specialty;
  } else {
    el.style.display = 'none';
  }
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  renderCalendar(currentMonth, currentYear);
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  renderCalendar(currentMonth, currentYear);
}

function confirmBooking() {
  if (!selectedDate || !selectedSlot) {
    showToast('Please select a date and time slot', 'error');
    return;
  }
  const type = document.getElementById('booking-type')?.value || 'Consultation';
  const notes = document.getElementById('booking-notes')?.value || '';
  const doc = App.doctors.find(d => d.id === App.selectedDoctorId) || App.doctors[0];

  App.appointments.push({
    id: 'a' + Date.now(),
    patientName: App.currentUser.name,
    doctor: doc.name,
    specialty: doc.specialty,
    date: selectedDate,
    time: selectedSlot,
    status: 'pending',
    type,
    notes
  });

  showToast(`Appointment booked with ${doc.name} on ${formatDate(selectedDate)} at ${selectedSlot}`, 'success');
  selectedDate = null;
  selectedSlot = null;
  setTimeout(() => showPage('appointments'), 1200);
}