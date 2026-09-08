"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setStaffActive } from "./actions";

export function StaffRowActions({
  userId,
  fullName,
  isBanned,
}: {
  userId: string;
  fullName: string;
  isBanned: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await setStaffActive(userId, isBanned);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isBanned ? `${fullName} reactivated` : `${fullName} deactivated`);
      }
      setOpen(false);
    });
  }

  return (
    <>
      <Button
        variant={isBanned ? "outline" : "ghost"}
        size="sm"
        onClick={() => setOpen(true)}
        className={isBanned ? "" : "text-destructive hover:text-destructive"}
      >
        {isBanned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
        {isBanned ? "Reactivate" : "Deactivate"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBanned ? `Reactivate ${fullName}?` : `Deactivate ${fullName}?`}
            </DialogTitle>
            <DialogDescription>
              {isBanned
                ? "They'll be able to sign in again with their existing password."
                : "They won't be able to sign in anymore. Their name stays attached to any visits or redemptions they've already recorded — nothing is deleted, and you can reactivate them anytime."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isBanned ? "default" : "destructive"}
              disabled={pending}
              onClick={confirm}
            >
              {pending ? "Saving…" : isBanned ? "Reactivate" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
