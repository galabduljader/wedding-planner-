# Enabling real accounts with Firebase

By default the app stores accounts **on the device only** (local mode). Follow these steps
to switch on **real accounts** that work across devices, with data synced in the cloud.
It takes about 5 minutes and the **free tier is plenty** for this app.

When you finish, sign-ups and logins go through Firebase Authentication, and each user's
favorites, bookings, and planning data are stored in Firestore under their account.

---

## 1. Create a Firebase project

1. Go to <https://console.firebase.google.com> and sign in with a Google account.
2. Click **Add project**, give it a name (e.g. `g-wedding-planner`), and finish.
   (You can disable Google Analytics — it's not needed.)

## 2. Register a Web app & copy the config

1. On the project's **Project Overview** page, click the **`</>` (Web)** icon.
2. Give it a nickname and click **Register app**.
3. Firebase shows a `firebaseConfig` object. **Copy these values.**

## 3. Paste the config into the app

Open **`public/legacy/firebase-config.js`** and replace the placeholders with your values:

```js
window.FIREBASE_CONFIG = {
  apiKey: "AIza....",
  authDomain: "g-wedding-planner.firebaseapp.com",
  projectId: "g-wedding-planner",
  storageBucket: "g-wedding-planner.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123",
};
```

> These values are **not secrets** — they're meant to ship in the browser. Security is
> enforced by the rules in step 5, not by hiding the config.

## 4. Turn on Email/Password sign-in

1. In the Firebase console: **Build → Authentication → Get started**.
2. Open the **Sign-in method** tab.
3. Enable **Email/Password** and **Save**.

## 5. Create the database & lock it down

1. **Build → Firestore Database → Create database**.
2. Choose a location and start in **Production mode**.
3. Open the **Rules** tab, paste the rules below, and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Each signed-in user can read & write ONLY their own document
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

This guarantees one user can never read or change another user's data.

## 6. Authorize the domains you run on

In **Authentication → Settings → Authorized domains**, make sure your domains are listed.
`localhost` is allowed by default. When you deploy (e.g. Firebase Hosting, Netlify, Vercel),
add that domain here too.

> **Tip:** run the app from a local server, not by double-clicking the file — open
> <http://localhost:5050> (see the README for the one-line command). Email/password works
> from `file://` too, but `localhost` matches Firebase's defaults more cleanly.

## 7. Test it

1. Reload the app. The browser console should log
   **"Firebase connected — accounts now sync across devices."**
2. Create an account, then open the Firebase console:
   - **Authentication → Users** shows the new account.
   - **Firestore → Data → `users`** shows a document with the name, phone, and planning data.
3. Log in from another browser/device with the same email & password — your favorites and
   bookings come with you. 🎉

---

## How it works (for reference)

- `public/legacy/firebase-config.js` — your keys (the only file you edit).
- `public/legacy/firebase.js` — lazily loads the Firebase SDK and wraps Auth + Firestore.
- `public/legacy/store.js` — automatically uses Firebase when configured, otherwise local mode.
  The UI code never changed; data just persists to the cloud instead of the device.

## Reverting to local mode
Put the `YOUR_...` placeholders back in `firebase-config.js` (or delete the file's values) and
the app returns to device-only accounts.

## Going further (optional)
- **Password reset emails:** Firebase supports `sendPasswordResetEmail` — easy to add a
  "Forgot password?" link on the login screen. Ask and I can wire it up.
- **Email verification**, **Google sign-in**, or **real-time sync** across open tabs are all
  small additions on top of this setup.
