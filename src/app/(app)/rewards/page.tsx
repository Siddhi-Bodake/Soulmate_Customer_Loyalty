import { createClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { RewardsBoard } from "./rewards-board";
import { AddRewardDialog } from "./add-reward-dialog";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const profile = await requireStaff();
  const supabase = await createClient();

  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("active", true)
    .order("points_required", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Rewards & Redeem"
        description="Pick a customer, then redeem a reward against their points."
        action={profile.role === "owner" ? <AddRewardDialog /> : undefined}
      />
      <RewardsBoard rewards={rewards ?? []} />
    </div>
  );
}
