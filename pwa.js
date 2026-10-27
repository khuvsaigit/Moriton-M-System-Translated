/* ============================================================
   Moriton Equine Center — PWA Controller
   ------------------------------------------------------------
   • Service worker registration
   • Automatic app reload on updates (waits for idle state)
   • "Install App" button (Chrome / Edge)
   • Offline network loss indicator
   ============================================================ */
(function () {
  'use strict';

  var SW_URL = './sw.js';
  var UPDATE_CHECK_MS = 60 * 1000;

  if (!('serviceWorker' in navigator)) return;

  var host = location.hostname;
  var secure =
    location.protocol === 'https:' || host === 'localhost' || host === '127.0.0.1';
  if (!secure) {
    console.info(
      '[PWA] Service worker requires HTTPS or localhost. ' +
        'Current protocol: ' + location.protocol + ' — PWA disabled.'
    );
    return;
  }

  var hadController = !!navigator.serviceWorker.controller;
  var reloadQueued = false;

  function userIsBusy() {
    var el = document.activeElement;
    if (
      el &&
      /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
      !el.readOnly &&
      !el.disabled
    ) {
      return true;
    }
    if (document.querySelector('.mod-bd.show, .drawer-bd.show, dialog[open]')) {
      return true;
    }
    return false;
  }

  function reloadWhenIdle() {
    if (!userIsBusy()) {
      location.reload();
      return;
    }
    setTimeout(reloadWhenIdle, 4000);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (!hadController || reloadQueued) return;
    reloadQueued = true;
    reloadWhenIdle();
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register(SW_URL)
      .then(function (reg) {
        var check = function () {
          reg.update().catch(function () {});
        };
        setInterval(check, UPDATE_CHECK_MS);
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) check();
        });
        window.addEventListener('online', check);
      })
      .catch(function (err) {
        console.warn('[PWA] Service worker registration failed:', err);
      });
  });

  var deferredPrompt = null;
  var installBtn = null;

  function injectStyles() {
    if (document.getElementById('pwa-style')) return;
    var s = document.createElement('style');
    s.id = 'pwa-style';
    s.textContent =
      '#pwa-install{position:fixed;right:16px;bottom:16px;z-index:4000;' +
      'display:none;align-items:center;gap:8px;padding:11px 18px;border:0;' +
      'border-radius:999px;background:#022438;color:#e8c87a;cursor:pointer;' +
      "font-family:'Nunito',sans-serif;font-size:14px;font-weight:800;" +
      'box-shadow:0 8px 24px rgba(0,0,0,.35);transition:transform .15s ease}' +
      '#pwa-install:hover{transform:translateY(-2px)}' +
      '#pwa-install.on{display:flex}' +
      '#pwa-offline{position:fixed;left:50%;transform:translateX(-50%);' +
      'top:0;z-index:4500;display:none;padding:7px 20px;' +
      'border-radius:0 0 12px 12px;background:#b45309;color:#fff;' +
      "font-family:'Nunito',sans-serif;font-size:13px;font-weight:800;" +
      'box-shadow:0 4px 16px rgba(0,0,0,.3)}' +
      '#pwa-offline.on{display:block}' +
      '@media print{#pwa-install,#pwa-offline{display:none !important}}';
    document.head.appendChild(s);
  }

  function buildInstallBtn() {
    injectStyles();
    installBtn = document.createElement('button');
    installBtn.id = 'pwa-install';
    installBtn.type = 'button';
    installBtn.textContent = '⤓  Install App';
    installBtn.addEventListener('click', function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(function () {
        deferredPrompt = null;
        installBtn.classList.remove('on');
      });
    });
    document.body.appendChild(installBtn);
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!installBtn) buildInstallBtn();
    installBtn.classList.add('on');
  });

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    if (installBtn) installBtn.classList.remove('on');
  });

  var offlineBar = null;

  function paintNet() {
    if (!offlineBar) return;
    if (navigator.onLine) offlineBar.classList.remove('on');
    else offlineBar.classList.add('on');
  }

  function initNetIndicator() {
    injectStyles();
    offlineBar = document.createElement('div');
    offlineBar.id = 'pwa-offline';
    offlineBar.textContent =
      '⚠  Internet connection lost — changes might not be saved';
    document.body.appendChild(offlineBar);
    paintNet();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNetIndicator);
  } else {
    initNetIndicator();
  }
  window.addEventListener('online', paintNet);
  window.addEventListener('offline', paintNet);
})();
