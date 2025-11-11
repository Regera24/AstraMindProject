// Block page script
(function() {
  'use strict';

  // Get blocked URL from query parameter
  const params = new URLSearchParams(window.location.search);
  const blockedUrl = params.get('url');
  
  if (blockedUrl) {
    try {
      const hostname = new URL(blockedUrl).hostname;
      document.getElementById('blocked-url').textContent = hostname;
    } catch (e) {
      document.getElementById('blocked-url').textContent = blockedUrl;
    }
  }
  
  // Handle close button
  document.getElementById('close-tab-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLOSE_CURRENT_TAB' });
  });
})();
