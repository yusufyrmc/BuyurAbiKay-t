import { store } from '../state/store.js';

export function renderRegisterPage(container) {
  let currentStep = 1;
  let formData = {
    businessName: '',
    fullName: '',
    businessType: 'Restoran & Lokanta',
    plan: 'Profesyonel Paket (₺1000/ay)',
    planPrice: 899,
    phone: '',
    city: 'İstanbul',
    fullAddress: '',
    password: ''
  };

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
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }

  function updateView() {
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

          <!-- STEP 1: BUSINESS DETAILS & PLAN SELECTION -->
          ${currentStep === 1 ? `
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
              <div style="width:40px; height:40px; background:var(--color-primary-light); color:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="store" style="width:24px; height:24px;"></i>
              </div>
              <h2 class="wizard-title" style="margin:0;">Restoran & İşletme Kaydı</h2>
            </div>
            <p class="wizard-subtitle">İşletme bilgilerinizi girin ve dilediğiniz aylık planı seçin.</p>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-label"><i data-lucide="building"></i> Restoran / İşletme Adı</label>
                <input type="text" id="reg-businessname" class="form-input" placeholder="Örn: Kebapçı Ahmet Usta" value="${formData.businessName}">
              </div>

              <div class="form-field">
                <label class="form-label"><i data-lucide="utensils"></i> İşletme Türü</label>
                <select id="reg-businesstype" class="form-input">
                  <option value="Restoran & Lokanta" ${formData.businessType === 'Restoran & Lokanta' ? 'selected' : ''}>🍲 Restoran & Lokanta</option>
                  <option value="Kafe & Patisserie" ${formData.businessType === 'Kafe & Patisserie' ? 'selected' : ''}>☕ Kafe & Patisserie</option>
                  <option value="Fast Food & Büfe" ${formData.businessType === 'Fast Food & Büfe' ? 'selected' : ''}>🥙 Fast Food & Büfe</option>
                  <option value="Pide & Lahmacun Salonu" ${formData.businessType === 'Pide & Lahmacun Salonu' ? 'selected' : ''}>🍕 Pide & Lahmacun Salonu</option>
                  <option value="Izgara & Dönerci" ${formData.businessType === 'Izgara & Dönerci' ? 'selected' : ''}>🥩 Izgara & Dönerci</option>
                  <option value="Tatlıcı & Baklavacı" ${formData.businessType === 'Tatlıcı & Baklavacı' ? 'selected' : ''}>🍰 Tatlıcı & Baklavacı</option>
                  <option value="Market & Şarküteri" ${formData.businessType === 'Market & Şarküteri' ? 'selected' : ''}>🛒 Market & Şarküteri</option>
                </select>
              </div>
            </div>

            <!-- MONTHLY PLAN SELECTION CARDS -->
            <div style="margin-bottom:1.5rem;">
              <label class="form-label" style="margin-bottom:0.6rem;"><i data-lucide="credit-card"></i> Aylık Kullanım Planı Seçin</label>
              
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.85rem;">
                <div class="role-select-card ${formData.planPrice === 800 ? 'selected' : ''}" data-plan="Başlangıç Paketi (₺499/ay)" data-price="499" style="padding:1rem 0.6rem;">
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥉</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Başlangıç</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-primary);">₺499 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>

                <div class="role-select-card ${formData.planPrice === 1000 ? 'selected' : ''}" data-plan="Profesyonel Paket (₺899/ay)" data-price="899" style="padding:1rem 0.6rem; position:relative;">
                  <div style="position:absolute; top:-10px; right:10px; background:var(--color-primary); color:#fff; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:10px;">POPÜLER</div>
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥈</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Profesyonel</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-accent-green);">₺899 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>

                <div class="role-select-card ${formData.planPrice === 2000 ? 'selected' : ''}" data-plan="Kurumsal Paket (₺1.499/ay)" data-price="1499" style="padding:1rem 0.6rem;">
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥇</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Kurumsal</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-accent-cyan);">₺1.499 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>
              </div>
            </div>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-label"><i data-lucide="user"></i> Yetkili Ad Soyad</label>
                <input type="text" id="reg-fullname" class="form-input" placeholder="Örn: Ahmet Yılmaz" value="${formData.fullName}">
              </div>

              <div class="form-field">
                <label class="form-label"><i data-lucide="phone"></i> Cep Telefonu</label>
                <input type="tel" id="reg-phone" class="form-input" placeholder="0555 123 45 67" value="${formData.phone}">
              </div>
            </div>

            <button class="btn-primary-hero" id="btn-step1-next" style="width:100%; justify-content:center; margin-top:0.5rem;">
              Adres Bilgilerine Geç <i data-lucide="arrow-right"></i>
            </button>
          ` : ''}

          <!-- STEP 2: LOCATION & FULL ADDRESS -->
          ${currentStep === 2 ? `
            <h2 class="wizard-title">Konum ve Açık Adres</h2>
            <p class="wizard-subtitle">İşletmenizin bulunduğu şehir, ilçe ve açık adres bilgileri.</p>

            <div class="form-field">
              <label class="form-label"><i data-lucide="map-pin"></i> Şehir ve İlçe</label>
              <select id="reg-city" class="form-input">
                <option value="İstanbul / Kadıköy" ${formData.city === 'İstanbul / Kadıköy' ? 'selected' : ''}>İstanbul / Kadıköy</option>
                <option value="İstanbul / Beşiktaş" ${formData.city === 'İstanbul / Beşiktaş' ? 'selected' : ''}>İstanbul / Beşiktaş</option>
                <option value="İstanbul / Şişli" ${formData.city === 'İstanbul / Şişli' ? 'selected' : ''}>İstanbul / Şişli</option>
                <option value="Ankara / Çankaya" ${formData.city === 'Ankara / Çankaya' ? 'selected' : ''}>Ankara / Çankaya</option>
                <option value="İzmir / Konak" ${formData.city === 'İzmir / Konak' ? 'selected' : ''}>İzmir / Konak</option>
                <option value="Bursa / Nilüfer" ${formData.city === 'Bursa / Nilüfer' ? 'selected' : ''}>Bursa / Nilüfer</option>
                <option value="Antalya / Muratpaşa" ${formData.city === 'Antalya / Muratpaşa' ? 'selected' : ''}>Antalya / Muratpaşa</option>
              </select>
            </div>

            <div class="form-field">
              <label class="form-label"><i data-lucide="navigation"></i> Açık Adres</label>
              <textarea id="reg-fulladdress" class="form-input" rows="3" placeholder="Mahalle, Cadde/Sokak, Bina No, Kapı No ve Tarif bilgisi...">${formData.fullAddress}</textarea>
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
            <p class="wizard-subtitle">İşletme paneli girişiniz için güvenli bir parola belirleyin.</p>

            <div class="form-field">
              <label class="form-label"><i data-lucide="lock"></i> Şifre Oluşturun</label>
              <input type="password" id="reg-password" class="form-input" placeholder="En az 6 karakter, harf ve rakam" value="${formData.password}">
              
              <div class="password-meter" style="margin-top:0.6rem;">
                <div id="password-meter-fill-el" class="password-meter-fill ${calculatePasswordStrength(formData.password).class}"></div>
              </div>
              <div id="password-strength-text-el" style="font-size:0.8rem; font-weight:700; margin-top:4px; text-align:right; color:var(--color-text-muted);">
                ${formData.password ? `Şifre Gücü: ${calculatePasswordStrength(formData.password).text}` : ''}
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md); border:var(--border-glass); margin-bottom:1.5rem;">
              <label style="display:flex; align-items:center; gap:0.6rem; font-size:0.85rem; color:var(--color-text-muted); cursor:pointer;">
                <input type="checkbox" id="reg-terms" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
                <span><strong style="color:#fff;">BuyurAbi İşletme Sözleşmesini</strong> okudum ve onaylıyorum.</span>
              </label>
            </div>

            <div style="display:flex; gap:1rem;">
              <button class="btn-secondary-hero" id="btn-step3-prev">Geri</button>
              <button class="btn-primary-hero" id="btn-step3-next" style="flex:1; justify-content:center;">
                SMS Doğrulaması Gönder <i data-lucide="send"></i>
              </button>
            </div>
          ` : ''}

          <!-- STEP 4: SMS OTP VERIFICATION -->
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
                <i data-lucide="check-circle-2"></i> Başvuruyu Gönder
              </button>
            </div>
          ` : ''}

          <!-- STEP 5: SUCCESS EKRANI -->
          ${currentStep === 5 ? `
            <div style="text-align:center; padding:2rem 0;">
              <div style="width:80px; height:80px; background:rgba(0,230,118,0.2); color:var(--color-accent-green); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1.5rem auto; border:2px solid var(--color-accent-green); box-shadow:0 0 30px rgba(0,230,118,0.4);">
                <i data-lucide="check" style="width:46px; height:46px;"></i>
              </div>

              <h2 class="wizard-title" style="color:var(--color-accent-green);">Başvurunuz Alındı! 🎉</h2>
              <p class="wizard-subtitle" style="font-size:1.05rem; max-width:520px; margin:0 auto 2rem auto;">
                <strong>${formData.businessName}</strong> işletme başvurunuz (${formData.plan}) sistem yöneticisine iletildi.
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
            <i data-lucide="badge-check" style="vertical-align:middle; margin-right:4px;"></i> Live İşletme Rozeti
          </div>

          <div class="digital-badge-chip">
            <div class="badge-avatar">
              ${(formData.businessName || 'R').charAt(0).toUpperCase()}
            </div>
            
            <div class="badge-user-name" id="badge-disp-business">
              ${formData.businessName || 'İşletme Adı'}
            </div>

            <div class="badge-user-role" id="badge-disp-type">
              🏬 ${formData.businessType}
            </div>

            <div class="badge-info-list">
              <div><strong>Seçilen Paket:</strong> <span style="color:var(--color-accent-green); font-weight:800;" id="badge-disp-plan">${formData.plan}</span></div>
              <div><strong>Yetkili:</strong> <span id="badge-disp-fullname">${formData.fullName || 'Ad Soyad'}</span></div>
              <div><strong>Telefon:</strong> <span id="badge-disp-phone">${formData.phone || '0555 *** ** **'}</span></div>
              <div><strong>Şehir:</strong> <span id="badge-disp-city">${formData.city}</span></div>
              <div><strong>Durum:</strong> <span style="color:var(--color-accent-yellow); font-weight:800;">⏳ ONAY BEKLİYOR</span></div>
            </div>
          </div>

          <p style="font-size:0.78rem; color:var(--color-text-muted); margin-top:1.5rem; max-width:280px; text-align:center;">
            Formu doldurdukça işletme rozetiniz canlı olarak güncellenir.
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // Event Bindings
    if (currentStep === 1) {
      const bnInput = container.querySelector('#reg-businessname');
      const btSelect = container.querySelector('#reg-businesstype');
      const fnInput = container.querySelector('#reg-fullname');
      const phInput = container.querySelector('#reg-phone');

      bnInput?.addEventListener('input', (e) => {
        formData.businessName = e.target.value;
        const disp = container.querySelector('#badge-disp-business');
        if (disp) disp.textContent = formData.businessName || 'İşletme Adı';
      });

      btSelect?.addEventListener('change', (e) => {
        formData.businessType = e.target.value;
        const disp = container.querySelector('#badge-disp-type');
        if (disp) disp.textContent = '🏬 ' + formData.businessType;
      });

      container.querySelectorAll('.role-select-card[data-plan]').forEach(card => {
        card.addEventListener('click', (e) => {
          formData.plan = e.currentTarget.dataset.plan;
          formData.planPrice = Number(e.currentTarget.dataset.price);
          updateView();
        });
      });

      fnInput?.addEventListener('input', (e) => {
        formData.fullName = e.target.value;
        const disp = container.querySelector('#badge-disp-fullname');
        if (disp) disp.textContent = formData.fullName || 'Ad Soyad';
      });

      phInput?.addEventListener('input', (e) => {
        formData.phone = e.target.value;
        const disp = container.querySelector('#badge-disp-phone');
        if (disp) disp.textContent = formData.phone || '0555 *** ** **';
      });

      container.querySelector('#btn-step1-next')?.addEventListener('click', () => {
        if (!formData.businessName || !formData.fullName || !formData.phone) {
          showToast('Lütfen İşletme Adı, Yetkili Ad Soyad ve Telefon alanlarını doldurun!', 'error');
          return;
        }
        currentStep = 2;
        updateView();
      });
    }

    if (currentStep === 2) {
      const citySelect = container.querySelector('#reg-city');
      const addrInput = container.querySelector('#reg-fulladdress');

      citySelect?.addEventListener('change', (e) => {
        formData.city = e.target.value;
        const disp = container.querySelector('#badge-disp-city');
        if (disp) disp.textContent = formData.city;
      });

      addrInput?.addEventListener('input', (e) => {
        formData.fullAddress = e.target.value;
      });

      container.querySelector('#btn-step2-prev')?.addEventListener('click', () => {
        currentStep = 1;
        updateView();
      });

      container.querySelector('#btn-step2-next')?.addEventListener('click', () => {
        if (!formData.fullAddress) {
          showToast('Lütfen Açık Adres alanını doldurun!', 'error');
          return;
        }
        currentStep = 3;
        updateView();
      });
    }

    if (currentStep === 3) {
      const passInput = container.querySelector('#reg-password');

      passInput?.addEventListener('input', (e) => {
        formData.password = e.target.value;
        const strength = calculatePasswordStrength(formData.password);

        const fillEl = container.querySelector('#password-meter-fill-el');
        const textEl = container.querySelector('#password-strength-text-el');

        if (fillEl) fillEl.className = `password-meter-fill ${strength.class}`;
        if (textEl) textEl.textContent = formData.password ? `Şifre Gücü: ${strength.text}` : '';
      });

      container.querySelector('#btn-step3-prev')?.addEventListener('click', () => {
        currentStep = 2;
        updateView();
      });

      container.querySelector('#btn-step3-next')?.addEventListener('click', () => {
        if (!formData.password || formData.password.length < 6) {
          showToast('Lütfen en az 6 karakterli bir şifre belirleyin!', 'error');
          return;
        }
        currentStep = 4;
        updateView();
      });
    }

    if (currentStep === 4) {
      container.querySelector('#btn-verify-otp')?.addEventListener('click', async () => {
        await store.addRegistration({
          businessName: formData.businessName,
          fullName: formData.fullName,
          businessType: formData.businessType,
          plan: formData.plan,
          planPrice: formData.planPrice,
          phone: formData.phone,
          city: formData.city,
          fullAddress: formData.fullAddress
        });

        currentStep = 5;
        updateView();
        triggerConfetti();
        showToast('🎉 İşletme başvurunuz veritabanına ve admin paneline iletildi!', 'success');
      });
    }

    if (currentStep === 5) {
      container.querySelector('#btn-finish-go-home')?.addEventListener('click', () => {
        store.setView('landing');
      });
    }
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
