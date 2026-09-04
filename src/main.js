import { store } from './state/store.js';
import { renderLandingPage } from './components/LandingPage.js';
import { renderRegisterPage } from './components/RegisterPage.js';
import { renderOwnerAdminPanel } from './components/OwnerAdminPanel.js';

document.addEventListener('DOMContentLoaded', () => {
  const viewSections = {
    landing: document.getElementById('view-landing'),
    register: document.getElementById('view-register'),
    'owner-admin': document.getElementById('view-owner-admin')
  };

  const navButtons = {
    landing: document.getElementById('nav-landing-btn'),
    register: document.getElementById('nav-register-btn'),
    'owner-admin': document.getElementById('nav-owner-admin-btn')
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
    } else if (targetView === 'owner-admin') {
      renderOwnerAdminPanel(viewSections['owner-admin']);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function updateNavBadges() {
    const pendingCount = store.getPendingCount();
    const badge = document.getElementById('header-pending-badge');
    if (badge) {
      badge.textContent = pendingCount;
      badge.style.display = pendingCount > 0 ? 'inline-block' : 'none';
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
    updateNavBadges();
    if (state.activeView) {
      switchView(state.activeView);
    }
  });

  // Initial setup
  updateNavBadges();
  switchView(store.activeView || 'landing');
});
