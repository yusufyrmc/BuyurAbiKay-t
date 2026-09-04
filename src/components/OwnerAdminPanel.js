import { store } from '../state/store.js';

export function renderOwnerAdminPanel(container) {
  let filterStatus = 'all'; // 'all' | 'bekliyor' | 'onaylandi' | 'reddedildi'
  let enteredPin = '';

  function getFilteredRegistrations() {
    if (filterStatus === 'all') return store.registrations;
    return store.registrations.filter(r => r.status === filterStatus);
  }

  function updateView() {
    // PIN Protection Lock Screen
    if (!store.adminUnlocked) {
      container.innerHTML = `
        <div style="max-width:440px; margin:4rem auto; background:var(--color-bg-card); padding:2.5rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card); text-align:center;">
          <div style="width:70px; height:70px; background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.2rem auto; border:2px solid var(--color-primary);">
            <i data-lucide="lock" style="width:36px; height:36px;"></i>
          </div>

          <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">Sistem Sahibi Admin Paneli</h2>
          <p style="color:var(--color-text-muted); font-size:0.88rem; margin-bottom:1.8rem;">Gelen işletme kayıtlarını incelemek ve onaylamak için PIN kodunuzu girin.</p>

          <div style="margin-bottom:1.5rem;">
            <input type="password" id="admin-pin-input" maxlength="4" placeholder="4 Haneli PIN (Varsayılan: 1234)" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); padding:1rem; border-radius:var(--radius-md); text-align:center; font-size:1.5rem; letter-spacing:8px; color:#fff; font-weight:800;">
          </div>

          <button id="btn-unlock-admin" class="btn-primary-hero" style="width:100%; justify-content:center;">
            <i data-lucide="key-round"></i> Yönetim Panelini Aç
          </button>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const pinInput = container.querySelector('#admin-pin-input');
      const unlockBtn = container.querySelector('#btn-unlock-admin');

      function tryUnlock() {
        if (pinInput.value === '1234') {
          store.adminUnlocked = true;
          updateView();
        } else {
          showToast('❌ Hatalı PIN Kodu! Lütfen tekrar deneyin. (Varsayılan: 1234)', 'error');
        }
      }

      unlockBtn?.addEventListener('click', tryUnlock);
      pinInput?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') tryUnlock();
      });

      return;
    }

    // MAIN ADMIN PANEL VIEW WHEN UNLOCKED
    const regs = getFilteredRegistrations();
    const pendingCount = store.getPendingCount();
    const approvedCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const rejectedCount = store.registrations.filter(r => r.status === 'reddedildi').length;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.8rem;">
        <!-- ADMIN HEADER BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--color-bg-card); padding:1.5rem; border-radius:var(--radius-lg); border:var(--border-glass);">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
              <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff;">🛡️ Özel İşletme Kayıt Onay Paneli</h2>
              <span style="background:var(--color-primary-light); color:var(--color-primary); font-size:0.75rem; font-weight:800; padding:2px 8px; border-radius:12px; border:1px solid var(--color-primary);">GİZLİ YÖNETİM</span>
            </div>
            <p style="color:var(--color-text-muted); font-size:0.9rem;">Sisteme başvuran restoran ve işletmeleri inceleyin, onaylayın veya reddedin.</p>
          </div>

          <button id="btn-lock-admin" class="btn-secondary-hero" style="padding:0.6rem 1.2rem; font-size:0.85rem;">
            <i data-lucide="lock"></i> Oturumu Kapat
          </button>
        </div>

        <!-- STATS ROW -->
        <div class="admin-top-stats">
          <div class="stat-card-admin">
            <div class="stat-icon orange">
              <i data-lucide="store"></i>
            </div>
            <div class="stat-info">
              <h5>Toplam Başvuru</h5>
              <h3>${store.registrations.length} Restoran</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon purple">
              <i data-lucide="clock"></i>
            </div>
            <div class="stat-info">
              <h5>Onay Bekleyenler</h5>
              <h3 style="color:var(--color-accent-yellow);">${pendingCount} Kayıt</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon green">
              <i data-lucide="check-circle-2"></i>
            </div>
            <div class="stat-info">
              <h5>Onaylanan Restoranlar</h5>
              <h3 style="color:var(--color-accent-green);">${approvedCount} Aktif</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon blue">
              <i data-lucide="x-circle"></i>
            </div>
            <div class="stat-info">
              <h5>Reddedilenler</h5>
              <h3 style="color:var(--color-danger);">${rejectedCount} Kayıt</h3>
            </div>
          </div>
        </div>

        <!-- FILTER TABS BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-card); padding:0.8rem 1.2rem; border-radius:var(--radius-md); border:var(--border-glass);">
          <div style="display:flex; gap:0.5rem;">
            <button class="pill-btn ${filterStatus === 'all' ? 'active' : ''}" data-filter="all">Tüm Başvurular (${store.registrations.length})</button>
            <button class="pill-btn ${filterStatus === 'bekliyor' ? 'active' : ''}" data-filter="bekliyor">⏳ Onay Bekleyenler (${pendingCount})</button>
            <button class="pill-btn ${filterStatus === 'onaylandi' ? 'active' : ''}" data-filter="onaylandi">✅ Onaylananlar (${approvedCount})</button>
            <button class="pill-btn ${filterStatus === 'reddedildi' ? 'active' : ''}" data-filter="reddedildi">❌ Reddedilenler (${rejectedCount})</button>
          </div>
        </div>

        <!-- REGISTRATIONS LIST / CARDS -->
        <div style="display:flex; flex-direction:column; gap:1.2rem;">
          ${regs.length === 0 ? `
            <div style="text-align:center; padding:4rem 1rem; background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
              <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
              <p>Bu filtreye uygun işletme başvurusu bulunamadı.</p>
            </div>
          ` : regs.map(reg => `
            <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); padding:1.5rem; border:${reg.status === 'bekliyor' ? '1px solid var(--color-accent-yellow)' : 'var(--border-glass)'}; box-shadow:var(--shadow-card); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem; position:relative; overflow:hidden;">
              ${reg.status === 'bekliyor' ? `
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--color-accent-yellow);"></div>
              ` : reg.status === 'onaylandi' ? `
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--color-accent-green);"></div>
              ` : `
                <div style="position:absolute; top:0; left:0; width:4px; height:100%; background:var(--color-danger);"></div>
              `}

              <!-- Main Info Left -->
              <div style="flex:1; min-width:280px;">
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.6rem;">
                  <div style="width:46px; height:46px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.2rem;">
                    🏢
                  </div>
                  <div>
                    <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">${reg.businessName}</h3>
                    <div style="font-size:0.82rem; color:var(--color-primary); font-weight:700;">${reg.businessType || 'Restoran'} • ${reg.city}</div>
                  </div>
                </div>

                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:var(--radius-md); margin-top:0.8rem; font-size:0.85rem;">
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Yetkili Kişi:</span>
                    <strong style="color:#fff;">${reg.fullName}</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Telefon:</span>
                    <strong style="color:var(--color-accent-green);">${reg.phone}</strong>
                  </div>
                  <div>
                    <span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Başvuru Tarihi:</span>
                    <span style="color:var(--color-text-muted);">${reg.createdAt}</span>
                  </div>
                </div>

                <div style="margin-top:0.8rem; font-size:0.85rem; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
                  <strong style="color:var(--color-text-muted); font-size:0.78rem; display:block; margin-bottom:2px;">📍 Açık Adres:</strong>
                  <span style="color:#fff;">${reg.fullAddress || 'Adres belirtilmedi.'}</span>
                </div>
              </div>

              <!-- Status & Action Right -->
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:1rem; min-width:200px;">
                <!-- Status Badge -->
                <div>
                  ${reg.status === 'bekliyor' ? `
                    <span style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:var(--color-accent-yellow); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.4rem;">
                      <i data-lucide="clock" style="width:14px;"></i> Onay Bekliyor
                    </span>
                  ` : reg.status === 'onaylandi' ? `
                    <span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.4rem;">
                      <i data-lucide="check-circle-2" style="width:14px;"></i> Onaylandı (Aktif)
                    </span>
                  ` : `
                    <span style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full); display:inline-flex; align-items:center; gap:0.4rem;">
                      <i data-lucide="x-circle" style="width:14px;"></i> Reddedildi
                    </span>
                  `}
                </div>

                <!-- Action Buttons -->
                <div style="display:flex; gap:0.5rem; flex-wrap:wrap; justify-content:flex-end;">
                  ${reg.status !== 'onaylandi' ? `
                    <button class="btn-approve-reg" data-reg-id="${reg.id}" style="background:rgba(0,230,118,0.2); border:1px solid var(--color-accent-green); color:var(--color-accent-green); padding:0.55rem 1rem; border-radius:var(--radius-md); font-weight:800; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:0.3rem;">
                      <i data-lucide="check" style="width:14px;"></i> Kaydı Onayla
                    </button>
                  ` : ''}

                  ${reg.status !== 'reddedildi' ? `
                    <button class="btn-reject-reg" data-reg-id="${reg.id}" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); padding:0.55rem 0.9rem; border-radius:var(--radius-md); font-weight:700; font-size:0.82rem; cursor:pointer;">
                      Reddet
                    </button>
                  ` : ''}

                  <button class="btn-delete-reg" data-reg-id="${reg.id}" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:var(--color-text-muted); padding:0.55rem 0.8rem; border-radius:var(--radius-md); font-size:0.82rem; cursor:pointer;">
                    <i data-lucide="trash-2" style="width:14px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Listeners
    container.querySelector('#btn-lock-admin')?.addEventListener('click', () => {
      store.adminUnlocked = false;
      updateView();
    });

    container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterStatus = e.currentTarget.dataset.filter;
        updateView();
      });
    });

    container.querySelectorAll('.btn-approve-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const regId = e.currentTarget.dataset.regId;
        store.approveRegistration(regId);
        showToast('✅ İşletme kaydı onaylandı ve aktif edildi!', 'success');
        updateView();
      });
    });

    container.querySelectorAll('.btn-reject-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const regId = e.currentTarget.dataset.regId;
        store.rejectRegistration(regId);
        showToast('❌ Başvuru reddedildi.', 'info');
        updateView();
      });
    });

    container.querySelectorAll('.btn-delete-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const regId = e.currentTarget.dataset.regId;
        store.deleteRegistration(regId);
        showToast('🗑️ Kayıt silindi.', 'info');
        updateView();
      });
    });
  }

  // Subscribe to store changes
  store.subscribe(() => {
    if (store.activeView === 'owner-admin') {
      updateView();
    }
  });

  updateView();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  if (type === 'error') toast.style.borderLeftColor = 'var(--color-danger)';
  toast.innerHTML = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
