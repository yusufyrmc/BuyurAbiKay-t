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
    const profile = store.getUserProfile();
    const regBtnSpan = document.querySelector('#nav-register-btn span');
    const headerCtaSpan = document.querySelector('#btn-header-cta span');
    if (lastReg && lastReg.id) {
      if (regBtnSpan) {
        regBtnSpan.innerHTML = `Kayıt / ID Kartı <span style="background:rgba(0,230,118,0.2); color:var(--color-accent-green); padding:1px 6px; border-radius:6px; font-size:0.75rem; font-weight:800; margin-left:4px; font-family:monospace;">${lastReg.id}</span>`;
      }
      if (headerCtaSpan) {
        headerCtaSpan.innerHTML = `İşletme ID: <strong style="color:var(--color-accent-green); font-family:monospace;">${lastReg.id}</strong>`;
      }
    } else if (profile && profile.fullName) {
      const firstName = profile.fullName.split(' ')[0];
      if (regBtnSpan) {
        regBtnSpan.innerHTML = `İşletme Kaydı <span style="background:rgba(0,229,255,0.18); color:var(--color-accent-cyan); padding:1px 6px; border-radius:6px; font-size:0.75rem; font-weight:800; margin-left:4px;">👤 ${firstName}</span>`;
      }
      if (headerCtaSpan) {
        headerCtaSpan.innerHTML = `İşletmeni Kaydet (${firstName})`;
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

  // ===== PROFILE BUTTON & DROPDOWN =====
  const profileBtn = document.getElementById('btn-header-profile');
  const profileDropdown = document.getElementById('header-profile-dropdown');
  const profileLabel = document.getElementById('header-profile-label');
  const profileIcon = document.getElementById('header-profile-icon');
  const dropdownInfo = document.getElementById('dropdown-profile-info');

  function updateProfileButton() {
    const profile = store.getUserProfile();
    if (profile && profile.fullName) {
      // Logged in state
      const initial = profile.fullName.charAt(0).toUpperCase();
      profileBtn.classList.add('logged-in');
      profileBtn.innerHTML = `
        <div class="profile-avatar-mini-header">${initial}</div>
        <span>${profile.fullName.split(' ')[0]}</span>
      `;
      if (dropdownInfo) {
        dropdownInfo.innerHTML = `
          <strong>${profile.fullName}</strong>
          <span>${profile.email || profile.phone || ''}</span><br>
          <span style="color:var(--color-primary); font-weight:700; font-size:0.78rem;">${profile.role || 'İşletme Sahibi'}</span>
        `;
      }
    } else {
      // Not logged in
      profileBtn.classList.remove('logged-in');
      profileBtn.innerHTML = `
        <i data-lucide="user-circle" style="width:22px; height:22px;"></i>
        <span>Profil Aç</span>
      `;
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // Toggle dropdown
  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    const profile = store.getUserProfile();
    if (!profile) {
      // No profile yet - go to register page (step 0: profile creation)
      store.setView('register');
      return;
    }
    // Toggle dropdown visibility
    if (profileDropdown.style.display === 'none' || !profileDropdown.style.display) {
      profileDropdown.style.display = 'block';
    } else {
      profileDropdown.style.display = 'none';
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target) && e.target !== profileBtn) {
      profileDropdown.style.display = 'none';
    }
  });

  // Edit profile button
  document.getElementById('btn-dropdown-edit-profile')?.addEventListener('click', () => {
    profileDropdown.style.display = 'none';
    store.setView('register');
  });

  // LOGOUT button
  document.getElementById('btn-dropdown-logout')?.addEventListener('click', () => {
    profileDropdown.style.display = 'none';
    store.logoutUser();
    updateProfileButton();
    updateNavLabels();
    switchView('landing', true); // Force re-render landing page to clear business banners
    // Show toast
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      const toast = document.createElement('div');
      toast.className = 'toast-message';
      toast.style.borderLeftColor = 'var(--color-accent-green)';
      toast.innerHTML = '✅ Oturum kapatıldı ve hesaba ait tüm veriler temizlendi!';
      toastContainer.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    }
  });

  // Initial profile button state
  updateProfileButton();

  // Subscribe to store updates
  store.subscribe((state) => {
    updateNavLabels();
    updateProfileButton();
    if (state.activeView) {
      switchView(state.activeView, true);
    }
  });

  // Initial setup
  switchView(store.activeView || 'landing');
});
