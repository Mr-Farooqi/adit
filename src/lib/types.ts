export const CATEGORIES = ["Design", "Video Editing", "Tutoring", "Music", "Coding", "Writing"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Project {
  title: string;
  description: string;
  link?: string | undefined;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt?: number | undefined;
}

export interface Review {
  id: string;
  bookingId: string;
  gigId: string;
  gigTitle: string;
  creatorId: string;
  clientId: string;
  clientName: string;
  rating: number;
  comment?: string | undefined;
  createdAt?: number | undefined;
}

export interface CreatorStats {
  rating: number | null;
  reviewsCount: number;
  completedCount: number;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  completedCount?: number | undefined;
  bio?: string | undefined;
  headline?: string | undefined;
  location?: string | undefined;
  resumeUrl?: string | undefined;
  skills?: string[] | undefined;
  languages?: string[] | undefined;
  projects?: Project[] | undefined;
  createdAt?: number | undefined;
  updatedAt?: number | undefined;
}

export interface Gig {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  category: Category;
  description: string;
  price: number;
  deliveryDays: number;
  rating?: number | undefined;
  reviewsCount?: number | undefined;
  createdAt?: number | undefined;
}

export type BookingStatus = "pending" | "accepted" | "completed" | "cancelled" | "declined";

export interface Booking {
  id: string;
  gigId: string;
  gigTitle: string;
  gigPrice: number;
  clientId: string;
  clientName: string;
  creatorId: string;
  creatorName: string;
  date: string;
  note: string;
  status: BookingStatus;
  createdAt?: number | undefined;
}

export const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
  declined: "Declined",
};
