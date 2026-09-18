import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { BookingsInner } from "@/components/bookings-inner";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "My Bookings — SkillSwap" },
      {
        name: "description",
        content: "Track the gigs you've booked and their status on SkillSwap.",
      },
      { property: "og:title", content: "My Bookings — SkillSwap" },
      {
        property: "og:description",
        content: "Track the gigs you've booked and their status on SkillSwap.",
      },
    ],
  }),
  component: BookingsPage,
});

function BookingsPage() {
  return (
    <RequireAuth>
      <BookingsInner />
    </RequireAuth>
  );
}
