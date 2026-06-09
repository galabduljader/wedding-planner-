/* ============================================================
   UI helpers — placeholders, icons, formatting, toast, modal
   ============================================================ */
(function () {
  const t = (k) => window.I18N.t(k);
  const pick = (o) => window.I18N.pick(o);

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ---- Elegant gradient SVG placeholder (self-contained, always works) ----
  function placeholder(category, seed, glyph) {
    const pal = (window.DATA.PALETTES[category]) || ["#EDE2D6", "#C9A96A"];
    seed = seed || 0;
    const angle = 120 + (seed * 37) % 90;
    const c1 = pal[0], c2 = pal[1];
    const gid = "g" + category + seed + Math.abs((seed * 13) % 999);
    const g = glyph || "❀";
    const svg =
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'>` +
      `<defs><linearGradient id='${gid}' x1='0' y1='0' x2='1' y2='1' gradientTransform='rotate(${angle} .5 .5)'>` +
      `<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/></linearGradient>` +
      `<radialGradient id='${gid}r' cx='0.3' cy='0.25' r='0.9'>` +
      `<stop offset='0' stop-color='#ffffff' stop-opacity='0.55'/><stop offset='0.6' stop-color='#ffffff' stop-opacity='0'/></radialGradient></defs>` +
      `<rect width='800' height='600' fill='url(#${gid})'/>` +
      `<rect width='800' height='600' fill='url(#${gid}r)'/>` +
      `<circle cx='${120 + (seed*70)%560}' cy='${100 + (seed*50)%400}' r='${60 + (seed*9)%50}' fill='#ffffff' opacity='0.10'/>` +
      `<circle cx='${600 - (seed*40)%500}' cy='${420 - (seed*30)%300}' r='${40 + (seed*7)%40}' fill='#ffffff' opacity='0.08'/>` +
      `<text x='400' y='300' font-size='150' text-anchor='middle' dominant-baseline='central' opacity='0.62'>${g}</text>` +
      `</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  // image element markup (uses placeholder; supports onerror fallback if real src given)
  function imgPh(category, seed, glyph, cls) {
    const src = placeholder(category, seed, glyph);
    return `<div class="ph ${cls || ''}" style="background:linear-gradient(135deg, var(--blush), var(--nude))">` +
           `<img src="${src}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">` +
           `</div>`;
  }

  // ---- SVG icons ----
  const ICONS = {
    heart: `<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.9-10-9.3C.4 8.6 1.9 5 5.3 5c2 0 3.3 1.1 4.2 2.3.4.5.9.5 1.3 0C11.7 6.1 13 5 15 5c3.4 0 4.9 3.6 3.3 6.7C19.5 16.1 12 21 12 21z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>`,
    star: `<svg viewBox="0 0 24 24"><path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.6 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.4 11.4 0 0 0 .6 3.6 1 1 0 0 1-.25 1z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-2.9.8.8-2.8-.2-.3A8 8 0 1 1 12 20zm4.4-5.6c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1-.6.8-.7.9-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.4.2-.4.6-1.2a.5.5 0 0 0 0-.5l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11 11 0 0 0 4.3 3.8c1.6.7 1.9.6 2.3.5a2.4 2.4 0 0 0 1.6-1.1 2 2 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 7.2A4.8 4.8 0 1 0 16.8 12 4.8 4.8 0 0 0 12 7.2zm0 7.9A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1zM17 5.8a1.1 1.1 0 1 0 1.1 1.1A1.1 1.1 0 0 0 17 5.8zM21 7a5.6 5.6 0 0 0-1.5-4A5.6 5.6 0 0 0 15.5 1.5C14.5 1.4 14.2 1.4 12 1.4s-2.5 0-3.5.1A5.6 5.6 0 0 0 4.5 3 5.6 5.6 0 0 0 3 7c-.1 1-.1 1.3-.1 3.5s0 2.5.1 3.5A5.6 5.6 0 0 0 4.5 21 5.6 5.6 0 0 0 8.5 22.5c1 .1 1.3.1 3.5.1s2.5 0 3.5-.1A5.6 5.6 0 0 0 19.5 21 5.6 5.6 0 0 0 21 17c.1-1 .1-1.3.1-3.5s0-2.5-.1-3.5zm-1.8 6.9a3.8 3.8 0 0 1-1 2.7 3.8 3.8 0 0 1-2.7 1c-1 .1-1.3.1-3.4.1s-2.4 0-3.4-.1a3.8 3.8 0 0 1-2.7-1 3.8 3.8 0 0 1-1-2.7c-.1-1-.1-1.3-.1-3.4s0-2.4.1-3.4a3.8 3.8 0 0 1 1-2.7 3.8 3.8 0 0 1 2.7-1c1-.1 1.3-.1 3.4-.1s2.4 0 3.4.1a3.8 3.8 0 0 1 2.7 1 3.8 3.8 0 0 1 1 2.7c.1 1 .1 1.3.1 3.4s0 2.4-.1 3.4z"/></svg>`,
    snapchat: `<svg viewBox="0 0 24 24"><path d="M12 2c2.3 0 4.2 1.7 4.5 4 .1.9 0 1.8 0 2.6 0 .3.2.4.4.4.3 0 .6-.2.9-.2.4 0 .9.2.9.7 0 .6-.9.8-1.4 1-.3.1-.6.2-.6.5 0 .2.2.5.4.8.5.8 1.4 1.7 2.6 2 .3.1.5.3.5.5 0 .5-1 .8-1.7 1-.2 0-.3.2-.3.4-.1.2-.1.5-.3.6-.2.1-.6 0-1 0-.6 0-1.2 0-1.8.3-.5.2-1 .8-2 1.1-.4.1-.9.2-1.3.2s-.9-.1-1.3-.2c-1-.3-1.5-.9-2-1.1-.6-.3-1.2-.3-1.8-.3-.4 0-.8.1-1 0-.2-.1-.2-.4-.3-.6 0-.2-.1-.4-.3-.4-.7-.2-1.7-.5-1.7-1 0-.2.2-.4.5-.5 1.2-.3 2.1-1.2 2.6-2 .2-.3.4-.6.4-.8 0-.3-.3-.4-.6-.5-.5-.2-1.4-.4-1.4-1 0-.5.5-.7.9-.7.3 0 .6.2.9.2.2 0 .4-.1.4-.4 0-.8-.1-1.7 0-2.6C7.8 3.7 9.7 2 12 2z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12l5 5 9-10" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M13 6l6 6-6 6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    search: `<svg viewBox="0 0 24 24"><path d="M21 20l-5.2-5.2a7 7 0 1 0-1.4 1.4L20 21zM5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0z"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" stroke-width="2" stroke-linecap="round"/></svg>`,
    compare: `<svg viewBox="0 0 24 24"><path d="M9 3v18H7V3zm8 0v18h-2V3zM3 7h2v2H3zm0 4h2v2H3zm0 4h2v2H3z"/></svg>`,
  };
  function icon(name) { return ICONS[name] || ""; }

  // ---- Price formatting ----
  function fmtPrice(n) {
    return Number(n).toLocaleString(I18N.lang === "ar" ? "ar-EG" : "en-US");
  }
  function priceLabel(vendor) {
    const cat = window.DATA.catById(vendor.category);
    const unit = t(cat.unit);
    return { value: fmtPrice(vendor.priceFrom), kwd: t("common.kwd"), unit };
  }

  // ---- Rating stars markup ----
  function ratingHTML(vendor) {
    return `<span class="rating">${icon("star")} ${vendor.rating.toFixed(1)} <span class="rcount">(${fmtPrice(vendor.reviews)})</span></span>`;
  }

  // ---- Toast ----
  let toastTimer;
  function toast(msg) {
    const el = document.getElementById("toast");
    el.innerHTML = icon("check") + "<span>" + esc(msg) + "</span>";
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // ---- Modal ----
  function openModal(html) {
    const root = document.getElementById("modalRoot");
    root.innerHTML =
      `<div class="modal-overlay" data-close></div>` +
      `<div class="modal" role="dialog" aria-modal="true">` +
      `<button class="modal-close" data-close aria-label="Close">✕</button>` + html +
      `</div>`;
    root.classList.add("open");
    root.setAttribute("aria-hidden", "false");
    root.querySelectorAll("[data-close]").forEach((e) =>
      e.addEventListener("click", closeModal));
  }
  function closeModal() {
    const root = document.getElementById("modalRoot");
    root.classList.remove("open");
    root.setAttribute("aria-hidden", "true");
    root.innerHTML = "";
  }

  // ---- Reveal on scroll ----
  let observer;
  function observeReveals(scope) {
    if (!observer) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); observer.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
    }
    (scope || document).querySelectorAll(".reveal:not(.in)").forEach((el) => observer.observe(el));
  }

  // ---- Default checklist ----
  function defaultChecklist() {
    const items = [
      // g1
      ["check.g1", { en: "Set your wedding date", ar: "حدّدي تاريخ الزفاف" }],
      ["check.g1", { en: "Decide your overall budget", ar: "حدّدي ميزانيتكِ الإجمالية" }],
      ["check.g1", { en: "Draft your guest list", ar: "جهّزي قائمة الضيوف المبدئية" }],
      ["check.g1", { en: "Book your wedding hall", ar: "احجزي قاعة الزفاف" }],
      // g2
      ["check.g2", { en: "Choose your bridal dress", ar: "اختاري فستان الزفاف" }],
      ["check.g2", { en: "Book your photographer", ar: "احجزي المصوّر" }],
      ["check.g2", { en: "Book a decorator", ar: "احجزي منسّق الديكور" }],
      ["check.g2", { en: "Select your catering", ar: "اختاري خدمة التموين" }],
      // g3
      ["check.g3", { en: "Book hair & makeup artist", ar: "احجزي خبيرة الشعر والمكياج" }],
      ["check.g3", { en: "Order invitations", ar: "اطلبي بطاقات الدعوة" }],
      ["check.g3", { en: "Choose your florist", ar: "اختاري محل الورود" }],
      ["check.g3", { en: "Arrange wedding car", ar: "رتّبي سيارة الزفاف" }],
      // g4
      ["check.g4", { en: "Send out invitations", ar: "أرسلي الدعوات" }],
      ["check.g4", { en: "Confirm guest count", ar: "أكّدي عدد الضيوف" }],
      ["check.g4", { en: "Schedule beauty trial", ar: "حدّدي جلسة تجميل تجريبية" }],
      ["check.g4", { en: "Final dress fitting", ar: "القياس الأخير للفستان" }],
      // g5
      ["check.g5", { en: "Confirm all vendor timings", ar: "أكّدي مواعيد جميع المزوّدين" }],
      ["check.g5", { en: "Pack for the honeymoon", ar: "جهّزي حقيبة شهر العسل" }],
      ["check.g5", { en: "Prepare final payments", ar: "جهّزي الدفعات النهائية" }],
      ["check.g5", { en: "Relax & enjoy your day", ar: "استرخي واستمتعي بيومكِ" }],
    ];
    return items.map((it, i) => ({ id: "d" + i, group: it[0], text: it[1], done: false }));
  }

  window.UI = {
    esc, placeholder, imgPh, icon, fmtPrice, priceLabel, ratingHTML,
    toast, openModal, closeModal, observeReveals, defaultChecklist,
  };
})();
