import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GigCard } from "@/components/gig-card";
import { SetupNotice } from "@/components/setup-notice";
import { getCreatorStatsBulk, listGigs } from "@/lib/db";
import { CATEGORIES } from "@/lib/types";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SkillSwap — Hire Young Creators" },
      {
        name: "description",
        content:
          "Browse and book gigs from young creators in design, video editing, tutoring and music.",
      },
      { property: "og:title", content: "SkillSwap — Hire Young Creators" },
      {
        property: "og:description",
        content:
          "Browse and book gigs from young creators in design, video editing, tutoring and music.",
      },
    ],
  }),
  component: BrowsePage,
});

function BrowsePage() {
  const { configured } = useAuth();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState("newest");

  const gigsQuery = useQuery({
    queryKey: ["gigs"],
    queryFn: listGigs,
    enabled: configured,
  });

  const gigs = gigsQuery.data ?? [];
  const creatorKey = [...new Set(gigs.map((g) => g.creatorId))].sort().join(",");

  const statsQuery = useQuery({
    queryKey: ["creator-stats-map", creatorKey],
    queryFn: () => getCreatorStatsBulk(creatorKey.split(",").filter(Boolean)),
    enabled: configured && creatorKey.length > 0,
  });
  const statsMap = statsQuery.data ?? {};

  const filtered = useMemo(() => {
    let out = gigs;
    if (category !== "All") out = out.filter((g) => g.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.creatorName.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q),
      );
    }
    switch (sort) {
      case "price-asc":
        out = [...out].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        out = [...out].sort((a, b) => b.price - a.price);
        break;
      case "rating":
        out = [...out].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      default:
        out = [...out].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    }
    return out;
  }, [gigs, query, category, sort]);

  if (!configured) return <SetupNotice />;

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 text-center">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="mr-1 h-3.5 w-3.5 text-primary" /> A marketplace for young creators
          </Badge>
          <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Work with talented young creators
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Design, video editing, tutoring and music — posted by students, booked in minutes.
          </p>
          <div className="relative mx-auto mt-6 max-w-xl">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search gigs — logo, editing, guitar, maths…"
              className="h-12 pl-9"
              aria-label="Search gigs"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {["All", ...CATEGORIES].map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort gigs"
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {gigsQuery.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 rounded-2xl border p-4">
                  <Skeleton className="h-36 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            : filtered.map((gig) => (
                <GigCard key={gig.id} gig={gig} stats={statsMap[gig.creatorId]} />
              ))}
        </div>

        {!gigsQuery.isLoading && filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-lg font-semibold">
              {gigs.length === 0 ? "No gigs yet" : "No gigs match your search"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {gigs.length === 0
                ? "Be the first creator to post a service."
                : "Try a different keyword or category."}
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
