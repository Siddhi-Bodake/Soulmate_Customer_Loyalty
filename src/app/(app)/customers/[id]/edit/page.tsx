import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { PointsDisplay } from "@/components/points-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CustomerForm } from "../../customer-form";
import { updateCustomer } from "../../actions";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: customer } = await supabase
    .from("customers")
    .select("name, phone, email, points_balance, joined_date")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const boundAction = updateCustomer.bind(null, id);

  return (
    <div>
      <PageHeader title="Edit Customer" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <CustomerForm
          action={boundAction}
          defaultValues={customer}
          submitLabel="Save Changes"
        />
        <Card className="hidden h-fit bg-accent/40 lg:block">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground">Current Points Balance</p>
            <PointsDisplay points={customer.points_balance} className="mt-1" />
            <p className="mt-4 text-sm text-muted-foreground">
              Member since {format(new Date(customer.joined_date), "MMMM d, yyyy")}
            </p>
            <Button
              render={<Link href={`/customers/${id}`} />}
              nativeButton={false}
              variant="outline"
              className="mt-5 w-full"
            >
              View Full Profile
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
