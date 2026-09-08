import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { RecordVisitForm } from "./record-visit-form";

export default async function RecordVisitPage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>;
}) {
  const { customer: customerId } = await searchParams;
  let initialCustomer = null;

  if (customerId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("customers")
      .select("id, name, phone, email, points_balance")
      .eq("id", customerId)
      .single();
    initialCustomer = data;
  }

  return (
    <div>
      <PageHeader
        title="Record a Visit"
        description="Search the customer, enter what they spent — points are added instantly."
      />
      <RecordVisitForm initialCustomer={initialCustomer} />
    </div>
  );
}
