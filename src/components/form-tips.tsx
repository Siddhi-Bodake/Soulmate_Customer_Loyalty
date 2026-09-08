import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FormTips({
  title,
  items,
}: {
  title: string;
  items: { icon: LucideIcon; text: string }[];
}) {
  return (
    <Card className="hidden h-fit bg-accent/40 lg:block">
      <CardContent className="pt-6">
        <p className="font-heading text-sm font-bold text-foreground">{title}</p>
        <ul className="mt-4 space-y-4">
          {items.map(({ icon: Icon, text }, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <p className="text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
