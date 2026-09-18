import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/require-auth";
import { ProfileInner } from "@/components/profile-inner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Profile — SkillSwap" },
      {
        name: "description",
        content:
          "Build your SkillSwap creator profile: resume link, skills, languages and past projects.",
      },
      { property: "og:title", content: "My Profile — SkillSwap" },
      {
        property: "og:description",
        content:
          "Build your SkillSwap creator profile: resume link, skills, languages and past projects.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileInner />
    </RequireAuth>
  );
}
