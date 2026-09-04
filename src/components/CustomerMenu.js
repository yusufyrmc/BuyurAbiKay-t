import { store } from '../state/store.js';
import { MENU_CATEGORIES, RESTAURANT_INFO } from '../data/mockData.js';

export function renderCustomerMenu(container) {
  let selectedCategory = 'all';
  let searchQuery = '';

  function getFilteredItems() {
    return store.menuItems.filter(item => {
      const matchCat = selectedCategory === 'all' || 
                       (selectedCategory === 'populer' ? item.tags.includes('Popüler') : item.categoryId === selectedCategory);
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  function updateView() {
    const cartCount = store.getCartCount();
    const cartTotal = store.getCartTotal();
    const filteredItems = getFilteredItems();
    const activeOrder = store.activeCustomerOrder;

    container.innerHTML = `
      <div class="customer-menu-layout">
        <!-- PHONE SIMULATOR FRAME (LEFT SIDE) -->
        <div class="phone-frame-wrapper">
          <div class="phone-frame">
            <div class="phone-screen">
              <!-- Phone Header -->
              <div class="phone-top-bar">
                <div style="display:flex; align-items:center; gap:4px;">
                  <i data-lucide="map-pin" style="width:14px; color:var(--color-primary);"></i>
                  <span style="font-weight:700;">${RESTAURANT_INFO.name}</span>
                </div>
                
                <select id="select-table-id" class="phone-table-select">
                  ${store.tables.map(t => `<option value="${t.id}" ${t.id === store.cart.tableId ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
              </div>

              <!-- Active Order Tracker Bar if exists -->
              ${activeOrder ? `
                <div style="background: rgba(0, 230, 118, 0.15); border-bottom: 1px solid rgba(0,230,118,0.4); padding: 0.5rem 0.75rem; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <span style="font-size:0.72rem; color:var(--color-accent-green); font-weight:800;">SİPARİŞ VERİLDİ #${activeOrder.id}</span>
                    <div style="font-size:0.78rem; font-weight:700; color:#fff;">Durum: 
                      ${activeOrder.status === 'yeni' ? '⏳ Mutfak Onayı Bekliyor' : ''}
                      ${activeOrder.status === 'hazirlaniyor' ? '🔥 Mutfakta Hazırlanıyor' : ''}
                      ${activeOrder.status === 'masada' ? '✅ Masanıza Servis Edildi' : ''}
                      ${activeOrder.status === 'tamamlandi' ? '🏁 Tamamlandı' : ''}
                    </div>
                  </div>
                  <button id="btn-view-order-details" style="background:var(--color-accent-green); border:none; color:#000; font-size:0.7rem; font-weight:800; padding:4px 8px; border-radius:6px; cursor:pointer;">
                    Detay
                  </button>
                </div>
              ` : ''}

              <!-- Search Bar -->
              <div class="menu-search-box">
                <div class="search-input-wrapper">
                  <i data-lucide="search"></i>
                  <input type="text" id="phone-menu-search" placeholder="Yemek veya tatlı ara..." value="${searchQuery}">
                </div>
              </div>

              <!-- Categories scroll bar -->
              <div class="category-pills">
                ${MENU_CATEGORIES.map(cat => `
                  <button class="pill-btn ${cat.id === selectedCategory ? 'active' : ''}" data-cat="${cat.id}">
                    <i data-lucide="${cat.icon}"></i>
                    <span>${cat.name}</span>
                  </button>
                `).join('')}
              </div>

              <!-- Menu Items Scroll Area -->
              <div class="menu-items-scroll">
                ${filteredItems.length === 0 ? `
                  <div style="text-align:center; padding:3rem 1rem; color:var(--color-text-dim);">
                    <i data-lucide="utensils" style="width:36px; height:36px; margin-bottom:0.5rem; opacity:0.4;"></i>
                    <p>Aradığınız kritere uygun yemek bulunamadı.</p>
                  </div>
                ` : filteredItems.map(item => `
                  <div class="menu-item-card ${!item.available ? 'item-out-of-stock' : ''}">
                    <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                    <div class="menu-item-info">
                      <div>
                        <div class="menu-item-title">${item.name}</div>
                        <div class="menu-item-desc">${item.description}</div>
                      </div>
                      <div class="menu-item-footer">
                        <div class="menu-item-price">₺${item.price.toFixed(2)}</div>
                        ${item.available ? `
                          <button class="btn-add-item" data-item-id="${item.id}">
                            <i data-lucide="plus" style="width:14px;"></i> Ekle
                          </button>
                        ` : `
                          <span style="font-size:0.7rem; color:var(--color-danger); font-weight:700;">Tükendi</span>
                        `}
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Quick Action Bar: Call Waiter & Request Bill -->
              <div class="quick-actions-bar">
                <button class="btn-action-call" id="btn-call-waiter">
                  <i data-lucide="bell"></i> Garson Çağır
                </button>
                <button class="btn-action-bill" id="btn-request-bill">
                  <i data-lucide="receipt"></i> Hesap İste
                </button>
              </div>

              <!-- Floating Cart Drawer Button -->
              ${cartCount > 0 ? `
                <div class="phone-cart-bar" id="btn-open-cart-modal">
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span style="background:#fff; color:var(--color-primary); font-size:0.8rem; font-weight:800; width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center;">${cartCount}</span>
                    <span>Sepetiniz</span>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span>₺${cartTotal.toFixed(2)}</span>
                    <i data-lucide="arrow-right" style="width:16px;"></i>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- RIGHT SIDE: DESKTOP DETAILED VIEW & CART PANEL -->
        <div class="menu-desktop-full">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
            <div>
              <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800;">${RESTAURANT_INFO.name} Dijital Menüsü</h2>
              <p style="color:var(--color-text-muted); font-size:0.9rem;">Masada QR Kod ile anında sipariş verme deneyimi</p>
            </div>
            <div style="display:flex; align-items:center; gap:1rem; background:rgba(255,255,255,0.04); padding:0.5rem 1rem; border-radius:var(--radius-md); border:var(--border-glass);">
              <i data-lucide="wifi" style="color:var(--color-accent-green);"></i>
              <span style="font-size:0.82rem; color:var(--color-text-muted);">Ücretsiz Wi-Fi Şifresi: <strong style="color:#fff;">${RESTAURANT_INFO.wifiPassword}</strong></span>
            </div>
          </div>

          <!-- Desktop Grid -->
          <div class="desktop-menu-grid">
            ${filteredItems.map(item => `
              <div class="desktop-food-card">
                <img src="${item.image}" alt="${item.name}" class="desktop-food-img">
                <div class="desktop-food-body">
                  <div class="food-badge-row">
                    ${item.tags.map(t => `<span class="badge-tag">${t}</span>`).join('')}
                    <span class="badge-tag" style="background:rgba(255,255,255,0.06); color:var(--color-text-muted);">${item.prepTime}</span>
                  </div>
                  <h4 style="font-size:1rem; font-weight:700; margin-bottom:0.4rem; color:#fff;">${item.name}</h4>
                  <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:0.8rem; min-height:38px;">${item.description}</p>
                  
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:1.1rem; font-weight:800; color:var(--color-primary);">₺${item.price.toFixed(2)}</span>
                    <button class="btn-add-item btn-primary-lg" style="padding:0.4rem 0.9rem; font-size:0.8rem;" data-item-id="${item.id}">
                      <i data-lucide="shopping-bag" style="width:14px;"></i> Sepete Ekle
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // Re-bind Lucide icons
    if (window.lucide) window.lucide.createIcons();

    // Event Listeners
    container.querySelectorAll('.pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        selectedCategory = e.currentTarget.dataset.cat;
        updateView();
      });
    });

    const searchInput = container.querySelector('#phone-menu-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        updateView();
      });
    }

    container.querySelector('#select-table-id')?.addEventListener('change', (e) => {
      store.setCartTable(e.target.value);
    });

    // Add Item to Cart buttons
    container.querySelectorAll('.btn-add-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.currentTarget.dataset.itemId;
        const item = store.menuItems.find(i => i.id === itemId);
        if (item) {
          store.addToCart(item, {}, 1);
          showToast(`"<strong>${item.name}</strong>" sepetinize eklendi! 🛒`);
        }
      });
    });

    // Call Waiter Button
    container.querySelector('#btn-call-waiter')?.addEventListener('click', () => {
      store.callWaiter(store.cart.tableId, store.cart.tableName, 'garson', 'Menü İnceleme & Destek');
      showToast(`🔔 Garson uyarısı gönderildi! <strong>${store.cart.tableName}</strong> masasına ekibimiz yönlendirildi.`);
    });

    // Request Bill Button
    container.querySelector('#btn-request-bill')?.addEventListener('click', () => {
      store.callWaiter(store.cart.tableId, store.cart.tableName, 'hesap', 'Masada Hesap İsteği');
      showToast(`💳 <strong>${store.cart.tableName}</strong> için hesap talebi mutfak/admin paneline iletildi!`);
    });

    // Open Cart Modal
    container.querySelector('#btn-open-cart-modal')?.addEventListener('click', () => {
      openCartModal();
    });

    // View Active Order Details
    container.querySelector('#btn-view-order-details')?.addEventListener('click', () => {
      openOrderTrackerModal(activeOrder);
    });
  }

  // Render modal functions
  function openCartModal() {
    const existingModal = document.getElementById('cart-modal');
    if (existingModal) existingModal.remove();

    const cartTotal = store.getCartTotal();
    const modal = document.createElement('div');
    modal.id = 'cart-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; padding-bottom:0.5rem; border-bottom:var(--border-glass);">
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800;">
            <i data-lucide="shopping-cart" style="color:var(--color-primary);"></i> ${store.cart.tableName} Sipariş Özeti
          </h3>
          <button id="btn-close-cart-modal" style="background:transparent; border:none; color:var(--color-text-muted); cursor:pointer;">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div style="max-height:280px; overflow-y:auto; margin-bottom:1rem;">
          ${store.cart.items.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:0.6rem 0; border-bottom:1px dashed rgba(255,255,255,0.08);">
              <div>
                <strong style="font-size:0.9rem; color:#fff;">${item.name}</strong>
                <div style="font-size:0.78rem; color:var(--color-primary);">₺${(item.price * item.qty).toFixed(2)}</div>
              </div>
              
              <div style="display:flex; align-items:center; gap:0.5rem;">
                <button class="btn-qty-minus" data-idx="${idx}" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer;">-</button>
                <span style="font-weight:700; font-size:0.9rem;">${item.qty}</span>
                <button class="btn-qty-plus" data-idx="${idx}" style="background:rgba(255,255,255,0.1); border:none; color:#fff; width:24px; height:24px; border-radius:4px; cursor:pointer;">+</button>
              </div>
            </div>
          `).join('')}
        </div>

        <div style="margin-bottom:1rem;">
          <label style="display:block; font-size:0.8rem; color:var(--color-text-muted); margin-bottom:0.4rem;">Sipariş Notunuz:</label>
          <input type="text" id="cart-order-note" placeholder="Örn: Biberler az acılı olsun, ekstra limon rica ediyorum." style="width:100%; background:rgba(0,0,0,0.3); border:var(--border-glass); padding:0.5rem; border-radius:var(--radius-sm); color:#fff; font-size:0.82rem;">
        </div>

        <div style="margin-bottom:1.2rem;">
          <label style="display:block; font-size:0.8rem; color:var(--color-text-muted); margin-bottom:0.4rem;">Ödeme Tercihi:</label>
          <select id="cart-payment-method" style="width:100%; background:rgba(0,0,0,0.3); border:var(--border-glass); padding:0.55rem; border-radius:var(--radius-sm); color:#fff; font-size:0.85rem;">
            <option value="Masada Kredi Kartı">💳 Masada Kredi Kartı ile Ödeme</option>
            <option value="Masada Nakit">💵 Masada Nakit Ödeme</option>
            <option value="Online Ödeme">📱 Online Ödeme (Garanti / İş Bank / İyzi)</option>
          </select>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; padding-top:0.8rem; border-top:var(--border-glass); margin-bottom:1rem;">
          <span style="font-size:0.9rem; color:var(--color-text-muted);">Toplam Tutar:</span>
          <span style="font-size:1.4rem; font-weight:800; color:var(--color-accent-green);">₺${cartTotal.toFixed(2)}</span>
        </div>

        <button id="btn-submit-order" class="btn-primary-lg" style="width:100%; justify-content:center; padding:0.8rem;">
          <i data-lucide="send"></i> Siparişi Mutfağa Gönder
        </button>
      </div>
    `;

    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();

    modal.querySelector('#btn-close-cart-modal').addEventListener('click', () => modal.remove());
    
    modal.querySelectorAll('.btn-qty-minus').forEach(b => {
      b.addEventListener('click', (e) => {
        store.updateCartQty(Number(e.target.dataset.idx), -1);
        openCartModal();
        updateView();
      });
    });

    modal.querySelectorAll('.btn-qty-plus').forEach(b => {
      b.addEventListener('click', (e) => {
        store.updateCartQty(Number(e.target.dataset.idx), 1);
        openCartModal();
        updateView();
      });
    });

    modal.querySelector('#btn-submit-order').addEventListener('click', () => {
      store.cart.note = modal.querySelector('#cart-order-note').value;
      store.cart.paymentMethod = modal.querySelector('#cart-payment-method').value;
      
      const newOrder = store.submitOrder("Müşteri (" + store.cart.tableName + ")");
      modal.remove();
      updateView();
      
      showToast(`🔥 <strong>Siparişiniz Mutfağa İletildi!</strong> (#${newOrder.id})`, 'success');
      
      // Auto switch focus banner
      setTimeout(() => {
        openOrderTrackerModal(newOrder);
      }, 500);
    });
  }

  function openOrderTrackerModal(order) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" style="text-align:center;">
        <div style="width:60px; height:60px; background:var(--color-primary-light); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto;">
          <i data-lucide="chef-hat" style="width:32px; height:32px;"></i>
        </div>

        <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">Sipariş Takibi #${order.id}</h3>
        <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:1.2rem;">${order.tableName} • Tutar: ₺${order.totalPrice.toFixed(2)}</p>

        <!-- Progress Tracker -->
        <div style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.2rem; text-align:left;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:700; margin-bottom:0.5rem; color:var(--color-accent-green);">
            <span>1. Sipariş Alındı</span>
            <span>2. Hazırlanıyor</span>
            <span>3. Masada</span>
          </div>
          <div style="height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
            <div style="height:100%; width:${order.status === 'yeni' ? '33%' : order.status === 'hazirlaniyor' ? '66%' : '100%'}; background:var(--color-primary-gradient); transition:all 0.5s;"></div>
          </div>
        </div>

        <div style="text-align:left; background:rgba(255,255,255,0.03); padding:0.8rem; border-radius:var(--radius-sm); margin-bottom:1.2rem;">
          <strong style="font-size:0.82rem; color:var(--color-text-muted);">Sipariş İçeriği:</strong>
          <ul style="list-style:none; font-size:0.85rem; margin-top:0.4rem;">
            ${order.items.map(i => `<li>• ${i.qty}x ${i.name}</li>`).join('')}
          </ul>
        </div>

        <button class="btn-secondary-lg" style="width:100%; justify-content:center;" onclick="this.closest('.modal-overlay').remove()">Kapat</button>
      </div>
    `;
    document.body.appendChild(modal);
    if (window.lucide) window.lucide.createIcons();
  }

  // Subscribe to store updates
  store.subscribe(() => {
    if (store.activeView === 'menu') {
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
  toast.innerHTML = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
