/* ============================================================
   Firebase loader (ES module)

   Initializes Firebase Auth + Firestore ONLY when a real config is
   present in firebase-config.js. The Firebase SDK is loaded lazily
   (dynamic import) so local mode makes zero network requests.

   Exposes window.FB and resolves window.__fbReady. If config is the
   placeholder (or init fails), resolves with { configured: false }
   so the app falls back to local mode.
   ============================================================ */
const SDK = "https://www.gstatic.com/firebasejs/10.12.0/";
const resolve = window.__fbResolve || function () {};

function isConfigured(cfg) {
  return cfg && cfg.apiKey && cfg.projectId &&
    !String(cfg.apiKey).includes("YOUR_") && !String(cfg.projectId).includes("YOUR_");
}

(async function () {
  const cfg = window.FIREBASE_CONFIG;
  if (!isConfigured(cfg)) {
    console.info("[G Wedding Planner] Firebase not configured — running in LOCAL mode. See SETUP-FIREBASE.md to enable real accounts.");
    resolve({ configured: false, reason: "not-configured" });
    return;
  }

  try {
    const [{ initializeApp }, authMod, fsMod] = await Promise.all([
      import(SDK + "firebase-app.js"),
      import(SDK + "firebase-auth.js"),
      import(SDK + "firebase-firestore.js"),
    ]);
    const {
      getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
      signOut, onAuthStateChanged, updateProfile, setPersistence, browserLocalPersistence,
    } = authMod;
    const { getFirestore, doc, getDoc, setDoc } = fsMod;

    const app = initializeApp(cfg);
    const auth = getAuth(app);
    const db = getFirestore(app);
    try { await setPersistence(auth, browserLocalPersistence); } catch (e) { /* non-fatal */ }

    const FB = {
      configured: true,

      onAuth(cb) { return onAuthStateChanged(auth, cb); },

      async register(email, password, prof) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const name = (prof && prof.name) || "";
        const phone = (prof && prof.phone) || "";
        try { await updateProfile(cred.user, { displayName: name }); } catch (e) {}
        const data = {
          favorites: [], compare: [], bookings: [],
          preferences: { brideName: name, phone, partnerName: "", date: "", guests: "", budget: "", area: "", style: "", notes: "" },
          checklist: null, budget: { total: 0, items: [] },
        };
        await setDoc(doc(db, "users", cred.user.uid), { name, phone, email, data });
        return { uid: cred.user.uid };
      },

      async login(email, password) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        return { uid: cred.user.uid };
      },

      async logout() { await signOut(auth); },

      async loadData(uid) {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists()) {
          const d = snap.data() || {};
          return { profile: { name: d.name || "", phone: d.phone || "", email: d.email || "" }, data: d.data || {} };
        }
        return { profile: {}, data: {} };
      },

      async saveData(uid, data) {
        await setDoc(doc(db, "users", uid), { data }, { merge: true });
      },
    };

    window.FB = FB;
    console.info("[G Wedding Planner] Firebase connected — accounts now sync across devices.");
    resolve(FB);
  } catch (e) {
    console.error("[G Wedding Planner] Firebase init failed — falling back to LOCAL mode.", e);
    resolve({ configured: false, reason: "init-failed", error: String(e) });
  }
})();
