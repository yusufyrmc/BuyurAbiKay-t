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

    this.activeView = 'landing';
    this.adminUnlocked = sessionStorage.getItem('buyurabi_admin_session') === 'true';
    this.adminPassword = '123456';

    if (this.supabaseConnected) {
      this.initSupabase();
    }
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

    // 1. Add locally first
    this.registrations.unshift(newReg);
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
}

export const store = new AppStore();
