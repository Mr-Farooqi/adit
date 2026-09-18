import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { getCreatorStats, getUserProfile, listCreatorReviews } from "@/lib/db";
import type { AppUser } from "@/lib/types";
import { ProfileView } from "@/components/profile-view";
import { ProfileForm } from "@/components/profile-form";

export function ProfileInner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<AppUser | null>(null);

  const statsQuery = useQuery({
    queryKey: ["creator-stats", user?.uid],
    queryFn: () => getCreatorStats(user!.uid),
    enabled: !!user,
  });

  const reviewsQuery = useQuery({
    queryKey: ["creator-reviews", user?.uid],
    queryFn: () => listCreatorReviews(user!.uid),
    enabled: !!user,
  });


  useEffect(() => {
    let active = true;
    (async () => {
      if (!user) return;
      const p = await getUserProfile(user.uid);
      if (!active) return;
      setData(
        p ?? {
          uid: user.uid,
          name: user.displayName ?? "",
          email: user.email ?? "",
        },
      );
      setLoading(false);
    })().catch(() => setLoading(false));
    return () => {
      active = false;
    };
  }, [user?.uid]);

  if (loading || !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground">
            {user?.email} — clients ye details tumhare gigs ke saath dekhte hain.
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)}>
            <Pencil className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        )}
      </div>

      {editing ? (
        <ProfileForm
          initial={data}
          onSaved={() => {
            setEditing(false);
            if (user) getUserProfile(user.uid).then((p) => p && setData(p));
          }}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <ProfileView user={data} stats={statsQuery.data} reviews={reviewsQuery.data ?? []} />
      )}
    </div>
  );
}
