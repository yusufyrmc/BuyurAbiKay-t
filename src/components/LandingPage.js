import { store } from '../state/store.js';

export function renderLandingPage(container) {
  const lastReg = store.getLastRegisteredBusiness();

  // Interactive Kasa Simulation State
  let ciroHidden = false;
  let orderStreamActive = true;
  let selectedTableId = 4;

  const mockTables = [
    { id: 1, name: 'Masa 1', zone: 'İç Salon', total: 340, status: 'dolu', specialPrice: false, items: [
      { name: '1x Zırh Kıyma Adana Kebap', price: 340 }
    ]},
    { id: 2, name: 'Masa 2', zone: 'Bahçe', total: 680, status: 'dolu', specialPrice: false, items: [
      { name: '2x Tereyağlı İskender Kebap', price: 680 }
    ]},
    { id: 3, name: 'Masa 3', zone: 'Teras', total: 0, status: 'bos', specialPrice: false, items: [] },
    { id: 4, name: 'Masa 4 (VIP)', zone: 'Bahçe', total: 520, status: 'dolu', specialPrice: true, items: [
      { name: '2x Zırh Kıyma Adana Kebap', price: 400 },
      { name: '2x Bol Köpüklü Ayran', price: 60 },
      { name: '1x Hatay Usulü Künefe', price: 60 }
    ]},
    { id: 5, name: 'Masa 5 (Loca)', zone: 'VIP Salon', total: 1450, status: 'dolu', specialPrice: true, items: [
      { name: '3x BuyurAbi Gurme Burger', price: 960 },
      { name: '2x Çıtır Künefe (Kaymaklı)', price: 420 },
      { name: '1x Közde Türk Kahvesi', price: 70 }
    ]},
    { id: 6, name: 'Masa 6', zone: 'Teras', total: 0, status: 'bos', specialPrice: false, items: [] }
  ];

  function getSelectedTable() {
    return mockTables.find(t => t.id === selectedTableId) || mockTables[0];
  }

  function updateKasaSimulatorView() {
    const table = getSelectedTable();
    const ciroDisplayEl = container.querySelector('#sim-ciro-val');
    const ciroBtnIcon = container.querySelector('#sim-ciro-btn-icon');
    const ciroBtnText = container.querySelector('#sim-ciro-btn-text');
    const streamToggleBtn = container.querySelector('#sim-stream-toggle-btn');
    const sideTableName = container.querySelector('#sim-side-table-name');
    const sideTableBadge = container.querySelector('#sim-side-table-badge');
    const sideTableTotal = container.querySelector('#sim-side-table-total');
    const sideItemsList = container.querySelector('#sim-side-items-list');

    // 1. Ciro Gizleme Toggle (1.1)
    if (ciroDisplayEl) {
      ciroDisplayEl.textContent = ciroHidden ? '₺ •••••••' : '₺18.450,00';
    }
    if (ciroBtnIcon && ciroBtnText) {
      ciroBtnIcon.setAttribute('data-lucide', ciroHidden ? 'eye' : 'eye-off');
      ciroBtnText.textContent = ciroHidden ? 'Ciroyu Göster' : 'Ciro Gizle';
    }

    // 2. Sipariş Görme Açma/Kapama (1.4.1)
    if (streamToggleBtn) {
      if (orderStreamActive) {
        streamToggleBtn.style.background = 'rgba(0, 230, 118, 0.15)';
        streamToggleBtn.style.borderColor = 'rgba(0, 230, 118, 0.4)';
        streamToggleBtn.style.color = 'var(--color-accent-green)';
        streamToggleBtn.innerHTML = '<i data-lucide="bell" style="width:14px; height:14px;"></i> Sipariş Görme: AÇIK';
      } else {
        streamToggleBtn.style.background = 'rgba(239, 68, 68, 0.15)';
        streamToggleBtn.style.borderColor = 'rgba(239, 68, 68, 0.4)';
        streamToggleBtn.style.color = 'var(--color-danger)';
        streamToggleBtn.innerHTML = '<i data-lucide="bell-off" style="width:14px; height:14px;"></i> Sipariş Görme: KAPALI';
      }
    }

    // 3. Side Panel Selected Table & Items (1.7 & 1.7.1)
    if (sideTableName) sideTableName.textContent = table.name;
    if (sideTableBadge) {
      sideTableBadge.innerHTML = table.specialPrice 
        ? `<span style="background:rgba(255,107,0,0.2); color:var(--color-primary); font-size:0.7rem; font-weight:800; padding:2px 8px; border-radius:6px;">⭐ Özel VIP Fiyatlı</span>`
        : `<span style="background:rgba(255,255,255,0.06); color:var(--color-text-muted); font-size:0.7rem; padding:2px 8px; border-radius:6px;">${table.zone}</span>`;
    }
    if (sideTableTotal) sideTableTotal.textContent = `₺${table.total.toFixed(2)}`;

    if (sideItemsList) {
      if (table.items.length === 0) {
        sideItemsList.innerHTML = `
          <div style="text-align:center; padding:2rem 1rem; color:var(--color-text-dim);">
            <i data-lucide="coffee" style="width:32px; height:32px; margin-bottom:6px; opacity:0.4;"></i>
            <p style="font-size:0.85rem; margin:0;">Bu masada şu an açık sipariş bulunmuyor.</p>
          </div>
        `;
      } else {
        sideItemsList.innerHTML = table.items.map(item => `
          <div class="kasa-order-row">
            <span style="font-weight:600; color:#fff;">${item.name}</span>
            <span style="font-weight:800; color:var(--color-accent-green); font-family:monospace;">₺${item.price}</span>
          </div>
        `).join('');
      }
    }

    // Table buttons active states
    container.querySelectorAll('.kasa-table-item').forEach(el => {
      const id = Number(el.dataset.tableId);
      if (id === selectedTableId) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    });

    if (window.lucide) window.lucide.createIcons();
  }

  container.innerHTML = `
    <!-- REGISTERED USER ID BANNER (IF REGISTERED) -->
    ${lastReg && lastReg.id ? `
      <div style="background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.35); border-radius:var(--radius-md); padding:0.9rem 1.4rem; margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
        <div style="display:flex; align-items:center; gap:0.85rem;">
          <div style="width:40px; height:40px; border-radius:50%; background:rgba(0,230,118,0.2); color:var(--color-accent-green); display:flex; align-items:center; justify-content:center;">
            <i data-lucide="badge-check" style="width:22px; height:22px;"></i>
          </div>
          <div>
            <div style="font-size:0.8rem; color:var(--color-text-muted);">Sistemde Kayıtlı Adisyon İşletmeniz:</div>
            <strong style="font-size:1.05rem; color:#fff;">${lastReg.businessName}</strong>
            <span style="font-family:monospace; background:rgba(255,107,0,0.2); color:var(--color-primary); font-weight:800; padding:2px 8px; border-radius:6px; margin-left:8px; font-size:0.92rem;">KOD: ${lastReg.id}</span>
          </div>
        </div>
        <button id="btn-banner-view-id" class="pill-btn" style="background:var(--color-primary-gradient); color:#fff; font-weight:800; padding:0.6rem 1.2rem; border:none; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm); box-shadow:var(--shadow-glow);">
          <i data-lucide="id-card" style="width:16px; height:16px;"></i> Giriş Kartımı Aç
        </button>
      </div>
    ` : ''}

    <!-- HERO SECTION -->
    <div class="landing-hero">
      <div class="hero-text-content">
        <div class="hero-pill-tag">
          <i data-lucide="receipt"></i>
          <span>Yeni Nesil Restoran Dijital Adisyon & Kasa Otomasyonu</span>
        </div>

        <h1 class="hero-title-main">
          Restoranınızı Dijital Adisyonla Yönetin, <span>Masadan Kasaya Tam Kontrol!</span>
        </h1>

        <p class="hero-subtitle-main">
          Masada <strong>QR ile tek tıkla garson çağırma</strong>, garsonların kendi telefonundan <strong>masanın hesabına anında sipariş eklemesi</strong>, mutfakta canlı sıcak ekranı, ciro gizleme ve tek dokunuşla nakit/kart tahsilat hepsi tek bir ekranda!
        </p>

        <div class="hero-btn-group">
          <button class="btn-primary-hero" id="landing-btn-register-now">
            <i data-lucide="${lastReg ? 'id-card' : 'store'}"></i>
            <span>${lastReg ? 'İşletme / ID Kartımı Aç' : 'Hemen İşletmeni Kaydet'}</span>
          </button>

          <button class="btn-secondary-hero" id="landing-btn-learn-more">
            <i data-lucide="play"></i>
            <span>Sistemi & Kasa Ekranını İncele</span>
          </button>
        </div>

        <div style="display:flex; gap:2.5rem; padding-top:1.5rem; border-top:var(--border-glass);">
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-accent-green);">0 TL</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Kağıt Adisyon Masrafı</p>
          </div>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-primary);">1 Saniye</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Garson ➔ Kasa & Mutfak</p>
          </div>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-accent-cyan);">%100</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Ciro Gizleme & Güvenlik</p>
          </div>
        </div>
      </div>

      <!-- INTERACTIVE SHOWCASE CARD: CANLI KASA & ADİSYON SİMÜLATÖRÜ -->
      <div class="kasa-mockup-wrapper">
        <!-- TOPBAR (1.1 CIRO GİZLEME, 1.4.1 SİPARİŞ GÖRME, MUTFAK BİLGİSİ) -->
        <div class="kasa-mockup-topbar">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <div style="width:30px; height:30px; background:var(--color-primary-light); color:var(--color-primary); border-radius:8px; display:flex; align-items:center; justify-content:center;">
              <i data-lucide="receipt" style="width:18px; height:18px;"></i>
            </div>
            <div>
              <strong style="font-size:0.92rem; color:#fff; display:block;">BuyurAbi Kasa Sayfası</strong>
              <span style="font-size:0.72rem; color:var(--color-text-muted);">Canlı Masa & Adisyon Yönetimi</span>
            </div>
          </div>

          <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
            <!-- 1.1 CİRO GİZLEME BUTONU -->
            <div class="kasa-ciro-badge">
              <span style="color:var(--color-text-muted); font-size:0.75rem;">Ciro:</span>
              <strong id="sim-ciro-val" style="color:var(--color-accent-green); font-size:0.9rem;">₺18.450,00</strong>
              <button id="sim-btn-toggle-ciro" title="Madde 1.1: Ciro Gizleme / Gösterme" style="background:rgba(255,255,255,0.1); border:none; color:#fff; cursor:pointer; padding:3px 7px; border-radius:4px; font-size:0.72rem; display:inline-flex; align-items:center; gap:3px;">
                <i id="sim-ciro-btn-icon" data-lucide="eye-off" style="width:12px; height:12px;"></i>
                <span id="sim-ciro-btn-text">Ciro Gizle</span>
              </button>
            </div>

            <!-- 1.4.1 SİPARİŞ GÖRME AÇMA/KAPAMA -->
            <button id="sim-stream-toggle-btn" title="Madde 1.4.1: Sipariş Görme Açma/Kapama" style="border:1px solid; border-radius:var(--radius-sm); padding:0.35rem 0.65rem; font-size:0.72rem; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:4px; transition:var(--transition-fast);">
              <i data-lucide="bell" style="width:14px; height:14px;"></i> Sipariş Görme: AÇIK
            </button>
          </div>
        </div>

        <!-- MAIN KASA BODY (1.6 MASALAR VE ÜCRETLERİ + 1.7 YAN PANEL YENİLEN/İÇİLENLER) -->
        <div class="kasa-interactive-grid">
          <!-- LEFT: 1.6 MASALAR VE ÜCRETLERİ -->
          <div class="kasa-tables-col">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.8rem; font-weight:800; color:var(--color-text-muted); text-transform:uppercase; letter-spacing:0.5px;">
                <i data-lucide="layout-grid" style="width:14px; height:14px; vertical-align:middle; color:var(--color-primary);"></i> Salon Masaları (1.6)
              </span>
              <span style="font-size:0.72rem; color:var(--color-accent-green); background:rgba(0,230,118,0.1); padding:2px 6px; border-radius:4px;">
                ● 4 Dolu / 2 Boş
              </span>
            </div>

            <div class="kasa-tables-mini-grid">
              ${mockTables.map(t => `
                <div class="kasa-table-item ${t.id === selectedTableId ? 'active' : ''} ${t.status === 'bos' ? 'empty' : ''}" data-table-id="${t.id}" title="Tıkla: Masayı Seç & Hesabı Gör">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <strong style="font-size:0.85rem; color:#fff;">${t.name}</strong>
                    <span style="width:8px; height:8px; border-radius:50%; background:${t.status === 'dolu' ? 'var(--color-accent-green)' : 'var(--color-text-dim)'};"></span>
                  </div>
                  <div style="font-size:0.68rem; color:var(--color-text-muted); margin-bottom:4px;">${t.zone}</div>
                  <div style="font-size:0.88rem; font-weight:900; color:${t.total > 0 ? 'var(--color-primary)' : 'var(--color-text-dim)'}; font-family:monospace;">
                    ${t.total > 0 ? `₺${t.total}` : 'Boş'}
                  </div>
                  ${t.specialPrice ? `<div style="font-size:0.6rem; color:var(--color-accent-cyan); font-weight:700;">★ Özel Fiyat</div>` : ''}
                </div>
              `).join('')}
            </div>

            <!-- 1.4.1.2 & 1.5 CANLI BİLGİ ROZETİ -->
            <div style="margin-top:1rem; padding:0.65rem 0.85rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; display:flex; align-items:center; justify-content:space-between; font-size:0.74rem;">
              <span style="color:var(--color-text-muted);">
                <i data-lucide="chef-hat" style="width:14px; height:14px; vertical-align:middle; color:var(--color-primary);"></i> Mutfak (Sıcak): <strong>Aşçı Hazırlıyor</strong>
              </span>
              <span style="color:var(--color-accent-green); font-weight:700;">
                <i data-lucide="smartphone" style="width:14px; height:14px; vertical-align:middle;"></i> Garson QR ile Giriş Yaptı
              </span>
            </div>
          </div>

          <!-- RIGHT: 1.7 MASA SEÇİLDİKTEN SONRA YAN PANELDE AÇILAN ADİSYON DETAYI -->
          <div class="kasa-side-panel">
            <div class="kasa-side-header">
              <div>
                <span style="font-size:0.7rem; color:var(--color-text-muted); text-transform:uppercase; font-weight:800; display:block;">Masa Hesabı (1.7)</span>
                <strong id="sim-side-table-name" style="font-size:1.1rem; color:#fff;">Masa 4 (VIP)</strong>
              </div>
              <div id="sim-side-table-badge"></div>
            </div>

            <!-- YENİLEN VE İÇİLENLER (1.7.1) -->
            <div style="margin-top:0.6rem;">
              <span style="font-size:0.72rem; color:var(--color-text-muted); font-weight:700;">Yenilen & İçilenler (1.7.1):</span>
            </div>
            <div id="sim-side-items-list" class="kasa-orders-scroll"></div>

            <!-- TOPLAM VE ÖDEME ALMA (1.7.2 NAKİT AL / KARTLA AL & 1.12 FATURA/FİŞ) -->
            <div style="padding-top:0.6rem; border-top:1px solid rgba(255,255,255,0.08); display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.85rem; color:var(--color-text-muted);">Masa Toplamı:</span>
              <strong id="sim-side-table-total" style="font-family:monospace; font-size:1.35rem; color:var(--color-accent-green); font-weight:900;">₺520.00</strong>
            </div>

            <!-- ACTION BUTTONS: 1.7.2 NAKİT AL / KARTLA AL & 1.12 FİŞ/FATURA -->
            <div class="kasa-action-buttons">
              <button class="btn-kasa-pay-cash" id="sim-btn-pay-cash" title="Madde 1.7.2: Nakit Tahsilat">
                <i data-lucide="banknote" style="width:16px; height:16px;"></i> Nakit Al
              </button>

              <button class="btn-kasa-pay-card" id="sim-btn-pay-card" title="Madde 1.7.2: Kartla Tahsilat">
                <i data-lucide="credit-card" style="width:16px; height:16px;"></i> Kartla Al
              </button>

              <button class="btn-kasa-print-receipt" id="sim-btn-print-receipt" title="Madde 1.12: Fatura/Fiş Çıkarma">
                <i data-lucide="printer" style="width:15px; height:15px; color:var(--color-primary);"></i> Fiş / Fatura Çıkar (1.12)
              </button>
            </div>
          </div>
        </div>

        <!-- TICKER NOTIFICATION -->
        <div style="background:rgba(0,0,0,0.4); padding:0.65rem 1.2rem; border-top:1px solid rgba(255,255,255,0.06); display:flex; align-items:center; gap:0.6rem; font-size:0.78rem;">
          <span style="background:var(--color-primary); color:#fff; font-size:0.65rem; font-weight:900; padding:1px 6px; border-radius:4px;">CANLI AKIŞ</span>
          <span style="color:var(--color-text-muted); flex:1;">
            📱 <strong>Garson Ahmet (QR Girişli):</strong> Telefonundan Masa 4'e 1x Künefe ekledi ➔ 👨‍🍳 <strong>Aşçı Sıcak Sayfasında</strong> siparişi gördü ve hazırlamaya başladı.
          </span>
        </div>
      </div>
    </div>

    <!-- SİSTEM NASIL ÇALIŞIR? 4 ADIMLI DİJİTAL ADİSYON AKIŞI -->
    <div style="margin:4.5rem 0 2rem 0;">
      <div style="text-align:center; max-width:700px; margin:0 auto 2.5rem auto;">
        <span class="feat-item-badge">DİJİTAL ADİSYON & SERVİS AKIŞI</span>
        <h2 style="font-family:var(--font-heading); font-size:2.2rem; font-weight:900; color:#fff; margin-bottom:0.6rem;">
          BuyurAbi Dijital Adisyon Nasıl Çalışır?
        </h2>
        <p style="color:var(--color-text-muted); font-size:1rem;">
          Müşteri masadaki QR kod ile garson çağırır; garson telefonundan masanın hesabına siparişi işler; mutfak hazırlar, kasa tek tıkla tahsil eder.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:1.5rem;">
        <!-- ADIM 1 -->
        <div class="workflow-step-card">
          <div class="workflow-num-pill">ADIM 1</div>
          <div class="feat-icon-box" style="margin-top:0.4rem;">
            <i data-lucide="bell-ring" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Masada QR ile Garson Çağırma
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Masadaki QR kod müşteriye sipariş açmaz; müşteri telefon kamerasıyla QR kodu taratarak el sallamadan <strong>anında masaya garson çağırır</strong>.
          </p>
        </div>

        <!-- ADIM 2 -->
        <div class="workflow-step-card">
          <div class="workflow-num-pill">ADIM 2</div>
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green); margin-top:0.4rem;">
            <i data-lucide="smartphone" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Garson Cepten Sipariş Ekler (1.5)
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Garson işletme QR kodunu okutarak telefonundan giriş yapar. Masanın yanına gidip aldığı siparişleri <strong>kendi telefonundan doğrudan masanın hesabına ekler</strong>.
          </p>
        </div>

        <!-- ADIM 3 -->
        <div class="workflow-step-card">
          <div class="workflow-num-pill">ADIM 3</div>
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary); margin-top:0.4rem;">
            <i data-lucide="flame" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Aşçı Sıcak Sayfasında Hazırlar (1.4.1.2)
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            İsteğe bağlı olarak masa siparişleri mutfaktaki <strong>sıcak ekranına anında düşer</strong>. Aşçı siparişi görür ve anında hazırlamaya başlar.
          </p>
        </div>

        <!-- ADIM 4 -->
        <div class="workflow-step-card">
          <div class="workflow-num-pill">ADIM 4</div>
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan); margin-top:0.4rem;">
            <i data-lucide="calculator" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Kasa, Yan Panel & Fiş/Fatura (1.7, 1.12)
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Kasa ekranında masa seçilir, yan panelde yenilenler dökülür; <strong>Nakit Al veya Kartla Al</strong> ile hesap kapatılır ve tek tıkla <strong>Fiş/Fatura</strong> basılır.
          </p>
        </div>
      </div>
    </div>

    <!-- 12 MADDELİK DİJİTAL ADİSYON & KASA ÖZELLİKLERİ GRID -->
    <div style="margin:4rem 0;" id="features-section">
      <div style="text-align:center; max-width:720px; margin:0 auto 2.8rem auto;">
        <span class="feat-item-badge">KASA SAYFASI & ADİSYON FONKSİYONLARI</span>
        <h2 style="font-family:var(--font-heading); font-size:2.4rem; font-weight:900; color:#fff; margin-bottom:0.7rem;">
          Tüm İşletme İhtiyaçlarınız Tek Bir Programda
        </h2>
        <p style="color:var(--color-text-muted); font-size:1.05rem;">
          Kasa ekranından mutfağa, garson telefonundan ciro raporlarına kadar eksiksiz donanım.
        </p>
      </div>

      <div class="landing-grid-features" style="margin-top:1.5rem;">
        <!-- 1. KASA & MASA YÖNETİMİ (1.6 & 1.7) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.6 & 1.7</span>
          <div class="feat-icon-box">
            <i data-lucide="layout-grid" style="width:28px; height:28px;"></i>
          </div>
          <h3>Masalar & Yan Panel Hesabı</h3>
          <p>Tüm salon masaları ve anlık hesap tutarları kasa ekranında net olarak gözükür. Masa seçildiğinde yan tarafta açılan panelde <strong>masada yenilen ve içilen tüm siparişler</strong> ayrıntılı listelenir.</p>
        </div>

        <!-- 2. NAKİT AL / KARTLA AL (1.7.2) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.7.2</span>
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
            <i data-lucide="banknote" style="width:28px; height:28px;"></i>
          </div>
          <h3>Nakit Al & Kartla Al Tahsilat</h3>
          <p>Masa hesabı alınırken tek dokunuşla <strong>"Nakit Al"</strong> veya <strong>"Kartla Al"</strong> seçenekleriyle saniyeler içinde ödeme tahsil edilir, kasa adisyonu otomatik kapatılır.</p>
        </div>

        <!-- 3. CİRO GİZLEME (1.1) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.1</span>
          <div class="feat-icon-box" style="background:rgba(239,68,68,0.15); color:var(--color-danger);">
            <i data-lucide="eye-off" style="width:28px; height:28px;"></i>
          </div>
          <h3>Ciro Gizleme Modu</h3>
          <p>Kasa ekranında bulunan tek tıkla <strong>Ciro Gizleme</strong> butonu sayesinde işletme hasılatı ve günlük toplam tutarlar gizlenir. Kasa başında garsonlar veya müşteriler varken tam gizlilik sağlanır.</p>
        </div>

        <!-- 4. MENÜ FİYAT AYARLAMA & ÖZEL MASALAR (1.2 & 1.2.1) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.2 & 1.2.1</span>
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary);">
            <i data-lucide="sliders" style="width:28px; height:28px;"></i>
          </div>
          <h3>Menü & Özel Masa Fiyatlandırması</h3>
          <p>Tüm menü kalemlerinin fiyatlarını anında güncelleyin. Ayrıca <strong>VIP masalar, teras veya özel localar için farklı fiyat ayarlaması</strong> yapabilir, masaya özel tarife belirleyebilirsiniz.</p>
        </div>

        <!-- 5. MASA EKLEMEK İÇİN PLAN SATIN ALMA (1.3) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.3</span>
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
            <i data-lucide="plus-circle" style="width:28px; height:28px;"></i>
          </div>
          <h3>Masa Eklemek İçin Plan Satın Alma</h3>
          <p>İşletmenizin masa sayısına göre dilediğiniz kapasite planını seçin. Restoranınız büyüdükçe plan yükselterek <strong>sisteme anında yeni masalar ekleyebilirsiniz</strong>.</p>
        </div>

        <!-- 6. SİPARİŞ GÖRME & MUTFAK SICAK EKRANI (1.4, 1.4.1, 1.4.1.1, 1.4.1.2) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.4 & 1.4.1</span>
          <div class="feat-icon-box" style="background:rgba(255,193,7,0.15); color:#FFC107;">
            <i data-lucide="chef-hat" style="width:28px; height:28px;"></i>
          </div>
          <h3>Sipariş Görme & Mutfak Sıcak Ekranı</h3>
          <p>Sipariş görme <strong>açma/kapama tuşu</strong> bulunur. İsteğe bağlı olarak sadece masaların siparişleri görülüp silinebilir. Alınan siparişler mutfaktaki <strong>sıcak sayfasında görünür ve aşçı hazırlamaya başlar</strong>.</p>
        </div>

        <!-- 7. GARSON EKLEME & QR İLE GİRİŞ (1.5) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.5</span>
          <div class="feat-icon-box" style="background:rgba(168,85,247,0.15); color:var(--color-accent-purple);">
            <i data-lucide="user-check" style="width:28px; height:28px;"></i>
          </div>
          <h3>Garson Ekleme & QR ile Giriş</h3>
          <p>Sisteme dilediğiniz kadar garson tanımlanabilir. Garsonlar işletme QR kodunu telefonlarıyla okutarak <strong>anında sisteme giriş yapar</strong> ve cepten masaların hesabına siparişleri işler.</p>
        </div>

        <!-- 8. GÜNLÜK KASA & HAFTALIK CİRO RAPORU (1.8 & 1.9) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.8 & 1.9</span>
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
            <i data-lucide="trending-up" style="width:28px; height:28px;"></i>
          </div>
          <h3>Günlük Kasa & Haftalık Ciro Raporu</h3>
          <p>Günün sonunda <strong>Günlük Kasa Raporu</strong> ile net nakit ve kartlı kasa kapanışınızı alın. <strong>Haftalık Ciro Raporu</strong> grafikleri ile işletmenizin gelir eğrisini analiz edin.</p>
        </div>

        <!-- 9. GÜNLÜK EN ÇOK SATILANLAR & ALINAN ÜCRETLER (1.10 & 1.11) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.10 & 1.11</span>
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
            <i data-lucide="bar-chart-3" style="width:28px; height:28px;"></i>
          </div>
          <h3>Günlük En Çok Satanlar & Tahsilat Dökümü</h3>
          <p>Günün en popüler yemek ve içecek adetlerini <strong>Günlük En Çok Satılanlar</strong> listesinde görün. <strong>Alınan Ücretler</strong> menüsünden tüm nakit ve kartlı tahsilatların dökümünü inceleyin.</p>
        </div>

        <!-- 10. FATURA / FİŞ ÇIKARMA (1.12) -->
        <div class="landing-feat-card">
          <span class="feat-item-badge">MADDE 1.12</span>
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary);">
            <i data-lucide="receipt-text" style="width:28px; height:28px;"></i>
          </div>
          <h3>Fatura / Fiş Çıkarma</h3>
          <p>Masa hesabı tamamlandığında termal adisyon fişi veya resmi e-fatura/fiş çıktısını <strong>tek tıkla yazıcıdan çıkarın</strong> ve müşterinize teslim edin.</p>
        </div>
      </div>
    </div>

    <!-- MASA EKLEME İÇİN KULLANIM VE KAPASİTE PLANLARI (MADDE 1.3) -->
    <div style="margin:5rem 0 3rem 0;">
      <div style="text-align:center; max-width:650px; margin:0 auto 2.5rem auto;">
        <span class="feat-item-badge">MADDE 1.3 - MASA KAPASİTE PLANLARI</span>
        <h2 style="font-family:var(--font-heading); font-size:2.2rem; font-weight:900; color:#fff; margin-bottom:0.6rem;">
          İşletmenizin Masa Sayısına Göre Plan Satın Alın
        </h2>
        <p style="color:var(--color-text-muted); font-size:0.95rem;">
          Masa eklemek ve dijital adisyon sisteminizi kullanmak için salonunuza uygun paketi seçin.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem;">
        <!-- PLAN 1: BAŞLANGIÇ -->
        <div style="background:var(--color-bg-card); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-lg); padding:2rem; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
              <span style="font-size:1.4rem;">🥉</span>
              <span style="font-size:0.75rem; background:rgba(255,255,255,0.06); color:var(--color-text-muted); padding:3px 8px; border-radius:6px; font-weight:700;">10 MASA KAPASİTESİ</span>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">Başlangıç Paketi</h3>
            <div style="font-size:1.8rem; font-weight:900; color:var(--color-primary); margin:0.8rem 0;">
              ₺499 <span style="font-size:0.85rem; color:var(--color-text-muted); font-weight:500;">/ay</span>
            </div>
            <p style="font-size:0.84rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.2rem;">
              Küçük kafeler, butik lokantalar ve tek salonlu işletmeler için ideal adisyon çözümü.
            </p>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem; color:var(--color-text-main);">
              <li>✓ <strong>10 Masaya Kadar</strong> Masa Ekleme</li>
              <li>✓ Masada QR ile Garson Çağırma</li>
              <li>✓ Garson QR ile Telefon Girişi & Sipariş Ekleme</li>
              <li>✓ Masalar ve Ücretleri Kasa Ekranı</li>
              <li>✓ Yan Panelde Açılan Adisyon & Nakit/Kart Tahsilat</li>
              <li>✓ Günlük Kasa Raporu (1.8)</li>
            </ul>
          </div>
          <button class="btn-primary-hero btn-plan-select-cta" data-plan="Başlangıç Paketi (₺499/ay)" data-price="499" style="width:100%; justify-content:center; margin-top:1.8rem;">
            Başlangıç Planını Seç
          </button>
        </div>

        <!-- PLAN 2: PROFESYONEL (POPÜLER) -->
        <div style="background:var(--color-bg-card); border:2px solid var(--color-primary); border-radius:var(--radius-lg); padding:2rem; position:relative; display:flex; flex-direction:column; justify-content:space-between; box-shadow:var(--shadow-glow);">
          <div style="position:absolute; top:-12px; right:20px; background:var(--color-primary); color:#fff; font-size:0.7rem; font-weight:900; padding:3px 12px; border-radius:12px; letter-spacing:0.5px;">
            EN ÇOK TERCİH EDİLEN
          </div>
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
              <span style="font-size:1.4rem;">🥈</span>
              <span style="font-size:0.75rem; background:rgba(0,230,118,0.15); color:var(--color-accent-green); padding:3px 8px; border-radius:6px; font-weight:800;">25 MASA KAPASİTESİ</span>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">Profesyonel Paket</h3>
            <div style="font-size:1.8rem; font-weight:900; color:var(--color-accent-green); margin:0.8rem 0;">
              ₺899 <span style="font-size:0.85rem; color:var(--color-text-muted); font-weight:500;">/ay</span>
            </div>
            <p style="font-size:0.84rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.2rem;">
              Orta ölçekli restoranlar, kebapçılar ve yoğun çalışan mutfaklar için tam teşekküllü otomasyon.
            </p>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem; color:var(--color-text-main);">
              <li>✓ <strong>25 Masaya Kadar</strong> Masa Ekleme (1.3)</li>
              <li>✓ <strong>Ciro Gizleme Butonu</strong> (1.1)</li>
              <li>✓ <strong>Mutfak Sıcak Sayfası</strong> (Aşçı Hazırlık) (1.4.1.2)</li>
              <li>✓ Sipariş Görme Açma/Kapama & Sipariş Silme (1.4.1)</li>
              <li>✓ Menü Fiyat Ayarlama (1.2)</li>
              <li>✓ Sınırsız Garson Tanımlama & QR Giriş (1.5)</li>
              <li>✓ Fiş / Fatura Çıkarma (1.12)</li>
              <li>✓ Günlük Kasa & Haftalık Ciro Raporu (1.8, 1.9)</li>
            </ul>
          </div>
          <button class="btn-primary-hero btn-plan-select-cta" data-plan="Profesyonel Paket (₺899/ay)" data-price="899" style="width:100%; justify-content:center; margin-top:1.8rem;">
            Profesyonel Planı Seç
          </button>
        </div>

        <!-- PLAN 3: KURUMSAL -->
        <div style="background:var(--color-bg-card); border:1px solid rgba(0,229,255,0.3); border-radius:var(--radius-lg); padding:2rem; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
              <span style="font-size:1.4rem;">🥇</span>
              <span style="font-size:0.75rem; background:rgba(0,229,255,0.15); color:var(--color-accent-cyan); padding:3px 8px; border-radius:6px; font-weight:800;">SINIRSIZ MASA KAPASİTESİ</span>
            </div>
            <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">Kurumsal Paket</h3>
            <div style="font-size:1.8rem; font-weight:900; color:var(--color-accent-cyan); margin:0.8rem 0;">
              ₺1.499 <span style="font-size:0.85rem; color:var(--color-text-muted); font-weight:500;">/ay</span>
            </div>
            <p style="font-size:0.84rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.2rem;">
              Büyük restoranlar, çok salonlu mekanlar ve zincir işletmeler için sınırsız güç.
            </p>
            <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem; color:var(--color-text-main);">
              <li>✓ <strong>Sınırsız Masa Ekleme</strong> (1.3)</li>
              <li>✓ <strong>Özel Masalara Fiyat Ayarlaması</strong> (VIP/Loca) (1.2.1)</li>
              <li>✓ Günlük En Çok Satılanlar Analizi (1.10)</li>
              <li>✓ Alınan Ücretler & Tahsilat Dökümü (1.11)</li>
              <li>✓ Çoklu Kasa & Şube Entegrasyonu</li>
              <li>✓ Termal Yazıcı ve E-Fatura Entegrasyonu (1.12)</li>
              <li>✓ 7/24 Öncelikli Telefon & Canlı Destek</li>
            </ul>
          </div>
          <button class="btn-primary-hero btn-plan-select-cta" data-plan="Kurumsal Paket (₺1.499/ay)" data-price="1499" style="width:100%; justify-content:center; margin-top:1.8rem; background:linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%);">
            Kurumsal Planı Seç
          </button>
        </div>
      </div>
    </div>

    <!-- REGISTER PROMO BANNER -->
    <div style="background:linear-gradient(135deg, rgba(255,107,0,0.2) 0%, rgba(14,19,31,0.95) 100%); border:2px solid var(--color-primary); border-radius:var(--radius-lg); padding:3.2rem 2rem; text-align:center; box-shadow:var(--shadow-glow); margin:3.5rem 0;">
      <h2 style="font-family:var(--font-heading); font-size:2.4rem; font-weight:900; color:#fff; margin-bottom:0.8rem;">
        Restoranınızı Dijital Adisyonla Güçlendirin!
      </h2>
      <p style="color:var(--color-text-muted); font-size:1.1rem; max-width:640px; margin:0 auto 2rem auto;">
        Masada QR ile garson çağırma, cepten sipariş girişi, canlı mutfak sıcak sayfası, ciro gizleme ve kasa yönetimine saniyeler içinde geçiş yapın.
      </p>
      <button class="btn-primary-hero" id="landing-btn-bottom-register" style="margin:0 auto;">
        <i data-lucide="store"></i> İşletmeni Hemen Kaydet & Başla
      </button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  // Bind Simulator Controls:
  // 1. Ciro Gizleme Toggle (Madde 1.1)
  container.querySelector('#sim-btn-toggle-ciro')?.addEventListener('click', () => {
    ciroHidden = !ciroHidden;
    updateKasaSimulatorView();
    showToast(ciroHidden ? '👁️ Ciro Tutarları Gizlendi (Madde 1.1)' : '👁️‍🗨️ Ciro Tutarları Gösteriliyor', 'info');
  });

  // 2. Sipariş Görme Açma/Kapama (Madde 1.4.1)
  container.querySelector('#sim-stream-toggle-btn')?.addEventListener('click', () => {
    orderStreamActive = !orderStreamActive;
    updateKasaSimulatorView();
    showToast(orderStreamActive ? '🟢 Sipariş Görme Açıldı (Madde 1.4.1)' : '🔴 Sipariş Görme Kapatıldı (Madde 1.4.1)', 'info');
  });

  // 3. Table Selection (Madde 1.6 & 1.7)
  container.querySelectorAll('.kasa-table-item').forEach(el => {
    el.addEventListener('click', () => {
      selectedTableId = Number(el.dataset.tableId);
      updateKasaSimulatorView();
    });
  });

  // 4. Nakit Al (Madde 1.7.2)
  container.querySelector('#sim-btn-pay-cash')?.addEventListener('click', () => {
    const table = getSelectedTable();
    if (table.total === 0) {
      showToast('⚠️ Bu masada açık hesap bulunmuyor.', 'info');
      return;
    }
    showToast(`💵 ${table.name} için ₺${table.total.toFixed(2)} NAKİT tahsil edildi ve hesap kapatıldı! (Madde 1.7.2)`, 'success');
  });

  // 5. Kartla Al (Madde 1.7.2)
  container.querySelector('#sim-btn-pay-card')?.addEventListener('click', () => {
    const table = getSelectedTable();
    if (table.total === 0) {
      showToast('⚠️ Bu masada açık hesap bulunmuyor.', 'info');
      return;
    }
    showToast(`💳 ${table.name} için ₺${table.total.toFixed(2)} KREDİ KARTI ile tahsil edildi ve hesap kapatıldı! (Madde 1.7.2)`, 'success');
  });

  // 6. Fiş / Fatura Çıkar (Madde 1.12)
  container.querySelector('#sim-btn-print-receipt')?.addEventListener('click', () => {
    const table = getSelectedTable();
    showToast(`🧾 ${table.name} Adisyon Fişi ve Faturası Yazıcıya Gönderildi! (Madde 1.12)`, 'success');
  });

  // Navigation Links
  document.getElementById('landing-btn-register-now')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('btn-banner-view-id')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('landing-btn-bottom-register')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('landing-btn-learn-more')?.addEventListener('click', () => {
    const feat = document.getElementById('features-section');
    if (feat) feat.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelectorAll('.btn-plan-select-cta').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setView('register');
    });
  });

  updateKasaSimulatorView();
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
