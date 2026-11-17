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
      const isApproved = lastReg.status === 'onaylandi';
      if (regBtnSpan) {
        if (isApproved) {
          regBtnSpan.innerHTML = `Kayıt / ID Kartı <span style="background:rgba(0,230,118,0.2); color:var(--color-accent-green); padding:1px 6px; border-radius:6px; font-size:0.75rem; font-weight:800; margin-left:4px; font-family:monospace;">${lastReg.id}</span>`;
        } else {
          regBtnSpan.innerHTML = `Başvuru Durumu <span style="background:rgba(245,158,11,0.2); color:#F59E0B; padding:1px 6px; border-radius:6px; font-size:0.75rem; font-weight:800; margin-left:4px;">⏳ İnceleniyor</span>`;
        }
      }
      if (headerCtaSpan) {
        if (isApproved) {
          headerCtaSpan.innerHTML = `İşletme ID: <strong style="color:var(--color-accent-green); font-family:monospace;">${lastReg.id}</strong>`;
        } else {
          headerCtaSpan.innerHTML = `<span style="color:#F59E0B; font-weight:800;">⏳ Onay Bekleniyor</span>`;
        }
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
    const appCountBadge = document.getElementById('badge-dropdown-app-count');
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
      // Update applications count
      const myApps = store.getUserApplications();
      if (appCountBadge) {
        if (myApps.length > 0) {
          appCountBadge.textContent = myApps.length;
          appCountBadge.style.display = 'inline-block';
        } else {
          appCountBadge.style.display = 'none';
        }
      }
    } else {
      // Not logged in
      profileBtn.classList.remove('logged-in');
      profileBtn.innerHTML = `
        <i data-lucide="user-circle" style="width:22px; height:22px;"></i>
        <span>Profil Aç</span>
      `;
      if (appCountBadge) appCountBadge.style.display = 'none';
      if (window.lucide) window.lucide.createIcons();
    }
  }

  // ===== BAŞVURULARIM MODAL CONTROLLER =====
  const appModalBackdrop = document.getElementById('modal-my-applications-backdrop');
  const appModalBody = document.getElementById('modal-applications-body');
  const btnCloseAppModal = document.getElementById('btn-close-app-modal');

  function openApplicationsModal() {
    if (!appModalBackdrop || !appModalBody) return;
    const myApps = store.getUserApplications();

    if (myApps.length === 0) {
      appModalBody.innerHTML = `
        <div style="text-align:center; padding:2.5rem 1rem; color:var(--color-text-muted);">
          <div style="width:60px; height:60px; border-radius:50%; background:rgba(255,255,255,0.05); color:var(--color-text-dim); display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
            <i data-lucide="store" style="width:28px; height:28px;"></i>
          </div>
          <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.4rem; font-weight:800;">Kayıtlı İşletme Başvurunuz Bulunmuyor</h4>
          <p style="font-size:0.85rem; max-width:360px; margin:0 auto 1.5rem auto; line-height:1.5;">
            BuyurAbi Dijital Adisyon ve Kasa sistemini restoranınızda kullanmak için hemen yeni bir işletme kaydı oluşturabilirsiniz.
          </p>
          <button id="btn-modal-start-new-reg" class="btn-primary-hero" style="padding:0.75rem 1.4rem; font-size:0.9rem; margin:0 auto;">
            <i data-lucide="plus-circle"></i> Yeni İşletme Kaydı Yap
          </button>
        </div>
      `;
    } else {
      appModalBody.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${myApps.map(app => {
            const isApproved = app.status === 'onaylandi';
            const isRejected = app.status === 'reddedildi';
            const isPending = !isApproved && !isRejected;

            return `
              <div class="user-application-card ${isApproved ? 'approved' : isRejected ? 'rejected' : 'pending'}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem; gap:0.8rem; flex-wrap:wrap;">
                  <div>
                    <h4 style="margin:0 0 3px 0; font-size:1.15rem; color:#fff; font-weight:800;">${app.businessName}</h4>
                    <span style="font-size:0.78rem; color:var(--color-text-muted);">
                      🏬 ${app.businessType || 'Restoran'} &nbsp;•&nbsp; 📍 ${app.city || 'Konum belirtilmedi'}
                    </span>
                  </div>
                  <div>
                    ${isApproved ? `
                      <span class="status-badge-approved">
                        <i data-lucide="check-circle-2" style="width:13px; height:13px;"></i> Onaylandı (Aktif)
                      </span>
                    ` : isRejected ? `
                      <span class="status-badge-rejected">
                        <i data-lucide="x-circle" style="width:13px; height:13px;"></i> Reddedildi
                      </span>
                    ` : `
                      <span class="status-badge-pending">
                        <i data-lucide="clock" style="width:13px; height:13px;"></i> ⏳ Yönetici Onayı Bekleniyor
                      </span>
                    `}
                  </div>
                </div>

                <!-- PLAN & DATE INFO -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:0.6rem; background:rgba(0,0,0,0.3); padding:0.65rem 0.9rem; border-radius:var(--radius-sm); margin-bottom:0.9rem; font-size:0.8rem;">
                  <div><span style="color:var(--color-text-dim);">Seçilen Plan:</span> <strong style="color:var(--color-accent-green); display:block;">${app.plan || 'Profesyonel'}</strong></div>
                  <div><span style="color:var(--color-text-dim);">Başvuru Tarihi:</span> <strong style="color:#fff; display:block;">${app.createdAt || 'Yakın zamanda'}</strong></div>
                  <div><span style="color:var(--color-text-dim);">Yetkili Telefon:</span> <strong style="color:#fff; display:block;">${app.phone}</strong></div>
                </div>

                <!-- CODE AND ACCESS STATUS (ADMIN ONAYLAMADAN VERİLMEZ) -->
                ${isApproved ? `
                  <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.35); border-radius:var(--radius-sm); padding:0.85rem 1rem;">
                    <div style="font-size:0.75rem; color:var(--color-accent-green); font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:5px;">
                      <i data-lucide="shield-check" style="width:14px; height:14px;"></i> LİSANSINIZ ONAYLANDI & KULLANIMA HAZIR
                    </div>
                    <div style="display:flex; align-items:center; justify-content:space-between; gap:0.6rem; flex-wrap:wrap;">
                      <div>
                        <span style="font-size:0.72rem; color:var(--color-text-muted); display:block;">İşletme Giriş Kodu (ID):</span>
                        <strong style="font-family:monospace; font-size:1.3rem; color:var(--color-primary); letter-spacing:1.5px;">${app.id}</strong>
                      </div>
                      <div style="display:flex; gap:0.5rem;">
                        <button class="pill-btn btn-copy-app-code" data-code="${app.id}" style="background:rgba(255,107,0,0.2); border:1px solid rgba(255,107,0,0.5); color:var(--color-primary); padding:0.4rem 0.8rem; font-size:0.78rem; font-weight:800; border-radius:var(--radius-sm); cursor:pointer;">
                          <i data-lucide="copy" style="width:13px; height:13px;"></i> Kodu Kopyala
                        </button>
                        <button class="pill-btn btn-show-app-details" data-app-id="${app.id}" style="background:var(--color-primary-gradient); color:#fff; padding:0.4rem 0.8rem; font-size:0.78rem; font-weight:800; border:none; border-radius:var(--radius-sm); cursor:pointer;">
                          Kasa Kartını Aç
                        </button>
                      </div>
                    </div>
                  </div>
                ` : isPending ? `
                  <div style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.35); border-radius:var(--radius-sm); padding:0.85rem 1rem;">
                    <div style="font-size:0.78rem; color:#F59E0B; font-weight:800; margin-bottom:4px; display:flex; align-items:center; gap:5px;">
                      <i data-lucide="alert-circle" style="width:14px; height:14px;"></i> BAŞVURUNUZ İNCELEME AŞAMASINDA
                    </div>
                    <p style="font-size:0.78rem; color:var(--color-text-muted); margin:0 0 6px 0; line-height:1.4;">
                      Sistem güvenliği ve restoran doğrulaması için başvurunuz yönetici onayından geçmektedir. <strong>Yönetici onaylayana kadar işletme kodu kilitli kalır.</strong>
                    </p>
                    <div style="display:flex; align-items:center; gap:0.5rem; background:rgba(0,0,0,0.4); padding:0.4rem 0.8rem; border-radius:6px; font-size:0.8rem; color:var(--color-text-dim);">
                      <i data-lucide="lock" style="width:13px; height:13px; color:#F59E0B;"></i> İşletme Kodu: <span style="font-family:monospace; color:#F59E0B; font-weight:800;">🔒 Yönetici Onayı Bekleniyor</span>
                    </div>
                  </div>
                ` : `
                  <div style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.3); border-radius:var(--radius-sm); padding:0.75rem 1rem; font-size:0.8rem; color:var(--color-danger);">
                    ❌ Bu başvuru sistem yöneticisi tarafından onaylanmadı. Detaylar için müşteri hizmetlerimizle iletişime geçebilirsiniz.
                  </div>
                `}
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    appModalBackdrop.style.display = 'flex';
    if (window.lucide) window.lucide.createIcons();

    // Copy code button event
    appModalBody.querySelectorAll('.btn-copy-app-code').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const code = e.currentTarget.dataset.code;
        navigator.clipboard.writeText(code).then(() => {
          e.currentTarget.innerHTML = '<i data-lucide="check" style="width:13px; height:13px;"></i> Kopyalandı!';
          if (window.lucide) window.lucide.createIcons();
          setTimeout(() => {
            btn.innerHTML = '<i data-lucide="copy" style="width:13px; height:13px;"></i> Kodu Kopyala';
            if (window.lucide) window.lucide.createIcons();
          }, 2000);
        });
      });
    });

    // Show card button event
    appModalBody.querySelectorAll('.btn-show-app-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const appId = e.currentTarget.dataset.appId;
        const app = store.registrations.find(r => r.id === appId);
        if (app) {
          store.setLastRegisteredBusiness(app);
          appModalBackdrop.style.display = 'none';
          store.setView('register');
        }
      });
    });

    // Start new reg button event
    appModalBody.querySelector('#btn-modal-start-new-reg')?.addEventListener('click', () => {
      appModalBackdrop.style.display = 'none';
      store.clearLastRegisteredBusiness();
      store.setView('register');
    });
  }

  function closeApplicationsModal() {
    if (appModalBackdrop) appModalBackdrop.style.display = 'none';
  }

  // Open Applications from Profile dropdown
  document.getElementById('btn-dropdown-applications')?.addEventListener('click', () => {
    profileDropdown.style.display = 'none';
    openApplicationsModal();
  });

  // Close modal events
  btnCloseAppModal?.addEventListener('click', closeApplicationsModal);
  appModalBackdrop?.addEventListener('click', (e) => {
    if (e.target === appModalBackdrop) closeApplicationsModal();
  });

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
