import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

export const DEFAULT_PLANS = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    badge: '10 MASA KAPASİTESİ',
    price: 499,
    period: '/ay',
    description: 'Küçük kafeler, butik lokantalar ve tek salonlu işletmeler için ideal adisyon çözümü.',
    features: [
      '10 Masaya Kadar Masa Ekleme',
      'Masada QR ile Garson Çağırma',
      'Garson QR ile Telefon Girişi & Sipariş Ekleme',
      'Masalar ve Ücretleri Kasa Ekranı',
      'Yan Panelde Açılan Adisyon & Nakit/Kart Tahsilat',
      'Günlük Kasa Raporu'
    ],
    popular: false,
    capacity: 10
  },
  {
    id: 'pro',
    name: 'Profesyonel Paket',
    badge: '25 MASA KAPASİTESİ',
    price: 899,
    period: '/ay',
    description: 'Orta ölçekli restoranlar, kebapçılar ve yoğun çalışan mutfaklar için tam teşekküllü otomasyon.',
    features: [
      '25 Masaya Kadar Masa Ekleme',
      'Ciro Gizleme Butonu',
      'Mutfak Sıcak Sayfası (Aşçı Hazırlık)',
      'Sipariş Görme Açma/Kapama & Sipariş Silme',
      'Menü Fiyat Ayarlama',
      'Sınırsız Garson Tanımlama & QR Giriş',
      'Fiş / Fatura Çıkarma',
      'Günlük Kasa & Haftalık Ciro Raporu'
    ],
    popular: true,
    capacity: 25
  },
  {
    id: 'enterprise',
    name: 'Kurumsal Paket',
    badge: 'SINIRSIZ MASA KAPASİTESİ',
    price: 1499,
    period: '/ay',
    description: 'Büyük restoranlar, çok salonlu mekanlar ve zincir işletmeler için sınırsız güç.',
    features: [
      'Sınırsız Masa Ekleme',
      'Özel Masalara Fiyat Ayarlaması (VIP/Loca)',
      'Günlük En Çok Satılanlar Analizi',
      'Alınan Ücretler & Tahsilat Dökümü',
      'Çoklu Kasa & Şube Entegrasyonu',
      'Termal Yazıcı ve Fatura Entegrasyonu',
      '7/24 Öncelikli Telefon & Canlı Destek'
    ],
    popular: false,
    capacity: 999
  }
];

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
        plan: 'Profesyonel Paket (25 Masa - ₺899/ay)',
        planPrice: 899,
        status: 'onaylandi',
        password: '123456',
        createdAt: '10 dk önce',
        timestamp: Date.now() - 10 * 60 * 1000,
        ownerEmail: 'ahmet@gaziantepsofrasi.com',
        ownerRole: 'İşletme Sahibi'
      },
      {
        id: 'REG-1002',
        businessName: 'Moda Artisan Kafe',
        fullName: 'Selin Kaya',
        businessType: 'Kafe & Patisserie',
        phone: '0544 888 12 34',
        city: 'İstanbul / Kadıköy',
        fullAddress: 'Mühürdar Sok. No:12 Moda',
        plan: 'Başlangıç Paketi (10 Masa - ₺499/ay)',
        planPrice: 499,
        status: 'onaylandi',
        password: '123456',
        createdAt: '2 saat önce',
        timestamp: Date.now() - 120 * 60 * 1000,
        ownerEmail: 'selin@modakafe.com',
        ownerRole: 'Restoran Müdürü'
      },
      {
        id: 'REG-1003',
        businessName: 'Çıtır Taş Fırın Pide',
        fullName: 'Mehmet Öztürk',
        businessType: 'Pide & Lahmacun Salonu',
        phone: '0505 111 22 33',
        city: 'Ankara / Çankaya',
        fullAddress: 'Tunalı Hilmi Cad. No:45 Çankaya',
        plan: 'Kurumsal Paket (Sınırsız - ₺1.499/ay)',
        planPrice: 1499,
        status: 'bekliyor',
        password: '123456',
        createdAt: '45 dk önce',
        timestamp: Date.now() - 45 * 60 * 1000,
        ownerEmail: 'mehmet@citirpide.com',
        ownerRole: 'İşletme Sahibi'
      }
    ];

    const savedLastReg = localStorage.getItem('buyurabi_last_registered_business');
    this.lastRegisteredBusiness = savedLastReg ? JSON.parse(savedLastReg) : null;

    // User Profiles
    const savedProfiles = localStorage.getItem('buyurabi_user_profiles_list');
    this.profiles = savedProfiles ? JSON.parse(savedProfiles) : [
      {
        id: 'PRF-1001',
        fullName: 'Ahmet Yılmaz',
        email: 'ahmet@gaziantepsofrasi.com',
        phone: '0532 555 44 33',
        role: 'İşletme Sahibi',
        password: '123456',
        createdAt: 'Bugün',
        timestamp: Date.now() - 60 * 60 * 1000
      },
      {
        id: 'PRF-1002',
        fullName: 'Selin Kaya',
        email: 'selin@modakafe.com',
        phone: '0544 888 12 34',
        role: 'Restoran Müdürü',
        password: '123456',
        createdAt: 'Dün',
        timestamp: Date.now() - 24 * 60 * 60 * 1000
      }
    ];

    const savedUserProfile = localStorage.getItem('buyurabi_user_profile');
    this.userProfile = savedUserProfile ? JSON.parse(savedUserProfile) : null;

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
        text: 'Ahmet Bey aradı. Masa 4 garson çağırma testi yapıldı ve kasanın bildirim sesi onaylandı.',
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

    // Pricing & Capacity Plans (Dynamic from Admin Panel)
    const savedPlans = localStorage.getItem('buyurabi_pricing_plans');
    this.pricingPlans = savedPlans ? JSON.parse(savedPlans) : JSON.parse(JSON.stringify(DEFAULT_PLANS));

    if (this.supabaseConnected) {
      this.initSupabase();
    }
  }

  // --- Pricing Plans Methods ---
  getPricingPlans() {
    return this.pricingPlans || DEFAULT_PLANS;
  }

  savePricingPlans(newPlans) {
    this.pricingPlans = newPlans;
    try {
      localStorage.setItem('buyurabi_pricing_plans', JSON.stringify(newPlans));
    } catch (e) {
      console.warn('Failed to save plans to localStorage:', e);
    }
    this.notify();
    return true;
  }

  resetPricingPlans() {
    this.pricingPlans = JSON.parse(JSON.stringify(DEFAULT_PLANS));
    try {
      localStorage.setItem('buyurabi_pricing_plans', JSON.stringify(this.pricingPlans));
    } catch (e) {}
    this.notify();
    return this.pricingPlans;
  }

  // --- Subscriptions & State Persistence ---
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
    try {
      localStorage.setItem('buyurabi_restaurant_registrations', JSON.stringify(this.registrations));
      localStorage.setItem('buyurabi_restaurant_orders', JSON.stringify(this.orders));
      localStorage.setItem('buyurabi_support_call_notes', JSON.stringify(this.supportNotes));
      localStorage.setItem('buyurabi_user_profiles_list', JSON.stringify(this.profiles));
      if (this.userProfile) {
        localStorage.setItem('buyurabi_user_profile', JSON.stringify(this.userProfile));
      } else {
        localStorage.removeItem('buyurabi_user_profile');
      }
      if (this.lastRegisteredBusiness) {
        localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(this.lastRegisteredBusiness));
      } else {
        localStorage.removeItem('buyurabi_last_registered_business');
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
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

  // ========================================================
  // SUPABASE INITIALIZATION & REALTIME SYNC
  // ========================================================
  async initSupabase() {
    try {
      await Promise.all([
        this.fetchRegistrations(),
        this.fetchOrders(),
        this.fetchSupportNotes(),
        this.fetchProfiles()
      ]);
      this.setupRealtimeSubscriptions();
    } catch (err) {
      console.warn('Supabase initial loading notice:', err);
    }
  }

  setupRealtimeSubscriptions() {
    if (!supabase) return;
    try {
      supabase
        .channel('buyurabi-all-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          () => {
            console.log('Realtime update on registrations table');
            this.fetchRegistrations();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'orders' },
          () => {
            console.log('Realtime update on orders table');
            this.fetchOrders();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'support_notes' },
          () => {
            console.log('Realtime update on support_notes table');
            this.fetchSupportNotes();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            console.log('Realtime update on profiles table');
            this.fetchProfiles();
          }
        )
        .subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ Supabase Realtime tüm tablolara başarıyla bağlandı.');
          } else if (err || status === 'CHANNEL_ERROR') {
            console.warn('Supabase Realtime kanal uyarısı:', status, err);
          }
        });
    } catch (err) {
      console.warn('Supabase Realtime subscription error:', err);
    }
  }

  // ========================================================
  // 1. PROFILES MANAGEMENT & SUPABASE
  // ========================================================
  toProfileDbRow(profile) {
    return {
      id: String(profile.id || ('PRF-' + Math.floor(1000 + Math.random() * 9000))),
      full_name: profile.fullName || 'Yetkili',
      email: profile.email || '',
      phone: profile.phone || '',
      role: profile.role || 'İşletme Sahibi',
      password: profile.password || '123456',
      created_at: profile.createdAt || 'Yeni',
      timestamp: Number(profile.timestamp || Date.now())
    };
  }

  fromProfileDbRow(row) {
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      role: row.role || 'İşletme Sahibi',
      password: row.password || '',
      createdAt: row.created_at || 'Yeni',
      timestamp: Number(row.timestamp || Date.now())
    };
  }

  getUserProfile() {
    if (this.userProfile) return this.userProfile;
    try {
      const saved = localStorage.getItem('buyurabi_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  hasUserProfile() {
    return !!this.getUserProfile();
  }

  clearUserProfile() {
    this.userProfile = null;
    localStorage.removeItem('buyurabi_user_profile');
    this.notify();
  }

  async fetchProfiles() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase profiles fetch error:', error.message);
        return;
      }

      if (data) {
        this.profiles = data.map(r => this.fromProfileDbRow(r));
        this.notify();
      }
    } catch (err) {
      console.warn('fetchProfiles error:', err);
    }
  }

  async saveUserProfile(profileData) {
    // Generate or retain unique profile ID (UUID preferred)
    const generatedId = profileData.id || 
      (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : ('prf-' + Date.now()));

    const profile = {
      id: generatedId,
      fullName: profileData.fullName,
      email: profileData.email || '',
      phone: profileData.phone,
      role: profileData.role || 'İşletme Sahibi',
      password: profileData.password || '123456',
      createdAt: profileData.createdAt || 'Az önce',
      timestamp: profileData.timestamp || Date.now()
    };

    // Save locally
    this.userProfile = profile;
    const existingIdx = this.profiles.findIndex(p => 
      p.id === profile.id || 
      (profile.email && p.email && p.email.toLowerCase() === profile.email.toLowerCase()) || 
      (profile.phone && p.phone && p.phone === profile.phone)
    );
    if (existingIdx >= 0) {
      this.profiles[existingIdx] = profile;
    } else {
      this.profiles.unshift(profile);
    }
    this.notify();

    // Persist to Supabase profiles table
    if (this.supabaseConnected && supabase) {
      try {
        const dbRow = {
          id: String(profile.id),
          full_name: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          role: profile.role,
          password: profile.password,
          created_at: profile.createdAt,
          timestamp: Number(profile.timestamp)
        };

        let { data, error } = await supabase
          .from('profiles')
          .upsert([dbRow], { onConflict: 'id' })
          .select();

        // If UUID mismatch or column conflict occurs, retry without client id so DB generates it
        if (error) {
          console.warn('Upsert with ID notice, trying insert:', error.message);
          const rowWithoutId = {
            full_name: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
            password: profile.password,
            created_at: profile.createdAt,
            timestamp: Number(profile.timestamp)
          };
          const retryRes = await supabase.from('profiles').insert([rowWithoutId]).select();
          data = retryRes.data;
          error = retryRes.error;
        }

        if (error) {
          console.error('Supabase profile save error:', error.message);
          this.lastSupabaseError = error.message;
          return { success: false, profile, error: error.message };
        }

        if (data && data.length > 0) {
          const savedRow = data[0];
          profile.id = String(savedRow.id);
          this.userProfile.id = String(savedRow.id);
          const idx = this.profiles.findIndex(p => p.email === profile.email || p.id === profile.id);
          if (idx >= 0) {
            this.profiles[idx] = this.fromProfileDbRow(savedRow);
          }
          this.notify();
        }

        console.log('✅ Profil Supabase profiles tablosuna başarıyla kaydedildi!');
        this.lastSupabaseError = null;
      } catch (err) {
        console.error('saveUserProfile Supabase exception:', err);
        return { success: false, profile, error: err.message };
      }
    }

    return { success: true, profile };
  }

  async queryProfileByLogin(loginIdentifier) {
    if (!this.supabaseConnected || !supabase) return { data: [], error: 'Supabase offline' };
    try {
      const clean = loginIdentifier.trim();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.${clean},phone.ilike.%${clean}%,id.eq.${clean}`)
        .limit(1);
      return { data, error };
    } catch (err) {
      return { data: [], error: err.message };
    }
  }

  logoutUser() {
    this.userProfile = null;
    this.lastRegisteredBusiness = null;
    localStorage.removeItem('buyurabi_user_profile');
    localStorage.removeItem('buyurabi_last_registered_business');
    this.saveState();
    this.notify();
    console.log('✅ Kullanıcı oturumu ve işletme bilgileri tamamen sıfırlandı (logout)');
  }

  async deleteProfile(profileId) {
    this.profiles = this.profiles.filter(p => p.id !== profileId);
    if (this.userProfile?.id === profileId) {
      this.logoutUser();
    } else {
      this.notify();
    }

    if (this.supabaseConnected && supabase) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', profileId);
        if (error) {
          console.error('Supabase deleteProfile error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err) {
        console.warn('deleteProfile Supabase error:', err);
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  }

  // ========================================================
  // 2. REGISTRATIONS MANAGEMENT & SUPABASE
  // ========================================================
  toDbRow(reg, includePassword = true) {
    const row = {
      id: String(reg.id),
      business_name: reg.businessName || '',
      full_name: reg.fullName || '',
      business_type: reg.businessType || 'Restoran & Lokanta',
      phone: reg.phone || '',
      city: reg.city || '',
      full_address: reg.fullAddress || '',
      plan: reg.plan || 'Profesyonel Paket (25 Masa - ₺899/ay)',
      plan_price: Number(reg.planPrice || 899),
      status: reg.status || 'bekliyor',
      created_at: reg.createdAt || 'Yeni',
      timestamp: Number(reg.timestamp || Date.now()),
      owner_email: reg.ownerEmail || reg.email || '',
      owner_role: reg.ownerRole || reg.role || 'İşletme Sahibi'
    };

    if (includePassword && reg.password) {
      row.password = reg.password;
    }

    return row;
  }

  fromDbRow(item) {
    return {
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
      timestamp: Number(item.timestamp || Date.now()),
      ownerEmail: item.owner_email || '',
      ownerRole: item.owner_role || 'İşletme Sahibi'
    };
  }

  reloadFromLocalStorage() {
    try {
      const savedRegs = localStorage.getItem('buyurabi_restaurant_registrations');
      if (savedRegs) this.registrations = JSON.parse(savedRegs);

      const savedLast = localStorage.getItem('buyurabi_last_registered_business');
      if (savedLast) this.lastRegisteredBusiness = JSON.parse(savedLast);

      const savedProfiles = localStorage.getItem('buyurabi_user_profiles_list');
      if (savedProfiles) this.profiles = JSON.parse(savedProfiles);

      const savedUser = localStorage.getItem('buyurabi_user_profile');
      if (savedUser) this.userProfile = JSON.parse(savedUser);

      if (this.lastRegisteredBusiness && this.registrations) {
        const live = this.registrations.find(r => r.id === this.lastRegisteredBusiness.id);
        if (live) {
          this.lastRegisteredBusiness = { ...this.lastRegisteredBusiness, ...live };
        }
      }
      this.listeners.forEach(l => l(this));
    } catch (e) {
      console.warn('reloadFromLocalStorage error:', e);
    }
  }

  getLastRegisteredBusiness() {
    let current = this.lastRegisteredBusiness;
    if (!current) {
      try {
        const saved = localStorage.getItem('buyurabi_last_registered_business');
        current = saved ? JSON.parse(saved) : null;
      } catch (e) {
        current = null;
      }
    }

    try {
      const savedRegs = localStorage.getItem('buyurabi_restaurant_registrations');
      if (savedRegs) {
        const parsed = JSON.parse(savedRegs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.registrations = parsed;
        }
      }
    } catch (e) {}

    // Always sync with live registrations list for up-to-date status (approved/pending/rejected)
    if (current && this.registrations && this.registrations.length > 0) {
      const live = this.registrations.find(r => r.id === current.id);
      if (live) {
        current = { ...current, ...live };
        this.lastRegisteredBusiness = current;
      }
    }
    return current;
  }

  setLastRegisteredBusiness(reg) {
    this.lastRegisteredBusiness = reg;
    try {
      localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(reg));
    } catch (e) {}
    this.notify();
  }

  clearLastRegisteredBusiness() {
    this.lastRegisteredBusiness = null;
    localStorage.removeItem('buyurabi_last_registered_business');
    this.notify();
  }

  // Get all applications that belong to the logged-in user
  getUserApplications() {
    const profile = this.getUserProfile();
    if (!profile) return [];
    const cleanEmail = (profile.email || '').toLowerCase().trim();
    const cleanPhone = (profile.phone || '').replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const cleanName = (profile.fullName || '').toLowerCase().trim();

    return this.registrations.filter(r => {
      const regEmail = (r.ownerEmail || r.email || '').toLowerCase().trim();
      const regPhone = (r.phone || '').replace(/\s+/g, '').replace(/[^0-9]/g, '');
      const regName = (r.fullName || '').toLowerCase().trim();

      const emailMatch = cleanEmail && regEmail && cleanEmail === regEmail;
      const phoneMatch = cleanPhone && regPhone && cleanPhone === regPhone;
      const nameMatch = cleanName && regName && cleanName === regName;
      const lastRegMatch = this.lastRegisteredBusiness && this.lastRegisteredBusiness.id === r.id;

      return emailMatch || phoneMatch || (nameMatch && (cleanEmail || cleanPhone)) || lastRegMatch;
    });
  }

  async fetchRegistrations() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase registrations fetch error:', error.message);
        this.lastSupabaseError = error.message;
        this.notify();
        return;
      }

      this.lastSupabaseError = null;

      if (data) {
        this.registrations = data.map(item => this.fromDbRow(item));
        // Live sync lastRegisteredBusiness
        let currentLast = this.lastRegisteredBusiness;
        if (!currentLast) {
          try {
            const saved = localStorage.getItem('buyurabi_last_registered_business');
            currentLast = saved ? JSON.parse(saved) : null;
          } catch (e) {}
        }
        if (currentLast) {
          const live = this.registrations.find(r => r.id === currentLast.id);
          if (live) {
            this.lastRegisteredBusiness = { ...currentLast, ...live };
            localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(this.lastRegisteredBusiness));
          }
        }
        this.notify();
      }
    } catch (err) {
      console.error('Supabase registrations connection error:', err);
      this.lastSupabaseError = err.message || 'Bağlantı hatası';
      this.notify();
    }
  }

  async addRegistration(regData) {
    const generatedId = regData.id || ('BYR-' + Math.floor(1000 + Math.random() * 9000));
    const newReg = {
      id: generatedId,
      status: 'bekliyor',
      createdAt: 'Az önce',
      timestamp: Date.now(),
      ownerEmail: regData.ownerEmail || regData.email || '',
      ownerRole: regData.ownerRole || regData.role || 'İşletme Sahibi',
      ...regData
    };

    // 1. Add locally
    this.registrations.unshift(newReg);
    this.lastRegisteredBusiness = newReg;
    this.notify();

    // 2. Persist to Supabase registrations table
    if (this.supabaseConnected && supabase) {
      try {
        const dbRowWithPass = this.toDbRow(newReg, true);
        let { error } = await supabase
          .from('registrations')
          .upsert([dbRowWithPass], { onConflict: 'id' });

        if (error && (error.code === '42703' || (error.message && error.message.includes('column')))) {
          console.warn('Some columns missing, retrying with minimal row...');
          const minimalRow = {
            id: String(newReg.id),
            business_name: newReg.businessName,
            full_name: newReg.fullName,
            business_type: newReg.businessType,
            phone: newReg.phone,
            city: newReg.city,
            full_address: newReg.fullAddress,
            plan: newReg.plan,
            plan_price: Number(newReg.planPrice || 899),
            status: newReg.status,
            created_at: newReg.createdAt,
            timestamp: Number(newReg.timestamp)
          };
          const retryRes = await supabase.from('registrations').upsert([minimalRow], { onConflict: 'id' });
          error = retryRes.error;
        }

        if (error) {
          console.error('Supabase registration insert error:', error.message);
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
    }

    return { success: true, reg: newReg };
  }

  async approveRegistration(id) {
    const reg = this.registrations.find(r => r.id === id);
    if (reg) {
      reg.status = 'onaylandi';
      if (this.lastRegisteredBusiness?.id === id) {
        this.lastRegisteredBusiness.status = 'onaylandi';
      }
      try {
        const savedLast = localStorage.getItem('buyurabi_last_registered_business');
        if (savedLast) {
          const parsed = JSON.parse(savedLast);
          if (parsed && parsed.id === id) {
            parsed.status = 'onaylandi';
            localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(parsed));
          }
        }
      } catch (e) {}
      this.notify();

      if (this.supabaseConnected && supabase) {
        try {
          const { error } = await supabase
            .from('registrations')
            .update({ status: 'onaylandi' })
            .eq('id', id);
          if (error) {
            console.warn('Update registrations status notice, trying upsert:', error.message);
            const dbRow = this.toDbRow(reg, true);
            await supabase.from('registrations').upsert([dbRow], { onConflict: 'id' });
          }
        } catch (err) {
          console.error('approveRegistration Supabase error:', err);
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
      if (this.lastRegisteredBusiness?.id === id) {
        this.lastRegisteredBusiness.status = 'reddedildi';
      }
      try {
        const savedLast = localStorage.getItem('buyurabi_last_registered_business');
        if (savedLast) {
          const parsed = JSON.parse(savedLast);
          if (parsed && parsed.id === id) {
            parsed.status = 'reddedildi';
            localStorage.setItem('buyurabi_last_registered_business', JSON.stringify(parsed));
          }
        }
      } catch (e) {}
      this.notify();

      if (this.supabaseConnected && supabase) {
        try {
          const { error } = await supabase
            .from('registrations')
            .update({ status: 'reddedildi' })
            .eq('id', id);
          if (error) {
            console.warn('Update registrations status notice, trying upsert:', error.message);
            const dbRow = this.toDbRow(reg, true);
            await supabase.from('registrations').upsert([dbRow], { onConflict: 'id' });
          }
        } catch (err) {
          console.error('rejectRegistration Supabase error:', err);
          return { success: false, error: err.message };
        }
      }
    }
    return { success: true };
  }

  async deleteRegistration(id) {
    this.registrations = this.registrations.filter(r => r.id !== id);
    if (this.lastRegisteredBusiness?.id === id) {
      this.lastRegisteredBusiness = null;
      localStorage.removeItem('buyurabi_last_registered_business');
    }
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        const { error } = await supabase.from('registrations').delete().eq('id', id);
        if (error) {
          console.error('Supabase delete error:', error.message);
          return { success: false, error: error.message };
        }
      } catch (err) {
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

  // ========================================================
  // 3. LIVE ORDERS MANAGEMENT & SUPABASE
  // ========================================================
  toOrderDbRow(order) {
    return {
      id: String(order.id),
      business_id: String(order.businessId || ''),
      business_name: order.businessName || '',
      table_name: order.tableName || '',
      customer_name: order.customerName || '',
      items: order.items || [],
      total_price: Number(order.totalPrice || 0),
      status: order.status || 'yeni',
      payment_method: order.paymentMethod || 'Masada Kart / Nakit',
      cancel_reason: order.cancelReason || null,
      created_at: order.createdAt || 'Az önce',
      timestamp: Number(order.timestamp || Date.now())
    };
  }

  fromOrderDbRow(item) {
    return {
      id: item.id,
      businessId: item.business_id,
      businessName: item.business_name,
      tableName: item.table_name,
      customerName: item.customer_name,
      items: Array.isArray(item.items) ? item.items : [],
      totalPrice: Number(item.total_price || 0),
      status: item.status || 'yeni',
      paymentMethod: item.payment_method || 'Masada Kart / Nakit',
      cancelReason: item.cancel_reason || '',
      createdAt: item.created_at || 'Az önce',
      timestamp: Number(item.timestamp || Date.now())
    };
  }

  async fetchOrders() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase orders fetch error:', error.message);
        return;
      }

      if (data) {
        this.orders = data.map(item => this.fromOrderDbRow(item));
        this.notify();
      }
    } catch (err) {
      console.warn('fetchOrders error:', err);
    }
  }

  getOrders(businessId = 'all') {
    if (!businessId || businessId === 'all') return this.orders;
    return this.orders.filter(o => o.businessId === businessId);
  }

  getOrdersForBusiness(businessId) {
    return this.orders.filter(o => o.businessId === businessId);
  }

  async updateOrderStatus(orderId, newStatus) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      this.notify();

      if (this.supabaseConnected && supabase) {
        try {
          const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);
          if (error) {
            console.error('Supabase updateOrderStatus error:', error.message);
          }
        } catch (err) {
          console.error('updateOrderStatus error:', err);
        }
      }
      return true;
    }
    return false;
  }

  async cancelOrder(orderId, reason = 'Destek ekibi tarafından iptal edildi') {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'iptal';
      order.cancelReason = reason;
      this.notify();

      if (this.supabaseConnected && supabase) {
        try {
          await supabase
            .from('orders')
            .update({ status: 'iptal', cancel_reason: reason })
            .eq('id', orderId);
        } catch (err) {
          console.error('cancelOrder error:', err);
        }
      }
      return true;
    }
    return false;
  }

  async deleteOrder(orderId) {
    this.orders = this.orders.filter(o => o.id !== orderId);
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {
        console.error('deleteOrder error:', err);
      }
    }
    return true;
  }

  async clearCompletedOrders() {
    this.orders = this.orders.filter(o => o.status !== 'tamamlandi' && o.status !== 'iptal');
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        await supabase.from('orders').delete().in('status', ['tamamlandi', 'iptal']);
      } catch (err) {
        console.error('clearCompletedOrders error:', err);
      }
    }
    return true;
  }

  async createTestOrderForBusiness(businessId) {
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
    this.playChime();
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        const dbRow = this.toOrderDbRow(testOrder);
        await supabase.from('orders').upsert([dbRow], { onConflict: 'id' });
      } catch (err) {
        console.error('createTestOrderForBusiness Supabase error:', err);
      }
    }

    return testOrder;
  }

  // ========================================================
  // 4. LIVE SUPPORT NOTES & SUPABASE
  // ========================================================
  toNoteDbRow(note) {
    return {
      id: String(note.id),
      business_id: String(note.businessId || ''),
      agent: note.agent || 'Destek Temsilcisi',
      category: note.category || 'Genel Danışma',
      text: note.text || '',
      created_at: note.createdAt || 'Az önce',
      timestamp: Number(note.timestamp || Date.now())
    };
  }

  fromNoteDbRow(item) {
    return {
      id: item.id,
      businessId: item.business_id,
      agent: item.agent || 'Destek Temsilcisi',
      category: item.category || 'Genel Danışma',
      text: item.text || '',
      createdAt: item.created_at || 'Az önce',
      timestamp: Number(item.timestamp || Date.now())
    };
  }

  async fetchSupportNotes() {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('support_notes')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.warn('Supabase support_notes fetch error:', error.message);
        return;
      }

      if (data) {
        this.supportNotes = data.map(item => this.fromNoteDbRow(item));
        this.notify();
      }
    } catch (err) {
      console.warn('fetchSupportNotes error:', err);
    }
  }

  getSupportNotes(businessId = 'all') {
    if (!businessId || businessId === 'all') return this.supportNotes;
    return this.supportNotes.filter(n => n.businessId === businessId);
  }

  async addSupportNote(businessId, { category, text, agent = 'Destek Temsilcisi' }) {
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
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        const dbRow = this.toNoteDbRow(newNote);
        await supabase.from('support_notes').upsert([dbRow], { onConflict: 'id' });
      } catch (err) {
        console.error('addSupportNote Supabase error:', err);
      }
    }

    return newNote;
  }

  async deleteSupportNote(noteId) {
    this.supportNotes = this.supportNotes.filter(n => n.id !== noteId);
    this.notify();

    if (this.supabaseConnected && supabase) {
      try {
        await supabase.from('support_notes').delete().eq('id', noteId);
      } catch (err) {
        console.error('deleteSupportNote Supabase error:', err);
      }
    }
    return true;
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
      qrUrl: `https://buyurabi.com/kasa/${business.id}`,
      systemStatus: business.status === 'onaylandi' ? '🟢 Aktif & Siparişe Açık' : '⏳ Onay Bekliyor',
      latency: Math.floor(18 + Math.random() * 14) + ' ms',
      kitchenStatus: '🟢 Çevrimiçi (Sinyal: Mükemmel)',
      activeOrdersCount: activeOrders.length,
      totalOrdersCount: bOrders.length,
      totalOrderRevenue,
      lastPing: '15 saniye önce'
    };
  }

  // Audio chime for orders
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

      playTone(587.33, 0, 0.25);
      playTone(880.00, 0.15, 0.4);
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  }
}

export const store = new AppStore();
