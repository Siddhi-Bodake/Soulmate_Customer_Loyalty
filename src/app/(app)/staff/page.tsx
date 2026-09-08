import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateStaffDialog } from "./create-staff-dialog";
import { StaffRowActions } from "./staff-row-actions";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  const owner = await requireOwner();
  const supabase = await createClient();

  const [{ data: staff }, { data: authUsers }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: true }),
    createAdminClient().auth.admin.listUsers({ perPage: 200 }),
  ]);

  const bannedById = new Map(
    (authUsers?.users ?? []).map((u) => [
      u.id,
      !!u.banned_until && new Date(u.banned_until) > new Date(),
    ])
  );

  return (
    <div>
      <PageHeader
        title="Manage Staff"
        description="Owner-only. Create logins for the people who work the counter."
        action={<CreateStaffDialog />}
      />

      <Card className="max-w-2xl">
        <CardContent className="divide-y divide-border p-0">
          {(staff ?? []).map((member) => {
            const isBanned = bannedById.get(member.id) ?? false;
            const isSelf = member.id === owner.id;

            return (
              <div key={member.id} className="flex items-center justify-between gap-3 px-6 py-4">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate font-medium">
                    {member.full_name}
                    {isSelf && <span className="text-muted-foreground"> (you)</span>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={member.role === "owner" ? "default" : "secondary"} className="capitalize">
                    {member.role}
                  </Badge>
                  <Badge variant={isBanned ? "destructive" : "outline"}>
                    {isBanned ? "Deactivated" : "Active"}
                  </Badge>
                  {!isSelf && (
                    <StaffRowActions
                      userId={member.id}
                      fullName={member.full_name}
                      isBanned={isBanned}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
