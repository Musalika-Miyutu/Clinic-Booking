// ── DATABASE QUERY LAYER ─────────────────────────────────
// All Supabase interactions go here. JS files call these functions.

const DB = {

  // ══════════════════════════════════════════════════════
  // DOCTORS
  // ══════════════════════════════════════════════════════

  async getDoctors(specialtyFilter = null) {
    const { data, error } = await db
      .from('doctors')
      .select('*, specialisations!specialisation_id ( name )')
      .order('full_name');
    if (error) throw error;
    if (specialtyFilter && specialtyFilter !== 'All') {
      return data.filter(d => d.specialisations?.name === specialtyFilter);
    }
    return data;
  },

  async getDoctorById(doctorId) {
    const { data, error } = await db
      .from('doctors')
      .select('*, specialisations!specialisation_id ( name )')
      .eq('id', doctorId)
      .single();
    if (error) throw error;
    return data;
  },

  async createDoctor(doctor) {
    const { data, error } = await db
      .from('doctors')
      .insert(doctor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateDoctor(id, updates) {
    const { data, error } = await db
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteDoctor(id) {
    const { error } = await db.from('doctors').delete().eq('id', id);
    if (error) throw error;
  },

  // ══════════════════════════════════════════════════════
  // SPECIALISATIONS
  // ══════════════════════════════════════════════════════

  async getSpecialisations() {
    const { data, error } = await db
      .from('specialisations')
      .select('*')
      .order('name');
    if (error) throw error;
    return data;
  },

  // ══════════════════════════════════════════════════════
  // APPOINTMENT SLOTS
  // ══════════════════════════════════════════════════════

  async getAvailableSlots(doctorId, date) {
    const { data, error } = await db
      .from('appointment_slots')
      .select('*')
      .eq('doctor_id', doctorId)
      .eq('slot_date', date)
      .eq('is_booked', false)
      .order('slot_time');
    if (error) throw error;
    return data;
  },

  async getSlotsByMonth(doctorId, year, month) {
    // Get all slots for a doctor in a given month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate   = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    const { data, error } = await db
      .from('appointment_slots')
      .select('slot_date, is_booked')
      .eq('doctor_id', doctorId)
      .gte('slot_date', startDate)
      .lte('slot_date', endDate)
      .eq('is_booked', false);
    if (error) throw error;
    return data; // array of { slot_date, is_booked }
  },

  async markSlotBooked(slotId) {
    const { error } = await db
      .from('appointment_slots')
      .update({ is_booked: true })
      .eq('id', slotId);
    if (error) throw error;
  },

  async addSlots(slots) {
    // slots: [{ doctor_id, slot_date, slot_time }]
    const { data, error } = await db
      .from('appointment_slots')
      .insert(slots)
      .select();
    if (error) throw error;
    return data;
  },

  // ══════════════════════════════════════════════════════
  // APPOINTMENTS
  // ══════════════════════════════════════════════════════

  async getMyAppointments(patientId, statusFilter = null) {
    let query = db
      .from('appointments')
      .select(`
        *,
        doctors (
          full_name, avatar_color, avatar_initials,
          specialisations!specialisation_id ( name )
        )
      `)
      .eq('patient_id', patientId)
      .order('appointment_date', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getAllAppointments() {
    // Admin only
    const { data, error } = await db
      .from('appointments')
      .select(`
        *,
        profiles ( full_name, email ),
        doctors ( full_name, specialisations ( name ) )
      `)
      .order('appointment_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async createAppointment({ patientId, doctorId, slotId, date, time, type, notes }) {
    const { data, error } = await db
      .from('appointments')
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        slot_id: slotId,
        appointment_date: date,
        appointment_time: time,
        appointment_type: type,
        notes: notes || null,
        status: 'pending'
      })
      .select()
      .single();
    if (error) throw error;

    // Mark slot as booked
    if (slotId) await this.markSlotBooked(slotId);

    return data;
  },

  async updateAppointmentStatus(appointmentId, status) {
    const { data, error } = await db
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async cancelAppointment(appointmentId) {
    // Free up the slot
    const { data: apt } = await db
      .from('appointments')
      .select('slot_id')
      .eq('id', appointmentId)
      .single();

    if (apt?.slot_id) {
      await db.from('appointment_slots')
        .update({ is_booked: false })
        .eq('id', apt.slot_id);
    }

    return this.updateAppointmentStatus(appointmentId, 'cancelled');
  },

  // ══════════════════════════════════════════════════════
  // ADMIN STATS
  // ══════════════════════════════════════════════════════

  async getAdminStats() {
    const [
      { count: totalPatients },
      { count: totalDoctors },
      { count: todayApts },
      { count: pendingApts }
    ] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
      db.from('doctors').select('*', { count: 'exact', head: true }),
      db.from('appointments').select('*', { count: 'exact', head: true })
        .eq('appointment_date', new Date().toISOString().split('T')[0]),
      db.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    return { totalPatients, totalDoctors, todayApts, pendingApts };
  },

  // ══════════════════════════════════════════════════════
  // PROFILES
  // ══════════════════════════════════════════════════════

  async getAllPatients() {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .order('full_name');
    if (error) throw error;
    return data;
  }
};