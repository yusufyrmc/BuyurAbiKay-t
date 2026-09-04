import { store } from '../state/store.js';
import { RESTAURANT_INFO } from '../data/mockData.js';

export function renderQrGenerator(container) {
  function updateView() {
    container.innerHTML = `
      <div style="background:var(--color-bg-card); padding:1.5rem; border-radius:var(--radius-lg); border:var(--border-glass); margin-bottom:1.5rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h2 style="font-family:var(--font-heading); font-size:1.6rem; font-weight:800;">🖨️ Masa QR Kod Standı Üreteci</h2>
          <p style="color:var(--color-text-muted); font-size:0.88rem;">Restoranınızdaki masalar için tasarlanmış yazdırılabilir QR stant şablonları</p>
        </div>

        <button id="btn-print-all-qrs" class="btn-primary-lg" style="padding:0.6rem 1.2rem; font-size:0.88rem;">
          <i data-lucide="printer"></i> Tüm Masaların QR Kodlarını Yazdır
        </button>
      </div>

      <div class="qr-generator-grid">
        ${store.tables.map(table => `
          <div class="table-qr-card">
            <div class="qr-card-logo">Buyur<span style="color:#FF6B00;">Abi</span> QR</div>
            <div style="font-size:0.75rem; color:#64748B; font-weight:700;">${RESTAURANT_INFO.name}</div>
            
            <div class="qr-table-name" style="margin-top:0.3rem;">${table.name}</div>
            <div style="font-size:0.75rem; background:#F1F5F9; color:#475569; padding:2px 10px; border-radius:12px; font-weight:700; margin-bottom:0.8rem;">
              ${table.zone} • ${table.capacity} Kişilik
            </div>

            <!-- Simulated SVG QR Code with logo inside -->
            <div class="qr-box">
              <svg width="150" height="150" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Background -->
                <rect width="100" height="100" fill="#FFFFFF"/>
                <!-- QR Position Detection Patterns (Corners) -->
                <rect x="5" y="5" width="26" height="26" fill="#0F172A"/>
                <rect x="9" y="9" width="18" height="18" fill="#FFFFFF"/>
                <rect x="13" y="13" width="10" height="10" fill="#FF6B00"/>

                <rect x="69" y="5" width="26" height="26" fill="#0F172A"/>
                <rect x="73" y="9" width="18" height="18" fill="#FFFFFF"/>
                <rect x="77" y="13" width="10" height="10" fill="#FF6B00"/>

                <rect x="5" y="69" width="26" height="26" fill="#0F172A"/>
                <rect x="9" y="73" width="18" height="18" fill="#FFFFFF"/>
                <rect x="13" y="77" width="10" height="10" fill="#FF6B00"/>

                <!-- Decorative QR Matrix Data -->
                <rect x="36" y="8" width="5" height="5" fill="#0F172A"/>
                <rect x="45" y="8" width="8" height="5" fill="#0F172A"/>
                <rect x="58" y="8" width="5" height="5" fill="#0F172A"/>

                <rect x="36" y="18" width="8" height="5" fill="#0F172A"/>
                <rect x="48" y="18" width="5" height="5" fill="#0F172A"/>
                <rect x="58" y="18" width="5" height="5" fill="#0F172A"/>

                <rect x="8" y="36" width="5" height="8" fill="#0F172A"/>
                <rect x="18" y="36" width="5" height="5" fill="#0F172A"/>
                <rect x="28" y="36" width="5" height="8" fill="#0F172A"/>

                <rect x="38" y="38" width="24" height="24" rx="4" fill="#FF6B00"/>
                <text x="50" y="54" font-size="10" font-weight="bold" fill="#FFFFFF" text-anchor="middle">M${table.id}</text>

                <rect x="68" y="36" width="8" height="5" fill="#0F172A"/>
                <rect x="80" y="36" width="12" height="5" fill="#0F172A"/>
                <rect x="68" y="46" width="5" height="8" fill="#0F172A"/>
                <rect x="78" y="46" width="8" height="8" fill="#0F172A"/>

                <rect x="36" y="68" width="10" height="5" fill="#0F172A"/>
                <rect x="50" y="68" width="5" height="10" fill="#0F172A"/>
                <rect x="60" y="68" width="8" height="5" fill="#0F172A"/>

                <rect x="36" y="82" width="5" height="8" fill="#0F172A"/>
                <rect x="45" y="82" width="12" height="5" fill="#0F172A"/>
                <rect x="62" y="82" width="10" height="8" fill="#0F172A"/>
                <rect x="78" y="78" width="12" height="12" fill="#0F172A"/>
              </svg>
            </div>

            <div class="qr-instructions">
              <i data-lucide="smartphone" style="width:14px; color:#FF6B00; display:inline-block; vertical-align:middle;"></i>
              Kameranızı açıp tarayın,<br>siparişinizi anında verin.
            </div>

            <button class="btn-print-qr btn-single-print" data-table-name="${table.name}">
              <i data-lucide="printer" style="width:14px;"></i> Yazdır
            </button>
          </div>
        `).join('')}
      </div>
    `;

    if (window.lucide) window.lucide.createIcons();

    container.querySelector('#btn-print-all-qrs')?.addEventListener('click', () => {
      window.print();
    });

    container.querySelectorAll('.btn-single-print').forEach(btn => {
      btn.addEventListener('click', (e) => {
        alert(`${e.currentTarget.dataset.tableName} QR Kod Standı yazıcıya gönderildi!`);
      });
    });
  }

  updateView();
}
