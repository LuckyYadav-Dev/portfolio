/**
 * Lucky Yadav - Portfolio scripts
 * No frameworks, no build step - just the DOM.
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNavigation();
  initScrollAnimations();
  initContactForm();
  initNavbarScrollState();
  initScreenshotLightbox();
  initScrollSpy();
  initBackToTop();
  initVinylPlayer();
  setFooterYear();
});

/**
 * Mobile nav toggle - opens the menu and closes it again once a link is tapped
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    navMenu.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

/**
 * Fades sections in as they scroll into view. Skips straight to "active"
 * for anyone who's asked their OS for reduced motion.
 */
function initScrollAnimations() {
  const reveals = document.querySelectorAll('.reveal');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('active'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.12
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach(el => revealObserver.observe(el));
}

/**
 * Screenshot lightbox - click a gallery thumbnail, see it full size.
 * Traps focus while open and hands focus back to whatever you clicked.
 */
function initScreenshotLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxOverlay = document.getElementById('lightboxOverlay');

  if (!lightboxModal || !galleryItems.length) return;

  let lastFocusedElement = null;

  galleryItems.forEach(item => {
    item.addEventListener('click', () => openLightbox(item));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item);
      }
    });
  });

  function openLightbox(item) {
    const fullSrc = item.getAttribute('data-full');
    const captionText = item.getAttribute('data-caption');

    lastFocusedElement = document.activeElement;

    lightboxImg.src = fullSrc;
    lightboxImg.alt = captionText;
    lightboxCaption.textContent = captionText;

    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    lightboxImg.src = '';
    document.body.style.overflow = '';

    if (lastFocusedElement) lastFocusedElement.focus();
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    }

    // basic focus trap - keep tabbing inside the modal while it's open
    if (e.key === 'Tab') {
      const focusable = lightboxModal.querySelectorAll('button, [href], img');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

/**
 * Contact form - no backend, so this just hands the message off to
 * whatever email client is set as default via a mailto link.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !message) {
      if (status) {
        status.textContent = 'Looks like something is missing - fill in all three fields and try again.';
        status.style.color = '#f43f5e';
      }
      return;
    }

    const recipient = 'luckyyadav.biz@gmail.com';
    const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);

    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;

    if (status) {
      status.textContent = 'Your email client should be opening now - go ahead and hit send.';
      status.style.color = '#10b981';
    }

    form.reset();
  });
}

/**
 * Darkens the sticky header once you've scrolled past the hero.
 */
function initNavbarScrollState() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.14)';
      navbar.style.background = 'rgba(9, 10, 15, 0.88)';
    } else {
      navbar.style.borderBottomColor = 'rgba(255, 255, 255, 0.08)';
      navbar.style.background = 'rgba(9, 10, 15, 0.75)';
    }
  }, { passive: true });
}

/**
 * Highlights the nav link for whichever section is currently in view,
 * so people can tell where they are on the page without scrolling back up.
 */
function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  const linkForId = (id) => document.querySelector(`.nav-link[href="#${id}"]`);

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = linkForId(entry.target.id);
      if (!link) return;

      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => spyObserver.observe(section));
}

/**
 * Shows a "back to top" button once you've scrolled a screen or so down.
 */
function initBackToTop() {
  const button = document.getElementById('backToTop');
  if (!button) return;

  window.addEventListener('scroll', () => {
    button.classList.toggle('visible', window.scrollY > 600);
  }, { passive: true });

  button.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  });
}

/**
 * Vinyl player - a decorative "now playing" widget in the footer.
 * If the site owner drops a real file at assets/audio/ambient-loop.mp3,
 * that plays. Otherwise it falls back to a soft, generated ambient pad
 * via the Web Audio API, so the disc always has something to spin to.
 */
function initVinylPlayer() {
  const disc = document.getElementById('vinylDisc');
  const tonearm = document.getElementById('vinylTonearm');
  const playBtn = document.getElementById('vinylPlayBtn');
  const eq = document.getElementById('vinylEq');
  const audioEl = document.getElementById('vinylAudio');

  if (!disc || !playBtn) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let audioCtx = null;
  let ambientNodes = null;
  let usingRealAudio = false;
  let isPlaying = false;

  function startSynthAmbient() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.05, now + 1.5);
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.connect(masterGain);

    // Soft, slow-moving pad chord - generated, not a copyrighted track.
    const noteFrequencies = [220, 277.18, 329.63];
    const oscillators = noteFrequencies.map((freq) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    // Slow LFO on the filter for a gentle "breathing" lo-fi movement
    const lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    const lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    ambientNodes = { masterGain, oscillators, lfo };
  }

  function stopSynthAmbient() {
    if (!ambientNodes || !audioCtx) return;
    const now = audioCtx.currentTime;
    const { masterGain, oscillators, lfo } = ambientNodes;

    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0, now + 0.6);

    window.setTimeout(() => {
      oscillators.forEach((osc) => osc.stop());
      lfo.stop();
    }, 700);

    ambientNodes = null;
  }

  function setPlayingUI(playing) {
    playBtn.classList.toggle('is-playing', playing);
    playBtn.setAttribute('aria-pressed', String(playing));
    if (!prefersReducedMotion) {
      disc.classList.toggle('spinning', playing);
    }
    if (tonearm) tonearm.classList.toggle('active', playing);
    if (eq) eq.classList.toggle('active', playing);
  }

  function play() {
    const hasSource = audioEl && audioEl.querySelector('source');
    if (hasSource) {
      const playPromise = audioEl.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise
          .then(() => { usingRealAudio = true; })
          .catch(() => { usingRealAudio = false; startSynthAmbient(); });
        return;
      }
    }
    startSynthAmbient();
  }

  function stop() {
    if (usingRealAudio && audioEl) {
      audioEl.pause();
      usingRealAudio = false;
    } else {
      stopSynthAmbient();
    }
  }

  playBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    setPlayingUI(isPlaying);

    if (isPlaying) {
      play();
    } else {
      stop();
    }
  });
}

/**
 * Keeps the footer copyright year correct without me having to remember
 * to bump it every January.
 */
function setFooterYear() {
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
