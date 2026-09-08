"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { searchCustomers } from "@/app/(app)/customers/actions";

export type PickedCustomer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  points_balance: number;
};

export function CustomerPicker({
  value,
  onSelect,
}: {
  value: PickedCustomer | null;
  onSelect: (customer: PickedCustomer) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PickedCustomer[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handle = setTimeout(() => {
      startTransition(async () => {
        const data = await searchCustomers(query);
        setResults(data);
      });
    }, 150);
    return () => clearTimeout(handle);
  }, [query, open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="h-14 w-full justify-between px-4 text-base"
          />
        }
      >
        <span className="flex items-center gap-2 truncate">
          <User className="h-4 w-4 shrink-0 text-muted-foreground" />
          {value ? (
            <span className="truncate font-medium">
              {value.name} · {value.phone}
            </span>
          ) : (
            <span className="text-muted-foreground">Search customer by name or phone…</span>
          )}
        </span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[--anchor-width] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder="Type a name or phone…"
          />
          <CommandList>
            <CommandEmpty>
              {isPending ? "Searching…" : "No customers found."}
            </CommandEmpty>
            <CommandGroup>
              {results.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.id}
                  onSelect={() => {
                    onSelect(c);
                    setOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 py-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value?.id === c.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                    {c.points_balance} pts
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
