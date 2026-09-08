"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Gift,
  UserCog,
  Coffee,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/supabase/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/visits/new", label: "Record Visit", icon: ReceiptText },
  { href: "/rewards", label: "Rewards", icon: Gift },
] as const;

export function AppSidebar({
  fullName,
  role,
}: {
  fullName: string;
  role: Role;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-full flex-col gap-1 p-3">
      <div className="mb-4 flex items-center gap-2 px-2 pt-1">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Coffee className="h-5 w-5" />
        </div>
        <div className="min-w-0 leading-tight">
          <p className="font-heading truncate text-sm font-bold">Soulmate</p>
          <p className="truncate text-xs text-muted-foreground">Cafe &amp; Celebration House</p>
        </div>
      </div>

      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </Link>
        );
      })}

      {role === "owner" && (
        <Link
          href="/staff"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/staff")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <UserCog className="h-4.5 w-4.5" />
          Manage Staff
        </Link>
      )}

      <div className="mt-auto rounded-xl bg-sidebar-accent/60 px-3 py-2.5 text-xs text-sidebar-foreground">
        <p className="font-semibold">{fullName}</p>
        <p className="capitalize text-muted-foreground">{role}</p>
      </div>
    </nav>
  );
}
