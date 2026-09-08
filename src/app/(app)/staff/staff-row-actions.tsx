"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { UserX, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setStaffActive, deleteStaffAccount } from "./actions";

export function StaffRowActions({
  userId,
  fullName,
  isBanned,
}: {
  userId: string;
  fullName: string;
  isBanned: boolean;
}) {
  const [confirmAction, setConfirmAction] = useState<"toggle" | "delete" | null>(null);
  const [pending, startTransition] = useTransition();

  function confirmToggle() {
    startTransition(async () => {
      const result = await setStaffActive(userId, isBanned);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(isBanned ? `${fullName} reactivated` : `${fullName} deactivated`);
      }
      setConfirmAction(null);
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteStaffAccount(userId);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${fullName} deleted`);
      }
      setConfirmAction(null);
    });
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant={isBanned ? "outline" : "ghost"}
          size="sm"
          onClick={() => setConfirmAction("toggle")}
          className={isBanned ? "" : "text-destructive hover:text-destructive"}
        >
          {isBanned ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
          {isBanned ? "Reactivate" : "Deactivate"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmAction("delete")}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Dialog open={confirmAction === "toggle"} onOpenChange={(o) => !o && setConfirmAction(null)}>
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
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              variant={isBanned ? "default" : "destructive"}
              disabled={pending}
              onClick={confirmToggle}
            >
              {pending ? "Saving…" : isBanned ? "Reactivate" : "Deactivate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmAction === "delete"} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently delete {fullName}?</DialogTitle>
            <DialogDescription>
              This removes their login entirely — it can&apos;t be undone (unlike Deactivate).
              Any visits or redemptions they recorded stay in your history, just without a name
              attached to them. If you might want them back later, use{" "}
              <span className="font-medium text-foreground">Deactivate</span> instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={pending} onClick={confirmDelete}>
              {pending ? "Deleting…" : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
