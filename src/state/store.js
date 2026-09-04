import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, INITIAL_WAITER_REQUESTS, TABLES_LIST } from '../data/mockData.js';

class AppStore {
  constructor() {
    this.listeners = [];
    
    // 1. Restaurant Registrations
    const savedRegs = localStorage.getItem('buyurabi_restaurant_registrations');
    this.registrations = savedRegs ? JSON.parse(savedRegs) : [
      {
        id: 'REG-1001',
        businessName: 'Gaziantep Lezzet Sofrası',
        fullName: 'Ahmet Yılmaz',
        businessType: 'Izgara & Dönerci',
        phone: '0532 555 44 33',
        city: 'İstanbul / Kadıköy',
        fullAddress: 'Caferağa Mah. Moda Cad. No:84/A Kadıköy',
        status: 'bekliyor',
        createdAt: '10 dk önce',
        timestamp: Date.now() - 10 * 60 * 1000
      },
      {
        id: 'REG-1002',
        businessName: 'Moda Artisan Kafe',
        fullName: 'Selin Kaya',
        businessType: 'Kafe & Patisserie',
        phone: '0544 888 12 34',
        city: 'İstanbul / Kadıköy',
        fullAddress: 'Mühürdar Sok. No:12 Moda',
        status: 'onaylandi',
        createdAt: '2 saat önce',
        timestamp: Date.now() - 120 * 60 * 1000
      },
      {
        id: 'REG-1003',
        businessName: 'Çıtır Taş Fırın Pide',
        fullName: 'Mehmet Öztürk',
        businessType: 'Pide & Lahmacun Salonu',
        phone: '0505 111 22 33',
        city: 'Ankara / Çankaya',
        fullAddress: 'Tunalı Hilmi Cad. No:45 Çankaya',
        status: 'bekliyor',
        createdAt: '45 dk önce',
        timestamp: Date.now() - 45 * 60 * 1000
      }
    ];

    // 2. Orders & Kitchen Data
    const savedOrders = localStorage.getItem('buyurabi_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [...INITIAL_ORDERS];
    
    const savedRequests = localStorage.getItem('buyurabi_waiter_requests');
    this.waiterRequests = savedRequests ? JSON.parse(savedRequests) : [...INITIAL_WAITER_REQUESTS];
    
    const savedMenu = localStorage.getItem('buyurabi_menu');
    this.menuItems = savedMenu ? JSON.parse(savedMenu) : [...INITIAL_MENU_ITEMS];
    
    this.tables = [...TABLES_LIST];
    
    this.soundEnabled = true;
    this.activeView = 'landing';
    this.adminUnlocked = true; // Always unlocked by default for instant access!
    this.adminTab = 'registrations'; // 'registrations' | 'kitchen' | 'menu' | 'qr'
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
    localStorage.setItem('buyurabi_restaurant_registrations', JSON.stringify(this.registrations));
    localStorage.setItem('buyurabi_orders', JSON.stringify(this.orders));
    localStorage.setItem('buyurabi_waiter_requests', JSON.stringify(this.waiterRequests));
    localStorage.setItem('buyurabi_menu', JSON.stringify(this.menuItems));
  }

  setView(viewName) {
    this.activeView = viewName;
    this.notify();
  }

  setAdminTab(tabName) {
    this.adminTab = tabName;
    this.notify();
  }

  // --- Sound Alert System ---
  playAlertSound(type = 'new_order') {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn("Audio Context error", e);
    }
  }

  // --- Registration Actions ---
  addRegistration(regData) {
    const newReg = {
      id: 'REG-' + Math.floor(1000 + Math.random() * 9000),
      status: 'bekliyor',
      createdAt: 'Az önce',
      timestamp: Date.now(),
      ...regData
    };
    this.registrations.unshift(newReg);
    this.playAlertSound('new_order');
    this.notify();
    return newReg;
  }

  approveRegistration(id) {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'onaylandi';
      this.notify();
    }
  }

  rejectRegistration(id) {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'reddedildi';
      this.notify();
    }
  }

  deleteRegistration(id) {
    this.registrations = this.registrations.filter(r => r.id !== id);
    this.notify();
  }

  getPendingCount() {
    return this.registrations.filter(r => r.status === 'bekliyor').length;
  }

  // --- Kitchen & Order Actions ---
  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.notify();
    }
  }

  dismissWaiterRequest(reqId) {
    this.waiterRequests = this.waiterRequests.filter(r => r.id !== reqId);
    this.notify();
  }

  toggleItemAvailability(itemId) {
    const item = this.menuItems.find(i => i.id === itemId);
    if (item) {
      item.available = !item.available;
      this.notify();
    }
  }

  addTestOrder() {
    const randomTableId = Math.floor(1 + Math.random() * 6);
    const item1 = this.menuItems[0];
    const item2 = this.menuItems[7];

    const newOrder = {
      id: "ORD-" + Math.floor(1000 + Math.random() * 9000),
      tableId: randomTableId,
      tableName: `Masa ${randomTableId}`,
      customerName: "Canlı Müşteri",
      time: "Az önce",
      timestamp: Date.now(),
      status: "yeni",
      items: [
        { id: item1.id, name: item1.name, price: item1.price, qty: 1, note: "Bol acılı" },
        { id: item2.id, name: item2.name, price: item2.price, qty: 2, note: "Buzlu" }
      ],
      totalPrice: item1.price + (item2.price * 2),
      paymentMethod: "Masada Kredi Kartı",
      orderNote: "Test siparişi"
    };

    this.orders.unshift(newOrder);
    this.playAlertSound('new_order');
    this.notify();
  }
}

export const store = new AppStore();
