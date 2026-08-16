/* ==========================================================================
   FSCSS Hub — global.js
   Shared behaviour for every page: mobile menu, theme toggle, copy-to-
   clipboard on code blocks, sticky-nav shadow, and scroll-reveal.
   No build step, no dependencies — plain DOM.
   ========================================================================== */
(function () {
  'use strict';

  /* ---- Theme toggle ---------------------------------------------------
     Persisted in localStorage under "fscss-hub-theme". Defaults to dark. */
  var THEME_KEY = 'fscss-hub-theme';
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    document.querySelectorAll('[data-theme-toggle]').forEach(function (input) {
      input.checked = theme === 'light';
    });
  }

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    applyTheme(saved === 'light' ? 'light' : 'dark');

    document.querySelectorAll('[data-theme-toggle]').forEach(function (input) {
      input.addEventListener('change', function () {
        var theme = input.checked ? 'light' : 'dark';
        applyTheme(theme);
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
      });
    });
  }

  /* ---- Mobile menu toggle ---------------------------------------------*/
  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var links = document.querySelector('[data-nav-links]');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Sticky nav shadow / blur once scrolled --------------------------*/
  function initNavScroll() {
    var nav = document.querySelector('.site-nav');
    if (!nav) return;
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Active link highlight based on section in view -------------------*/
  function initActiveLink() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main [id]'));
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-links] a[href^="#"], [data-toc] a[href^="#"]'));
    if (!sections.length || !links.length || !('IntersectionObserver' in window)) return;

    var map = {};
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (href.charAt(0) !== '#') return;
      var id = href.slice(1);
      map[id] = map[id] || [];
      map[id].push(a);
    });

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var linksForId = map[entry.target.id];
        if (!linksForId) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.classList.remove('is-active'); });
          linksForId.forEach(function (a) { a.classList.add('is-active'); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { obs.observe(s); });
  }

  /* ---- Copy-to-clipboard on code blocks / install commands -------------*/
  function initCopyButtons() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetSel = btn.getAttribute('data-copy');
        var text = targetSel
          ? (document.querySelector(targetSel) || {}).innerText
          : btn.closest('.code') && btn.closest('.code').querySelector('pre').innerText;
        if (!text) return;

        var done = function () {
          var original = btn.innerHTML;
          btn.classList.add('is-copied');
          btn.innerHTML = 'copied';
          setTimeout(function () {
            btn.classList.remove('is-copied');
            btn.innerHTML = original;
          }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text.trim()).then(done).catch(function () { fallbackCopy(text, done); });
        } else {
          fallbackCopy(text, done);
        }
      });
    });
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---- Scroll reveal ------------------------------------------------- */
  function initReveal() {
    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 6, 5) * 60 + 'ms';
      obs.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initMenu();
    initNavScroll();
    initActiveLink();
    initCopyButtons();
    initReveal();
  });
})();

const footerbottom = document.querySelector(".footer-bottom");
if(footerbottom){
  footerbottom.querySelector("p").innerHTML = `&copy; ${new Date().getFullYear()} FSCSS Hub. Part of the Figsh network. MIT licensed modules.`;
  }
