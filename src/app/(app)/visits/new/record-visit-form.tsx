"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { CustomerPicker, type PickedCustomer } from "@/components/customer-picker";
import { recordVisit } from "../actions";

const POINTS_PER_DOLLAR = 1 / 10;

export function RecordVisitForm({
  initialCustomer,
}: {
  initialCustomer: PickedCustomer | null;
}) {
  const [customer, setCustomer] = useState<PickedCustomer | null>(initialCustomer);
  const [amount, setAmount] = useState("");
  const [pending, startTransition] = useTransition();
  const [lastResult, setLastResult] = useState<{ points: number; balance: number } | null>(null);

  const amountValue = parseFloat(amount);
  const validAmount = !Number.isNaN(amountValue) && amountValue > 0;
  const projectedPoints = validAmount ? Math.floor(amountValue * POINTS_PER_DOLLAR) : 0;

  const canSubmit = customer && validAmount && !pending;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer || !validAmount) return;

    startTransition(async () => {
      const result = await recordVisit(customer.id, amountValue);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLastResult({ points: result.pointsEarned, balance: result.newBalance });
      toast.success(`+${result.pointsEarned} pts recorded for ${customer.name}`);
      setCustomer({ ...customer, points_balance: result.newBalance });
      setAmount("");
    });
  }

  function startNext() {
    setCustomer(null);
    setAmount("");
    setLastResult(null);
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label>Customer</Label>
        <CustomerPicker value={customer} onSelect={setCustomer} />
      </div>

      {customer && (
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="font-heading text-lg font-bold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-muted-foreground">Current Balance</p>
              <p className="font-heading text-2xl font-bold text-primary tabular-nums">
                {customer.points_balance} pts
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount Spent</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-muted-foreground">
              $
            </span>
            <Input
              id="amount"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              className="h-16 pl-9 text-2xl font-bold tabular-nums"
              autoFocus={!!customer}
            />
          </div>
          {validAmount && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Earns {projectedPoints} point{projectedPoints === 1 ? "" : "s"} (1 pt per $10)
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="h-14 w-full text-base" disabled={!canSubmit}>
          {pending ? "Recording…" : "Record Visit"}
        </Button>
      </form>

      {lastResult && (
        <Card className="border-primary/40 bg-secondary/60">
          <CardContent className="flex items-center justify-between gap-3 pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              <p className="text-sm font-medium">
                +{lastResult.points} pts recorded. New balance: {lastResult.balance} pts.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {customer && (
                <Button
                  render={<Link href={`/customers/${customer.id}`} />}
                  nativeButton={false}
                  variant="ghost"
                  size="sm"
                >
                  View Profile
                </Button>
              )}
              <Button size="sm" onClick={startNext}>
                Next Customer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
