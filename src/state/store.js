import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_WAITER_REQUESTS, TABLES_LIST } from '../data/mockData.js';

class AppStore {
  constructor() {
    this.listeners = [];
    
    // Load or initialize state
    const savedOrders = localStorage.getItem('buyurabi_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [...INITIAL_ORDERS];
    
    const savedRequests = localStorage.getItem('buyurabi_waiter_requests');
    this.waiterRequests = savedRequests ? JSON.parse(savedRequests) : [...INITIAL_WAITER_REQUESTS];
    
    const savedMenu = localStorage.getItem('buyurabi_menu');
    this.menuItems = savedMenu ? JSON.parse(savedMenu) : [...INITIAL_MENU_ITEMS];
    
    this.tables = [...TABLES_LIST];
    
    // Customer Cart state
    this.cart = {
      tableId: 4,
      tableName: "Masa 4",
      items: [],
      note: "",
      paymentMethod: "Masada Kredi Kartı"
    };

    // Sound toggle state
    this.soundEnabled = true;
    
    // Active View state: 'landing' | 'menu' | 'admin' | 'qr'
    this.activeView = 'landing';

    // Active customer tracking order
    this.activeCustomerOrder = null;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(l => l(this));
  }

  saveState() {
    localStorage.setItem('buyurabi_orders', JSON.stringify(this.orders));
    localStorage.setItem('buyurabi_waiter_requests', JSON.stringify(this.waiterRequests));
    localStorage.setItem('buyurabi_menu', JSON.stringify(this.menuItems));
  }

  setView(viewName) {
    this.activeView = viewName;
    this.notify();
  }

  // --- Sound Effects using Web Audio API ---
  playAlertSound(type = 'new_order') {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === 'new_order') {
        // High pitched double chime for new order
        const now = ctx.currentTime;
        
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.12); // A5
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1174.66, now + 0.25); // D6
        gain2.gain.setValueAtTime(0.3, now + 0.25);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.25);
        osc2.stop(now + 0.7);
      } else if (type === 'waiter_call') {
        // Bell ring sound
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, now); // C6
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      }
    } catch (e) {
      console.warn("Audio Context sound error", e);
    }
  }

  // --- Cart Actions ---
  addToCart(item, selectedOptions = {}, qty = 1, note = "") {
    const existingIndex = this.cart.items.findIndex(
      i => i.id === item.id && JSON.stringify(i.selectedOptions) === JSON.stringify(selectedOptions)
    );
    if (existingIndex > -1) {
      this.cart.items[existingIndex].qty += qty;
    } else {
      this.cart.items.push({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        selectedOptions,
        qty,
        note
      });
    }
    this.notify();
  }

  updateCartQty(index, delta) {
    if (this.cart.items[index]) {
      this.cart.items[index].qty += delta;
      if (this.cart.items[index].qty <= 0) {
        this.cart.items.splice(index, 1);
      }
      this.notify();
    }
  }

  removeFromCart(index) {
    this.cart.items.splice(index, 1);
    this.notify();
  }

  clearCart() {
    this.cart.items = [];
    this.cart.note = "";
    this.notify();
  }

  setCartTable(tableId) {
    const foundTable = this.tables.find(t => t.id === Number(tableId));
    if (foundTable) {
      this.cart.tableId = foundTable.id;
      this.cart.tableName = foundTable.name;
      this.notify();
    }
  }

  // --- Order Actions ---
  submitOrder(customerName = "Masadaki Müşteri") {
    if (this.cart.items.length === 0) return null;

    const totalPrice = this.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      tableId: this.cart.tableId,
      tableName: this.cart.tableName,
      customerName: customerName || "Masadaki Müşteri",
      time: "Az önce",
      timestamp: Date.now(),
      status: "yeni",
      items: [...this.cart.items],
      totalPrice: totalPrice,
      paymentMethod: this.cart.paymentMethod,
      orderNote: this.cart.note
    };

    // Add to top of orders array
    this.orders.unshift(newOrder);
    this.activeCustomerOrder = newOrder;

    // Update table status
    const tableIndex = this.tables.findIndex(t => t.id === this.cart.tableId);
    if (tableIndex > -1) {
      this.tables[tableIndex].status = "dolu";
      this.tables[tableIndex].currentOrderTotal += totalPrice;
    }

    // Play alert sound for business
    this.playAlertSound('new_order');

    // Clear customer cart
    this.clearCart();
    return newOrder;
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      if (this.activeCustomerOrder && this.activeCustomerOrder.id === orderId) {
        this.activeCustomerOrder.status = newStatus;
      }
      this.notify();
    }
  }

  // --- Waiter & Bill Request Actions ---
  callWaiter(tableId, tableName, requestType = 'garson', note = '') {
    const newReq = {
      id: 'req-' + Date.now(),
      tableId,
      tableName,
      type: requestType,
      message: requestType === 'hesap' ? `Hesap İstiyor (${note || 'Kredi Kartı/Nakit'})` : `Garson Çağırıyor ${note ? `(${note})` : ''}`,
      time: 'Az önce'
    };
    this.waiterRequests.unshift(newReq);
    this.playAlertSound('waiter_call');
    this.notify();
    return newReq;
  }

  dismissWaiterRequest(reqId) {
    this.waiterRequests = this.waiterRequests.filter(r => r.id !== reqId);
    this.notify();
  }

  // --- Menu Management Actions ---
  toggleItemAvailability(itemId) {
    const item = this.menuItems.find(i => i.id === itemId);
    if (item) {
      item.available = !item.available;
      this.notify();
    }
  }

  addMenuItem(newItemData) {
    const newItem = {
      id: 'item-' + (this.menuItems.length + 1),
      available: true,
      tags: ["Yeni"],
      ...newItemData
    };
    this.menuItems.push(newItem);
    this.notify();
  }

  // --- Helpers ---
  getCartTotal() {
    return this.cart.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  }

  getCartCount() {
    return this.cart.items.reduce((sum, item) => sum + item.qty, 0);
  }
}

export const store = new AppStore();
