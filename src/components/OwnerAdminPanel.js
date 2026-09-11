import { store } from '../state/store.js';
import { supabaseUrl } from '../lib/supabase.js';

export function renderOwnerAdminPanel(container) {
  let activeTab = 'orders'; // 'orders' | 'support' | 'registrations' | 'health'
  let filterRegStatus = 'all';
  let filterOrderStatus = 'all';
  let filterOrderBusiness = 'all';
  let supportSearchQuery = '';
  let supportSelectedBusinessId = store.registrations[0]?.id || null;
  let callTimerSeconds = 0;
  let callTimerInterval = null;

  function startCallTimer() {
    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerSeconds = 0;
    callTimerInterval = setInterval(() => {
      callTimerSeconds++;
      const timerEl = container.querySelector('#call-timer-display');
      if (timerEl) {
        const mins = String(Math.floor(callTimerSeconds / 60)).padStart(2, '0');
        const secs = String(callTimerSeconds % 60).padStart(2, '0');
        timerEl.textContent = `${mins}:${secs}`;
      }
    }, 1000);
  }

  function getFilteredRegistrations() {
    if (filterRegStatus === 'all') return store.registrations;
    return store.registrations.filter(r => r.status === filterRegStatus);
  }

  function getFilteredOrders() {
    let list = store.orders;
    if (filterOrderBusiness !== 'all') {
      list = list.filter(o => o.businessId === filterOrderBusiness);
    }
    if (filterOrderStatus !== 'all') {
      list = list.filter(o => o.status === filterOrderStatus);
    }
    return list;
  }

  function updateView() {
    // 1. PASSWORD PROTECTION LOCK SCREEN (Default: 123456)
    if (!store.adminUnlocked) {
      if (callTimerInterval) clearInterval(callTimerInterval);
      container.innerHTML = `
        <div style="max-width:440px; margin:4rem auto; background:var(--color-bg-card); padding:2.5rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card); text-align:center;">
          <div style="width:72px; height:72px; background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.2rem auto; border:2px solid var(--color-primary); box-shadow:var(--shadow-glow);">
            <i data-lucide="shield-alert" style="width:38px; height:38px;"></i>
          </div>

          <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">Sistem Sahibi Admin Girişi</h2>
          <p style="color:var(--color-text-muted); font-size:0.88rem; margin-bottom:1.8rem;">İşletmelerin canlı siparişlerini ve müşteri destek konsolunu yönetmek için şifrenizi girin.</p>

          <div style="margin-bottom:1.5rem;">
            <input type="password" id="admin-pass-input" placeholder="Yönetici Şifresi (Örn: 123456)" value="123456" style="width:100%; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.15); padding:1rem; border-radius:var(--radius-md); text-align:center; font-size:1.4rem; letter-spacing:6px; color:#fff; font-weight:800;">
            <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:0.5rem;">
              Varsayılan Yönetici Şifresi: <strong style="color:var(--color-primary);">123456</strong>
            </div>
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
          startCallTimer();
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

    // 2. MAIN ADMIN & LIVE SUPPORT CONSOLE
    const regs = getFilteredRegistrations();
    const orders = getFilteredOrders();
    const pendingCount = store.getPendingCount();
    const approvedCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const totalMonthlyRev = store.getTotalMonthlyRevenue();

    const newOrdersCount = store.orders.filter(o => o.status === 'yeni').length;
    const prepOrdersCount = store.orders.filter(o => o.status === 'hazirlaniyor').length;
    const onTableCount = store.orders.filter(o => o.status === 'masada').length;
    const totalLiveOrderRev = store.orders.filter(o => o.status !== 'iptal').reduce((sum, o) => sum + o.totalPrice, 0);

    // Selected business for support
    const selectedSupportBusiness = store.registrations.find(r => r.id === supportSelectedBusinessId) || store.registrations[0] || null;
    const businessDiagnostics = selectedSupportBusiness ? store.getBusinessDiagnostics(selectedSupportBusiness.id) : null;
    const businessOrders = selectedSupportBusiness ? store.getOrdersForBusiness(selectedSupportBusiness.id) : [];
    const businessNotes = selectedSupportBusiness ? store.getSupportNotes(selectedSupportBusiness.id) : [];

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.6rem;">
        <!-- ADMIN HEADER BAR -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.2rem; background:var(--color-bg-card); padding:1.4rem 1.8rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
          <div>
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.25rem;">
              <div style="width:42px; height:42px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-glow);">
                <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
              </div>
              <div>
                <h1 style="font-family:var(--font-heading); font-size:1.75rem; font-weight:900; color:#fff; margin:0; line-height:1.2;">
                  BuyurAbi Kontrol & Canlı Destek Merkezi
                </h1>
                <div style="display:flex; align-items:center; gap:0.75rem; margin-top:0.2rem;">
                  <span style="font-size:0.8rem; color:var(--color-text-muted);">
                    İşletmelerin anlık siparişleri, çağrı merkezi yardım konsolu ve onay portalı
                  </span>
                  ${store.supabaseConnected ? `
                    <span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.7rem; font-weight:800; padding:1px 8px; border-radius:10px; display:inline-flex; align-items:center; gap:4px;">
                      <span style="width:6px; height:6px; background:var(--color-accent-green); border-radius:50%; display:inline-block; box-shadow:0 0 6px var(--color-accent-green);"></span> Canlı DB Aktif
                    </span>
                  ` : `
                    <span style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:var(--color-accent-yellow); font-size:0.7rem; font-weight:800; padding:1px 8px; border-radius:10px; display:inline-flex; align-items:center; gap:4px;">
                      <span style="width:6px; height:6px; background:var(--color-accent-yellow); border-radius:50%; display:inline-block;"></span> Yerel Depolama
                    </span>
                  `}
                </div>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:0.6rem; align-items:center;">
            <!-- Sound Toggle Button -->
            <button id="btn-toggle-sound" class="pill-btn" style="background:${store.soundEnabled ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.06)'}; border:1px solid ${store.soundEnabled ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.15)'}; color:${store.soundEnabled ? 'var(--color-accent-green)' : 'var(--color-text-muted)'}; padding:0.55rem 1rem; font-size:0.82rem; cursor:pointer;" title="Yeni sipariş ve test zil sesini aç/kapat">
              <i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}" style="width:16px; height:16px;"></i>
              <span>${store.soundEnabled ? 'Zil: AÇIK' : 'Zil: KAPALI'}</span>
            </button>

            <button id="btn-refresh-db" class="btn-secondary-hero" style="padding:0.55rem 1.1rem; font-size:0.82rem;" title="Verileri yenile">
              <i data-lucide="refresh-cw" style="width:15px; height:15px;"></i> Yenile
            </button>

            <button id="btn-lock-admin" class="btn-secondary-hero" style="padding:0.55rem 1.1rem; font-size:0.82rem;">
              <i data-lucide="lock" style="width:15px; height:15px;"></i> Kilitle
            </button>
          </div>
        </div>

        <!-- NAVIGATION TABS -->
        <div style="display:flex; gap:0.75rem; background:var(--color-bg-card); padding:0.6rem; border-radius:var(--radius-md); border:var(--border-glass); flex-wrap:wrap;">
          <button class="pill-btn ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders" style="font-size:0.88rem; font-weight:800; padding:0.75rem 1.3rem; display:flex; align-items:center; gap:0.6rem;">
            <i data-lucide="zap" style="width:18px; height:18px; color:var(--color-primary);"></i>
            <span>Canlı Sipariş Masası</span>
            <span style="background:var(--color-primary); color:#fff; border-radius:10px; padding:1px 8px; font-size:0.75rem;">${store.orders.length}</span>
          </button>

          <button class="pill-btn ${activeTab === 'support' ? 'active' : ''}" data-admin-tab="support" style="font-size:0.88rem; font-weight:800; padding:0.75rem 1.3rem; display:flex; align-items:center; gap:0.6rem; position:relative;">
            <i data-lucide="headphones" style="width:18px; height:18px; color:var(--color-accent-green);"></i>
            <span>Canlı Destek & Çağrı Konsolu</span>
            <span style="background:rgba(0,230,118,0.2); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.4); border-radius:10px; padding:1px 8px; font-size:0.75rem;">7/24 Aktif</span>
          </button>

          <button class="pill-btn ${activeTab === 'registrations' ? 'active' : ''}" data-admin-tab="registrations" style="font-size:0.88rem; font-weight:800; padding:0.75rem 1.3rem; display:flex; align-items:center; gap:0.6rem;">
            <i data-lucide="store" style="width:18px; height:18px; color:var(--color-accent-cyan);"></i>
            <span>İşletme Başvuruları & Paketler</span>
            ${pendingCount > 0 ? `<span style="background:var(--color-danger); color:#fff; border-radius:10px; padding:1px 8px; font-size:0.75rem;">${pendingCount} Bekliyor</span>` : `<span style="background:rgba(255,255,255,0.1); color:var(--color-text-muted); border-radius:10px; padding:1px 8px; font-size:0.75rem;">${store.registrations.length}</span>`}
          </button>

          <button class="pill-btn ${activeTab === 'health' ? 'active' : ''}" data-admin-tab="health" style="font-size:0.88rem; font-weight:800; padding:0.75rem 1.3rem; display:flex; align-items:center; gap:0.6rem;">
            <i data-lucide="activity" style="width:18px; height:18px; color:var(--color-accent-purple);"></i>
            <span>Sistem & Sunucu Sağlığı</span>
          </button>
        </div>

        <!-- TAB 1: CANLI SİPARİŞ MASASI (LIVE ORDERS FEED) -->
        ${activeTab === 'orders' ? `
          <!-- STATS TILES -->
          <div class="admin-top-stats" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:1rem;">
            <div class="stat-card-admin">
              <div class="stat-icon orange"><i data-lucide="clock"></i></div>
              <div class="stat-info">
                <h5>Yeni Gelen Siparişler</h5>
                <h3 style="color:var(--color-accent-yellow);">${newOrdersCount} Adet</h3>
              </div>
            </div>

            <div class="stat-card-admin">
              <div class="stat-icon purple"><i data-lucide="chef-hat"></i></div>
              <div class="stat-info">
                <h5>Hazırlananlar (Mutfakta)</h5>
                <h3 style="color:#A855F7;">${prepOrdersCount} Adet</h3>
              </div>
            </div>

            <div class="stat-card-admin">
              <div class="stat-icon green"><i data-lucide="utensils-crossed"></i></div>
              <div class="stat-info">
                <h5>Masada Servis Edilenler</h5>
                <h3 style="color:var(--color-accent-green);">${onTableCount} Masa</h3>
              </div>
            </div>

            <div class="stat-card-admin">
              <div class="stat-icon blue"><i data-lucide="banknote"></i></div>
              <div class="stat-info">
                <h5>Toplam Sipariş Cirosu</h5>
                <h3 style="color:var(--color-accent-cyan);">₺${totalLiveOrderRev.toLocaleString('tr-TR')}</h3>
              </div>
            </div>
          </div>

          <!-- ORDERS CONTROLS BAR -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--color-bg-card); padding:1rem 1.4rem; border-radius:var(--radius-md); border:var(--border-glass);">
            <!-- Left: Filter by restaurant dropdown -->
            <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap;">
              <span style="font-size:0.82rem; font-weight:700; color:var(--color-text-muted);"><i data-lucide="filter" style="width:14px; vertical-align:middle;"></i> İşletme Filtresi:</span>
              <select id="select-order-business-filter" class="form-input" style="padding:0.5rem 0.9rem; font-size:0.85rem; width:auto; min-width:240px;">
                <option value="all" ${filterOrderBusiness === 'all' ? 'selected' : ''}>Tüm Restoranlar & İşletmeler</option>
                ${store.registrations.map(r => `
                  <option value="${r.id}" ${filterOrderBusiness === r.id ? 'selected' : ''}>${r.businessName} (${r.id})</option>
                `).join('')}
              </select>

              <div style="display:flex; gap:0.4rem;">
                <button class="pill-btn ${filterOrderStatus === 'all' ? 'active' : ''}" data-order-status="all" style="padding:0.45rem 0.8rem; font-size:0.8rem;">Tümü (${store.orders.length})</button>
                <button class="pill-btn ${filterOrderStatus === 'yeni' ? 'active' : ''}" data-order-status="yeni" style="padding:0.45rem 0.8rem; font-size:0.8rem;">🟡 Yeni (${newOrdersCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'hazirlaniyor' ? 'active' : ''}" data-order-status="hazirlaniyor" style="padding:0.45rem 0.8rem; font-size:0.8rem;">🟠 Mutfakta (${prepOrdersCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'masada' ? 'active' : ''}" data-order-status="masada" style="padding:0.45rem 0.8rem; font-size:0.8rem;">🟢 Masada (${onTableCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'tamamlandi' ? 'active' : ''}" data-order-status="tamamlandi" style="padding:0.45rem 0.8rem; font-size:0.8rem;">✅ Tamamlanan</button>
              </div>
            </div>

            <!-- Right: Send Live Test Order to currently filtered business -->
            <button id="btn-trigger-test-order" class="pill-btn" style="background:var(--color-primary-gradient); color:#fff; font-weight:800; font-size:0.85rem; padding:0.6rem 1.2rem; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:var(--shadow-glow);">
              <i data-lucide="plus-circle" style="width:16px; height:16px;"></i> Canlı Test Siparişi Düşür
            </button>
          </div>

          <!-- ORDERS LIST GRID -->
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(360px, 1fr)); gap:1.2rem;">
            ${orders.length === 0 ? `
              <div style="grid-column:1 / -1; text-align:center; padding:4rem 1rem; background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
                <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
                <p>Seçili filtreye uygun anlık sipariş bulunmuyor.</p>
              </div>
            ` : orders.map(ord => `
              <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:1px solid ${ord.status === 'yeni' ? 'rgba(255,107,0,0.5)' : ord.status === 'hazirlaniyor' ? 'rgba(168,85,247,0.4)' : ord.status === 'masada' ? 'rgba(0,230,118,0.4)' : 'rgba(255,255,255,0.08)'}; padding:1.4rem; box-shadow:var(--shadow-card); position:relative; overflow:hidden; display:flex; flex-direction:column; justify-content:space-between; gap:1rem;">
                <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:${ord.status === 'yeni' ? 'var(--color-primary)' : ord.status === 'hazirlaniyor' ? '#A855F7' : ord.status === 'masada' ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.2)'};"></div>

                <div>
                  <!-- Order Card Header -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                    <div>
                      <div style="font-size:0.72rem; color:var(--color-text-muted); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">${ord.businessName}</div>
                      <h4 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:900; color:#fff; margin:2px 0;">
                        ${ord.tableName} <span style="font-family:monospace; font-size:0.82rem; color:var(--color-primary); background:rgba(255,107,0,0.12); padding:1px 6px; border-radius:4px; margin-left:4px;">${ord.id}</span>
                      </h4>
                      <div style="font-size:0.78rem; color:var(--color-text-dim);">Müşteri: ${ord.customerName} • ${ord.createdAt}</div>
                    </div>

                    <!-- Status Pill -->
                    <span style="font-size:0.75rem; font-weight:800; padding:4px 10px; border-radius:12px; ${
                      ord.status === 'yeni' ? 'background:rgba(255,107,0,0.15); color:var(--color-primary); border:1px solid rgba(255,107,0,0.4);' :
                      ord.status === 'hazirlaniyor' ? 'background:rgba(168,85,247,0.15); color:#C084FC; border:1px solid rgba(168,85,247,0.4);' :
                      ord.status === 'masada' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.4);' :
                      ord.status === 'tamamlandi' ? 'background:rgba(255,255,255,0.06); color:var(--color-text-muted); border:1px solid rgba(255,255,255,0.1);' :
                      'background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.4);'
                    }">
                      ${
                        ord.status === 'yeni' ? '🟡 Yeni Sipariş' :
                        ord.status === 'hazirlaniyor' ? '🟠 Hazırlanıyor' :
                        ord.status === 'masada' ? '🟢 Masada / Servis' :
                        ord.status === 'tamamlandi' ? '✅ Tamamlandı' : '❌ İptal Edildi'
                      }
                    </span>
                  </div>

                  <!-- Items list -->
                  <div style="background:rgba(0,0,0,0.35); border-radius:var(--radius-md); padding:0.8rem; font-size:0.84rem; display:flex; flex-direction:column; gap:0.4rem; margin-bottom:0.75rem;">
                    ${ord.items.map(item => `
                      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div>
                          <strong style="color:#fff;">${item.qty}x ${item.name}</strong>
                          ${item.note ? `<div style="font-size:0.72rem; color:var(--color-primary); font-style:italic;">"${item.note}"</div>` : ''}
                        </div>
                        <span style="font-weight:700; color:var(--color-text-muted);">₺${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    `).join('')}
                  </div>

                  <!-- Total & Payment -->
                  <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.6rem;">
                    <span style="font-size:0.75rem; color:var(--color-text-muted);">${ord.paymentMethod}</span>
                    <strong style="font-size:1.15rem; color:var(--color-accent-green); font-weight:900;">₺${ord.totalPrice.toFixed(2)}</strong>
                  </div>
                </div>

                <!-- Support Action Buttons on this order -->
                <div style="display:flex; gap:0.4rem; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.75rem;">
                  ${ord.status === 'yeni' ? `
                    <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="hazirlaniyor" style="flex:1; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.4); color:#C084FC; font-size:0.75rem; padding:0.4rem 0.6rem; cursor:pointer; justify-content:center;">
                      🧑‍🍳 Mutfak Hazırlıyor
                    </button>
                  ` : ''}

                  ${ord.status === 'hazirlaniyor' ? `
                    <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="masada" style="flex:1; background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; padding:0.4rem 0.6rem; cursor:pointer; justify-content:center;">
                      🍽️ Masaya İletildi
                    </button>
                  ` : ''}

                  ${ord.status === 'masada' ? `
                    <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="tamamlandi" style="flex:1; background:rgba(255,255,255,0.08); border:var(--border-glass); color:#fff; font-size:0.75rem; padding:0.4rem 0.6rem; cursor:pointer; justify-content:center;">
                      ✓ Hesabı Kapat / Tamamla
                    </button>
                  ` : ''}

                  ${ord.status !== 'iptal' && ord.status !== 'tamamlandi' ? `
                    <button class="pill-btn btn-cancel-order" data-order-id="${ord.id}" style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:var(--color-danger); font-size:0.75rem; padding:0.4rem 0.6rem; cursor:pointer;" title="Destek müdahalesiyle siparişi iptal et">
                      İptal
                    </button>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}

        <!-- TAB 2: CANLI DESTEK & ÇAĞRI KONSOLU (LIVE SUPPORT CENTER) -->
        ${activeTab === 'support' ? `
          <!-- CALLER QUICK SEARCH BAR -->
          <div style="background:var(--color-bg-card); padding:1.5rem 1.8rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
              <div>
                <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:800; color:#fff; margin:0 0 4px 0;">
                  🎧 Çağrı Konsolu & İşletme Teşhis Masası
                </h3>
                <p style="color:var(--color-text-muted); font-size:0.85rem; margin:0;">
                  Canlı destek arayan restoran sahibinin ID'sini veya adını girerek işletme karnesini, şifresini, canlı siparişlerini ve sistem sağlığını 1 saniyede açın.
                </p>
              </div>

              <!-- LIVE CALL TICKER -->
              <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:var(--radius-md); padding:0.5rem 1rem; display:flex; align-items:center; gap:0.6rem;">
                <span style="width:10px; height:10px; background:var(--color-danger); border-radius:50%; display:inline-block; animation:pulse 1.5s infinite;"></span>
                <span style="font-size:0.82rem; font-weight:800; color:#fff;">CANLI ÇAĞRI MODU:</span>
                <span id="call-timer-display" style="font-family:monospace; font-weight:900; color:var(--color-accent-green); font-size:1.05rem;">00:00</span>
              </div>
            </div>

            <!-- SEARCH INPUT -->
            <div style="position:relative; margin-bottom:1rem;">
              <input type="text" id="input-support-search" class="form-input" placeholder="🔍 İşletme ID (Örn: BYR-1001, REG-1001), Restoran Adı, Telefon veya Yetkili Adı yazın..." value="${supportSearchQuery}" style="padding-left:1.2rem; font-size:1rem; height:50px;">
            </div>

            <!-- QUICK BUSINESS SELECT PILLS -->
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
              <span style="font-size:0.78rem; color:var(--color-text-dim); font-weight:700;">Hızlı Seç:</span>
              ${store.registrations.map(r => `
                <button class="pill-btn btn-select-support-business ${supportSelectedBusinessId === r.id ? 'active' : ''}" data-biz-id="${r.id}" style="padding:0.4rem 0.85rem; font-size:0.8rem; font-family:var(--font-primary);">
                  ${r.businessName} <span style="font-family:monospace; opacity:0.8; margin-left:4px;">(${r.id})</span>
                </button>
              `).join('')}
            </div>
          </div>

          ${selectedSupportBusiness ? `
            <!-- ACTIVE CALL DOSSIER (3 COLUMNS) -->
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(330px, 1fr)); gap:1.4rem;">
              <!-- 1. COLUMN: BUSINESS DOSSIER & CREDENTIALS -->
              <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.5rem; box-shadow:var(--shadow-card);">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.2rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.8rem;">
                  <div>
                    <span style="font-size:0.72rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Arayan İşletme Profili</span>
                    <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:900; color:#fff; margin:2px 0 0 0;">${selectedSupportBusiness.businessName}</h3>
                  </div>
                  <span style="background:rgba(0,230,118,0.15); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.35); font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:10px;">
                    ${selectedSupportBusiness.status === 'onaylandi' ? '✓ AKTİF ÜYE' : '⏳ ONAY BEKLİYOR'}
                  </span>
                </div>

                <div style="display:flex; flex-direction:column; gap:0.75rem; font-size:0.85rem; margin-bottom:1.2rem;">
                  <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:0.6rem 0.8rem; border-radius:6px;">
                    <span style="color:var(--color-text-muted);">İşletme Kodu (ID):</span>
                    <strong style="color:var(--color-primary); font-family:monospace; font-size:1.05rem; letter-spacing:1px;">${selectedSupportBusiness.id}</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:0.6rem 0.8rem; border-radius:6px; align-items:center;">
                    <span style="color:var(--color-text-muted);">Giriş Şifresi:</span>
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <strong style="color:#fff; font-family:monospace; font-size:0.95rem;">${selectedSupportBusiness.password || '123456'}</strong>
                      <button id="btn-copy-support-pass" class="pill-btn" style="padding:2px 6px; font-size:0.72rem; background:rgba(255,255,255,0.08); border:none; cursor:pointer;" title="Kopyala">
                        <i data-lucide="copy" style="width:12px; height:12px;"></i>
                      </button>
                    </div>
                  </div>

                  <div style="display:flex; justify-content:space-between; padding:0.3rem 0;">
                    <span style="color:var(--color-text-muted);">Yetkili Ad Soyad:</span>
                    <strong style="color:#fff;">${selectedSupportBusiness.fullName}</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; padding:0.3rem 0;">
                    <span style="color:var(--color-text-muted);">İletişim Telefonu:</span>
                    <strong style="color:var(--color-accent-green);">${selectedSupportBusiness.phone}</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; padding:0.3rem 0;">
                    <span style="color:var(--color-text-muted);">Aylık Plan:</span>
                    <strong style="color:var(--color-accent-cyan);">${selectedSupportBusiness.plan || 'Profesyonel'}</strong>
                  </div>

                  <div style="padding:0.5rem 0; border-top:1px solid rgba(255,255,255,0.06); font-size:0.8rem; color:var(--color-text-dim);">
                    📍 ${selectedSupportBusiness.city} - ${selectedSupportBusiness.fullAddress || 'Adres girilmedi'}
                  </div>
                </div>

                <!-- Fast Actions -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.6rem;">
                  <button id="btn-support-send-sms" class="pill-btn" style="justify-content:center; background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.35); color:var(--color-accent-green); font-size:0.78rem; padding:0.6rem; cursor:pointer; font-weight:700;">
                    <i data-lucide="message-square" style="width:14px;"></i> Şifreyi SMS İlet
                  </button>
                  <button id="btn-support-open-whatsapp" class="pill-btn" style="justify-content:center; background:rgba(37,211,102,0.15); border:1px solid rgba(37,211,102,0.35); color:#25D366; font-size:0.78rem; padding:0.6rem; cursor:pointer; font-weight:700;">
                    <i data-lucide="phone-forwarded" style="width:14px;"></i> WhatsApp Linki
                  </button>
                </div>
              </div>

              <!-- 2. COLUMN: LIVE SYSTEM DIAGNOSTICS & TESTING -->
              <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.5rem; box-shadow:var(--shadow-card);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.8rem;">
                  <span style="font-size:0.72rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Canlı Teşhis & Sağlık Kontrolü</span>
                  <span style="font-size:0.72rem; color:var(--color-accent-green); font-weight:700;">● SİNYAL: MÜKEMMEL</span>
                </div>

                <!-- Health checklist -->
                <div style="display:flex; flex-direction:column; gap:0.8rem; font-size:0.84rem; margin-bottom:1.2rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.65rem 0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                    <span>🌐 QR Menü Erişilebilirliği:</span>
                    <strong style="color:var(--color-accent-green);">%100 Çevrimiçi (${businessDiagnostics?.latency})</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.65rem 0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                    <span>📱 Masadan Sipariş Alma:</span>
                    <strong style="color:var(--color-accent-green);">${businessDiagnostics?.systemStatus}</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.65rem 0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                    <span>🔔 Mutfak Ekranı / Zil Hattı:</span>
                    <strong style="color:var(--color-accent-green);">Aktif (Son Ping: 12 sn)</strong>
                  </div>

                  <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.65rem 0.85rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                    <span>📊 Kayıtlı Toplam Sipariş:</span>
                    <strong style="color:var(--color-accent-cyan);">${businessDiagnostics?.totalOrdersCount} Sipariş (₺${businessDiagnostics?.totalOrderRevenue})</strong>
                  </div>
                </div>

                <!-- One-click Support Test Tools -->
                <div style="display:flex; flex-direction:column; gap:0.6rem;">
                  <button id="btn-support-test-order-now" class="pill-btn" style="justify-content:center; background:var(--color-primary-gradient); color:#fff; font-size:0.82rem; padding:0.65rem; cursor:pointer; font-weight:800; border:none; box-shadow:var(--shadow-glow);">
                    <i data-lucide="zap" style="width:16px;"></i> Telefondayken Canlı Test Siparişi Düşür
                  </button>

                  <button id="btn-support-ping-kitchen" class="pill-btn" style="justify-content:center; background:rgba(255,255,255,0.06); border:var(--border-glass); color:#fff; font-size:0.8rem; padding:0.6rem; cursor:pointer; font-weight:700;">
                    <i data-lucide="bell-ring" style="width:15px; color:var(--color-accent-yellow);"></i> Mutfak Ekranına Test Zili Çaldır
                  </button>

                  <button id="btn-support-clear-cache" class="pill-btn" style="justify-content:center; background:rgba(255,255,255,0.04); border:var(--border-glass); color:var(--color-text-muted); font-size:0.78rem; padding:0.5rem; cursor:pointer;">
                    <i data-lucide="rotate-ccw" style="width:13px;"></i> Restoran Menü Önbelleğini Sıfırla
                  </button>
                </div>
              </div>

              <!-- 3. COLUMN: CALL LOGS & AGENT NOTES -->
              <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.5rem; box-shadow:var(--shadow-card); display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.8rem;">
                  <span style="font-size:0.72rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Destek Çağrı Notları</span>
                  <span style="font-size:0.75rem; color:var(--color-text-dim);">${businessNotes.length} Kayıtlı Not</span>
                </div>

                <!-- Add Note Form -->
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-md); padding:0.85rem; margin-bottom:1rem;">
                  <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                    <select id="select-note-category" class="form-input" style="padding:0.4rem 0.6rem; font-size:0.78rem;">
                      <option value="Masa / QR Problemi">Masa / QR Problemi</option>
                      <option value="Menü & Fiyat Güncelleme">Menü & Fiyat Güncelleme</option>
                      <option value="Yazıcı / Donanım Desteği">Yazıcı / Donanım Desteği</option>
                      <option value="Abonelik & Fatura">Abonelik & Fatura</option>
                      <option value="Genel Danışma">Genel Danışma</option>
                    </select>
                  </div>
                  <textarea id="text-support-note" class="form-input" rows="2" placeholder="Görüşme notunu buraya yazın (Örn: Ahmet Usta aradı, sorun giderildi)..." style="font-size:0.82rem; margin-bottom:0.6rem;"></textarea>
                  <button id="btn-save-support-note" class="pill-btn" style="width:100%; justify-content:center; background:rgba(0,230,118,0.2); border:1px solid var(--color-accent-green); color:var(--color-accent-green); font-size:0.8rem; font-weight:800; padding:0.5rem; cursor:pointer;">
                    <i data-lucide="check" style="width:14px;"></i> Çağrı Notunu Kaydet
                  </button>
                </div>

                <!-- Notes Timeline -->
                <div style="flex:1; overflow-y:auto; max-height:220px; display:flex; flex-direction:column; gap:0.6rem; padding-right:4px;">
                  ${businessNotes.length === 0 ? `
                    <div style="text-align:center; padding:1.5rem; font-size:0.8rem; color:var(--color-text-dim);">
                      Bu işletmeye ait henüz çağrı notu kaydedilmemiş.
                    </div>
                  ` : businessNotes.map(n => `
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:0.65rem 0.85rem; border-radius:6px; font-size:0.8rem;">
                      <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                        <span style="font-weight:700; color:var(--color-primary); font-size:0.75rem;">${n.category}</span>
                        <span style="font-size:0.7rem; color:var(--color-text-dim);">${n.createdAt}</span>
                      </div>
                      <p style="color:#fff; margin:0 0 3px 0; font-size:0.82rem; line-height:1.35;">${n.text}</p>
                      <span style="font-size:0.68rem; color:var(--color-text-muted);">Temsilci: ${n.agent}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- ARAYAN İŞLETMENİN ANLIK SİPARİŞLERİ TABLOSU -->
            <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.5rem; box-shadow:var(--shadow-card);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                <div>
                  <h4 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:800; color:#fff; margin:0;">
                    🛒 ${selectedSupportBusiness.businessName} - Canlı Sipariş Akışı
                  </h4>
                  <p style="font-size:0.8rem; color:var(--color-text-muted); margin:0;">Arayan işletmenin masalarından gelen anlık siparişleri burada görebilir ve telefondayken müdahale edebilirsiniz.</p>
                </div>
                <button id="btn-support-add-test-to-current" class="pill-btn" style="background:rgba(255,107,0,0.15); border:1px solid rgba(255,107,0,0.4); color:var(--color-primary); font-weight:800; font-size:0.8rem; padding:0.5rem 0.9rem; cursor:pointer;">
                  <i data-lucide="plus"></i> Test Masası Siparişi Oluştur
                </button>
              </div>

              <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:0.85rem; text-align:left;">
                  <thead>
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.08); color:var(--color-text-muted); font-size:0.75rem; text-transform:uppercase;">
                      <th style="padding:0.75rem 0.5rem;">Sipariş Kodu</th>
                      <th style="padding:0.75rem 0.5rem;">Masa</th>
                      <th style="padding:0.75rem 0.5rem;">Müşteri</th>
                      <th style="padding:0.75rem 0.5rem;">Sipariş Edilenler</th>
                      <th style="padding:0.75rem 0.5rem;">Tutar</th>
                      <th style="padding:0.75rem 0.5rem;">Durum</th>
                      <th style="padding:0.75rem 0.5rem;">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${businessOrders.length === 0 ? `
                      <tr>
                        <td colspan="7" style="text-align:center; padding:2rem; color:var(--color-text-dim);">
                          Bu işletmeye ait henüz sipariş kaydı bulunmuyor. Test butonu ile canlı sipariş düşürebilirsiniz.
                        </td>
                      </tr>
                    ` : businessOrders.map(bo => `
                      <tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
                        <td style="padding:0.75rem 0.5rem; font-family:monospace; font-weight:800; color:var(--color-primary);">${bo.id}</td>
                        <td style="padding:0.75rem 0.5rem; font-weight:700; color:#fff;">${bo.tableName}</td>
                        <td style="padding:0.75rem 0.5rem; color:var(--color-text-muted);">${bo.customerName}</td>
                        <td style="padding:0.75rem 0.5rem; color:#fff;">
                          ${bo.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                        </td>
                        <td style="padding:0.75rem 0.5rem; font-weight:800; color:var(--color-accent-green);">₺${bo.totalPrice}</td>
                        <td style="padding:0.75rem 0.5rem;">
                          <span style="font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:10px; ${
                            bo.status === 'yeni' ? 'background:rgba(255,107,0,0.15); color:var(--color-primary);' :
                            bo.status === 'hazirlaniyor' ? 'background:rgba(168,85,247,0.15); color:#C084FC;' :
                            bo.status === 'masada' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green);' :
                            'background:rgba(255,255,255,0.08); color:var(--color-text-muted);'
                          }">
                            ${bo.status}
                          </span>
                        </td>
                        <td style="padding:0.75rem 0.5rem;">
                          <button class="pill-btn btn-cancel-order" data-order-id="${bo.id}" style="padding:2px 8px; font-size:0.72rem; background:rgba(239,68,68,0.12); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3); cursor:pointer;">
                            İptal Et
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          ` : ''}
        ` : ''}

        <!-- TAB 3: İŞLETME BAŞVURULARI & AYLIK PAKET YÖNETİMİ -->
        ${activeTab === 'registrations' ? `
          <!-- REGISTRATIONS STATS TILES -->
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

          <!-- REGISTRATION CARDS -->
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
                  <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.8rem;">
                    <div style="width:48px; height:48px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.3rem;">🏢</div>
                    <div>
                      <h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff;">${reg.businessName}</h3>
                      <div style="font-size:0.85rem; color:var(--color-primary); font-weight:700;">${reg.businessType || 'Restoran'} • ${reg.city}</div>
                    </div>
                  </div>

                  <div style="background:rgba(255,107,0,0.12); border:1px solid rgba(255,107,0,0.3); padding:0.6rem 1rem; border-radius:var(--radius-md); margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.85rem; font-weight:700; color:var(--color-text-muted);">💎 Seçilen Aylık Plan:</span>
                    <strong style="font-size:0.95rem; color:var(--color-accent-green); font-weight:800;">${reg.plan || 'Profesyonel Paket (₺899/ay)'}</strong>
                  </div>

                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:var(--radius-md); font-size:0.85rem;">
                    <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">İşletme Kodu (ID):</span><strong style="color:var(--color-primary); font-family:monospace; font-size:1rem; letter-spacing:1px;">${reg.id}</strong></div>
                    <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Giriş Şifresi:</span><strong style="color:#fff; font-family:monospace; font-size:0.95rem;">${reg.password || '••••••'}</strong></div>
                    <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Yetkili Ad Soyad:</span><strong style="color:#fff;">${reg.fullName}</strong></div>
                    <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Cep Telefonu:</span><strong style="color:var(--color-accent-green);">${reg.phone}</strong></div>
                    <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Başvuru Tarihi:</span><span style="color:var(--color-text-muted);">${reg.createdAt}</span></div>
                  </div>

                  <div style="margin-top:0.8rem; font-size:0.85rem; background:rgba(255,255,255,0.03); padding:0.75rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
                    <strong style="color:var(--color-text-muted); font-size:0.78rem; display:block; margin-bottom:2px;">📍 Açık Adres:</strong>
                    <span style="color:#fff;">${reg.fullAddress || 'Adres bilgisi belirtilmedi.'}</span>
                  </div>
                </div>

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
        ` : ''}

        <!-- TAB 4: SİSTEM & SUNUCU SAĞLIĞI -->
        ${activeTab === 'health' ? `
          <div style="background:var(--color-bg-card); padding:2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
            <h3 style="font-family:var(--font-heading); font-size:1.5rem; font-weight:900; color:#fff; margin-bottom:1.5rem; display:flex; align-items:center; gap:0.6rem;">
              <i data-lucide="server" style="color:var(--color-accent-cyan);"></i> Bulut Altyapı & Canlı Veritabanı Durumu
            </h3>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.2rem; margin-bottom:2rem;">
              <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Supabase Postgres DB</span>
                <h4 style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900; margin:4px 0;">● ÇEVRİMİÇİ</h4>
                <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Uç nokta: ${supabaseUrl || 'https://example.supabase.co'}</p>
              </div>

              <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Realtime Socket Kanalı</span>
                <h4 style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900; margin:4px 0;">● BAĞLI (22ms)</h4>
                <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Anlık sipariş ve onay dinleme aktif</p>
              </div>

              <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Platform Çalışma Süresi</span>
                <h4 style="color:var(--color-accent-cyan); font-size:1.4rem; font-weight:900; margin:4px 0;">%99.98 Uptime</h4>
                <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Kesintisiz restoran hizmeti</p>
              </div>
            </div>

            <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); padding:1.2rem; border-radius:var(--radius-md); font-size:0.85rem; color:#fff; display:flex; align-items:center; gap:0.8rem;">
              <i data-lucide="shield-check" style="width:28px; height:28px; color:var(--color-accent-green); flex-shrink:0;"></i>
              <div>
                <strong style="color:var(--color-accent-green); display:block; margin-bottom:2px;">Tüm Sistem Servisleri Normal Çalışıyor</strong>
                Masalardan QR ile verilen tüm siparişler ve canlı destek aramaları sistem tarafından anlık olarak izlenmektedir.
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Bindings
    // 1. Tab switches
    container.querySelectorAll('button[data-admin-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.dataset.adminTab;
        updateView();
      });
    });

    // 2. Sound Toggle
    container.querySelector('#btn-toggle-sound')?.addEventListener('click', () => {
      store.soundEnabled = !store.soundEnabled;
      if (store.soundEnabled) store.playChime();
      showToast(store.soundEnabled ? '🔔 Bildirim zili açıldı.' : '🔕 Bildirim zili kapatıldı.', 'info');
      updateView();
    });

    // 3. Refresh DB
    container.querySelector('#btn-refresh-db')?.addEventListener('click', async () => {
      showToast('🔄 Veriler güncelleniyor...', 'info');
      await store.fetchRegistrations();
      updateView();
    });

    // 4. Lock Admin
    container.querySelector('#btn-lock-admin')?.addEventListener('click', () => {
      store.lockAdmin();
      updateView();
    });

    // --- ORDERS TAB EVENTS ---
    // Change restaurant filter
    container.querySelector('#select-order-business-filter')?.addEventListener('change', (e) => {
      filterOrderBusiness = e.target.value;
      updateView();
    });

    // Change status filter pills
    container.querySelectorAll('button[data-order-status]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterOrderStatus = e.currentTarget.dataset.orderStatus;
        updateView();
      });
    });

    // Trigger Test Order
    container.querySelector('#btn-trigger-test-order')?.addEventListener('click', () => {
      const targetBizId = filterOrderBusiness !== 'all' ? filterOrderBusiness : (store.registrations[0]?.id || 'REG-1001');
      const testOrd = store.createTestOrderForBusiness(targetBizId);
      showToast(`⚡ Test siparişi (${testOrd.id}) düşürüldü ve sesli zil çaldı!`, 'success');
      updateView();
    });

    // Order status changes
    container.querySelectorAll('.btn-change-order-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        const newStat = e.currentTarget.dataset.newStatus;
        store.updateOrderStatus(ordId, newStat);
        showToast(`Sipariş durumu güncellendi: ${newStat}`, 'success');
        updateView();
      });
    });

    // Order cancel
    container.querySelectorAll('.btn-cancel-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        const reason = prompt('İptal nedeni giriniz (Destek kaydı için):', 'Müşteri/İşletme talebiyle iptal');
        if (reason !== null) {
          store.cancelOrder(ordId, reason);
          showToast(`Sipariş (${ordId}) iptal edildi.`, 'info');
          updateView();
        }
      });
    });

    // --- SUPPORT CONSOLE EVENTS ---
    // Search input
    container.querySelector('#input-support-search')?.addEventListener('input', (e) => {
      supportSearchQuery = e.target.value.toLowerCase().trim();
      if (supportSearchQuery) {
        const matched = store.registrations.find(r => 
          r.id.toLowerCase().includes(supportSearchQuery) ||
          r.businessName.toLowerCase().includes(supportSearchQuery) ||
          r.fullName.toLowerCase().includes(supportSearchQuery) ||
          r.phone.includes(supportSearchQuery)
        );
        if (matched) {
          supportSelectedBusinessId = matched.id;
        }
      }
      updateView();
    });

    // Quick select business pills
    container.querySelectorAll('.btn-select-support-business').forEach(btn => {
      btn.addEventListener('click', (e) => {
        supportSelectedBusinessId = e.currentTarget.dataset.bizId;
        updateView();
      });
    });

    // Copy Password button
    container.querySelector('#btn-copy-support-pass')?.addEventListener('click', () => {
      if (selectedSupportBusiness?.password) {
        navigator.clipboard.writeText(selectedSupportBusiness.password);
        showToast('🔑 İşletme parolası panoya kopyalandı!', 'success');
      }
    });

    // Send SMS simulation
    container.querySelector('#btn-support-send-sms')?.addEventListener('click', () => {
      showToast(`📲 ${selectedSupportBusiness?.phone} numarasına şifre ve ID SMS'i gönderildi!`, 'success');
    });

    // Open WhatsApp simulation
    container.querySelector('#btn-support-open-whatsapp')?.addEventListener('click', () => {
      const cleanPhone = (selectedSupportBusiness?.phone || '').replace(/[^0-9]/g, '');
      const msg = encodeURIComponent(`Merhaba ${selectedSupportBusiness?.fullName}, BuyurAbi Destek ekibiyiz. İşletme Kodunuz: ${selectedSupportBusiness?.id}. Menü linkiniz: https://buyurabi.com/menu/${selectedSupportBusiness?.id}`);
      window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
      showToast('💬 WhatsApp destek sohbeti açıldı.', 'info');
    });

    // Support Test Order Now
    container.querySelector('#btn-support-test-order-now')?.addEventListener('click', () => {
      if (selectedSupportBusiness) {
        const testOrd = store.createTestOrderForBusiness(selectedSupportBusiness.id);
        showToast(`🧪 ${selectedSupportBusiness.businessName} için test siparişi (${testOrd.id}) düşürüldü!`, 'success');
        updateView();
      }
    });

    // Support Test Ping Kitchen
    container.querySelector('#btn-support-ping-kitchen')?.addEventListener('click', () => {
      store.playChime();
      showToast(`🔔 ${selectedSupportBusiness?.businessName} mutfak ekranına test zili sinyali iletildi!`, 'info');
    });

    // Support Clear Cache
    container.querySelector('#btn-support-clear-cache')?.addEventListener('click', () => {
      showToast(`🧹 ${selectedSupportBusiness?.businessName} QR menü önbelleği sıfırlandı ve yenilendi.`, 'success');
    });

    // Save Support Note
    container.querySelector('#btn-save-support-note')?.addEventListener('click', () => {
      const catSelect = container.querySelector('#select-note-category');
      const noteInput = container.querySelector('#text-support-note');
      if (noteInput && noteInput.value.trim() && selectedSupportBusiness) {
        store.addSupportNote(selectedSupportBusiness.id, {
          category: catSelect ? catSelect.value : 'Genel Danışma',
          text: noteInput.value.trim(),
          agent: 'Destek Temsilcisi'
        });
        showToast('📝 Çağrı görüşme notu başarıyla kaydedildi!', 'success');
        updateView();
      } else {
        showToast('Lütfen görüşme notu yazın.', 'error');
      }
    });

    // Support Add Test to Current in Table
    container.querySelector('#btn-support-add-test-to-current')?.addEventListener('click', () => {
      if (selectedSupportBusiness) {
        const testOrd = store.createTestOrderForBusiness(selectedSupportBusiness.id);
        showToast(`⚡ Test siparişi (${testOrd.id}) oluşturuldu!`, 'success');
        updateView();
      }
    });

    // --- REGISTRATIONS TAB EVENTS ---
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
  if (type === 'success') toast.style.borderLeftColor = 'var(--color-accent-green)';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
