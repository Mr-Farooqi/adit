import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { DashboardInner } from "@/components/dashboard-inner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Creator Dashboard — SkillSwap" },
      {
        name: "description",
        content: "Manage your gigs and respond to client booking requests on SkillSwap.",
      },
      { property: "og:title", content: "Creator Dashboard — SkillSwap" },
      {
        property: "og:description",
        content: "Manage your gigs and respond to client booking requests on SkillSwap.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
