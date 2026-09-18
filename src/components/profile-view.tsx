import {
  BadgeCheck,
  ExternalLink,
  FileText,
  Languages as LanguagesIcon,
  MapPin,
  Sparkles,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AppUser, CreatorStats, Review } from "@/lib/types";
import { cn } from "@/lib/utils";

export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            "h-4 w-4",
            value >= n - 0.25 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40",
            className,
          )}
        />
      ))}
    </span>
  );
}

export function initialsOf(name: string, fallback: string): string {
  return (name || fallback || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Read-only public profile — used on /profile (view mode) and /u/$uid (for clients). */
export function ProfileView({
  user,
  stats,
  reviews = [],
}: {
  user: AppUser;
  stats?: CreatorStats | undefined;
  reviews?: Review[] | undefined;
}) {
  const skills = user.skills ?? [];
  const languages = user.languages ?? [];
  const projects = user.projects ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
            {initialsOf(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          {user.headline && <p className="text-sm text-muted-foreground">{user.headline}</p>}
          {user.location && (
            <p className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {user.location}
            </p>
          )}
        </div>
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardContent className="flex items-center gap-3 py-5">
              <Star className="h-8 w-8 fill-amber-400 text-amber-400" />
              <div>
                <p className="text-2xl font-bold tracking-tight">
                  {stats.rating != null ? stats.rating.toFixed(1) : "—"}
                </p>
                <div className="flex items-center gap-2">
                  {stats.rating != null && <Stars value={stats.rating} />}
                  <span className="text-xs text-muted-foreground">
                    {stats.reviewsCount} rating{stats.reviewsCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-5">
              <BadgeCheck className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold tracking-tight">{stats.completedCount}</p>
                <p className="text-xs text-muted-foreground">Projects delivered successfully</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Client reviews</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.gigTitle}
                      {r.createdAt ? ` · ${format(new Date(r.createdAt), "d MMM yyyy")}` : ""}
                    </p>
                  </div>
                  <Stars value={Number(r.rating ?? 0)} />
                </div>
                {r.comment && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    "{r.comment}"
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {user.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">{user.bio}</p>
          </CardContent>
        </Card>
      )}

      {(skills.length > 0 || languages.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> Skills & languages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" className="px-3 py-1">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
            {languages.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <LanguagesIcon className="h-4 w-4 text-muted-foreground" />
                {languages.map((l) => (
                  <Badge key={l} variant="outline" className="px-3 py-1">
                    {l}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {projects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((p, i) => (
              <div key={i} className="rounded-xl border p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold">{p.title}</h3>
                  {p.link && /^https?:\/\//i.test(p.link) && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      View <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                {p.description && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {p.description}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {user.resumeUrl && /^https?:\/\//i.test(user.resumeUrl) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-primary" /> Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={user.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Open resume <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </CardContent>
        </Card>
      )}

      {!user.bio && skills.length === 0 && projects.length === 0 && !user.headline && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            This user hasn't added profile details yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
