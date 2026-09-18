import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, type Category, type Gig } from "@/lib/types";

const gigSchema = z.object({
  title: z.string().min(8, "Title should be at least 8 characters"),
  category: z.enum(CATEGORIES),
  description: z.string().min(30, "Describe your service in at least 30 characters"),
  price: z.coerce.number().int("Enter a whole number").min(50, "Minimum ₹50").max(500000),
  deliveryDays: z.coerce.number().int().min(1, "At least 1 day").max(60),
});

export type GigFormValues = z.infer<typeof gigSchema>;

export function GigForm({
  defaultValues,
  submitLabel,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<GigFormValues>;
  submitLabel: string;
  onSubmit: (values: GigFormValues) => void;
  submitting?: boolean;
}) {
  const form = useForm<GigFormValues>({
    resolver: zodResolver(gigSchema),
    defaultValues: {
      title: "",
      category: "Design",
      description: "",
      price: 500,
      deliveryDays: 3,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="gig-title">Gig title</Label>
        <Input
          id="gig-title"
          placeholder="I will design a modern logo for your brand"
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select
            value={form.watch("category")}
            onValueChange={(value) => form.setValue("category", value as Category)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gig-price">Price (₹)</Label>
          <Input id="gig-price" type="number" min={50} {...form.register("price")} />
          {form.formState.errors.price && (
            <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gig-delivery">Time to reach (days)</Label>
        <Input id="gig-delivery" type="number" min={1} {...form.register("deliveryDays")} />
        {form.formState.errors.deliveryDays && (
          <p className="text-sm text-destructive">{form.formState.errors.deliveryDays.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gig-description">Describe your service</Label>
        <Textarea
          id="gig-description"
          rows={5}
          placeholder="What exactly do you deliver? What makes your work special? What do you need from the client?"
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {submitLabel}
      </Button>
    </form>
  );
}
