import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getCreatorStats, getUserProfile, listCreatorReviews } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "@/components/setup-notice";
import { ProfileView } from "@/components/profile-view";

export const Route = createFileRoute("/u/$uid")({
  head: () => ({
    meta: [
      { title: "Creator profile — SkillSwap" },
      {
        name: "description",
        content: "View this creator's skills, languages, projects and resume on SkillSwap.",
      },
      { property: "og:title", content: "Creator profile — SkillSwap" },
      {
        property: "og:description",
        content: "View this creator's skills, languages, projects and resume on SkillSwap.",
      },
    ],
  }),
  component: PublicProfilePage,
});

function PublicProfilePage() {
  const { uid } = Route.useParams();
  const { configured } = useAuth();
  const navigate = useNavigate();

  const profileQuery = useQuery({
    queryKey: ["user", uid],
    queryFn: () => getUserProfile(uid),
    enabled: configured,
  });

  const statsQuery = useQuery({
    queryKey: ["creator-stats", uid],
    queryFn: () => getCreatorStats(uid),
    enabled: configured,
  });

  const reviewsQuery = useQuery({
    queryKey: ["creator-reviews", uid],
    queryFn: () => listCreatorReviews(uid),
    enabled: configured,
  });

  if (!configured) return <SetupNotice />;

  if (profileQuery.isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-10">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!profileQuery.data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="mt-2 text-muted-foreground">This user may have removed their profile.</p>
        <Button className="mt-6" onClick={() => navigate({ to: "/" })}>
          Browse gigs
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <ProfileView
        user={profileQuery.data}
        stats={statsQuery.data}
        reviews={reviewsQuery.data ?? []}
      />
    </div>
  );
}
