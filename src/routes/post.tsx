import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GigForm, type GigFormValues } from "@/components/gig-form";
import { RequireAuth } from "@/components/require-auth";
import { createGig } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post a Gig — SkillSwap" },
      {
        name: "description",
        content: "List your design, video editing, tutoring or music service on SkillSwap.",
      },
      { property: "og:title", content: "Post a Gig — SkillSwap" },
      {
        property: "og:description",
        content: "List your design, video editing, tutoring or music service on SkillSwap.",
      },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  return (
    <RequireAuth>
      <PostForm />
    </RequireAuth>
  );
}

function PostForm() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Post a Gig</h1>
      <p className="mt-2 text-muted-foreground">
        Describe your service clearly — good titles and honest delivery times get booked faster.
      </p>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Gig details</CardTitle>
          <CardDescription>This is what clients see when they browse.</CardDescription>
        </CardHeader>
        <CardContent>
          <GigForm
            submitLabel="Publish gig"
            submitting={busy}
            onSubmit={async (values: GigFormValues) => {
              if (!user) return;
              setBusy(true);
              try {
                await createGig({
                  creatorId: user.uid,
                  creatorName: profile?.name ?? user.email ?? "Creator",
                  ...values,
                });
              } catch (err) {
                setBusy(false);
                toast.error("Could not publish", { description: (err as Error).message });
                return;
              }
              setBusy(false);
              queryClient.invalidateQueries({ queryKey: ["gigs"] });
              toast.success("Gig published!", {
                description: "Clients can now find and book it.",
              });
              navigate({ to: "/dashboard" });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
