import { Link } from "@tanstack/react-router";
import {
  Clapperboard,
  Code2,
  GraduationCap,
  Music,
  Palette,
  PenLine,
  Star,
  Clock,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category, CreatorStats, Gig } from "@/lib/types";

const CATEGORY_STYLE: Record<Category, { gradient: string; icon: typeof Palette }> = {
  Design: { gradient: "from-violet-500/90 to-fuchsia-500/90", icon: Palette },
  "Video Editing": { gradient: "from-sky-500/90 to-cyan-500/90", icon: Clapperboard },
  Tutoring: { gradient: "from-amber-500/90 to-orange-500/90", icon: GraduationCap },
  Music: { gradient: "from-emerald-500/90 to-teal-500/90", icon: Music },
  Coding: { gradient: "from-slate-600/90 to-slate-800/90", icon: Code2 },
  Writing: { gradient: "from-rose-500/90 to-pink-500/90", icon: PenLine },
};

export function GigCard({ gig, stats }: { gig: Gig; stats?: CreatorStats | undefined }) {
  const style = CATEGORY_STYLE[gig.category] ?? CATEGORY_STYLE.Design;
  const Icon = style.icon;

  return (
    <Link
      to="/gig/$id"
      params={{ id: gig.id }}
      className="group block overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${style.gradient}`}
      >
        <Icon className="h-12 w-12 text-white/90 transition-transform group-hover:scale-110" />
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 bg-white/90 text-foreground"
        >
          {gig.category}
        </Badge>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 font-semibold">{gig.title}</h3>
        <p className="text-sm text-muted-foreground">by {gig.creatorName}</p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs text-muted-foreground">
          {stats?.rating != null ? (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {stats.rating.toFixed(1)}
              <span className="font-normal text-muted-foreground">({stats.reviewsCount})</span>
            </span>
          ) : null}
          {(stats?.completedCount ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-primary" />
              {stats?.completedCount} project{stats?.completedCount === 1 ? "" : "s"} delivered
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Time to reach: {gig.deliveryDays} day{gig.deliveryDays === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-baseline justify-between border-t pt-2">
          <span className="text-sm text-muted-foreground">from</span>
          <span className="text-lg font-bold text-primary">₹{gig.price.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </Link>
  );
}
