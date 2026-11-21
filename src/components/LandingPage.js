import { store } from '../state/store.js';

export function renderLandingPage(container) {
  const lastReg = store.getLastRegisteredBusiness();
  const isApproved = lastReg && lastReg.status === 'onaylandi';
  const isRejected = lastReg && lastReg.status === 'reddedildi';
  const isPending = lastReg && !isApproved && !isRejected;

  container.innerHTML = `
    <!-- REGISTERED USER ID BANNER (IF REGISTERED) -->
    ${lastReg && lastReg.id ? `
      ${isRejected ? `
        <div style="background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.5); border-radius:var(--radius-md); padding:1rem 1.4rem; margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; box-shadow:0 4px 20px rgba(239,68,68,0.2);">
          <div style="display:flex; align-items:center; gap:0.9rem;">
            <div style="width:44px; height:44px; border-radius:50%; background:rgba(239,68,68,0.22); color:var(--color-danger); display:flex; align-items:center; justify-content:center; flex-shrink:0; border:1px solid rgba(239,68,68,0.4);">
              <i data-lucide="x-circle" style="width:24px; height:24px;"></i>
            </div>
            <div>
              <div style="font-size:0.78rem; color:var(--color-danger); font-weight:800; letter-spacing:0.5px;">❌ BAŞVURU DURUMU: YÖNETİCİ TARAFINDAN REDDEDİLDİ</div>
              <strong style="font-size:1.1rem; color:#fff;">${lastReg.businessName}</strong>
              <div style="font-size:0.86rem; color:rgba(255,255,255,0.85); margin-top:2px;">
                İşletme başvurunuz yönetici tarafından reddedilmiştir. Lütfen bilgilerinizi kontrol ederek <strong>tekrar işletme kaydı yapınız</strong>.
              </div>
            </div>
          </div>
          <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
            <button id="btn-banner-reapply" class="pill-btn" style="background:linear-gradient(135deg, #EF4444 0%, #DC2626 100%); border:none; color:#fff; font-weight:800; padding:0.65rem 1.3rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm); box-shadow:0 0 15px rgba(239,68,68,0.4);">
              <i data-lucide="refresh-cw" style="width:16px; height:16px;"></i> Tekrar İşletme Kaydı Yap
            </button>
            <button id="btn-banner-view-id" class="pill-btn" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:var(--color-text-muted); font-weight:700; padding:0.65rem 1rem; cursor:pointer; font-size:0.82rem; border-radius:var(--radius-sm);">
              Başvurularım
            </button>
          </div>
        </div>
      ` : `
        <div style="background:${isApproved ? 'rgba(0,230,118,0.1)' : 'rgba(245,158,11,0.1)'}; border:1px solid ${isApproved ? 'rgba(0,230,118,0.35)' : 'rgba(245,158,11,0.35)'}; border-radius:var(--radius-md); padding:0.9rem 1.4rem; margin-bottom:2rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; box-shadow:0 4px 20px rgba(0,0,0,0.3);">
          <div style="display:flex; align-items:center; gap:0.85rem;">
            <div style="width:40px; height:40px; border-radius:50%; background:${isApproved ? 'rgba(0,230,118,0.2)' : 'rgba(245,158,11,0.2)'}; color:${isApproved ? 'var(--color-accent-green)' : '#F59E0B'}; display:flex; align-items:center; justify-content:center;">
              <i data-lucide="${isApproved ? 'badge-check' : 'clock'}" style="width:22px; height:22px;"></i>
            </div>
            <div>
              <div style="font-size:0.8rem; color:var(--color-text-muted);">${isApproved ? 'Sistemde Kayıtlı Adisyon İşletmeniz:' : 'İncelenmekte Olan İşletme Başvurunuz:'}</div>
              <strong style="font-size:1.05rem; color:#fff;">${lastReg.businessName}</strong>
              ${isApproved ? `
                <span style="font-family:monospace; background:rgba(0,230,118,0.18); color:var(--color-accent-green); font-weight:800; padding:2px 8px; border-radius:6px; margin-left:8px; font-size:0.85rem;">📧 Gmail ile Giriş Aktif</span>
              ` : `
                <span style="font-family:monospace; background:rgba(245,158,11,0.2); color:#F59E0B; font-weight:800; padding:2px 8px; border-radius:6px; margin-left:8px; font-size:0.85rem;">⏳ YÖNETİCİ ONAYI BEKLENİYOR</span>
              `}
            </div>
          </div>
          <button id="btn-banner-view-id" class="pill-btn" style="background:${isApproved ? 'var(--color-primary-gradient)' : 'rgba(245,158,11,0.2)'}; border:${isApproved ? 'none' : '1px solid rgba(245,158,11,0.5)'}; color:${isApproved ? '#fff' : '#F59E0B'}; font-weight:800; padding:0.6rem 1.2rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm); box-shadow:${isApproved ? 'var(--shadow-glow)' : 'none'};">
            <i data-lucide="${isApproved ? 'id-card' : 'clipboard-list'}" style="width:16px; height:16px;"></i> ${isApproved ? 'Giriş Kartımı Aç' : 'Başvuru Durumunu Gör'}
          </button>
        </div>
      `}
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
          Masada <strong>QR kod ile tek tıkla garson çağırma</strong>, garsonların kendi telefonundan <strong>masanın hesabına anında sipariş eklemesi</strong>, mutfakta canlı sıcak ekranı, tek tıkla ciro gizleme ve hızlı nakit/kart tahsilat hepsi tek bir sistemde!
        </p>

        <div class="hero-btn-group">
          <button class="btn-primary-hero" id="landing-btn-register-now" style="${isRejected ? 'background:linear-gradient(135deg, #EF4444 0%, #DC2626 100%); box-shadow:0 0 20px rgba(239,68,68,0.35);' : ''}">
            <i data-lucide="${isApproved ? 'id-card' : (isRejected ? 'refresh-cw' : (lastReg ? 'clipboard-list' : 'store'))}"></i>
            <span>${isApproved ? 'İşletme / ID Kartımı Aç' : (isRejected ? 'Tekrar İşletme Kaydı Yap' : (lastReg ? 'Başvuru Durumunu Takip Et' : 'Hemen Kayıt Ol & Satın Al'))}</span>
          </button>

          <button class="btn-secondary-hero" id="landing-btn-learn-more">
            <i data-lucide="arrow-down"></i>
            <span>Özellikleri & Paketleri İncele</span>
          </button>
        </div>

        <div class="hero-stats-row">
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

      <!-- RIGHT SIDE: NE SATIN ALACAĞINIZI TANITAN ŞIK PAKET KARTI -->
      <div class="package-showcase-card">
        <div class="package-showcase-header">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:42px; height:42px; background:var(--color-primary-light); color:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;">
              <i data-lucide="receipt" style="width:24px; height:24px;"></i>
            </div>
            <div>
              <strong style="font-size:1.05rem; color:#fff; display:block;">BuyurAbi Dijital Adisyon</strong>
              <span style="font-size:0.78rem; color:var(--color-text-muted);">Restoranınız İçin Her Şey Dahil Paket</span>
            </div>
          </div>
          <span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:12px;">
            ● EKSİKSİZ SİSTEM
          </span>
        </div>

        <!-- PAKET İÇERİĞİ TANITIM LİSTESİ -->
        <div class="package-features-list">
          <div class="package-feature-item">
            <div class="package-item-icon">
              <i data-lucide="bell" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Masada QR ile Garson Çağırma</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Müşteri masadaki QR kodu kamerasıyla okutarak tek tıkla garson çağırır.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
              <i data-lucide="smartphone" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Garson Telefonundan Masaya Sipariş Ekleme</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Garsonlar QR ile cepten giriş yapar, siparişleri doğrudan masanın hesabına ekler.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
              <i data-lucide="layout-grid" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Masalar & Yan Panelde Açılan Adisyon</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Masa seçildiğinde yan tarafta masanın ücreti ve yenilen/içilen tüm detaylar açılır.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
              <i data-lucide="banknote" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Nakit Al & Kartla Al Tahsilat</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Masa hesabı tek tuşla nakit veya kredi kartı seçeneğiyle saniyeler içinde kapatılır.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(239,68,68,0.15); color:var(--color-danger);">
              <i data-lucide="eye-off" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Ciro Gizleme Modu</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Kasa başında personel veya müşteri varken tek tıkla ciroyu ve hasılatı gizleyin.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(255,193,7,0.15); color:#FFC107;">
              <i data-lucide="chef-hat" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Mutfak Sıcak Ekranı & Sipariş Yönetimi</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Siparişler mutfaktaki sıcak sayfasına anında düşer, aşçı hazırlamaya başlar.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(168,85,247,0.15); color:var(--color-accent-purple);">
              <i data-lucide="sliders" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Menü & Özel Masa Fiyatlandırması</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Fiyatları anlık değiştirin; VIP masalar veya teras için özel tarife uygulayın.</span>
            </div>
          </div>

          <div class="package-feature-item">
            <div class="package-item-icon" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
              <i data-lucide="bar-chart-3" style="width:16px; height:16px;"></i>
            </div>
            <div>
              <strong style="font-size:0.88rem; color:#fff; display:block;">Günlük Kasa, Haftalık Ciro & Fiş/Fatura</strong>
              <span style="font-size:0.76rem; color:var(--color-text-muted);">Detaylı hasılat raporları, günün en çok satanları ve tek tıkla fiş/fatura dökümü.</span>
            </div>
          </div>
        </div>

        <!-- FOOTER & REGISTRATION CTA -->
        <div style="background:rgba(0,0,0,0.3); padding:0.9rem 1.1rem; border-radius:var(--radius-sm); border:1px solid rgba(255,255,255,0.06); margin-bottom:1.2rem;">
          <div style="font-size:0.78rem; color:var(--color-accent-green); font-weight:700; margin-bottom:2px;">
            ✓ Bulut Tabanlı & Kurulum Gerektirmez
          </div>
          <div style="font-size:0.74rem; color:var(--color-text-muted);">
            Tablet, telefon ve bilgisayardan anında çalışır. Gmail ile kaydolun, onaydan sonra hemen kullanmaya başlayın.
          </div>
        </div>

        <button class="btn-primary-hero" id="btn-package-hero-register" style="width:100%; justify-content:center;">
          <i data-lucide="store"></i> İşletmeni Hemen Kaydet & Başla
        </button>
      </div>
    </div>

    <!-- SİSTEM NASIL ÇALIŞIR? DİJİTAL ADİSYON AKIŞI -->
    <div style="margin:4.5rem 0 2rem 0;">
      <div style="text-align:center; max-width:700px; margin:0 auto 2.5rem auto;">
        <h2 style="font-family:var(--font-heading); font-size:2.2rem; font-weight:900; color:#fff; margin-bottom:0.6rem;">
          BuyurAbi Dijital Adisyon Nasıl Çalışır?
        </h2>
        <p style="color:var(--color-text-muted); font-size:1rem;">
          Müşteri masadaki QR kod ile garson çağırır; garson telefonundan masanın hesabına siparişi işler; mutfak hazırlar, kasa tek tıkla tahsil eder.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 260px), 1fr)); gap:1.5rem;">
        <div class="workflow-step-card">
          <div class="feat-icon-box">
            <i data-lucide="bell-ring" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Masada QR ile Garson Çağırma
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Masadaki QR kod müşteriye sipariş açmaz; müşteri telefon kamerasıyla QR kodu taratarak el sallamadan <strong>anında masaya garson çağırır</strong>.
          </p>
        </div>

        <div class="workflow-step-card">
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
            <i data-lucide="smartphone" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Garson Cepten Sipariş Ekler
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Garson işletme QR kodunu okutarak telefonundan giriş yapar. Masanın yanına gidip aldığı siparişleri <strong>kendi telefonundan doğrudan masanın hesabına ekler</strong>.
          </p>
        </div>

        <div class="workflow-step-card">
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary);">
            <i data-lucide="flame" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Aşçı Sıcak Sayfasında Hazırlar
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            İsteğe bağlı olarak masa siparişleri mutfaktaki <strong>sıcak ekranına anında düşer</strong>. Aşçı siparişi görür ve anında hazırlamaya başlar.
          </p>
        </div>

        <div class="workflow-step-card">
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
            <i data-lucide="calculator" style="width:28px; height:28px;"></i>
          </div>
          <h3 style="font-family:var(--font-heading); font-size:1.2rem; font-weight:800; margin-bottom:0.5rem; color:#fff;">
            Kasa, Yan Panel & Fiş/Fatura
          </h3>
          <p style="color:var(--color-text-muted); font-size:0.88rem; line-height:1.6;">
            Kasa ekranında masa seçilir, yan panelde yenilenler dökülür; <strong>Nakit Al veya Kartla Al</strong> ile hesap kapatılır ve tek tıkla <strong>Fiş/Fatura</strong> basılır.
          </p>
        </div>
      </div>
    </div>

    <!-- DİJİTAL ADİSYON & KASA ÖZELLİKLERİ GRID -->
    <div style="margin:4rem 0;" id="features-section">
      <div style="text-align:center; max-width:720px; margin:0 auto 2.8rem auto;">
        <h2 style="font-family:var(--font-heading); font-size:2.4rem; font-weight:900; color:#fff; margin-bottom:0.7rem;">
          Tüm İşletme İhtiyaçlarınız Tek Bir Programda
        </h2>
        <p style="color:var(--color-text-muted); font-size:1.05rem;">
          Kasa ekranından mutfağa, garson telefonundan ciro raporlarına kadar eksiksiz donanım.
        </p>
      </div>

      <div class="landing-grid-features" style="margin-top:1.5rem;">
        <div class="landing-feat-card">
          <div class="feat-icon-box">
            <i data-lucide="layout-grid" style="width:28px; height:28px;"></i>
          </div>
          <h3>Masalar & Yan Panel Hesabı</h3>
          <p>Tüm salon masaları ve anlık hesap tutarları kasa ekranında net olarak gözükür. Masa seçildiğinde yan tarafta açılan panelde <strong>masada yenilen ve içilen tüm siparişler</strong> ayrıntılı listelenir.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
            <i data-lucide="banknote" style="width:28px; height:28px;"></i>
          </div>
          <h3>Nakit Al & Kartla Al Tahsilat</h3>
          <p>Masa hesabı alınırken tek dokunuşla <strong>"Nakit Al"</strong> veya <strong>"Kartla Al"</strong> seçenekleriyle saniyeler içinde ödeme tahsil edilir, kasa adisyonu otomatik kapatılır.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(239,68,68,0.15); color:var(--color-danger);">
            <i data-lucide="eye-off" style="width:28px; height:28px;"></i>
          </div>
          <h3>Ciro Gizleme Modu</h3>
          <p>Kasa ekranında bulunan tek tıkla <strong>Ciro Gizleme</strong> butonu sayesinde işletme hasılatı ve günlük toplam tutarlar gizlenir. Kasa başında garsonlar veya müşteriler varken tam gizlilik sağlanır.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary);">
            <i data-lucide="sliders" style="width:28px; height:28px;"></i>
          </div>
          <h3>Menü & Özel Masa Fiyatlandırması</h3>
          <p>Tüm menü kalemlerinin fiyatlarını anında güncelleyin. Ayrıca <strong>VIP masalar, teras veya özel localar için farklı fiyat ayarlaması</strong> yapabilir, masaya özel tarife belirleyebilirsiniz.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
            <i data-lucide="plus-circle" style="width:28px; height:28px;"></i>
          </div>
          <h3>Masa Eklemek İçin Plan Satın Alma</h3>
          <p>İşletmenizin masa sayısına göre dilediğiniz kapasite planını seçin. Restoranınız büyüdükçe plan satın alarak <strong>sisteme anında yeni masalar ekleyebilirsiniz</strong>.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(255,193,7,0.15); color:#FFC107;">
            <i data-lucide="chef-hat" style="width:28px; height:28px;"></i>
          </div>
          <h3>Sipariş Görme & Mutfak Sıcak Ekranı</h3>
          <p>Sipariş görme <strong>açma/kapama tuşu</strong> bulunur. İsteğe bağlı olarak sadece masaların siparişleri görülüp silinebilir. Alınan siparişler mutfaktaki <strong>sıcak sayfasında görünür ve aşçı hazırlamaya başlar</strong>.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(168,85,247,0.15); color:var(--color-accent-purple);">
            <i data-lucide="user-check" style="width:28px; height:28px;"></i>
          </div>
          <h3>Garson Ekleme & QR ile Giriş</h3>
          <p>Sisteme dilediğiniz kadar garson tanımlanabilir. Garsonlar işletme QR kodunu telefonlarıyla okutarak <strong>anında sisteme giriş yapar</strong> ve cepten masaların hesabına siparişleri işler.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
            <i data-lucide="trending-up" style="width:28px; height:28px;"></i>
          </div>
          <h3>Günlük Kasa & Haftalık Ciro Raporu</h3>
          <p>Günün sonunda <strong>Günlük Kasa Raporu</strong> ile net nakit ve kartlı kasa kapanışınızı alın. <strong>Haftalık Ciro Raporu</strong> grafikleri ile işletmenizin gelir eğrisini analiz edin.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
            <i data-lucide="bar-chart-3" style="width:28px; height:28px;"></i>
          </div>
          <h3>Günlük En Çok Satanlar & Tahsilat Dökümü</h3>
          <p>Günün en popüler yemek ve içecek adetlerini <strong>Günlük En Çok Satılanlar</strong> listesinde görün. <strong>Alınan Ücretler</strong> menüsünden tüm nakit ve kartlı tahsilatların dökümünü inceleyin.</p>
        </div>

        <div class="landing-feat-card">
          <div class="feat-icon-box" style="background:rgba(255,107,0,0.15); color:var(--color-primary);">
            <i data-lucide="receipt-text" style="width:28px; height:28px;"></i>
          </div>
          <h3>Fatura / Fiş Çıkarma</h3>
          <p>Masa hesabı tamamlandığında termal adisyon fişi veya resmi fatura çıktısını <strong>tek tıkla yazıcıdan çıkarın</strong> ve müşterinize teslim edin.</p>
        </div>
      </div>
    </div>

    <!-- MASA EKLEME İÇİN KULLANIM VE KAPASİTE PLANLARI (DİNAMİK) -->
    <div style="margin:5rem 0 3rem 0;">
      <div style="text-align:center; max-width:650px; margin:0 auto 2.5rem auto;">
        <h2 style="font-family:var(--font-heading); font-size:2.2rem; font-weight:900; color:#fff; margin-bottom:0.6rem;">
          İşletmenizin Masa Sayısına Göre Plan Satın Alın
        </h2>
        <p style="color:var(--color-text-muted); font-size:0.95rem;">
          Masa eklemek ve dijital adisyon sisteminizi kullanmak için salonunuza uygun paketi seçin.
        </p>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(min(100%, 280px), 1fr)); gap:1.5rem;">
        ${store.getPricingPlans().map((plan, idx) => {
          const medal = idx === 0 ? '🥉' : (idx === 1 ? '🥈' : '🥇');
          const isPop = !!plan.popular;
          const priceColor = idx === 0 ? 'var(--color-primary)' : (idx === 1 ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)');
          const borderColor = isPop ? 'var(--color-primary)' : (idx === 2 ? 'rgba(0,229,255,0.3)' : 'rgba(255,255,255,0.08)');
          const borderStyle = isPop ? '2px solid var(--color-primary)' : `1px solid ${borderColor}`;
          const shadowStyle = isPop ? 'box-shadow:var(--shadow-glow);' : '';
          const btnBg = idx === 2 ? 'background:linear-gradient(135deg, #00E5FF 0%, #3B82F6 100%);' : '';
          const planFullName = `${plan.name} (${plan.badge || ''} - ₺${plan.price}${plan.period || '/ay'})`;

          return `
            <div style="background:var(--color-bg-card); border:${borderStyle}; border-radius:var(--radius-lg); padding:2rem; position:relative; display:flex; flex-direction:column; justify-content:space-between; ${shadowStyle}">
              ${isPop ? `
                <div style="position:absolute; top:-12px; right:20px; background:var(--color-primary); color:#fff; font-size:0.7rem; font-weight:900; padding:3px 12px; border-radius:12px; letter-spacing:0.5px;">
                  EN ÇOK TERCİH EDİLEN
                </div>
              ` : ''}
              <div>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                  <span style="font-size:1.4rem;">${medal}</span>
                  <span style="font-size:0.75rem; background:${idx === 1 ? 'rgba(0,230,118,0.15)' : (idx === 2 ? 'rgba(0,229,255,0.15)' : 'rgba(255,255,255,0.06)')}; color:${idx === 1 ? 'var(--color-accent-green)' : (idx === 2 ? 'var(--color-accent-cyan)' : 'var(--color-text-muted)')}; padding:3px 8px; border-radius:6px; font-weight:800;">
                    ${plan.badge || 'KAPASİTE PLANI'}
                  </span>
                </div>
                <h3 style="font-family:var(--font-heading); font-size:1.3rem; font-weight:800; color:#fff;">${plan.name}</h3>
                <div style="margin:0.8rem 0;">
                  ${plan.hasDiscount && plan.originalPrice > plan.price ? `
                    <div style="display:flex; align-items:center; gap:0.55rem; margin-bottom:4px;">
                      <span style="font-size:1.1rem; color:var(--color-text-dim); text-decoration:line-through; font-weight:700;">
                        ₺${Number(plan.originalPrice).toLocaleString('tr-TR')}
                      </span>
                      <span style="background:linear-gradient(135deg, #EF4444 0%, #DC2626 100%); color:#fff; font-size:0.72rem; font-weight:900; padding:2px 8px; border-radius:10px; box-shadow:0 0 10px rgba(239,68,68,0.4); letter-spacing:0.4px;">
                        ${plan.discountBadge || ('%' + Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100) + ' İNDİRİM')}
                      </span>
                    </div>
                  ` : ''}
                  <div style="font-size:1.85rem; font-weight:900; color:${priceColor}; line-height:1.1;">
                    ₺${Number(plan.price).toLocaleString('tr-TR')} <span style="font-size:0.85rem; color:var(--color-text-muted); font-weight:500;">${plan.period || '/ay'}</span>
                  </div>
                </div>
                <p style="font-size:0.84rem; color:var(--color-text-muted); line-height:1.5; margin-bottom:1.2rem;">
                  ${plan.description || ''}
                </p>
                <ul style="list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:0.6rem; font-size:0.85rem; color:var(--color-text-main);">
                  ${(plan.features || []).map(feat => `<li>✓ ${feat}</li>`).join('')}
                </ul>
              </div>
              <button class="btn-primary-hero btn-plan-select-cta" data-plan="${planFullName}" data-price="${plan.price}" style="width:100%; justify-content:center; margin-top:1.8rem; ${btnBg}">
                ${plan.name} Planını Seç
              </button>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- REGISTER PROMO BANNER -->
    <div class="landing-bottom-promo">
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

  // Navigation Links
  document.getElementById('landing-btn-register-now')?.addEventListener('click', () => {
    if (isRejected) {
      store.clearLastRegisteredBusiness();
    }
    store.setView('register');
  });

  document.getElementById('btn-banner-reapply')?.addEventListener('click', () => {
    store.clearLastRegisteredBusiness();
    store.setView('register');
  });

  document.getElementById('btn-package-hero-register')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('btn-banner-view-id')?.addEventListener('click', () => {
    if (isApproved) {
      store.setView('register');
    } else {
      const btnApps = document.getElementById('btn-dropdown-applications');
      if (btnApps) {
        btnApps.click();
      } else {
        store.setView('register');
      }
    }
  });

  document.getElementById('landing-btn-bottom-register')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('landing-btn-learn-more')?.addEventListener('click', () => {
    const feat = document.getElementById('features-section');
    if (feat) feat.scrollIntoView({ behavior: 'smooth' });
  });

  container.querySelectorAll('.btn-plan-select-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedPlan = e.currentTarget.dataset.plan;
      const selectedPrice = Number(e.currentTarget.dataset.price);
      if (selectedPlan) {
        sessionStorage.setItem('buyurabi_selected_plan', JSON.stringify({ plan: selectedPlan, price: selectedPrice }));
      }
      store.setView('register');
    });
  });
}
