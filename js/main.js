/**
 * Soprannomi - UI behavior
 *  - mobile menu toggle
 *  - cookie banner (Consent Mode v2 update)
 */

(function () {
  'use strict';

  // Mobile menu
  var btn = document.getElementById('menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (btn && mobileMenu) {
    btn.addEventListener('click', function () {
      mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileMenu.classList.add('hidden'); });
    });
  }

  // Cookie consent
  var STORAGE_KEY = 'soprannomi_consent_v1';
  var banner = document.getElementById('cookie-banner');
  var btnAccept = document.getElementById('cookie-accept');
  var btnReject = document.getElementById('cookie-reject');

  function gtag(){ window.dataLayer = window.dataLayer || []; window.dataLayer.push(arguments); }

  function applyConsent(state) {
    var granted = state === 'granted';
    gtag('consent', 'update', {
      'ad_storage': granted ? 'granted' : 'denied',
      'ad_user_data': granted ? 'granted' : 'denied',
      'ad_personalization': granted ? 'granted' : 'denied',
      'analytics_storage': granted ? 'granted' : 'denied'
    });
  }

  function saveConsent(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: state, ts: Date.now() }));
    } catch (e) { /* private mode */ }
  }

  function loadConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      // Refresh consent every 6 mesi
      var sixMonths = 1000 * 60 * 60 * 24 * 180;
      if (Date.now() - parsed.ts > sixMonths) return null;
      return parsed.state;
    } catch (e) { return null; }
  }

  if (banner && btnAccept && btnReject) {
    var existing = loadConsent();
    if (existing) {
      applyConsent(existing);
    } else {
      banner.classList.remove('hidden');
    }
    btnAccept.addEventListener('click', function () {
      applyConsent('granted');
      saveConsent('granted');
      banner.classList.add('hidden');
    });
    btnReject.addEventListener('click', function () {
      applyConsent('denied');
      saveConsent('denied');
      banner.classList.add('hidden');
    });
  }
})();
