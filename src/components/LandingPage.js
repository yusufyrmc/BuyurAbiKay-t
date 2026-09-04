import { store } from '../state/store.js';

export function renderLandingPage(container) {
  container.innerHTML = `
    <!-- HERO SECTION -->
    <div class="landing-hero">
      <div class="hero-text-content">
        <div class="hero-pill-tag">
          <i data-lucide="sparkles"></i>
          <span>Yeni Nesil Restoran Otomasyon Ekosistemi</span>
        </div>

        <h1 class="hero-title-main">
          Restoranınızı Dijitalleştirin, <span>Siparişleri 10 Kat Hızlandırın!</span>
        </h1>

        <p class="hero-subtitle-main">
          BuyurAbi ile masada QR menü, anlık masadan sipariş alımı, mutfak yönetim paneli ve kurye ağı tek bir platformda. Müşterilerinize unutulmaz bir lezzet deneyimi sunun.
        </p>

        <div class="hero-btn-group">
          <button class="btn-primary-hero" id="landing-btn-register-now">
            <i data-lucide="user-plus"></i>
            <span>Ücretsiz Kayıt Ol</span>
          </button>

          <button class="btn-secondary-hero" id="landing-btn-learn-more">
            <i data-lucide="play"></i>
            <span>Sistemi İncele</span>
          </button>
        </div>

        <div style="display:flex; gap:2.5rem; padding-top:1.5rem; border-top:var(--border-glass);">
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-accent-green);">%35</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Ciro Artışı</p>
          </div>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-primary);">5 Saniye</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Sipariş İletim Süresi</p>
          </div>
          <div>
            <h4 style="font-family:var(--font-heading); font-size:1.8rem; font-weight:900; color:var(--color-accent-cyan);">%100</h4>
            <p style="font-size:0.85rem; color:var(--color-text-muted);">Temassız & Güvenli</p>
          </div>
        </div>
      </div>

      <!-- SHOWCASE VISUAL CARD -->
      <div class="hero-card-showcase">
        <div class="showcase-header">
          <div>
            <strong style="font-family:var(--font-heading); font-size:1.1rem; color:#fff;">BuyurAbi Dijital Ekosistem</strong>
            <div style="font-size:0.75rem; color:var(--color-text-muted);">Masada QR Menü & Sipariş Paneli</div>
          </div>
          <div class="showcase-live-badge">
            <i data-lucide="zap"></i> Canlı
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:1rem;">
          <div style="background:rgba(255,107,0,0.12); border:1px dashed var(--color-primary); padding:1rem; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.88rem; margin-bottom:0.4rem;">
              <span>🔥 Masa 4 Siparişi Alındı</span>
              <span style="color:var(--color-accent-green);">₺400.00</span>
            </div>
            <p style="font-size:0.78rem; color:var(--color-text-muted);">1x Zırh Kıyma Adana Kebap • 1x Bol Köpüklü Ayran</p>
          </div>

          <div style="background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.3); padding:1rem; border-radius:var(--radius-md);">
            <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.88rem; margin-bottom:0.4rem; color:var(--color-accent-green);">
              <span>✅ Mutfağa Anında İletildi</span>
              <span>12:40</span>
            </div>
            <p style="font-size:0.78rem; color:var(--color-text-muted);">Sipariş hazırlandığında müşteri telefonuna bildirim gider.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- FEATURES GRID -->
    <div class="landing-grid-features" id="features-section">
      <div class="landing-feat-card">
        <div class="feat-icon-box">
          <i data-lucide="qr-code" style="width:28px; height:28px;"></i>
        </div>
        <h3>Masada QR Menü</h3>
        <p>Müşterileriniz uygulama indirmeden kamerasıyla QR kodu tarlar, zengin fotoğraflı ve açıklamalı menünüzü inceler.</p>
      </div>

      <div class="landing-feat-card">
        <div class="feat-icon-box" style="background:rgba(0,230,118,0.15); color:var(--color-accent-green);">
          <i data-lucide="bell" style="width:28px; height:28px;"></i>
        </div>
        <h3>Garson & Hesap Çağırma</h3>
        <p>Müşteri masadan el sallamadan tek bir dokunuşla garson çağırabilir veya nakit/kredi kartı hesap isteğinde bulunabilir.</p>
      </div>

      <div class="landing-feat-card">
        <div class="feat-icon-box" style="background:rgba(0,229,255,0.15); color:var(--color-accent-cyan);">
          <i data-lucide="chef-hat" style="width:28px; height:28px;"></i>
        </div>
        <h3>Canlı Mutfak Paneli</h3>
        <p>Siparişler mutfaktaki ekrana sesli zil uyarısı ile anında düşer. Mutfak personeli siparişi hazırlayıp tamamlar.</p>
      </div>
    </div>

    <!-- REGISTER PROMO BANNER -->
    <div style="background:linear-gradient(135deg, rgba(255,107,0,0.2) 0%, rgba(14,19,31,0.9) 100%); border:2px solid var(--color-primary); border-radius:var(--radius-lg); padding:3rem 2rem; text-align:center; box-shadow:var(--shadow-glow); margin:3rem 0;">
      <h2 style="font-family:var(--font-heading); font-size:2.4rem; font-weight:900; color:#fff; margin-bottom:0.8rem;">
        Siz de BuyurAbi Ailesine Katılın!
      </h2>
      <p style="color:var(--color-text-muted); font-size:1.1rem; max-width:600px; margin:0 auto 2rem auto;">
        Restoran sahibi, kurye veya müşteri olarak saniyeler içinde kaydolun. İlk 14 gün ücretsiz kullanın.
      </p>
      <button class="btn-primary-hero" id="landing-btn-bottom-register" style="margin:0 auto;">
        <i data-lucide="user-plus"></i> Şimdiden Kayıt Olun
      </button>
    </div>
  `;

  if (window.lucide) window.lucide.createIcons();

  document.getElementById('landing-btn-register-now')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('landing-btn-bottom-register')?.addEventListener('click', () => {
    store.setView('register');
  });

  document.getElementById('landing-btn-learn-more')?.addEventListener('click', () => {
    const feat = document.getElementById('features-section');
    if (feat) feat.scrollIntoView({ behavior: 'smooth' });
  });
}
