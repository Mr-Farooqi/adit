import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type {
  AppUser,
  Booking,
  BookingStatus,
  CreatorStats,
  Gig,
  Message,
  Review,
} from "@/lib/types";

const gigsCol = () => collection(getDb(), "gigs");
const bookingsCol = () => collection(getDb(), "bookings");
const usersCol = () => collection(getDb(), "users");

function tsToMs(value: unknown): number | undefined {
  if (!value) return undefined;
  if (typeof value === "number") return value;
  if (typeof value === "object" && "toMillis" in (value as object)) {
    return (value as { toMillis(): number }).toMillis();
  }
  return undefined;
}

function mapGig(id: string, data: Record<string, unknown>): Gig {
  return {
    ...(data as unknown as Gig),
    id,
    price: Number(data["price"] ?? 0),
    deliveryDays: Number(data["deliveryDays"] ?? 1),
    rating: data["rating"] != null ? Number(data["rating"]) : undefined,
    reviewsCount: data["reviewsCount"] != null ? Number(data["reviewsCount"]) : undefined,
    createdAt: tsToMs(data["createdAt"]),
  };
}

function mapBooking(id: string, data: Record<string, unknown>): Booking {
  return {
    ...(data as unknown as Booking),
    id,
    gigPrice: Number(data["gigPrice"] ?? 0),
    status: (data["status"] as BookingStatus) ?? "pending",
    createdAt: tsToMs(data["createdAt"]),
  };
}

export async function listGigs(): Promise<Gig[]> {
  const snap = await getDocs(gigsCol());
  const gigs = snap.docs.map((d) => mapGig(d.id, d.data()));
  return gigs.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function getGig(id: string): Promise<Gig | null> {
  const snap = await getDoc(doc(getDb(), "gigs", id));
  return snap.exists() ? mapGig(snap.id, snap.data()) : null;
}

export async function ensureUserDoc(profile: AppUser): Promise<void> {
  await setDoc(doc(usersCol(), profile.uid), profile, { merge: true });
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(getDb(), "users", uid));
  return snap.exists() ? ({ ...(snap.data() as AppUser), uid }) : null;
}

export async function saveUserProfile(uid: string, patch: Partial<AppUser>): Promise<void> {
  await setDoc(
    doc(getDb(), "users", uid),
    { ...patch, uid, updatedAt: Date.now() },
    { merge: true },
  );
}

export async function createGig(
  input: Omit<Gig, "id" | "createdAt" | "rating" | "reviewsCount">,
): Promise<string> {
  const ref = await addDoc(gigsCol(), {
    ...input,
    rating: null,
    reviewsCount: 0,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function updateGig(id: string, patch: Partial<Gig>): Promise<void> {
  await updateDoc(doc(getDb(), "gigs", id), patch as Record<string, unknown>);
}

export async function deleteGig(id: string): Promise<void> {
  await deleteDoc(doc(getDb(), "gigs", id));
}

export async function createBooking(
  input: Omit<Booking, "id" | "status" | "createdAt">,
): Promise<string> {
  const ref = await addDoc(bookingsCol(), {
    ...input,
    status: "pending" as BookingStatus,
    createdAt: Date.now(),
  });
  return ref.id;
}

export async function listClientBookings(uid: string): Promise<Booking[]> {
  const snap = await getDocs(query(bookingsCol(), where("clientId", "==", uid)));
  return snap.docs.map((d) => mapBooking(d.id, d.data()));
}

export async function listCreatorBookings(uid: string): Promise<Booking[]> {
  const snap = await getDocs(query(bookingsCol(), where("creatorId", "==", uid)));
  return snap.docs.map((d) => mapBooking(d.id, d.data()));
}

export async function setBookingStatus(id: string, status: BookingStatus): Promise<void> {
  await updateDoc(doc(getDb(), "bookings", id), { status });
}

/** Creator marks their own delivered-project counter (own user doc, allowed by rules). */
export async function incrementCompletedCount(uid: string): Promise<void> {
  const current = await getUserProfile(uid);
  await setDoc(
    doc(getDb(), "users", uid),
    { uid, completedCount: (current?.completedCount ?? 0) + 1, updatedAt: Date.now() },
    { merge: true },
  );
}

/* ---------------- Messages (booking chat) ---------------- */

const messagesCol = () => collection(getDb(), "messages");

export async function listMessages(bookingId: string): Promise<Message[]> {
  const snap = await getDocs(query(messagesCol(), where("bookingId", "==", bookingId)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Message), id: d.id, createdAt: tsToMs(d.data()["createdAt"]) }))
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
}

export async function sendMessage(input: Omit<Message, "id" | "createdAt">): Promise<void> {
  await addDoc(messagesCol(), { ...input, createdAt: Date.now() });
}

/* ---------------- Reviews ---------------- */

const reviewsCol = () => collection(getDb(), "reviews");

export async function createReview(input: Omit<Review, "id" | "createdAt">): Promise<void> {
  // One review per booking: document id is the booking id.
  await setDoc(doc(getDb(), "reviews", input.bookingId), { ...input, createdAt: Date.now() });
}

export async function listCreatorReviews(creatorId: string): Promise<Review[]> {
  const snap = await getDocs(query(reviewsCol(), where("creatorId", "==", creatorId)));
  return snap.docs
    .map((d) => ({ ...(d.data() as Review), id: d.id, createdAt: tsToMs(d.data()["createdAt"]) }))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
}

export async function listClientReviews(clientId: string): Promise<Review[]> {
  const snap = await getDocs(query(reviewsCol(), where("clientId", "==", clientId)));
  return snap.docs.map((d) => ({ ...(d.data() as Review), id: d.id }));
}

export async function getCreatorStats(uid: string): Promise<CreatorStats> {
  const [profile, reviews] = await Promise.all([getUserProfile(uid), listCreatorReviews(uid)]);
  const rating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating ?? 0), 0) / reviews.length
      : null;
  return {
    rating,
    reviewsCount: reviews.length,
    completedCount: profile?.completedCount ?? 0,
  };
}

/** Stats for many creators in two reads — used by the browse page. */
export async function getCreatorStatsBulk(
  creatorIds: string[],
): Promise<Record<string, CreatorStats>> {
  const unique = [...new Set(creatorIds)].filter(Boolean);
  const out: Record<string, CreatorStats> = {};
  for (const id of unique) out[id] = { rating: null, reviewsCount: 0, completedCount: 0 };
  if (unique.length === 0) return out;

  const [usersSnap, reviewsSnap] = await Promise.all([getDocs(usersCol()), getDocs(reviewsCol())]);
  for (const d of usersSnap.docs) {
    const stats = out[d.id];
    if (stats) stats.completedCount = Number(d.data()["completedCount"] ?? 0);
  }
  const ratingsByCreator: Record<string, number[]> = {};
  for (const d of reviewsSnap.docs) {
    const r = d.data() as Review;
    if (!out[r.creatorId]) continue;
    (ratingsByCreator[r.creatorId] ??= []).push(Number(r.rating ?? 0));
  }
  for (const [id, arr] of Object.entries(ratingsByCreator)) {
    const stats = out[id];
    if (!stats) continue;
    stats.reviewsCount = arr.length;
    stats.rating = arr.reduce((sum, v) => sum + v, 0) / arr.length;
  }
  return out;
}
