/**
 * Soprannomi - Tracking layer (Google Tag / gtag.js)
 *
 * Eventi sparati:
 *   - phone_click
 *   - whatsapp_click
 *   - map_click
 *   - menu_engagement (>=30s su /menu.html)
 *   - reservation_submit
 *
 * Per ognuno, viene chiamato:
 *   1) gtag('event', '<eventName>', {...})  -> visibile in GA4 (se collegato)
 *   2) gtag('event', 'conversion', {send_to: 'AW-.../LABEL', value, currency})
 *      -> registra una conversione in Google Ads
 *
 * IMPORTANTE: per ogni evento devi creare in Google Ads una "Azione di conversione"
 * (Strumenti > Conversioni > +Nuova). Ogni azione ti restituisce una "Conversion Label"
 * (stringa tipo "abcDEF123_ghiJKL"). Incolla quella stringa nei campi `label` qui sotto.
 *
 * Finche' il label resta "REPLACE_...", l'evento NON viene inviato a Google Ads
 * (ma viene comunque pushato a dataLayer e in GA4).
 */

(function () {
  'use strict';

  // === CONFIG: sostituisci i label con quelli generati in Google Ads ===
  var ADS_CONVERSION_ID = 'AW-17594995826';

  var CONVERSIONS = {
    phone_click:        { label: 'REPLACE_PHONE_LABEL',       value: 20, currency: 'EUR' },
    whatsapp_click:     { label: 'pqurCPL03KQcEPKo-cVB',      value: 25, currency: 'EUR' },
    map_click:          { label: 'REPLACE_MAP_LABEL',         value: 5,  currency: 'EUR' },
    menu_engagement:    { label: 'REPLACE_MENU_LABEL',        value: 3,  currency: 'EUR' },
    reservation_submit: { label: 'REPLACE_RESERVATION_LABEL', value: 30, currency: 'EUR' }
  };
  // =====================================================================

  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  function track(eventName, payload) {
    var data = Object.assign({}, payload || {});

    // 1) Evento generico (GA4 custom event se collegato)
    gtag('event', eventName, data);

    // 2) Conversione Google Ads (se label configurato)
    var conv = CONVERSIONS[eventName];
    if (conv && conv.label && conv.label.indexOf('REPLACE_') !== 0) {
      gtag('event', 'conversion', {
        'send_to': ADS_CONVERSION_ID + '/' + conv.label,
        'value': conv.value,
        'currency': conv.currency
      });
    }

    if (window.console && console.debug) {
      console.debug('[track]', eventName, data, conv ? '(conversion configured)' : '');
    }
  }

  // 1) Click telefono
  function bindPhone() {
    document.querySelectorAll('a[href^="tel:"], a[data-track="phone"]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('phone_click', {
          phone_number: el.getAttribute('href') || '',
          location: (el.closest('header,footer,section,main') || {}).tagName || 'unknown'
        });
      });
    });
  }

  // 2) Click WhatsApp
  function bindWhatsApp() {
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com/send"], a[data-track="whatsapp"]').forEach(function (el) {
      el.addEventListener('click', function () {
        track('whatsapp_click', {
          link: el.getAttribute('href') || '',
          location: (el.closest('header,footer,section,main') || {}).tagName || 'unknown'
        });
      });
    });
  }

  // 3) Click mappa / indicazioni
  function bindMap() {
    document.querySelectorAll('a').forEach(function (el) {
      var href = el.getAttribute('href') || '';
      var isMap = /google\.com\/maps|maps\.app\.goo\.gl|apple\.com\/maps|^\/?mappa/i.test(href) || el.dataset.track === 'map';
      if (!isMap) return;
      el.addEventListener('click', function () {
        track('map_click', { link: href });
      });
    });
  }

  // 4) Engagement menu (30s)
  function bindMenuEngagement() {
    if (!/\/menu(\.html)?(\?|#|$)/.test(location.pathname + location.search)) return;
    var timer = setTimeout(function () {
      track('menu_engagement', { seconds_on_page: 30 });
    }, 30000);
    window.addEventListener('beforeunload', function () { clearTimeout(timer); });
  }

  // 5) Form prenotazione
  function bindReservationForm() {
    var form = document.getElementById('prenota-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var nome = (data.get('nome') || '').toString().trim();
      var telefono = (data.get('telefono') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var dataPrenota = (data.get('data') || '').toString();
      var orario = (data.get('orario') || '').toString();
      var coperti = (data.get('coperti') || '').toString();
      var note = (data.get('note') || '').toString().trim();

      track('reservation_submit', {
        coperti: coperti,
        data_prenotazione: dataPrenota,
        orario: orario,
        ha_email: email ? 'yes' : 'no',
        ha_note: note ? 'yes' : 'no'
      });

      var msg =
        'Ciao Soprannomi! Vorrei prenotare un tavolo:\n' +
        '\n*Nome*: ' + nome +
        '\n*Telefono*: ' + telefono +
        (email ? '\n*Email*: ' + email : '') +
        '\n*Data*: ' + formatDate(dataPrenota) +
        '\n*Orario*: ' + orario +
        '\n*Coperti*: ' + coperti +
        (note ? '\n*Note*: ' + note : '') +
        '\n\nGrazie!';

      var url = 'https://wa.me/393298586462?text=' + encodeURIComponent(msg);
      window.open(url, '_blank', 'noopener');
    });
  }

  function formatDate(iso) {
    if (!iso) return '';
    var parts = iso.split('-');
    if (parts.length !== 3) return iso;
    return parts[2] + '/' + parts[1] + '/' + parts[0];
  }

  function bindImages() {
    document.querySelectorAll('img').forEach(function (img) {
      if (img.complete) {
        img.dataset.loaded = '1';
      } else {
        img.addEventListener('load', function () { img.dataset.loaded = '1'; });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    bindPhone();
    bindWhatsApp();
    bindMap();
    bindMenuEngagement();
    bindReservationForm();
    bindImages();
  }
})();
