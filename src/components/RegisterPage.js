import { store } from '../state/store.js';
import { TURKEY_CITIES, getDistrictsByCity } from '../data/turkeyLocations.js';

export function renderRegisterPage(container) {
  const savedLastReg = store.getLastRegisteredBusiness();
  const savedProfile = store.getUserProfile();

  // If business already registered: step 4 (Success/Status). If profile exists: step 1. Else: step 0 (profile creation).
  let currentStep = savedLastReg ? 4 : (savedProfile ? 1 : 0);
  let registeredBusiness = savedLastReg || null;
  let showPasswordInStep4 = false;
  let profileMode = 'create'; // 'create' | 'login'

  let profileData = {
    fullName: savedProfile?.fullName || '',
    email: savedProfile?.email || '',
    phone: savedProfile?.phone || '',
    password: savedProfile?.password || '',
    role: savedProfile?.role || 'İşletme Sahibi'
  };

  const availablePlans = store.getPricingPlans();
  const defaultPlanObj = availablePlans.find(p => p.popular) || availablePlans[0];
  const defaultPlanTitle = defaultPlanObj ? `${defaultPlanObj.name} (${defaultPlanObj.badge || ''} - ₺${defaultPlanObj.price}${defaultPlanObj.period || '/ay'})` : 'Profesyonel Paket (25 Masa - ₺899/ay)';
  const defaultPlanPrice = defaultPlanObj ? defaultPlanObj.price : 899;

  // Check if user clicked a plan from Landing Page
  const preSelected = sessionStorage.getItem('buyurabi_selected_plan');
  let parsedPreSelect = null;
  if (preSelected) {
    try {
      parsedPreSelect = JSON.parse(preSelected);
      sessionStorage.removeItem('buyurabi_selected_plan');
    } catch (e) {}
  }

  let initialCity = 'İstanbul';
  let initialDistrict = 'Kadıköy';
  if (savedLastReg?.city) {
    if (savedLastReg.city.includes(' / ')) {
      const parts = savedLastReg.city.split(' / ');
      initialCity = parts[0]?.trim() || 'İstanbul';
      initialDistrict = parts[1]?.trim() || (getDistrictsByCity(initialCity)[0] || '');
    } else {
      initialCity = savedLastReg.city.trim();
      initialDistrict = savedLastReg.district || (getDistrictsByCity(initialCity)[0] || '');
    }
  }

  let formData = {
    businessName: savedLastReg?.businessName || '',
    businessType: savedLastReg?.businessType || 'Restoran & Lokanta',
    plan: parsedPreSelect?.plan || savedLastReg?.plan || defaultPlanTitle,
    planPrice: parsedPreSelect?.price || savedLastReg?.planPrice || defaultPlanPrice,
    city: initialCity,
    district: initialDistrict,
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
    if (currentStep === 1) return 33;
    if (currentStep === 2) return 66;
    return 100;
  }

  function updateView() {
    const activeProfile = store.getUserProfile();

    container.innerHTML = `
      <div class="register-container-layout">
        <!-- LEFT: WIZARD FORM -->
        <div class="register-wizard-card">
          <!-- Step Progress Node Header (4 Steps: Profil, İşletme, Adres, Şifre & Kayıt) -->
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
            <div class="step-node ${currentStep === 3 ? 'active' : (currentStep > 3 ? 'completed' : '')}" title="4. Kasa Şifresi & Kayıt">
              ${currentStep > 3 ? '✓' : '4'}
            </div>
          </div>

          <!-- ACTIVE PROFILE BANNER (WHEN PROFILE EXISTS & IN BUSINESS STEPS 1-3) -->
          ${activeProfile && currentStep >= 1 && currentStep < 4 ? `
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

          <!-- STEP 0: YETKİLİ PROFİLİ OLUŞTUR / GİRİŞ YAP (KURUMSAL PANEL) -->
          ${currentStep === 0 ? `
            <div class="corporate-auth-header">
              <div class="corporate-badge-tag">
                <i data-lucide="shield-check" style="width:14px; height:14px;"></i>
                <span>BuyurAbi Kurumsal Yetkili Portalı</span>
              </div>
              <h2 class="wizard-title" style="margin:0 0 0.4rem 0;">Yetkili Hesabı & Güvenli Giriş</h2>
              <p class="wizard-subtitle" style="margin-bottom:1.4rem;">Restoranınızı sisteme kaydetmek, sipariş ve kasa adisyonlarını yönetmek için yetkili profilinizi oluşturun veya hesabınıza giriş yapın.</p>
            </div>

            <!-- PROFILE MODE TABS (YENİ PROFİL / MEVCUT HESABA GİRİŞ) -->
            <div class="profile-mode-tabs corporate-tabs">
              <button class="profile-tab-btn ${profileMode === 'create' ? 'active' : ''}" id="tab-profile-create">
                <i data-lucide="user-plus" style="width:16px; height:16px;"></i> Yeni Yetkili Profili Aç
              </button>
              <button class="profile-tab-btn ${profileMode === 'login' ? 'active' : ''}" id="tab-profile-login">
                <i data-lucide="log-in" style="width:16px; height:16px;"></i> Kayıtlı Hesaba Giriş Yap
              </button>
            </div>

            ${profileMode === 'create' ? `
              <div class="corporate-form-container">
                <div class="form-group-row">
                  <div class="form-field">
                    <label class="form-label"><i data-lucide="user"></i> Yetkili Ad Soyad *</label>
                    <input type="text" id="reg-profile-fullname" class="form-input corporate-input" placeholder="Örn: Mehmet Ali Öztürk" value="${profileData.fullName}">
                  </div>

                  <div class="form-field">
                    <label class="form-label"><i data-lucide="mail"></i> Kurumsal E-posta Adresi *</label>
                    <input type="email" id="reg-profile-email" class="form-input corporate-input" placeholder="yetkili@restoran.com" value="${profileData.email}">
                  </div>
                </div>

                <div class="form-group-row">
                  <div class="form-field">
                    <label class="form-label"><i data-lucide="phone"></i> İletişim & Onay Cep Telefonu *</label>
                    <input type="tel" id="reg-profile-phone" class="form-input corporate-input" placeholder="0555 123 45 67" value="${profileData.phone}">
                  </div>

                  <div class="form-field">
                    <label class="form-label"><i data-lucide="briefcase"></i> İşletmedeki Ünvan / Rol *</label>
                    <select id="reg-profile-role" class="form-input corporate-input">
                      <option value="İşletme Sahibi" ${profileData.role === 'İşletme Sahibi' ? 'selected' : ''}>👑 İşletme Sahibi / Kurucu</option>
                      <option value="Restoran Müdürü" ${profileData.role === 'Restoran Müdürü' ? 'selected' : ''}>👔 Restoran Genel Müdürü</option>
                      <option value="İş Ortağı" ${profileData.role === 'İş Ortağı' ? 'selected' : ''}>🤝 İş Ortağı / Hissedar</option>
                      <option value="Operasyon Yöneticisi" ${profileData.role === 'Operasyon Yöneticisi' ? 'selected' : ''}>⭐ Kasa & Operasyon Sorumlusu</option>
                    </select>
                  </div>
                </div>

                <div class="form-field" style="margin-bottom:1.4rem;">
                  <label class="form-label"><i data-lucide="lock"></i> Profil Şifresi Belirleyin *</label>
                  <input type="password" id="reg-profile-password" class="form-input corporate-input" placeholder="En az 6 karakterli kurumsal şifre" value="${profileData.password}">
                  
                  <div class="password-meter" style="margin-top:0.6rem;">
                    <div id="profile-password-meter-fill" class="password-meter-fill ${calculatePasswordStrength(profileData.password).class}"></div>
                  </div>
                  <div id="profile-password-strength-text" style="font-size:0.8rem; font-weight:700; margin-top:4px; text-align:right; color:var(--color-text-muted);">
                    ${profileData.password ? `Şifre Gücü: ${calculatePasswordStrength(profileData.password).text}` : ''}
                  </div>
                </div>

                <!-- TRUST BADGES -->
                <div class="corporate-trust-banner">
                  <div class="trust-badge-item">
                    <i data-lucide="shield-check" style="color:var(--color-accent-green);"></i>
                    <span>256-Bit SSL Şifreleme</span>
                  </div>
                  <div class="trust-badge-item">
                    <i data-lucide="database" style="color:var(--color-accent-cyan);"></i>
                    <span>Supabase Bulut Güvencesi</span>
                  </div>
                  <div class="trust-badge-item">
                    <i data-lucide="file-check-2" style="color:var(--color-primary);"></i>
                    <span>KVKK Uyumlu</span>
                  </div>
                </div>

                <div style="background:rgba(255,255,255,0.03); padding:0.9rem 1.1rem; border-radius:var(--radius-md); border:1px solid rgba(255,255,255,0.07); margin-bottom:1.5rem;">
                  <label style="display:flex; align-items:center; gap:0.6rem; font-size:0.83rem; color:var(--color-text-muted); cursor:pointer;">
                    <input type="checkbox" id="profile-terms" checked style="accent-color:var(--color-primary); width:18px; height:18px;">
                    <span><strong style="color:#fff;">BuyurAbi Kullanıcı Sözleşmesi ve Hizmet Şartlarını</strong> okudum, onaylıyorum.</span>
                  </label>
                </div>

                <button class="btn-primary-hero" id="btn-save-profile-next" style="width:100%; justify-content:center; padding:1.1rem;">
                  <i data-lucide="user-check"></i> Yetkili Profilini Kaydet & İşletme Adımına Geç <i data-lucide="arrow-right"></i>
                </button>
              </div>
            ` : `
              <!-- LOGIN WITH EXISTING PROFILE (CORPORATE) -->
              <div class="corporate-form-container">
                <div style="background:rgba(0,229,255,0.06); border:1px solid rgba(0,229,255,0.25); border-radius:var(--radius-md); padding:0.85rem 1.1rem; margin-bottom:1.4rem; display:flex; align-items:center; gap:0.75rem;">
                  <i data-lucide="key-round" style="color:var(--color-accent-cyan); width:20px; height:20px; flex-shrink:0;"></i>
                  <span style="font-size:0.82rem; color:var(--color-text-main);">
                    Daha önce kayıt olduysanız e-posta veya cep telefonunuzla giriş yaparak işletme başvurularınızı yönetebilirsiniz.
                  </span>
                </div>

                <div class="form-field" style="margin-bottom:1.2rem;">
                  <label class="form-label"><i data-lucide="mail"></i> Kayıtlı E-posta veya Cep Telefonu</label>
                  <input type="text" id="login-profile-id" class="form-input corporate-input" placeholder="ahmet@gmail.com veya 0555 123 45 67" value="${profileData.email || profileData.phone}">
                </div>

                <div class="form-field" style="margin-bottom:1.5rem;">
                  <label class="form-label"><i data-lucide="lock"></i> Profil Şifreniz</label>
                  <input type="password" id="login-profile-pass" class="form-input corporate-input" placeholder="Profil şifrenizi girin">
                </div>

                <button class="btn-primary-hero" id="btn-login-profile-next" style="width:100%; justify-content:center; padding:1.1rem;">
                  <i data-lucide="log-in"></i> Güvenli Giriş Yap & İşletme Kaydına Devam Et <i data-lucide="arrow-right"></i>
                </button>
              </div>
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

            <!-- MASA EKLEME İÇİN PLAN SEÇİMİ (DİNAMİK) -->
            <div style="margin-bottom:1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.6rem;">
                <label class="form-label" style="margin:0;"><i data-lucide="credit-card"></i> Masa Eklemek İçin Kullanım Planı Seçin</label>
                <span style="font-size:0.75rem; color:var(--color-accent-green); font-weight:700;">Esnek Masa Kapasitesi</span>
              </div>
              
              <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:0.85rem;">
                ${store.getPricingPlans().map((plan, idx) => {
                  const medal = idx === 0 ? '🥉' : (idx === 1 ? '🥈' : '🥇');
                  const planTitle = `${plan.name} (${plan.badge || ''} - ₺${plan.price}${plan.period || '/ay'})`;
                  const isSelected = formData.planPrice === plan.price || formData.plan === planTitle;
                  const priceColor = idx === 0 ? 'var(--color-primary)' : (idx === 1 ? 'var(--color-accent-green)' : 'var(--color-accent-cyan)');

                  return `
                    <div class="role-select-card ${isSelected ? 'selected' : ''}" data-plan="${planTitle}" data-price="${plan.price}" style="padding:1rem 0.6rem; position:relative; cursor:pointer;">
                      ${plan.popular ? `
                        <div style="position:absolute; top:-10px; right:10px; background:var(--color-primary); color:#fff; font-size:0.6rem; font-weight:800; padding:2px 6px; border-radius:10px;">POPÜLER</div>
                      ` : ''}
                      <div style="font-size:1.2rem; margin-bottom:4px;">${medal}</div>
                      <strong style="font-size:0.88rem; color:#fff; display:block;">${plan.name}</strong>
                      <span style="font-size:0.75rem; color:var(--color-text-muted); display:block; margin:2px 0;">${plan.badge || ''}</span>
                      <div style="margin-top:4px;">
                        ${plan.hasDiscount && plan.originalPrice > plan.price ? `
                          <div style="display:flex; align-items:center; gap:4px; margin-bottom:2px;">
                            <span style="font-size:0.72rem; color:var(--color-text-dim); text-decoration:line-through; font-weight:700;">
                              ₺${Number(plan.originalPrice).toLocaleString('tr-TR')}
                            </span>
                            <span style="background:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); font-size:0.6rem; font-weight:800; padding:1px 5px; border-radius:6px;">
                              ${plan.discountBadge || 'İNDİRİM'}
                            </span>
                          </div>
                        ` : ''}
                        <span style="font-size:0.95rem; font-weight:800; color:${priceColor};">₺${Number(plan.price).toLocaleString('tr-TR')} <span style="font-size:0.7rem; color:var(--color-text-muted);">${plan.period || '/ay'}</span></span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="wizard-btn-row">
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
            <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.4rem;">
              <div style="width:40px; height:40px; background:rgba(0,229,255,0.15); color:var(--color-accent-cyan); border-radius:var(--radius-md); display:flex; align-items:center; justify-content:center;">
                <i data-lucide="map-pin" style="width:24px; height:24px;"></i>
              </div>
              <h2 class="wizard-title" style="margin:0;">İşletme Konumu & Açık Adres</h2>
            </div>
            <p class="wizard-subtitle">Restoranınızın bulunduğu ili (81 İl) ve ilçeyi seçin, açık adresinizi girin.</p>

            <div class="form-group-row">
              <div class="form-field">
                <label class="form-label"><i data-lucide="map"></i> İl / Şehir Seçin *</label>
                <select id="reg-city" class="form-input corporate-input">
                  <option value="" disabled ${!formData.city ? 'selected' : ''}>-- İl Seçiniz (81 İl) --</option>
                  ${TURKEY_CITIES.map(c => `
                    <option value="${c}" ${formData.city === c ? 'selected' : ''}>${c}</option>
                  `).join('')}
                </select>
              </div>

              <div class="form-field">
                <label class="form-label"><i data-lucide="navigation"></i> İlçe Seçin *</label>
                <select id="reg-district" class="form-input corporate-input" ${!formData.city ? 'disabled' : ''}>
                  <option value="" disabled ${!formData.district ? 'selected' : ''}>-- İlçe Seçiniz --</option>
                  ${getDistrictsByCity(formData.city).map(d => `
                    <option value="${d}" ${formData.district === d ? 'selected' : ''}>${d}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-field">
              <label class="form-label"><i data-lucide="home"></i> Açık Adres (Cadde, Sokak, Kapı No, Tarif) *</label>
              <textarea id="reg-fulladdress" class="form-input corporate-input" rows="3" placeholder="Örn: Caferağa Mah. Moda Cad. No:84/A (Tiyatronun karşısı)">${formData.fullAddress}</textarea>
            </div>

            <div class="wizard-btn-row">
              <button class="btn-secondary-hero" id="btn-step2-prev">
                <i data-lucide="arrow-left"></i> İşletme Bilgileri
              </button>
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

            <div class="wizard-btn-row">
              <button class="btn-secondary-hero" id="btn-step3-prev">Geri</button>
              <button class="btn-primary-hero" id="btn-step3-submit" style="flex:1; justify-content:center;">
                <i data-lucide="check-circle-2"></i> İşletme Kaydını Tamamla & Başla
              </button>
            </div>
          ` : ''}

          <!-- STEP 4: SUCCESS EKRANI & GİRİŞ BİLGİLERİ (ADMİN ONAY KONTROLLÜ) -->
          ${currentStep === 4 ? `
            ${(() => {
              const activeReg = registeredBusiness || store.getLastRegisteredBusiness() || {};
              const isApproved = activeReg.status === 'onaylandi';
              const isRejected = activeReg.status === 'reddedildi';
              const isPending = !isApproved && !isRejected;

              return `
                <div style="text-align:center; padding:0.5rem 0;">
                  <div style="width:74px; height:74px; background:${isApproved ? 'rgba(0,230,118,0.15)' : (isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)')}; color:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 1rem auto; border:2px solid ${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; box-shadow:0 0 35px ${isApproved ? 'rgba(0,230,118,0.35)' : (isRejected ? 'rgba(239,68,68,0.35)' : 'rgba(245,158,11,0.35)')};">
                    <i data-lucide="${isApproved ? 'check-check' : (isRejected ? 'x-circle' : 'clock')}" style="width:42px; height:42px;"></i>
                  </div>

                  <h2 class="wizard-title" style="color:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; font-size:1.8rem; margin-bottom:0.3rem;">
                    ${isApproved ? 'Dijital Adisyon Lisansınız Onaylandı! 🎉' : (isRejected ? 'İşletme Başvurunuz Reddedildi ❌' : 'İşletme Başvurunuz Alındı! ⏳')}
                  </h2>
                  <p class="wizard-subtitle" style="max-width:580px; margin:0 auto 1.2rem auto; font-size:0.95rem;">
                    ${isApproved 
                      ? `<strong>${activeReg.businessName || 'İşletmeniz'}</strong> için yetkili onayı tamamlanmış ve kasa lisans kodunuz aktif edilmiştir.` 
                      : (isRejected
                        ? `<strong>${activeReg.businessName || 'İşletmeniz'}</strong> başvurusu yönetici tarafından reddedilmiştir. Lütfen bilgilerinizi kontrol ederek tekrar işletme kaydı yapınız.`
                        : `<strong>${activeReg.businessName || 'İşletmeniz'}</strong> için başvurunuz alındı. <strong>Admin onayından sonra işletme kodunuz aktif olacaktır.</strong> Durumunuzu sağ üstteki <strong>"Başvurularım"</strong> sekmesinden takip edebilirsiniz.`
                      )
                    }
                  </p>

                  <!-- PERSISTENT NOTICE BANNER -->
                  <div style="background:${isApproved ? 'rgba(0,230,118,0.1)' : (isRejected ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.1)')}; border:1px solid ${isApproved ? 'rgba(0,230,118,0.35)' : (isRejected ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.35)')}; border-radius:var(--radius-md); padding:0.85rem 1.2rem; margin-bottom:1.5rem; text-align:left; display:flex; align-items:center; gap:0.85rem;">
                    <i data-lucide="${isApproved ? 'shield-check' : (isRejected ? 'alert-triangle' : 'alert-circle')}" style="width:28px; height:28px; color:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; flex-shrink:0;"></i>
                    <div style="font-size:0.86rem; color:var(--color-text-main); line-height:1.4;">
                      ${isApproved 
                        ? `<strong style="color:var(--color-accent-green); display:block; margin-bottom:2px;">📌 Lisansınız Onaylandı ve Kullanıma Hazır</strong>Bu işletme kodu ve şifre ile kasanızı, masalarınızı ve garson girişlerinizi hemen başlatabilirsiniz.` 
                        : (isRejected
                          ? `<strong style="color:var(--color-danger); display:block; margin-bottom:2px;">⛔ İşletme Başvurusu Yönetici Tarafından Reddedildi</strong>Bu işletme kaydı yönetici tarafından onaylanmadı. Yeni bir işletme tanımlamak için lütfen aşağıdaki butona tıklayarak <strong>tekrar işletme kaydı yapınız</strong>.`
                          : `<strong style="color:#F59E0B; display:block; margin-bottom:2px;">📌 Yetkili Onayı Bekleniyor (Kod Kilitli)</strong>Sistem güvenliği için işletme lisans kodları yönetici onayından sonra açılmaktadır. Onay verildiğinde kodunuz otomatik olarak aktifleşecektir.`
                        )
                      }
                    </div>
                  </div>

                  ${isRejected ? `
                    <!-- REAPPLY ACTION CARD -->
                    <button class="btn-primary-hero" id="btn-step5-reapply" style="width:100%; justify-content:center; padding:1.05rem; background:linear-gradient(135deg, #EF4444 0%, #DC2626 100%); margin-bottom:1.2rem; font-size:1rem; font-weight:800; box-shadow:0 0 25px rgba(239,68,68,0.4);">
                      <i data-lucide="refresh-cw"></i> Tekrar İşletme Kaydı Yap
                    </button>
                  ` : ''}

                  <!-- CREDENTIALS DISPLAY BOX -->
                  <div class="step5-credentials-box" style="border:1px solid ${isApproved ? 'rgba(0,230,118,0.45)' : (isRejected ? 'rgba(239,68,68,0.45)' : 'rgba(245,158,11,0.45)')}; box-shadow:0 0 30px ${isApproved ? 'rgba(0,230,118,0.15)' : (isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)')};">
                    <div style="position:absolute; top:0; left:0; width:100%; height:4px; background:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : 'linear-gradient(90deg, #F59E0B, #FF6B00)')};"></div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.2rem; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:0.75rem; flex-wrap:wrap; gap:0.5rem;">
                      <div>
                        <span style="font-size:0.72rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-text-muted); font-weight:800;">DİJİTAL ADİSYON İŞLETME KARTI</span>
                        <h4 style="font-size:1.2rem; color:#fff; margin:2px 0 0 0; font-weight:800;">${activeReg.businessName || formData.businessName}</h4>
                      </div>
                      ${isApproved ? `
                        <span style="background:rgba(0,230,118,0.15); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                          ● AKTİF LİSANS ALINDI
                        </span>
                      ` : (isRejected ? `
                        <span style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); color:var(--color-danger); font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                          ❌ BAŞVURU REDDEDİLDİ
                        </span>
                      ` : `
                        <span style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); color:#F59E0B; font-size:0.75rem; font-weight:800; padding:4px 12px; border-radius:12px; display:inline-flex; align-items:center; gap:5px;">
                          ⏳ YÖNETİCİ ONAYI BEKLENİYOR
                        </span>
                      `)}
                    </div>

                    <!-- 1. FIELD: ISLETME KODU (ID) - ADMIN ONAYLAMADAN VERİLMEZ -->
                    <div style="margin-bottom:1.2rem;">
                      <label style="display:block; font-size:0.82rem; color:var(--color-text-muted); font-weight:700; margin-bottom:0.4rem;">
                        <i data-lucide="${isApproved ? 'hash' : (isRejected ? 'x-circle' : 'lock')}" style="width:15px; height:15px; vertical-align:middle; color:${isApproved ? 'var(--color-primary)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')};"></i> 
                        İşletme Kodu (ID) - Kasa & Garson Giriş Kodu:
                      </label>
                      <div class="step5-code-row" style="border:1.5px solid ${isApproved ? 'rgba(255,107,0,0.5)' : (isRejected ? 'rgba(239,68,68,0.4)' : 'rgba(245,158,11,0.4)')};">
                        <span id="display-business-id" style="font-family:monospace; font-size:${isApproved ? '1.6rem' : '1.1rem'}; font-weight:900; color:${isApproved ? 'var(--color-primary)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; letter-spacing:1px; flex:1;">
                          ${isApproved ? (activeReg.id || 'BYR-0000') : (isRejected ? '🔒 Reddedildi (Kod Verilmedi)' : '🔒 Onay Bekleniyor (Admin Onaylayınca Açılacak)')}
                        </span>
                        ${isApproved ? `
                          <button id="btn-copy-id" class="pill-btn" style="background:rgba(255,107,0,0.2); border:1px solid rgba(255,107,0,0.5); color:var(--color-primary); font-weight:800; padding:0.5rem 1rem; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                            <i data-lucide="copy" style="width:15px; height:15px;"></i> <span id="copy-id-text">Kopyala</span>
                          </button>
                        ` : `
                          <button id="btn-check-my-apps-trigger" class="pill-btn" style="background:${isRejected ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.2)'}; border:1px solid ${isRejected ? 'rgba(239,68,68,0.5)' : 'rgba(245,158,11,0.5)'}; color:${isRejected ? 'var(--color-danger)' : '#F59E0B'}; font-weight:800; padding:0.5rem 1rem; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                            <i data-lucide="${isRejected ? 'clipboard-list' : 'clock'}" style="width:14px; height:14px;"></i> Durumu Gör
                          </button>
                        `}
                      </div>
                    </div>

                    <!-- 2. FIELD: SIFRE -->
                    <div style="margin-bottom:1.2rem;">
                      <label style="display:block; font-size:0.82rem; color:var(--color-text-muted); font-weight:700; margin-bottom:0.4rem;">
                        <i data-lucide="lock" style="width:15px; height:15px; vertical-align:middle; color:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : 'var(--color-text-muted)')};"></i> Kasa & Sistem Giriş Şifreniz:
                      </label>
                      <div class="step5-code-row" style="border:1px solid rgba(255,255,255,0.15);">
                        <span id="display-password" style="font-family:monospace; font-size:1.3rem; font-weight:800; color:${isRejected ? 'var(--color-text-dim)' : '#fff'}; letter-spacing:2px; flex:1;">
                          ${isRejected ? '•••••• (Lisans İptal)' : (showPasswordInStep4 ? (formData.password || activeReg.password || '••••••') : '•'.repeat(Math.max((formData.password || activeReg.password || '123456').length, 6)))}
                        </span>
                        ${!isRejected ? `
                          <button id="btn-toggle-show-pass" class="pill-btn" style="background:rgba(255,255,255,0.08); border:var(--border-glass); color:var(--color-text-muted); padding:0.5rem 0.8rem; font-size:0.82rem; cursor:pointer; border-radius:var(--radius-sm);" title="${showPasswordInStep4 ? 'Gizle' : 'Göster'}">
                            <i data-lucide="${showPasswordInStep4 ? 'eye-off' : 'eye'}" style="width:15px; height:15px;"></i>
                          </button>
                        ` : ''}
                        ${isApproved ? `
                          <button id="btn-copy-pass" class="pill-btn" style="background:rgba(0,230,118,0.18); border:1px solid rgba(0,230,118,0.4); color:var(--color-accent-green); font-weight:800; padding:0.5rem 1rem; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:6px; border-radius:var(--radius-sm);">
                            <i data-lucide="copy" style="width:15px; height:15px;"></i> <span id="copy-pass-text">Kopyala</span>
                          </button>
                        ` : ''}
                      </div>
                    </div>

                    <!-- 3. DETAILS SUMMARY TABLE WITH PROFILE INFO -->
                    <div class="step5-summary-grid">
                      <div><span style="color:var(--color-text-muted);">Yetkili Ad Soyad:</span> <strong style="color:#fff; display:block;">${activeProfile?.fullName || activeReg.fullName || 'Belirtilmedi'}</strong></div>
                      <div><span style="color:var(--color-text-muted);">Yetkili Rolü:</span> <strong style="color:var(--color-primary); display:block;">${activeProfile?.role || 'İşletme Sahibi'}</strong></div>
                      <div><span style="color:var(--color-text-muted);">E-posta Adresi:</span> <strong style="color:#fff; display:block;">${activeProfile?.email || 'Belirtilmedi'}</strong></div>
                      <div><span style="color:var(--color-text-muted);">Telefon Numarası:</span> <strong style="color:#fff; display:block;">${activeProfile?.phone || activeReg.phone || 'Belirtilmedi'}</strong></div>
                      <div><span style="color:var(--color-text-muted);">İşletme Türü:</span> <strong style="color:#fff; display:block;">${activeReg.businessType || formData.businessType || 'Restoran'}</strong></div>
                      <div><span style="color:var(--color-text-muted);">Masa Kapasite Planı:</span> <strong style="color:var(--color-accent-green); display:block;">${activeReg.plan || formData.plan || 'Profesyonel'}</strong></div>
                      <div style="grid-column:1 / -1;"><span style="color:var(--color-text-muted);">Onay Durumu:</span> <strong style="color:${isApproved ? 'var(--color-accent-green)' : (isRejected ? 'var(--color-danger)' : '#F59E0B')}; display:block;">${isApproved ? '✅ Onaylandı (Kod Kullanıma Açık)' : (isRejected ? '❌ Yönetici Tarafından Reddedildi (Lütfen Tekrar İşletme Kaydı Yapınız)' : '⏳ İncelemede (Yönetici Onayından Sonra Kod Açılacaktır)')}</strong></div>
                    </div>

                    <!-- ACTION BUTTONS ROW -->
                    <div class="step5-bottom-nav" style="display:grid; grid-template-columns:${isApproved ? '1fr 1fr' : '1fr'}; gap:0.75rem;">
                      <button id="btn-view-applications-trigger" class="pill-btn" style="justify-content:center; background:rgba(255,107,0,0.15); border:1px solid var(--color-primary); color:#fff; padding:0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.85rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                        <i data-lucide="clipboard-list" style="width:16px; height:16px; color:var(--color-primary);"></i>
                        <span>Başvurularım Ekranında Takip Et</span>
                      </button>

                      ${isApproved ? `
                        <button id="btn-download-txt" class="pill-btn" style="justify-content:center; background:rgba(0,229,255,0.1); border:1px solid rgba(0,229,255,0.3); color:var(--color-accent-cyan); padding:0.75rem; border-radius:var(--radius-md); font-weight:700; font-size:0.82rem; cursor:pointer; display:flex; align-items:center; gap:6px;">
                          <i data-lucide="download" style="width:16px; height:16px;"></i>
                          <span>Bilgi Dosyasını İndir (.txt)</span>
                        </button>
                      ` : ''}
                    </div>
                  </div>

                  <!-- BOTTOM NAVIGATION & ACTIONS -->
                  <div class="step5-bottom-nav">
                    <button class="btn-primary-hero" id="btn-finish-go-home" style="flex:1; min-width:200px; justify-content:center;">
                      <i data-lucide="home"></i> Tanıtım Sayfasına Git
                    </button>

                    <button class="btn-secondary-hero" id="btn-new-registration" style="flex:1; min-width:200px; justify-content:center; border-color:${isRejected ? 'var(--color-danger)' : 'rgba(255,255,255,0.15)'}; color:${isRejected ? '#fff' : ''}; background:${isRejected ? 'rgba(239,68,68,0.15)' : ''};">
                      <i data-lucide="plus-circle"></i> ${isRejected ? 'Tekrar İşletme Kaydı Yap' : 'Yeni İşletme Kaydı Yap'}
                    </button>
                  </div>
                </div>
              `;
            })()}
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
                <div style="background:${registeredBusiness?.status === 'onaylandi' ? 'rgba(0,230,118,0.15)' : 'rgba(245,158,11,0.15)'}; padding:8px 10px; border-radius:8px; border:1px solid ${registeredBusiness?.status === 'onaylandi' ? 'rgba(0,230,118,0.35)' : 'rgba(245,158,11,0.35)'}; margin-bottom:6px;">
                  <span style="font-size:0.75rem; color:var(--color-text-muted); display:block;">Kasa & Giriş Kodu:</span>
                  <span style="color:${registeredBusiness?.status === 'onaylandi' ? 'var(--color-accent-green)' : '#F59E0B'}; font-family:monospace; font-size:1.1rem; font-weight:900; letter-spacing:1px;">
                    ${registeredBusiness?.status === 'onaylandi' ? registeredBusiness.id : '🔒 Onay Bekleniyor'}
                  </span>
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
                <div><strong>Konum:</strong> <span id="badge-disp-city">${formData.city ? `${formData.city} / ${formData.district || ''}` : (registeredBusiness?.city || 'Şehir Seçilmedi')}</span></div>
                <div><strong>Durum:</strong> <span style="color:${(registeredBusiness?.status === 'onaylandi') ? 'var(--color-accent-green)' : '#F59E0B'}; font-weight:800;">${(registeredBusiness?.status === 'onaylandi') ? '✓ ONAYLANDI & AKTİF' : (currentStep === 5 ? '⏳ YÖNETİCİ ONAYI BEKLENİYOR' : '⏳ BAŞVURU ALINIYOR')}</span></div>
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

          const btn = container.querySelector('#btn-save-profile-next');
          if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Profil Oluşturuluyor...';
          }

          // Save Profile to store & Supabase
          const res = await store.saveUserProfile(profileData);
          if (res?.error) {
            console.error('Profile Supabase error:', res.error);
            showToast(`⚠️ Supabase Hatası: ${res.error}. Lütfen Supabase SQL editöründe tabloların kurulu olduğundan emin olun!`, 'error');
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = 'Profili Kaydet & İşletme Kaydına Geç <i data-lucide="arrow-right"></i>';
              if (window.lucide) window.lucide.createIcons();
            }
            return;
          }
          formData.fullName = profileData.fullName;
          formData.phone = profileData.phone;
          formData.password = profileData.password;

          currentStep = 1;
          updateView();
          showToast('🎉 Profiliniz başarıyla oluşturuldu ve veritabanına kaydedildi! Şimdi işletmenizi kaydedebilirsiniz.', 'success');
        });
      } else {
        // LOGIN MODE (AUTHENTICATED ONLY)
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

          const btn = container.querySelector('#btn-login-profile-next');
          if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Kontrol Ediliyor...';
          }

          // 1. Search existing profiles locally
          const cleanId = idInput.toLowerCase();
          const cleanPhone = idInput.replace(/\s+/g, '').replace(/[^0-9]/g, '');
          let matchedProfile = (store.profiles || []).find(p => 
            (p.email && p.email.toLowerCase() === cleanId) || 
            (p.phone && p.phone.replace(/[^0-9]/g, '') === cleanPhone) ||
            (p.id && p.id.toLowerCase() === cleanId)
          );

          // 2. If not found locally, query directly from Supabase profiles table
          if (!matchedProfile && store.supabaseConnected) {
            try {
              const { data, error } = await store.queryProfileByLogin(idInput);
              if (data && data.length > 0) {
                matchedProfile = store.fromProfileDbRow(data[0]);
                // Add to local profiles list if not exists
                if (!store.profiles.some(p => p.id === matchedProfile.id)) {
                  store.profiles.unshift(matchedProfile);
                }
              }
            } catch (err) {
              console.warn('Supabase profile query err:', err);
            }
          }

          // If no matching profile exists in system, REJECT LOGIN!
          if (!matchedProfile) {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = 'Giriş Yap & İşletme Kaydına Devam Et <i data-lucide="arrow-right"></i>';
              if (window.lucide) window.lucide.createIcons();
            }
            showToast('❌ Bu e-posta veya telefon ile kayıtlı bir profil bulunamadı! Lütfen önce "Yeni Profil Oluştur" sekmesinden kayıt olun.', 'error');
            return;
          }

          // Check Password
          if (matchedProfile.password && matchedProfile.password !== passInput) {
            if (btn) {
              btn.disabled = false;
              btn.innerHTML = 'Giriş Yap & İşletme Kaydına Devam Et <i data-lucide="arrow-right"></i>';
              if (window.lucide) window.lucide.createIcons();
            }
            showToast('❌ Girdiğiniz profil şifresi hatalı! Lütfen şifrenizi kontrol edin.', 'error');
            return;
          }

          // Successful Login
          profileData = { ...matchedProfile };
          store.userProfile = profileData;
          store.saveState();
          store.notify();

          formData.fullName = profileData.fullName;
          formData.phone = profileData.phone;
          formData.password = profileData.password;

          currentStep = 1;
          updateView();
          showToast(`👋 Hoş geldiniz ${profileData.fullName}! Profilinize giriş yapıldı.`, 'success');
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

    // STEP 2: LOCATION (81 CITIES + DISTRICTS)
    if (currentStep === 2) {
      const citySelect = container.querySelector('#reg-city');
      const districtSelect = container.querySelector('#reg-district');
      const addrInput = container.querySelector('#reg-fulladdress');

      const updateBadgeLoc = () => {
        const disp = container.querySelector('#badge-disp-city');
        if (disp) {
          const locText = [formData.city, formData.district].filter(Boolean).join(' / ');
          disp.textContent = locText || 'Konum belirtilmedi';
        }
      };

      citySelect?.addEventListener('change', (e) => {
        const selectedCity = e.target.value;
        formData.city = selectedCity;
        const districts = getDistrictsByCity(selectedCity);
        formData.district = districts[0] || '';

        if (districtSelect) {
          districtSelect.disabled = false;
          districtSelect.innerHTML = `
            <option value="" disabled>-- İlçe Seçiniz --</option>
            ${districts.map(d => `<option value="${d}" ${formData.district === d ? 'selected' : ''}>${d}</option>`).join('')}
          `;
        }
        updateBadgeLoc();
      });

      districtSelect?.addEventListener('change', (e) => {
        formData.district = e.target.value;
        updateBadgeLoc();
      });

      addrInput?.addEventListener('input', (e) => {
        formData.fullAddress = e.target.value;
      });

      container.querySelector('#btn-step2-prev')?.addEventListener('click', () => {
        currentStep = 1;
        updateView();
      });

      container.querySelector('#btn-step2-next')?.addEventListener('click', () => {
        if (!formData.city) {
          showToast('Lütfen işletmenizin bulunduğu ili (şehri) seçiniz!', 'error');
          return;
        }
        if (!formData.district) {
          showToast('Lütfen işletmenizin bulunduğu ilçeyi seçiniz!', 'error');
          return;
        }
        if (!formData.fullAddress || !formData.fullAddress.trim()) {
          showToast('Lütfen açık adres alanını (mahalle, cadde, no vb.) doldurunuz!', 'error');
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

      // DIRECT SUBMIT (SMS verification removed)
      container.querySelector('#btn-step3-submit')?.addEventListener('click', async () => {
        if (!formData.password || formData.password.length < 6) {
          showToast('Lütfen en az 6 karakterli bir kasa şifresi belirleyin!', 'error');
          return;
        }

        const termsChecked = container.querySelector('#reg-terms')?.checked;
        if (!termsChecked) {
          showToast('Lütfen BuyurAbi kullanım sözleşmesini onaylayın!', 'error');
          return;
        }

        const btn = container.querySelector('#btn-step3-submit');
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
          city: `${formData.city} / ${formData.district || ''}`,
          district: formData.district || '',
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
        currentStep = 4;
        updateView();
        triggerConfetti();
        showToast('🎉 İşletme başvurunuz başarıyla alındı! Yönetici onayından sonra işletme kodunuz aktif olacaktır.', 'success');
      });
    }

    // STEP 4: SUCCESS CREDENTIALS & LICENSING (was STEP 5)
    if (currentStep === 4) {
      const activeReg = registeredBusiness || store.getLastRegisteredBusiness() || {};
      const activeId = activeReg.id || 'BYR-0000';
      const isApproved = activeReg.status === 'onaylandi';
      const activePass = formData.password || activeReg.password || profileData.password || '';
      const currentProf = store.getUserProfile() || profileData;

      // Trigger Applications Modal
      const openApps = () => {
        const btnApps = document.getElementById('btn-dropdown-applications');
        if (btnApps) {
          btnApps.click();
        } else {
          showToast('Başvuru durumunuzu profilinizdeki Başvurularım menüsünden görebilirsiniz.', 'info');
        }
      };

      container.querySelector('#btn-view-applications-trigger')?.addEventListener('click', openApps);
      container.querySelector('#btn-check-my-apps-trigger')?.addEventListener('click', openApps);

      // 1. Copy Business ID (Only if approved)
      container.querySelector('#btn-copy-id')?.addEventListener('click', () => {
        if (!isApproved) {
          showToast('⏳ İşletme kodunuz yönetici onayından sonra açılacaktır!', 'info');
          return;
        }
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
        showPasswordInStep4 = !showPasswordInStep4;
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

      // Reapply if rejected
      container.querySelector('#btn-step5-reapply')?.addEventListener('click', () => {
        store.clearLastRegisteredBusiness();
        registeredBusiness = null;
        formData = {
          businessName: '',
          businessType: 'Restoran & Lokanta',
          plan: 'Profesyonel Paket (25 Masa - ₺899/ay)',
          planPrice: 899,
          city: 'İstanbul',
          district: 'Kadıköy',
          fullAddress: '',
          password: store.getUserProfile()?.password || ''
        };
        currentStep = store.hasUserProfile() ? 1 : 0;
        updateView();
        showToast('🔄 İşletme kayıt formu açıldı. Bilgilerinizi kontrol edip yeniden gönderebilirsiniz.', 'info');
      });

      // 7. Start New Registration under same profile
      container.querySelector('#btn-new-registration')?.addEventListener('click', () => {
        const doReset = () => {
          store.clearLastRegisteredBusiness();
          registeredBusiness = null;
          formData = {
            businessName: '',
            businessType: 'Restoran & Lokanta',
            plan: 'Profesyonel Paket (25 Masa - ₺899/ay)',
            planPrice: 899,
            city: 'İstanbul',
            district: 'Kadıköy',
            fullAddress: '',
            password: store.getUserProfile()?.password || ''
          };
          currentStep = store.hasUserProfile() ? 1 : 0;
          updateView();
          showToast('Yeni işletme kayıt formu açıldı.', 'info');
        };

        if (isRejected) {
          doReset();
        } else if (confirm('Farklı bir işletme kaydı yapmak istiyor musunuz? (Mevcut işletme ID kartınız bu ekrandan kaldırılacaktır)')) {
          doReset();
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
