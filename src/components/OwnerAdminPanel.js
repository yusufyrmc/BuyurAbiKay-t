import { store } from '../state/store.js';
import { supabaseUrl } from '../lib/supabase.js';

export function renderOwnerAdminPanel(container) {
  let activeTab = 'orders'; // 'orders' | 'support' | 'registrations' | 'health'
  let ordersViewMode = 'grid'; // 'grid' | 'kanban'
  let filterRegStatus = 'all';
  let filterOrderStatus = 'all';
  let filterOrderBusiness = 'all';
  let orderSearchQuery = '';
  let supportSearchQuery = '';
  let supportSelectedBusinessId = store.registrations[0]?.id || null;
  let activeDetailOrder = null; // For modal inspection
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
    if (orderSearchQuery) {
      const q = orderSearchQuery.toLowerCase();
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.tableName.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.businessName.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return list;
  }

  function updateView() {
    // 1. PASSWORD PROTECTION LOCK SCREEN (Default: 123456)
    if (!store.adminUnlocked) {
      if (callTimerInterval) clearInterval(callTimerInterval);
      container.innerHTML = `
        <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding:2rem;">
          <div style="max-width:440px; width:100%; background:var(--color-bg-card); padding:2.8rem 2.2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:0 25px 60px rgba(0,0,0,0.7); text-align:center;">
            <div style="width:76px; height:76px; background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.4rem auto; border:2px solid var(--color-primary); box-shadow:var(--shadow-glow);">
              <i data-lucide="shield-alert" style="width:40px; height:40px;"></i>
            </div>

            <h2 style="font-family:var(--font-heading); font-size:1.85rem; font-weight:900; color:#fff; margin-bottom:0.5rem;">Sistem Sahibi Admin Girişi</h2>
            <p style="color:var(--color-text-muted); font-size:0.88rem; margin-bottom:1.8rem; line-height:1.4;">
              İşletmelerin anlık siparişlerini, canlı destek çağrı konsolunu ve restoran onaylarını yönetmek için şifrenizi girin.
            </p>

            <div style="margin-bottom:1.6rem;">
              <input type="password" id="admin-pass-input" placeholder="Yönetici Şifresi (Örn: 123456)" value="123456" style="width:100%; background:rgba(0,0,0,0.45); border:1px solid rgba(255,255,255,0.18); padding:1rem; border-radius:var(--radius-md); text-align:center; font-size:1.5rem; letter-spacing:6px; color:#fff; font-weight:800;">
              <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:0.6rem;">
                Varsayılan Yönetici Şifresi: <strong style="color:var(--color-primary);">123456</strong>
              </div>
            </div>

            <button id="btn-unlock-admin" class="btn-primary-hero" style="width:100%; justify-content:center; padding:0.9rem; font-size:1rem;">
              <i data-lucide="key-round"></i> Yönetim Panelini Aç
            </button>
          </div>
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

    // 2. MAIN FOCUSED ADMIN SIDEBAR DASHBOARD
    const regs = getFilteredRegistrations();
    const orders = getFilteredOrders();
    const pendingCount = store.getPendingCount();
    const approvedCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const totalMonthlyRev = store.getTotalMonthlyRevenue();

    const newOrdersCount = store.orders.filter(o => o.status === 'yeni').length;
    const prepOrdersCount = store.orders.filter(o => o.status === 'hazirlaniyor').length;
    const onTableCount = store.orders.filter(o => o.status === 'masada').length;
    const completedCount = store.orders.filter(o => o.status === 'tamamlandi').length;
    const totalLiveOrderRev = store.orders.filter(o => o.status !== 'iptal').reduce((sum, o) => sum + o.totalPrice, 0);

    // Selected business for support
    const selectedSupportBusiness = store.registrations.find(r => r.id === supportSelectedBusinessId) || store.registrations[0] || null;
    const businessDiagnostics = selectedSupportBusiness ? store.getBusinessDiagnostics(selectedSupportBusiness.id) : null;
    const businessOrders = selectedSupportBusiness ? store.getOrdersForBusiness(selectedSupportBusiness.id) : [];
    const businessNotes = selectedSupportBusiness ? store.getSupportNotes(selectedSupportBusiness.id) : [];

    container.innerHTML = `
      <div class="admin-layout-container">
        <!-- ==================== LEFT SIDEBAR ==================== -->
        <aside class="admin-sidebar">
          <div>
            <!-- Sidebar Header Brand -->
            <div style="display:flex; align-items:center; gap:0.85rem; padding-bottom:1.4rem; border-bottom:1px solid rgba(255,255,255,0.08);">
              <div style="width:44px; height:44px; background:var(--color-primary-gradient); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; color:#fff; box-shadow:var(--shadow-glow); flex-shrink:0;">
                <i data-lucide="shield-check" style="width:26px; height:26px;"></i>
              </div>
              <div style="min-width:0;">
                <div style="font-family:var(--font-heading); font-size:1.35rem; font-weight:900; color:#fff; letter-spacing:-0.5px; line-height:1.1;">
                  Buyur<span style="color:var(--color-primary);">Abi</span>
                </div>
                <span style="font-size:0.68rem; font-weight:800; letter-spacing:1px; color:var(--color-text-muted); text-transform:uppercase;">
                  KONTROL MERKEZİ
                </span>
              </div>
            </div>

            <!-- Database & Realtime status pill -->
            <div style="margin-top:1rem; padding:0.6rem 0.85rem; background:rgba(0,0,0,0.35); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; justify-content:space-between; font-size:0.75rem;">
              <span style="color:var(--color-text-dim);">Altyapı Durumu:</span>
              ${store.supabaseConnected ? `
                <span style="color:var(--color-accent-green); font-weight:800; display:flex; align-items:center; gap:5px;">
                  <span style="width:6px; height:6px; background:var(--color-accent-green); border-radius:50%; box-shadow:0 0 6px var(--color-accent-green);"></span> DB Canlı
                </span>
              ` : `
                <span style="color:var(--color-accent-yellow); font-weight:800; display:flex; align-items:center; gap:5px;">
                  <span style="width:6px; height:6px; background:var(--color-accent-yellow); border-radius:50%;"></span> Yerel Mod
                </span>
              `}
            </div>

            <!-- Sidebar Navigation Menu -->
            <nav class="admin-sidebar-nav">
              <button class="admin-nav-item ${activeTab === 'orders' ? 'active' : ''}" data-sidebar-tab="orders">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="zap" style="width:18px; height:18px;"></i>
                  <span>Canlı Sipariş Masası</span>
                </div>
                <span style="background:${newOrdersCount > 0 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}; color:#fff; border-radius:10px; padding:1px 8px; font-size:0.75rem; font-weight:800;">
                  ${store.orders.length}
                </span>
              </button>

              <button class="admin-nav-item ${activeTab === 'support' ? 'active' : ''}" data-sidebar-tab="support">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="headphones" style="width:18px; height:18px; color:var(--color-accent-green);"></i>
                  <span>Canlı Destek Masası</span>
                </div>
                <span style="background:rgba(0,230,118,0.2); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.4); border-radius:10px; padding:1px 7px; font-size:0.72rem; font-weight:800;">
                  7/24
                </span>
              </button>

              <button class="admin-nav-item ${activeTab === 'registrations' ? 'active' : ''}" data-sidebar-tab="registrations">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="store" style="width:18px; height:18px; color:var(--color-accent-cyan);"></i>
                  <span>İşletme Başvuruları</span>
                </div>
                ${pendingCount > 0 ? `
                  <span style="background:var(--color-danger); color:#fff; border-radius:10px; padding:1px 7px; font-size:0.72rem; font-weight:800;">
                    ${pendingCount} Bekliyor
                  </span>
                ` : `
                  <span style="background:rgba(255,255,255,0.08); color:var(--color-text-muted); border-radius:10px; padding:1px 7px; font-size:0.72rem;">
                    ${store.registrations.length}
                  </span>
                `}
              </button>

              <button class="admin-nav-item ${activeTab === 'health' ? 'active' : ''}" data-sidebar-tab="health">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="activity" style="width:18px; height:18px; color:var(--color-accent-purple);"></i>
                  <span>Sistem & Sunucu</span>
                </div>
                <span style="color:var(--color-accent-green); font-size:0.72rem; font-weight:800;">%99.9</span>
              </button>
            </nav>

            <!-- Quick Mini KPI Box in Sidebar -->
            <div style="margin-top:1.8rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-md); padding:0.9rem 1rem;">
              <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block; margin-bottom:0.6rem;">
                GÜNLÜK HIZLI ÖZET
              </span>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.4rem;">
                <span style="color:var(--color-text-dim);">Aktif Siparişler:</span>
                <strong style="color:var(--color-primary);">${newOrdersCount + prepOrdersCount + onTableCount} Adet</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:0.4rem;">
                <span style="color:var(--color-text-dim);">Toplam Ciro:</span>
                <strong style="color:var(--color-accent-green);">₺${totalLiveOrderRev.toLocaleString('tr-TR')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.8rem;">
                <span style="color:var(--color-text-dim);">Aktif Restoran:</span>
                <strong style="color:#fff;">${approvedCount} İşletme</strong>
              </div>
            </div>
          </div>

          <!-- Sidebar Footer User Card -->
          <div style="padding-top:1.2rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <div style="display:flex; align-items:center; gap:0.6rem;">
                <div style="width:34px; height:34px; border-radius:50%; background:var(--color-primary); color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:0.85rem;">
                  Y
                </div>
                <div>
                  <strong style="font-size:0.85rem; color:#fff; display:block; line-height:1.2;">Sistem Yöneticisi</strong>
                  <span style="font-size:0.72rem; color:var(--color-accent-green);">● Çevrimiçi</span>
                </div>
              </div>

              <!-- Sound Toggle -->
              <button id="btn-toggle-sound" class="pill-btn" style="padding:0.4rem; font-size:0.75rem; background:${store.soundEnabled ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.06)'}; color:${store.soundEnabled ? 'var(--color-accent-green)' : 'var(--color-text-muted)'}; border:1px solid ${store.soundEnabled ? 'rgba(0,230,118,0.35)' : 'rgba(255,255,255,0.1)'}; cursor:pointer;" title="${store.soundEnabled ? 'Zili Kapat' : 'Zili Aç'}">
                <i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}" style="width:15px; height:15px;"></i>
              </button>
            </div>

            <div style="display:flex; gap:0.5rem;">
              <button id="btn-lock-admin" class="btn-secondary-hero" style="flex:1; padding:0.55rem; font-size:0.78rem; justify-content:center;">
                <i data-lucide="lock" style="width:13px; height:13px;"></i> Kilitle
              </button>
              <a href="/index.html" class="btn-secondary-hero" style="padding:0.55rem 0.8rem; font-size:0.78rem; text-decoration:none; justify-content:center;" title="Kayıt Portalı">
                <i data-lucide="external-link" style="width:13px; height:13px;"></i>
              </a>
            </div>
          </div>
        </aside>

        <!-- ==================== MAIN CONTENT AREA ==================== -->
        <main class="admin-content-area">
          <!-- TOP CONTEXT HEADER -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--color-bg-card); padding:1.2rem 1.8rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
            <div>
              <h2 style="font-family:var(--font-heading); font-size:1.65rem; font-weight:900; color:#fff; margin:0;">
                ${
                  activeTab === 'orders' ? '⚡ Canlı Sipariş Masası & Sipariş Yönetimi' :
                  activeTab === 'support' ? '🎧 Canlı Destek & Müşteri Çağrı Konsolu' :
                  activeTab === 'registrations' ? '🏢 İşletme Kayıt Başvuruları & Paketler' :
                  '📊 Bulut Sunucu & Sistem Altyapı Sağlığı'
                }
              </h2>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin:2px 0 0 0;">
                ${
                  activeTab === 'orders' ? 'İşletmelerin masalarından anlık gelen siparişler, hazırlık süreleri ve sipariş silme/müdahale merkezi' :
                  activeTab === 'support' ? 'Destek arayan restoranların anında teşhisi, parola hatırlatması ve canlı test siparişi' :
                  activeTab === 'registrations' ? 'Gelen restoran başvurularını inceleyin, seçtikleri aylık paketleri onaylayın' :
                  'Postgres veritabanı, Realtime web soket ve platform uptime istatistikleri'
                }
              </p>
            </div>

            <div style="display:flex; align-items:center; gap:0.6rem;">
              <button id="btn-refresh-db" class="btn-secondary-hero" style="padding:0.55rem 1.1rem; font-size:0.82rem;" title="Verileri yenile">
                <i data-lucide="refresh-cw" style="width:15px; height:15px;"></i> Verileri Yenile
              </button>
            </div>
          </div>

          <!-- ==================== TAB 1: CANLI SİPARİŞ MASASI ==================== -->
          ${activeTab === 'orders' ? `
            <!-- KPI STATS CARDS ROW -->
            <div class="admin-top-stats" style="grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem;">
              <div class="stat-card-admin">
                <div class="stat-icon orange"><i data-lucide="bell-ring"></i></div>
                <div class="stat-info">
                  <h5>Yeni Alınanlar</h5>
                  <h3 style="color:var(--color-accent-yellow);">${newOrdersCount} Sipariş</h3>
                </div>
              </div>

              <div class="stat-card-admin">
                <div class="stat-icon purple"><i data-lucide="flame"></i></div>
                <div class="stat-info">
                  <h5>Mutfakta Hazırlanan</h5>
                  <h3 style="color:#C084FC;">${prepOrdersCount} Sipariş</h3>
                </div>
              </div>

              <div class="stat-card-admin">
                <div class="stat-icon green"><i data-lucide="check-circle-2"></i></div>
                <div class="stat-info">
                  <h5>Masada / Serviste</h5>
                  <h3 style="color:var(--color-accent-green);">${onTableCount} Masa</h3>
                </div>
              </div>

              <div class="stat-card-admin">
                <div class="stat-icon blue"><i data-lucide="banknote"></i></div>
                <div class="stat-info">
                  <h5>Canlı Toplam Ciro</h5>
                  <h3 style="color:var(--color-accent-cyan);">₺${totalLiveOrderRev.toLocaleString('tr-TR')}</h3>
                </div>
              </div>
            </div>

            <!-- CLEAN SEARCH & FILTERS BAR -->
            <div style="background:var(--color-bg-card); padding:1rem 1.4rem; border-radius:var(--radius-md); border:var(--border-glass); display:flex; flex-direction:column; gap:0.85rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem;">
                <!-- Search bar -->
                <div style="position:relative; flex:1; min-width:240px; max-width:400px;">
                  <input type="text" id="input-order-search" class="form-input" placeholder="🔍 Sipariş no, masa, müşteri veya ürün ara..." value="${orderSearchQuery}" style="padding-left:1rem; height:42px; font-size:0.85rem;">
                </div>

                <!-- Restaurant Filter Selector -->
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:700;"><i data-lucide="store" style="width:14px; vertical-align:middle;"></i> Restoran:</span>
                  <select id="select-order-business-filter" class="form-input" style="padding:0.45rem 0.8rem; font-size:0.82rem; width:auto; min-width:220px; height:42px;">
                    <option value="all" ${filterOrderBusiness === 'all' ? 'selected' : ''}>Tüm Restoranlar (${store.orders.length})</option>
                    ${store.registrations.map(r => `
                      <option value="${r.id}" ${filterOrderBusiness === r.id ? 'selected' : ''}>${r.businessName} (${r.id})</option>
                    `).join('')}
                  </select>
                </div>

                <!-- View Mode Switcher (Grid vs Kanban) & Action Buttons -->
                <div style="display:flex; align-items:center; gap:0.6rem;">
                  <div style="display:flex; background:rgba(0,0,0,0.4); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.08); padding:3px;">
                    <button class="pill-btn btn-view-mode ${ordersViewMode === 'grid' ? 'active' : ''}" data-mode="grid" style="padding:0.35rem 0.7rem; font-size:0.75rem;" title="Izgara Görünümü">
                      <i data-lucide="layout-grid" style="width:14px;"></i> Izgara
                    </button>
                    <button class="pill-btn btn-view-mode ${ordersViewMode === 'kanban' ? 'active' : ''}" data-mode="kanban" style="padding:0.35rem 0.7rem; font-size:0.75rem;" title="Kanban Kolon Görünümü">
                      <i data-lucide="columns-3" style="width:14px;"></i> Kanban
                    </button>
                  </div>

                  <!-- Test Order Injector -->
                  <button id="btn-trigger-test-order" class="pill-btn" style="background:var(--color-primary-gradient); color:#fff; font-weight:800; font-size:0.82rem; padding:0.55rem 1rem; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:var(--shadow-glow);">
                    <i data-lucide="plus-circle" style="width:15px; height:15px;"></i> Test Siparişi Düşür
                  </button>

                  <!-- Clear Completed Button -->
                  <button id="btn-clear-completed-orders" class="pill-btn" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:var(--color-text-muted); font-size:0.78rem; padding:0.55rem 0.85rem; cursor:pointer;" title="Tamamlanmış veya iptal edilmiş siparişleri listeden kaldır">
                    <i data-lucide="archive" style="width:14px;"></i> Temizle
                  </button>
                </div>
              </div>

              <!-- Status Filter Pills -->
              <div style="display:flex; gap:0.4rem; flex-wrap:wrap; border-top:1px solid rgba(255,255,255,0.05); padding-top:0.65rem;">
                <button class="pill-btn ${filterOrderStatus === 'all' ? 'active' : ''}" data-order-status="all" style="padding:0.4rem 0.8rem; font-size:0.78rem;">Tümü (${store.orders.length})</button>
                <button class="pill-btn ${filterOrderStatus === 'yeni' ? 'active' : ''}" data-order-status="yeni" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(255,107,0,0.3);">🟡 Yeni Siparişler (${newOrdersCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'hazirlaniyor' ? 'active' : ''}" data-order-status="hazirlaniyor" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(168,85,247,0.3);">🟠 Mutfakta Hazırlanıyor (${prepOrdersCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'masada' ? 'active' : ''}" data-order-status="masada" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(0,230,118,0.3);">🟢 Masada / Serviste (${onTableCount})</button>
                <button class="pill-btn ${filterOrderStatus === 'tamamlandi' ? 'active' : ''}" data-order-status="tamamlandi" style="padding:0.4rem 0.8rem; font-size:0.78rem;">✅ Tamamlananlar (${completedCount})</button>
              </div>
            </div>

            <!-- ==================== ORDERS VIEW 1: CLEAN GRID VIEW ==================== -->
            ${ordersViewMode === 'grid' ? `
              <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(350px, 1fr)); gap:1.2rem;">
                ${orders.length === 0 ? `
                  <div style="grid-column:1 / -1; text-align:center; padding:4rem 1rem; background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
                    <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
                    <p style="font-size:0.95rem; margin:0;">Aramanıza veya filtreye uygun sipariş bulunamadı.</p>
                  </div>
                ` : orders.map(ord => `
                  <div class="order-card-compact" style="border-left:4px solid ${ord.status === 'yeni' ? 'var(--color-primary)' : ord.status === 'hazirlaniyor' ? '#A855F7' : ord.status === 'masada' ? 'var(--color-accent-green)' : 'rgba(255,255,255,0.2)'};">
                    <!-- Top header: Restoran, Masa, Durum & Sil Butonu -->
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.8rem;">
                      <div>
                        <div style="font-size:0.72rem; color:var(--color-primary); font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
                          ${ord.businessName}
                        </div>
                        <div style="display:flex; align-items:center; gap:0.5rem; margin-top:2px;">
                          <h4 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:900; color:#fff; margin:0;">
                            ${ord.tableName}
                          </h4>
                          <span style="font-family:monospace; font-size:0.78rem; font-weight:800; color:var(--color-text-muted); background:rgba(255,255,255,0.06); padding:2px 6px; border-radius:4px;">
                            ${ord.id}
                          </span>
                        </div>
                        <div style="font-size:0.75rem; color:var(--color-text-dim); margin-top:2px;">
                          ${ord.customerName} • ⏱️ ${ord.createdAt}
                        </div>
                      </div>

                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <span style="font-size:0.72rem; font-weight:800; padding:3px 9px; border-radius:10px; ${
                          ord.status === 'yeni' ? 'background:rgba(255,107,0,0.15); color:var(--color-primary); border:1px solid rgba(255,107,0,0.4);' :
                          ord.status === 'hazirlaniyor' ? 'background:rgba(168,85,247,0.15); color:#C084FC; border:1px solid rgba(168,85,247,0.4);' :
                          ord.status === 'masada' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.4);' :
                          ord.status === 'tamamlandi' ? 'background:rgba(255,255,255,0.06); color:var(--color-text-muted); border:1px solid rgba(255,255,255,0.1);' :
                          'background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.4);'
                        }">
                          ${
                            ord.status === 'yeni' ? '🟡 Yeni' :
                            ord.status === 'hazirlaniyor' ? '🟠 Mutfakta' :
                            ord.status === 'masada' ? '🟢 Masada' :
                            ord.status === 'tamamlandi' ? '✅ Tamam' : '❌ İptal'
                          }
                        </span>

                        <!-- DELETE ORDER BUTTON -->
                        <button class="pill-btn btn-delete-order" data-order-id="${ord.id}" style="padding:4px 7px; background:rgba(239,68,68,0.12); color:var(--color-danger); border:1px solid rgba(239,68,68,0.25); cursor:pointer;" title="Siparişi kalıcı olarak sil">
                          <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Items breakdown -->
                    <div style="background:rgba(0,0,0,0.35); border-radius:var(--radius-sm); padding:0.75rem 0.85rem; font-size:0.82rem; display:flex; flex-direction:column; gap:0.4rem; margin-bottom:0.85rem;">
                      ${ord.items.map(i => `
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                          <div>
                            <strong style="color:#fff;">${i.qty}x ${i.name}</strong>
                            ${i.note ? `<div style="font-size:0.72rem; color:var(--color-primary); font-style:italic;">"${i.note}"</div>` : ''}
                          </div>
                          <span style="font-weight:700; color:var(--color-text-muted);">₺${(i.price * i.qty).toFixed(2)}</span>
                        </div>
                      `).join('')}
                    </div>

                    <!-- Price & Actions Footer -->
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.75rem; margin-bottom:0.75rem;">
                      <span style="font-size:0.75rem; color:var(--color-text-muted);">${ord.paymentMethod}</span>
                      <strong style="font-size:1.25rem; color:var(--color-accent-green); font-weight:900;">₺${ord.totalPrice.toFixed(2)}</strong>
                    </div>

                    <!-- Quick status buttons & Detail Inspector -->
                    <div style="display:flex; gap:0.4rem; align-items:center;">
                      ${ord.status === 'yeni' ? `
                        <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="hazirlaniyor" style="flex:1; background:rgba(168,85,247,0.15); border:1px solid rgba(168,85,247,0.4); color:#C084FC; font-size:0.75rem; padding:0.45rem; cursor:pointer; justify-content:center; font-weight:700;">
                          🧑‍🍳 Mutfak Hazırlıyor
                        </button>
                      ` : ''}

                      ${ord.status === 'hazirlaniyor' ? `
                        <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="masada" style="flex:1; background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; padding:0.45rem; cursor:pointer; justify-content:center; font-weight:700;">
                          🍽️ Masaya İletildi
                        </button>
                      ` : ''}

                      ${ord.status === 'masada' ? `
                        <button class="pill-btn btn-change-order-status" data-order-id="${ord.id}" data-new-status="tamamlandi" style="flex:1; background:rgba(255,255,255,0.08); border:var(--border-glass); color:#fff; font-size:0.75rem; padding:0.45rem; cursor:pointer; justify-content:center; font-weight:700;">
                          ✓ Tamamla / Kapat
                        </button>
                      ` : ''}

                      <!-- Inspect Details Button -->
                      <button class="pill-btn btn-inspect-order" data-order-id="${ord.id}" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:#fff; font-size:0.75rem; padding:0.45rem 0.8rem; cursor:pointer;" title="Fiş ve detayları incele">
                        <i data-lucide="eye" style="width:13px; height:13px;"></i> Detay
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- ==================== ORDERS VIEW 2: KANBAN COLUMN VIEW ==================== -->
            ${ordersViewMode === 'kanban' ? `
              <div class="admin-kanban-grid">
                <!-- COLUMN 1: YENİ SİPARİŞLER -->
                <div class="kanban-col" style="border-top:3px solid var(--color-primary);">
                  <div class="kanban-col-header">
                    <strong style="color:var(--color-primary); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                      🟡 YENİ SİPARİŞLER (${orders.filter(o => o.status === 'yeni').length})
                    </strong>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    ${orders.filter(o => o.status === 'yeni').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Bekleyen yeni sipariş yok</div>'}
                  </div>
                </div>

                <!-- COLUMN 2: MUTFAKTA HAZIRLANIYOR -->
                <div class="kanban-col" style="border-top:3px solid #A855F7;">
                  <div class="kanban-col-header">
                    <strong style="color:#C084FC; font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                      🟠 MUTFAKTA HAZIRLANIYOR (${orders.filter(o => o.status === 'hazirlaniyor').length})
                    </strong>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    ${orders.filter(o => o.status === 'hazirlaniyor').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Hazırlanan sipariş yok</div>'}
                  </div>
                </div>

                <!-- COLUMN 3: MASADA SERVİSTE -->
                <div class="kanban-col" style="border-top:3px solid var(--color-accent-green);">
                  <div class="kanban-col-header">
                    <strong style="color:var(--color-accent-green); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                      🟢 MASADA / SERVİSTE (${orders.filter(o => o.status === 'masada').length})
                    </strong>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    ${orders.filter(o => o.status === 'masada').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Masada sipariş yok</div>'}
                  </div>
                </div>

                <!-- COLUMN 4: TAMAMLANANLAR -->
                <div class="kanban-col" style="border-top:3px solid rgba(255,255,255,0.2);">
                  <div class="kanban-col-header">
                    <strong style="color:var(--color-text-muted); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                      ✅ TAMAMLANANLAR (${orders.filter(o => o.status === 'tamamlandi').length})
                    </strong>
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    ${orders.filter(o => o.status === 'tamamlandi').slice(0, 8).map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Tamamlanmış sipariş yok</div>'}
                  </div>
                </div>
              </div>
            ` : ''}
          ` : ''}

          <!-- ==================== TAB 2: CANLI DESTEK & ÇAĞRI KONSOLU ==================== -->
          ${activeTab === 'support' ? `
            <div style="background:var(--color-bg-card); padding:1.4rem 1.8rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.6rem;">
                <div>
                  <h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff; margin:0 0 2px 0;">
                    🎧 Çağrı Konsolu & Canlı Teşhis Masası
                  </h3>
                  <p style="color:var(--color-text-muted); font-size:0.84rem; margin:0;">
                    Arayan restoran sahibinin ID'sini, adını veya telefonunu girerek tüm teknik ve sipariş detaylarına anında ulaşın.
                  </p>
                </div>

                <!-- Call Duration Live Ticker -->
                <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); border-radius:var(--radius-md); padding:0.45rem 0.9rem; display:flex; align-items:center; gap:0.6rem;">
                  <span style="width:9px; height:9px; background:var(--color-danger); border-radius:50%; display:inline-block; animation:pulse 1.5s infinite;"></span>
                  <span style="font-size:0.8rem; font-weight:800; color:#fff;">GÖRÜŞME SAYACI:</span>
                  <span id="call-timer-display" style="font-family:monospace; font-weight:900; color:var(--color-accent-green); font-size:1.05rem;">00:00</span>
                </div>
              </div>

              <!-- Search Input for Support -->
              <div style="margin-bottom:1rem;">
                <input type="text" id="input-support-search" class="form-input" placeholder="🔍 İşletme ID (Örn: REG-1001, BYR-1001), Restoran Adı, Telefon veya Yetkili Adı yazın..." value="${supportSearchQuery}" style="padding-left:1.2rem; font-size:0.95rem; height:46px;">
              </div>

              <!-- Quick Business Selector Pills -->
              <div style="display:flex; gap:0.45rem; flex-wrap:wrap; align-items:center;">
                <span style="font-size:0.75rem; color:var(--color-text-dim); font-weight:700;">Hızlı Seçim:</span>
                ${store.registrations.map(r => `
                  <button class="pill-btn btn-select-support-business ${supportSelectedBusinessId === r.id ? 'active' : ''}" data-biz-id="${r.id}" style="padding:0.35rem 0.8rem; font-size:0.78rem;">
                    ${r.businessName} <span style="font-family:monospace; opacity:0.8; margin-left:4px;">(${r.id})</span>
                  </button>
                `).join('')}
              </div>
            </div>

            ${selectedSupportBusiness ? `
              <!-- ACTIVE CALL DOSSIER (3 COLUMNS) -->
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1.2rem;">
                <!-- 1. COLUMN: PROFILE & PASS -->
                <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.4rem; box-shadow:var(--shadow-card);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
                    <div>
                      <span style="font-size:0.7rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Arayan İşletme</span>
                      <h4 style="font-family:var(--font-heading); font-size:1.25rem; font-weight:900; color:#fff; margin:2px 0 0 0;">${selectedSupportBusiness.businessName}</h4>
                    </div>
                    <span style="background:rgba(0,230,118,0.15); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.35); font-size:0.72rem; font-weight:800; padding:2px 8px; border-radius:10px;">
                      ${selectedSupportBusiness.status === 'onaylandi' ? '✓ AKTİF ÜYE' : '⏳ ONAY BEKLİYOR'}
                    </span>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.83rem; margin-bottom:1.2rem;">
                    <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:0.55rem 0.8rem; border-radius:6px;">
                      <span style="color:var(--color-text-muted);">İşletme Kodu (ID):</span>
                      <strong style="color:var(--color-primary); font-family:monospace; font-size:1.05rem; letter-spacing:1px;">${selectedSupportBusiness.id}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; background:rgba(0,0,0,0.3); padding:0.55rem 0.8rem; border-radius:6px; align-items:center;">
                      <span style="color:var(--color-text-muted);">Giriş Şifresi:</span>
                      <div style="display:flex; align-items:center; gap:0.4rem;">
                        <strong style="color:#fff; font-family:monospace; font-size:0.95rem;">${selectedSupportBusiness.password || '123456'}</strong>
                        <button id="btn-copy-support-pass" class="pill-btn" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.08); border:none; cursor:pointer;" title="Kopyala">
                          <i data-lucide="copy" style="width:12px; height:12px;"></i>
                        </button>
                      </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; padding:0.2rem 0;">
                      <span style="color:var(--color-text-muted);">Yetkili Ad Soyad:</span>
                      <strong style="color:#fff;">${selectedSupportBusiness.fullName}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; padding:0.2rem 0;">
                      <span style="color:var(--color-text-muted);">İletişim Telefonu:</span>
                      <strong style="color:var(--color-accent-green);">${selectedSupportBusiness.phone}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; padding:0.2rem 0;">
                      <span style="color:var(--color-text-muted);">Seçilen Paket:</span>
                      <strong style="color:var(--color-accent-cyan);">${selectedSupportBusiness.plan || 'Profesyonel'}</strong>
                    </div>

                    <div style="padding:0.4rem 0; border-top:1px solid rgba(255,255,255,0.06); font-size:0.78rem; color:var(--color-text-dim);">
                      📍 ${selectedSupportBusiness.city} - ${selectedSupportBusiness.fullAddress || 'Adres girilmedi'}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem;">
                    <button id="btn-support-send-sms" class="pill-btn" style="justify-content:center; background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.35); color:var(--color-accent-green); font-size:0.75rem; padding:0.55rem; cursor:pointer; font-weight:700;">
                      <i data-lucide="message-square" style="width:13px;"></i> Şifreyi SMS İlet
                    </button>
                    <button id="btn-support-open-whatsapp" class="pill-btn" style="justify-content:center; background:rgba(37,211,102,0.15); border:1px solid rgba(37,211,102,0.35); color:#25D366; font-size:0.75rem; padding:0.55rem; cursor:pointer; font-weight:700;">
                      <i data-lucide="phone-forwarded" style="width:13px;"></i> WhatsApp Linki
                    </button>
                  </div>
                </div>

                <!-- 2. COLUMN: LIVE DIAGNOSTICS & SYSTEM TESTS -->
                <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.4rem; box-shadow:var(--shadow-card);">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
                    <span style="font-size:0.7rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Sistem Teşhisi</span>
                    <span style="font-size:0.72rem; color:var(--color-accent-green); font-weight:700;">● %100 ÇEVRİMİÇİ</span>
                  </div>

                  <div style="display:flex; flex-direction:column; gap:0.65rem; font-size:0.82rem; margin-bottom:1.2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                      <span>🌐 QR Menü Yanıt Süresi:</span>
                      <strong style="color:var(--color-accent-green);">${businessDiagnostics?.latency}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                      <span>📱 Masadan Sipariş Alma:</span>
                      <strong style="color:var(--color-accent-green);">${businessDiagnostics?.systemStatus}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                      <span>🔔 Mutfak Bildirim Sinyali:</span>
                      <strong style="color:var(--color-accent-green);">Aktif (Son Ping: 12 sn)</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                      <span>📊 Toplam Alınan Sipariş:</span>
                      <strong style="color:var(--color-accent-cyan);">${businessDiagnostics?.totalOrdersCount} Sipariş (₺${businessDiagnostics?.totalOrderRevenue})</strong>
                    </div>
                  </div>

                  <!-- Quick diagnostic actions -->
                  <div style="display:flex; flex-direction:column; gap:0.55rem;">
                    <button id="btn-support-test-order-now" class="pill-btn" style="justify-content:center; background:var(--color-primary-gradient); color:#fff; font-size:0.8rem; padding:0.65rem; cursor:pointer; font-weight:800; border:none; box-shadow:var(--shadow-glow);">
                      <i data-lucide="zap" style="width:15px;"></i> Canlı Test Siparişi Düşür
                    </button>

                    <button id="btn-support-ping-kitchen" class="pill-btn" style="justify-content:center; background:rgba(255,255,255,0.06); border:var(--border-glass); color:#fff; font-size:0.78rem; padding:0.55rem; cursor:pointer; font-weight:700;">
                      <i data-lucide="bell-ring" style="width:14px; color:var(--color-accent-yellow);"></i> Mutfak Zili Çaldır (Test)
                    </button>

                    <button id="btn-support-clear-cache" class="pill-btn" style="justify-content:center; background:rgba(255,255,255,0.04); border:var(--border-glass); color:var(--color-text-muted); font-size:0.75rem; padding:0.45rem; cursor:pointer;">
                      <i data-lucide="rotate-ccw" style="width:12px;"></i> Restoran Önbelleğini Sıfırla
                    </button>
                  </div>
                </div>

                <!-- 3. COLUMN: SUPPORT CALL LOGS & AGENT NOTES -->
                <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.4rem; box-shadow:var(--shadow-card); display:flex; flex-direction:column;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
                    <span style="font-size:0.7rem; text-transform:uppercase; color:var(--color-text-muted); font-weight:800;">Görüşme Notları</span>
                    <span style="font-size:0.72rem; color:var(--color-text-dim);">${businessNotes.length} Kayıtlı Not</span>
                  </div>

                  <!-- Add note form -->
                  <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-md); padding:0.75rem; margin-bottom:0.85rem;">
                    <select id="select-note-category" class="form-input" style="padding:0.35rem 0.6rem; font-size:0.78rem; margin-bottom:0.5rem; height:34px;">
                      <option value="Masa / QR Problemi">Masa / QR Problemi</option>
                      <option value="Menü & Fiyat Güncelleme">Menü & Fiyat Güncelleme</option>
                      <option value="Yazıcı / Donanım Desteği">Yazıcı / Donanım Desteği</option>
                      <option value="Abonelik & Fatura">Abonelik & Fatura</option>
                      <option value="Genel Danışma">Genel Danışma</option>
                    </select>
                    <textarea id="text-support-note" class="form-input" rows="2" placeholder="Çağrı notunu yazın (Örn: Ahmet Usta aradı, yazıcı kontrolü yapıldı)..." style="font-size:0.8rem; margin-bottom:0.5rem;"></textarea>
                    <button id="btn-save-support-note" class="pill-btn" style="width:100%; justify-content:center; background:rgba(0,230,118,0.2); border:1px solid var(--color-accent-green); color:var(--color-accent-green); font-size:0.78rem; font-weight:800; padding:0.45rem; cursor:pointer;">
                      <i data-lucide="check" style="width:13px;"></i> Çağrı Notunu Kaydet
                    </button>
                  </div>

                  <!-- Timeline list with delete note option -->
                  <div style="flex:1; overflow-y:auto; max-height:220px; display:flex; flex-direction:column; gap:0.55rem; padding-right:4px;">
                    ${businessNotes.length === 0 ? `
                      <div style="text-align:center; padding:1.5rem; font-size:0.78rem; color:var(--color-text-dim);">
                        Bu işletmeye ait henüz çağrı notu bulunmuyor.
                      </div>
                    ` : businessNotes.map(n => `
                      <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); padding:0.6rem 0.8rem; border-radius:6px; font-size:0.78rem; position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                          <span style="font-weight:700; color:var(--color-primary); font-size:0.72rem;">${n.category}</span>
                          <div style="display:flex; align-items:center; gap:6px;">
                            <span style="font-size:0.68rem; color:var(--color-text-dim);">${n.createdAt}</span>
                            <button class="btn-delete-note" data-note-id="${n.id}" style="background:none; border:none; color:var(--color-text-dim); cursor:pointer; padding:0;" title="Notu sil">
                              <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
                            </button>
                          </div>
                        </div>
                        <p style="color:#fff; margin:0 0 2px 0; font-size:0.8rem; line-height:1.35;">${n.text}</p>
                        <span style="font-size:0.68rem; color:var(--color-text-muted);">Temsilci: ${n.agent}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- ARAYAN İŞLETMENİN ANLIK SİPARİŞLERİ -->
              <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); padding:1.4rem; box-shadow:var(--shadow-card);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; flex-wrap:wrap; gap:0.5rem;">
                  <div>
                    <h4 style="font-family:var(--font-heading); font-size:1.15rem; font-weight:800; color:#fff; margin:0;">
                      🛒 ${selectedSupportBusiness.businessName} - Masalardan Gelen Siparişler
                    </h4>
                    <p style="font-size:0.78rem; color:var(--color-text-muted); margin:0;">Telefondayken işletmenin anlık siparişlerini görüntüleyebilir, silebilir veya durumunu değiştirebilirsiniz.</p>
                  </div>
                  <button id="btn-support-add-test-to-current" class="pill-btn" style="background:rgba(255,107,0,0.15); border:1px solid rgba(255,107,0,0.4); color:var(--color-primary); font-weight:800; font-size:0.78rem; padding:0.45rem 0.85rem; cursor:pointer;">
                    <i data-lucide="plus"></i> Test Siparişi Oluştur
                  </button>
                </div>

                <div style="overflow-x:auto;">
                  <table style="width:100%; border-collapse:collapse; font-size:0.82rem; text-align:left;">
                    <thead>
                      <tr style="border-bottom:1px solid rgba(255,255,255,0.08); color:var(--color-text-muted); font-size:0.72rem; text-transform:uppercase;">
                        <th style="padding:0.6rem 0.5rem;">Sipariş Kodu</th>
                        <th style="padding:0.6rem 0.5rem;">Masa</th>
                        <th style="padding:0.6rem 0.5rem;">Müşteri</th>
                        <th style="padding:0.6rem 0.5rem;">Sipariş İçeriği</th>
                        <th style="padding:0.6rem 0.5rem;">Tutar</th>
                        <th style="padding:0.6rem 0.5rem;">Durum</th>
                        <th style="padding:0.6rem 0.5rem; text-align:right;">İşlem</th>
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
                          <td style="padding:0.65rem 0.5rem; font-family:monospace; font-weight:800; color:var(--color-primary);">${bo.id}</td>
                          <td style="padding:0.65rem 0.5rem; font-weight:700; color:#fff;">${bo.tableName}</td>
                          <td style="padding:0.65rem 0.5rem; color:var(--color-text-muted);">${bo.customerName}</td>
                          <td style="padding:0.65rem 0.5rem; color:#fff;">
                            ${bo.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                          </td>
                          <td style="padding:0.65rem 0.5rem; font-weight:800; color:var(--color-accent-green);">₺${bo.totalPrice}</td>
                          <td style="padding:0.65rem 0.5rem;">
                            <span style="font-size:0.7rem; font-weight:800; padding:2px 7px; border-radius:10px; ${
                              bo.status === 'yeni' ? 'background:rgba(255,107,0,0.15); color:var(--color-primary);' :
                              bo.status === 'hazirlaniyor' ? 'background:rgba(168,85,247,0.15); color:#C084FC;' :
                              bo.status === 'masada' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green);' :
                              'background:rgba(255,255,255,0.08); color:var(--color-text-muted);'
                            }">
                              ${bo.status}
                            </span>
                          </td>
                          <td style="padding:0.65rem 0.5rem; text-align:right;">
                            <div style="display:inline-flex; gap:4px;">
                              <button class="pill-btn btn-inspect-order" data-order-id="${bo.id}" style="padding:2px 7px; font-size:0.7rem; background:rgba(255,255,255,0.08); border:none; cursor:pointer;">
                                Detay
                              </button>
                              <button class="pill-btn btn-delete-order" data-order-id="${bo.id}" style="padding:2px 7px; font-size:0.7rem; background:rgba(239,68,68,0.12); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3); cursor:pointer;" title="Siparişi sil">
                                <i data-lucide="trash-2" style="width:11px;"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}
          ` : ''}

          <!-- ==================== TAB 3: İŞLETME BAŞVURULARI & PAKETLER ==================== -->
          ${activeTab === 'registrations' ? `
            <!-- Top summary tiles -->
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

            <!-- Filter tabs bar -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--color-bg-card); padding:0.8rem 1.2rem; border-radius:var(--radius-md); border:var(--border-glass);">
              <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                <button class="pill-btn ${filterRegStatus === 'all' ? 'active' : ''}" data-filter-reg="all">Tüm Başvurular (${store.registrations.length})</button>
                <button class="pill-btn ${filterRegStatus === 'bekliyor' ? 'active' : ''}" data-filter-reg="bekliyor">⏳ Onay Bekleyenler (${pendingCount})</button>
                <button class="pill-btn ${filterRegStatus === 'onaylandi' ? 'active' : ''}" data-filter-reg="onaylandi">✅ Onaylananlar (${approvedCount})</button>
                <button class="pill-btn ${filterRegStatus === 'reddedildi' ? 'active' : ''}" data-filter-reg="reddedildi">❌ Reddedilenler</button>
              </div>
            </div>

            <!-- Registration Cards List -->
            <div style="display:flex; flex-direction:column; gap:1.2rem;">
              ${regs.length === 0 ? `
                <div style="text-align:center; padding:4rem 1rem; background:var(--color-bg-card); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
                  <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
                  <p>Bu filtreye uygun restoran başvurusu bulunamadı.</p>
                </div>
              ` : regs.map(reg => `
                <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); padding:1.4rem; border:${reg.status === 'bekliyor' ? '1px solid var(--color-accent-yellow)' : 'var(--border-glass)'}; box-shadow:var(--shadow-card); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.4rem; position:relative; overflow:hidden;">
                  ${reg.status === 'bekliyor' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-yellow);"></div>' : reg.status === 'onaylandi' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-green);"></div>' : '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-danger);"></div>'}

                  <div style="flex:1; min-width:280px;">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.8rem;">
                      <div style="width:46px; height:46px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.3rem;">🏢</div>
                      <div>
                        <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff; margin:0;">${reg.businessName}</h3>
                        <div style="font-size:0.82rem; color:var(--color-primary); font-weight:700;">${reg.businessType || 'Restoran'} • ${reg.city}</div>
                      </div>
                    </div>

                    <div style="background:rgba(255,107,0,0.12); border:1px solid rgba(255,107,0,0.3); padding:0.55rem 0.95rem; border-radius:var(--radius-md); margin-bottom:0.8rem; display:flex; justify-content:space-between; align-items:center;">
                      <span style="font-size:0.82rem; font-weight:700; color:var(--color-text-muted);">💎 Seçilen Aylık Plan:</span>
                      <strong style="font-size:0.92rem; color:var(--color-accent-green); font-weight:800;">${reg.plan || 'Profesyonel Paket (₺899/ay)'}</strong>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:0.65rem; background:rgba(0,0,0,0.3); padding:0.8rem; border-radius:var(--radius-md); font-size:0.82rem;">
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.72rem;">İşletme Kodu (ID):</span><strong style="color:var(--color-primary); font-family:monospace; font-size:1rem; letter-spacing:1px;">${reg.id}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.72rem;">Giriş Şifresi:</span><strong style="color:#fff; font-family:monospace; font-size:0.92rem;">${reg.password || '••••••'}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.72rem;">Yetkili Ad Soyad:</span><strong style="color:#fff;">${reg.fullName}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.72rem;">Cep Telefonu:</span><strong style="color:var(--color-accent-green);">${reg.phone}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.72rem;">Başvuru Tarihi:</span><span style="color:var(--color-text-muted);">${reg.createdAt}</span></div>
                    </div>

                    <div style="margin-top:0.75rem; font-size:0.82rem; background:rgba(255,255,255,0.03); padding:0.65rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.05);">
                      <strong style="color:var(--color-text-muted); font-size:0.75rem; display:block; margin-bottom:2px;">📍 Açık Adres:</strong>
                      <span style="color:#fff;">${reg.fullAddress || 'Adres bilgisi belirtilmedi.'}</span>
                    </div>
                  </div>

                  <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.9rem; min-width:180px;">
                    <div>
                      ${reg.status === 'bekliyor' ? '<span style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:var(--color-accent-yellow); font-size:0.78rem; font-weight:800; padding:0.35rem 0.85rem; border-radius:var(--radius-full);">⏳ Onay Bekliyor</span>' : reg.status === 'onaylandi' ? '<span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.78rem; font-weight:800; padding:0.35rem 0.85rem; border-radius:var(--radius-full);">✅ Onaylandı (Aktif)</span>' : '<span style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); font-size:0.78rem; font-weight:800; padding:0.35rem 0.85rem; border-radius:var(--radius-full);">❌ Reddedildi</span>'}
                    </div>

                    <div style="display:flex; gap:0.45rem;">
                      ${reg.status !== 'onaylandi' ? `
                        <button class="btn-approve-reg" data-reg-id="${reg.id}" style="background:rgba(0,230,118,0.2); border:1px solid var(--color-accent-green); color:var(--color-accent-green); padding:0.55rem 1rem; border-radius:var(--radius-md); font-weight:800; font-size:0.8rem; cursor:pointer;">
                          ✅ Onayla
                        </button>
                      ` : ''}
                      ${reg.status !== 'reddedildi' ? `
                        <button class="btn-reject-reg" data-reg-id="${reg.id}" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); padding:0.55rem 0.9rem; border-radius:var(--radius-md); font-weight:700; font-size:0.8rem; cursor:pointer;">
                          Reddet
                        </button>
                      ` : ''}
                      <button class="btn-delete-reg" data-reg-id="${reg.id}" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:var(--color-text-muted); padding:0.55rem; border-radius:var(--radius-md); cursor:pointer;">
                        <i data-lucide="trash-2" style="width:14px;"></i>
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- ==================== TAB 4: SİSTEM & SUNUCU SAĞLIĞI ==================== -->
          ${activeTab === 'health' ? `
            <div style="background:var(--color-bg-card); padding:2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
              <h3 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin-bottom:1.4rem; display:flex; align-items:center; gap:0.6rem;">
                <i data-lucide="server" style="color:var(--color-accent-cyan);"></i> Bulut Altyapı & Canlı Veritabanı Durumu
              </h3>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.2rem; margin-bottom:2rem;">
                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                  <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Supabase Postgres DB</span>
                  <h4 style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900; margin:4px 0;">● ÇEVRİMİÇİ</h4>
                  <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Uç nokta: ${supabaseUrl || 'https://example.supabase.co'}</p>
                </div>

                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                  <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Realtime Socket Kanalı</span>
                  <h4 style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900; margin:4px 0;">● BAĞLI (19ms)</h4>
                  <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Anlık sipariş ve onay dinleme aktif</p>
                </div>

                <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem;">
                  <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800;">Platform Çalışma Süresi</span>
                  <h4 style="color:var(--color-accent-cyan); font-size:1.4rem; font-weight:900; margin:4px 0;">%99.98 Uptime</h4>
                  <p style="font-size:0.8rem; color:var(--color-text-dim); margin:0;">Kesintisiz restoran otomasyonu</p>
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
        </main>
      </div>

      <!-- ==================== ORDER DETAIL & RECEIPT MODAL ==================== -->
      ${activeDetailOrder ? `
        <div class="admin-modal-backdrop" id="modal-order-detail-backdrop">
          <div class="admin-modal-content" style="max-width:540px; background:var(--color-bg-card); border-radius:var(--radius-lg); border:1px solid rgba(255,107,0,0.4); box-shadow:0 25px 60px rgba(0,0,0,0.8); padding:2rem; position:relative; overflow:hidden;">
            <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:var(--color-primary-gradient);"></div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.8rem;">
              <div>
                <span style="font-size:0.72rem; color:var(--color-text-muted); font-weight:800; text-transform:uppercase;">SİPARİŞ FİŞİ & DETAYI</span>
                <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:900; color:#fff; margin:2px 0 0 0;">
                  ${activeDetailOrder.tableName} <span style="font-family:monospace; color:var(--color-primary); font-size:1rem;">(${activeDetailOrder.id})</span>
                </h3>
              </div>
              <button id="btn-close-order-modal" style="background:rgba(255,255,255,0.08); border:none; color:#fff; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">
                ✕
              </button>
            </div>

            <!-- Receipt Info Grid -->
            <div style="background:rgba(0,0,0,0.3); border-radius:var(--radius-md); padding:1rem; font-size:0.84rem; display:flex; flex-direction:column; gap:0.45rem; margin-bottom:1.2rem;">
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--color-text-muted);">İşletme:</span>
                <strong style="color:#fff;">${activeDetailOrder.businessName}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--color-text-muted);">Müşteri:</span>
                <strong style="color:#fff;">${activeDetailOrder.customerName}</strong>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--color-text-muted);">Sipariş Saati:</span>
                <span style="color:#fff;">${activeDetailOrder.createdAt}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--color-text-muted);">Ödeme Yöntemi:</span>
                <span style="color:var(--color-accent-cyan); font-weight:700;">${activeDetailOrder.paymentMethod}</span>
              </div>
              <div style="display:flex; justify-content:space-between;">
                <span style="color:var(--color-text-muted);">Sipariş Durumu:</span>
                <strong style="color:var(--color-accent-green); text-transform:uppercase;">${activeDetailOrder.status}</strong>
              </div>
            </div>

            <!-- Items Table in Receipt -->
            <div style="border:1px dashed rgba(255,255,255,0.2); border-radius:var(--radius-md); padding:1rem; font-size:0.84rem; margin-bottom:1.4rem;">
              <div style="font-weight:800; font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase; margin-bottom:0.6rem;">
                Sipariş Edilen Ürünler
              </div>
              <div style="display:flex; flex-direction:column; gap:0.5rem;">
                ${activeDetailOrder.items.map(i => `
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:0.4rem;">
                    <div>
                      <strong style="color:#fff;">${i.qty}x ${i.name}</strong>
                      ${i.note ? `<div style="font-size:0.72rem; color:var(--color-primary); font-style:italic;">"${i.note}"</div>` : ''}
                    </div>
                    <strong style="color:#fff;">₺${(i.price * i.qty).toFixed(2)}</strong>
                  </div>
                `).join('')}
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); margin-top:0.8rem; padding-top:0.6rem;">
                <strong style="color:#fff; font-size:0.95rem;">GENEL TOPLAM:</strong>
                <strong style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900;">₺${activeDetailOrder.totalPrice.toFixed(2)}</strong>
              </div>
            </div>

            <!-- Modal Action Buttons -->
            <div style="display:flex; gap:0.6rem; justify-content:flex-end;">
              <button id="btn-modal-delete-order" class="pill-btn" style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.35); color:var(--color-danger); font-size:0.82rem; padding:0.6rem 1rem; cursor:pointer;">
                <i data-lucide="trash-2" style="width:14px;"></i> Siparişi Sil
              </button>
              <button id="btn-modal-print-receipt" class="pill-btn" style="background:var(--color-primary-gradient); color:#fff; font-size:0.82rem; padding:0.6rem 1.2rem; cursor:pointer; font-weight:800; border:none;">
                <i data-lucide="printer" style="width:14px;"></i> Fişi Yazdır / Paylaş
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    `;

    if (window.lucide) window.lucide.createIcons();

    // ==================== EVENT BINDINGS ====================

    // 1. Sidebar Tab Switches
    container.querySelectorAll('button[data-sidebar-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeTab = e.currentTarget.dataset.sidebarTab;
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
    // Search input
    container.querySelector('#input-order-search')?.addEventListener('input', (e) => {
      orderSearchQuery = e.target.value;
      updateView();
    });

    // View Mode Switcher
    container.querySelectorAll('.btn-view-mode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        ordersViewMode = e.currentTarget.dataset.mode;
        updateView();
      });
    });

    // Restaurant Filter
    container.querySelector('#select-order-business-filter')?.addEventListener('change', (e) => {
      filterOrderBusiness = e.target.value;
      updateView();
    });

    // Status Filter Pills
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
      showToast(`⚡ Test siparişi (${testOrd.id}) başarıyla oluşturuldu ve sesli zil çaldı!`, 'success');
      updateView();
    });

    // Clear Completed Orders
    container.querySelector('#btn-clear-completed-orders')?.addEventListener('click', () => {
      if (confirm('Tamamlanmış ve iptal edilmiş siparişleri listeden temizlemek istiyor musunuz?')) {
        store.clearCompletedOrders();
        showToast('🧹 Tamamlanan siparişler arşivlendi ve temizlendi.', 'info');
        updateView();
      }
    });

    // Change Order Status
    container.querySelectorAll('.btn-change-order-status').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        const newStat = e.currentTarget.dataset.newStatus;
        store.updateOrderStatus(ordId, newStat);
        showToast(`Sipariş durumu güncellendi: ${newStat}`, 'success');
        updateView();
      });
    });

    // DELETE ORDER EVENT (User requested: "siparişler silinebilsin")
    container.querySelectorAll('.btn-delete-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        if (confirm(`${ordId} numaralı siparişi kalıcı olarak silmek istiyor musunuz?`)) {
          store.deleteOrder(ordId);
          if (activeDetailOrder && activeDetailOrder.id === ordId) {
            activeDetailOrder = null;
          }
          showToast(`🗑️ ${ordId} numaralı sipariş başarıyla silindi.`, 'info');
          updateView();
        }
      });
    });

    // Inspect Order Modal
    container.querySelectorAll('.btn-inspect-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        activeDetailOrder = store.orders.find(o => o.id === ordId);
        updateView();
      });
    });

    // Modal Close
    container.querySelector('#btn-close-order-modal')?.addEventListener('click', () => {
      activeDetailOrder = null;
      updateView();
    });
    container.querySelector('#modal-order-detail-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-order-detail-backdrop') {
        activeDetailOrder = null;
        updateView();
      }
    });

    // Modal Delete Order
    container.querySelector('#btn-modal-delete-order')?.addEventListener('click', () => {
      if (activeDetailOrder && confirm(`${activeDetailOrder.id} numaralı siparişi silmek istiyor musunuz?`)) {
        store.deleteOrder(activeDetailOrder.id);
        showToast(`🗑️ Sipariş silindi.`, 'info');
        activeDetailOrder = null;
        updateView();
      }
    });

    // Modal Print Receipt
    container.querySelector('#btn-modal-print-receipt')?.addEventListener('click', () => {
      window.print();
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

    // Select Support Business Pills
    container.querySelectorAll('.btn-select-support-business').forEach(btn => {
      btn.addEventListener('click', (e) => {
        supportSelectedBusinessId = e.currentTarget.dataset.bizId;
        updateView();
      });
    });

    // Copy Password
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

    // Support Ping Kitchen
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

    // Delete Support Note
    container.querySelectorAll('.btn-delete-note').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const noteId = e.currentTarget.dataset.noteId;
        store.deleteSupportNote(noteId);
        showToast('Not silindi.', 'info');
        updateView();
      });
    });

    // Support Add Test to Current
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

  // Helper to render compact order card inside kanban column
  function renderKanbanOrderCard(ord) {
    return `
      <div style="background:var(--color-bg-card); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:0.9rem; box-shadow:0 3px 12px rgba(0,0,0,0.3); font-size:0.8rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.4rem;">
          <div>
            <strong style="color:#fff; font-size:0.95rem; display:block;">${ord.tableName}</strong>
            <span style="font-size:0.7rem; color:var(--color-primary); font-weight:700;">${ord.businessName}</span>
          </div>
          <button class="btn-delete-order" data-order-id="${ord.id}" style="background:none; border:none; color:var(--color-text-dim); cursor:pointer; padding:2px;" title="Sil">
            <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
          </button>
        </div>

        <div style="color:var(--color-text-muted); font-size:0.75rem; margin-bottom:0.5rem;">
          ${ord.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.5rem;">
          <strong style="color:var(--color-accent-green); font-size:0.95rem;">₺${ord.totalPrice}</strong>
          <button class="pill-btn btn-inspect-order" data-order-id="${ord.id}" style="padding:2px 6px; font-size:0.7rem; background:rgba(255,255,255,0.08); border:none; cursor:pointer;">
            İncele
          </button>
        </div>
      </div>
    `;
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
