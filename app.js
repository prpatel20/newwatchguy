/**
 * NewWatchGuy — shared site chrome (every page loads this).
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky header on scroll
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('header-scrolled', window.scrollY > 50);
    }, { passive: true });
  }

  // 2. Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.querySelectorAll('.header-nav a');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('nav-open');
      menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  navLinks.forEach(link => link.addEventListener('click', () => document.body.classList.remove('nav-open')));
  document.addEventListener('click', (e) => {
    if (document.body.classList.contains('nav-open') && !e.target.closest('nav') && !e.target.closest('.hamburger')) {
      document.body.classList.remove('nav-open');
    }
  });

  // 3. Search toggle + submit -> search.html?q=
  const searchToggle = document.getElementById('searchToggle');
  const searchField = document.getElementById('searchField');
  const searchInput = document.getElementById('searchInput');
  const searchClose = document.getElementById('searchClose');
  if (searchToggle && searchField) {
    searchToggle.addEventListener('click', () => {
      searchField.classList.toggle('active');
      if (searchField.classList.contains('active') && searchInput) searchInput.focus();
    });
  }
  if (searchClose) searchClose.addEventListener('click', () => searchField.classList.remove('active'));
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        location.href = 'search.html?q=' + encodeURIComponent(searchInput.value.trim());
      }
      if (e.key === 'Escape') searchField.classList.remove('active');
    });
  }

  // 4. Scroll reveal animations
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealElements.forEach(el => revealObserver.observe(el));
  // Re-run whenever dynamic content is injected
  window.addEventListener('nwg:content-loaded', () => {
    document.querySelectorAll('.reveal:not(.revealed)').forEach(el => revealObserver.observe(el));
  });

  // 5. Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const offsetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    });
  });

  // 6. Newsletter form -> Supabase
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const emailInput = document.getElementById('newsletterEmail');
      const successEl = document.getElementById('newsletterSuccess');
      const email = emailInput.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        emailInput.classList.add('error');
        setTimeout(() => emailInput.classList.remove('error'), 3000);
        return;
      }
      const submitBtn = newsletterForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'SUBSCRIBING…';
      submitBtn.disabled = true;
      const result = await NWG.subscribeNewsletter(email);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      if (successEl) {
        successEl.textContent = result.message;
        successEl.classList.add('show');
        successEl.style.color = result.ok ? '' : '#ef7777';
      }
      if (result.ok) newsletterForm.reset();
    });
  }

  // 7. Back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 500), { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // 8. Wishlist active-state sync (icons already in DOM on load, e.g. header icon)
  window.addEventListener('nwg:wishlist-changed', updateWishlistCount);
  updateWishlistCount();
  function updateWishlistCount() {
    const count = NWG.getWishlist().length;
    document.querySelectorAll('[data-wishlist-count]').forEach(el => {
      el.textContent = count > 0 ? count : '';
      el.classList.toggle('show', count > 0);
    });
  }

  // 9. Populate footer year fixes / social links from settings (non-blocking)
  if (window.NWG && window.db) {
    NWG.fetchSettings().then(settings => {
      if (!settings) return;
      document.querySelectorAll('[data-instagram-link]').forEach(a => settings.instagram_url && (a.href = settings.instagram_url));
      document.querySelectorAll('[data-youtube-link]').forEach(a => settings.youtube_url && (a.href = settings.youtube_url));
      document.querySelectorAll('[data-facebook-link]').forEach(a => settings.facebook_url && (a.href = settings.facebook_url));
      document.querySelectorAll('[data-pinterest-link]').forEach(a => settings.pinterest_url && (a.href = settings.pinterest_url));
    }).catch(() => {});
  }
});
