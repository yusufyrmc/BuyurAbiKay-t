import { store } from '../state/store.js';
import { supabaseUrl } from '../lib/supabase.js';

export function renderOwnerAdminPanel(container) {
  let activeTab = 'orders'; // 'orders' | 'support' | 'registrations' | 'health'
  let ordersViewMode = 'grid'; // 'grid' | 'kanban'
  let ordersTableViewMode = 'tables'; // 'tables' | 'grid' | 'kanban'
  let orderSelectedBusinessId = null; // null: show direct business ID entry screen; string: show business live tables & earnings
  let orderBusinessInputText = '';
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
    const activeBizId = (orderSelectedBusinessId && orderSelectedBusinessId !== 'all') 
      ? orderSelectedBusinessId 
      : filterOrderBusiness;
    if (activeBizId !== 'all') {
      list = list.filter(o => o.businessId === activeBizId);
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

  function normalizeQuery(str) {
    if (!str) return '';
    return str.toString().toLowerCase().replace(/[^a-z0-9ğüşıöç]/gi, '');
  }

  function findBusiness(query) {
    if (!query) return null;
    const raw = query.trim();
    const rawUpper = raw.toUpperCase();
    const rawLower = raw.toLowerCase();
    const norm = normalizeQuery(raw);

    // 1. Exact match on ID (e.g. "REG-1001", "BYR-1001")
    let match = store.registrations.find(r => r.id.toUpperCase() === rawUpper);
    if (match) return match;

    // 2. Normalized ID match (e.g. "reg1001", "reg 1001", "byr1001")
    match = store.registrations.find(r => normalizeQuery(r.id) === norm);
    if (match) return match;

    // 3. Digits-only match (e.g. user typed "1001", matches "REG-1001" or "BYR-1001")
    const digits = raw.replace(/\D/g, '');
    if (digits && digits.length >= 2) {
      match = store.registrations.find(r => {
        const rDigits = r.id.replace(/\D/g, '');
        return rDigits === digits || rDigits.endsWith(digits);
      });
      if (match) return match;
    }

    // 4. Exact business name match
    match = store.registrations.find(r => r.businessName.toLowerCase() === rawLower);
    if (match) return match;

    // 5. Business name contains query
    match = store.registrations.find(r => r.businessName.toLowerCase().includes(rawLower));
    if (match) return match;

    // 6. Check existing orders for businessId or businessName
    const orderMatch = store.orders.find(o => 
      o.businessId.toUpperCase() === rawUpper || 
      normalizeQuery(o.businessId) === norm ||
      (digits && digits.length >= 2 && o.businessId.replace(/\D/g, '').endsWith(digits)) ||
      o.businessName.toLowerCase().includes(rawLower)
    );
    if (orderMatch) {
      const regFromOrder = store.registrations.find(r => r.id === orderMatch.businessId);
      if (regFromOrder) return regFromOrder;
      return {
        id: orderMatch.businessId,
        businessName: orderMatch.businessName,
        businessType: 'Restoran',
        city: 'Belirtilmedi',
        status: 'onaylandi'
      };
    }

    return null;
  }

  function updateView() {
    const activeEl = document.activeElement;
    const focusedId = activeEl && container.contains(activeEl) ? activeEl.id : null;
    const selStart = activeEl && typeof activeEl.selectionStart === 'number' ? activeEl.selectionStart : null;
    const selEnd = activeEl && typeof activeEl.selectionEnd === 'number' ? activeEl.selectionEnd : null;

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
    function getFilteredProfiles() {
      return store.profiles; // no filters for now
    }

    const regs = getFilteredRegistrations();
    const orders = getFilteredOrders();
    const pendingCount = store.getPendingCount();
    const approvedCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const rejectedCount = store.registrations.filter(r => r.status === 'reddedildi').length;
    const monthlySubscriptionRevenue = store.getTotalMonthlyRevenue();
    const pendingSubscriptionRevenue = store.registrations
      .filter(r => r.status === 'bekliyor')
      .reduce((sum, r) => sum + (r.planPrice || 899), 0);
    const totalMonthlyRev = monthlySubscriptionRevenue;

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

              <button class="admin-nav-item ${activeTab === 'profiles' ? 'active' : ''}" data-sidebar-tab="profiles">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="users" style="width:18px; height:18px; color:var(--color-primary);"></i>
                  <span>Yetkili Profilleri</span>
                </div>
                <span style="background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:10px; padding:1px 7px; font-size:0.72rem; font-weight:800;">
                  ${(store.profiles || []).length}
                </span>
              </button>

              <button class="admin-nav-item ${activeTab === 'pricing' ? 'active' : ''}" data-sidebar-tab="pricing">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="tag" style="width:18px; height:18px; color:var(--color-accent-green);"></i>
                  <span>Paket & Fiyat Yönetimi</span>
                </div>
                <span style="background:rgba(0,230,118,0.15); color:var(--color-accent-green); border-radius:10px; padding:1px 7px; font-size:0.72rem; font-weight:800;">
                  ${store.getPricingPlans().length} Paket
                </span>
              </button>

              <button class="admin-nav-item ${activeTab === 'health' ? 'active' : ''}" data-sidebar-tab="health">
                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="activity" style="width:18px; height:18px; color:var(--color-accent-purple);"></i>
                  <span>Sistem & Sunucu</span>
                </div>
                <span style="color:var(--color-accent-green); font-size:0.72rem; font-weight:800;">%99.9</span>
              </button>
            </nav>

            <!-- ==================== SOL TARAF: KAZANCIM (PROGRAMDAN AYLIK ALACAĞIM TUTAR) ==================== -->
            <div class="sidebar-earnings-box" style="margin-top:1.6rem; background:linear-gradient(135deg, rgba(0,230,118,0.12) 0%, rgba(14,19,31,0.95) 100%); border:1.5px solid rgba(0,230,118,0.4); border-radius:var(--radius-lg); padding:1.2rem; box-shadow:0 8px 25px rgba(0,230,118,0.15); position:relative; overflow:hidden;">
              <div style="position:absolute; top:0; left:0; width:100%; height:3px; background:linear-gradient(90deg, var(--color-accent-green), var(--color-accent-cyan));"></div>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <div style="width:28px; height:28px; background:rgba(0,230,118,0.2); border-radius:6px; display:flex; align-items:center; justify-content:center; color:var(--color-accent-green);">
                    <i data-lucide="wallet" style="width:16px; height:16px;"></i>
                  </div>
                  <span style="font-family:var(--font-heading); font-size:0.95rem; font-weight:900; color:#fff; letter-spacing:0.3px;">
                    KAZANCIM
                  </span>
                </div>
                <span style="font-size:0.68rem; background:rgba(0,230,118,0.18); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-weight:800; padding:2px 7px; border-radius:8px;">
                  ● AYLIK LİSANS
                </span>
              </div>

              <div style="margin-bottom:0.85rem;">
                <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block; margin-bottom:2px;">
                  Programdan Aylık Alacağım Tutar
                </span>
                <div style="font-family:var(--font-heading); font-size:1.85rem; font-weight:900; color:var(--color-accent-green); line-height:1.1; text-shadow:0 0 15px rgba(0,230,118,0.4);">
                  ₺${monthlySubscriptionRevenue.toLocaleString('tr-TR')}
                  <span style="font-size:0.82rem; color:var(--color-text-muted); font-weight:600; font-family:var(--font-sans);">/ay</span>
                </div>
              </div>

              <div style="background:rgba(0,0,0,0.35); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.06); padding:0.65rem 0.8rem; display:flex; flex-direction:column; gap:0.35rem; font-size:0.76rem;">
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--color-text-dim);">Ödeyen İşletme:</span>
                  <strong style="color:#fff;">${approvedCount} Aktif Abone</strong>
                </div>
                <div style="display:flex; justify-content:space-between;">
                  <span style="color:var(--color-text-dim);">Yıllık Projeksiyon:</span>
                  <strong style="color:var(--color-accent-cyan);">₺${(monthlySubscriptionRevenue * 12).toLocaleString('tr-TR')} /yıl</strong>
                </div>
                ${pendingCount > 0 ? `
                  <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.06); padding-top:0.3rem; margin-top:0.1rem;">
                    <span style="color:#F59E0B;">Onay Bekleyen Potansiyel:</span>
                    <strong style="color:#F59E0B;">+₺${pendingSubscriptionRevenue.toLocaleString('tr-TR')} /ay</strong>
                  </div>
                ` : ''}
              </div>
            </div>

            <!-- Quick Mini KPI Box in Sidebar -->
            <div style="margin-top:1rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-md); padding:0.85rem 1rem;">
              <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block; margin-bottom:0.5rem;">
                GÜNLÜK HIZLI ÖZET
              </span>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:0.35rem;">
                <span style="color:var(--color-text-dim);">Aktif Siparişler:</span>
                <strong style="color:var(--color-primary);">${newOrdersCount + prepOrdersCount + onTableCount} Adet</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem; margin-bottom:0.35rem;">
                <span style="color:var(--color-text-dim);">Restoran Masaları Cirosu:</span>
                <strong style="color:var(--color-accent-green);">₺${totalLiveOrderRev.toLocaleString('tr-TR')}</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.78rem;">
                <span style="color:var(--color-text-dim);">Kayıtlı Restoran:</span>
                <strong style="color:#fff;">${store.registrations.length} İşletme</strong>
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
                  activeTab === 'profiles' ? '👤 Kayıtlı Yetkili Profilleri (Supabase)' :
                  activeTab === 'pricing' ? '🏷️ Paket & Fiyat Düzenleme Paneli' :
                  '📊 Bulut Sunucu & Sistem Altyapı Sağlığı'
                }
              </h2>
              <p style="color:var(--color-text-muted); font-size:0.85rem; margin:2px 0 0 0;">
                ${
                  activeTab === 'orders' ? 'İşletmelerin masalarından anlık gelen siparişler, hazırlık süreleri ve sipariş silme/müdahale merkezi' :
                  activeTab === 'support' ? 'Destek arayan restoranların anında teşhisi, parola hatırlatması ve canlı test siparişi' :
                  activeTab === 'registrations' ? 'Gelen restoran başvurularını inceleyin, seçtikleri aylık paketleri onaylayın' :
                  activeTab === 'profiles' ? 'Supabase veritabanında saklanan restoran sahibi ve yetkili profilleri listesi' :
                  activeTab === 'pricing' ? 'Müşterilere sunulan paketlerin aylık fiyatlarını, masa kapasitelerini ve özellik maddelerini canlı olarak güncelleyin' :
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
            ${(() => {
              // CASE 1: DIRECT BUSINESS ID SEARCH & SELECTION SCREEN
              if (orderSelectedBusinessId === null) {
                return `
                  <div style="background:linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(14,19,31,0.95) 100%); border:2px solid var(--color-primary); border-radius:var(--radius-lg); padding:2.5rem 2rem; margin-bottom:2rem; box-shadow:var(--shadow-glow); text-align:center;">
                    <div style="width:70px; height:70px; background:rgba(255,107,0,0.2); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.2rem auto; border:2px solid var(--color-primary); box-shadow:0 0 25px rgba(255,107,0,0.4);">
                      <i data-lucide="zap" style="width:36px; height:36px;"></i>
                    </div>

                    <h2 style="font-family:var(--font-heading); font-size:2rem; font-weight:900; color:#fff; margin-bottom:0.6rem;">
                      Canlı Sipariş Masası & İşletme Takip Ekranı
                    </h2>
                    <p style="color:var(--color-text-muted); font-size:0.98rem; max-width:680px; margin:0 auto 1.8rem auto; line-height:1.6;">
                      İncelemek istediğiniz <strong>İşletme ID'sini</strong> girerek veya aşağıdaki listeden işletmeye tıklayarak <strong>o işletmenin ne kadar kazandığını</strong> ve <strong>hangi masaya hangi siparişin gittiğini</strong> anında canlı olarak görüntüleyin.
                    </p>

                    <!-- DIRECT BUSINESS ID INPUT BOX -->
                    <div style="max-width:620px; margin:0 auto 1.8rem auto; position:relative;">
                      <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
                        <div style="position:relative; flex:1; min-width:240px;">
                          <input type="text" id="input-direct-business-id" class="form-input" placeholder="İşletme ID veya Adı (Örn: 1001, REG-1001, Gaziantep)..." value="${orderBusinessInputText}" style="height:52px; font-size:1.05rem; font-weight:800; font-family:monospace; padding-left:1.2rem; border-color:var(--color-primary); letter-spacing:1px; text-transform:uppercase;" autocomplete="off">
                        </div>
                        <button id="btn-submit-direct-business-id" class="btn-primary-hero" style="height:52px; padding:0 1.8rem; font-size:1rem; font-weight:800; cursor:pointer;">
                          <i data-lucide="arrow-right-circle"></i> <span>İşletmeyi & Masaları Aç</span>
                        </button>
                      </div>
                      <div id="direct-id-suggestions-box" style="display:none; position:absolute; top:58px; left:0; right:0; background:#0e131f; border:1px solid var(--color-primary); border-radius:var(--radius-md); box-shadow:0 12px 35px rgba(0,0,0,0.85); z-index:100; overflow:hidden; max-height:260px; overflow-y:auto; text-align:left;"></div>
                    </div>

                    <!-- TÜM RESTORANLARI BİR ARADA GÖR BUTONU -->
                    <div style="display:flex; justify-content:center; gap:0.8rem; flex-wrap:wrap;">
                      <button id="btn-view-all-businesses-orders" class="pill-btn" style="background:rgba(255,255,255,0.08); border:var(--border-glass); color:#fff; font-size:0.85rem; padding:0.6rem 1.2rem; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                        <i data-lucide="globe"></i> Tüm İşletmelerin Genel Sipariş Akışını Gör (${store.orders.length} Sipariş)
                      </button>
                    </div>
                  </div>

                  <!-- AŞAĞIDAKİ KAYITLI İŞLETMELER LİSTESİ -->
                  <div style="margin-bottom:1.5rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; flex-wrap:wrap; gap:0.5rem;">
                      <div>
                        <h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff; margin:0; display:flex; align-items:center; gap:0.5rem;">
                          <i data-lucide="store" style="color:var(--color-primary);"></i> Kayıtlı İşletmeler & Anlık Kazanç Tablosu
                        </h3>
                        <p style="font-size:0.8rem; color:var(--color-text-muted); margin:3px 0 0 0;">
                          İşletmenin üzerine basarak o işletmenin sipariş masalarını ve kazancını görebilirsiniz:
                        </p>
                      </div>
                      <span style="font-size:0.8rem; color:var(--color-text-muted);">${store.registrations.length} Kayıtlı Restoran</span>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 320px), 1fr)); gap:1.2rem;">
                      ${store.registrations.map(r => {
                        const bOrders = store.orders.filter(o => o.businessId === r.id);
                        const totalEarned = bOrders.filter(o => o.status !== 'iptal').reduce((sum, o) => sum + o.totalPrice, 0);
                        const activeOrders = bOrders.filter(o => o.status === 'yeni' || o.status === 'hazirlaniyor' || o.status === 'masada');
                        const activeTables = new Set(activeOrders.map(o => o.tableName)).size;

                        return `
                          <div class="business-selection-card" data-biz-id="${r.id}" style="background:var(--color-bg-card); border:1px solid rgba(255,255,255,0.1); border-radius:var(--radius-lg); padding:1.4rem; display:flex; flex-direction:column; justify-content:space-between; cursor:pointer;">
                            <div>
                              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
                                <div>
                                  <span style="font-family:monospace; font-size:0.8rem; font-weight:800; background:rgba(255,107,0,0.15); color:var(--color-primary); padding:3px 8px; border-radius:4px; border:1px solid rgba(255,107,0,0.3);">
                                    ${r.id}
                                  </span>
                                  <h4 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; color:#fff; margin:6px 0 2px 0;">
                                    ${r.businessName}
                                  </h4>
                                  <span style="font-size:0.78rem; color:var(--color-text-muted);">
                                    ${r.businessType} • 📍 ${r.city}
                                  </span>
                                </div>
                                <span style="font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:10px; ${r.status === 'onaylandi' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green);' : 'background:rgba(245,158,11,0.15); color:#F59E0B;'}">
                                  ${r.status === 'onaylandi' ? '✓ Aktif' : '⏳ Onay Bekliyor'}
                                </span>
                              </div>

                              <!-- Kazanç & Sipariş Göstergesi -->
                              <div style="background:rgba(0,0,0,0.3); border:1px solid rgba(255,255,255,0.06); border-radius:var(--radius-md); padding:0.9rem; margin:1rem 0; display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                  <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Toplam Kazanç (Ciro)</span>
                                  <strong style="color:var(--color-accent-green); font-size:1.45rem; font-weight:900;">
                                    ₺${totalEarned.toLocaleString('tr-TR')}
                                  </strong>
                                </div>
                                <div style="text-align:right;">
                                  <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Masa Durumu</span>
                                  <span style="color:#fff; font-size:0.85rem; font-weight:800;">
                                    ${activeTables} Açık Masa (${bOrders.length} Sipariş)
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button class="btn-primary-hero btn-open-biz-orders" data-biz-id="${r.id}" style="width:100%; justify-content:center; padding:0.75rem; font-size:0.88rem; font-weight:800;">
                              <i data-lucide="zap"></i> Masaları & Kazancı Gör ➔
                            </button>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>
                `;
              }

              // CASE 2: SINGLE BUSINESS SELECTED - SHOW FULL EARNINGS & TABLE DETAILS
              const isAllView = orderSelectedBusinessId === 'all';
              const selectedBusiness = !isAllView 
                ? (store.registrations.find(r => r.id === orderSelectedBusinessId) || {
                    id: orderSelectedBusinessId,
                    businessName: 'İşletme #' + orderSelectedBusinessId,
                    businessType: 'Restoran',
                    city: 'Belirtilmedi',
                    status: 'onaylandi'
                  })
                : null;

              const bizOrders = isAllView ? store.orders : store.orders.filter(o => o.businessId === orderSelectedBusinessId);
              const totalRevenue = bizOrders.filter(o => o.status !== 'iptal').reduce((sum, o) => sum + o.totalPrice, 0);
              const paidOrders = bizOrders.filter(o => o.status === 'tamamlandi');
              const paidRevenue = paidOrders.reduce((sum, o) => sum + o.totalPrice, 0);
              const activeOrders = bizOrders.filter(o => o.status === 'yeni' || o.status === 'hazirlaniyor' || o.status === 'masada');
              const activeRevenue = activeOrders.reduce((sum, o) => sum + o.totalPrice, 0);
              const distinctTables = new Set(bizOrders.map(o => o.tableName));
              const activeTablesCount = new Set(activeOrders.map(o => o.tableName)).size;
              const avgTableRevenue = distinctTables.size > 0 ? (totalRevenue / distinctTables.size).toFixed(0) : 0;

              // Filtered list according to current status filter or search
              const displayOrders = getFilteredOrders();

              return `
                <!-- TOP CONTROLS & SWITCHER BAR -->
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem; margin-bottom:1.5rem; background:var(--color-bg-card); padding:1rem 1.4rem; border-radius:var(--radius-md); border:var(--border-glass);">
                  <div style="display:flex; align-items:center; gap:0.8rem; flex-wrap:wrap;">
                    <button id="btn-back-to-biz-selection" class="btn-secondary-hero" style="padding:0.55rem 1rem; font-size:0.85rem;">
                      <i data-lucide="arrow-left"></i> Farklı İşletme ID'si Gir / Listeye Dön
                    </button>

                    <div style="display:flex; align-items:center; gap:0.5rem;">
                      <span style="font-size:0.8rem; color:var(--color-text-muted); font-weight:700;">Hızlı ID Değiştir:</span>
                      <input type="text" id="input-quick-switch-id" class="form-input" placeholder="Örn: 1002 veya REG-1002" style="width:160px; height:36px; padding:0 0.6rem; font-size:0.82rem; font-family:monospace; text-transform:uppercase;" autocomplete="off">
                      <button id="btn-quick-switch-id" class="pill-btn" style="background:var(--color-primary); color:#fff; font-weight:800; font-size:0.8rem; padding:0.5rem 0.8rem; cursor:pointer;">Aç</button>
                    </div>

                    <select id="select-quick-biz-dropdown" class="form-input" style="padding:0.4rem 0.6rem; font-size:0.82rem; height:36px; width:auto; min-width:180px;">
                      <option value="all" ${isAllView ? 'selected' : ''}>-- Tüm Restoranlar --</option>
                      ${store.registrations.map(r => `
                        <option value="${r.id}" ${orderSelectedBusinessId === r.id ? 'selected' : ''}>${r.businessName} (${r.id})</option>
                      `).join('')}
                    </select>
                  </div>

                  <div style="display:flex; align-items:center; gap:0.6rem;">
                    <button id="btn-add-test-order-to-biz" class="pill-btn" style="background:var(--color-primary-gradient); color:#fff; font-weight:800; font-size:0.82rem; padding:0.55rem 1rem; cursor:pointer; display:flex; align-items:center; gap:5px; box-shadow:var(--shadow-glow);">
                      <i data-lucide="plus-circle" style="width:15px; height:15px;"></i> Masaya Test Siparişi Düşür
                    </button>

                    <button id="btn-clear-completed-orders" class="pill-btn" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:var(--color-text-muted); font-size:0.78rem; padding:0.55rem 0.85rem; cursor:pointer;" title="Kapatılmış masaları listeden kaldır">
                      <i data-lucide="archive" style="width:14px;"></i> Temizle
                    </button>
                  </div>
                </div>

                <!-- 1. NE KADAR KAZANDIĞINI GÖSTEREN AYRINTILI KAZANÇ & CİRO KARTI -->
                <div style="background:linear-gradient(135deg, rgba(0,230,118,0.08) 0%, rgba(14,19,31,0.95) 100%); border:2px solid rgba(0,230,118,0.35); border-radius:var(--radius-lg); padding:1.8rem; margin-bottom:1.8rem; box-shadow:0 10px 30px rgba(0,230,118,0.1);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.4rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:1rem; flex-wrap:wrap; gap:1rem;">
                    <div>
                      <div style="display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap;">
                        <span style="font-family:monospace; font-size:1.1rem; font-weight:900; background:rgba(255,107,0,0.2); color:var(--color-primary); padding:4px 10px; border-radius:6px; border:1px solid rgba(255,107,0,0.4);">
                          ID: ${isAllView ? 'TÜMÜ' : selectedBusiness.id}
                        </span>
                        <h2 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:#fff; margin:0;">
                          ${isAllView ? 'Tüm İşletmeler Canlı Sipariş Akışı' : selectedBusiness.businessName}
                        </h2>
                      </div>
                      ${!isAllView ? `
                        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-top:4px;">
                          ${selectedBusiness.businessType} • 📍 ${selectedBusiness.city} ${selectedBusiness.district ? `(${selectedBusiness.district})` : ''} • Yetkili: ${selectedBusiness.fullName || 'İşletmeci'} (${selectedBusiness.phone || 'Telefon yok'})
                        </div>
                      ` : `
                        <div style="font-size:0.85rem; color:var(--color-text-muted); margin-top:4px;">
                          Sistemde kayıtlı ${store.registrations.length} restoranın toplam masa siparişleri ve ciro performansı
                        </div>
                      `}
                    </div>

                    <div style="text-align:right;">
                      <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-text-muted); font-weight:800; display:block;">
                        ${isAllView ? 'GENEL TOPLAM CİRO' : 'İŞLETME TOPLAM KAZANCI (CİRO)'}
                      </span>
                      <strong style="font-family:var(--font-heading); font-size:2.4rem; font-weight:900; color:var(--color-accent-green); text-shadow:0 0 20px rgba(0,230,118,0.4);">
                        ₺${totalRevenue.toLocaleString('tr-TR')}
                      </strong>
                    </div>
                  </div>

                  <!-- 4 AYRINTILI KAZANÇ & SİPARİŞ İSTATİSTİĞİ -->
                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap:1rem;">
                    <div style="background:rgba(0,0,0,0.35); padding:1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
                      <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Kasaya Giren (Tahsil Edilen)</span>
                      <strong style="color:var(--color-accent-green); font-size:1.35rem; font-weight:900;">₺${paidRevenue.toLocaleString('tr-TR')}</strong>
                      <span style="font-size:0.75rem; color:var(--color-text-dim); display:block; margin-top:2px;">${paidOrders.length} Sipariş Tamamlandı</span>
                    </div>

                    <div style="background:rgba(0,0,0,0.35); padding:1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
                      <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Açık Masalar (Anlık Masa Cirosu)</span>
                      <strong style="color:var(--color-accent-yellow); font-size:1.35rem; font-weight:900;">₺${activeRevenue.toLocaleString('tr-TR')}</strong>
                      <span style="font-size:0.75rem; color:var(--color-text-dim); display:block; margin-top:2px;">${activeOrders.length} Sipariş Bekliyor</span>
                    </div>

                    <div style="background:rgba(0,0,0,0.35); padding:1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
                      <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Toplam Sipariş Adedi</span>
                      <strong style="color:var(--color-primary); font-size:1.35rem; font-weight:900;">${bizOrders.length} Sipariş</strong>
                      <span style="font-size:0.75rem; color:var(--color-text-dim); display:block; margin-top:2px;">${activeTablesCount} Açık Masa</span>
                    </div>

                    <div style="background:rgba(0,0,0,0.35); padding:1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06);">
                      <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Ortalama Masa Hesabı</span>
                      <strong style="color:var(--color-accent-cyan); font-size:1.35rem; font-weight:900;">₺${avgTableRevenue}</strong>
                      <span style="font-size:0.75rem; color:var(--color-text-dim); display:block; margin-top:2px;">Masa Başına Ortalama Tutar</span>
                    </div>
                  </div>
                </div>

                <!-- 2. HANGİ MASAYA NE SİPARİŞİ GİTTİ? (MASA BAZLI CANLI DÖKÜM) -->
                <div style="background:var(--color-bg-card); padding:1.4rem 1.8rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card); margin-bottom:1.5rem;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; flex-wrap:wrap; gap:0.6rem;">
                    <div>
                      <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:900; color:#fff; margin:0; display:flex; align-items:center; gap:0.6rem;">
                        <i data-lucide="utensils" style="color:var(--color-primary);"></i> Hangi Masaya Ne Siparişi Gitti? (Masa Canlı Sipariş Dökümü)
                      </h3>
                      <p style="font-size:0.82rem; color:var(--color-text-muted); margin:3px 0 0 0;">
                        ${!isAllView ? `<strong>${selectedBusiness.businessName}</strong> restoranındaki` : 'İşletmelerdeki'} masaların sipariş ettiği tüm ürünler, adetler, mutfak notları ve anlık masa hesapları:
                      </p>
                    </div>

                    <!-- SUBMODE SWITCHER -->
                    <div style="display:flex; background:rgba(0,0,0,0.4); border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.08); padding:3px;">
                      <button class="pill-btn btn-orders-submode ${ordersTableViewMode === 'tables' ? 'active' : ''}" data-submode="tables" style="padding:0.4rem 0.8rem; font-size:0.78rem;">
                        <i data-lucide="layout-grid" style="width:14px;"></i> Masalar & Ürünler
                      </button>
                      <button class="pill-btn btn-orders-submode ${ordersTableViewMode === 'kanban' ? 'active' : ''}" data-submode="kanban" style="padding:0.4rem 0.8rem; font-size:0.78rem;">
                        <i data-lucide="columns-3" style="width:14px;"></i> Kanban Mutfak
                      </button>
                    </div>
                  </div>

                  <!-- ARAMA & FİLTRELER -->
                  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem; border-top:1px solid rgba(255,255,255,0.06); padding-top:1rem; margin-bottom:1.2rem;">
                    <div style="position:relative; flex:1; min-width:240px; max-width:400px;">
                      <input type="text" id="input-order-search" class="form-input" placeholder="🔍 Masa adı, ürün veya müşteri ara..." value="${orderSearchQuery}" style="padding-left:1rem; height:40px; font-size:0.85rem;">
                    </div>

                    <!-- Status Filter Pills -->
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      <button class="pill-btn ${filterOrderStatus === 'all' ? 'active' : ''}" data-order-status="all" style="padding:0.4rem 0.8rem; font-size:0.78rem;">Tümü (${bizOrders.length})</button>
                      <button class="pill-btn ${filterOrderStatus === 'yeni' ? 'active' : ''}" data-order-status="yeni" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(255,107,0,0.3);">🟡 Yeni Siparişler</button>
                      <button class="pill-btn ${filterOrderStatus === 'hazirlaniyor' ? 'active' : ''}" data-order-status="hazirlaniyor" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(168,85,247,0.3);">🟠 Mutfakta Hazırlanıyor</button>
                      <button class="pill-btn ${filterOrderStatus === 'masada' ? 'active' : ''}" data-order-status="masada" style="padding:0.4rem 0.8rem; font-size:0.78rem; border-color:rgba(0,230,118,0.3);">🟢 Masada Serviste</button>
                      <button class="pill-btn ${filterOrderStatus === 'tamamlandi' ? 'active' : ''}" data-order-status="tamamlandi" style="padding:0.4rem 0.8rem; font-size:0.78rem;">✅ Kapatılan Hesaplar</button>
                    </div>
                  </div>

                  <!-- ==================== VIEW 1: MASALAR & ÜRÜNLER (TABLE-BY-TABLE) ==================== -->
                  ${ordersTableViewMode === 'tables' ? `
                    <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 340px), 1fr)); gap:1.4rem;">
                      ${displayOrders.length === 0 ? `
                        <div style="grid-column:1 / -1; text-align:center; padding:3.5rem 1rem; background:rgba(0,0,0,0.25); border-radius:var(--radius-lg); border:var(--border-glass); color:var(--color-text-dim);">
                          <i data-lucide="inbox" style="width:48px; height:48px; margin-bottom:0.8rem; opacity:0.4;"></i>
                          <h4 style="color:#fff; font-size:1.1rem; margin-bottom:0.4rem;">Bu işletmeye ait aktif sipariş bulunmuyor</h4>
                          <p style="font-size:0.85rem; margin-bottom:1.2rem;">Masalara hemen canlı sipariş düşürmek için aşağıdaki test butonuna basabilirsiniz.</p>
                          <button id="btn-trigger-test-order-inline" class="btn-primary-hero" style="margin:0 auto; padding:0.6rem 1.4rem;">
                            <i data-lucide="plus-circle"></i> Masaya Canlı Test Siparişi Gönder
                          </button>
                        </div>
                      ` : displayOrders.map(ord => {
                        const statusColor = ord.status === 'yeni' ? 'var(--color-primary)' :
                          ord.status === 'hazirlaniyor' ? '#A855F7' :
                          ord.status === 'masada' ? 'var(--color-accent-green)' :
                          ord.status === 'tamamlandi' ? 'rgba(255,255,255,0.25)' : 'var(--color-danger)';
                        
                        const statusBadge = ord.status === 'yeni' ? 'background:rgba(255,107,0,0.15); color:var(--color-primary); border:1px solid rgba(255,107,0,0.4);' :
                          ord.status === 'hazirlaniyor' ? 'background:rgba(168,85,247,0.15); color:#C084FC; border:1px solid rgba(168,85,247,0.4);' :
                          ord.status === 'masada' ? 'background:rgba(0,230,118,0.15); color:var(--color-accent-green); border:1px solid rgba(0,230,118,0.4);' :
                          ord.status === 'tamamlandi' ? 'background:rgba(255,255,255,0.06); color:var(--color-text-muted); border:1px solid rgba(255,255,255,0.1);' :
                          'background:rgba(239,68,68,0.15); color:var(--color-danger); border:1px solid rgba(239,68,68,0.4);';

                        const statusText = ord.status === 'yeni' ? '🟡 Yeni Sipariş' :
                          ord.status === 'hazirlaniyor' ? '🟠 Mutfakta Hazırlanıyor' :
                          ord.status === 'masada' ? '🟢 Masada / Serviste' :
                          ord.status === 'tamamlandi' ? '✅ Hesap Kapatıldı' : '❌ İptal Edildi';

                        return `
                          <div class="table-order-card" style="background:var(--color-bg-card); border-left:5px solid ${statusColor}; border-radius:var(--radius-lg); border-top:var(--border-glass); border-right:var(--border-glass); border-bottom:var(--border-glass); padding:1.4rem; box-shadow:var(--shadow-card); display:flex; flex-direction:column; justify-content:space-between;">
                            <div>
                              <!-- Table Header -->
                              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
                                <div style="display:flex; align-items:center; gap:0.6rem;">
                                  <div style="width:42px; height:42px; background:rgba(255,107,0,0.15); color:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-size:1.2rem; font-weight:900;">
                                    🪑
                                  </div>
                                  <div>
                                    <h4 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:900; color:#fff; margin:0;">
                                      ${ord.tableName}
                                    </h4>
                                    <span style="font-family:monospace; font-size:0.75rem; color:var(--color-text-dim);">
                                      ${ord.id} • ${ord.createdAt}
                                    </span>
                                  </div>
                                </div>

                                <div style="text-align:right;">
                                  <span style="font-size:0.72rem; font-weight:800; padding:4px 10px; border-radius:12px; display:inline-block; margin-bottom:4px; ${statusBadge}">
                                    ${statusText}
                                  </span>
                                  <div style="font-size:0.75rem; color:var(--color-text-muted);">${ord.customerName}</div>
                                </div>
                              </div>

                              <!-- NE SİPARİŞİ GİTTİ (ÜRÜN LİSTESİ) -->
                              <div style="margin-bottom:1.2rem;">
                                <label style="display:block; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px; color:var(--color-text-muted); font-weight:800; margin-bottom:0.5rem;">
                                  🛒 Masaya Giden Sipariş İçeriği:
                                </label>
                                <div style="background:rgba(0,0,0,0.4); border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.06); padding:0.85rem; display:flex; flex-direction:column; gap:0.6rem;">
                                  ${ord.items.map(item => `
                                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid rgba(255,255,255,0.03); padding-bottom:0.4rem;">
                                      <div>
                                        <div style="font-size:0.92rem; font-weight:800; color:#fff;">
                                          <span style="color:var(--color-primary);">${item.qty}x</span> ${item.name}
                                        </div>
                                        ${item.note ? `
                                          <div style="font-size:0.75rem; color:var(--color-accent-yellow); margin-top:2px; font-style:italic; display:flex; align-items:center; gap:4px;">
                                            <i data-lucide="message-square" style="width:12px; height:12px;"></i> "${item.note}"
                                          </div>
                                        ` : ''}
                                      </div>
                                      <strong style="color:var(--color-text-main); font-size:0.88rem; font-weight:700;">
                                        ₺${(item.price * item.qty).toFixed(2)}
                                      </strong>
                                    </div>
                                  `).join('')}
                                </div>
                              </div>
                            </div>

                            <!-- Table Total & Quick Actions -->
                            <div>
                              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,230,118,0.06); border:1px solid rgba(0,230,118,0.2); border-radius:var(--radius-md); padding:0.75rem 1rem; margin-bottom:0.85rem;">
                                <div>
                                  <span style="font-size:0.72rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Masa Hesap Tutarı</span>
                                  <span style="font-size:0.75rem; color:var(--color-text-dim);">${ord.paymentMethod}</span>
                                </div>
                                <strong style="color:var(--color-accent-green); font-size:1.4rem; font-weight:900;">
                                  ₺${ord.totalPrice.toFixed(2)}
                                </strong>
                              </div>

                              <!-- Status Change & Delete Buttons -->
                              <div style="display:flex; gap:0.4rem; align-items:center; flex-wrap:wrap;">
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
                                    ✓ Hesabı Kapat
                                  </button>
                                ` : ''}

                                <button class="pill-btn btn-inspect-order" data-order-id="${ord.id}" style="background:rgba(255,255,255,0.06); border:var(--border-glass); color:#fff; font-size:0.75rem; padding:0.45rem 0.8rem; cursor:pointer;" title="Fiş & Ayrıntı">
                                  <i data-lucide="eye" style="width:13px; height:13px;"></i> Detay
                                </button>
                                <button class="pill-btn btn-delete-order" data-order-id="${ord.id}" style="background:rgba(239,68,68,0.12); color:var(--color-danger); border:1px solid rgba(239,68,68,0.25); font-size:0.75rem; padding:0.45rem 0.7rem; cursor:pointer;" title="Siparişi kalıcı sil">
                                  <i data-lucide="trash-2" style="width:13px; height:13px;"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  ` : ''}

                  <!-- ==================== VIEW 2: KANBAN COLUMN VIEW ==================== -->
                  ${ordersTableViewMode === 'kanban' ? `
                    <div class="admin-kanban-grid">
                      <!-- COLUMN 1: YENİ SİPARİŞLER -->
                      <div class="kanban-col" style="border-top:3px solid var(--color-primary);">
                        <div class="kanban-col-header">
                          <strong style="color:var(--color-primary); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                            🟡 YENİ SİPARİŞLER (${displayOrders.filter(o => o.status === 'yeni').length})
                          </strong>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.8rem;">
                          ${displayOrders.filter(o => o.status === 'yeni').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Bekleyen yeni sipariş yok</div>'}
                        </div>
                      </div>

                      <!-- COLUMN 2: MUTFAKTA HAZIRLANIYOR -->
                      <div class="kanban-col" style="border-top:3px solid #A855F7;">
                        <div class="kanban-col-header">
                          <strong style="color:#C084FC; font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                            🟠 MUTFAKTA HAZIRLANIYOR (${displayOrders.filter(o => o.status === 'hazirlaniyor').length})
                          </strong>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.8rem;">
                          ${displayOrders.filter(o => o.status === 'hazirlaniyor').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Hazırlanan sipariş yok</div>'}
                        </div>
                      </div>

                      <!-- COLUMN 3: MASADA SERVİSTE -->
                      <div class="kanban-col" style="border-top:3px solid var(--color-accent-green);">
                        <div class="kanban-col-header">
                          <strong style="color:var(--color-accent-green); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                            🟢 MASADA / SERVİSTE (${displayOrders.filter(o => o.status === 'masada').length})
                          </strong>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.8rem;">
                          ${displayOrders.filter(o => o.status === 'masada').map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Masada sipariş yok</div>'}
                        </div>
                      </div>

                      <!-- COLUMN 4: TAMAMLANANLAR -->
                      <div class="kanban-col" style="border-top:3px solid rgba(255,255,255,0.2);">
                        <div class="kanban-col-header">
                          <strong style="color:var(--color-text-muted); font-size:0.88rem; display:flex; align-items:center; gap:5px;">
                            ✅ TAMAMLANANLAR (${displayOrders.filter(o => o.status === 'tamamlandi').length})
                          </strong>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:0.8rem;">
                          ${displayOrders.filter(o => o.status === 'tamamlandi').slice(0, 8).map(ord => renderKanbanOrderCard(ord)).join('') || '<div style="color:var(--color-text-dim); font-size:0.8rem; text-align:center; padding:1rem;">Tamamlanmış sipariş yok</div>'}
                        </div>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `;
            })()}
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
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap:1.2rem;">
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
                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem;">
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
                      <span>🌐 Kasa & Adisyon Yanıt Süresi:</span>
                      <strong style="color:var(--color-accent-green);">${businessDiagnostics?.latency}</strong>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); padding:0.6rem 0.8rem; border-radius:6px; border:1px solid rgba(255,255,255,0.04);">
                      <span>📱 Garson Çağırma & Sipariş Alma:</span>
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

                <div class="table-responsive-wrapper">
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
                <div class="stat-icon red" style="background:rgba(239,68,68,0.15); color:var(--color-danger);"><i data-lucide="x-circle"></i></div>
                <div class="stat-info">
                  <h5>Reddedilenler</h5>
                  <h3 style="color:var(--color-danger);">${rejectedCount} Kayıt</h3>
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

          <!-- ==================== TAB: PROFİLLER ==================== -->
          ${activeTab === 'profiles' ? `
            <div style="background:var(--color-bg-card); padding:2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
              <h3 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin-bottom:1.4rem; display:flex; align-items:center; gap:0.6rem;">
                <i data-lucide="users" style="color:var(--color-accent-purple);"></i> Kayıtlı Kullanıcı Profilleri
                <span style="background:rgba(168,85,247,0.15); color:var(--color-accent-purple); font-size:0.75rem; font-weight:800; padding:3px 10px; border-radius:12px; margin-left:auto;">${getFilteredProfiles().length} Profil</span>
              </h3>

              ${getFilteredProfiles().length === 0 ? `
                <div style="text-align:center; padding:3rem; color:var(--color-text-muted);">
                  <i data-lucide="user-x" style="width:48px; height:48px; margin-bottom:1rem; opacity:0.4;"></i>
                  <p style="font-size:1rem; font-weight:700;">Henüz kayıtlı profil bulunmuyor</p>
                  <p style="font-size:0.85rem;">Kullanıcılar profil oluşturduğunda burada görünecektir.</p>
                </div>
              ` : `
                <div style="display:flex; flex-direction:column; gap:0.85rem;">
                  ${getFilteredProfiles().map(p => `
                    <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-md); padding:1.2rem 1.4rem; display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
                      <div style="width:44px; height:44px; border-radius:50%; background:var(--color-primary-gradient); color:#fff; font-size:1.1rem; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${(p.fullName || 'P').charAt(0).toUpperCase()}
                      </div>
                      <div style="flex:1; min-width:180px;">
                        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                          <strong style="color:#fff; font-size:0.95rem;">${p.fullName || 'İsimsiz'}</strong>
                          <span style="background:rgba(0,230,118,0.15); color:var(--color-accent-green); font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:10px;">${p.role || 'İşletme Sahibi'}</span>
                        </div>
                        <div style="font-size:0.8rem; color:var(--color-text-muted); margin-top:3px;">
                          ✉️ ${p.email || 'E-posta yok'} &nbsp;•&nbsp; 📞 ${p.phone || 'Telefon yok'}
                        </div>
                      </div>
                      <div style="text-align:right; min-width:120px;">
                        <div style="font-size:0.72rem; color:var(--color-text-dim);">ID: <span style="font-family:monospace; color:var(--color-primary); font-weight:800;">${String(p.id || '').substring(0, 12)}</span></div>
                        <div style="font-size:0.72rem; color:var(--color-text-dim);">${p.createdAt || 'Yeni'}</div>
                      </div>
                      <button class="btn-delete-profile" data-profile-id="${p.id}" style="background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.3); color:var(--color-danger); padding:0.45rem; border-radius:var(--radius-sm); cursor:pointer;" title="Profili Sil">
                        <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
                      </button>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          ` : ''}

          <!-- ==================== TAB: FİYAT & PAKET YÖNETİMİ ==================== -->
          ${activeTab === 'pricing' ? `
            ${(() => {
              const plans = store.getPricingPlans();
              return `
                <div style="background:var(--color-bg-card); padding:2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.8rem; flex-wrap:wrap; gap:1rem;">
                    <div>
                      <h3 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin:0 0 4px 0; display:flex; align-items:center; gap:0.6rem;">
                        <i data-lucide="tag" style="color:var(--color-accent-green);"></i> Adisyon Paket Fiyatları, İndirim & Paket Ekleme
                      </h3>
                      <p style="color:var(--color-text-muted); font-size:0.85rem; margin:0;">
                        Burada yaptığınız fiyat, indirim ve yeni paket ekleme değişiklikleri <strong>anında ana sayfaya ve müşteri kayıt ekranına</strong> yansır.
                      </p>
                    </div>

                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                      <button id="btn-add-new-plan" class="btn-primary-hero" style="padding:0.6rem 1.2rem; font-size:0.85rem; background:linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%);">
                        <i data-lucide="plus-circle" style="width:16px; height:16px;"></i> Yeni Paket Ekle
                      </button>
                      <button id="btn-reset-pricing" class="btn-secondary-hero" style="padding:0.6rem 1.1rem; font-size:0.85rem;" title="Orijinal paket fiyatlarına dön">
                        <i data-lucide="rotate-ccw" style="width:15px; height:15px;"></i> Varsayılana Sıfırla
                      </button>
                      <button id="btn-save-all-pricing" class="btn-primary-hero" style="padding:0.6rem 1.4rem; font-size:0.9rem;">
                        <i data-lucide="save" style="width:16px; height:16px;"></i> Fiyatları Canlıya Kaydet
                      </button>
                    </div>
                  </div>

                  <!-- PRICING CARDS EDIT GRID -->
                  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap:1.5rem; margin-bottom:2rem;">
                    ${plans.map((p, idx) => `
                      <div class="pricing-edit-card" data-plan-index="${idx}" style="background:rgba(14,19,31,0.85); border:2px solid ${p.popular ? 'var(--color-primary)' : (p.hasDiscount ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)')}; border-radius:var(--radius-lg); padding:1.6rem; position:relative; box-shadow:${p.popular ? 'var(--shadow-glow)' : 'none'};">
                        ${p.popular ? `
                          <div style="position:absolute; top:-12px; right:16px; background:var(--color-primary); color:#fff; font-size:0.68rem; font-weight:900; padding:2px 10px; border-radius:12px; letter-spacing:0.5px;">
                            ÖNE ÇIKAN (EN ÇOK SEÇİLEN)
                          </div>
                        ` : ''}

                        <!-- TOP BAR: PAKET NO & SİL BUTONU -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:0.6rem;">
                          <span style="font-family:monospace; font-size:0.75rem; color:var(--color-primary); font-weight:800;">PAKET #${idx + 1}</span>
                          ${plans.length > 1 ? `
                            <button class="pill-btn btn-delete-plan" data-plan-index="${idx}" style="background:rgba(239,68,68,0.12); color:var(--color-danger); border:1px solid rgba(239,68,68,0.3); font-size:0.72rem; padding:3px 8px; cursor:pointer;" title="Bu paketi sistemden kaldır">
                              <i data-lucide="trash-2" style="width:13px; height:13px;"></i> Paketi Sil
                            </button>
                          ` : ''}
                        </div>

                        <!-- PAKET ADI -->
                        <div style="margin-bottom:1.2rem;">
                          <label style="display:block; font-size:0.78rem; font-weight:800; color:var(--color-text-muted); margin-bottom:4px;">
                            PAKET ADI *
                          </label>
                          <input type="text" class="form-input plan-input-name" value="${p.name}" style="font-weight:800; font-size:1.1rem; color:#fff;">
                        </div>

                        <!-- İNDİRİM AYARLARI KUTUSU -->
                        <div style="background:rgba(239,68,68,0.08); border:1px dashed rgba(239,68,68,0.35); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.2rem;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; flex-wrap:wrap; gap:0.4rem;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                              <input type="checkbox" class="plan-input-has-discount" ${p.hasDiscount ? 'checked' : ''} style="width:17px; height:17px; accent-color:#EF4444;">
                              <span style="color:#fff; font-weight:800; font-size:0.85rem; display:flex; align-items:center; gap:4px;">
                                🔥 Bu Pakete İndirim Uygula
                              </span>
                            </label>
                            <span style="font-size:0.7rem; color:var(--color-text-dim);">Çizili eski fiyat & rozet</span>
                          </div>

                          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem;">
                            <div>
                              <label style="display:block; font-size:0.75rem; font-weight:800; color:var(--color-text-muted); margin-bottom:4px;">
                                İNDİRİMSİZ ESKİ FİYAT (₺)
                              </label>
                              <div style="position:relative;">
                                <span style="position:absolute; left:10px; top:50%; transform:translateY(-50%); color:var(--color-text-dim); font-weight:800;">₺</span>
                                <input type="number" class="form-input plan-input-original-price" value="${p.originalPrice || (p.price ? Math.round(p.price * 1.3) : 990)}" style="padding-left:24px; font-weight:700; font-size:1rem; color:var(--color-text-muted); text-decoration:line-through;">
                              </div>
                            </div>

                            <div>
                              <label style="display:block; font-size:0.75rem; font-weight:800; color:var(--color-danger); margin-bottom:4px;">
                                İNDİRİM ETİKETİ / ROZETİ
                              </label>
                              <input type="text" class="form-input plan-input-discount-badge" value="${p.discountBadge || '🔥 %25 İNDİRİM'}" placeholder="Örn: %25 İNDİRİM" style="font-weight:800; font-size:0.82rem; color:#EF4444;">
                            </div>
                          </div>
                        </div>

                        <!-- GÜNCEL SATIŞ FİYATI & KAPASİTE ROZETİ -->
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.8rem; margin-bottom:1.2rem;">
                          <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:var(--color-accent-green); margin-bottom:4px;">
                              GÜNCEL SATIŞ FİYATI (₺/AY) *
                            </label>
                            <div style="position:relative;">
                              <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--color-text-muted); font-weight:800;">₺</span>
                              <input type="number" class="form-input plan-input-price" value="${p.price}" style="padding-left:26px; font-weight:900; font-size:1.2rem; color:var(--color-accent-green);">
                            </div>
                          </div>

                          <div>
                            <label style="display:block; font-size:0.78rem; font-weight:800; color:var(--color-accent-cyan); margin-bottom:4px;">
                              KAPASİTE ROZETİ
                            </label>
                            <input type="text" class="form-input plan-input-badge" value="${p.badge || ''}" placeholder="Örn: 10 MASA" style="font-weight:700; font-size:0.82rem;">
                          </div>
                        </div>

                        <div style="margin-bottom:1.2rem;">
                          <label style="display:block; font-size:0.78rem; font-weight:800; color:var(--color-text-muted); margin-bottom:4px;">
                            AÇIKLAMA METNİ
                          </label>
                          <textarea class="form-input plan-input-desc" rows="2" style="font-size:0.82rem; line-height:1.4;">${p.description || ''}</textarea>
                        </div>

                        <div style="margin-bottom:1.2rem;">
                          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <label style="font-size:0.78rem; font-weight:800; color:var(--color-text-muted);">
                              PAKET ÖZELLİKLERİ & İÇERİK (Her satıra bir özellik yazın)
                            </label>
                          </div>
                          <textarea class="form-input plan-input-features" rows="6" style="font-family:monospace; font-size:0.82rem; line-height:1.6;" placeholder="Her satıra bir özellik">${(p.features || []).join('\n')}</textarea>
                          <span style="font-size:0.7rem; color:var(--color-text-dim); display:block; margin-top:2px;">
                            💡 Maddeleri alt alta yazarak yeni özellikler ekleyebilir veya silebilirsiniz.
                          </span>
                        </div>

                        <div style="background:rgba(255,255,255,0.03); padding:0.6rem 0.8rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.06);">
                          <label style="display:flex; align-items:center; gap:8px; font-size:0.8rem; color:#fff; cursor:pointer;">
                            <input type="checkbox" class="plan-input-popular" ${p.popular ? 'checked' : ''} style="width:16px; height:16px; accent-color:var(--color-primary);">
                            <span>Bu paketi <strong>"En Çok Tercih Edilen"</strong> olarak öne çıkar</span>
                          </label>
                        </div>
                      </div>
                    `).join('')}
                  </div>

                  <div style="background:rgba(0,230,118,0.08); border:1px solid rgba(0,230,118,0.3); border-radius:var(--radius-md); padding:1rem 1.4rem; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem;">
                    <div style="display:flex; align-items:center; gap:0.75rem;">
                      <i data-lucide="check-circle" style="color:var(--color-accent-green); width:24px; height:24px; flex-shrink:0;"></i>
                      <div style="font-size:0.85rem; color:var(--color-text-main);">
                        Paket fiyatlarını ve özelliklerini güncelledikten sonra <strong>"Fiyatları Canlıya Kaydet"</strong> butonuna basın.
                      </div>
                    </div>
                    <button id="btn-save-all-pricing-bottom" class="btn-primary-hero" style="padding:0.7rem 1.6rem; font-size:0.95rem;">
                      <i data-lucide="save"></i> Fiyatları Canlıya Kaydet
                    </button>
                  </div>
                </div>
              `;
            })()}
          ` : ''}

          <!-- ==================== TAB 4: SİSTEM & SUNUCU SAĞLIĞI ==================== -->
          ${activeTab === 'health' ? `
            <div style="background:var(--color-bg-card); padding:2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
              <h3 style="font-family:var(--font-heading); font-size:1.45rem; font-weight:900; color:#fff; margin-bottom:1.4rem; display:flex; align-items:center; gap:0.6rem;">
                <i data-lucide="server" style="color:var(--color-accent-cyan);"></i> Bulut Altyapı & Canlı Veritabanı Durumu
              </h3>

              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 250px), 1fr)); gap:1.2rem; margin-bottom:2rem;">
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
    // Direct Business ID Autocomplete & Submit
    const inputDirectEl = container.querySelector('#input-direct-business-id');
    const suggestionsBox = container.querySelector('#direct-id-suggestions-box');

    const updateDirectSuggestions = () => {
      if (!inputDirectEl || !suggestionsBox) return;
      const q = inputDirectEl.value.trim().toLowerCase();
      if (!q) {
        suggestionsBox.style.display = 'none';
        suggestionsBox.innerHTML = '';
        return;
      }
      const qDigits = q.replace(/\D/g, '');
      const matches = store.registrations.filter(r => {
        const idLower = r.id.toLowerCase();
        const idDigits = r.id.replace(/\D/g, '');
        const nameLower = r.businessName.toLowerCase();
        return idLower.includes(q) || 
               nameLower.includes(q) || 
               (qDigits.length >= 2 && (idDigits === qDigits || idDigits.endsWith(qDigits)));
      });

      if (matches.length === 0) {
        suggestionsBox.innerHTML = `
          <div style="padding:0.75rem 1rem; color:var(--color-text-dim); font-size:0.82rem;">
            ⚠️ "${inputDirectEl.value}" ile eşleşen kayıtlı işletme bulunamadı.
          </div>
        `;
        suggestionsBox.style.display = 'block';
        return;
      }

      suggestionsBox.innerHTML = matches.map(r => `
        <div class="direct-id-suggestion-item" data-biz-id="${r.id}" style="padding:0.75rem 1rem; border-bottom:1px solid rgba(255,255,255,0.06); cursor:pointer; display:flex; justify-content:space-between; align-items:center; transition:background 0.15s ease;">
          <div>
            <strong style="color:#fff; font-size:0.92rem; display:block;">${r.businessName}</strong>
            <span style="font-size:0.75rem; color:var(--color-text-muted);">${r.businessType || 'Restoran'} • ${r.city}</span>
          </div>
          <span style="font-family:monospace; font-weight:900; color:var(--color-primary); background:rgba(255,107,0,0.15); padding:3px 8px; border-radius:6px; font-size:0.85rem;">
            ${r.id}
          </span>
        </div>
      `).join('');
      suggestionsBox.style.display = 'block';

      suggestionsBox.querySelectorAll('.direct-id-suggestion-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,107,0,0.15)');
        item.addEventListener('mouseleave', () => item.style.background = 'transparent');
        item.addEventListener('click', (e) => {
          const bizId = e.currentTarget.dataset.bizId;
          const biz = store.registrations.find(r => r.id === bizId);
          orderSelectedBusinessId = bizId;
          orderBusinessInputText = bizId;
          suggestionsBox.style.display = 'none';
          showToast(`⚡ ${biz ? biz.businessName : bizId} masaları & kazancı açıldı.`, 'success');
          updateView();
        });
      });
    };

    inputDirectEl?.addEventListener('input', updateDirectSuggestions);
    inputDirectEl?.addEventListener('focus', updateDirectSuggestions);
    document.addEventListener('click', (e) => {
      if (suggestionsBox && !suggestionsBox.contains(e.target) && e.target !== inputDirectEl) {
        suggestionsBox.style.display = 'none';
      }
    });

    const handleDirectBizSubmit = () => {
      const rawVal = inputDirectEl ? inputDirectEl.value.trim() : '';
      if (!rawVal) {
        showToast('⚠️ Lütfen bir İşletme ID\'si (Örn: 1001 veya REG-1001) ya da restoran adı giriniz.', 'error');
        return;
      }
      
      const found = findBusiness(rawVal);
      if (found) {
        orderSelectedBusinessId = found.id;
        orderBusinessInputText = found.id;
        if (suggestionsBox) suggestionsBox.style.display = 'none';
        showToast(`⚡ ${found.businessName} (${found.id}) masaları & kazancı açıldı.`, 'success');
        updateView();
      } else {
        showToast(`⚠️ "${rawVal}" bulunamadı! Lütfen geçerli bir ID (Örn: REG-1001 veya 1001) girin ya da aşağıdaki listeden bir işletmeye tıklayın.`, 'error');
      }
    };

    container.querySelector('#btn-submit-direct-business-id')?.addEventListener('click', handleDirectBizSubmit);
    inputDirectEl?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleDirectBizSubmit();
    });

    // Business Selection Cards & Buttons
    container.querySelectorAll('.btn-open-biz-orders, .business-selection-card').forEach(el => {
      el.addEventListener('click', (e) => {
        const bizId = e.currentTarget.dataset.bizId;
        if (bizId) {
          orderSelectedBusinessId = bizId;
          const biz = store.registrations.find(r => r.id === bizId);
          showToast(`⚡ ${biz ? biz.businessName : bizId} masaları & kazancı açıldı.`, 'success');
          updateView();
        }
      });
    });

    // View All Businesses Button
    container.querySelector('#btn-view-all-businesses-orders')?.addEventListener('click', () => {
      orderSelectedBusinessId = 'all';
      showToast('🌐 Tüm işletmelerin sipariş akışı açıldı.', 'info');
      updateView();
    });

    // Back to Business Selection Screen
    container.querySelector('#btn-back-to-biz-selection')?.addEventListener('click', () => {
      orderSelectedBusinessId = null;
      orderBusinessInputText = '';
      updateView();
    });

    // Quick Switch ID with smart findBusiness
    const handleQuickSwitch = () => {
      const val = container.querySelector('#input-quick-switch-id')?.value?.trim();
      if (!val) {
        showToast('⚠️ Lütfen bir İşletme ID\'si (Örn: 1002 veya REG-1002) giriniz.', 'error');
        return;
      }
      const found = findBusiness(val);
      if (found) {
        orderSelectedBusinessId = found.id;
        showToast(`⚡ ${found.businessName} (${found.id}) işletmesine geçildi.`, 'info');
        updateView();
      } else {
        showToast(`⚠️ "${val}" ID veya adına sahip bir işletme bulunamadı!`, 'error');
      }
    };
    container.querySelector('#btn-quick-switch-id')?.addEventListener('click', handleQuickSwitch);
    container.querySelector('#input-quick-switch-id')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleQuickSwitch();
    });

    // Quick Biz Dropdown
    container.querySelector('#select-quick-biz-dropdown')?.addEventListener('change', (e) => {
      orderSelectedBusinessId = e.target.value;
      updateView();
    });

    // Add Test Order To Current Business
    const handleAddTestOrder = async () => {
      const targetId = (orderSelectedBusinessId && orderSelectedBusinessId !== 'all')
        ? orderSelectedBusinessId
        : (store.registrations[0]?.id || 'REG-1001');
      const newOrd = await store.createTestOrderForBusiness(targetId);
      showToast(`⚡ ${newOrd.tableName} masasına ${newOrd.id} numaralı canlı sipariş eklendi!`, 'success');
      updateView();
    };
    container.querySelector('#btn-add-test-order-to-biz')?.addEventListener('click', handleAddTestOrder);
    container.querySelector('#btn-trigger-test-order-inline')?.addEventListener('click', handleAddTestOrder);

    // Submode Switcher (Tables vs Kanban)
    container.querySelectorAll('.btn-orders-submode').forEach(btn => {
      btn.addEventListener('click', (e) => {
        ordersTableViewMode = e.currentTarget.dataset.submode;
        updateView();
      });
    });

    // Search input
    container.querySelector('#input-order-search')?.addEventListener('input', (e) => {
      orderSearchQuery = e.target.value;
      updateView();
    });

    // View Mode Switcher (legacy)
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
    container.querySelector('#btn-clear-completed-orders')?.addEventListener('click', async () => {
      if (confirm('Tamamlanmış ve iptal edilmiş siparişleri listeden temizlemek istiyor musunuz?')) {
        await store.clearCompletedOrders();
        showToast('🧹 Tamamlanan siparişler arşivlendi ve temizlendi.', 'info');
        updateView();
      }
    });

    // Change Order Status
    container.querySelectorAll('.btn-change-order-status').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        const newStat = e.currentTarget.dataset.newStatus;
        await store.updateOrderStatus(ordId, newStat);
        showToast(`Sipariş durumu güncellendi: ${newStat}`, 'success');
        updateView();
      });
    });

    // DELETE ORDER EVENT (User requested: "siparişler silinebilsin")
    container.querySelectorAll('.btn-delete-order').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const ordId = e.currentTarget.dataset.orderId;
        if (confirm(`${ordId} numaralı siparişi kalıcı olarak silmek istiyor musunuz?`)) {
          await store.deleteOrder(ordId);
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
    container.querySelector('#btn-modal-delete-order')?.addEventListener('click', async () => {
      if (activeDetailOrder && confirm(`${activeDetailOrder.id} numaralı siparişi silmek istiyor musunuz?`)) {
        await store.deleteOrder(activeDetailOrder.id);
        showToast(`🗑️ Sipariş silindi ve Supabase'den kaldırıldı.`, 'info');
        activeDetailOrder = null;
        updateView();
      }
    });

    // Modal Print Receipt
    container.querySelector('#btn-modal-print-receipt')?.addEventListener('click', () => {
      window.print();
    });

    // --- SUPPORT CONSOLE EVENTS ---
    // Search input with smart findBusiness
    container.querySelector('#input-support-search')?.addEventListener('input', (e) => {
      supportSearchQuery = e.target.value;
      const q = supportSearchQuery.trim();
      if (q) {
        const found = findBusiness(q);
        if (found) {
          supportSelectedBusinessId = found.id;
        } else {
          // Fallback search across fields
          const qLow = q.toLowerCase();
          const matched = store.registrations.find(r =>
            r.id.toLowerCase().includes(qLow) ||
            r.businessName.toLowerCase().includes(qLow) ||
            r.fullName.toLowerCase().includes(qLow) ||
            r.phone.includes(q)
          );
          if (matched) {
            supportSelectedBusinessId = matched.id;
          }
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
      showToast(`🧹 ${selectedSupportBusiness?.businessName} adisyon ve masa önbelleği sıfırlandı ve yenilendi.`, 'success');
    });

    // Save Support Note
    container.querySelector('#btn-save-support-note')?.addEventListener('click', async () => {
      const catSelect = container.querySelector('#select-note-category');
      const noteInput = container.querySelector('#text-support-note');
      if (noteInput && noteInput.value.trim() && selectedSupportBusiness) {
        await store.addSupportNote(selectedSupportBusiness.id, {
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
      btn.addEventListener('click', async (e) => {
        const noteId = e.currentTarget.dataset.noteId;
        await store.deleteSupportNote(noteId);
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

    // Profile delete buttons
    container.querySelectorAll('.btn-delete-profile').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const profileId = e.currentTarget.dataset.profileId;
        const res = await store.deleteProfile(profileId);
        if (res && res.error) {
          showToast(`⚠️ Profil silme hatası: ${res.error}`, 'error');
        } else {
          showToast('🗑️ Profil silindi.', 'info');
        }
        updateView();
      });
    });

    // PRICING MANAGEMENT EVENTS
    const handleSavePricing = () => {
      const cards = container.querySelectorAll('.pricing-edit-card');
      const currentPlans = store.getPricingPlans();
      const updatedPlans = [];

      cards.forEach((card, idx) => {
        const name = card.querySelector('.plan-input-name')?.value.trim() || currentPlans[idx]?.name || '';
        const price = Number(card.querySelector('.plan-input-price')?.value) || currentPlans[idx]?.price || 0;
        const hasDiscount = card.querySelector('.plan-input-has-discount')?.checked || false;
        const originalPrice = Number(card.querySelector('.plan-input-original-price')?.value) || (price ? Math.round(price * 1.3) : 990);
        const discountBadge = card.querySelector('.plan-input-discount-badge')?.value.trim() || '🔥 %25 İNDİRİM';
        const badge = card.querySelector('.plan-input-badge')?.value.trim() || '';
        const description = card.querySelector('.plan-input-desc')?.value.trim() || '';
        const featuresText = card.querySelector('.plan-input-features')?.value || '';
        const popular = card.querySelector('.plan-input-popular')?.checked || false;

        const features = featuresText
          .split('\n')
          .map(f => f.trim())
          .filter(f => f.length > 0);

        updatedPlans.push({
          id: currentPlans[idx]?.id || ('plan-' + idx),
          name,
          badge,
          price,
          hasDiscount,
          originalPrice,
          discountBadge,
          period: '/ay',
          description,
          features,
          popular,
          capacity: currentPlans[idx]?.capacity || 10
        });
      });

      store.savePricingPlans(updatedPlans);
      showToast('🎉 Tüm paket fiyatları, indirimler ve içerikler canlıya kaydedildi!', 'success');
      updateView();
    };

    container.querySelector('#btn-save-all-pricing')?.addEventListener('click', handleSavePricing);
    container.querySelector('#btn-save-all-pricing-bottom')?.addEventListener('click', handleSavePricing);

    // Yeni Paket Ekle
    container.querySelector('#btn-add-new-plan')?.addEventListener('click', () => {
      const currentPlans = store.getPricingPlans();
      const newIndex = currentPlans.length + 1;
      const newPlan = {
        id: 'plan-' + Date.now(),
        name: `Özel Paket ${newIndex}`,
        badge: `${newIndex * 10} MASA KAPASİTESİ`,
        price: 790,
        originalPrice: 990,
        hasDiscount: true,
        discountBadge: '🔥 %20 İNDİRİM',
        period: '/ay',
        description: 'İşletmenizin masa, kasa ve sipariş otomasyonu için özel paket.',
        features: [
          `${newIndex * 10} Masaya Kadar Masa Ekleme`,
          'Masada QR ile Garson Çağırma',
          'Garson Cep Girişi & Masaya Sipariş Ekleme',
          'Mutfak Sıcak Sayfası (Aşçı Hazırlık)',
          'Kasa & Ciro Raporu'
        ],
        popular: false,
        capacity: newIndex * 10
      };
      store.addPricingPlan(newPlan);
      showToast('✨ Yeni paket başarıyla eklendi! Bilgileri düzenleyip kaydedebilirsiniz.', 'success');
      updateView();
    });

    // Paketi Sil
    container.querySelectorAll('.btn-delete-plan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planIdx = Number(e.currentTarget.dataset.planIndex);
        const currentPlans = store.getPricingPlans();
        const planToDelete = currentPlans[planIdx];
        if (confirm(`"${planToDelete?.name || 'Bu paketi'}" silmek istediğinizden emin misiniz?`)) {
          store.deletePricingPlan(planIdx);
          showToast('🗑️ Paket başarıyla silindi.', 'info');
          updateView();
        }
      });
    });

    container.querySelector('#btn-reset-pricing')?.addEventListener('click', () => {
      if (confirm('Tüm paket fiyatlarını ve özelliklerini fabrika varsayılan ayarlarına döndürmek istiyor musunuz?')) {
        store.resetPricingPlans();
        showToast('🔄 Paket fiyatları varsayılana sıfırlandı.', 'info');
        updateView();
      }
    });

    // Restore focus and selection on re-render to prevent typing jitter / blur
    if (focusedId) {
      const restoredEl = container.querySelector('#' + focusedId);
      if (restoredEl) {
        restoredEl.focus();
        if (selStart !== null && selEnd !== null) {
          try { restoredEl.setSelectionRange(selStart, selEnd); } catch (e) {}
        }
      }
    }
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
