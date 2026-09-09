import { store } from '../state/store.js';
import { supabaseUrl } from '../lib/supabase.js';

export function renderOwnerAdminPanel(container) {
  let filterRegStatus = 'all';

  function getFilteredRegistrations() {
    if (filterRegStatus === 'all') return store.registrations;
    return store.registrations.filter(r => r.status === filterRegStatus);
  }

  function updateView() {
    // 1. PASSWORD PROTECTION LOCK SCREEN (Password required: 123456)
    if (!store.adminUnlocked) {
      container.innerHTML = `
        <div style="max-width:440px; margin:4rem auto; background:var(--color-bg-card); padding:2.5rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card); text-align:center;">
          <div style="width:72px; height:72px; background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.2rem auto; border:2px solid var(--color-primary); box-shadow:var(--shadow-glow);">
            <i data-lucide="shield-alert" style="width:38px; height:38px;"></i>
          </div>

          <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">Sistem Sahibi Admin Girişi</h2>
          <p style="color:var(--color-text-muted); font-size:0.88rem; margin-bottom:1.8rem;">Gelen başvuruları ve aylık planları görmek için yönetim şifrenizi girin.</p>

          <div style="margin-bottom:1.5rem;">
            <input type="password" id="admin-pass-input" placeholder="Yönetici Şifresi (Örn: 123456)" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); padding:1rem; border-radius:var(--radius-md); text-align:center; font-size:1.4rem; letter-spacing:6px; color:#fff; font-weight:800;">
          </div>

          <button id="btn-unlock-admin" class="btn-primary-hero" style="width:100%; justify-content:center;">
            <i data-lucide="key-round"></i> Yönetim Panelini Aç
          </button>
        </div>
      `;

      if (window.lucide) window.lucide.createIcons();

      const passInput = container.querySelector('#admin-pass-input');
      const unlockBtn = container.querySelector('#btn-unlock-admin');

      function tryUnlock() {
        if (store.unlockAdmin(passInput.value)) {
          showToast('🔓 Hoş geldiniz! Admin Paneli açıldı.', 'success');
          updateView();
        } else {
          showToast('❌ Hatalı Şifre! Lütfen şifrenizi kontrol edin.', 'error');
        }
      }

      unlockBtn?.addEventListener('click', tryUnlock);
      passInput?.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') tryUnlock();
      });

      return;
    }

    // 2. MAIN FOCUSED ADMIN DASHBOARD (APPLICATIONS & MONTHLY PLANS ONLY)
    const regs = getFilteredRegistrations();
    const pendingCount = store.getPendingCount();
    const approvedCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const totalMonthlyRev = store.getTotalMonthlyRevenue();

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.8rem;">
        <!-- ADMIN HEADER BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.2rem; background:var(--color-bg-card); padding:1.5rem 2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
              <div style="width:42px; height:42px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-glow);">
                <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
              </div>
              <h1 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff;">
                İşletme Başvuru & Aylık Plan Yönetimi
              </h1>
            </div>
            <div style="display:flex; align-items:center; gap:0.8rem; margin-left:50px; margin-top:0.2rem;">
              <p style="color:var(--color-text-muted); font-size:0.9rem; margin:0;">
                Gelen restoran başvurularını, seçtikleri paketleri inceleyin ve onaylayın.
              </p>
              ${store.supabaseConnected ? `
                <span title="Supabase Veritabanı Canlı Bağlı" style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; font-weight:800; padding:2px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
                  <span style="width:7px; height:7px; background:var(--color-accent-green); border-radius:50%; display:inline-block; box-shadow:0 0 8px var(--color-accent-green);"></span> Supabase Canlı DB Bağlı
                </span>
              ` : `
                <span title=".env dosyasına Supabase URL ve Key girildiğinde otomatik olarak canlı veritabanına bağlanır." style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:var(--color-accent-yellow); font-size:0.75rem; font-weight:800; padding:2px 10px; border-radius:12px; display:inline-flex; align-items:center; gap:4px;">
                  <span style="width:7px; height:7px; background:var(--color-accent-yellow); border-radius:50%; display:inline-block;"></span> Yerel Depolama Modu
                </span>
              `}
            </div>
          </div>

          <div style="display:flex; gap:0.6rem; align-items:center;">
            <button id="btn-refresh-db" class="btn-secondary-hero" style="padding:0.6rem 1.2rem; font-size:0.85rem;" title="Supabase verilerini tekrar çek">
              <i data-lucide="refresh-cw"></i> Verileri Yenile
            </button>
            <button id="btn-lock-admin" class="btn-secondary-hero" style="padding:0.6rem 1.2rem; font-size:0.85rem;">
              <i data-lucide="lock"></i> Çıkış Yap (Kilitle)
            </button>
          </div>
        </div>

        <!-- SUPABASE ACTIVE ENDPOINT INFO BANNER -->
        <div style="background:rgba(255,255,255,0.03); border:var(--border-glass); padding:0.75rem 1.2rem; border-radius:var(--radius-md); font-size:0.82rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem; color:var(--color-text-muted);">
            <i data-lucide="database" style="width:16px; color:var(--color-primary);"></i>
            <span>Aktif Supabase Uç Noktası: <code style="color:var(--color-accent-cyan); font-weight:700;">${supabaseUrl || 'Belirtilmedi'}</code></span>
          </div>
          <div style="font-size:0.78rem; color:var(--color-text-dim);">
            Veritabanında Toplam: <strong style="color:var(--color-accent-green);">${store.registrations.length} Kayıt</strong>
          </div>
        </div>

        <!-- SUPABASE WARNING BANNER IF ERROR OCCURRED -->
        ${store.lastSupabaseError ? `
          <div style="background:rgba(239,68,68,0.15); border:1px solid var(--color-danger); padding:1.2rem 1.5rem; border-radius:var(--radius-md); color:#fff; font-size:0.9rem; display:flex; flex-direction:column; gap:0.8rem;">
            <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem;">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <i data-lucide="alert-triangle" style="color:var(--color-danger); width:24px; height:24px; flex-shrink:0;"></i>
                <div>
                  <strong style="color:var(--color-danger); font-size:1rem; display:block; margin-bottom:2px;">Supabase Veritabanı Uyarısı</strong>
                  <span style="color:var(--color-text-muted); font-size:0.85rem;">
                    Hata detayı: <code>${store.lastSupabaseError}</code>
                  </span>
                </div>
              </div>
              <button id="btn-retry-db-fetch" class="pill-btn" style="background:rgba(255,255,255,0.1); border:var(--border-glass); white-space:nowrap; cursor:pointer;">
                <i data-lucide="rotate-cw" style="width:14px; vertical-align:middle;"></i> Yeniden Bağlan
              </button>
            </div>

            ${store.lastSupabaseError.includes('does not exist') || store.lastSupabaseError.includes('schema') || store.lastSupabaseError.includes('42P01') ? `
              <div style="background:rgba(0,0,0,0.4); padding:0.85rem 1rem; border-radius:6px; border:1px solid rgba(255,255,255,0.1); font-size:0.82rem; color:var(--color-text-muted);">
                💡 <strong>Çözüm:</strong> Supabase projenizde <code>registrations</code> tablosu oluşturulmamış. Proje klasöründeki <strong style="color:var(--color-accent-cyan);">supabase_schema.sql</strong> dosyasının içeriğini kopyalayıp <strong>Supabase Panel -> SQL Editor</strong> alanına yapıştırın ve <strong>RUN</strong> butonuna tıklayın.
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- SUMMARY STATS CARDS -->
        <div class="admin-top-stats">
          <div class="stat-card-admin">
            <div class="stat-icon orange"><i data-lucide="store"></i></div>
            <div class="stat-info">
              <h5>Toplam Başvuru</h5>
              <h3>${store.registrations.length} Restoran</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon purple"><i data-lucide="clock"></i></div>
            <div class="stat-info">
              <h5>Onay Bekleyenler</h5>
              <h3 style="color:var(--color-accent-yellow);">${pendingCount} Kayıt</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon green"><i data-lucide="check-circle-2"></i></div>
            <div class="stat-info">
              <h5>Onaylanan İşletmeler</h5>
              <h3 style="color:var(--color-accent-green);">${approvedCount} Aktif</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon blue"><i data-lucide="banknote"></i></div>
            <div class="stat-info">
              <h5>Tahmini Aylık Gelir</h5>
              <h3 style="color:var(--color-accent-cyan);">₺${totalMonthlyRev.toLocaleString('tr-TR')} /ay</h3>
            </div>
          </div>
        </div>

        <!-- FILTER TABS BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-card); padding:0.8rem 1.2rem; border-radius:var(--radius-md); border:var(--border-glass);">
          <div style="display:flex; gap:0.5rem;">
            <button class="pill-btn ${filterRegStatus === 'all' ? 'active' : ''}" data-filter-reg="all">Tüm Başvurular (${store.registrations.length})</button>
            <button class="pill-btn ${filterRegStatus === 'bekliyor' ? 'active' : ''}" data-filter-reg="bekliyor">⏳ Onay Bekleyenler (${pendingCount})</button>
            <button class="pill-btn ${filterRegStatus === 'onaylandi' ? 'active' : ''}" data-filter-reg="onaylandi">✅ Onaylananlar (${approvedCount})</button>
            <button class="pill-btn ${filterRegStatus === 'reddedildi' ? 'active' : ''}" data-filter-reg="reddedildi">❌ Reddedilenler</button>
          </div>
        </div>

        <!-- REGISTRATION CARDS WITH SELECTED MONTHLY PLANS -->
        <div style="display:flex; flex-direction:column; gap:1.2rem;">
          ${regs.length === 0 ? `
            <div style="text-align:center; padding:4rem 1rem; background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
              <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
              <p>Bu filtreye uygun restoran başvurusu bulunamadı.</p>
            </div>
          ` : regs.map(reg => `
            <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); padding:1.5rem; border:${reg.status === 'bekliyor' ? '1px solid var(--color-accent-yellow)' : 'var(--border-glass)'}; box-shadow:var(--shadow-card); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem; position:relative; overflow:hidden;">
              ${reg.status === 'bekliyor' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-yellow);"></div>' : reg.status === 'onaylandi' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-green);"></div>' : '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-danger);"></div>'}

              <div style="flex:1; min-width:280px;">
                <!-- Header Info -->
                <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.8rem;">
                  <div style="width:48px; height:48px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.3rem;">🏢</div>
                  <div>
                    <h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff;">${reg.businessName}</h3>
                    <div style="font-size:0.85rem; color:var(--color-primary); font-weight:700;">${reg.businessType || 'Restoran'} • ${reg.city}</div>
                  </div>
                </div>

                <!-- SELECTED PLAN BADGE -->
                <div style="background:rgba(255,107,0,0.12); border:1px solid rgba(255,107,0,0.3); padding:0.6rem 1rem; border-radius:var(--radius-md); margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:0.85rem; font-weight:700; color:var(--color-text-muted);">💎 Seçilen Aylık Plan:</span>
                  <strong style="font-size:0.95rem; color:var(--color-accent-green); font-weight:800;">${reg.plan || 'Profesyonel Paket (₺899/ay)'}</strong>
                </div>

                <!-- Registration Details Grid -->
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem;">
                  <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Yetkili Ad Soyad:</span><strong style="color:#fff;">${reg.fullName}</strong></div>
                  <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Cep Telefonu:</span><strong style="color:var(--color-accent-green);">${reg.phone}</strong></div>
                  <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Başvuru Tarihi:</span><span style="color:var(--color-text-muted);">${reg.createdAt}</span></div>
                </div>

                <div style="margin-top:0.8rem; font-size:0.85rem; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
                  <strong style="color:var(--color-text-muted); font-size:0.78rem; display:block; margin-bottom:2px;">📍 Açık Adres:</strong>
                  <span style="color:#fff;">${reg.fullAddress || 'Adres bilgisi belirtilmedi.'}</span>
                </div>
              </div>

              <!-- Action & Status Right Side -->
              <div style="display:flex; flex-direction:column; align-items:flex-end; gap:1rem; min-width:200px;">
                <div>
                  ${reg.status === 'bekliyor' ? '<span style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:var(--color-accent-yellow); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full);">⏳ Onay Bekliyor</span>' : reg.status === 'onaylandi' ? '<span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full);">✅ Onaylandı (Aktif)</span>' : '<span style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); font-size:0.82rem; font-weight:800; padding:0.4rem 0.9rem; border-radius:var(--radius-full);">❌ Reddedildi</span>'}
                </div>

                <div style="display:flex; gap:0.5rem;">
                  ${reg.status !== 'onaylandi' ? `
                    <button class="btn-approve-reg" data-reg-id="${reg.id}" style="background:rgba(0,230,118,0.2); border:1px solid var(--color-accent-green); color:var(--color-accent-green); padding:0.6rem 1.1rem; border-radius:var(--radius-md); font-weight:800; font-size:0.82rem; cursor:pointer;">
                      ✅ Kaydı Onayla
                    </button>
                  ` : ''}
                  ${reg.status !== 'reddedildi' ? `
                    <button class="btn-reject-reg" data-reg-id="${reg.id}" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); padding:0.6rem 1rem; border-radius:var(--radius-md); font-weight:700; font-size:0.82rem; cursor:pointer;">
                      Reddet
                    </button>
                  ` : ''}
                  <button class="btn-delete-reg" data-reg-id="${reg.id}" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:var(--color-text-muted); padding:0.6rem; border-radius:var(--radius-md); cursor:pointer;">
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

    // Event Bindings
    container.querySelector('#btn-refresh-db')?.addEventListener('click', async () => {
      showToast('🔄 Supabase verileri çekiliyor...', 'info');
      await store.fetchRegistrations();
      updateView();
    });

    container.querySelector('#btn-retry-db-fetch')?.addEventListener('click', async () => {
      showToast('🔄 Supabase veritabanına yeniden bağlanılıyor...', 'info');
      await store.fetchRegistrations();
      updateView();
    });

    container.querySelector('#btn-lock-admin')?.addEventListener('click', () => {
      store.lockAdmin();
      updateView();
    });

    container.querySelectorAll('.pill-btn[data-filter-reg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterRegStatus = e.currentTarget.dataset.filterReg;
        updateView();
      });
    });

    container.querySelectorAll('.btn-approve-reg').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const res = await store.approveRegistration(e.currentTarget.dataset.regId);
        if (res && res.error) {
          showToast(`⚠️ Supabase Hatası: ${res.error}`, 'error');
        } else {
          showToast('✅ İşletme başvurusu onaylandı ve Supabase veritabanına kaydedildi!', 'success');
        }
        updateView();
      });
    });

    container.querySelectorAll('.btn-reject-reg').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const res = await store.rejectRegistration(e.currentTarget.dataset.regId);
        if (res && res.error) {
          showToast(`⚠️ Supabase Hatası: ${res.error}`, 'error');
        } else {
          showToast('❌ Başvuru reddedildi ve Supabase güncellendi.', 'info');
        }
        updateView();
      });
    });

    container.querySelectorAll('.btn-delete-reg').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const res = await store.deleteRegistration(e.currentTarget.dataset.regId);
        if (res && res.error) {
          showToast(`⚠️ Supabase Hatası: ${res.error}`, 'error');
        } else {
          showToast('🗑️ Başvuru silindi ve Supabase veritabanından kaldırıldı.', 'info');
        }
        updateView();
      });
    });
  }

  // Subscribe to store updates
  store.subscribe(() => {
    updateView();
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
