async function renderProfile() {
  const profile = App.currentProfile;
  if (!profile) return;

  const names = profile.full_name?.split(' ') || ['', ''];
  document.getElementById('profile-firstname').value = names[0] || '';
  document.getElementById('profile-lastname').value  = names.slice(1).join(' ') || '';
  document.getElementById('profile-email').value     = profile.email || '';
  document.getElementById('profile-phone').value     = profile.phone || '';
  document.getElementById('profile-dob').value       = profile.date_of_birth || '';
  document.getElementById('profile-blood').value     = profile.blood_type || '';
  document.getElementById('profile-notes').value     = profile.medical_notes || '';

  const initials = names.map(n => n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('profile-avatar').textContent = initials;
  document.getElementById('profile-name-display').textContent  = profile.full_name;
  document.getElementById('profile-email-display').textContent = profile.email;
}

window.saveProfile = async function() {
  const firstName = document.getElementById('profile-firstname').value.trim();
  const lastName  = document.getElementById('profile-lastname').value.trim();
  const phone     = document.getElementById('profile-phone').value.trim();
  const dob       = document.getElementById('profile-dob').value;
  const blood     = document.getElementById('profile-blood').value;
  const notes     = document.getElementById('profile-notes').value.trim();
  const btn       = document.getElementById('save-profile-btn');

  btn.textContent = 'Saving…';
  btn.disabled = true;

  try {
    const updated = await Auth.updateProfile(App.currentUser.id, {
      full_name: `${firstName} ${lastName}`.trim(),
      phone: phone || null,
      date_of_birth: dob || null,
      blood_type: blood || null,
      medical_notes: notes || null
    });
    App.currentProfile = updated;
    setSidebarUser(updated);
    showToast('Profile updated successfully', 'success');
  } catch(e) {
    showToast(e.message || 'Failed to save profile', 'error');
  } finally {
    btn.textContent = 'Save Changes';
    btn.disabled = false;
  }
}