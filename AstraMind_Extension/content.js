// Content script for blocking websites when Focus Mode is active
(function() {
  'use strict';

  let isBlocked = false;
  const currentUrl = window.location.href;
  
  // Hide page immediately to prevent flash
  const tempHider = document.createElement('div');
  tempHider.id = 'astramind-temp-hider';
  tempHider.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: #ffffff;
    z-index: 999998;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  
  // Add immediately to prevent page flash
  if (document.body) {
    document.body.appendChild(tempHider);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(tempHider);
    });
  }

  // Check if current site should be blocked
  function checkAndBlock() {
    chrome.runtime.sendMessage(
      { type: 'CHECK_BLOCKED_WEBSITE', url: currentUrl },
      (response) => {
        if (response && response.isBlocked && !isBlocked) {
          isBlocked = true;
          blockPage();
        } else {
          // Not blocked, remove temp hider and show page
          const hider = document.getElementById('astramind-temp-hider');
          if (hider) {
            hider.remove();
          }
        }
      }
    );
  }

  function blockPage() {
    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'astramind-block-overlay';
    overlay.innerHTML = `
      <div class="block-container">
        <div class="block-animation">
          <div class="circle circle-1"></div>
          <div class="circle circle-2"></div>
          <div class="circle circle-3"></div>
        </div>
        
        <div class="block-content">
          <div class="block-icon">🛡️</div>
          <h1 class="block-title">Stay Focused</h1>
          <p class="block-message">This site is blocked while Focus Mode is active</p>
          <div class="block-stats">
            <div class="stat-item">
              <span class="stat-number" id="blocked-count">0</span>
              <span class="stat-label">sites blocked today</span>
            </div>
          </div>
          <button class="block-btn" id="astramind-back-btn">
            <span>← Go Back</span>
          </button>
        </div>
      </div>
    `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
      
      #astramind-block-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: #ffffff;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        overflow: hidden;
      }

      .block-container {
        position: relative;
        text-align: center;
        z-index: 2;
      }

      .block-animation {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 1;
        overflow: hidden;
      }

      .circle {
        position: absolute;
        border: 2px solid #000000;
        border-radius: 50%;
        opacity: 0.03;
        animation: expand 8s ease-in-out infinite;
      }

      .circle-1 {
        width: 300px;
        height: 300px;
        top: 20%;
        left: 10%;
        animation-delay: 0s;
      }

      .circle-2 {
        width: 500px;
        height: 500px;
        top: 40%;
        right: 5%;
        animation-delay: 2s;
      }

      .circle-3 {
        width: 400px;
        height: 400px;
        bottom: 10%;
        left: 50%;
        animation-delay: 4s;
      }

      @keyframes expand {
        0%, 100% {
          transform: scale(1) translate(0, 0);
          opacity: 0.03;
        }
        50% {
          transform: scale(1.2) translate(20px, -20px);
          opacity: 0.06;
        }
      }

      .block-content {
        position: relative;
        z-index: 2;
        animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes fadeSlideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .block-icon {
        font-size: 96px;
        margin-bottom: 32px;
        animation: floatBounce 3s ease-in-out infinite;
        display: inline-block;
      }

      @keyframes floatBounce {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        25% {
          transform: translateY(-10px) rotate(-5deg);
        }
        75% {
          transform: translateY(-5px) rotate(5deg);
        }
      }

      .block-title {
        font-size: 64px;
        font-weight: 800;
        color: #000000;
        margin-bottom: 16px;
        letter-spacing: -0.04em;
        line-height: 1;
        animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .block-message {
        font-size: 20px;
        color: #666666;
        margin-bottom: 48px;
        font-weight: 400;
        letter-spacing: -0.01em;
        animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both;
      }

      .block-stats {
        margin-bottom: 48px;
        animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
      }

      .stat-item {
        display: inline-block;
        padding: 24px 48px;
        border: 2px solid #000000;
        border-radius: 16px;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .stat-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
      }

      .stat-number {
        display: block;
        font-size: 48px;
        font-weight: 800;
        color: #000000;
        line-height: 1;
        margin-bottom: 8px;
        animation: countUp 1s ease-out 0.5s both;
      }

      @keyframes countUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .stat-label {
        display: block;
        font-size: 14px;
        color: #666666;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .block-btn {
        padding: 18px 48px;
        background: #000000;
        color: #ffffff;
        border: 2px solid #000000;
        border-radius: 12px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: inherit;
        letter-spacing: -0.01em;
        animation: slideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both;
      }

      .block-btn:hover {
        background: #ffffff;
        color: #000000;
        transform: translateY(-4px);
        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
      }

      .block-btn:active {
        transform: translateY(-2px);
      }

      .block-btn span {
        display: inline-block;
        transition: transform 0.3s ease;
      }

      .block-btn:hover span {
        transform: translateX(-4px);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Animate counter
    const blockedCount = Math.floor(Math.random() * 10) + 1; // Random for demo, can be tracked
    const counterElement = document.getElementById('blocked-count');
    let count = 0;
    const interval = setInterval(() => {
      if (count >= blockedCount) {
        clearInterval(interval);
      } else {
        count++;
        counterElement.textContent = count;
      }
    }, 100);

    // Handle back button
    document.getElementById('astramind-back-btn').addEventListener('click', () => {
      overlay.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        window.history.back();
      }, 300);
    });

    // Add fade out animation
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(fadeOutStyle);
    
    // Remove temp hider
    const tempHider = document.getElementById('astramind-temp-hider');
    if (tempHider) {
      tempHider.remove();
    }

    // Hide page content
    document.body.style.overflow = 'hidden';
  }

  // Run check as soon as possible
  checkAndBlock();
  
  // Also check when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndBlock);
  }

  // Listen for storage changes (focus mode toggle)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.focusModeEnabled || changes.blockedWebsites)) {
      location.reload();
    }
  });
})();
