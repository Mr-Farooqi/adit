import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listMessages, sendMessage } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import type { Booking } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChatDialog({
  booking,
  open,
  onOpenChange,
}: {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messagesQuery = useQuery({
    queryKey: ["messages", booking?.id],
    queryFn: () => listMessages(booking!.id),
    enabled: open && !!booking,
    refetchInterval: open ? 4000 : false,
  });

  const messages = messagesQuery.data ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, open]);

  if (!booking || !user) return null;

  const isCreator = user.uid === booking.creatorId;
  const otherName = isCreator ? booking.clientName : booking.creatorName;

  async function handleSend() {
    const value = text.trim();
    if (!value || !booking || !user) return;
    setSending(true);
    try {
      await sendMessage({
        bookingId: booking.id,
        senderId: user.uid,
        senderName: profile?.name ?? user.displayName ?? user.email ?? "User",
        text: value,
      });
      setText("");
      queryClient.invalidateQueries({ queryKey: ["messages", booking.id] });
    } catch (err) {
      toast.error("Message not sent", { description: (err as Error).message });
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Discuss with {otherName}</DialogTitle>
          <DialogDescription>
            Project chat for "{booking.gigTitle}" — share details, files links and updates.
          </DialogDescription>
        </DialogHeader>

        <div className="h-72 space-y-3 overflow-y-auto rounded-lg border bg-muted/30 p-3">
          {messagesQuery.isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
              No messages yet — say hello and share the project details.
            </p>
          ) : (
            messages.map((m) => {
              const mine = m.senderId === user.uid;
              return (
                <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                      mine
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border text-foreground",
                    )}
                  >
                    {!mine && (
                      <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                        {m.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {m.createdAt ? (
                      <p
                        className={cn(
                          "mt-1 text-[10px]",
                          mine ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}
                      >
                        {format(new Date(m.createdAt), "d MMM, h:mm a")}
                      </p>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex items-center gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend();
              }
            }}
          />
          <Button onClick={() => void handleSend()} disabled={sending || !text.trim()}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
