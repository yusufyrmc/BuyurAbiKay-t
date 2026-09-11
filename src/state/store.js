import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

class AppStore {
  constructor() {
    this.listeners = [];
    this.supabaseConnected = isSupabaseConfigured();
    this.lastSupabaseError = null;
    
    // Default fallback initial registrations
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
        plan: 'Profesyonel Paket (₺899/ay)',
        planPrice: 899,
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
        plan: 'Başlangıç Paketi (₺499/ay)',
        planPrice: 499,
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
        plan: 'Kurumsal Paket (₺1.499/ay)',
        planPrice: 1499,
        status: 'bekliyor',
        createdAt: '45 dk önce',
        timestamp: Date.now() - 45 * 60 * 1000
      }
    ];

    const savedLastReg = localStorage.getItem('buyurabi_last_registered_business');
    this.lastRegisteredBusiness = savedLastReg ? JSON.parse(savedLastReg) : null;

    // Live Orders per business
    const savedOrders = localStorage.getItem('buyurabi_restaurant_orders');
    this.orders = savedOrders ? JSON.parse(savedOrders) : [
      {
        id: 'SIP-1081',
        businessId: 'REG-1001',
        businessName: 'Gaziantep Lezzet Sofrası',
        tableName: 'Masa 4',
        customerName: 'Kemal Arslan',
        items: [
          { name: 'Zırh Kıyma Adana Kebap', qty: 2, price: 340, note: 'Az acılı, bol sumaklı soğan' },
          { name: 'Bol Köpüklü Yayık Ayran', qty: 2, price: 45 }
        ],
        totalPrice: 770,
        status: 'yeni',
        paymentMethod: 'Masada Kredi Kartı',
        createdAt: '2 dk önce',
        timestamp: Date.now() - 2 * 60 * 1000
      },
      {
        id: 'SIP-1080',
        businessId: 'REG-1002',
        businessName: 'Moda Artisan Kafe',
        tableName: 'Bahçe Masa 2',
        customerName: 'Zeynep Demir',
        items: [
          { name: 'Flat White & Çikolatalı Kruvasan', qty: 1, price: 185 },
          { name: 'San Sebastian Cheesecake', qty: 1, price: 195 }
        ],
        totalPrice: 380,
        status: 'hazirlaniyor',
        paymentMethod: 'Online Kart ile Ödendi',
        createdAt: '8 dk önce',
        timestamp: Date.now() - 8 * 60 * 1000
      },
      {
        id: 'SIP-1079',
        businessId: 'REG-1003',
        businessName: 'Çıtır Taş Fırın Pide',
        tableName: 'Masa 8',
        customerName: 'Burak Şahin',
        items: [
          { name: 'Taş Fırın Kuşbaşılı Kaşarlı Pide', qty: 2, price: 290 },
          { name: 'Kutu Kola', qty: 2, price: 50 }
        ],
        totalPrice: 680,
        status: 'masada',
        paymentMethod: 'Nakit',
        createdAt: '15 dk önce',
        timestamp: Date.now() - 15 * 60 * 1000
      },
      {
        id: 'SIP-1078',
        businessId: 'REG-1001',
        businessName: 'Gaziantep Lezzet Sofrası',
        tableName: 'Masa 1',
        customerName: 'Mustafa Kaya',
        items: [
          { name: 'Tereyağlı İskender Kebap', qty: 1, price: 380 },
          { name: 'Künefe', qty: 1, price: 160 }
        ],
        totalPrice: 540,
        status: 'tamamlandi',
        paymentMethod: 'Kredi Kartı',
        createdAt: '35 dk önce',
        timestamp: Date.now() - 35 * 60 * 1000
      }
    ];

    // Live Support Call Logs & Notes per business
    const savedNotes = localStorage.getItem('buyurabi_support_call_notes');
    this.supportNotes = savedNotes ? JSON.parse(savedNotes) : [
      {
        id: 'NOTE-1',
        businessId: 'REG-1001',
        agent: 'Destek Temsilcisi (Yusuf)',
        category: 'Masa / QR Kontrolü',
        text: 'Ahmet Bey aradı. Masa 4 QR etiketinin okutulmasıyla ilgili müşteri kamera izin sorunu kontrol edildi. Canlı test siparişi ile sistem teyit edildi.',
        createdAt: 'Bugün 11:20',
        timestamp: Date.now() - 120 * 60 * 1000
      },
      {
        id: 'NOTE-2',
        businessId: 'REG-1002',
        agent: 'Destek Ekibi',
        category: 'Menü & Fiyat Güncelleme',
        text: 'Selin Hanım aradı, yeni sezon tatlı menüsü ekleme adımları telefonda tarif edildi. Mutfak bildirim zili test edildi.',
        createdAt: 'Dün 16:45',
        timestamp: Date.now() - 24 * 60 * 60 * 1000
      }
    ];

    this.soundEnabled = true;
    this.activeView = 'landing';
    this.adminUnlocked = sessionStorage.getItem('buyurabi_admin_session') === 'true';
    this.adminPassword = '123456';

    if (this.supabaseConnected) {
      this.initSupabase();
    }
  }

  getLastRegisteredBusiness() {
    if (this.lastRegisteredBusiness) return this.lastRegisteredBusiness;
    try {
      const saved = localStorage.getItem('buyurabi_last_registered_business');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  setLastRegisteredBusiness(reg) {
    this.lastRegisteredBusiness = reg;
    if (reg) {
      localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(reg));
    } else {
      localStorage.removeItem('buyurabi_last_registered_business');
    }
    this.notify();
  }

  clearLastRegisteredBusiness() {
    this.lastRegisteredBusiness = null;
    localStorage.removeItem('buyurabi_last_registered_business');
    this.notify();
  }

  async initSupabase() {
    await this.fetchRegistrations();
    this.setupRealtimeSubscription();
  }

  // Helper to format object for Supabase table row
  toDbRow(reg, includePassword = true) {
    const row = {
      id: String(reg.id),
      business_name: reg.businessName || '',
      full_name: reg.fullName || '',
      business_type: reg.businessType || 'Restoran',
      phone: reg.phone || '',
      city: reg.city || '',
      full_address: reg.fullAddress || '',
      plan: reg.plan || 'Profesyonel Paket (₺899/ay)',
      plan_price: Number(reg.planPrice || 899),
      status: reg.status || 'bekliyor',
      created_at: reg.createdAt || 'Yeni',
      timestamp: Number(reg.timestamp || Date.now())
    };

    if (includePassword && reg.password) {
      row.password = reg.password;
    }

    return row;
  }

  async fetchRegistrations() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error:', error.message);
        this.lastSupabaseError = error.message;
        this.notify();
        return;
      }

      this.lastSupabaseError = null;

      if (data && data.length > 0) {
        this.registrations = data.map(item => ({
          id: item.id,
          businessName: item.business_name,
          fullName: item.full_name,
          businessType: item.business_type,
          phone: item.phone,
          city: item.city,
          fullAddress: item.full_address,
          plan: item.plan,
          planPrice: Number(item.plan_price || 899),
          status: item.status || 'bekliyor',
          password: item.password || '',
          createdAt: item.created_at || 'Yeni',
          timestamp: Number(item.timestamp || Date.now())
        }));
        this.notify();
      } else {
        // If Supabase table is empty, seed existing sample registrations into Supabase
        const dbRows = this.registrations.map(r => this.toDbRow(r));
        const { error: seedError } = await supabase.from('registrations').upsert(dbRows);
        if (seedError) {
          console.warn('Supabase seed error:', seedError.message);
          this.lastSupabaseError = seedError.message;
        } else {
          console.log('Supabase initialized with sample data successfully.');
          // Re-fetch to synchronize state
          const { data: refetchedData } = await supabase
            .from('registrations')
            .select('*')
            .order('timestamp', { ascending: false });
          if (refetchedData && refetchedData.length > 0) {
            this.registrations = refetchedData.map(item => ({
              id: item.id,
              businessName: item.business_name,
              fullName: item.full_name,
              businessType: item.business_type,
              phone: item.phone,
              city: item.city,
              fullAddress: item.full_address,
              plan: item.plan,
              planPrice: Number(item.plan_price || 899),
              status: item.status || 'bekliyor',
              createdAt: item.created_at || 'Yeni',
              timestamp: Number(item.timestamp || Date.now())
            }));
          }
        }
        this.notify();
      }
    } catch (err) {
      console.error('Supabase connection error:', err);
      this.lastSupabaseError = err.message || 'Bağlantı hatası';
      this.notify();
    }
  }

  setupRealtimeSubscription() {
    if (!supabase) return;
    try {
      supabase
        .channel('registrations-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          () => {
            this.fetchRegistrations();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('Supabase Realtime yayınına başarıyla bağlandı.');
          } else if (err || status === 'CHANNEL_ERROR') {
            console.warn('Supabase Realtime kanal uyarısı:', status, err);
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
    }
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

  unlockAdmin(password) {
    if (password === this.adminPassword) {
      this.adminUnlocked = true;
      sessionStorage.setItem('buyurabi_admin_session', 'true');
      this.notify();
      return true;
    }
    return false;
  }

  lockAdmin() {
    this.adminUnlocked = false;
    sessionStorage.removeItem('buyurabi_admin_session');
    this.notify();
  }

  // --- Registration Actions ---
  async addRegistration(regData) {
    const generatedId = regData.id || ('BYR-' + Math.floor(1000 + Math.random() * 9000));
    const newReg = {
      id: generatedId,
      status: 'bekliyor',
      createdAt: 'Az önce',
      timestamp: Date.now(),
      ...regData
    };

    // 1. Add locally first and persist last registered business for the user
    this.registrations.unshift(newReg);
    this.lastRegisteredBusiness = newReg;
    localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(newReg));
    this.notify();

    // 2. Persist to Supabase using upsert
    console.log('addRegistration triggered:', newReg, 'supabaseConnected:', this.supabaseConnected);
    if (this.supabaseConnected && supabase) {
      try {
        const dbRowWithPass = this.toDbRow(newReg, true);
        console.log('Sending to Supabase registrations table:', dbRowWithPass);
        let { data, error } = await supabase
          .from('registrations')
          .upsert([dbRowWithPass], { onConflict: 'id' });

        if (error && (error.code === '42703' || (error.message && error.message.includes('password')))) {
          console.warn('Password column missing on Supabase table, retrying without password column...');
          const retryRes = await supabase
            .from('registrations')
            .upsert([this.toDbRow(newReg, false)], { onConflict: 'id' });
          error = retryRes.error;
          data = retryRes.data;
        }

        if (error) {
          console.error('Supabase insert error:', error.message);
          this.lastSupabaseError = error.message;
          this.notify();
          return { success: false, reg: newReg, error: error.message };
        } else {
          console.log('Registration successfully saved to Supabase!');
          this.lastSupabaseError = null;
        }
      } catch (err) {
        console.error('Supabase client error:', err);
        return { success: false, reg: newReg, error: err.message };
      }
    } else {
      console.warn('Supabase not connected. Registration saved to local storage.');
    }

    return { success: true, reg: newReg };
  }

  async approveRegistration(id) {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'onaylandi';
      this.notify();

      console.log('approveRegistration triggered for ID:', id, 'supabaseConnected:', this.supabaseConnected);
      if (this.supabaseConnected && supabase) {
        try {
          const dbRowWithPass = this.toDbRow(reg, true);
          console.log('Upserting approved row to Supabase:', dbRowWithPass);
          let { error } = await supabase
            .from('registrations')
            .upsert([dbRowWithPass], { onConflict: 'id' });

          if (error && (error.code === '42703' || (error.message && error.message.includes('password')))) {
            console.warn('Password column missing on Supabase table, retrying without password column...');
            const retryRes = await supabase
              .from('registrations')
              .upsert([this.toDbRow(reg, false)], { onConflict: 'id' });
            error = retryRes.error;
          }

          if (error) {
            console.error('Supabase approve error:', error.message);
            this.lastSupabaseError = error.message;
            this.notify();
            return { success: false, error: error.message };
          } else {
            console.log('Supabase approval saved successfully!');
            this.lastSupabaseError = null;
          }
        } catch (err) {
          console.error('Supabase update error:', err);
          return { success: false, error: err.message };
        }
      }
    }
    return { success: true };
  }

  async rejectRegistration(id) {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'reddedildi';
      this.notify();

      console.log('rejectRegistration triggered for ID:', id);
      if (this.supabaseConnected && supabase) {
        try {
          const dbRow = this.toDbRow(reg);
          const { error } = await supabase
            .from('registrations')
            .upsert([dbRow], { onConflict: 'id' });

          if (error) {
            console.error('Supabase reject error:', error.message);
            this.lastSupabaseError = error.message;
            this.notify();
            return { success: false, error: error.message };
          } else {
            this.lastSupabaseError = null;
          }
        } catch (err) {
          console.error('Supabase update error:', err);
          return { success: false, error: err.message };
        }
      }
    }
    return { success: true };
  }

  async deleteRegistration(id) {
    this.registrations = this.registrations.filter(r => r.id !== id);
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        const { error } = await supabase
          .from('registrations')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('Supabase delete error:', error.message);
          this.lastSupabaseError = error.message;
          this.notify();
          return { success: false, error: error.message };
        }
      } catch (err) {
        console.error('Supabase delete error:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  getPendingCount() {
    return this.registrations.filter(r => r.status === 'bekliyor').length;
  }

  getTotalMonthlyRevenue() {
    return this.registrations
      .filter(r => r.status === 'onaylandi')
      .reduce((sum, r) => sum + (r.planPrice || 899), 0);
  }

  // --- Live Orders Management ---
  saveOrders() {
    localStorage.setItem('buyurabi_restaurant_orders', JSON.stringify(this.orders));
  }

  getOrders(businessId = 'all') {
    if (!businessId || businessId === 'all') return this.orders;
    return this.orders.filter(o => o.businessId === businessId);
  }

  getOrdersForBusiness(businessId) {
    return this.orders.filter(o => o.businessId === businessId);
  }

  updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.saveOrders();
      this.notify();
      return true;
    }
    return false;
  }

  cancelOrder(orderId, reason = 'Destek ekibi tarafından iptal edildi') {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'iptal';
      order.cancelReason = reason;
      this.saveOrders();
      this.notify();
      return true;
    }
    return false;
  }

  createTestOrderForBusiness(businessId) {
    const business = this.registrations.find(r => r.id === businessId) || {
      id: businessId,
      businessName: 'Test Restoranı'
    };

    const sampleDishes = [
      { name: 'Zırh Kıyma Adana Kebap', price: 340, note: 'Orta acılı' },
      { name: 'Taş Fırın Lahmacun', price: 95, note: 'Bol limon & yeşillik' },
      { name: 'Tereyağlı İskender Kebap', price: 380, note: 'Duble tereyağlı' },
      { name: 'Künefe', price: 160, note: 'Dondurmalı' },
      { name: 'Bol Köpüklü Yayık Ayran', price: 45, note: 'Soğuk' },
      { name: 'San Sebastian Cheesecake', price: 195, note: 'Çikolata soslu' }
    ];

    const pick1 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const pick2 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const items = [
      { name: pick1.name, qty: 1, price: pick1.price, note: pick1.note },
      { name: pick2.name, qty: 2, price: pick2.price, note: pick2.note }
    ];
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.qty), 0);

    const testOrder = {
      id: 'SIP-' + Math.floor(1000 + Math.random() * 9000),
      businessId: business.id,
      businessName: business.businessName,
      tableName: 'Masa ' + Math.floor(1 + Math.random() * 12),
      customerName: 'Canlı Destek Testi (Temsilci)',
      items,
      totalPrice,
      status: 'yeni',
      paymentMethod: 'Masada Kart / Nakit',
      createdAt: 'Az önce',
      timestamp: Date.now()
    };

    this.orders.unshift(testOrder);
    this.saveOrders();
    this.playChime();
    this.notify();
    return testOrder;
  }

  // --- Live Support & Call Logs Management ---
  saveSupportNotes() {
    localStorage.setItem('buyurabi_support_call_notes', JSON.stringify(this.supportNotes));
  }

  getSupportNotes(businessId = 'all') {
    if (!businessId || businessId === 'all') return this.supportNotes;
    return this.supportNotes.filter(n => n.businessId === businessId);
  }

  addSupportNote(businessId, { category, text, agent = 'Destek Temsilcisi' }) {
    const newNote = {
      id: 'NOTE-' + Date.now(),
      businessId,
      agent,
      category: category || 'Genel Destek',
      text: text || '',
      createdAt: 'Az önce',
      timestamp: Date.now()
    };

    this.supportNotes.unshift(newNote);
    this.saveSupportNotes();
    this.notify();
    return newNote;
  }

  // --- Diagnostics Helper ---
  getBusinessDiagnostics(businessId) {
    const business = this.registrations.find(r => r.id === businessId);
    if (!business) return null;

    const bOrders = this.orders.filter(o => o.businessId === businessId);
    const activeOrders = bOrders.filter(o => o.status === 'yeni' || o.status === 'hazirlaniyor' || o.status === 'masada');
    const totalOrderRevenue = bOrders.filter(o => o.status !== 'iptal').reduce((sum, o) => sum + o.totalPrice, 0);

    return {
      business,
      qrUrl: `https://buyurabi.com/menu/${business.id}`,
      systemStatus: business.status === 'onaylandi' ? '🟢 Aktif & Siparişe Açık' : '⏳ Onay Bekliyor',
      latency: Math.floor(18 + Math.random() * 14) + ' ms',
      kitchenStatus: '🟢 Çevrimiçi (Sinyal: Mükemmel)',
      activeOrdersCount: activeOrders.length,
      totalOrdersCount: bOrders.length,
      totalOrderRevenue,
      lastPing: '15 saniye önce'
    };
  }

  // Pleasant Web Audio Two-tone chime for incoming orders & tests
  playChime() {
    if (!this.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const playTone = (freq, time, duration) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
      };

      // Two-tone chime: 587.33 Hz (D5) -> 880 Hz (A5)
      playTone(587.33, 0, 0.25);
      playTone(880.00, 0.15, 0.4);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }
}

export const store = new AppStore();
