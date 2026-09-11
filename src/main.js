import { store } from './state/store.js';
import { renderLandingPage } from './components/LandingPage.js';
import { renderRegisterPage } from './components/RegisterPage.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewSections = {
    landing: document.getElementById('view-landing'),
    register: document.getElementById('view-register')
  };

  const navButtons = {
    landing: document.getElementById('nav-landing-btn'),
    register: document.getElementById('nav-register-btn')
  };

  let currentActiveView = null;

  function updateNavLabels() {
    const lastReg = store.getLastRegisteredBusiness();
    const regBtnSpan = document.querySelector('#nav-register-btn span');
    const headerCtaSpan = document.querySelector('#btn-header-cta span');
    if (lastReg && lastReg.id) {
      if (regBtnSpan) {
        regBtnSpan.innerHTML = `Kayıt / ID Kartı <span style="background:rgba(0,230,118,0.2); color:var(--color-accent-green); padding:1px 6px; border-radius:6px; font-size:0.75rem; font-weight:800; margin-left:4px; font-family:monospace;">${lastReg.id}</span>`;
      }
      if (headerCtaSpan) {
        headerCtaSpan.innerHTML = `İşletme ID: <strong style="color:var(--color-accent-green); font-family:monospace;">${lastReg.id}</strong>`;
      }
    } else {
      if (regBtnSpan) regBtnSpan.textContent = 'Kayıt Ol';
      if (headerCtaSpan) headerCtaSpan.textContent = 'İşletmeni Kaydet';
    }
  }

  function switchView(targetView, force = false) {
    if (!force && targetView === currentActiveView) {
      updateNavLabels();
      return;
    }
    currentActiveView = targetView;

    Object.keys(viewSections).forEach(viewKey => {
      if (viewSections[viewKey]) {
        viewSections[viewKey].classList.remove('active');
      }
      if (navButtons[viewKey]) {
        navButtons[viewKey].classList.remove('active');
      }
    });

    if (viewSections[targetView]) {
      viewSections[targetView].classList.add('active');
    }
    if (navButtons[targetView]) {
      navButtons[targetView].classList.add('active');
    }

    if (targetView === 'landing') {
      renderLandingPage(viewSections.landing);
    } else if (targetView === 'register') {
      renderRegisterPage(viewSections.register);
    }

    updateNavLabels();

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Bind Navigation Clicks
  Object.keys(navButtons).forEach(viewKey => {
    if (navButtons[viewKey]) {
      navButtons[viewKey].addEventListener('click', () => {
        store.setView(viewKey);
      });
    }
  });

  document.getElementById('logo-btn')?.addEventListener('click', () => {
    store.setView('landing');
  });

  document.getElementById('btn-header-cta')?.addEventListener('click', () => {
    store.setView('register');
  });

  // Subscribe to store updates
  store.subscribe((state) => {
    updateNavLabels();
    if (state.activeView && state.activeView !== currentActiveView) {
      switchView(state.activeView);
    }
  });

  // Initial setup
  switchView(store.activeView || 'landing');
});
