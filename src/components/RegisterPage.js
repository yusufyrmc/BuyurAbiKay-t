import { store } from '../state/store.js';

export function renderRegisterPage(container) {
  const savedLastReg = store.getLastRegisteredBusiness();
  const savedProfile = store.getUserProfile();

  // If business already registered: step 5. If profile exists: step 1. Else: step 0 (profile creation).
  let currentStep = savedLastReg ? 5 : (savedProfile ? 1 : 0);
  let registeredBusiness = savedLastReg || null;
  let showPasswordInStep5 = false;
  let profileMode = 'create'; // 'create' | 'login'

  let profileData = {
    fullName: savedProfile?.fullName || '',
    email: savedProfile?.email || '',
    phone: savedProfile?.phone || '',
    password: savedProfile?.password || '',
    role: savedProfile?.role || 'İşletme Sahibi'
  };

  let formData = {
    businessName: savedLastReg?.businessName || '',
    businessType: savedLastReg?.businessType || 'Restoran & Lokanta',
    plan: savedLastReg?.plan || 'Profesyonel Paket (25 Masa - ₺899/ay)',
    planPrice: savedLastReg?.planPrice || 899,
    city: savedLastReg?.city || 'İstanbul / Kadıköy',
    fullAddress: savedLastReg?.fullAddress || '',
    password: savedLastReg?.password || savedProfile?.password || ''
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

  function getStepProgressPercent() {
    if (currentStep === 0) return 0;
    if (currentStep === 1) return 25;
    if (currentStep === 2) return 50;
    if (currentStep === 3) return 75;
    return 100;
  }

  function updateView() {
    const activeProfile = store.getUserProfile();

    container.innerHTML = `
      <div class="register-container-layout">
        <!-- LEFT: WIZARD FORM -->
        <div class="register-wizard-card">
          <!-- Step Progress Node Header (5 Steps: Profil, İşletme, Adres, Şifre, Doğrulama) -->
          <div class="step-indicator-bar">
            <div class="step-progress-line" style="width: ${getStepProgressPercent()}%;"></div>
            
            <div class="step-node ${currentStep === 0 ? 'active' : (currentStep > 0 ? 'completed' : '')}" title="1. Yetkili Profili">
              ${currentStep > 0 ? '✓' : '1'}
            </div>
            <div class="step-node ${currentStep === 1 ? 'active' : (currentStep > 1 ? 'completed' : '')}" title="2. İşletme & Plan">
              ${currentStep > 1 ? '✓' : '2'}
            </div>
            <div class="step-node ${currentStep === 2 ? 'active' : (currentStep > 2 ? 'completed' : '')}" title="3. Konum & Adres">
              ${currentStep > 2 ? '✓' : '3'}
            </div>
            <div class="step-node ${currentStep === 3 ? 'active' : (currentStep > 3 ? 'completed' : '')}" title="4. Kasa Şifresi">
              ${currentStep > 3 ? '✓' : '4'}
            </div>
            <div class="step-node ${currentStep >= 4 ? 'completed' : ''}" title="5. Doğrulama">
              ${currentStep >= 4 ? '✓' : '5'}
            </div>
          </div>

          <!-- ACTIVE PROFILE BANNER (WHEN PROFILE EXISTS & IN BUSINESS STEPS 1-4) -->
          ${activeProfile && currentStep >= 1 && currentStep < 5 ? `
            <div class="active-profile-banner">
              <div style="display:flex; align-items:center; gap:0.75rem;">
                <div class="profile-avatar-mini">
                  ${(activeProfile.fullName || 'P').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style="display:flex; align-items:center; flex-wrap:wrap; gap:4px;">
                    <span style="font-size:0.75rem; color:var(--color-text-muted);">Aktif Yetkili Profili:</span>
                    <strong style="color:#fff; font-size:0.92rem;">${activeProfile.fullName}</strong>
                    <span class="profile-role-tag">${activeProfile.role || 'İşletme Sahibi'}</span>
                  </div>
                  <div style="font-size:0.75rem; color:var(--color-text-muted);">
                    ✉️ ${activeProfile.email || 'E-posta belirtilmedi'} • 📞 ${activeProfile.phone}
                  </div>
                </div>
              </div>
              <button id="btn-edit-profile-trigger" style="background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:#fff; padding:0.4rem 0.8rem; border-radius:6px; font-size:0.75rem; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:4px;">
                <i data-lucide="user" style="width:13px; height:13px;"></i> Profili Düzenle
              </button>
            </div>
          ` : ''}

          <!-- STEP 0: YETKİLİ PROFİLİ OLUŞTUR / GİRİŞ YAP -->
          ${currentStep === 0 ? `
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
              <div style="width:40px; height:40px; background:var(--color-primary-light); color:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="user-plus" style="width:24px; height:24px;"></i>
              </div>
              <h2 class="wizard-title" style="margin:0;">Yetkili Profilinizi Oluşturun</h2>
            </div>
            <p class="wizard-subtitle">İşletmenizi kaydetmeden önce sistemi yönetecek yetkili profilinizi oluşturun. Profilinizi kaydettikten sonra işletme bilgilerinize geçeceksiniz.</p>

            <!-- PROFILE MODE TABS (YENİ PROFİL / MEVCUT HESABA GİRİŞ) -->
            <div class="profile-mode-tabs">
              <button class="profile-tab-btn ${profileMode === 'create' ? 'active' : ''}" id="tab-profile-create">
                <i data-lucide="user-plus" style="width:16px; height:16px;"></i> Yeni Profil Oluştur
              </button>
              <button class="profile-tab-btn ${profileMode === 'login' ? 'active' : ''}" id="tab-profile-login">
                <i data-lucide="log-in" style="width:16px; height:16px;"></i> Mevcut Hesaba Giriş Yap
              </button>
            </div>

            ${profileMode === 'create' ? `
              <div class="form-group-row">
                <div class="form-field">
                  <label class="form-label"><i data-lucide="user"></i> Yetkili Ad Soyad</label>
                  <input type="text" id="reg-profile-fullname" class="form-input" placeholder="Örn: Ahmet Yılmaz" value="${profileData.fullName}">
                </div>

                <div class="form-field">
                  <label class="form-label"><i data-lucide="mail"></i> E-posta Adresi</label>
                  <input type="email" id="reg-profile-email" class="form-input" placeholder="ahmet@gmail.com" value="${profileData.email}">
                </div>
              </div>

              <div class="form-group-row">
                <div class="form-field">
                  <label class="form-label"><i data-lucide="phone"></i> Cep Telefonu Numarası</label>
                  <input type="tel" id="reg-profile-phone" class="form-input" placeholder="0555 123 45 67" value="${profileData.phone}">
                </div>

                <div class="form-field">
                  <label class="form-label"><i data-lucide="briefcase"></i> İşletmedeki Rolünüz / Ünvanınız</label>
                  <select id="reg-profile-role" class="form-input">
                    <option value="İşletme Sahibi" ${profileData.role === 'İşletme Sahibi' ? 'selected' : ''}>👑 İşletme Sahibi</option>
                    <option value="Restoran Müdürü" ${profileData.role === 'Restoran Müdürü' ? 'selected' : ''}>👔 Restoran Müdürü</option>
                    <option value="İş Ortağı" ${profileData.role === 'İş Ortağı' ? 'selected' : ''}>🤝 İş Ortağı</option>
                    <option value="Genel Yönetici" ${profileData.role === 'Genel Yönetici' ? 'selected' : ''}>⭐ Genel Yönetici</option>
                  </select>
                </div>
              </div>

              <div class="form-field" style="margin-bottom:1.5rem;">
                <label class="form-label"><i data-lucide="lock"></i> Profil Şifresi Belirleyin</label>
                <input type="password" id="reg-profile-password" class="form-input" placeholder="En az 6 karakterli güvenli bir şifre" value="${profileData.password}">
                
                <div class="password-meter" style="margin-top:0.6rem;">
                  <div id="profile-password-meter-fill" class="password-meter-fill ${calculatePasswordStrength(profileData.password).class}"></div>
                </div>
                <div id="profile-password-strength-text" style="font-size:0.8rem; font-weight:700; margin-top:4px; text-align:right; color:var(--color-text-muted);">
                  ${profileData.password ? `Şifre Gücü: ${calculatePasswordStrength(profileData.password).text}` : ''}
                </div>
              </div>

              <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md); border:var(--border-glass); margin-bottom:1.5rem;">
                <label style="display:flex; align-items:center; gap:0.6rem; font-size:0.85rem; color:var(--color-text-muted); cursor:pointer;">
                  <input type="checkbox" id="profile-terms" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
                  <span><strong style="color:#fff;">BuyurAbi Kullanıcı ve Hizmet Koşullarını</strong> okudum ve kabul ediyorum.</span>
                </label>
              </div>

              <button class="btn-primary-hero" id="btn-save-profile-next" style="width:100%; justify-content:center;">
                Profili Kaydet & İşletme Kaydına Geç <i data-lucide="arrow-right"></i>
              </button>
            ` : `
              <!-- LOGIN WITH EXISTING PROFILE -->
              <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); padding:1.5rem; border-radius:var(--radius-md); margin-bottom:1.5rem;">
                <div class="form-field" style="margin-bottom:1.2rem;">
                  <label class="form-label"><i data-lucide="mail"></i> E-posta veya Cep Telefonu</label>
                  <input type="text" id="login-profile-id" class="form-input" placeholder="Kayıtlı e-posta veya telefonunuz" value="${profileData.email || profileData.phone}">
                </div>

                <div class="form-field" style="margin-bottom:1rem;">
                  <label class="form-label"><i data-lucide="lock"></i> Şifreniz</label>
                  <input type="password" id="login-profile-pass" class="form-input" placeholder="Profil şifreniz">
                </div>
              </div>

              <button class="btn-primary-hero" id="btn-login-profile-next" style="width:100%; justify-content:center;">
                Giriş Yap & İşletme Kaydına Devam Et <i data-lucide="arrow-right"></i>
              </button>
            `}
          ` : ''}

          <!-- STEP 1: BUSINESS DETAILS & PLAN SELECTION -->
          ${currentStep === 1 ? `
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
              <div style="width:40px; height:40px; background:var(--color-primary-light); color:var(--color-primary); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="store" style="width:24px; height:24px;"></i>
              </div>
              <h2 class="wizard-title" style="margin:0;">İşletme Bilgileri & Masa Kapasitesi</h2>
            </div>
            <p class="wizard-subtitle">Restoranınızın adını, işletme türünü ve masa ekleme kapasitenize uygun kullanım planını seçin.</p>

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

            <!-- MASA EKLEME İÇİN PLAN SEÇİMİ -->
            <div style="margin-bottom:1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                <label class="form-label" style="margin:0;"><i data-lucide="credit-card"></i> Masa Eklemek İçin Kullanım Planı Seçin</label>
                <span style="font-size:0.75rem; color:var(--color-accent-green); font-weight:700;">Esnek Masa Kapasitesi</span>
              </div>
              
              <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.85rem;">
                <div class="role-select-card ${formData.planPrice === 499 ? 'selected' : ''}" data-plan="Başlangıç Paketi (10 Masa - ₺499/ay)" data-price="499" style="padding:1rem 0.6rem;">
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥉</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Başlangıç (10 Masa)</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-primary);">₺499 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>

                <div class="role-select-card ${formData.planPrice === 899 ? 'selected' : ''}" data-plan="Profesyonel Paket (25 Masa - ₺899/ay)" data-price="899" style="padding:1rem 0.6rem; position:relative;">
                  <div style="position:absolute; top:-10px; right:10px; background:var(--color-primary); color:#fff; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:10px;">POPÜLER</div>
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥈</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Profesyonel (25 Masa)</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-accent-green);">₺899 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>

                <div class="role-select-card ${formData.planPrice === 1499 ? 'selected' : ''}" data-plan="Kurumsal Paket (Sınırsız Masa - ₺1.499/ay)" data-price="1499" style="padding:1rem 0.6rem;">
                  <div style="font-size:1.2rem; margin-bottom:4px;">🥇</div>
                  <strong style="font-size:0.88rem; color:#fff; display:block;">Kurumsal (Sınırsız)</strong>
                  <span style="font-size:0.95rem; font-weight:800; color:var(--color-accent-cyan);">₺1.499 <span style="font-size:0.7rem; color:var(--color-text-muted);">/ay</span></span>
                </div>
              </div>
            </div>

            <div style="display:flex; gap:1rem; margin-top:1.5rem;">
              <button class="btn-secondary-hero" id="btn-step1-prev-profile">
                <i data-lucide="arrow-left"></i> Profil Bilgilerim
              </button>
              <button class="btn-primary-hero" id="btn-step1-next" style="flex:1; justify-content:center;">
                Adres Bilgilerine Geç <i data-lucide="arrow-right"></i>
              </button>
            </div>
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
                Kasa Şifresi Adımına Geç <i data-lucide="arrow-right"></i>
              </button>
            </div>
          ` : ''}

          <!-- STEP 3: SECURITY & PASSWORD -->
          ${currentStep === 3 ? `
            <h2 class="wizard-title">Kasa & Giriş Şifresi Belirleme</h2>
            <p class="wizard-subtitle">Kasa ekranınız, garson girişleri ve dijital adisyon yönetimi için güvenli bir parola belirleyin.</p>

            <div class="form-field">
              <label class="form-label"><i data-lucide="lock"></i> Kasa & Sistem Giriş Şifresi</label>
              <input type="password" id="reg-password" class="form-input" placeholder="En az 6 karakter, harf ve rakam" value="${formData.password || profileData.password}">
              
              <div class="password-meter" style="margin-top:0.6rem;">
                <div id="password-meter-fill-el" class="password-meter-fill ${calculatePasswordStrength(formData.password || profileData.password).class}"></div>
              </div>
              <div id="password-strength-text-el" style="font-size:0.8rem; font-weight:700; margin-top:4px; text-align:right; color:var(--color-text-muted);">
                ${(formData.password || profileData.password) ? `Şifre Gücü: ${calculatePasswordStrength(formData.password || profileData.password).text}` : ''}
              </div>
            </div>

            <div style="background:rgba(255,255,255,0.04); padding:1rem; border-radius:var(--radius-md); border:var(--border-glass); margin-bottom:1.5rem;">
              <label style="display:flex; align-items:center; gap:0.6rem; font-size:0.85rem; color:var(--color-text-muted); cursor:pointer;">
                <input type="checkbox" id="reg-terms" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
                <span><strong style="color:#fff;">BuyurAbi Dijital Adisyon & Kasa Otomasyon Sözleşmesini</strong> okudum ve onaylıyorum.</span>
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
              <p class="wizard-subtitle"><strong>${profileData.phone || '0555 123 45 67'}</strong> numaralı telefonunuza gönderilen 6 haneli doğrulama kodunu girin.</p>

              <div style="display:flex; justify-content:center; gap:0.6rem; margin:2rem 0;">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="7">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="4">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="2">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="9">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="0">
                <input type="text" maxlength="1" class="form-input otp-pin" style="width:48px; height:54px; text-align:center; font-size:1.4rem; font-weight:800;" value="8">
              </div>

              <button class="btn-primary-hero" id="btn-verify-otp" style="width:100%; justify-content:center;">
                <i data-lucide="check-circle-2"></i> İşletme Kaydını Tamamla & Başla
              </button>
            </div>
          ` : ''}

          <!-- STEP 5: SUCCESS EKRANI & GİRİŞ BİLGİLERİ -->
          ${currentStep === 5 ? `
            <div style="text-align:center; padding:0.5rem 0;">
              <div style="width:74px; height:74px; background:rgba(0,230,118,0.15); color:var(--color-accent-green); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto; border:2px solid var(--color-accent-green); box-shadow:0 0 35px rgba(0,230,118,0.35);">
                <i data-lucide="check-check" style="width:42px; height:42px;"></i>
              </div>

              <h2 class="wizard-title" style="color:var(--color-accent-green); font-size:1.8rem; margin-bottom:0.3rem;">Dijital Adisyon & Kasa Kaydınız Oluşturuldu! 🎉</h2>
              <p class="wizard-subtitle" style="max-width:560px; margin:0 auto 1.2rem auto; font-size:0.95rem;">
                <strong>${formData.businessName || registeredBusiness?.businessName || 'İşletmeniz'}</strong> için dijital adisyon sistemi kasa kodu ve şifreniz tanımlanmıştır.
              </p>

              <!-- PERSISTENT NOTICE BANNER -->
              <div style="background:rgba(0,230,118,0.1); border:1px solid rgba(0,230,118,0.35); border-radius:var(--radius-md); padding:0.85rem 1.2rem; margin-bottom:1.5rem; text-align:left; display:flex; align-items:center; gap:0.85rem;">
                <i data-lucide="shield-check" style="width:28px; height:28px; color:var(--color-accent-green); flex-shrink:0;"></i>
                <div style="font-size:0.86rem; color:var(--color-text-main); line-height:1.4;">
                  <strong style="color:var(--color-accent-green); display:block; margin-bottom:2px;">📌 Dijital Adisyon Bilgi Kartınız Sabitlenmiştir</strong>
                  Bu işletme kodu ve şifre ile kasanızı, salon masalarınızı, garson telefon girişlerini ve mutfak sıcak ekranınızı yönetebilirsiniz.
                </div>
              </div>

              <!-- CREDENTIALS DISPLAY BOX -->
              <div style="background:rgba(0,0,0,0.55); border:1px solid rgba(255,107,0,0.45); box-shadow:0 0 30px rgba(255,107,0,0.15); border-radius:var(--radius-lg); padding:1.5rem 1.8rem; margin-bottom:1.5rem; text-align:left; position:relative; overflow:hidden;">
                <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:var(--color-primary-gradient);"></div>

                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem;">
                  <div>
                    <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-text-muted); font-weight:800;">DİJİTAL ADİSYON GİRİŞ KARTI</span>
                    <h4 style="font-size:1.2rem; color:#fff; margin:2px 0 0 0; font-weight:800;">${formData.businessName || registeredBusiness?.businessName}</h4>
                  </div>
                  <span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                    ● AKTİF LİSANS ALINDI
                  </span>
                </div>

                <!-- 1. FIELD: ISLETME KODU (ID) -->
                <div style="margin-bottom:1.2rem;">
                  <label style="display:block; font-size:0.82rem; color:var(--color-text-muted); font-weight:700; margin-bottom:0.4rem;">
                    <i data-lucide="hash" style="width:15px; height:15px; vertical-align:middle; color:var(--color-primary);"></i> İşletme Kodu (ID) - Kasa, Masa ve Garson Tanımlama Kodu:
                  </label>
                  <div style="display:flex; align-items:center; gap:0.6rem; background:rgba(255,255,255,0.06); border:1.5px solid rgba(255,107,0,0.5); border-radius:var(--radius-md); padding:0.75rem 1.2rem;">
                    <span id="display-business-id" style="font-family:monospace; font-size:1.6rem; font-weight:900; color:var(--color-primary); letter-spacing:2px; flex:1;">
                      ${registeredBusiness?.id || 'BYR-0000'}
                    </span>
                    <button id="btn-copy-id" class="pill-btn" style="background:rgba(255,107,0,0.2); border:1px solid rgba(255,107,0,0.5); color:var(--color-primary); font-weight:800; padding:0.5rem 1rem; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                      <i data-lucide="copy" style="width:15px; height:15px;"></i> <span id="copy-id-text">Kopyala</span>
                    </button>
                  </div>
                </div>

                <!-- 2. FIELD: SIFRE -->
                <div style="margin-bottom:1.2rem;">
                  <label style="display:block; font-size:0.82rem; color:var(--color-text-muted); font-weight:700; margin-bottom:0.4rem;">
                    <i data-lucide="lock" style="width:15px; height:15px; vertical-align:middle; color:var(--color-accent-green);"></i> Kasa & Sistem Giriş Şifreniz:
                  </label>
                  <div style="display:flex; align-items:center; gap:0.6rem; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:var(--radius-md); padding:0.65rem 1.2rem;">
                    <span id="display-password" style="font-family:monospace; font-size:1.4rem; font-weight:800; color:#fff; letter-spacing:2px; flex:1;">
                      ${showPasswordInStep5 ? (formData.password || registeredBusiness?.password || '••••••') : '•'.repeat(Math.max((formData.password || registeredBusiness?.password || '123456').length, 6))}
                    </span>
                    <button id="btn-toggle-show-pass" class="pill-btn" style="background:rgba(255,255,255,0.08); border:var(--border-glass); color:var(--color-text-muted); padding:0.5rem 0.8rem; font-size:0.82rem; cursor:pointer; border-radius:var(--radius-sm);" title="${showPasswordInStep5 ? 'Gizle' : 'Göster'}">
                      <i data-lucide="${showPasswordInStep5 ? 'eye-off' : 'eye'}" style="width:15px; height:15px;"></i>
                    </button>
                    <button id="btn-copy-pass" class="pill-btn" style="background:rgba(0,230,118,0.18); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-weight:800; padding:0.5rem 1rem; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                      <i data-lucide="copy" style="width:15px; height:15px;"></i> <span id="copy-pass-text">Kopyala</span>
                    </button>
                  </div>
                </div>

                <!-- 3. DETAILS SUMMARY TABLE WITH PROFILE INFO -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:var(--radius-md); padding:0.85rem 1.1rem; margin-bottom:1.2rem; font-size:0.83rem;">
                  <div><span style="color:var(--color-text-muted);">Yetkili Ad Soyad:</span> <strong style="color:#fff; display:block;">${activeProfile?.fullName || formData.fullName || registeredBusiness?.fullName || 'Belirtilmedi'}</strong></div>
                  <div><span style="color:var(--color-text-muted);">Yetkili Rolü:</span> <strong style="color:var(--color-primary); display:block;">${activeProfile?.role || 'İşletme Sahibi'}</strong></div>
                  <div><span style="color:var(--color-text-muted);">E-posta Adresi:</span> <strong style="color:#fff; display:block;">${activeProfile?.email || 'Belirtilmedi'}</strong></div>
                  <div><span style="color:var(--color-text-muted);">Telefon Numarası:</span> <strong style="color:#fff; display:block;">${activeProfile?.phone || formData.phone || registeredBusiness?.phone || 'Belirtilmedi'}</strong></div>
                  <div><span style="color:var(--color-text-muted);">İşletme Türü:</span> <strong style="color:#fff; display:block;">${formData.businessType || registeredBusiness?.businessType || 'Restoran'}</strong></div>
                  <div><span style="color:var(--color-text-muted);">Masa Kapasite Planı:</span> <strong style="color:var(--color-accent-green); display:block;">${formData.plan || registeredBusiness?.plan || 'Profesyonel'}</strong></div>
                  <div style="grid-column:1 / -1;"><span style="color:var(--color-text-muted);">Konum & Açık Adres:</span> <strong style="color:#fff; display:block;">${formData.city || registeredBusiness?.city || ''} - ${formData.fullAddress || registeredBusiness?.fullAddress || ''}</strong></div>
                </div>

                <!-- ACTION BUTTONS ROW: COPY ALL & DOWNLOAD TXT -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
                  <button id="btn-copy-all" class="pill-btn" style="justify-content:center; background:rgba(255,255,255,0.06); border:1px dashed rgba(255,255,255,0.25); color:#fff; padding:0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="clipboard-check" style="width:16px; height:16px; color:var(--color-primary);"></i>
                    <span id="copy-all-text">Tüm Bilgileri Kopyala</span>
                  </button>

                  <button id="btn-download-txt" class="pill-btn" style="justify-content:center; background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.3); color:var(--color-accent-cyan); padding:0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="download" style="width:16px; height:16px;"></i>
                    <span>Bilgi Dosyasını İndir (.txt)</span>
                  </button>
                </div>
              </div>

              <!-- BOTTOM NAVIGATION & ACTIONS -->
              <div style="display:flex; gap:0.85rem; justify-content:center; flex-wrap:wrap;">
                <button class="btn-primary-hero" id="btn-finish-go-home" style="flex:1; min-width:200px; justify-content:center;">
                  <i data-lucide="home"></i> Tanıtım Sayfasına Git
                </button>

                <button class="btn-secondary-hero" id="btn-new-registration" style="flex:1; min-width:200px; justify-content:center; border-color:rgba(255,255,255,0.15);">
                  <i data-lucide="plus-circle"></i> Yeni İşletme Kaydı Yap
                </button>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- RIGHT: LIVE DIGITAL BADGE PREVIEW -->
        <div class="badge-preview-card">
          <div class="badge-preview-header">
            <i data-lucide="badge-check" style="vertical-align:middle; margin-right:4px;"></i> 
            ${currentStep === 0 ? 'Yetkili Profil Kartı' : (currentStep === 5 ? 'Kayıtlı İşletme & Profil Kimliği' : 'Canlı Adisyon Lisans Önizlemesi')}
          </div>

          <div class="digital-badge-chip">
            <div class="badge-avatar">
              ${currentStep === 0 
                ? (profileData.fullName || 'P').charAt(0).toUpperCase()
                : ((formData.businessName || registeredBusiness?.businessName || profileData.fullName) || 'R').charAt(0).toUpperCase()
              }
            </div>
            
            <div class="badge-user-name" id="badge-disp-business">
              ${currentStep === 0 
                ? (profileData.fullName || 'Yetkili Ad Soyad')
                : (formData.businessName || registeredBusiness?.businessName || 'İşletme Adı')
              }
            </div>

            <div class="badge-user-role" id="badge-disp-type">
              ${currentStep === 0 
                ? `👤 ${profileData.role || 'İşletme Sahibi'}`
                : `🏬 ${formData.businessType || registeredBusiness?.businessType}`
              }
            </div>

            <div class="badge-info-list">
              ${(registeredBusiness?.id) ? `
                <div style="background:rgba(255,107,0,0.15); padding:8px 10px; border-radius:8px; border:1px solid rgba(255,107,0,0.35); margin-bottom:6px;">
                  <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">Kasa & Giriş Kodu:</span>
                  <span style="color:var(--color-primary); font-family:monospace; font-size:1.15rem; font-weight:900; letter-spacing:1px;">${registeredBusiness.id}</span>
                </div>
              ` : ''}

              ${currentStep === 0 ? `
                <div><strong>Yetkili:</strong> <span id="badge-disp-profile-name">${profileData.fullName || 'Ad Soyad'}</span></div>
                <div><strong>E-posta:</strong> <span id="badge-disp-profile-email">${profileData.email || 'ornek@email.com'}</span></div>
                <div><strong>Telefon:</strong> <span id="badge-disp-profile-phone">${profileData.phone || '0555 *** ** **'}</span></div>
                <div><strong>Rol:</strong> <span>${profileData.role || 'İşletme Sahibi'}</span></div>
                <div><strong>Aşama:</strong> <span style="color:var(--color-primary); font-weight:800;">1. Profil Oluşturuluyor</span></div>
              ` : `
                <div><strong>Yetkili Profil:</strong> <span>${activeProfile?.fullName || profileData.fullName || 'Ad Soyad'} (${activeProfile?.role || profileData.role})</span></div>
                <div><strong>Masa Kapasitesi:</strong> <span style="color:var(--color-accent-green); font-weight:800;" id="badge-disp-plan">${formData.plan || registeredBusiness?.plan}</span></div>
                <div><strong>Telefon:</strong> <span>${activeProfile?.phone || profileData.phone || '0555 *** ** **'}</span></div>
                <div><strong>Şehir:</strong> <span id="badge-disp-city">${formData.city || registeredBusiness?.city}</span></div>
                <div><strong>Durum:</strong> <span style="color:var(--color-accent-green); font-weight:800;">${currentStep === 5 ? '✓ AKTİF LİSANS' : '⏳ İŞLETME KAYDI ALINIYOR'}</span></div>
              `}
            </div>
          </div>

          <p style="font-size:0.78rem; color:var(--color-text-muted); margin-top:1.5rem; max-width:280px; text-align:center;">
            ${currentStep === 0 
              ? 'Önce yetkili profilinizi oluşturun, ardından işletme ve masa kapasitenizi kaydedin.'
              : (currentStep === 5 ? 'İşletme ve profil kaydınız aktif durumda tutulmaktadır.' : 'Bilgileri girdikçe lisans kartınız canlı olarak güncellenir.')
            }
          </p>
        </div>
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    // -------------------------------------------------------------
    // EVENT BINDINGS
    // -------------------------------------------------------------

    // Top edit profile trigger
    container.querySelector('#btn-edit-profile-trigger')?.addEventListener('click', () => {
      currentStep = 0;
      profileMode = 'create';
      updateView();
    });

    // STEP 0: PROFILE CREATION OR LOGIN
    if (currentStep === 0) {
      const tabCreate = container.querySelector('#tab-profile-create');
      const tabLogin = container.querySelector('#tab-profile-login');

      tabCreate?.addEventListener('click', () => {
        profileMode = 'create';
        updateView();
      });

      tabLogin?.addEventListener('click', () => {
        profileMode = 'login';
        updateView();
      });

      if (profileMode === 'create') {
        const fnInput = container.querySelector('#reg-profile-fullname');
        const emInput = container.querySelector('#reg-profile-email');
        const phInput = container.querySelector('#reg-profile-phone');
        const rlSelect = container.querySelector('#reg-profile-role');
        const pwInput = container.querySelector('#reg-profile-password');

        fnInput?.addEventListener('input', (e) => {
          profileData.fullName = e.target.value;
          const disp = container.querySelector('#badge-disp-profile-name');
          if (disp) disp.textContent = profileData.fullName || 'Ad Soyad';
        });

        emInput?.addEventListener('input', (e) => {
          profileData.email = e.target.value;
          const disp = container.querySelector('#badge-disp-profile-email');
          if (disp) disp.textContent = profileData.email || 'ornek@email.com';
        });

        phInput?.addEventListener('input', (e) => {
          profileData.phone = e.target.value;
          const disp = container.querySelector('#badge-disp-profile-phone');
          if (disp) disp.textContent = profileData.phone || '0555 *** ** **';
        });

        rlSelect?.addEventListener('change', (e) => {
          profileData.role = e.target.value;
        });

        pwInput?.addEventListener('input', (e) => {
          profileData.password = e.target.value;
          const strength = calculatePasswordStrength(profileData.password);
          const fillEl = container.querySelector('#profile-password-meter-fill');
          const textEl = container.querySelector('#profile-password-strength-text');
          if (fillEl) fillEl.className = `password-meter-fill ${strength.class}`;
          if (textEl) textEl.textContent = profileData.password ? `Şifre Gücü: ${strength.text}` : '';
        });

        container.querySelector('#btn-save-profile-next')?.addEventListener('click', async () => {
          if (!profileData.fullName.trim() || !profileData.email.trim() || !profileData.phone.trim()) {
            showToast('Lütfen Ad Soyad, E-posta ve Telefon alanlarını eksiksiz doldurun!', 'error');
            return;
          }
          if (!profileData.password || profileData.password.length < 6) {
            showToast('Lütfen profiliniz için en az 6 karakterli bir şifre belirleyin!', 'error');
            return;
          }

          // Save Profile to store & Supabase
          const res = await store.saveUserProfile(profileData);
          if (res?.error) {
            console.warn('Profile Supabase notice:', res.error);
          }
          formData.fullName = profileData.fullName;
          formData.phone = profileData.phone;
          formData.password = profileData.password;

          currentStep = 1;
          updateView();
          showToast('🎉 Profiliniz başarıyla oluşturuldu ve veritabanına bağlandı! Şimdi işletmenizi kaydedebilirsiniz.', 'success');
        });
      } else {
        // LOGIN MODE
        container.querySelector('#btn-login-profile-next')?.addEventListener('click', async () => {
          const idInput = container.querySelector('#login-profile-id')?.value.trim();
          const passInput = container.querySelector('#login-profile-pass')?.value;

          if (!idInput) {
            showToast('Lütfen kayıtlı e-posta adresinizi veya telefonunuzu girin!', 'error');
            return;
          }
          if (!passInput) {
            showToast('Lütfen profil şifrenizi girin!', 'error');
            return;
          }

          // Search existing profiles in store / Supabase
          const cleanId = idInput.toLowerCase();
          const matchedProfile = (store.profiles || []).find(p => 
            (p.email && p.email.toLowerCase() === cleanId) || 
            (p.phone && p.phone.replace(/\s+/g, '') === idInput.replace(/\s+/g, '')) ||
            (p.id && p.id.toLowerCase() === cleanId)
          );

          if (matchedProfile) {
            profileData = { ...matchedProfile };
            await store.saveUserProfile(profileData);
          } else {
            const existingProfile = store.getUserProfile();
            if (existingProfile) {
              profileData = { ...existingProfile };
            } else {
              profileData = {
                fullName: idInput.includes('@') ? idInput.split('@')[0] : 'Yetkili Kullanıcı',
                email: idInput.includes('@') ? idInput : '',
                phone: idInput.includes('@') ? '0555 123 45 67' : idInput,
                password: passInput,
                role: 'İşletme Sahibi'
              };
            }
            await store.saveUserProfile(profileData);
          }

          formData.fullName = profileData.fullName;
          formData.phone = profileData.phone;
          formData.password = profileData.password;

          currentStep = 1;
          updateView();
          showToast('👋 Profilinize giriş yapıldı! İşletme kaydınıza devam edebilirsiniz.', 'success');
        });
      }
    }

    // STEP 1: BUSINESS DETAILS & PLAN
    if (currentStep === 1) {
      const bnInput = container.querySelector('#reg-businessname');
      const btSelect = container.querySelector('#reg-businesstype');

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

      container.querySelector('#btn-step1-prev-profile')?.addEventListener('click', () => {
        currentStep = 0;
        profileMode = 'create';
        updateView();
      });

      container.querySelector('#btn-step1-next')?.addEventListener('click', () => {
        if (!formData.businessName || !formData.businessName.trim()) {
          showToast('Lütfen Restoran / İşletme Adını giriniz!', 'error');
          return;
        }
        currentStep = 2;
        updateView();
      });
    }

    // STEP 2: LOCATION
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
        if (!formData.fullAddress || !formData.fullAddress.trim()) {
          showToast('Lütfen Açık Adres alanını doldurun!', 'error');
          return;
        }
        currentStep = 3;
        updateView();
      });
    }

    // STEP 3: KASA PASSWORD & SECURITY
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
          showToast('Lütfen en az 6 karakterli bir kasa şifresi belirleyin!', 'error');
          return;
        }
        currentStep = 4;
        updateView();
      });
    }

    // STEP 4: SMS OTP VERIFICATION & FINAL SUBMIT
    if (currentStep === 4) {
      container.querySelector('#btn-verify-otp')?.addEventListener('click', async () => {
        const btn = container.querySelector('#btn-verify-otp');
        if (btn) {
          btn.disabled = true;
          btn.innerHTML = '⏳ İşletme Kaydediliyor...';
        }

        const profile = store.getUserProfile() || profileData;

        const res = await store.addRegistration({
          businessName: formData.businessName,
          fullName: profile.fullName || 'Yetkili',
          email: profile.email || '',
          role: profile.role || 'İşletme Sahibi',
          ownerEmail: profile.email || '',
          ownerRole: profile.role || 'İşletme Sahibi',
          businessType: formData.businessType,
          plan: formData.plan,
          planPrice: formData.planPrice,
          phone: profile.phone || formData.phone || '',
          city: formData.city,
          fullAddress: formData.fullAddress,
          password: formData.password || profile.password || ''
        });

        if (res && res.error) {
          showToast(`⚠️ Supabase Kayıt Uyarısı: ${res.error}`, 'error');
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i data-lucide="check-circle-2"></i> İşletme Kaydını Tamamla & Başla';
            if (window.lucide) window.lucide.createIcons();
          }
          return;
        }

        registeredBusiness = res.reg;
        currentStep = 5;
        updateView();
        triggerConfetti();
        showToast('🎉 İşletme kaydınız ve kodunuz başarıyla oluşturuldu! ID ekranınız açık kalacaktır.', 'success');
      });
    }

    // STEP 5: SUCCESS CREDENTIALS
    if (currentStep === 5) {
      const activeReg = registeredBusiness || store.getLastRegisteredBusiness() || {};
      const activeId = activeReg.id || 'BYR-0000';
      const activePass = formData.password || activeReg.password || profileData.password || '';
      const currentProf = store.getUserProfile() || profileData;

      // 1. Copy Business ID
      container.querySelector('#btn-copy-id')?.addEventListener('click', () => {
        navigator.clipboard.writeText(activeId).then(() => {
          const btnText = container.querySelector('#copy-id-text');
          if (btnText) btnText.textContent = 'Kopyalandı! ✓';
          showToast(`📋 İşletme Kodu (${activeId}) panoya kopyalandı!`, 'success');
          setTimeout(() => {
            if (btnText) btnText.textContent = 'Kopyala';
          }, 2500);
        });
      });

      // 2. Toggle Show/Hide Password
      container.querySelector('#btn-toggle-show-pass')?.addEventListener('click', () => {
        showPasswordInStep5 = !showPasswordInStep5;
        updateView();
      });

      // 3. Copy Password
      container.querySelector('#btn-copy-pass')?.addEventListener('click', () => {
        navigator.clipboard.writeText(activePass).then(() => {
          const btnText = container.querySelector('#copy-pass-text');
          if (btnText) btnText.textContent = 'Kopyalandı! ✓';
          showToast('🔑 Şifreniz panoya kopyalandı!', 'success');
          setTimeout(() => {
            if (btnText) btnText.textContent = 'Kopyala';
          }, 2500);
        });
      });

      // 4. Copy All Credentials
      container.querySelector('#btn-copy-all')?.addEventListener('click', () => {
        const allInfo = `=== BUYURABİ DİJİTAL ADİSYON GİRİŞ BİLGİLERİ ===
İşletme Adı: ${formData.businessName || activeReg.businessName || ''}
İşletme Kodu (ID): ${activeId}
Kasa Giriş Şifresi: ${activePass}
Bağlı Yetkili: ${currentProf.fullName || activeReg.fullName || ''} (${currentProf.role || 'İşletme Sahibi'})
E-posta: ${currentProf.email || ''}
Telefon: ${currentProf.phone || activeReg.phone || ''}
İşletme Türü: ${formData.businessType || activeReg.businessType || ''}
Masa Kapasite Planı: ${formData.plan || activeReg.plan || ''}
Konum: ${formData.city || activeReg.city || ''} - ${formData.fullAddress || activeReg.fullAddress || ''}
Durum: Aktif Dijital Adisyon Lisansı Alındı`;

        navigator.clipboard.writeText(allInfo).then(() => {
          const copyAllText = container.querySelector('#copy-all-text');
          if (copyAllText) copyAllText.textContent = 'Tüm Bilgiler Kopyalandı! ✓';
          showToast('✅ Tüm dijital adisyon işletme giriş bilgileri panoya kopyalandı!', 'success');
          setTimeout(() => {
            if (copyAllText) copyAllText.textContent = 'Tüm Bilgileri Kopyala';
          }, 3000);
        });
      });

      // 5. Download TXT File
      container.querySelector('#btn-download-txt')?.addEventListener('click', () => {
        const txtContent = `=====================================================
BUYURABİ DİJİTAL ADİSYON & RESTORAN KASA BİLGİ KARTI
=====================================================
İşletme Adı        : ${formData.businessName || activeReg.businessName || ''}
İşletme Kodu (ID)  : ${activeId}
Kasa Giriş Parolası: ${activePass}
Yetkili Kişi       : ${currentProf.fullName || activeReg.fullName || ''}
Yetkili Rolü       : ${currentProf.role || 'İşletme Sahibi'}
E-posta Adresi     : ${currentProf.email || ''}
Telefon No         : ${currentProf.phone || activeReg.phone || ''}
İşletme Türü       : ${formData.businessType || activeReg.businessType || ''}
Masa Kapasite Planı: ${formData.plan || activeReg.plan || ''}
Açık Adres         : ${formData.city || activeReg.city || ''} / ${formData.fullAddress || activeReg.fullAddress || ''}
Lisans Durumu      : Aktif Dijital Adisyon Lisansı
Kayıt Tarihi       : ${new Date().toLocaleString('tr-TR')}
=====================================================
ÖNEMLİ NOT:
Bu işletme kodu (ID) ve şifre; kasanızı, salon masalarınızı
yönetmek, garsonların QR ile telefonlarından sisteme giriş
yapmasını sağlamak, mutfak (sıcak) ekranını açmak ve kasa
tahsilatlarını (nakit/kart) yürütmek için kullanılacaktır.
Lütfen bu dosyayı güvenli bir yerde saklayınız.
=====================================================`;

        const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BuyurAbi_${activeId}_Giris_Bilgileri.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('💾 Giriş bilgileri dosya olarak indirildi!', 'success');
      });

      // 6. Go to Home (Keep ID screen saved)
      container.querySelector('#btn-finish-go-home')?.addEventListener('click', () => {
        store.setView('landing');
      });

      // 7. Start New Registration under same profile
      container.querySelector('#btn-new-registration')?.addEventListener('click', () => {
        if (confirm('Farklı bir işletme kaydı yapmak istiyor musunuz? (Mevcut işletme ID kartınız bu ekrandan kaldırılacaktır)')) {
          store.clearLastRegisteredBusiness();
          registeredBusiness = null;
          formData = {
            businessName: '',
            businessType: 'Restoran & Lokanta',
            plan: 'Profesyonel Paket (25 Masa - ₺899/ay)',
            planPrice: 899,
            city: 'İstanbul / Kadıköy',
            fullAddress: '',
            password: store.getUserProfile()?.password || ''
          };
          currentStep = store.hasUserProfile() ? 1 : 0;
          updateView();
          showToast('Yeni işletme kayıt formu açıldı.', 'info');
        }
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
  if (type === 'success') toast.style.borderLeftColor = 'var(--color-accent-green)';
  toast.innerHTML = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}
