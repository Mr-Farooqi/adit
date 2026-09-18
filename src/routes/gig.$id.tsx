import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  CalendarDays,
  Clock,
  Loader2,
  MessageSquareText,
  Star,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getGig, createBooking } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "@/components/setup-notice";

export const Route = createFileRoute("/gig/$id")({
  head: () => ({
    meta: [
      { title: "Gig details — SkillSwap" },
      {
        name: "description",
        content: "View gig details and book this creator's service on SkillSwap.",
      },
      { property: "og:title", content: "Gig details — SkillSwap" },
      {
        property: "og:description",
        content: "View gig details and book this creator's service on SkillSwap.",
      },
    ],
  }),
  component: GigDetailPage,
});

function GigDetailPage() {
  const { id } = Route.useParams();
  const { user, profile, configured } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return format(d, "yyyy-MM-dd");
  });
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const gigQuery = useQuery({ queryKey: ["gig", id], queryFn: () => getGig(id), enabled: configured });

  if (!configured) return <SetupNotice />;

  if (gigQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-10">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-6 w-2/3" />
      </div>
    );
  }

  if (!gigQuery.data) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Gig not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed by its creator.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
          Browse gigs
        </Button>
      </div>
    );
  }

  const gig = gigQuery.data;
  const isOwnGig = user && gig.creatorId === user.uid;

  async function handleBook() {
    if (!user || !gig) return;
    setBusy(true);
    try {
      await createBooking({
        gigId: gig.id,
        gigTitle: gig.title,
        gigPrice: gig.price,
        clientId: user.uid,
        clientName: profile?.name ?? user.email ?? "Client",
        creatorId: gig.creatorId,
        creatorName: gig.creatorName,
        date,
        note,
      });
    } catch (err) {
      setBusy(false);
      toast.error("Booking failed", { description: (err as Error).message });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["bookings", user.uid] });
    toast.success("Booking requested!", {
      description: "Track its status in My Bookings.",
    });
    navigate({ to: "/bookings" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex h-56 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-teal-500/80">
            <Star className="h-16 w-16 text-white/90" />
          </div>
          <div>
            <Badge variant="secondary">{gig.category}</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{gig.title}</h1>
            <p className="mt-2 text-muted-foreground">
              Offered by{" "}
              <Link
                to="/u/$uid"
                params={{ uid: gig.creatorId }}
                className="font-medium text-primary hover:underline"
              >
                {gig.creatorName}
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-6 rounded-xl border bg-card p-4 text-sm">
            <span className="inline-flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" />
              <strong>₹{gig.price.toLocaleString("en-IN")}</strong> fixed price
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Time to reach: <strong>{gig.deliveryDays} day{gig.deliveryDays === 1 ? "" : "s"}</strong>
            </span>
            {gig.rating ? (
              <span className="inline-flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <strong>{gig.rating.toFixed(1)}</strong> rating
              </span>
            ) : null}
          </div>
          <div>
            <h2 className="text-lg font-semibold">About this gig</h2>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {gig.description}
            </p>
          </div>
        </div>

        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Book this gig</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwnGig ? (
                <p className="text-sm text-muted-foreground">
                  This is your own gig — you can't book it. Manage it from your dashboard.
                </p>
              ) : user ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="booking-date">
                      <CalendarDays className="mr-1 inline h-4 w-4 text-primary" />
                      Preferred date
                    </Label>
                    <Input
                      id="booking-date"
                      type="date"
                      value={date}
                      min={format(new Date(), "yyyy-MM-dd")}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="booking-note">
                      <MessageSquareText className="mr-1 inline h-4 w-4 text-primary" />
                      Note for {gig.creatorName} (optional)
                    </Label>
                    <Textarea
                      id="booking-note"
                      rows={4}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Share context, links or deadlines…"
                    />
                  </div>
                  <div className="flex items-baseline justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ₹{gig.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <Button className="w-full" size="lg" disabled={busy} onClick={handleBook}>
                    {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Request booking
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    The creator reviews and confirms your request.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    Sign in to book this gig and message the creator.
                  </p>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() =>
                      navigate({ to: "/auth", search: { redirect: window.location.pathname } })
                    }
                  >
                    Sign in to book
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
