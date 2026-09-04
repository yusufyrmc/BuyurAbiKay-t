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

  function switchView(targetView) {
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
    if (state.activeView) {
      switchView(state.activeView);
    }
  });

  // Initial setup
  switchView(store.activeView || 'landing');
});
