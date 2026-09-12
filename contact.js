/**
 * contact.js — R2S Creative Construction LLP
 * Contact page motion, interactive form handling & silky-smooth micro-animations
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Mark document as JS-capable for CSS reveals
  document.documentElement.classList.add('js');

  /* ─────────────────────────────────────────────────────────────
   * 1. Motion & Micro-interactions Initialization
   * ───────────────────────────────────────────────────────────── */
  const initialiseMotion = () => {
    if (!window.R2S) return;

    if (typeof window.R2S.initScrollReveal === 'function') {
      window.R2S.initScrollReveal();
    }
    if (typeof window.R2S.initCardTilt === 'function') {
      window.R2S.initCardTilt();
    }
    if (typeof window.R2S.initMagneticButtons === 'function') {
      window.R2S.initMagneticButtons();
    }
    if (typeof window.R2S.initStickyNav === 'function') {
      window.R2S.initStickyNav();
    }
    if (typeof window.R2S.initIconLift === 'function') {
      window.R2S.initIconLift();
    }
  };

  if (window.R2S) {
    initialiseMotion();
  } else {
    window.addEventListener('load', initialiseMotion);
  }

  /* ─────────────────────────────────────────────────────────────
   * 2. Smooth Damped Parallax Motion for Backdrops
   * ───────────────────────────────────────────────────────────── */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (!reducedMotion && window.innerWidth > 768) {
    const heroBg = document.querySelector('.contact-hero-bg');
    const closingBg = document.querySelector('.closing-bg-image');
    let ticking = false;
    let targetY = 0;
    let currentY = 0;

    const smoothScrollLoop = () => {
      currentY += (targetY - currentY) * 0.1;

      if (heroBg && currentY < 900) {
        heroBg.style.transform = `translate3d(0, ${(currentY * 0.22).toFixed(2)}px, 0)`;
      }

      if (closingBg) {
        const rect = closingBg.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (window.innerHeight - rect.top) * 0.07;
          closingBg.style.transform = `translate3d(0, ${(-offset).toFixed(2)}px, 0)`;
        }
      }

      if (Math.abs(targetY - currentY) > 0.1) {
        requestAnimationFrame(smoothScrollLoop);
      } else {
        ticking = false;
      }
    };

    window.addEventListener('scroll', () => {
      targetY = window.pageYOffset;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(smoothScrollLoop);
      }
    }, { passive: true });
  }

  /* ─────────────────────────────────────────────────────────────
   * 3. Interactive Form Validation & Submission Feedback
   * ───────────────────────────────────────────────────────────── */
  const form = document.querySelector('.message-form');
  const submitBtn = document.getElementById('submit-btn');
  const statusMsg = document.querySelector('.form-status-msg');

  if (form && submitBtn) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      // Check form validity
      if (!form.checkValidity()) {
        const firstInvalid = form.querySelector(':invalid');
        if (firstInvalid) {
          firstInvalid.focus({ preventScroll: false });
          const wrapper = firstInvalid.closest('.input-wrapper, .select-wrapper, .textarea-wrapper');
          if (wrapper) {
            wrapper.style.animation = 'shakeInput 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97)';
            setTimeout(() => {
              wrapper.style.animation = '';
            }, 450);
          }
        }

        if (statusMsg) {
          statusMsg.className = 'form-status-msg is-error';
          statusMsg.textContent = 'Please fill in all required fields accurately.';
        }
        return;
      }

      // Enter loading state
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      if (statusMsg) {
        statusMsg.className = 'form-status-msg';
        statusMsg.textContent = '';
      }

      // Simulate sending inquiry with sleek confirmation
      setTimeout(() => {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;

        const clientName = form.querySelector('[name="name"]')?.value || 'there';
        const firstName = clientName.trim().split(' ')[0];

        if (statusMsg) {
          statusMsg.className = 'form-status-msg is-success';
          statusMsg.innerHTML = `<strong>Thank you, ${firstName}!</strong> Your enquiry has been received. A representative from R2S Creative Construction will contact you shortly.`;
        }

        form.reset();

        // Smooth scroll to status if needed
        statusMsg?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 750);
    });

    // Real-time input focus & validation styling
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.checkValidity() && statusMsg?.classList.contains('is-error')) {
          statusMsg.textContent = '';
          statusMsg.className = 'form-status-msg';
        }
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────
   * 4. Floating Card Ambient Glow on Hover
   * ───────────────────────────────────────────────────────────── */
  document.querySelectorAll('.message-form-card, .office-map-card, .value-item').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});
