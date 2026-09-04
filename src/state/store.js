class AppStore {
  constructor() {
    this.listeners = [];
    
    // Load or initialize restaurant registrations
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
        status: 'bekliyor', // bekliyor | onaylandi | reddedildi
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

    // Active View state: 'landing' | 'register' | 'owner-admin'
    this.activeView = 'landing';
    this.adminUnlocked = false; // PIN Protection flag
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
  }

  setView(viewName) {
    this.activeView = viewName;
    this.notify();
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
}

export const store = new AppStore();
