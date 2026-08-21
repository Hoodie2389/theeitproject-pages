/* =========================================================================
   The EIT Project — progressive enhancement (vanilla JS, no dependencies)
   ========================================================================= */
(function () {
  'use strict';

  /* ---- Header: add "scrolled" state on scroll ------------------------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Mobile navigation toggle --------------------------------------- */
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    var closeNav = function () {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    };
    hamburger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    // Close menu when a link is chosen
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---- Scroll reveal --------------------------------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Parallax-lite on hero backgrounds (reduced-motion safe) --------- */
  var heroes = document.querySelectorAll('.hero__bg');
  if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches && heroes.length) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = window.scrollY;
        heroes.forEach(function (bg) {
          if (y < window.innerHeight) bg.style.transform = 'translate3d(0,' + (y * 0.18) + 'px,0)';
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---- Contact form: validation + send via Web3Forms (emails to us) --- */
  var form = document.getElementById('contactFormEl');
  var status = document.getElementById('formStatus');
  if (form && status) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var name = form.querySelector('#name');
      var email = form.querySelector('#email');
      var subject = form.querySelector('#subject');
      var message = form.querySelector('#message');
      var valid = true;

      [name, email, message].forEach(function (field) {
        field.classList.remove('invalid');
        if (!field.value.trim()) { field.classList.add('invalid'); valid = false; }
      });
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) { email.classList.add('invalid'); valid = false; }

      if (!valid) {
        status.textContent = 'Please fill in the required fields with a valid email address.';
        status.classList.add('show');
        status.style.background = 'rgba(180,40,40,.1)';
        status.style.borderColor = 'rgba(180,40,40,.4)';
        status.style.color = '#a32222';
        form.querySelector('.invalid') || email.focus();
        return;
      }

      /* Disable the button while sending so it isn't submitted twice. */
      var btn = form.querySelector('button[type="submit"]');
      var btnText = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending\u2026'; }

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_key: 'cc54ef36-66ee-48bd-bf44-6978378abcc3',
            from_name: 'Website Contact Form',
            name: name.value.trim(),
            email: email.value.trim(),
            subject: subject.value.trim() || 'New contact form submission',
            message: message.value.trim()
          })
        });
        const data = await res.json();
        if (data && data.success) {
          status.textContent = 'Thank you \u2014 your message has been received. We\'ll be in touch soon!';
          status.style.background = '';
          status.style.borderColor = '';
          status.style.color = '';
          status.classList.add('show');
          form.reset();
        } else {
          throw new Error(data && data.message ? data.message : 'Something went wrong.');
        }
      } catch (err) {
        status.textContent = 'Sorry, that did not go through. Please email us directly at contact@theeitproject.com.';
        status.classList.add('show');
        status.style.background = 'rgba(180,40,40,.1)';
        status.style.borderColor = 'rgba(180,40,40,.4)';
        status.style.color = '#a32222';
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = btnText; }
      }
    });
  }

  /* ---- Smooth scroll for in-page anchors (offset for fixed header) ------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 76;
        window.scrollTo({ top: top, behavior: 'smooth' });
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });
})();
