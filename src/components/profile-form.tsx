import { useState } from "react";
import {
  FileText,
  Languages as LanguagesIcon,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { saveUserProfile } from "@/lib/db";
import type { AppUser, Project } from "@/lib/types";

function TagInput({
  label,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const parts = draft
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...values];
    for (const p of parts) {
      if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v) => (
            <Badge key={v} variant="secondary" className="gap-1 py-1 pl-3 pr-1.5">
              {v}
              <button
                type="button"
                aria-label={`Remove ${v}`}
                className="rounded-full p-0.5 hover:bg-background/60"
                onClick={() => onChange(values.filter((x) => x !== v))}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProfileForm({
  initial,
  onSaved,
  onCancel,
}: {
  initial: AppUser;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(initial.name ?? "");
  const [headline, setHeadline] = useState(initial.headline ?? "");
  const [location, setLocation] = useState(initial.location ?? "");
  const [bio, setBio] = useState(initial.bio ?? "");
  const [resumeUrl, setResumeUrl] = useState(initial.resumeUrl ?? "");
  const [skills, setSkills] = useState<string[]>(initial.skills ?? []);
  const [languages, setLanguages] = useState<string[]>(initial.languages ?? []);
  const [projects, setProjects] = useState<Project[]>(initial.projects ?? []);

  const onSave = async () => {
    if (!user) return;
    if (name.trim().length < 2) {
      toast.error("Please enter your name.");
      return;
    }
    if (resumeUrl && !/^https?:\/\//i.test(resumeUrl)) {
      toast.error("Resume link should start with http:// or https://");
      return;
    }
    setSaving(true);
    try {
      await saveUserProfile(user.uid, {
        name: name.trim(),
        email: user.email ?? "",
        headline: headline.trim(),
        location: location.trim(),
        bio: bio.trim(),
        resumeUrl: resumeUrl.trim(),
        skills,
        languages,
        projects: projects
          .filter((p) => p.title.trim())
          .map((p) => ({
            title: p.title.trim(),
            description: p.description.trim(),
            link: p.link?.trim() ?? "",
          })),
      });
      await refreshProfile();
      toast.success("Profile saved");
      onSaved();
    } catch {
      toast.error("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic details</CardTitle>
          <CardDescription>Your public identity on SkillSwap.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Pune, India"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              placeholder="Video editor & motion designer"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">About you</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell clients about your experience, tools you use and what makes your work stand out."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" /> Resume
          </CardTitle>
          <CardDescription>
            Paste a public link to your resume (Google Drive, Notion, Dropbox or a PDF URL).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="https://drive.google.com/file/d/..."
            value={resumeUrl}
            onChange={(e) => setResumeUrl(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Skills & languages
          </CardTitle>
          <CardDescription>Type and press Enter, or separate with commas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TagInput
            label="Skills"
            placeholder="Figma, Premiere Pro, React…"
            values={skills}
            onChange={setSkills}
          />
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <LanguagesIcon className="h-4 w-4" /> Languages you speak
            </div>
            <TagInput
              label="Languages"
              placeholder="English, Hindi, Marathi…"
              values={languages}
              onChange={setLanguages}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Show off the work you're proud of.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {projects.map((p, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-4">
              <div className="flex items-start gap-2">
                <Input
                  placeholder="Project title"
                  value={p.title}
                  onChange={(e) =>
                    setProjects(
                      projects.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove project"
                  onClick={() => setProjects(projects.filter((_, j) => j !== i))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                rows={3}
                placeholder="What did you build, for whom, and what was the result?"
                value={p.description}
                onChange={(e) =>
                  setProjects(
                    projects.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)),
                  )
                }
              />
              <Input
                placeholder="Link (optional) — https://…"
                value={p.link ?? ""}
                onChange={(e) =>
                  setProjects(projects.map((x, j) => (j === i ? { ...x, link: e.target.value } : x)))
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => setProjects([...projects, { title: "", description: "", link: "" }])}
          >
            <Plus className="mr-2 h-4 w-4" /> Add project
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={saving} size="lg">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save profile
        </Button>
      </div>
    </div>
  );
}
