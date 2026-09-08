"use client";

import { useState } from "react";
import { Crown, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = {
  owner: {
    icon: Crown,
    title: "Owner Login",
    description: "Full access — manage staff, rewards, and every customer.",
  },
  staff: {
    icon: Users,
    title: "Staff Login",
    description: "Record visits and redeem rewards at the counter.",
  },
} as const;

export function LoginHeader() {
  const [mode, setMode] = useState<"owner" | "staff">("owner");
  const { icon: Icon, title, description } = MODES[mode];

  return (
    <div className="mb-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl">
        ☕
      </div>
      <h1 className="font-heading text-xl font-bold text-foreground">
        Soulmate Cafe &amp; Celebration House
      </h1>

      <div className="mx-auto mt-5 flex w-fit rounded-xl bg-muted p-1">
        {(Object.keys(MODES) as Array<keyof typeof MODES>).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              mode === key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {key === "owner" ? <Crown className="h-4 w-4" /> : <Users className="h-4 w-4" />}
            {key === "owner" ? "Owner" : "Staff"}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
