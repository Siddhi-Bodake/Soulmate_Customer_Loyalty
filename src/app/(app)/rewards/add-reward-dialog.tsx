"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createReward } from "./actions";

export function AddRewardDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createReward(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Reward added");
      formRef.current?.reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" variant="outline" />}>
        <Plus className="h-4 w-4" />
        Add Reward
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Reward</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reward-name">Reward Name</Label>
            <Input id="reward-name" name="name" placeholder="Free Coffee" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reward-points">Points Required</Label>
            <Input
              id="reward-points"
              name="points_required"
              type="number"
              min={1}
              placeholder="50"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add Reward"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
