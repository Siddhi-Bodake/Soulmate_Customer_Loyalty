import Link from "next/link";
import { format } from "date-fns";
import { UserPlus, ReceiptText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchBar } from "./search-bar";

export const dynamic = "force-dynamic";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("customers_with_stats")
    .select("*")
    .order("joined_date", { ascending: false });

  if (q?.trim()) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`);
  }

  const { data: customers } = await query;

  return (
    <div>
      <PageHeader
        title="Customers"
        description={`${customers?.length ?? 0} customer${customers?.length === 1 ? "" : "s"}`}
        action={
          <Button render={<Link href="/customers/new" />} nativeButton={false} size="lg">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Button>
        }
      />

      <div className="mb-4 max-w-sm">
        <SearchBar defaultValue={q ?? ""} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                  <TableHead className="text-right">Visits</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right">Quick Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(customers ?? []).map((c) => (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link href={`/customers/${c.id}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                    <TableCell className="text-right font-bold text-primary tabular-nums">
                      {c.points_balance}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      {c.total_visits}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(c.joined_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        render={<Link href={`/visits/new?customer=${c.id}`} />}
                        nativeButton={false}
                        variant="ghost"
                        size="sm"
                      >
                        <ReceiptText className="h-4 w-4" />
                        Record Visit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(customers ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No customers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
