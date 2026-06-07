// ── AUTH HELPERS ─────────────────────────────────────────

const Auth = {

  // ── REGISTER ──────────────────────────────────────────
  async register({ fullName, email, password, phone, dob, bloodType }) {
    // 1. Create auth user
    const { data, error } = await db.auth.signUp({ email, password });
    if (error) throw error;

    // 2. Insert profile row
    const { error: profileError } = await db.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      email,
      phone: phone || null,
      date_of_birth: dob || null,
      blood_type: bloodType || null,
      role: 'patient'
    });
    if (profileError) throw profileError;

    return data;
  },

  // ── LOGIN ─────────────────────────────────────────────
  async login(email, password) {
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // ── LOGOUT ────────────────────────────────────────────
  async logout() {
    await db.auth.signOut();
    // Works from both root (index.html) and subfolders
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    const prefix = depth <= 1 ? '' : '../';
    window.location.href = prefix + 'auth/login.html';
  },

  // ── GET CURRENT USER ──────────────────────────────────
  async getCurrentUser() {
    const { data: { user } } = await db.auth.getUser();
    return user;
  },

  // ── GET PROFILE ───────────────────────────────────────
  async getProfile(userId) {
    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  // ── UPDATE PROFILE ────────────────────────────────────
  async updateProfile(userId, updates) {
    const { data, error } = await db
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // ── REQUIRE AUTH (call on protected pages) ────────────
  async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      window.location.href = '../auth/login.html';
      return null;
    }
    return user;
  },

  // ── REQUIRE ADMIN ─────────────────────────────────────
  async requireAdmin() {
    const user = await this.getCurrentUser();
    if (!user) { window.location.href = '../auth/login.html'; return null; }
    const profile = await this.getProfile(user.id);
    if (profile.role !== 'admin') { window.location.href = '../index.html'; return null; }
    return { user, profile };
  },

  // ── REDIRECT IF LOGGED IN (for login/register pages) ──
  async redirectIfLoggedIn() {
    const user = await this.getCurrentUser();
    if (user) window.location.href = '../index.html';
  }
};