import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Inbox,
  MessagesSquare,
  MoreVertical,
  Pencil,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GigForm, type GigFormValues } from "@/components/gig-form";
import { ChatDialog } from "@/components/chat-dialog";
import {
  deleteGig,
  incrementCompletedCount,
  listGigs,
  listCreatorBookings,
  setBookingStatus,
  updateGig,
} from "@/lib/db";
import { STATUS_LABEL, type Booking, type Gig } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export function DashboardInner() {
  const { user, configured } = useAuth();
  const [editing, setEditing] = useState<Gig | null>(null);
  const [deleting, setDeleting] = useState<Gig | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const gigsQuery = useQuery({
    queryKey: ["gigs"],
    queryFn: listGigs,
    enabled: configured && !!user,
  });

  const requestsQuery = useQuery({
    queryKey: ["creator-bookings", user?.uid],
    queryFn: () => listCreatorBookings(user!.uid),
    enabled: configured && !!user,
  });

  if (!user) return null;

  const myGigs = (gigsQuery.data ?? []).filter((g) => g.creatorId === user.uid);
  const requests = requestsQuery.data ?? [];
  const pendingCount = requests.filter((b) => b.status === "pending").length;

  async function handleDelete() {
    if (!deleting) return;
    try {
      await deleteGig(deleting.id);
    } catch (err) {
      setDeleting(null);
      toast.error("Could not delete", { description: (err as Error).message });
      return;
    }
    setDeleting(null);
    queryClient.invalidateQueries({ queryKey: ["gigs"] });
    toast.success("Gig deleted");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Creator Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your listings and respond to booking requests.
          </p>
        </div>
        <Button onClick={() => navigate({ to: "/post" })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Post a Gig
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Active gigs" value={myGigs.length} />
        <StatCard label="Pending requests" value={pendingCount} />
        <StatCard
          label="Total bookings"
          value={requests.length}
        />
      </div>

      <Tabs defaultValue="gigs" className="mt-8">
        <TabsList>
          <TabsTrigger value="gigs">My Gigs ({myGigs.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests{" "}
            {pendingCount > 0 ? (
              <span className="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {pendingCount}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gigs" className="mt-4">
          {gigsQuery.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : myGigs.length === 0 ? (
            <EmptyState
              icon={PlusCircle}
              title="You haven't posted any gigs yet"
              body="Publish your first service and clients can start booking you."
            />
          ) : (
            <div className="space-y-3">
              {myGigs.map((gig) => (
                <Card key={gig.id}>
                  <CardContent className="flex flex-wrap items-center gap-4 py-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold">{gig.title}</h3>
                        <Badge variant="secondary">{gig.category}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ₹{gig.price.toLocaleString("en-IN")} · Time to reach:{" "}
                        {gig.deliveryDays} day{gig.deliveryDays === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm" onClick={() => setEditing(gig)}>
                        <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="More actions">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleting(gig)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-4">
          <BookingRequestList
            requests={requests}
            loading={requestsQuery.isLoading}
            onChanged={() => {
              if (user) {
                queryClient.invalidateQueries({ queryKey: ["creator-bookings", user.uid] });
                queryClient.invalidateQueries({ queryKey: ["bookings", user.uid] });
              }
            }}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit gig</DialogTitle>
            <DialogDescription>Update your listing — changes are visible immediately.</DialogDescription>
          </DialogHeader>
          {editing ? (
            <GigForm
              defaultValues={{
                title: editing.title,
                category: editing.category,
                description: editing.description,
                price: editing.price,
                deliveryDays: editing.deliveryDays,
              }}
              submitLabel="Save changes"
              onSubmit={async (values: GigFormValues) => {
                try {
                  await updateGig(editing.id, values);
                } catch (err) {
                  toast.error("Could not save", { description: (err as Error).message });
                  return;
                }
                queryClient.invalidateQueries({ queryKey: ["gigs"] });
                setEditing(null);
                toast.success("Gig updated");
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this gig?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be removed permanently. Existing bookings are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Inbox;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-dashed py-14 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function BookingRequestList({
  requests,
  loading,
  onChanged,
}: {
  requests: Booking[];
  loading: boolean;
  onChanged: () => void;
}) {
  const { user } = useAuth();
  const [chatBooking, setChatBooking] = useState<Booking | null>(null);

  async function act(booking: Booking, status: Booking["status"]) {
    try {
      await setBookingStatus(booking.id, status);
      if (status === "completed" && user) {
        await incrementCompletedCount(user.uid);
      }
    } catch (err) {
      toast.error("Could not update", { description: (err as Error).message });
      return;
    }
    toast.success(`Booking ${STATUS_LABEL[status].toLowerCase()}`);
    onChanged();
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No booking requests yet"
        body="When clients book your gigs, their requests appear here."
      />
    );
  }

  return (
    <div className="space-y-3">
      {requests.map((b) => (
        <Card key={b.id}>
          <CardContent className="space-y-3 py-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold">{b.gigTitle}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {b.clientName} · {format(new Date(b.date), "d MMM yyyy")} · ₹
                  {b.gigPrice.toLocaleString("en-IN")}
                </p>
              </div>
              <StatusBadge status={b.status} />
            </div>
            {b.note ? (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">"{b.note}"</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {b.status === "pending" ? (
                <>
                  <Button size="sm" onClick={() => act(b, "accepted")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => act(b, "declined")}>
                    Decline
                  </Button>
                </>
              ) : b.status === "accepted" ? (
                <Button size="sm" onClick={() => act(b, "completed")}>
                  Mark completed
                </Button>
              ) : null}
              {b.status === "accepted" || b.status === "completed" ? (
                <Button size="sm" variant="outline" onClick={() => setChatBooking(b)}>
                  <MessagesSquare className="mr-2 h-4 w-4" /> Discuss with client
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}

      <ChatDialog
        booking={chatBooking}
        open={!!chatBooking}
        onOpenChange={(o) => !o && setChatBooking(null)}
      />
    </div>
  );
}

export function StatusBadge({ status }: { status: Booking["status"] }) {
  return <Badge variant="secondary">{STATUS_LABEL[status]}</Badge>;
}
