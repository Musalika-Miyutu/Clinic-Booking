let selectedDate = null;
let selectedSlot = null; // { id, time }
let currentMonth, currentYear;
let availableDatesInMonth = new Set();

async function initBooking() {
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear  = now.getFullYear();
  selectedDate = null;
  selectedSlot = null;
  updateBookingSummary();
  renderBookingDoctor();
  await fetchMonthSlots(currentMonth, currentYear);
  renderCalendar(currentMonth, currentYear);
}

function renderBookingDoctor() {
  const doctor = App.doctors.find(d => d.id === App.selectedDoctorId);
  const wrap = document.getElementById('booking-doctor-info');
  if (!wrap) return;
  if (!doctor) {
    wrap.innerHTML = `<p style="color:var(--slate)">No doctor selected — <a style="color:var(--teal);cursor:pointer" onclick="showPage('doctors')">choose one</a></p>`;
    return;
  }
  const spec = doctor.specialisations?.name || 'General';
  wrap.innerHTML = `
    <div style="display:flex;align-items:center;gap:16px">
      <div class="doctor-avatar" style="background:${doctor.avatar_color || 'var(--teal)'};width:52px;height:52px;font-size:18px">${doctor.avatar_initials || '?'}</div>
      <div>
        <h3 style="font-family:var(--font-display);font-size:17px;font-weight:700">${doctor.full_name}</h3>
        <p style="color:var(--teal);font-size:13px;font-weight:600">${spec}</p>
        <p style="color:var(--slate);font-size:12px">${doctor.experience_years || '?'} yrs exp · ${doctor.rating || 4.5}★</p>
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="showPage('doctors')">Change</button>
    </div>`;
}

async function fetchMonthSlots(month, year) {
  availableDatesInMonth = new Set();
  if (!App.selectedDoctorId) return;
  try {
    const slots = await DB.getSlotsByMonth(App.selectedDoctorId, year, month);
    slots.forEach(s => availableDatesInMonth.add(s.slot_date));
  } catch(e) { console.error('Slot fetch error:', e); }
}

function renderCalendar(month, year) {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  document.getElementById('cal-month-label').textContent = `${months[month]} ${year}`;

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = new Date();
  today.setHours(0,0,0,0);

  const grid = document.getElementById('cal-days-grid');
  grid.innerHTML = '';

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
    thisDate.setHours(0,0,0,0);
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isPast  = thisDate < today;
    const isToday = thisDate.getTime() === today.getTime();

    if (isToday) el.classList.add('today');

    if (isPast) {
      el.classList.add('past');
    } else {
      if (availableDatesInMonth.has(dateStr)) el.classList.add('has-slots');
      el.addEventListener('click', () => selectDay(dateStr, el));
    }

    if (selectedDate === dateStr) el.classList.add('selected');
    grid.appendChild(el);
  }

  clearSlots();
}

async function selectDay(dateStr, el) {
  document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  selectedDate = dateStr;
  selectedSlot = null;
  updateBookingSummary();
  await renderSlots(dateStr);
}

async function renderSlots(dateStr) {
  const wrap = document.getElementById('time-slots-wrap');
  const section = document.getElementById('slots-section');
  wrap.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:16px;color:var(--slate);font-size:13px">Loading slots…</div>`;
  section.style.display = 'block';

  try {
    const slots = await DB.getAvailableSlots(App.selectedDoctorId, dateStr);
    wrap.innerHTML = '';

    if (slots.length === 0) {
      wrap.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:16px;color:var(--slate);font-size:13px">No available slots for this date.</div>`;
      return;
    }

    slots.forEach(slot => {
      const div = document.createElement('div');
      div.className = 'time-slot';
      div.textContent = slot.slot_time.slice(0,5);
      div.addEventListener('click', () => {
        document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
        div.classList.add('selected');
        selectedSlot = { id: slot.id, time: slot.slot_time.slice(0,5) };
        updateBookingSummary();
      });
      wrap.appendChild(div);
    });
  } catch(e) {
    wrap.innerHTML = `<div style="grid-column:1/-1;color:var(--danger);font-size:13px">Failed to load slots: ${e.message}</div>`;
  }
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
    document.getElementById('summary-date').textContent    = formatDate(selectedDate);
    document.getElementById('summary-time').textContent    = selectedSlot.time;
    const doc = App.doctors.find(d => d.id === App.selectedDoctorId);
    document.getElementById('summary-doctor').textContent  = doc?.full_name || '—';
    document.getElementById('summary-specialty').textContent = doc?.specialisations?.name || '—';
  } else {
    el.style.display = 'none';
  }
}

window.prevMonth = async function() {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  await fetchMonthSlots(currentMonth, currentYear);
  renderCalendar(currentMonth, currentYear);
}

window.nextMonth = async function() {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  await fetchMonthSlots(currentMonth, currentYear);
  renderCalendar(currentMonth, currentYear);
}

window.confirmBooking = async function() {
  if (!App.selectedDoctorId) { showToast('Please select a doctor first', 'error'); showPage('doctors'); return; }
  if (!selectedDate)         { showToast('Please select a date', 'error'); return; }
  if (!selectedSlot)         { showToast('Please select a time slot', 'error'); return; }

  const type  = document.getElementById('booking-type')?.value || 'Consultation';
  const notes = document.getElementById('booking-notes')?.value || '';
  const btn   = document.getElementById('confirm-booking-btn');

  btn.textContent = 'Booking…';
  btn.disabled = true;

  try {
    await DB.createAppointment({
      patientId: App.currentUser.id,
      doctorId:  App.selectedDoctorId,
      slotId:    selectedSlot.id,
      date:      selectedDate,
      time:      selectedSlot.time,
      type, notes
    });

    const doc = App.doctors.find(d => d.id === App.selectedDoctorId);
    showToast(`Appointment booked with ${doc?.full_name} on ${formatDate(selectedDate)} at ${selectedSlot.time}`, 'success');

    selectedDate = null;
    selectedSlot = null;
    setTimeout(() => showPage('appointments'), 1200);
  } catch(e) {
    showToast(e.message || 'Booking failed. Please try again.', 'error');
    btn.textContent = 'Confirm Booking';
    btn.disabled = false;
  }
}