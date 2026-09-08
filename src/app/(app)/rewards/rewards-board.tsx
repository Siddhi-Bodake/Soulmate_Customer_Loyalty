"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Gift, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CustomerPicker, type PickedCustomer } from "@/components/customer-picker";
import { redeemReward } from "./actions";
import type { Reward } from "@/lib/supabase/types";

export function RewardsBoard({ rewards }: { rewards: Reward[] }) {
  const [customer, setCustomer] = useState<PickedCustomer | null>(null);
  const [confirming, setConfirming] = useState<Reward | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmRedeem() {
    if (!customer || !confirming) return;
    const reward = confirming;
    startTransition(async () => {
      const result = await redeemReward(customer.id, reward.id);
      if ("error" in result) {
        toast.error(result.error);
        setConfirming(null);
        return;
      }
      toast.success(`Redeemed "${reward.name}" for ${customer.name}`);
      setCustomer({ ...customer, points_balance: result.newBalance });
      setConfirming(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="max-w-xl space-y-2">
        <Label>Customer</Label>
        <CustomerPicker value={customer} onSelect={setCustomer} />
      </div>

      {customer && (
        <Card className="max-w-xl border-primary/30 bg-accent/40">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-heading text-lg font-bold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Balance</p>
              <p className="font-heading text-2xl font-bold text-primary tabular-nums">
                {customer.points_balance} pts
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => {
          const affordable = customer ? customer.points_balance >= reward.points_required : false;
          return (
            <Card key={reward.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-4 pt-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary">
                  <Gift className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-heading text-lg font-bold">{reward.name}</p>
                  <p className="text-sm font-medium text-primary">
                    {reward.points_required} pts
                  </p>
                </div>
                <Button
                  className="mt-auto"
                  disabled={!customer || !affordable}
                  onClick={() => setConfirming(reward)}
                >
                  {!customer ? (
                    <>
                      <Lock className="h-4 w-4" /> Select a customer
                    </>
                  ) : !affordable ? (
                    `Needs ${reward.points_required - customer.points_balance} more pts`
                  ) : (
                    "Redeem"
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
        {rewards.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">
            No rewards set up yet.
          </p>
        )}
      </div>

      <Dialog open={!!confirming} onOpenChange={(o) => !o && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem &ldquo;{confirming?.name}&rdquo;?</DialogTitle>
            <DialogDescription>
              {customer?.name} will use {confirming?.points_required} points, leaving{" "}
              {customer && confirming ? customer.points_balance - confirming.points_required : 0}{" "}
              pts. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirming(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRedeem} disabled={pending}>
              {pending ? "Redeeming…" : "Confirm Redeem"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
