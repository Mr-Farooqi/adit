# SkillSwap 🔄

**SkillSwap** is a gig marketplace where young creators — designers, video editors, tutors and musicians — list their services and clients book them in a few clicks.

Built for the **CODE2CAREER AI HACKATHON**.

> Hackathon ID: `YOUR_HACKATHON_ID_HERE` <!-- TODO: replace with the real Hackathon ID before submitting -->

---

## ✨ Features

| Feature | What it does |
| --- | --- |
| **Post a Gig** | Creators list a service with category, price and delivery time |
| **Browse & Search** | Keyword search, category filters and sorting (price, rating, newest) |
| **Book a Gig** | Clients pick a date, add a note and request a booking |
| **Creator Dashboard** | Creators edit/delete their gigs and accept, decline or complete booking requests |
| **My Bookings** | Clients track the live status of every booking they made |
| **Auth** | Email / password sign-up and sign-in (Firebase Authentication) |

## 🛠 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS
- **Backend / Database:** Firebase (Authentication + Cloud Firestore)
- **Routing:** TanStack Router
- **UI:** shadcn-style components + Lucide icons

## 🚀 Run it locally

```bash
npm install
npm run dev
```

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Email/Password** sign-in under Authentication.
3. Create a **Cloud Firestore** database.
4. Register a **Web app** and copy its `firebaseConfig`.
5. Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Seed demo gigs (optional)

```bash
node scripts/seed.mjs
```

Uses the same `.env` values to insert sample gigs so the marketplace isn't empty.

## 📁 Data model (Firestore)

- **users** — `{ uid, name, email, createdAt }`
- **gigs** — `{ creatorId, creatorName, title, category, description, price, deliveryDays, rating, reviewsCount, createdAt }`
- **bookings** — `{ gigId, gigTitle, gigPrice, clientId, clientName, creatorId, creatorName, date, note, status, createdAt }`
  - `status`: `pending → accepted → completed` (or `declined` / `cancelled`)

## 👥 Team

Built with ❤️ by Team `[TEAM_NAME]` — `MEMBER_1`, `MEMBER_2`, `MEMBER_3`.
