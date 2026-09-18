import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { SetupNotice } from "@/components/setup-notice";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect:
      typeof search["redirect"] === "string" && (search["redirect"] as string).startsWith("/")
        ? (search["redirect"] as string)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — SkillSwap" },
      {
        name: "description",
        content: "Sign in or create a SkillSwap account to hire creators or sell your services.",
      },
      { property: "og:title", content: "Sign in — SkillSwap" },
      {
        property: "og:description",
        content: "Sign in or create a SkillSwap account to hire creators or sell your services.",
      },
    ],
  }),
  component: AuthPage,
});

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Tell us your name"),
});

function AuthPage() {
  const { configured } = useAuth();
  if (!configured) return <SetupNotice />;
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Tabs defaultValue="signin">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>
        <TabsContent value="signin">
          <SignInCard />
        </TabsContent>
        <TabsContent value="signup">
          <SignUpCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SignInCard() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState(false);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthShell title="Welcome back" description="Sign in to manage your gigs and bookings.">
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setBusy(true);
          try {
            await signIn(values.email, values.password);
            toast.success("Signed in!");
            navigate({ to: redirect ?? "/" });
          } catch (err) {
            toast.error("Sign in failed", {
              description: err instanceof Error ? err.message : "Something went wrong",
            });
          } finally {
            setBusy(false);
          }
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="signin-email">Email</Label>
          <Input id="signin-email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signin-password">Password</Label>
          <Input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}

function SignUpCard() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState(false);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  return (
    <AuthShell
      title="Join SkillSwap"
      description="Create a free account to hire creators or list your own services."
    >
      <form
        onSubmit={form.handleSubmit(async (values) => {
          setBusy(true);
          try {
            await signUp(values.name, values.email, values.password);
            toast.success("Account created", { description: "You're signed in. Welcome!" });
            navigate({ to: redirect ?? "/" });
          } catch (err) {
            toast.error("Sign up failed", {
              description: err instanceof Error ? err.message : "Something went wrong",
            });
          } finally {
            setBusy(false);
          }
        })}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="signup-name">Full name</Label>
          <Input id="signup-name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-email">Email</Label>
          <Input id="signup-email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="signup-password">Password</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
