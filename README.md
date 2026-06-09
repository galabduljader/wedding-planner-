# G Wedding Planner

An elegant, bilingual (Arabic / English) wedding-planner web app for women in Kuwait.
Create an account, browse wedding vendors, save favorites, compare options, plan a checklist,
manage a budget, and send booking requests — all in one luxurious, easy-to-use interface.

**100% front-end. No build step, no server, no backend.** Just open `index.html`.

---

## ✨ Features

- **Accounts** — sign up (name, phone, email, password) and log in (email + password).
  Each account keeps its own favorites, bookings, and planning data. Log out from the avatar
  menu in the header. Works **on-device out of the box**, or with **real cross-device sync**
  once you connect Firebase (see [`SETUP-FIREBASE.md`](SETUP-FIREBASE.md)).
- **Browse vendors** across 10 categories — halls, salons, makeup, florists, photographers,
  decorators, catering, dresses, invitations, and wedding cars.
- **Vendor profiles** with photos, prices (KWD), location, ratings, phone number, WhatsApp,
  Instagram, and Snapchat links.
- **Search & filter** by category, area, and sort by rating or price.
- **Favorites** — heart any vendor.
- **Compare** up to 4 vendors side by side.
- **Wedding checklist** — a timeline of tasks with progress tracking; add your own.
- **Budget manager** — set a total budget and track expenses (paid / pending).
- **Booking requests** — send your details to a vendor; saved under *Bookings*.
- **My Wedding** — store your wedding date (with a live countdown), guest count,
  budget, preferred area, style, and notes.
- **Bilingual** — full Arabic (RTL) and English (LTR) with a one-tap language toggle.
- **Premium design** — soft neutral palette, champagne gold accents, elegant serif type,
  smooth animations, fully responsive (mobile → desktop).

---

## 🚀 Running it

Just **double-click `index.html`** — it works offline straight from the file system.

Or serve it locally (nicer for development):

```bash
cd wedding-planner
python3 -m http.server 5050
# then open http://localhost:5050
```

---

## 📁 Project structure

```
wedding-planner/
├── index.html              # App shell (header, footer, script includes)
└── assets/
    ├── css/
    │   └── styles.css      # Full design system
    └── js/
        ├── firebase-config.js  # Your Firebase keys (the only file you edit to go live)
        ├── firebase.js         # Lazily loads Firebase Auth + Firestore (optional)
        ├── i18n.js         # English + Arabic translations, language switching
        ├── data.js         # Vendor & category mock data (edit this to add vendors)
        ├── store.js        # Accounts (auth) + per-user persistence (local OR Firebase)
        ├── ui.js           # Helpers: image placeholders, icons, toast, modal
        └── app.js          # Router + auth gate + all page views + interactions
```

---

## 🔐 Accounts & storage

The app has **two modes**, chosen automatically at startup:

**Local mode (default).** Accounts and data live in the browser on the device. Great for a
prototype; nothing leaves the device. Stored under these `localStorage` keys:

| Key | Holds |
|---|---|
| `gwp_users` | All accounts: `{ email, name, phone, pass }` (password is hashed) |
| `gwp_session` | The currently logged-in email |
| `gwp_state_<email>` | That user's favorites, bookings, preferences, checklist, budget |
| `farah_lang` | Language choice (`en` / `ar`) |

> ⚠️ Local mode is **not real security** — anyone with the device can read it, and there is no
> server verifying logins. Use it for prototyping only.

**Firebase mode (recommended for real users).** Paste your Firebase keys into
[`assets/js/firebase-config.js`](assets/js/firebase-config.js) and follow
[`SETUP-FIREBASE.md`](SETUP-FIREBASE.md). Sign-up/login then run through **Firebase
Authentication** (passwords are handled securely by Google, never stored by us) and each user's
data syncs to **Firestore**, so it follows them across devices. Per-user access is locked down
by Firestore security rules. No app code changes needed — just the config.

---

## ✏️ Customizing

### Add or edit vendors
Open `assets/js/data.js` and add to the `VENDORS` array using the `biz(...)` helper:

```js
biz("halls", F("My New Hall", "اسم القاعة"), AREAS[0], 900, 4.8, 120, {
  featured: true,
  desc: F("English description...", "الوصف بالعربية..."),
  features: [F("Up to 500 guests", "حتى 500 ضيف"), F("Valet", "خدمة صف السيارات")],
  phone: "+965 1234 5678",
  whatsapp: "+965 1234 5678",
  instagram: "their_handle",
  snapchat: "their_handle",
});
```
`F(en, ar)` = a bilingual string. `AREAS[n]` = a Kuwait area (see top of the file).

### Use real photos instead of the elegant placeholders
The app ships with self-contained gradient placeholders so it always looks polished offline.
To use real photos, give each vendor an `images: ["url1", "url2", ...]` field in `data.js`
and update `UI.imgPh()` in `ui.js` to render an `<img src>` when images are present.

### Change colors / fonts
All design tokens live at the top of `assets/css/styles.css` under `:root`.

### Add or change wording
All UI text is in `assets/js/i18n.js` — every string has an `en` and `ar` version.

---

Made with love for brides in Kuwait. 💐
