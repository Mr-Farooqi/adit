import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Inbox, MessagesSquare, Star } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/dashboard-inner";
import { ChatDialog } from "@/components/chat-dialog";
import { ReviewDialog } from "@/components/review-dialog";
import { listClientBookings, listClientReviews, setBookingStatus } from "@/lib/db";
import { type Booking } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export function BookingsInner() {
  const { user, configured } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const bookingsQuery = useQuery({
    queryKey: ["bookings", user?.uid],
    queryFn: () => listClientBookings(user!.uid),
    enabled: configured && !!user,
  });

  const reviewsQuery = useQuery({
    queryKey: ["client-reviews", user?.uid],
    queryFn: () => listClientReviews(user!.uid),
    enabled: configured && !!user,
  });

  if (!user) return null;

  const ratedBookingIds = new Set((reviewsQuery.data ?? []).map((r) => r.bookingId));

  const bookings = bookingsQuery.data ?? [];

  async function cancelBooking(booking: Booking) {
    try {
      await setBookingStatus(booking.id, "cancelled");
    } catch (err) {
      toast.error("Could not cancel", { description: (err as Error).message });
      return;
    }
    toast.success("Booking cancelled");
    queryClient.invalidateQueries({ queryKey: ["bookings", user!.uid] });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">My Bookings</h1>
      <p className="mt-1 text-muted-foreground">Gigs you've requested, with their live status.</p>

      <div className="mt-6 space-y-3">
        {bookingsQuery.isLoading ? (
          <>
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl border border-dashed py-14 text-center">
            <Inbox className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-semibold">No bookings yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Find a creator you like and request a booking.
            </p>
            <Button className="mt-5" onClick={() => navigate({ to: "/" })}>
              <CalendarDays className="mr-2 h-4 w-4" /> Browse gigs
            </Button>
          </div>
        ) : (
          bookings.map((b) => (
            <Card key={b.id}>
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{b.gigTitle}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      with {b.creatorName} · {format(new Date(b.date), "d MMM yyyy")} · ₹
                      {b.gigPrice.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                {b.note ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Your note: "{b.note}"
                  </p>
                ) : null}
                {b.status === "pending" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => cancelBooking(b)}>
                      Cancel request
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Waiting for {b.creatorName} to respond.
                    </span>
                  </div>
                ) : b.status === "declined" || b.status === "cancelled" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate({ to: "/gig/$id", params: { id: b.gigId } })}
                  >
                    Try booking again
                  </Button>
                ) : null}

                {b.status === "accepted" || b.status === "completed" ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setChatBooking(b)}>
                      <MessagesSquare className="mr-2 h-4 w-4" /> Discuss with developer
                    </Button>
                    {b.status === "completed" ? (
                      ratedBookingIds.has(b.id) ? (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> You rated
                          this delivery
                        </span>
                      ) : (
                        <Button size="sm" onClick={() => setReviewBooking(b)}>
                          <Star className="mr-2 h-4 w-4" /> Rate creator
                        </Button>
                      )
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ChatDialog
        booking={chatBooking}
        open={!!chatBooking}
        onOpenChange={(o) => !o && setChatBooking(null)}
      />
      <ReviewDialog
        booking={reviewBooking}
        open={!!reviewBooking}
        onOpenChange={(o) => !o && setReviewBooking(null)}
        onSubmitted={() => {
          queryClient.invalidateQueries({ queryKey: ["client-reviews", user!.uid] });
          setReviewBooking(null);
        }}
      />
    </div>
  );
}
