/**
 * NewWatchGuy — Admin auth helpers, shared by login.html and dashboard.html.
 * Real authentication via Supabase Auth (email + password). No passwords
 * are ever stored or checked in this JavaScript file.
 */
const AdminAuth = (function () {
  async function getSession() {
    const { data, error } = await window.db.auth.getSession();
    if (error) { console.error(error); return null; }
    return data.session;
  }

  async function requireAuthOrRedirect() {
    const session = await getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }
    // Confirm the signed-in user actually has an admin/editor profile row.
    const { data: profile, error } = await window.db
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error || !profile) {
      await window.db.auth.signOut();
      window.location.href = 'login.html';
      return null;
    }
    return { session, profile };
  }

  async function redirectIfAlreadyAuthed() {
    const session = await getSession();
    if (session) window.location.href = 'dashboard.html';
  }

  async function signOut() {
    await window.db.auth.signOut();
    window.location.href = 'login.html';
  }

  return { getSession, requireAuthOrRedirect, redirectIfAlreadyAuthed, signOut };
})();
