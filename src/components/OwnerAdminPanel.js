import { store } from '../state/store.js';

export function renderOwnerAdminPanel(container) {
  let filterRegStatus = 'all';

  function getFilteredRegistrations() {
    if (filterRegStatus === 'all') return store.registrations;
    return store.registrations.filter(r => r.status === filterRegStatus);
  }

  function updateView() {
    const activeTab = store.adminTab || 'registrations';
    const pendingRegsCount = store.getPendingCount();
    const approvedRegsCount = store.registrations.filter(r => r.status === 'onaylandi').length;
    const newOrdersCount = store.orders.filter(o => o.status === 'yeni').length;

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:1.8rem;">
        <!-- ADMIN TOP BANNER -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1.2rem; background:var(--color-bg-card); padding:1.5rem 2rem; border-radius:var(--radius-lg); border:var(--border-glass); box-shadow:var(--shadow-card);">
          <div>
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.3rem;">
              <div style="width:42px; height:42px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-glow);">
                <i data-lucide="shield-check" style="width:24px; height:24px;"></i>
              </div>
              <h1 style="font-family:var(--font-heading); font-size:2rem; font-weight:900; color:#fff;">
                Buyur<span style="color:var(--color-primary);">Abi</span> Admin Kontrol Merkezi
              </h1>
            </div>
            <p style="color:var(--color-text-muted); font-size:0.92rem; margin-left:50px;">
              İşletme kayıt başvurularını onaylayın, canlı mutfak siparişlerini yönetin ve QR kodları basın.
            </p>
          </div>

          <div style="display:flex; align-items:center; gap:1rem;">
            <!-- Sound Alert Toggle -->
            <button id="admin-toggle-sound-btn" style="background:${store.soundEnabled ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.06)'}; border:1px solid ${store.soundEnabled ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255,255,255,0.1)'}; color:${store.soundEnabled ? 'var(--color-accent-green)' : 'var(--color-text-muted)'}; padding:0.65rem 1.2rem; border-radius:var(--radius-full); font-weight:800; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}"></i>
              <span>${store.soundEnabled ? 'Mutfak Zili: AÇIK' : 'Mutfak Zili: KAPALI'}</span>
            </button>

            <!-- Test Order Trigger -->
            <button id="admin-btn-test-order" class="btn-primary-hero" style="padding:0.65rem 1.2rem; font-size:0.85rem;">
              <i data-lucide="plus-circle"></i> Test Siparişi Gönder
            </button>
          </div>
        </div>

        <!-- MAIN SUB-NAVIGATION TABS -->
        <div style="display:flex; gap:0.6rem; background:rgba(255,255,255,0.04); padding:0.4rem; border-radius:var(--radius-full); border:var(--border-glass); overflow-x:auto;">
          <button class="nav-btn ${activeTab === 'registrations' ? 'active' : ''}" data-tab="registrations">
            <i data-lucide="inbox"></i>
            <span>📋 İşletme Başvuru Onayları</span>
            <span class="admin-orders-badge" style="background:var(--color-primary);">${pendingRegsCount}</span>
          </button>

          <button class="nav-btn ${activeTab === 'kitchen' ? 'active' : ''}" data-tab="kitchen">
            <i data-lucide="chef-hat"></i>
            <span>👨‍🍳 Mutfak & Anlık Sipariş Paneli</span>
            <span class="admin-orders-badge">${newOrdersCount}</span>
          </button>

          <button class="nav-btn ${activeTab === 'menu' ? 'active' : ''}" data-tab="menu">
            <i data-lucide="utensils-crossed"></i>
            <span>🍔 Menü Stok Yönetimi</span>
          </button>

          <button class="nav-btn ${activeTab === 'qr' ? 'active' : ''}" data-tab="qr">
            <i data-lucide="qr-code"></i>
            <span>🖨️ Masa QR Kod Standları</span>
          </button>
        </div>

        <!-- TAB CONTENT AREA -->

        <!-- SUB TAB 1: REGISTRATIONS APPROVAL PANEL -->
        ${activeTab === 'registrations' ? `
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <!-- STATS ROW -->
            <div class="admin-top-stats">
              <div class="stat-card-admin">
                <div class="stat-icon orange"><i data-lucide="store"></i></div>
                <div class="stat-info">
                  <h5>Toplam Restoran Başvurusu</h5>
                  <h3>${store.registrations.length} Kayıt</h3>
                </div>
              </div>

              <div class="stat-card-admin">
                <div class="stat-icon purple"><i data-lucide="clock"></i></div>
                <div class="stat-info">
                  <h5>Onay Bekleyenler</h5>
                  <h3 style="color:var(--color-accent-yellow);">${pendingRegsCount} Başvuru</h3>
                </div>
              </div>

              <div class="stat-card-admin">
                <div class="stat-icon green"><i data-lucide="check-circle-2"></i></div>
                <div class="stat-info">
                  <h5>Onaylanan İşletmeler</h5>
                  <h3 style="color:var(--color-accent-green);">${approvedRegsCount} Aktif</h3>
                </div>
              </div>
            </div>

            <!-- REGISTRATION FILTER PILLS -->
            <div style="display:flex; gap:0.5rem; background:var(--color-bg-card); padding:0.8rem 1.2rem; border-radius:var(--radius-md); border:var(--border-glass);">
              <button class="pill-btn ${filterRegStatus === 'all' ? 'active' : ''}" data-filter-reg="all">Tümü (${store.registrations.length})</button>
              <button class="pill-btn ${filterRegStatus === 'bekliyor' ? 'active' : ''}" data-filter-reg="bekliyor">⏳ Onay Bekleyenler (${pendingRegsCount})</button>
              <button class="pill-btn ${filterRegStatus === 'onaylandi' ? 'active' : ''}" data-filter-reg="onaylandi">✅ Onaylananlar (${approvedRegsCount})</button>
              <button class="pill-btn ${filterRegStatus === 'reddedildi' ? 'active' : ''}" data-filter-reg="reddedildi">❌ Reddedilenler</button>
            </div>

            <!-- REGISTRATION CARDS -->
            <div style="display:flex; flex-direction:column; gap:1.2rem;">
              ${getFilteredRegistrations().map(reg => `
                <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); padding:1.5rem; border:${reg.status === 'bekliyor' ? '1px solid var(--color-accent-yellow)' : 'var(--border-glass)'}; box-shadow:var(--shadow-card); display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1.5rem; position:relative; overflow:hidden;">
                  ${reg.status === 'bekliyor' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-yellow);"></div>' : reg.status === 'onaylandi' ? '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-accent-green);"></div>' : '<div style="position:absolute; top:0; left:0; width:5px; height:100%; background:var(--color-danger);"></div>'}

                  <div style="flex:1; min-width:280px;">
                    <div style="display:flex; align-items:center; gap:0.75rem; margin-bottom:0.6rem;">
                      <div style="width:48px; height:48px; background:var(--color-primary-gradient); color:#fff; border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.3rem;">🏢</div>
                      <div>
                        <h3 style="font-family:var(--font-heading); font-size:1.35rem; font-weight:800; color:#fff;">${reg.businessName}</h3>
                        <div style="font-size:0.85rem; color:var(--color-primary); font-weight:700;">${reg.businessType || 'Restoran'} • ${reg.city}</div>
                      </div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; background:rgba(0,0,0,0.3); padding:0.85rem; border-radius:var(--radius-md); margin-top:0.8rem; font-size:0.85rem;">
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Yetkili Ad Soyad:</span><strong style="color:#fff;">${reg.fullName}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Cep Telefonu:</span><strong style="color:var(--color-accent-green);">${reg.phone}</strong></div>
                      <div><span style="color:var(--color-text-muted); display:block; font-size:0.75rem;">Tarih:</span><span style="color:var(--color-text-muted);">${reg.createdAt}</span></div>
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
          </div>
        ` : ''}

        <!-- SUB TAB 2: KITCHEN & ORDER KANBAN PANEL -->
        ${activeTab === 'kitchen' ? `
          <div style="display:flex; flex-direction:column; gap:1.5rem;">
            <!-- WAITER REQUEST ALERTS -->
            ${store.waiterRequests.length > 0 ? `
              <div class="waiter-alerts-panel">
                <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; color:var(--color-accent-blue); font-weight:800;">
                  <i data-lucide="bell-ring"></i> CANLI GARSON & HESAP İSTEKLERİ
                </div>
                <div class="waiter-cards-row">
                  ${store.waiterRequests.map(req => `
                    <div class="waiter-card">
                      <div style="width:36px; height:36px; background:${req.type === 'hesap' ? 'rgba(0,230,118,0.2)' : 'rgba(59,130,246,0.2)'}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:${req.type === 'hesap' ? 'var(--color-accent-green)' : 'var(--color-accent-blue)'}; font-weight:800;">
                        ${req.type === 'hesap' ? '💳' : '🛎️'}
                      </div>
                      <div style="flex:1;">
                        <strong style="color:#fff; font-size:0.9rem;">${req.tableName}</strong>
                        <div style="font-size:0.78rem; color:var(--color-text-muted);">${req.message}</div>
                      </div>
                      <button class="btn-dismiss btn-dismiss-req" data-req-id="${req.id}">Tamamlandı ✓</button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- KANBAN BOARD -->
            <div class="admin-kanban-board">
              <!-- COL 1: YENİ -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <div class="col-title" style="color:var(--color-primary);"><i data-lucide="flame"></i> Yeni Siparişler</div>
                  <span class="count-pill">${store.orders.filter(o => o.status === 'yeni').length}</span>
                </div>
                ${store.orders.filter(o => o.status === 'yeni').map(o => renderOrderCard(o)).join('')}
              </div>

              <!-- COL 2: HAZIRLANIYOR -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <div class="col-title" style="color:var(--color-accent-yellow);"><i data-lucide="cooking-pot"></i> Hazırlanıyor</div>
                  <span class="count-pill">${store.orders.filter(o => o.status === 'hazirlaniyor').length}</span>
                </div>
                ${store.orders.filter(o => o.status === 'hazirlaniyor').map(o => renderOrderCard(o)).join('')}
              </div>

              <!-- COL 3: MASADA -->
              <div class="kanban-col">
                <div class="kanban-col-header">
                  <div class="col-title" style="color:var(--color-accent-green);"><i data-lucide="check-circle-2"></i> Masada / Tamamlandı</div>
                  <span class="count-pill">${store.orders.filter(o => o.status === 'masada' || o.status === 'tamamlandi').length}</span>
                </div>
                ${store.orders.filter(o => o.status === 'masada' || o.status === 'tamamlandi').map(o => renderOrderCard(o)).join('')}
              </div>
            </div>
          </div>
        ` : ''}

        <!-- SUB TAB 3: MENU STOCK MANAGEMENT -->
        ${activeTab === 'menu' ? `
          <div style="background:var(--color-bg-card); border-radius:var(--radius-lg); padding:1.8rem; border:var(--border-glass);">
            <h3 style="font-family:var(--font-heading); font-size:1.4rem; font-weight:800; margin-bottom:1rem; color:#fff;">🍔 Menü & Stok Yönetimi</h3>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem;">
              ${store.menuItems.map(item => `
                <div style="background:rgba(15,23,42,0.8); padding:1rem; border-radius:var(--radius-md); border:var(--border-glass); display:flex; justify-content:space-between; align-items:center;">
                  <div style="display:flex; align-items:center; gap:0.75rem;">
                    <img src="${item.image}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
                    <div>
                      <strong style="font-size:0.9rem; color:#fff; display:block;">${item.name}</strong>
                      <span style="font-size:0.8rem; color:var(--color-primary); font-weight:800;">₺${item.price.toFixed(2)}</span>
                    </div>
                  </div>

                  <button class="btn-toggle-stock" data-item-id="${item.id}" style="background:${item.available ? 'rgba(0,230,118,0.15)' : 'rgba(239,68,68,0.15)'}; border:1px solid ${item.available ? 'rgba(0,230,118,0.4)' : 'rgba(239,68,68,0.4)'}; color:${item.available ? 'var(--color-accent-green)' : 'var(--color-danger)'}; padding:0.4rem 0.8rem; border-radius:12px; font-weight:800; font-size:0.78rem; cursor:pointer;">
                    ${item.available ? 'Satışta' : 'Tükendi'}
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- SUB TAB 4: MASA QR KODLARI -->
        ${activeTab === 'qr' ? `
          <div class="qr-generator-grid">
            ${store.tables.map(table => `
              <div class="table-qr-card">
                <div class="qr-card-logo">Buyur<span style="color:#FF6B00;">Abi</span> QR</div>
                <div class="qr-table-name">${table.name}</div>
                <div style="font-size:0.75rem; background:#F1F5F9; color:#475569; padding:2px 10px; border-radius:12px; font-weight:700; margin-bottom:0.8rem;">
                  ${table.zone} • ${table.capacity} Kişilik
                </div>

                <div class="qr-box">
                  <svg width="140" height="140" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="#FFFFFF"/>
                    <rect x="5" y="5" width="26" height="26" fill="#0F172A"/>
                    <rect x="9" y="9" width="18" height="18" fill="#FFFFFF"/>
                    <rect x="13" y="13" width="10" height="10" fill="#FF6B00"/>
                    <rect x="69" y="5" width="26" height="26" fill="#0F172A"/>
                    <rect x="73" y="9" width="18" height="18" fill="#FFFFFF"/>
                    <rect x="77" y="13" width="10" height="10" fill="#FF6B00"/>
                    <rect x="5" y="69" width="26" height="26" fill="#0F172A"/>
                    <rect x="9" y="73" width="18" height="18" fill="#FFFFFF"/>
                    <rect x="13" y="77" width="10" height="10" fill="#FF6B00"/>
                    <rect x="38" y="38" width="24" height="24" rx="4" fill="#FF6B00"/>
                    <text x="50" y="54" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">M${table.id}</text>
                  </svg>
                </div>

                <button class="btn-print-qr" onclick="alert('${table.name} QR Standı Yazdırılıyor...')">
                  <i data-lucide="printer" style="width:14px;"></i> QR Yazdır
                </button>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Bindings
    container.querySelectorAll('.nav-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.setAdminTab(e.currentTarget.dataset.tab);
      });
    });

    container.querySelector('#admin-toggle-sound-btn')?.addEventListener('click', () => {
      store.soundEnabled = !store.soundEnabled;
      updateView();
    });

    container.querySelector('#admin-btn-test-order')?.addEventListener('click', () => {
      store.addTestOrder();
      showToast('🔥 Yeni sipariş düştü!', 'success');
      updateView();
    });

    container.querySelectorAll('.pill-btn[data-filter-reg]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterRegStatus = e.currentTarget.dataset.filterReg;
        updateView();
      });
    });

    container.querySelectorAll('.btn-approve-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.approveRegistration(e.currentTarget.dataset.regId);
        showToast('✅ İşletme başvurusu onaylandı!', 'success');
        updateView();
      });
    });

    container.querySelectorAll('.btn-reject-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.rejectRegistration(e.currentTarget.dataset.regId);
        showToast('❌ Başvuru reddedildi.', 'info');
        updateView();
      });
    });

    container.querySelectorAll('.btn-delete-reg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.deleteRegistration(e.currentTarget.dataset.regId);
        showToast('🗑️ Başvuru silindi.', 'info');
        updateView();
      });
    });

    container.querySelectorAll('.btn-dismiss-req').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.dismissWaiterRequest(e.currentTarget.dataset.reqId);
        updateView();
      });
    });

    container.querySelectorAll('.btn-advance-order').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const orderId = e.currentTarget.dataset.orderId;
        const nextStatus = e.currentTarget.dataset.nextStatus;
        store.updateOrderStatus(orderId, nextStatus);
        updateView();
      });
    });

    container.querySelectorAll('.btn-toggle-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        store.toggleItemAvailability(e.currentTarget.dataset.itemId);
        updateView();
      });
    });
  }

  function renderOrderCard(order) {
    return `
      <div class="order-ticket ${order.status === 'yeni' ? 'new-order-flash' : ''}">
        <div class="ticket-header">
          <span class="table-badge">${order.tableName}</span>
          <span class="ticket-time">${order.time}</span>
        </div>
        <ul class="ticket-items-list">
          ${order.items.map(i => `<li class="ticket-item-row"><span><span class="ticket-item-qty">${i.qty}x</span> ${i.name}</span><strong>₺${(i.price*i.qty).toFixed(2)}</strong></li>`).join('')}
        </ul>
        <div class="ticket-footer">
          <div class="ticket-total">₺${order.totalPrice.toFixed(2)}</div>
          ${order.status === 'yeni' ? `<button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="hazirlaniyor">🍳 Hazırla</button>` : order.status === 'hazirlaniyor' ? `<button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="masada" style="border-color:var(--color-accent-green); color:var(--color-accent-green);">✅ Servis Et</button>` : `<button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="tamamlandi" style="border-color:var(--color-accent-blue); color:var(--color-accent-blue);">🏁 Kapat</button>`}
        </div>
      </div>
    `;
  }

  // Subscribe to store updates
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
