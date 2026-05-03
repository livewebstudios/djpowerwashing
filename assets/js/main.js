/* =====================================================================
   D&J POWER WASHING — main.js
   Sticky header, mobile drawer, active state, reveal-on-scroll, form
   ===================================================================== */
(function () {
  'use strict';

  const header  = document.querySelector('.site-header');
  const toggle  = document.querySelector('.mobile-toggle');
  const drawer  = document.querySelector('.mobile-drawer');
  const navLinks = document.querySelectorAll('.nav-link, .nav-dropdown a, .mobile-drawer a');

  /* ---------- Sticky header ---------- */
  let lastScroll = 0;
  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile drawer ---------- */
  function setDrawer(open) {
    if (!toggle || !drawer) return;
    toggle.classList.toggle('open', open);
    drawer.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (toggle && drawer) {
    toggle.addEventListener('click', function () {
      setDrawer(!drawer.classList.contains('open'));
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setDrawer(false);
    });
    drawer.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setDrawer(false);
    });
  }

  /* ---------- Active page highlight ---------- */
  const path = window.location.pathname.replace(/\/index\.html?$/, '/');
  navLinks.forEach(function (a) {
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')) return;
    const linkPath = new URL(href, window.location.href).pathname.replace(/\/index\.html?$/, '/');
    if (linkPath === path) a.classList.add('active');
  });

  /* ---------- Reveal-on-scroll ---------- */
  const reveals = document.querySelectorAll('.reveal-up');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Smooth scroll for #anchors ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ---------- Contact form (Formspree) ---------- */
  const form = document.querySelector('form.contact-form');
  if (form) {
    const msgEl = form.querySelector('.form-msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const submitBtn = form.querySelector('button[type="submit"]');
      const original = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Sending...';

      const data = new FormData(form);
      fetch(form.action, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
      .then(function (r) {
        if (r.ok) {
          form.reset();
          if (msgEl) {
            msgEl.className = 'form-msg success';
            msgEl.textContent = "Thanks! John or Danielle will be in touch within 24 hours.";
          }
          submitBtn.innerHTML = '✓ Sent';
          setTimeout(function () { submitBtn.innerHTML = original; submitBtn.disabled = false; }, 3500);
        } else {
          throw new Error('Server error');
        }
      })
      .catch(function () {
        if (msgEl) {
          msgEl.className = 'form-msg error';
          msgEl.textContent = 'Something went wrong. Please call us directly at (201) 917-8510.';
        }
        submitBtn.innerHTML = original;
        submitBtn.disabled = false;
      });
    });
  }

  /* ---------- Year stamp ---------- */
  const yr = document.querySelector('[data-year]');
  if (yr) yr.textContent = new Date().getFullYear();

})();
