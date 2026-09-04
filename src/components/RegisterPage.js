import { store } from '../state/store.js';

export function renderRegisterPage(container) {
  let currentStep = 1;
  let formData = {
    role: 'esnaf', // 'esnaf' | 'kurye' | 'musteri'
    fullName: '',
    businessName: '',
    phone: '',
    email: '',
    city: 'İstanbul',
    password: '',
    otpCode: ''
  };

  function getRoleTitle() {
    if (formData.role === 'esnaf') return 'Restoran / İşletme Kaydı';
    if (formData.role === 'kurye') return 'Kurye Katılım Kaydı';
    return 'Müşteri Kaydı';
  }

  function calculatePasswordStrength(pass) {
    if (!pass) return { level: 0, text: '', class: '' };
    if (pass.length < 6) return { level: 1, text: 'Zayıf ⚠️', class: 'strength-weak' };
    if (pass.length < 9) return { level: 2, text: 'Orta 🔒', class: 'strength-medium' };
    if (!/[A-Z]/.test(pass) || !/[0-9]/.test(pass)) return { level: 3, text: 'Güçlü 🛡️', class: 'strength-strong' };
    return { level: 4, text: 'Mükemmel 🚀', class: 'strength-perfect' };
  }

  function triggerConfetti() {
    if (window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }

  function updateView() {
    const strength = calculatePasswordStrength(formData.password);

    container.innerHTML = `
      <div class="register-container-layout">
        <!-- LEFT: WIZARD FORM -->
        <div class="register-wizard-card">
          <!-- Step Progress Node Header -->
          <div class="step-indicator-bar">
            <div class="step-progress-line" style="width: ${(currentStep - 1) * 33.3}%;"></div>
            
            <div class="step-node ${currentStep >= 1 ? (currentStep > 1 ? 'completed' : 'active') : ''}">
              ${currentStep > 1 ? '✓' : '1'}
            </div>
            <div class="step-node ${currentStep >= 2 ? (currentStep > 2 ? 'completed' : 'active') : ''}">
              ${currentStep > 2 ? '✓' : '2'}
            </div>
            <div class="step-node ${currentStep >= 3 ? (currentStep > 3 ? 'completed' : 'active') : ''}">
              ${currentStep > 3 ? '✓' : '3'}
            </div>
            <div class="step-node ${currentStep >= 4 ? 'completed' : ''}">
              ${currentStep === 4 ? '✓' : '4'}
            </div>
          </div>

          <!-- STEP 1: ROLE SELECTION -->
          ${currentStep === 1 ? `
            <h2 class="wizard-title">BuyurAbi'ye Hoş Geldiniz</h2>
            <p class="wizard-subtitle">Katılmak istediğiniz hesap türünü seçerek kaydınızı başlatın.</p>

            <div class="role-cards-grid">
              <div class="role-select-card ${formData.role === 'esnaf' ? 'selected' : ''}" data-role="esnaf">
                <div class="role-icon-wrapper">
                  <i data-lucide="store" style="width:26px; height:26px;"></i>
                </div>
                <div class="role-card-title">Restoran / İşletme</div>
                <div class="role-card-sub">QR Menü ve Masadan Anlık Sipariş Alın</div>
              </div>

              <div class="role-select-card ${formData.role === 'kurye' ? 'selected' : ''}" data-role="kurye">
                <div class="role-icon-wrapper">
                  <i data-lucide="bike" style="width:26px; height:26px;"></i>
                </div>
                <div class="role-card-title">Kurye Hesabı</div>
                <div class="role-card-sub">Esnek Saatlerle Teslimat Yapın & Kazanın</div>
              </div>

              <div class="role-select-card ${formData.role === 'musteri' ? 'selected' : ''}" data-role="musteri">
                <div class="role-icon-wrapper">
                  <i data-lucide="user-check" style="width:26px; height:26px;"></i>
                </div>
                <div class="role-card-title">Bireysel Müşteri</div>
                <div class="role-card-sub">Hızlı Sipariş Verin & Kampanyaları Yakalayın</div>
              </div>
            </div>

            <button class="btn-primary-hero" id="btn-step1-next" style="width:100%; justify-content:center;">
              Devam Et <i data-lucide="arrow-right"></i>
            </button>
          ` : ''}

          <!-- STEP 2: PERSONAL & BUSINESS DETAILS -->
          ${currentStep === 2 ? `
            <h2 class="wizard-title">${getRoleTitle()}</h2>
            <p class="wizard-subtitle">Hesap profiliniz ve iletişim bilgileriniz.</p>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-label"><i data-lucide="user"></i> Ad Soyad</label>
                <input type="text" id="reg-fullname" class="form-input" placeholder="Örn: Ahmet Yılmaz" value="${formData.fullName}">
              </div>

              ${formData.role === 'esnaf' ? `
                <div class="form-field">
                  <label class="form-label"><i data-lucide="building"></i> Restoran / İşletme Adı</label>
                  <input type="text" id="reg-businessname" class="form-input" placeholder="Örn: BuyurAbi Kebap Salonu" value="${formData.businessName}">
                </div>
              ` : `
                <div class="form-field">
                  <label class="form-label"><i data-lucide="map-pin"></i> Şehir / İlçe</label>
                  <select id="reg-city" class="form-input">
                    <option value="İstanbul">İstanbul</option>
                    <option value="Ankara">Ankara</option>
                    <option value="İzmir">İzmir</option>
                    <option value="Bursa">Bursa</option>
                    <option value="Antalya">Antalya</option>
                  </select>
                </div>
              `}
            </div>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-label"><i data-lucide="phone"></i> Cep Telefonu</label>
                <input type="tel" id="reg-phone" class="form-input" placeholder="0555 123 45 67" value="${formData.phone}">
              </div>

              <div class="form-field">
                <label class="form-label"><i data-lucide="mail"></i> E-posta Adresi</label>
                <input type="email" id="reg-email" class="form-input" placeholder="ahmet@example.com" value="${formData.email}">
              </div>
            </div>

            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
              <button class="btn-secondary-hero" id="btn-step2-prev">Geri</button>
              <button class="btn-primary-hero" id="btn-step2-next" style="flex:1; justify-content:center;">
                Güvenlik Adımına Geç <i data-lucide="arrow-right"></i>
              </button>
            </div>
          ` : ''}

          <!-- STEP 3: SECURITY & PASSWORD -->
          ${currentStep === 3 ? `
            <h2 class="wizard-title">Şifre & Güvenlik</h2>
            <p class="wizard-subtitle">Hesabınız için güçlü bir parola belirleyin.</p>

            <div class="form-field">
              <label class="form-label"><i data-lucide="lock"></i> Şifre Oluşturun</label>
              <input type="password" id="reg-password" class="form-input" placeholder="En az 6 karakter, harf ve rakam" value="${formData.password}">
              
              ${formData.password ? `
                <div class="password-meter">
                  <div class="password-meter-fill ${strength.class}"></div>
                </div>
                <div style="font-size:0.78rem; font-weight:700; margin-top:4px; text-align:right; color:var(--color-text-muted);">
                  Şifre Gücü: ${strength.text}
                </div>
              ` : ''}
            </div>

            <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md); border:var(--border-glass); margin-bottom:1.5rem;">
              <label style="display:flex; align-items:center; gap:0.6rem; font-size:0.85rem; color:var(--color-text-muted); cursor:pointer;">
                <input type="checkbox" id="reg-terms" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
                <span><strong style="color:#fff;">Kullanım Koşullarını</strong> ve Gizlilik Sözleşmesini okudum, kabul ediyorum.</span>
              </label>
            </div>

            <div style="display:flex; gap:1rem;">
              <button class="btn-secondary-hero" id="btn-step3-prev">Geri</button>
              <button class="btn-primary-hero" id="btn-step3-next" style="flex:1; justify-content:center;">
                SMS Doğrulaması Gönder <i data-lucide="send"></i>
              </button>
            </div>
          ` : ''}

          <!-- STEP 4: SMS OTP VERIFICATION SIMULATOR -->
          ${currentStep === 4 ? `
            <div style="text-align:center; padding:1rem 0;">
              <div style="width:68px; height:68px; background:var(--color-primary-light); color:var(--color-primary); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.2rem auto;">
                <i data-lucide="smartphone" style="width:36px; height:36px;"></i>
              </div>

              <h2 class="wizard-title">SMS Doğrulama Kodu</h2>
              <p class="wizard-subtitle"><strong>${formData.phone || '0555 123 45 67'}</strong> numaralı telefonunuza gönderilen 6 haneli doğrulama kodunu girin.</p>

              <div style="display:flex; justify-content:center; gap:0.6rem; margin:2rem 0;">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="7">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="4">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="2">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="9">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="0">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="8">
              </div>

              <button class="btn-primary-hero" id="btn-verify-otp" style="width:100%; justify-content:center;">
                <i data-lucide="check-circle-2"></i> Kaydı Tamamla & Onayla
              </button>
            </div>
          ` : ''}

          <!-- STEP 5: SUCCESS & CONFETTI EXPLOSION -->
          ${currentStep === 5 ? `
            <div style="text-align:center; padding:2rem 0;">
              <div style="width:80px; height:80px; background:rgba(0,230,118,0.2); color:var(--color-accent-green); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto; border:2px solid var(--color-accent-green); box-shadow:0 0 30px rgba(0,230,118,0.4);">
                <i data-lucide="check" style="width:46px; height:46px;"></i>
              </div>

              <h2 class="wizard-title" style="color:var(--color-accent-green);">Tebrikler! Kaydınız Başarıyla Oluşturuldu 🎉</h2>
              <p class="wizard-subtitle" style="font-size:1.1rem; max-width:500px; margin:0 auto 2rem auto;">
                BuyurAbi ekosistemine hoş geldiniz. Dijital kimlik kartınız oluşturuldu ve hesabınız aktif edildi.
              </p>

              <button class="btn-primary-hero" id="btn-finish-go-home" style="width:100%; justify-content:center;">
                <i data-lucide="sparkles"></i> Ana Sayfaya Dön
              </button>
            </div>
          ` : ''}
        </div>

        <!-- RIGHT: LIVE DIGITAL BADGE PREVIEW -->
        <div class="badge-preview-card">
          <div class="badge-preview-header">
            <i data-lucide="badge-check" style="vertical-align:middle; margin-right:4px;"></i> Live Dijital Kimlik Kartı
          </div>

          <div class="digital-badge-chip">
            <div class="badge-avatar">
              ${(formData.fullName || 'B').charAt(0).toUpperCase()}
            </div>
            
            <div class="badge-user-name">
              ${formData.fullName || 'Ad Soyad'}
            </div>

            <div class="badge-user-role">
              ${formData.role === 'esnaf' ? '🏬 RESTORAN / İŞLETME' : formData.role === 'kurye' ? '🛵 TESLİMAT KURYESİ' : '👤 BİREYSEL MÜŞTERİ'}
            </div>

            <div class="badge-info-list">
              <div><strong>İşletme / Unvan:</strong> ${formData.businessName || formData.fullName || 'Belirtilmedi'}</div>
              <div><strong>İletişim:</strong> ${formData.phone || '0555 *** ** **'}</div>
              <div><strong>Şehir:</strong> ${formData.city}</div>
              <div><strong>Durum:</strong> <span style="color:var(--color-accent-green); font-weight:800;">● AKTİF ÜYE</span></div>
            </div>
          </div>

          <p style="font-size:0.78rem; color:var(--color-text-muted); margin-top:1.5rem; max-width:280px; text-align:center;">
            Formu doldurdukça dijital kartınız anlık olarak güncellenmektedir.
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Bindings
    container.querySelectorAll('.role-select-card').forEach(card => {
      card.addEventListener('click', (e) => {
        formData.role = e.currentTarget.dataset.role;
        updateView();
      });
    });

    container.querySelector('#btn-step1-next')?.addEventListener('click', () => {
      currentStep = 2;
      updateView();
    });

    container.querySelector('#btn-step2-prev')?.addEventListener('click', () => {
      currentStep = 1;
      updateView();
    });

    container.querySelector('#btn-step2-next')?.addEventListener('click', () => {
      const fnInput = container.querySelector('#reg-fullname');
      const bnInput = container.querySelector('#reg-businessname');
      const phInput = container.querySelector('#reg-phone');
      const emInput = container.querySelector('#reg-email');

      if (fnInput) formData.fullName = fnInput.value;
      if (bnInput) formData.businessName = bnInput.value;
      if (phInput) formData.phone = phInput.value;
      if (emInput) formData.email = emInput.value;

      if (!formData.fullName) {
        showToast('Lütfen Ad Soyad alanını doldurun!', 'error');
        return;
      }

      currentStep = 3;
      updateView();
    });

    container.querySelector('#reg-password')?.addEventListener('input', (e) => {
      formData.password = e.target.value;
      updateView();
    });

    container.querySelector('#btn-step3-prev')?.addEventListener('click', () => {
      currentStep = 2;
      updateView();
    });

    container.querySelector('#btn-step3-next')?.addEventListener('click', () => {
      const passInput = container.querySelector('#reg-password');
      if (passInput) formData.password = passInput.value;

      if (!formData.password || formData.password.length < 6) {
        showToast('Lütfen en az 6 karakterli geçerli bir şifre girin!', 'error');
        return;
      }

      currentStep = 4;
      updateView();
    });

    container.querySelector('#btn-verify-otp')?.addEventListener('click', () => {
      currentStep = 5;
      updateView();
      triggerConfetti();
      showToast('🎉 Kaydınız başarıyla tamamlandı!', 'success');
    });

    container.querySelector('#btn-finish-go-home')?.addEventListener('click', () => {
      store.setView('landing');
    });
  }

  updateView();
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = 'toast-message';
  if (type === 'error') toast.style.borderLeftColor = 'var(--color-danger)';
  toast.innerHTML = message;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 4000);
}
