import { store } from '../state/store.js';

export function renderAdminPanel(container) {
  function updateView() {
    const orders = store.orders;
    const waiterReqs = store.waiterRequests;

    // Calculate Analytics
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalPrice, 0);
    const newOrders = orders.filter(o => o.status === 'yeni');
    const preparingOrders = orders.filter(o => o.status === 'hazirlaniyor');
    const completedOrders = orders.filter(o => o.status === 'masada' || o.status === 'tamamlandi');
    const activeTablesCount = store.tables.filter(t => t.status === 'dolu' || t.status === 'siparis_bekliyor').length;

    container.innerHTML = `
      <div class="admin-dashboard">
        <!-- ADMIN HEADER & CONTROLS -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; background:var(--color-bg-card); padding:1.2rem; border-radius:var(--radius-lg); border:var(--border-glass);">
          <div>
            <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800;">👨‍🍳 Mutfak & İşletme Admin Paneli</h2>
            <p style="color:var(--color-text-muted); font-size:0.88rem;">Masalardan gelen anlık siparişler ve mutfak iş akışı</p>
          </div>

          <div style="display:flex; align-items:center; gap:1rem;">
            <!-- Sound Toggle -->
            <button id="admin-toggle-sound" style="background:${store.soundEnabled ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.06)'}; border:1px solid ${store.soundEnabled ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255,255,255,0.1)'}; color:${store.soundEnabled ? 'var(--color-accent-green)' : 'var(--color-text-muted)'}; padding:0.6rem 1.1rem; border-radius:var(--radius-full); font-weight:700; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:0.5rem;">
              <i data-lucide="${store.soundEnabled ? 'volume-2' : 'volume-x'}"></i>
              <span>${store.soundEnabled ? 'Mutfak Zili: AÇIK' : 'Mutfak Zili: KAPALI'}</span>
            </button>

            <!-- Manage Menu Toggle -->
            <button id="btn-admin-manage-menu" class="btn-secondary-lg" style="padding:0.6rem 1.1rem; font-size:0.85rem;">
              <i data-lucide="edit-3"></i> Menü Stok Yönetimi
            </button>

            <!-- Add Demo Test Order -->
            <button id="btn-admin-add-test-order" class="btn-primary-lg" style="padding:0.6rem 1.1rem; font-size:0.85rem;">
              <i data-lucide="plus-circle"></i> Test Siparişi Düşür
            </button>
          </div>
        </div>

        <!-- TOP STATS CARDS -->
        <div class="admin-top-stats">
          <div class="stat-card-admin">
            <div class="stat-icon orange">
              <i data-lucide="banknote"></i>
            </div>
            <div class="stat-info">
              <h5>Günlük Toplam Ciro</h5>
              <h3>₺${totalRevenue.toFixed(2)}</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon green">
              <i data-lucide="shopping-bag"></i>
            </div>
            <div class="stat-info">
              <h5>Toplam Sipariş</h5>
              <h3>${orders.length} Adet</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon blue">
              <i data-lucide="layout-grid"></i>
            </div>
            <div class="stat-info">
              <h5>Dolu Masa Sayısı</h5>
              <h3>${activeTablesCount} / ${store.tables.length} Masa</h3>
            </div>
          </div>

          <div class="stat-card-admin">
            <div class="stat-icon purple">
              <i data-lucide="bell"></i>
            </div>
            <div class="stat-info">
              <h5>Bekleyen Garson/Hesap</h5>
              <h3>${waiterReqs.length} İste</h3>
            </div>
          </div>
        </div>

        <!-- WAITER & BILL REQUEST ALERTS -->
        ${waiterReqs.length > 0 ? `
          <div class="waiter-alerts-panel">
            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.75rem; color:var(--color-accent-blue); font-weight:800; font-size:0.95rem;">
              <i data-lucide="bell-ring" class="pulse"></i>
              <span>CANLI GARSON & HESAP TALEPLERİ</span>
            </div>
            <div class="waiter-cards-row">
              ${waiterReqs.map(req => `
                <div class="waiter-card">
                  <div style="width:36px; height:36px; background:${req.type === 'hesap' ? 'rgba(0,230,118,0.2)' : 'rgba(59,130,246,0.2)'}; border-radius:50%; display:flex; align-items:center; justify-content:center; color:${req.type === 'hesap' ? 'var(--color-accent-green)' : 'var(--color-accent-blue)'}; font-weight:800;">
                    ${req.type === 'hesap' ? '💳' : '🛎️'}
                  </div>
                  <div style="flex:1;">
                    <strong style="color:#fff; font-size:0.9rem;">${req.tableName}</strong>
                    <div style="font-size:0.78rem; color:var(--color-text-muted);">${req.message}</div>
                    <span style="font-size:0.7rem; color:var(--color-text-dim);">${req.time}</span>
                  </div>
                  <button class="btn-dismiss btn-dismiss-req" data-req-id="${req.id}">
                    Tamamlandı ✓
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- KANBAN BOARD FOR ORDERS -->
        <div class="admin-kanban-board">
          <!-- COLUMN 1: YENİ SİPARİŞLER -->
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="col-title" style="color:var(--color-primary);">
                <i data-lucide="flame"></i>
                <span>Yeni Siparişler</span>
              </div>
              <span class="count-pill" style="background:rgba(255,107,0,0.2); color:var(--color-primary);">${newOrders.length}</span>
            </div>

            ${newOrders.length === 0 ? `
              <div style="text-align:center; color:var(--color-text-dim); padding:2rem 0; font-size:0.85rem;">
                Bekleyen yeni sipariş yok.
              </div>
            ` : newOrders.map(order => renderOrderTicket(order)).join('')}
          </div>

          <!-- COLUMN 2: MUTFAKTA HAZIRLANIYOR -->
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="col-title" style="color:var(--color-accent-yellow);">
                <i data-lucide="cooking-pot"></i>
                <span>Hazırlanıyor</span>
              </div>
              <span class="count-pill" style="background:rgba(245,158,11,0.2); color:var(--color-accent-yellow);">${preparingOrders.length}</span>
            </div>

            ${preparingOrders.length === 0 ? `
              <div style="text-align:center; color:var(--color-text-dim); padding:2rem 0; font-size:0.85rem;">
                Hazırlanan sipariş yok.
              </div>
            ` : preparingOrders.map(order => renderOrderTicket(order)).join('')}
          </div>

          <!-- COLUMN 3: MASADA / TAMAMLANDI -->
          <div class="kanban-col">
            <div class="kanban-col-header">
              <div class="col-title" style="color:var(--color-accent-green);">
                <i data-lucide="check-circle-2"></i>
                <span>Masada / Tamamlandı</span>
              </div>
              <span class="count-pill" style="background:rgba(0,230,118,0.2); color:var(--color-accent-green);">${completedOrders.length}</span>
            </div>

            ${completedOrders.length === 0 ? `
              <div style="text-align:center; color:var(--color-text-dim); padding:2rem 0; font-size:0.85rem;">
                Tamamlanmış sipariş bulunmuyor.
              </div>
            ` : completedOrders.map(order => renderOrderTicket(order)).join('')}
          </div>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Bind event listeners
    container.querySelector('#admin-toggle-sound')?.addEventListener('click', () => {
      store.soundEnabled = !store.soundEnabled;
      updateView();
    });

    container.querySelector('#btn-admin-manage-menu')?.addEventListener('click', () => {
      openMenuManagementModal();
    });

    container.querySelector('#btn-admin-add-test-order')?.addEventListener('click', () => {
      createTestOrder();
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
  }

  function renderOrderTicket(order) {
    return `
      <div class="order-ticket ${order.status === 'yeni' ? 'new-order-flash' : ''}">
        <div class="ticket-header">
          <div>
            <span class="table-badge">${order.tableName}</span>
            <span style="font-size:0.8rem; font-weight:700; margin-left:6px; color:#fff;">${order.customerName}</span>
          </div>
          <span class="ticket-time">${order.time}</span>
        </div>

        <ul class="ticket-items-list">
          ${order.items.map(item => `
            <div>
              <li class="ticket-item-row">
                <span><span class="ticket-item-qty">${item.qty}x</span> ${item.name}</span>
                <span style="font-weight:700; color:var(--color-text-muted);">₺${(item.price * item.qty).toFixed(2)}</span>
              </li>
              ${item.note ? `<div class="ticket-item-note">Not: "${item.note}"</div>` : ''}
            </div>
          `).join('')}
        </ul>

        ${order.orderNote ? `
          <div style="background:rgba(255,255,255,0.04); padding:0.4rem; border-radius:4px; font-size:0.75rem; color:var(--color-accent-yellow); margin-bottom:0.5rem;">
            📌 Sipariş Notu: ${order.orderNote}
          </div>
        ` : ''}

        <div class="ticket-footer">
          <div>
            <div style="font-size:0.72rem; color:var(--color-text-muted);">${order.paymentMethod}</div>
            <div class="ticket-total">₺${order.totalPrice.toFixed(2)}</div>
          </div>

          <div>
            ${order.status === 'yeni' ? `
              <button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="hazirlaniyor">
                🍳 Hazırla
              </button>
            ` : order.status === 'hazirlaniyor' ? `
              <button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="masada" style="border-color:var(--color-accent-green); color:var(--color-accent-green);">
                ✅ Masaya Servis
              </button>
            ` : `
              <button class="btn-status-change btn-advance-order" data-order-id="${order.id}" data-next-status="tamamlandi" style="border-color:var(--color-accent-blue); color:var(--color-accent-blue);">
                🏁 Kapat
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }

  function createTestOrder() {
    const randomTableId = Math.floor(1 + Math.random() * 6);
    const item1 = store.menuItems[Math.floor(Math.random() * store.menuItems.length)];
    const item2 = store.menuItems[Math.floor(Math.random() * store.menuItems.length)];

    store.cart.tableId = randomTableId;
    store.cart.tableName = `Masa ${randomTableId}`;
    store.cart.items = [
      { id: item1.id, name: item1.name, price: item1.price, qty: 1, note: "Sıcak gelsin" },
      { id: item2.id, name: item2.name, price: item2.price, qty: 2, note: "" }
    ];
    store.cart.note = "Test Siparişi";
    store.cart.paymentMethod = "Masada Kredi Kartı";

    store.submitOrder("Test Müşterisi");
    updateView();
  }

  function openMenuManagementModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:600px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:var(--border-glass);">
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800;">
            <i data-lucide="edit-3" style="color:var(--color-primary);"></i> Menü Stok & Durum Yönetimi
          </h3>
          <button style="background:transparent; border:none; color:#fff; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div style="max-height:400px; overflow-y:auto; margin-bottom:1rem;">
          ${store.menuItems.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px solid rgba(255,255,255,0.06);">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <img src="${item.image}" alt="${item.name}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
                <div>
                  <strong style="font-size:0.88rem; color:#fff;">${item.name}</strong>
                  <div style="font-size:0.75rem; color:var(--color-primary);">₺${item.price.toFixed(2)}</div>
                </div>
              </div>

              <button class="btn-toggle-stock" data-item-id="${item.id}" style="background:${item.available ? 'rgba(0,230,118,0.15)' : 'rgba(239,68,68,0.15)'}; border:1px solid ${item.available ? 'rgba(0,230,118,0.4)' : 'rgba(239,68,68,0.4)'}; color:${item.available ? 'var(--color-accent-green)' : 'var(--color-danger)'}; padding:4px 10px; border-radius:12px; font-weight:700; font-size:0.75rem; cursor:pointer;">
                ${item.available ? 'Satışta (Mevcut)' : 'Tükendi (Gizli)'}
              </button>
            </div>
          `).join('')}
        </div>

        <button class="btn-primary-lg" style="width:100%; justify-content:center;" onclick="this.closest('.modal-overlay').remove()">Tamamlandı</button>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    modal.querySelectorAll('.btn-toggle-stock').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.itemId;
        store.toggleItemAvailability(id);
        modal.remove();
        openMenuManagementModal();
        updateView();
      });
    });
  }

  // Subscribe to store updates
  store.subscribe(() => {
    if (store.activeView === 'admin') {
      updateView();
    }
  });

  updateView();
}
