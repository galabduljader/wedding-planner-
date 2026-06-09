"use client";

import { useEffect } from "react";

// Legacy app modules (your tested logic), loaded in order at runtime.
// They live in /public/legacy and drive the #app / overlays imperatively.
const LEGACY_SCRIPTS = [
  "/legacy/firebase-config.js",
  "/legacy/firebase.js",
  "/legacy/i18n.js",
  "/legacy/data.js",
  "/legacy/store.js",
  "/legacy/ui.js",
  "/legacy/app.js",
];

export default function Page() {
  useEffect(() => {
    if (window.__gwpBooted) return; // guard against double-mount
    window.__gwpBooted = true;

    // Firebase readiness handshake (resolved by /legacy/firebase.js)
    window.__fbReady = new Promise((res) => {
      window.__fbResolve = res;
    });

    // Load scripts strictly in order (onload chaining preserves sequence).
    let i = 0;
    const loadNext = () => {
      if (i >= LEGACY_SCRIPTS.length) return;
      const s = document.createElement("script");
      s.src = LEGACY_SCRIPTS[i++];
      s.async = false;
      s.onload = loadNext;
      s.onerror = () => console.error("Failed to load", s.src);
      document.body.appendChild(s);
    };
    loadNext();
  }, []);

  return (
    <>
      {/* Header */}
      <header className="site-header" id="siteHeader">
        <div className="container header-inner">
          <a href="#/home" className="brand" aria-label="G Wedding Planner home">
            <span className="brand-mark">G</span>
            <span className="brand-text">
              <span className="brand-en">G Wedding Planner</span>
              <span className="brand-ar">جي لتخطيط الأعراس</span>
            </span>
          </a>

          <nav className="main-nav" id="mainNav" aria-label="Main navigation"></nav>

          <div className="header-actions">
            <a href="#/favorites" className="icon-btn" id="favBtn" aria-label="Favorites">
              <svg viewBox="0 0 24 24" className="icon">
                <path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 1.9 5 5.3 5c2 0 3.3 1.1 4.2 2.3.4.5.9.5 1.3 0C11.7 6.1 13 5 15 5c3.4 0 4.9 3.6 3.3 6.7C19.5 16.1 12 21 12 21z" />
              </svg>
              <span className="badge" id="favCount" hidden>
                0
              </span>
            </a>
            <button className="account-btn" id="accountBtn" aria-label="My account" hidden>
              <span id="accountInitial">G</span>
            </button>
            <button className="lang-toggle" id="langToggle" aria-label="Switch language">
              <span className="lang-opt" data-lang="en">EN</span>
              <span className="lang-sep">/</span>
              <span className="lang-opt" data-lang="ar">ع</span>
            </button>
            <button className="menu-btn" id="menuBtn" aria-label="Menu">
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* App content is rendered here by the legacy router */}
      <main id="app" className="app-root"></main>

      {/* Footer */}
      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="brand-mark small">G</span>
            <p>Where every love story begins.</p>
          </div>
          <p className="footer-copy">
            © <span id="year"></span> G Wedding Planner — <span>Made with love in Kuwait.</span>
          </p>
        </div>
      </footer>

      {/* Toast / Modal / Auth overlays */}
      <div className="toast" id="toast" role="status" aria-live="polite"></div>
      <div className="modal-root" id="modalRoot" aria-hidden="true"></div>
      <div className="onboarding-root" id="onboardingRoot" aria-hidden="true"></div>
    </>
  );
}
