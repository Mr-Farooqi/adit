import { useState } from "react";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createReview } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ReviewDialog({
  booking,
  open,
  onOpenChange,
  onSubmitted,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitted: () => void;
}) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  if (!booking || !user) return null;

  async function submit() {
    if (!booking || !user) return;
    setSaving(true);
    try {
      await createReview({
        bookingId: booking.id,
        gigId: booking.gigId,
        gigTitle: booking.gigTitle,
        creatorId: booking.creatorId,
        clientId: user.uid,
        clientName: profile?.name ?? user.displayName ?? "Client",
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Thanks for the rating!");
      onSubmitted();
      onOpenChange(false);
    } catch (err) {
      toast.error("Could not save rating", { description: (err as Error).message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {booking.creatorName}</DialogTitle>
          <DialogDescription>
            How was the delivery of "{booking.gigTitle}"? Your rating shows on their profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="rounded-md p-1 transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  "h-7 w-7",
                  (hover || rating) >= n
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/40",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">{rating}/5</span>
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share a few words about the work (optional)"
          rows={4}
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Submit rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
