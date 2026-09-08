import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Pencil, ReceiptText, Phone, Mail, CalendarDays, Gift, Coffee } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { PointsDisplay } from "@/components/points-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteCustomerButton } from "./delete-customer-button";

export const dynamic = "force-dynamic";

type TimelineEntry =
  | { type: "visit"; id: string; date: string; amount_spent: number; points_earned: number; staff: string | null }
  | { type: "redemption"; id: string; date: string; reward_name: string; points_used: number; staff: string | null };

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireStaff();
  const supabase = await createClient();

  const [{ data: customer }, { data: visits }, { data: redemptions }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).single(),
    supabase
      .from("visits")
      .select("id, visit_date, amount_spent, points_earned, profiles(full_name)")
      .eq("customer_id", id)
      .order("visit_date", { ascending: false }),
    supabase
      .from("redemptions")
      .select("id, redeemed_at, points_used, rewards(name), profiles(full_name)")
      .eq("customer_id", id)
      .order("redeemed_at", { ascending: false }),
  ]);

  if (!customer) notFound();

  const timeline: TimelineEntry[] = [
    ...(visits ?? []).map((v) => ({
      type: "visit" as const,
      id: v.id,
      date: v.visit_date,
      amount_spent: v.amount_spent,
      points_earned: v.points_earned,
      staff: v.profiles?.full_name ?? null,
    })),
    ...(redemptions ?? []).map((r) => ({
      type: "redemption" as const,
      id: r.id,
      date: r.redeemed_at,
      reward_name: r.rewards?.name ?? "Reward",
      points_used: r.points_used,
      staff: r.profiles?.full_name ?? null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={`Member since ${format(new Date(customer.joined_date), "MMMM d, yyyy")}`}
        action={
          <div className="flex gap-2">
            <Button
              render={<Link href={`/customers/${id}/edit`} />}
              nativeButton={false}
              variant="outline"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              render={<Link href={`/visits/new?customer=${id}`} />}
              nativeButton={false}
              size="lg"
            >
              <ReceiptText className="h-4 w-4" />
              Record Visit
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Points Balance</p>
            <PointsDisplay points={customer.points_balance} size="xl" className="mt-1" />

            <div className="mt-6 space-y-3 border-t border-border pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" /> {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" /> {customer.email}
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Member since {format(new Date(customer.joined_date), "MMM d, yyyy")}
              </div>
            </div>

            {profile.role === "owner" && (
              <div className="mt-6 border-t border-border pt-4">
                <DeleteCustomerButton customerId={id} customerName={customer.name} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Visit &amp; Points History</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No activity yet — record their first visit to get started.
              </p>
            )}
            <ul className="divide-y divide-border">
              {timeline.map((entry) => (
                <li key={`${entry.type}-${entry.id}`} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        entry.type === "visit" ? "bg-accent" : "bg-secondary"
                      }`}
                    >
                      {entry.type === "visit" ? (
                        <Coffee className="h-4 w-4 text-accent-foreground" />
                      ) : (
                        <Gift className="h-4 w-4 text-secondary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {entry.type === "visit"
                          ? `Visit — $${entry.amount_spent.toFixed(2)} spent`
                          : `Redeemed — ${entry.reward_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")}
                        {entry.staff ? ` · ${entry.staff}` : ""}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={entry.type === "visit" ? "default" : "secondary"}
                    className="shrink-0 tabular-nums"
                  >
                    {entry.type === "visit" ? `+${entry.points_earned}` : `-${entry.points_used}`} pts
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
