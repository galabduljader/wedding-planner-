/* ============================================================
   Store — accounts (auth) + per-user persistence

   Two modes, chosen automatically at boot:
     • REMOTE  — Firebase Auth + Firestore (real accounts, syncs
                 across devices). Active when firebase-config.js
                 holds a real config.
     • LOCAL   — accounts + data in localStorage on this device.
                 Fallback when Firebase isn't configured/available.

   The UI always reads an in-memory `state` synchronously; auth and
   saving are async. In remote mode, saves are debounced to Firestore
   and mirrored to a localStorage cache for instant offline loads.

   localStorage keys:
     gwp_users          -> [{ email, name, phone, pass }]   (LOCAL mode)
     gwp_session        -> current email                    (LOCAL mode)
     gwp_state_<email>  -> that user's data                 (LOCAL mode)
     gwp_cache_<uid>    -> last-synced data                 (REMOTE cache)
   ============================================================ */
(function () {
  const USERS_KEY = "gwp_users";
  const SESSION_KEY = "gwp_session";
  const STATE_PREFIX = "gwp_state_";
  const CACHE_PREFIX = "gwp_cache_";

  const defaults = () => ({
    favorites: [],
    compare: [],
    bookings: [],
    preferences: {
      brideName: "", phone: "", partnerName: "", date: "",
      guests: "", budget: "", area: "", style: "", notes: "",
    },
    checklist: null,
    budget: { total: 0, items: [] },
  });

  let mode = "local";      // "local" | "remote"
  let fb = null;           // FB handle (remote)
  let state = defaults();
  let profile = null;      // { name, phone, email }  (current user)
  let remoteUid = null;    // firebase uid (remote)
  let localEmail = null;   // current email (local)
  const listeners = [];

  function emit() { listeners.forEach((fn) => fn(state)); }
  function snapshot() {
    return {
      favorites: state.favorites, compare: state.compare, bookings: state.bookings,
      preferences: state.preferences, checklist: state.checklist, budget: state.budget,
    };
  }

  // ---- local-mode account helpers ----
  function getUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; } catch (e) { return []; } }
  function saveUsers(l) { localStorage.setItem(USERS_KEY, JSON.stringify(l)); }
  function findLocal(email) {
    const e = (email || "").trim().toLowerCase();
    return getUsers().find((x) => x.email.toLowerCase() === e) || null;
  }
  function hashPass(pw) {
    const s = "gwp::" + pw;
    let h1 = 0x811c9dc5 | 0;
    for (let i = 0; i < s.length; i++) { h1 ^= s.charCodeAt(i); h1 = Math.imul(h1, 0x01000193); }
    let h2 = 0;
    for (let i = s.length - 1; i >= 0; i--) { h2 = (Math.imul(31, h2) + s.charCodeAt(i)) | 0; }
    return (h1 >>> 0).toString(16) + "-" + (h2 >>> 0).toString(16);
  }

  // ---- persistence ----
  let saveTimer = null;
  function persist() {
    if (mode === "remote" && remoteUid) {
      try { localStorage.setItem(CACHE_PREFIX + remoteUid, JSON.stringify(snapshot())); } catch (e) {}
      clearTimeout(saveTimer);
      const uid = remoteUid;
      saveTimer = setTimeout(() => {
        if (fb) fb.saveData(uid, snapshot()).catch((e) => console.warn("[sync] save failed", e));
      }, 600);
    } else if (mode === "local" && localEmail) {
      localStorage.setItem(STATE_PREFIX + localEmail, JSON.stringify(snapshot()));
    }
    emit();
  }

  function loadLocalState() {
    if (!localEmail) { state = defaults(); return; }
    try { state = Object.assign(defaults(), JSON.parse(localStorage.getItem(STATE_PREFIX + localEmail)) || {}); }
    catch (e) { state = defaults(); }
  }

  async function hydrateRemote(uid) {
    let data = null;
    try { const res = await fb.loadData(uid); profile = Object.assign({}, res.profile); data = res.data; }
    catch (e) {
      console.warn("[sync] load failed, using cache", e);
      try { data = JSON.parse(localStorage.getItem(CACHE_PREFIX + uid)) || {}; } catch (e2) { data = {}; }
    }
    state = Object.assign(defaults(), data || {});
    emit();
  }

  let counter = 0;
  function uid() {
    let h = 0; const s = JSON.stringify(state.bookings.length) + state.budget.items.length + counter;
    for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
    return "x" + Math.abs(h).toString(36).slice(0, 6) + (counter++);
  }

  const Store = {
    get() { return state; },
    onChange(fn) { listeners.push(fn); },
    mode() { return mode; },

    // ---- init ----
    initLocal() {
      mode = "local";
      const sess = localStorage.getItem(SESSION_KEY);
      if (sess && findLocal(sess)) { localEmail = findLocal(sess).email; profile = pickLocalProfile(localEmail); }
      loadLocalState();
    },
    initRemote(fbHandle) {
      mode = "remote"; fb = fbHandle;
      return new Promise((resolve) => {
        let first = true;
        fb.onAuth(async (user) => {
          if (user && first) {            // session restored
            remoteUid = user.uid;
            await hydrateRemote(user.uid);
            first = false; resolve();
          } else if (!user && first) {    // no session
            remoteUid = null; profile = null; state = defaults();
            first = false; resolve();
          } else if (!user && !first) {   // signed out elsewhere
            remoteUid = null; profile = null; state = defaults(); emit();
            if (Store.onExternalSignOut) Store.onExternalSignOut();
          }
          // sign-ins after init are handled explicitly by login()/register()
        });
      });
    },

    // ---- auth ----
    isAuthed() { return mode === "remote" ? !!remoteUid : !!localEmail; },
    usersExist() { return mode === "remote" ? true : getUsers().length > 0; },
    emailTaken(email) { return mode === "remote" ? false : !!findLocal(email); },
    currentUser() { return profile ? Object.assign({}, profile) : null; },

    async register({ email, password, name, phone }) {
      email = (email || "").trim();
      if (mode === "remote") {
        try {
          const r = await fb.register(email, password, { name: name.trim(), phone: phone.trim() });
          remoteUid = r.uid;
          await hydrateRemote(r.uid);
          return { ok: true };
        } catch (e) { return { ok: false, code: (e && e.code) || "unknown" }; }
      }
      // local
      if (findLocal(email)) return { ok: false, code: "auth/email-already-in-use" };
      const users = getUsers();
      users.push({ email, name: name.trim(), phone: phone.trim(), pass: hashPass(password) });
      saveUsers(users);
      localEmail = email; localStorage.setItem(SESSION_KEY, email);
      state = defaults();
      state.preferences.brideName = name.trim();
      state.preferences.phone = phone.trim();
      profile = pickLocalProfile(email);
      persist();
      return { ok: true };
    },

    async login(email, password) {
      email = (email || "").trim();
      if (mode === "remote") {
        try {
          const r = await fb.login(email, password);
          remoteUid = r.uid;
          await hydrateRemote(r.uid);
          return { ok: true };
        } catch (e) { return { ok: false, code: (e && e.code) || "unknown" }; }
      }
      const u = findLocal(email);
      if (!u || u.pass !== hashPass(password)) return { ok: false, code: "auth/invalid-credential" };
      localEmail = u.email; localStorage.setItem(SESSION_KEY, u.email);
      profile = pickLocalProfile(u.email);
      loadLocalState();
      emit();
      return { ok: true };
    },

    async logout() {
      if (mode === "remote") { try { await fb.logout(); } catch (e) {} remoteUid = null; }
      else { localStorage.removeItem(SESSION_KEY); localEmail = null; }
      profile = null; state = defaults(); emit();
    },

    // ---- Favorites ----
    isFav(id) { return state.favorites.includes(id); },
    toggleFav(id) {
      const i = state.favorites.indexOf(id);
      if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
      persist(); return state.favorites.includes(id);
    },
    favorites() { return state.favorites.slice(); },

    // ---- Compare ----
    isCompared(id) { return state.compare.includes(id); },
    toggleCompare(id) {
      const i = state.compare.indexOf(id);
      if (i >= 0) { state.compare.splice(i, 1); persist(); return { on: false, full: false }; }
      if (state.compare.length >= 4) return { on: false, full: true };
      state.compare.push(id); persist(); return { on: true, full: false };
    },
    compare() { return state.compare.slice(); },
    clearCompare() { state.compare = []; persist(); },
    removeCompare(id) { const i = state.compare.indexOf(id); if (i >= 0) { state.compare.splice(i, 1); persist(); } },

    // ---- Bookings ----
    addBooking(b) { const bk = Object.assign({ id: uid(), createdAt: Date.now() }, b); state.bookings.unshift(bk); persist(); return bk; },
    bookings() { return state.bookings.slice(); },
    removeBooking(id) { state.bookings = state.bookings.filter((b) => b.id !== id); persist(); },

    // ---- Preferences ----
    preferences() { return Object.assign({}, state.preferences); },
    savePreferences(p) { state.preferences = Object.assign({}, state.preferences, p); persist(); },

    // ---- Checklist ----
    checklist() { return state.checklist; },
    setChecklist(list) { state.checklist = list; persist(); },
    toggleTask(id) { const t = (state.checklist || []).find((x) => x.id === id); if (t) { t.done = !t.done; persist(); } },
    addTask(group, text) { if (!state.checklist) state.checklist = []; state.checklist.push({ id: uid(), group, text, done: false, custom: true }); persist(); },
    removeTask(id) { state.checklist = (state.checklist || []).filter((x) => x.id !== id); persist(); },
    resetChecklist() { state.checklist = null; persist(); },

    // ---- Budget ----
    budget() { return state.budget; },
    setBudgetTotal(n) { state.budget.total = Number(n) || 0; persist(); },
    addBudgetItem(item) { state.budget.items.push(Object.assign({ id: uid(), paid: false }, item)); persist(); },
    toggleBudgetPaid(id) { const it = state.budget.items.find((x) => x.id === id); if (it) { it.paid = !it.paid; persist(); } },
    removeBudgetItem(id) { state.budget.items = state.budget.items.filter((x) => x.id !== id); persist(); },
    budgetSpent() { return state.budget.items.reduce((s, i) => s + (Number(i.amount) || 0), 0); },
  };

  function pickLocalProfile(email) {
    const u = findLocal(email);
    return u ? { name: u.name, phone: u.phone, email: u.email } : null;
  }

  window.Store = Store;
})();
