import { store } from './state/store.js';
import { renderOwnerAdminPanel } from './components/OwnerAdminPanel.js';

document.addEventListener('DOMContentLoaded', () => {
  const adminContainer = document.getElementById('view-owner-admin');
  if (adminContainer) {
    renderOwnerAdminPanel(adminContainer);
  }

  if (window.lucide) {
    window.lucide.createIcons();
  }
});
