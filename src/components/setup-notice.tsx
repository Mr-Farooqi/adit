import { Database } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SetupNotice() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card>
        <CardHeader>
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Database className="h-5 w-5" />
          </span>
          <CardTitle className="text-xl">Connect your Firebase project</CardTitle>
          <CardDescription>
            SkillSwap needs your Firebase web config to load data and enable sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            1. Open <span className="font-medium text-foreground">console.firebase.google.com</span>{" "}
            → create a project.
          </p>
          <p>2. Enable Email/Password sign-in under Authentication, and create a Firestore database.</p>
          <p>
            3. Add a Web app and paste its <span className="font-medium text-foreground">firebaseConfig</span>{" "}
            values into the <span className="font-medium text-foreground">.env</span> file (steps in the README),
            then reload this page.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
