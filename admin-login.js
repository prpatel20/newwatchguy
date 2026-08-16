document.addEventListener('DOMContentLoaded', async () => {
  await AdminAuth.redirectIfAlreadyAuthed();

  const loginForm = document.getElementById('loginForm');
  const forgotForm = document.getElementById('forgotForm');
  const loginError = document.getElementById('loginError');
  const forgotMessage = document.getElementById('forgotMessage');
  const togglePw = document.getElementById('togglePw');
  const passwordInput = document.getElementById('password');

  togglePw.addEventListener('click', () => {
    const isPw = passwordInput.type === 'password';
    passwordInput.type = isPw ? 'text' : 'password';
    togglePw.textContent = isPw ? 'Hide' : 'Show';
  });

  document.getElementById('forgotPasswordBtn').addEventListener('click', () => {
    loginForm.hidden = true;
    forgotForm.hidden = false;
  });
  document.getElementById('backToLoginBtn').addEventListener('click', () => {
    forgotForm.hidden = true;
    loginForm.hidden = false;
    forgotMessage.textContent = '';
  });

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    const email = document.getElementById('email').value.trim();
    const password = passwordInput.value;
    const submitBtn = document.getElementById('loginSubmit');
    const remember = document.getElementById('rememberMe').checked;

    submitBtn.disabled = true;
    submitBtn.textContent = 'SIGNING IN…';

    const { data, error } = await window.db.auth.signInWithPassword({ email, password });

    if (error) {
      loginError.textContent = error.message === 'Invalid login credentials'
        ? 'Incorrect email or password.'
        : error.message;
      submitBtn.disabled = false;
      submitBtn.textContent = 'LOGIN';
      return;
    }

    // Confirm the account has an admin profile row (created automatically
    // on signup via the handle_new_user() trigger in schema.sql).
    const { data: profile } = await window.db.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
    if (!profile) {
      loginError.textContent = 'This account is not set up as an admin. See SUPABASE_SETUP.md.';
      await window.db.auth.signOut();
      submitBtn.disabled = false;
      submitBtn.textContent = 'LOGIN';
      return;
    }

    if (!remember) {
      // Supabase persists sessions in localStorage by default; when the
      // user unchecks "keep me signed in" we clear it on tab close instead.
      window.addEventListener('beforeunload', () => { window.db.auth.signOut(); });
    }

    window.location.href = 'dashboard.html';
  });

  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value.trim();
    const submitBtn = document.getElementById('forgotSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'SENDING…';
    const { error } = await window.db.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname.replace('login.html', 'login.html')
    });
    submitBtn.disabled = false;
    submitBtn.textContent = 'SEND RESET LINK';
    forgotMessage.style.color = error ? '#ef7777' : '#6fbf73';
    forgotMessage.textContent = error ? error.message : 'If that email has an account, a reset link has been sent.';
  });
});
