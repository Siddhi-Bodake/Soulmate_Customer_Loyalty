import Link from "next/link";
import { Users, Sparkles, Trophy, ReceiptText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VisitsChart } from "./visits-chart";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const supabase = await createClient();

  const [customersCount, pointsIssued, topCustomers, visitTrend] = await Promise.all([
    supabase.from("customers").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("points_earned"),
    supabase.rpc("top_loyal_customers", { p_limit: 5 }),
    supabase.rpc("visits_last_7_days"),
  ]);

  const totalCustomers = customersCount.count ?? 0;
  const totalPointsIssued =
    pointsIssued.data?.reduce((sum, v) => sum + v.points_earned, 0) ?? 0;

  return {
    totalCustomers,
    totalPointsIssued,
    topCustomers: topCustomers.data ?? [],
    visitTrend: visitTrend.data ?? [],
  };
}

export default async function DashboardPage() {
  const { totalCustomers, totalPointsIssued, topCustomers, visitTrend } =
    await getDashboardData();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="How the loyalty program is doing today."
        action={
          <Button render={<Link href="/visits/new" />} nativeButton={false} size="lg">
            <ReceiptText className="h-4 w-4" />
            Record a Visit
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
              <Users className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="font-heading text-3xl font-bold tabular-nums">
                {totalCustomers.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
              <Sparkles className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Points Issued</p>
              <p className="font-heading text-3xl font-bold tabular-nums">
                {totalPointsIssued.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent">
              <Trophy className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Most Loyal Customer</p>
              <p className="font-heading truncate text-xl font-bold">
                {topCustomers[0]?.name ?? "—"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Visits — last 7 days</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitsChart data={visitTrend} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Most Loyal Customers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {topCustomers.length === 0 && (
              <p className="text-sm text-muted-foreground">No visits recorded yet.</p>
            )}
            {topCustomers.map((row, i) => (
              <Link
                key={row.customer_id}
                href={`/customers/${row.customer_id}`}
                className="flex items-center justify-between rounded-lg px-2 py-2.5 hover:bg-muted"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{row.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.total_visits} visits
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {row.points_balance} pts
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
