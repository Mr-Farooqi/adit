/**
 * Seeds SkillSwap with demo gigs.
 *
 * Usage:
 *   1. Fill the VITE_FIREBASE_* values in .env
 *   2. Optionally set SEED_EMAIL / SEED_PASSWORD in .env (used to own the gigs)
 *   3. node scripts/seed.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

function loadEnv() {
  if (!existsSync(".env")) {
    console.error("No .env file found in the project root.");
    process.exit(1);
  }
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      const raw = m[2].replace(/^["']|["']$/g, "");
      process.env[m[1]] = raw.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => process.env[name] ?? "");
    }
  }
}
loadEnv();

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

if (!config.apiKey || config.apiKey.startsWith("your-")) {
  console.error("Firebase config is missing — fill the VITE_FIREBASE_* values in .env first.");
  process.exit(1);
}

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

const DEMO_GIGS = [
  {
    title: "I will design a modern logo and brand kit for your startup",
    category: "Design",
    description:
      "I'm a final-year design student. You get 3 logo concepts, unlimited tweaks on the chosen one, plus a mini brand kit (colors, fonts, social banner). Delivered in Figma and PNG/SVG.",
    price: 799,
    deliveryDays: 3,
    rating: 4.9,
    reviewsCount: 12,
    creatorName: "Aarav Sharma",
  },
  {
    title: "I will edit your YouTube videos with snappy cuts and captions",
    category: "Video Editing",
    description:
      "Fast-paced edits for vlogs and shorts: jump cuts, captions, sound effects and a punchy intro. I've edited 40+ videos for college fest channels. Send raw footage, get a ready-to-upload file.",
    price: 499,
    deliveryDays: 2,
    rating: 4.8,
    reviewsCount: 20,
    creatorName: "Priya Verma",
  },
  {
    title: "I will teach Python basics to absolute beginners (live 1:1)",
    category: "Tutoring",
    description:
      "A friendly 1:1 intro to Python: variables, loops, functions and a mini project. I TA'd my college's intro course. Perfect if you've never written code — we go at your pace.",
    price: 350,
    deliveryDays: 1,
    rating: 5.0,
    reviewsCount: 8,
    creatorName: "Rohan Iyer",
  },
  {
    title: "I will record a soft acoustic cover or original song for you",
    category: "Music",
    description:
      "Guitar + vocals recordings for birthdays, proposals or content. You choose the song, I record and mix a clean audio + video file within 4 days. Stems included.",
    price: 900,
    deliveryDays: 4,
    rating: 4.7,
    reviewsCount: 9,
    creatorName: "Meera Nair",
  },
  {
    title: "I will design eye-catching Instagram posts and story templates",
    category: "Design",
    description:
      "A pack of 10 branded post designs + 5 story templates matched to your palette. Great for small businesses and campus clubs trying to look consistent.",
    price: 599,
    deliveryDays: 3,
    rating: 4.6,
    reviewsCount: 15,
    creatorName: "Kabir Singh",
  },
  {
    title: "I will edit your wedding or event reel with cinematic color",
    category: "Video Editing",
    description:
      "A 60–90 second highlight reel with music sync, color grading and smooth transitions. I've cut reels for three wedding studios. Delivery in 5 days.",
    price: 1499,
    deliveryDays: 5,
    rating: 4.9,
    reviewsCount: 11,
    creatorName: "Ananya Gupta",
  },
  {
    title: "I will help you prep for Class 12 board maths (weekly sessions)",
    category: "Tutoring",
    description:
      "Weekly 1-hour sessions covering calculus and vectors with past-paper drills. I scored 98 in boards and have been tutoring juniors for a year.",
    price: 300,
    deliveryDays: 1,
    rating: 4.8,
    reviewsCount: 18,
    creatorName: "Vikram Patel",
  },
  {
    title: "I will produce a lo-fi beat or background track for your videos",
    category: "Music",
    description:
      "Custom lo-fi / chill beats made in FL Studio, royalty-free for your YouTube or podcast. Two revision rounds included, delivered as WAV + MP3.",
    price: 650,
    deliveryDays: 3,
    rating: 4.5,
    reviewsCount: 7,
    creatorName: "Zoya Khan",
  },
  {
    title: "I will design a clean portfolio website UI in Figma",
    category: "Design",
    description:
      "A 3-page portfolio design (home, work, contact) in Figma, mobile-responsive layout, ready for you or a developer to build. Includes a quick walkthrough call.",
    price: 1200,
    deliveryDays: 4,
    rating: 4.8,
    reviewsCount: 10,
    creatorName: "Aarav Sharma",
  },
  {
    title: "I will add professional subtitles and translations to your videos",
    category: "Video Editing",
    description:
      "Accurate English subtitles (or Hindi↔English translation), styled to match your brand, delivered as .srt or burned-in. 98%+ accuracy, human-reviewed.",
    price: 400,
    deliveryDays: 2,
    rating: 4.7,
    reviewsCount: 14,
    creatorName: "Priya Verma",
  },
];

async function ensureSeedUser() {
  const email = process.env.SEED_EMAIL || "demo.creator@skillswap.app";
  const password = process.env.SEED_PASSWORD || "skillswap-demo-123";
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    if (err?.code === "auth/email-already-in-use") {
      return await signInWithEmailAndPassword(auth, email, password);
    }
    throw err;
  }
}

try {
  const cred = await ensureSeedUser();
  const uid = cred.user.uid;
  const existing = await getDocs(collection(db, "gigs"));
  if (existing.size > 0) {
    console.log(`Skipped — ${existing.size} gigs already exist in Firestore.`);
    process.exit(0);
  }
  let i = 0;
  for (const g of DEMO_GIGS) {
    await addDoc(collection(db, "gigs"), {
      ...g,
      creatorId: uid,
      createdAt: Date.now() - i * 3600_000,
    });
    i++;
  }
  console.log(`✅ Seeded ${DEMO_GIGS.length} demo gigs.`);
  console.log("   Signed in as:", email, "(password:", password + ")");
  process.exit(0);
} catch (err) {
  console.error("Seed failed:", err?.message ?? err);
  process.exit(1);
}
