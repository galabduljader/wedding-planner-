/* ============================================================
   App — router, views, interactions
   ============================================================ */
(function () {
  const D = window.DATA, S = window.Store, U = window.UI, I = window.I18N;
  const t = (k) => I.t(k);
  const pick = (o) => I.pick(o);
  const app = document.getElementById("app");

  // -------------------------------------------------------
  // Navigation config
  // -------------------------------------------------------
  const NAV = [
    { route: "home", key: "nav.home" },
    { route: "browse", key: "nav.browse" },
    { route: "compare", key: "nav.compare" },
    { route: "checklist", key: "nav.checklist" },
    { route: "budget", key: "nav.budget" },
    { route: "bookings", key: "nav.bookings" },
    { route: "preferences", key: "nav.preferences" },
  ];

  // browse filter state (kept across re-renders)
  const filters = { cat: "", area: "", q: "", sort: "rec" };

  // -------------------------------------------------------
  // Router
  // -------------------------------------------------------
  function parseHash() {
    let h = location.hash.replace(/^#\/?/, "");
    if (!h) h = "home";
    const [path, queryStr] = h.split("?");
    const parts = path.split("/");
    const query = {};
    if (queryStr) queryStr.split("&").forEach((kv) => { const [k, v] = kv.split("="); query[k] = decodeURIComponent(v || ""); });
    return { name: parts[0], param: parts[1], query };
  }

  function route() {
    const r = parseHash();
    window.scrollTo({ top: 0, behavior: "auto" });
    switch (r.name) {
      case "home": renderHome(); break;
      case "browse": renderBrowse(r.query); break;
      case "category": filters.cat = r.param || ""; renderBrowse({}); break;
      case "vendor": renderVendor(r.param); break;
      case "favorites": renderFavorites(); break;
      case "compare": renderCompare(); break;
      case "checklist": renderChecklist(); break;
      case "budget": renderBudget(); break;
      case "bookings": renderBookings(); break;
      case "preferences": renderPreferences(); break;
      default: renderHome();
    }
    updateNavActive(r.name);
    U.observeReveals(app);
    closeMobileMenu();
  }

  // -------------------------------------------------------
  // Reusable markup
  // -------------------------------------------------------
  function vendorCard(v, idx) {
    const cat = D.catById(v.category);
    const p = U.priceLabel(v);
    const faved = S.isFav(v.id);
    const compared = S.isCompared(v.id);
    return `
      <article class="biz-card reveal" style="transition-delay:${(idx % 3) * 80}ms">
        <div class="biz-media" data-link="vendor/${v.id}">
          ${U.imgPh(v.category, (idx % 8) + 1, cat.glyph)}
          <span class="biz-tag">${esc(pick(cat.name))}</span>
          <button class="fav-toggle ${faved ? "on" : ""}" data-action="fav" data-id="${v.id}" aria-label="favorite">${U.icon("heart")}</button>
        </div>
        <div class="biz-body">
          <span class="biz-cat-label">${esc(pick(cat.name))}</span>
          <h3 class="biz-name" data-link="vendor/${v.id}" style="cursor:pointer">${esc(pick(v.name))}</h3>
          <div class="biz-loc">${U.icon("pin")} ${esc(pick(v.area))}</div>
          <div class="biz-meta">
            <span class="biz-price">${p.value} <small>${p.kwd} · ${p.unit}</small></span>
            ${U.ratingHTML(v)}
          </div>
          <div class="biz-actions">
            <a class="btn btn-primary" href="#/vendor/${v.id}">${t("biz.viewDetails")}</a>
            <button class="chip-compare ${compared ? "on" : ""}" data-action="compare" data-id="${v.id}" title="${t("biz.compare")}">${U.icon("compare")}</button>
          </div>
        </div>
      </article>`;
  }
  const esc = U.esc;

  function categoryCard(c, idx) {
    const count = D.countByCat(c.id);
    return `
      <a class="cat-card reveal" href="#/category/${c.id}" style="transition-delay:${(idx % 4) * 70}ms">
        <div class="cat-img">${U.imgPh(c.id, idx + 2, c.glyph)}</div>
        <span class="cat-arrow">${U.icon("arrow")}</span>
        <div class="cat-body">
          <span class="cat-icon">${c.icon}</span>
          <h3>${esc(pick(c.name))}</h3>
          <span class="cat-count">${U.fmtPrice(count)} ${t("cats.view")}</span>
        </div>
      </a>`;
  }

  // -------------------------------------------------------
  // HOME
  // -------------------------------------------------------
  function renderHome() {
    const prefs = S.preferences();
    const greeting = prefs.brideName
      ? `<p class="hero-greet" style="color:var(--rose-deep);font-family:var(--serif);font-style:italic;font-size:20px;margin-bottom:10px">${t("pref.greeting")}, ${esc(prefs.brideName)} ✿</p>`
      : "";

    app.innerHTML = `
      <section class="hero">
        <div class="hero-bg"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
        <div class="container hero-grid">
          <div class="hero-copy reveal in">
            ${greeting}
            <span class="eyebrow">${t("hero.eyebrow")}</span>
            <h1 class="hero-title">${t("hero.title1")} <em>${t("hero.title2")}</em></h1>
            <p class="hero-sub">${t("hero.sub")}</p>
            <div class="hero-cta">
              <a class="btn btn-primary" href="#/browse">${t("hero.cta1")} ${U.icon("arrow")}</a>
              <a class="btn btn-outline" href="#/preferences">${t("hero.cta2")}</a>
            </div>
            <div class="hero-stats">
              <div class="stat"><strong>${D.VENDORS.length}+</strong><span>${t("hero.stat1")}</span></div>
              <div class="stat"><strong>${D.CATEGORIES.length}</strong><span>${t("hero.stat2")}</span></div>
              <div class="stat"><strong>2.4K</strong><span>${t("hero.stat3")}</span></div>
            </div>
          </div>
          <div class="hero-visual reveal in">
            <div class="hero-card c1">${U.imgPh("halls", 3, "🤍")}</div>
            <div class="hero-card c2">${U.imgPh("florists", 5, "🌷")}</div>
            <div class="hero-badge">
              <span class="hb-icon">⭐</span>
              <div><strong>${t("hero.badge")}</strong><span>${t("hero.badgeSub")}</span></div>
            </div>
          </div>
        </div>
      </section>

      <section class="cats-section">
        <div class="container">
          <div class="section-head reveal">
            <span class="section-eyebrow">${t("cats.eyebrow")}</span>
            <h2 class="section-title">${t("cats.title")}</h2>
            <p>${t("cats.sub")}</p>
          </div>
          <div class="cat-grid">
            ${D.CATEGORIES.map((c, i) => categoryCard(c, i)).join("")}
          </div>
        </div>
      </section>

      <section class="container" style="padding-bottom:90px">
        <div class="section-head reveal">
          <span class="section-eyebrow">${t("feat.eyebrow")}</span>
          <h2 class="section-title">${t("feat.title")}</h2>
          <p>${t("feat.sub")}</p>
        </div>
        <div class="biz-grid">
          ${D.featured().slice(0, 6).map((v, i) => vendorCard(v, i)).join("")}
        </div>
        <div style="text-align:center;margin-top:46px">
          <a class="btn btn-outline" href="#/browse">${t("feat.viewAll")} ${U.icon("arrow")}</a>
        </div>
      </section>

      <section style="background:var(--cream);padding:90px 0">
        <div class="container">
          <div class="section-head reveal">
            <span class="section-eyebrow">${t("steps.eyebrow")}</span>
            <h2 class="section-title">${t("steps.title")}</h2>
          </div>
          <div class="cat-grid" style="grid-template-columns:repeat(3,1fr)">
            ${[["1", "steps.s1t", "steps.s1d", "🔍"], ["2", "steps.s2t", "steps.s2d", "🤍"], ["3", "steps.s3t", "steps.s3d", "💌"]]
              .map(([n, tt, dd, ic], i) => `
              <div class="reveal" style="transition-delay:${i * 100}ms;background:var(--white);border-radius:var(--radius-lg);padding:38px 32px;box-shadow:var(--shadow-sm);text-align:center">
                <div style="width:64px;height:64px;border-radius:50%;background:var(--blush);display:grid;place-items:center;font-size:28px;margin:0 auto 20px">${ic}</div>
                <span style="font-family:var(--serif);color:var(--gold);font-size:18px">0${n}</span>
                <h3 style="font-size:24px;margin:8px 0 12px">${t(tt)}</h3>
                <p style="color:var(--muted);font-size:15px">${t(dd)}</p>
              </div>`).join("")}
          </div>
        </div>
      </section>

      <section class="container" style="padding:90px 28px">
        <div class="reveal" style="background:linear-gradient(135deg,var(--ink),#5a4f47);border-radius:var(--radius-lg);padding:64px 40px;text-align:center;color:var(--ivory);position:relative;overflow:hidden">
          <span style="position:absolute;top:-40px;inset-inline-start:-20px;font-size:160px;opacity:.06">💐</span>
          <h2 style="color:var(--ivory);font-size:clamp(30px,4vw,44px)">${t("cta.title")}</h2>
          <p style="opacity:.82;max-width:480px;margin:16px auto 32px">${t("cta.sub")}</p>
          <a class="btn btn-gold" href="#/preferences">${t("cta.btn")} ${U.icon("arrow")}</a>
        </div>
      </section>
    `;
  }

  // -------------------------------------------------------
  // BROWSE
  // -------------------------------------------------------
  function renderBrowse(query) {
    if (query && query.cat) filters.cat = query.cat;
    if (query && query.area) filters.area = query.area;

    const catOpts = `<option value="">${t("browse.allCats")}</option>` +
      D.CATEGORIES.map((c) => `<option value="${c.id}" ${filters.cat === c.id ? "selected" : ""}>${esc(pick(c.name))}</option>`).join("");
    const areaOpts = `<option value="">${t("browse.allAreas")}</option>` +
      D.AREAS.map((a) => `<option value="${esc(a.en)}" ${filters.area === a.en ? "selected" : ""}>${esc(pick(a))}</option>`).join("");
    const sortOpts = [["rec", "browse.sortRec"], ["rating", "browse.sortRating"], ["plow", "browse.sortPriceLow"], ["phigh", "browse.sortPriceHigh"]]
      .map(([v, k]) => `<option value="${v}" ${filters.sort === v ? "selected" : ""}>${t(k)}</option>`).join("");

    app.innerHTML = `
      <div class="page-band">
        <div class="container">
          <h1>${t("browse.title")}</h1>
          <p>${t("browse.sub")}</p>
        </div>
      </div>
      <div class="container page">
        <div class="toolbar">
          <div class="search-field">
            ${U.icon("search")}
            <input id="searchInput" type="search" placeholder="${t("browse.search")}" value="${esc(filters.q)}" />
          </div>
          <div class="select-field"><select id="catSelect">${catOpts}</select></div>
          <div class="select-field"><select id="areaSelect">${areaOpts}</select></div>
          <div class="select-field"><select id="sortSelect">${sortOpts}</select></div>
        </div>
        <div id="resultCount" class="result-count"></div>
        <div id="bizResults"></div>
      </div>`;

    const update = () => updateBrowseResults();
    document.getElementById("searchInput").addEventListener("input", (e) => { filters.q = e.target.value; update(); });
    document.getElementById("catSelect").addEventListener("change", (e) => { filters.cat = e.target.value; update(); });
    document.getElementById("areaSelect").addEventListener("change", (e) => { filters.area = e.target.value; update(); });
    document.getElementById("sortSelect").addEventListener("change", (e) => { filters.sort = e.target.value; update(); });
    updateBrowseResults();
  }

  function filteredVendors() {
    let list = D.VENDORS.slice();
    if (filters.cat) list = list.filter((v) => v.category === filters.cat);
    if (filters.area) list = list.filter((v) => v.area.en === filters.area);
    if (filters.q) {
      const q = filters.q.trim().toLowerCase();
      list = list.filter((v) =>
        pick(v.name).toLowerCase().includes(q) ||
        v.name.en.toLowerCase().includes(q) ||
        pick(v.area).toLowerCase().includes(q) ||
        pick(D.catById(v.category).name).toLowerCase().includes(q));
    }
    if (filters.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    else if (filters.sort === "plow") list.sort((a, b) => a.priceFrom - b.priceFrom);
    else if (filters.sort === "phigh") list.sort((a, b) => b.priceFrom - a.priceFrom);
    else list.sort((a, b) => (b.featured - a.featured) || (b.rating - a.rating));
    return list;
  }

  function updateBrowseResults() {
    const list = filteredVendors();
    const countEl = document.getElementById("resultCount");
    const wrap = document.getElementById("bizResults");
    if (!wrap) return;
    countEl.textContent = U.fmtPrice(list.length) + " " + t("browse.results");
    if (!list.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <div class="es-icon">🌸</div>
          <h3>${t("browse.noResults")}</h3>
          <p>${t("browse.noResultsSub")}</p>
          <button class="btn btn-outline" id="clearFilters">${t("browse.clear")}</button>
        </div>`;
      document.getElementById("clearFilters").addEventListener("click", () => {
        filters.cat = ""; filters.area = ""; filters.q = ""; filters.sort = "rec";
        renderBrowse({});
      });
      return;
    }
    wrap.innerHTML = `<div class="biz-grid">${list.map((v, i) => vendorCard(v, i)).join("")}</div>`;
    U.observeReveals(wrap);
  }

  // -------------------------------------------------------
  // VENDOR DETAIL
  // -------------------------------------------------------
  function renderVendor(id) {
    const v = D.vendorById(id);
    if (!v) { location.hash = "#/browse"; return; }
    const cat = D.catById(v.category);
    const p = U.priceLabel(v);
    const faved = S.isFav(v.id);
    const compared = S.isCompared(v.id);
    const wa = v.whatsapp.replace(/[^0-9]/g, "");
    const tel = v.phone.replace(/\s/g, "");

    const similar = D.vendorsByCat(v.category).filter((x) => x.id !== v.id).slice(0, 3);

    app.innerHTML = `
      <div class="container page">
        <div class="breadcrumb">
          <a href="#/home">${t("nav.home")}</a> /
          <a href="#/category/${cat.id}">${esc(pick(cat.name))}</a> /
          <span>${esc(pick(v.name))}</span>
        </div>

        <div class="detail-gallery reveal in">
          <div class="g-main g-cell">${U.imgPh(v.category, 1, cat.glyph)}</div>
          <div class="g-side">
            <div class="g-cell">${U.imgPh(v.category, 4, cat.glyph)}</div>
            <div class="g-cell">${U.imgPh(v.category, 7, cat.glyph)}</div>
          </div>
        </div>

        <div class="detail-layout">
          <div class="detail-main">
            <div class="detail-head-row">
              <div>
                <span class="biz-cat-label">${esc(pick(cat.name))}</span>
                <h1>${esc(pick(v.name))}</h1>
                <div class="detail-loc">${U.icon("pin")} ${esc(pick(v.area))}, ${I.lang === "ar" ? "الكويت" : "Kuwait"}</div>
              </div>
              ${U.ratingHTML(v)}
            </div>

            <div class="detail-tags">
              ${v.features.slice(0, 4).map((f) => `<span>${esc(pick(f))}</span>`).join("")}
            </div>

            <div class="detail-section">
              <h3>${t("biz.about")}</h3>
              <p>${esc(pick(v.desc))}</p>
            </div>

            <div class="detail-section">
              <h3>${t("biz.offers")}</h3>
              <ul class="feature-list">
                ${v.features.map((f) => `<li>${U.icon("check")} ${esc(pick(f))}</li>`).join("")}
              </ul>
            </div>

            ${similar.length ? `
            <div class="detail-section">
              <h3>${t("biz.similar")}</h3>
              <div class="biz-grid" style="grid-template-columns:repeat(3,1fr)">
                ${similar.map((s, i) => vendorCard(s, i)).join("")}
              </div>
            </div>` : ""}
          </div>

          <aside>
            <div class="booking-card">
              <div class="price-row">
                <span style="font-size:13px;color:var(--taupe)">${t("biz.startingFrom")}</span>
              </div>
              <div class="price-row">
                <span class="big">${p.value}</span>
                <span class="unit">${p.kwd} · ${p.unit}</span>
              </div>
              ${U.ratingHTML(v)} <span style="color:var(--taupe);font-size:13px">· ${U.fmtPrice(v.reviews)} ${t("biz.reviews")}</span>

              <div class="contact-row">
                <a class="contact-btn" href="tel:${tel}">${U.icon("phone")}<span>${t("biz.call")}</span></a>
                <a class="contact-btn" href="https://wa.me/${wa}" target="_blank" rel="noopener">${U.icon("whatsapp")}<span>${t("biz.whatsapp")}</span></a>
                <a class="contact-btn" href="https://instagram.com/${esc(v.instagram)}" target="_blank" rel="noopener">${U.icon("instagram")}<span>${t("biz.instagram")}</span></a>
                <a class="contact-btn" href="https://snapchat.com/add/${esc(v.snapchat)}" target="_blank" rel="noopener">${U.icon("snapchat")}<span>${t("biz.snapchat")}</span></a>
              </div>

              <button class="btn btn-primary btn-block" data-action="book" data-id="${v.id}">${t("biz.requestBooking")}</button>
              <div class="divider"></div>
              <div class="detail-actions-row">
                <button class="btn btn-ghost" style="flex:1" data-action="fav" data-id="${v.id}" id="detailFav">
                  ${U.icon("heart")} <span>${faved ? t("biz.savedLabel") : t("biz.addFav")}</span>
                </button>
                <button class="chip-compare ${compared ? "on" : ""}" data-action="compare" data-id="${v.id}" style="flex:1;justify-content:center;padding:13px">
                  ${U.icon("compare")} ${t("biz.compare")}
                </button>
              </div>
              <div style="font-size:12px;color:var(--taupe);margin-top:14px;text-align:center">
                ${U.icon("phone").replace("<svg", "<svg style='width:12px;height:12px;vertical-align:middle;fill:var(--taupe)'")} ${esc(v.phone)}
              </div>
            </div>
          </aside>
        </div>
      </div>`;

    // reflect faved state on detail button
    const dfav = document.getElementById("detailFav");
    if (faved) dfav.classList.add("active");
  }

  // -------------------------------------------------------
  // FAVORITES
  // -------------------------------------------------------
  function renderFavorites() {
    const favs = S.favorites().map((id) => D.vendorById(id)).filter(Boolean);
    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("fav.title")}</h1><p>${t("fav.sub")}</p></div></div>
      <div class="container page">
        ${favs.length ? `<div class="biz-grid">${favs.map((v, i) => vendorCard(v, i)).join("")}</div>` : emptyState("🤍", t("fav.empty"), t("fav.emptySub"), t("fav.browse"), "#/browse")}
      </div>`;
  }

  // -------------------------------------------------------
  // COMPARE
  // -------------------------------------------------------
  function renderCompare() {
    const items = S.compare().map((id) => D.vendorById(id)).filter(Boolean);
    let body;
    if (!items.length) {
      body = emptyState("⚖️", t("comp.empty"), t("comp.emptySub"), t("nav.browse"), "#/browse");
    } else {
      const rows = [
        ["", items.map((v) => `<td class="compare-col"><div class="cc-media">${U.imgPh(v.category, 2, D.catById(v.category).glyph)}</div></td>`).join("")],
        ["", items.map((v) => `<td class="compare-cell name">${esc(pick(v.name))}</td>`).join("")],
        [t("comp.category"), items.map((v) => `<td class="compare-cell">${esc(pick(D.catById(v.category).name))}</td>`).join("")],
        [t("comp.area"), items.map((v) => `<td class="compare-cell">${esc(pick(v.area))}</td>`).join("")],
        [t("comp.price"), items.map((v) => { const p = U.priceLabel(v); return `<td class="compare-cell"><strong style="font-family:var(--serif);font-size:20px">${p.value}</strong> <span style="font-size:12px;color:var(--taupe)">${p.kwd}/${p.unit}</span></td>`; }).join("")],
        [t("comp.rating"), items.map((v) => `<td class="compare-cell">${U.ratingHTML(v)}</td>`).join("")],
        [t("comp.reviews"), items.map((v) => `<td class="compare-cell">${U.fmtPrice(v.reviews)}</td>`).join("")],
        ["", items.map((v) => `<td class="compare-cell">
            <a class="btn btn-primary btn-sm" href="#/vendor/${v.id}" style="margin-bottom:8px">${t("comp.view")}</a><br>
            <button class="btn btn-outline btn-sm" data-action="remove-compare" data-id="${v.id}">${t("comp.remove")}</button>
          </td>`).join("")],
      ];
      body = `
        <div style="display:flex;justify-content:flex-end;margin-bottom:18px">
          <button class="btn btn-outline btn-sm" data-action="clear-compare">${t("comp.clear")}</button>
        </div>
        <div class="compare-wrap"><table class="compare-table">
          ${rows.map(([label, cells]) => `<tr>${label ? `<th class="compare-row-label">${label}</th>` : "<th></th>"}${cells}</tr>`).join("")}
        </table></div>`;
    }
    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("comp.title")}</h1><p>${t("comp.sub")}</p></div></div>
      <div class="container page">${body}</div>`;
  }

  // -------------------------------------------------------
  // CHECKLIST
  // -------------------------------------------------------
  function renderChecklist() {
    let list = S.checklist();
    if (!list) { list = U.defaultChecklist(); S.setChecklist(list); }
    const total = list.length;
    const done = list.filter((x) => x.done).length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const groups = ["check.g1", "check.g2", "check.g3", "check.g4", "check.g5"];
    const circ = 2 * Math.PI * 40;

    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("check.title")}</h1><p>${t("check.sub")}</p></div></div>
      <div class="container page page-narrow">
        <div class="progress-banner reveal in">
          <div>
            <h2>${t("check.progress")} ✨</h2>
            <p>${U.fmtPrice(done)} / ${U.fmtPrice(total)} ${t("check.done")}</p>
            <button class="btn btn-ghost btn-sm" data-action="reset-checklist" style="margin-top:14px">${t("check.reset")}</button>
          </div>
          <div class="progress-ring">
            <div class="ring">
              <svg width="90" height="90">
                <circle cx="45" cy="45" r="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="7"/>
                <circle cx="45" cy="45" r="40" fill="none" stroke="var(--gold-soft)" stroke-width="7" stroke-linecap="round"
                  stroke-dasharray="${circ}" stroke-dashoffset="${circ * (1 - pct / 100)}"/>
              </svg>
              <span class="ring-num">${pct}%</span>
            </div>
          </div>
        </div>

        ${groups.map((g) => {
          const items = list.filter((x) => x.group === g);
          if (!items.length) return "";
          return `
            <div class="checklist-group reveal">
              <div class="group-head"><h3>${t(g)}</h3><span class="gline"></span></div>
              ${items.map((it) => `
                <div class="task-row ${it.done ? "done" : ""}">
                  <button class="task-check" data-action="task-toggle" data-id="${it.id}">${U.icon("check")}</button>
                  <span class="task-label">${esc(pick(it.text))}</span>
                  <button class="task-del" data-action="task-del" data-id="${it.id}" aria-label="delete">✕</button>
                </div>`).join("")}
              <div class="add-task-row">
                <input type="text" placeholder="${t("check.addPh")}" data-addtask="${g}" />
                <button class="btn btn-outline btn-sm" data-action="add-task" data-group="${g}">${U.icon("plus")} ${t("check.add")}</button>
              </div>
            </div>`;
        }).join("")}
      </div>`;
  }

  // -------------------------------------------------------
  // BUDGET
  // -------------------------------------------------------
  function renderBudget() {
    const b = S.budget();
    const spent = S.budgetSpent();
    const remaining = b.total - spent;
    const pct = b.total ? Math.min(100, Math.round((spent / b.total) * 100)) : 0;
    const over = remaining < 0;

    const catOpts = D.CATEGORIES.map((c) => `<option value="${c.id}">${esc(pick(c.name))}</option>`).join("") +
      `<option value="other">${I.lang === "ar" ? "أخرى" : "Other"}</option>`;

    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("budget.title")}</h1><p>${t("budget.sub")}</p></div></div>
      <div class="container page page-narrow">
        <div class="budget-summary">
          <div class="budget-stat gold reveal">
            <div class="bs-label">${t("budget.total")}</div>
            <div class="bs-value">${U.fmtPrice(b.total)} <small>${t("common.kwd")}</small></div>
            <button class="btn btn-ghost btn-sm" data-action="set-budget" style="margin-top:14px">${b.total ? t("budget.edit") : t("budget.setBudget")}</button>
          </div>
          <div class="budget-stat accent reveal" style="transition-delay:80ms">
            <div class="bs-label">${t("budget.spent")}</div>
            <div class="bs-value">${U.fmtPrice(spent)} <small>${t("common.kwd")}</small></div>
            <div class="budget-bar"><span style="width:${pct}%"></span></div>
          </div>
          <div class="budget-stat reveal" style="transition-delay:160ms">
            <div class="bs-label">${t("budget.remaining")}</div>
            <div class="bs-value" style="color:${over ? "var(--danger)" : "var(--success)"}">${U.fmtPrice(remaining)} <small>${t("common.kwd")}</small></div>
            ${over ? `<div class="pill pending" style="margin-top:12px;background:#F7E3DE;color:var(--danger)">${t("budget.overBudget")}</div>` : ""}
          </div>
        </div>

        <div style="background:var(--white);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow-sm);margin-bottom:30px">
          <div class="field-row" style="grid-template-columns:2fr 1fr 1.3fr auto;align-items:end;gap:12px">
            <div class="field" style="margin:0"><label>${t("budget.itemName")}</label><input id="bItemName" type="text" placeholder="${t("budget.itemName")}"/></div>
            <div class="field" style="margin:0"><label>${t("budget.amount")}</label><input id="bItemAmount" type="number" min="0" placeholder="0"/></div>
            <div class="field" style="margin:0"><label>${t("budget.category")}</label><select id="bItemCat">${catOpts}</select></div>
            <button class="btn btn-primary" data-action="add-budget-item" style="height:48px">${U.icon("plus")} ${t("budget.addItem")}</button>
          </div>
        </div>

        ${b.items.length ? `<div class="budget-table">${b.items.map((it) => budgetRow(it)).join("")}</div>`
          : emptyState("💰", t("budget.empty"), t("budget.emptySub"), "", "")}
      </div>`;
  }

  function budgetRow(it) {
    const cat = D.catById(it.category);
    const icon = cat ? cat.icon : "📌";
    const name = cat ? pick(cat.name) : (I.lang === "ar" ? "أخرى" : "Other");
    return `
      <div class="budget-row">
        <div class="br-cat">
          <span class="br-icon">${icon}</span>
          <div><div class="br-name">${esc(it.name)}</div><div style="font-size:12px;color:var(--taupe)">${esc(name)}</div></div>
        </div>
        <div class="br-amount">${U.fmtPrice(it.amount)} <span style="font-size:12px;color:var(--taupe)">${t("common.kwd")}</span></div>
        <button class="pill ${it.paid ? "paid" : "pending"}" data-action="budget-paid" data-id="${it.id}" title="${it.paid ? t("budget.markPending") : t("budget.markPaid")}">${it.paid ? t("budget.paid") : t("budget.pending")}</button>
        <button class="task-del" data-action="budget-del" data-id="${it.id}" style="opacity:1" aria-label="delete">✕</button>
      </div>`;
  }

  // -------------------------------------------------------
  // BOOKINGS
  // -------------------------------------------------------
  function renderBookings() {
    const list = S.bookings();
    let body;
    if (!list.length) {
      body = emptyState("📩", I.lang === "ar" ? "لا توجد حجوزات بعد" : "No bookings yet",
        I.lang === "ar" ? "أرسلي طلب حجز من أي مزوّد لتظهر هنا." : "Send a booking request from any vendor to see it here.",
        t("nav.browse"), "#/browse");
    } else {
      body = `<div style="display:grid;gap:16px">` + list.map((bk) => {
        const v = D.vendorById(bk.vendorId);
        const cat = v ? D.catById(v.category) : null;
        const d = new Date(bk.createdAt);
        return `
          <div class="reveal" style="background:var(--white);border-radius:var(--radius);box-shadow:var(--shadow-sm);padding:22px;display:flex;gap:18px;align-items:center;flex-wrap:wrap">
            <div style="width:64px;height:64px;border-radius:14px;overflow:hidden;flex-shrink:0">${v ? U.imgPh(v.category, 3, cat.glyph) : ""}</div>
            <div style="flex:1;min-width:180px">
              <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--gold)">${v ? esc(pick(cat.name)) : ""}</div>
              <h3 style="font-size:21px;margin:3px 0">${v ? esc(pick(v.name)) : esc(bk.vendorId)}</h3>
              <div style="font-size:13px;color:var(--muted)">
                ${bk.date ? `📅 ${esc(bk.date)} · ` : ""}${bk.guests ? `👥 ${esc(bk.guests)} · ` : ""}📞 ${esc(bk.phone)}
              </div>
            </div>
            <div style="text-align:end">
              <span class="pill paid" style="background:#E6F0E8;color:var(--success)">${I.lang === "ar" ? "تم الإرسال" : "Sent"}</span>
              <div style="font-size:12px;color:var(--taupe);margin-top:8px">${d.toLocaleDateString(I.lang === "ar" ? "ar-EG" : "en-US")}</div>
              <button class="task-del" data-action="remove-booking" data-id="${bk.id}" style="opacity:1;margin-top:6px">✕</button>
            </div>
          </div>`;
      }).join("") + `</div>`;
    }
    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("nav.bookings")}</h1><p>${I.lang === "ar" ? "كل طلبات الحجز التي أرسلتِها." : "All the booking requests you've sent."}</p></div></div>
      <div class="container page page-narrow">${body}</div>`;
  }

  // -------------------------------------------------------
  // PREFERENCES
  // -------------------------------------------------------
  function renderPreferences() {
    const p = S.preferences();
    const areaOpts = `<option value="">—</option>` + D.AREAS.map((a) => `<option value="${esc(a.en)}" ${p.area === a.en ? "selected" : ""}>${esc(pick(a))}</option>`).join("");
    const styles = [["classic", "pref.styleClassic"], ["modern", "pref.styleModern"], ["luxury", "pref.styleLuxury"], ["minimal", "pref.styleMinimal"]];
    const styleOpts = `<option value="">—</option>` + styles.map(([v, k]) => `<option value="${v}" ${p.style === v ? "selected" : ""}>${t(k)}</option>`).join("");

    let countdown = "";
    if (p.date) {
      const diff = Math.ceil((new Date(p.date) - new Date()) / 86400000);
      if (diff >= 0) countdown = `<div style="background:linear-gradient(135deg,var(--blush),var(--nude));border-radius:var(--radius);padding:22px 26px;text-align:center;margin-bottom:30px">
        <span style="font-family:var(--serif);font-size:44px;font-weight:600;color:var(--rose-deep)">${U.fmtPrice(diff)}</span>
        <p style="color:var(--charcoal);margin-top:4px">${t("pref.countdown")}</p></div>`;
    }

    app.innerHTML = `
      <div class="page-band"><div class="container"><h1>${t("pref.title")}</h1><p>${t("pref.sub")}</p></div></div>
      <div class="container page page-narrow">
        ${countdown}
        <form id="prefForm" style="background:var(--white);border-radius:var(--radius-lg);padding:38px;box-shadow:var(--shadow-sm)">
          <div class="field-row">
            <div class="field"><label>${t("pref.coupleName")}</label><input name="brideName" type="text" placeholder="${t("pref.coupleNamePh")}" value="${esc(p.brideName)}"/></div>
            <div class="field"><label>${t("pref.phone")}</label><input name="phone" type="tel" placeholder="+965 ..." value="${esc(p.phone)}"/></div>
          </div>
          <div class="field-row">
            <div class="field"><label>${t("pref.partnerName")}</label><input name="partnerName" type="text" placeholder="${t("pref.partnerNamePh")}" value="${esc(p.partnerName)}"/></div>
            <div class="field"><label>${t("pref.date")}</label><input name="date" type="date" value="${esc(p.date)}"/></div>
          </div>
          <div class="field-row">
            <div class="field"><label>${t("pref.guests")}</label><input name="guests" type="number" min="0" placeholder="200" value="${esc(p.guests)}"/></div>
            <div class="field"><label>${t("pref.budget")}</label><input name="budget" type="number" min="0" placeholder="5000" value="${esc(p.budget)}"/></div>
          </div>
          <div class="field-row">
            <div class="field"><label>${t("pref.area")}</label><select name="area">${areaOpts}</select></div>
            <div class="field"><label>${t("pref.style")}</label><select name="style">${styleOpts}</select></div>
          </div>
          <div class="field"><label>${t("pref.notes")}</label><textarea name="notes" placeholder="${t("pref.notesPh")}">${esc(p.notes)}</textarea></div>
          <button type="submit" class="btn btn-primary btn-block">${t("pref.save")}</button>
        </form>
      </div>`;

    document.getElementById("prefForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const obj = {};
      fd.forEach((val, k) => obj[k] = val);
      S.savePreferences(obj);
      // sync budget total if provided and budget not yet set
      if (obj.budget && !S.budget().total) S.setBudgetTotal(obj.budget);
      U.toast(t("pref.saved"));
      renderPreferences();
    });
  }

  // -------------------------------------------------------
  // Booking modal
  // -------------------------------------------------------
  function openBookingModal(id) {
    const v = D.vendorById(id);
    if (!v) return;
    const p = S.preferences();
    U.openModal(`
      <h2>${t("book.title")}</h2>
      <p class="modal-sub">${esc(pick(v.name))} — ${t("book.sub")}</p>
      <form id="bookForm">
        <div class="field"><label>${t("book.name")}</label><input name="name" type="text" placeholder="${t("book.namePh")}" value="${esc(p.brideName)}" required/></div>
        <div class="field-row">
          <div class="field"><label>${t("book.phone")}</label><input name="phone" type="tel" placeholder="+965 ..." value="${esc(p.phone)}" required/></div>
          <div class="field"><label>${t("book.date")}</label><input name="date" type="date" value="${esc(p.date)}"/></div>
        </div>
        <div class="field"><label>${t("book.guests")}</label><input name="guests" type="number" min="0" placeholder="200" value="${esc(p.guests)}"/></div>
        <div class="field"><label>${t("book.message")}</label><textarea name="message" placeholder="${t("book.messagePh")}"></textarea></div>
        <button type="submit" class="btn btn-primary btn-block">${t("book.send")}</button>
      </form>`);
    document.getElementById("bookForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const name = (fd.get("name") || "").trim();
      const phone = (fd.get("phone") || "").trim();
      if (!name || !phone) { U.toast(t("book.required")); return; }
      S.addBooking({ vendorId: id, name, phone, date: fd.get("date"), guests: fd.get("guests"), message: fd.get("message") });
      showBookingSuccess();
    });
  }

  function showBookingSuccess() {
    U.openModal(`
      <div style="text-align:center">
        <div class="success-check">${U.icon("check")}</div>
        <h2>${t("book.successTitle")}</h2>
        <p class="modal-sub">${t("book.successSub")}</p>
        <a class="btn btn-primary btn-block" href="#/bookings" data-close>${t("book.done")}</a>
      </div>`);
    refreshHeaderCounts();
  }

  // -------------------------------------------------------
  // Shared empty state
  // -------------------------------------------------------
  function emptyState(icon, title, sub, btnLabel, btnHref) {
    return `
      <div class="empty-state reveal in">
        <div class="es-icon">${icon}</div>
        <h3>${title}</h3>
        <p>${sub}</p>
        ${btnLabel ? `<a class="btn btn-primary" href="${btnHref}">${btnLabel}</a>` : ""}
      </div>`;
  }

  // -------------------------------------------------------
  // Header: nav, language, counts
  // -------------------------------------------------------
  function renderNav() {
    const nav = document.getElementById("mainNav");
    nav.innerHTML = NAV.map((n) => `<a href="#/${n.route}" data-route="${n.route}">${t(n.key)}</a>`).join("");
  }
  function updateNavActive(name) {
    let active = name;
    if (name === "category" || name === "vendor") active = "browse";
    document.querySelectorAll("#mainNav a").forEach((a) =>
      a.classList.toggle("active", a.dataset.route === active));
  }
  function refreshHeaderCounts() {
    const c = S.favorites().length;
    const badge = document.getElementById("favCount");
    badge.textContent = c;
    badge.hidden = c === 0;
    document.getElementById("favBtn").classList.toggle("active", c > 0);
  }
  function updateLangUI() {
    document.querySelectorAll(".lang-opt").forEach((el) =>
      el.classList.toggle("on", el.dataset.lang === I.lang));
  }

  // -------------------------------------------------------
  // Global event delegation
  // -------------------------------------------------------
  document.addEventListener("click", (e) => {
    // navigate via data-link (cards)
    const link = e.target.closest("[data-link]");
    if (link && !e.target.closest("[data-action]")) {
      location.hash = "#/" + link.dataset.link;
      return;
    }

    const actEl = e.target.closest("[data-action]");
    if (!actEl) return;
    const action = actEl.dataset.action;
    const id = actEl.dataset.id;

    switch (action) {
      case "fav": {
        const on = S.toggleFav(id);
        // update any fav buttons for this id
        document.querySelectorAll(`.fav-toggle[data-id="${id}"]`).forEach((b) => b.classList.toggle("on", on));
        const dfav = document.getElementById("detailFav");
        if (dfav && dfav.dataset.id === id) {
          dfav.classList.toggle("active", on);
          const span = dfav.querySelector("span");
          if (span) span.textContent = on ? t("biz.savedLabel") : t("biz.addFav");
        }
        U.toast(on ? t("biz.savedFav") : t("biz.removedFav"));
        refreshHeaderCounts();
        if (parseHash().name === "favorites") renderFavorites();
        break;
      }
      case "compare": {
        const res = S.toggleCompare(id);
        if (res.full) { U.toast(t("biz.compareFull")); break; }
        document.querySelectorAll(`.chip-compare[data-id="${id}"]`).forEach((b) => b.classList.toggle("on", res.on));
        U.toast(res.on ? t("biz.added") : t("biz.removedCompare"));
        break;
      }
      case "book": openBookingModal(id); break;
      case "remove-compare": S.removeCompare(id); renderCompare(); break;
      case "clear-compare": S.clearCompare(); renderCompare(); break;
      case "remove-booking": S.removeBooking(id); renderBookings(); break;
      case "task-toggle": S.toggleTask(id); renderChecklist(); break;
      case "task-del": S.removeTask(id); renderChecklist(); break;
      case "add-task": {
        const group = actEl.dataset.group;
        const input = document.querySelector(`input[data-addtask="${group}"]`);
        const val = input && input.value.trim();
        if (val) { S.addTask(group, { en: val, ar: val }); renderChecklist(); }
        break;
      }
      case "reset-checklist": S.resetChecklist(); renderChecklist(); break;
      case "set-budget": openSetBudgetModal(); break;
      case "add-budget-item": {
        const name = document.getElementById("bItemName").value.trim();
        const amount = document.getElementById("bItemAmount").value;
        const category = document.getElementById("bItemCat").value;
        if (!name || !amount) { U.toast(I.lang === "ar" ? "أدخلي الاسم والمبلغ" : "Enter name and amount"); break; }
        S.addBudgetItem({ name, amount: Number(amount), category });
        renderBudget();
        break;
      }
      case "budget-paid": S.toggleBudgetPaid(id); renderBudget(); break;
      case "budget-del": S.removeBudgetItem(id); renderBudget(); break;
      case "logout": {
        U.closeModal();
        (async () => {
          await S.logout();
          refreshAccountUI();
          refreshHeaderCounts();
          location.hash = "#/home";
          U.toast(t("auth.loggedOut"));
          authMode = "login";
          renderAuth();
          showAuth();
        })();
        break;
      }
    }
  });

  // Enter key to add task
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const at = e.target.closest("input[data-addtask]");
    if (at) {
      e.preventDefault();
      const group = at.dataset.addtask;
      const val = at.value.trim();
      if (val) { S.addTask(group, { en: val, ar: val }); renderChecklist(); }
    }
  });

  function openSetBudgetModal() {
    const cur = S.budget().total || "";
    U.openModal(`
      <h2>${t("budget.setTitle")}</h2>
      <p class="modal-sub">${t("budget.sub")}</p>
      <form id="budgetForm">
        <div class="field"><label>${t("budget.total")} (${t("common.kwd")})</label><input name="total" type="number" min="0" value="${esc(cur)}" placeholder="5000" autofocus/></div>
        <button type="submit" class="btn btn-primary btn-block">${t("budget.save")}</button>
      </form>`);
    document.getElementById("budgetForm").addEventListener("submit", (e) => {
      e.preventDefault();
      S.setBudgetTotal(new FormData(e.target).get("total"));
      U.closeModal();
      renderBudget();
    });
  }

  // -------------------------------------------------------
  // Language toggle
  // -------------------------------------------------------
  document.getElementById("langToggle").addEventListener("click", () => {
    I.set(I.lang === "en" ? "ar" : "en");
    renderNav();
    updateLangUI();
    document.getElementById("year").textContent = new Date().getFullYear();
    route();
  });

  // -------------------------------------------------------
  // Mobile menu
  // -------------------------------------------------------
  const menuBtn = document.getElementById("menuBtn");
  const mainNav = document.getElementById("mainNav");
  menuBtn.addEventListener("click", () => {
    menuBtn.classList.toggle("open");
    mainNav.classList.toggle("open");
  });
  function closeMobileMenu() { menuBtn.classList.remove("open"); mainNav.classList.remove("open"); }

  // -------------------------------------------------------
  // Auth gate (log in / sign up)
  // -------------------------------------------------------
  let authMode = "login"; // "login" | "signup"

  function renderAuth() {
    const root = document.getElementById("onboardingRoot");
    const isSignup = authMode === "signup";
    const field = (name, type, labelKey, phKey, ac) =>
      `<div class="field"><label>${t(labelKey)}</label>` +
      `<input name="${name}" type="${type}" placeholder="${t(phKey)}" ${ac ? `autocomplete="${ac}"` : ""} required/></div>`;

    root.innerHTML = `
      <div class="onboarding">
        <div class="ob-bg"><span class="blob o1"></span><span class="blob o2"></span></div>
        <div class="onboarding-lang">
          <button id="obLang" aria-label="Switch language">
            <span class="lang-opt" data-lang="en">EN</span><span class="lang-sep">/</span><span class="lang-opt" data-lang="ar">ع</span>
          </button>
        </div>
        <div class="onboarding-card">
          <div class="ob-mark">G</div>
          <span class="ob-eyebrow">${isSignup ? t("auth.signupEyebrow") : t("auth.loginEyebrow")}</span>
          <h2>${isSignup ? t("auth.signupTitle") : t("auth.loginTitle")}</h2>
          <p class="ob-sub">${isSignup ? t("auth.signupSub") : t("auth.loginSub")}</p>
          <form id="authForm" autocomplete="off">
            ${isSignup ? field("name", "text", "auth.name", "auth.namePh", "name") : ""}
            ${isSignup ? field("phone", "tel", "auth.phone", "auth.phonePh", "tel") : ""}
            <div class="field"><label>${t("auth.email")}</label><input name="email" type="email" placeholder="${t("auth.emailPh")}" autocomplete="${isSignup ? "email" : "username"}" required/></div>
            <div class="field"><label>${t("auth.password")}</label><input name="password" type="password" placeholder="${t("auth.passwordPh")}" autocomplete="${isSignup ? "new-password" : "current-password"}" required/></div>
            ${isSignup ? `<div class="field"><label>${t("auth.confirm")}</label><input name="confirm" type="password" placeholder="${t("auth.confirmPh")}" autocomplete="new-password" required/></div>` : ""}
            <button type="submit" class="btn btn-primary btn-block" id="authSubmit">${isSignup ? t("auth.signup") : t("auth.login")} ${U.icon("arrow")}</button>
          </form>
          <p class="ob-switch">${isSignup ? t("auth.haveAccount") : t("auth.noAccount")}
            <a id="authSwitch">${isSignup ? t("auth.toLogin") : t("auth.toSignup")}</a></p>
          <p class="ob-note">${t("auth.note")}</p>
        </div>
      </div>`;

    root.querySelectorAll(".onboarding-lang .lang-opt").forEach((el) =>
      el.classList.toggle("on", el.dataset.lang === I.lang));

    document.getElementById("obLang").addEventListener("click", () => {
      I.set(I.lang === "en" ? "ar" : "en");
      renderNav(); updateLangUI(); route();
      renderAuth();
    });

    document.getElementById("authSwitch").addEventListener("click", () => {
      authMode = isSignup ? "login" : "signup";
      renderAuth();
    });

    document.getElementById("authForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const email = (fd.get("email") || "").trim();
      const password = fd.get("password") || "";
      const btn = document.getElementById("authSubmit");

      const setLoading = (on) => {
        btn.disabled = on;
        btn.style.opacity = on ? ".7" : "";
        btn.innerHTML = on ? t("auth.loading")
          : (isSignup ? t("auth.signup") : t("auth.login")) + " " + U.icon("arrow");
      };

      if (isSignup) {
        const name = (fd.get("name") || "").trim();
        const phone = (fd.get("phone") || "").trim();
        const confirm = fd.get("confirm") || "";
        if (!name || !phone || !email || !password || !confirm) { U.toast(t("auth.errRequired")); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { U.toast(t("auth.errInvalidEmail")); return; }
        if (password.length < 6) { U.toast(t("auth.errShortPass")); return; }
        if (password !== confirm) { U.toast(t("auth.errMatch")); return; }
        setLoading(true);
        const res = await S.register({ name, phone, email, password });
        setLoading(false);
        if (!res.ok) { U.toast(authErrorMsg(res.code)); return; }
        finishAuth(name);
      } else {
        if (!email || !password) { U.toast(t("auth.errRequired")); return; }
        setLoading(true);
        const res = await S.login(email, password);
        setLoading(false);
        if (!res.ok) { U.toast(authErrorMsg(res.code)); return; }
        finishAuth(S.currentUser() ? S.currentUser().name : "");
      }
    });
  }

  function authErrorMsg(code) {
    switch (code) {
      case "auth/email-already-in-use": return t("auth.errEmailInUse");
      case "auth/invalid-email": return t("auth.errInvalidEmail");
      case "auth/weak-password": return t("auth.errWeakPass");
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found": return t("auth.errInvalidCreds");
      case "auth/network-request-failed": return t("auth.errNetwork");
      default: return t("auth.errGeneric");
    }
  }

  function finishAuth(name) {
    hideAuth();
    refreshAccountUI();
    refreshHeaderCounts();
    route();
    if (name) U.toast(t("auth.welcomeToast") + ", " + name + " ✿");
  }

  function showAuth() {
    const r = document.getElementById("onboardingRoot");
    r.classList.add("open");
    r.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function hideAuth() {
    const r = document.getElementById("onboardingRoot");
    r.classList.remove("open");
    r.setAttribute("aria-hidden", "true");
    r.innerHTML = "";
    document.body.style.overflow = "";
  }
  function maybeAuth() {
    if (S.isAuthed()) { hideAuth(); refreshAccountUI(); return; }
    authMode = "login"; // always greet with Log In; sign-up is one tap away
    renderAuth();
    showAuth();
  }

  // Splash shown while Firebase restores the session
  function showSplash() {
    const root = document.getElementById("onboardingRoot");
    root.innerHTML = `
      <div class="onboarding">
        <div class="ob-bg"><span class="blob o1"></span><span class="blob o2"></span></div>
        <div class="onboarding-card" style="max-width:320px">
          <div class="ob-mark">G</div>
          <div class="ob-spinner"></div>
        </div>
      </div>`;
    showAuth();
  }

  // Account button + menu
  function refreshAccountUI() {
    const btn = document.getElementById("accountBtn");
    const user = S.currentUser();
    if (user) {
      btn.hidden = false;
      document.getElementById("accountInitial").textContent = (user.name || user.email || "G").trim().charAt(0).toUpperCase();
    } else {
      btn.hidden = true;
    }
  }
  function openAccountMenu() {
    const user = S.currentUser();
    if (!user) return;
    const initial = (user.name || user.email || "G").trim().charAt(0).toUpperCase();
    U.openModal(`
      <div class="account-card">
        <div class="ac-avatar">${initial}</div>
        <div class="ac-name">${esc(user.name || "")}</div>
        ${user.email ? `<div class="ac-meta">${esc(user.email)}</div>` : ""}
        ${user.phone ? `<div class="ac-row"><span>${t("auth.phone")}</span><span>${esc(user.phone)}</span></div>` : ""}
        <button class="btn btn-outline btn-block" data-action="logout" style="margin-top:22px">${t("auth.logout")}</button>
      </div>`);
  }
  document.getElementById("accountBtn").addEventListener("click", openAccountMenu);

  // -------------------------------------------------------
  // Header scroll shadow
  // -------------------------------------------------------
  window.addEventListener("scroll", () => {
    document.getElementById("siteHeader").classList.toggle("scrolled", window.scrollY > 12);
  }, { passive: true });

  // -------------------------------------------------------
  // Init / boot (waits for Firebase if configured)
  // -------------------------------------------------------
  function fbConfigPresent() {
    const c = window.FIREBASE_CONFIG || {};
    return c.apiKey && c.projectId &&
      !String(c.apiKey).includes("YOUR_") && !String(c.projectId).includes("YOUR_");
  }

  // If the user is signed out in another tab/device, return to the gate.
  S.onExternalSignOut = function () {
    refreshAccountUI(); refreshHeaderCounts();
    authMode = "login"; renderAuth(); showAuth();
  };

  async function boot() {
    window.addEventListener("hashchange", route);
    document.getElementById("year").textContent = new Date().getFullYear();
    renderNav();
    updateLangUI();

    let fbHandle = null;
    if (fbConfigPresent()) {
      showSplash(); // cover the screen while the session is restored
      fbHandle = await Promise.race([
        window.__fbReady,
        new Promise((r) => setTimeout(() => r(null), 7000)),
      ]);
    }

    if (fbHandle && fbHandle.configured) {
      await S.initRemote(fbHandle);
    } else {
      S.initLocal();
    }

    refreshHeaderCounts();
    S.onChange(refreshHeaderCounts);
    route();
    maybeAuth();
  }

  boot();
})();
