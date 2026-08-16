/**
 * Contact form — opens the visitor's email client with a pre-filled
 * message. No database table is used for messages, so this works
 * out of the box with zero extra Supabase setup.
 */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    const note = document.getElementById('contactNote');

    let toEmail = 'hello@newwatchguy.com';
    try {
      const settings = await NWG.fetchSettings();
      if (settings?.contact_email) toEmail = settings.contact_email;
    } catch (err) { /* fall back to default */ }

    const subject = encodeURIComponent(`Message from ${name} via NewWatchGuy`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
    note.textContent = 'Opening your email app…';
  });
});
