import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateStaffDialog } from "./create-staff-dialog";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await requireOwner();
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Manage Staff"
        description="Owner-only. Create logins for the people who work the counter."
        action={<CreateStaffDialog />}
      />

      <Card className="max-w-2xl">
        <CardContent className="divide-y divide-border p-0">
          {(staff ?? []).map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4">
              <p className="font-medium">{member.full_name}</p>
              <Badge variant={member.role === "owner" ? "default" : "secondary"} className="capitalize">
                {member.role}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
