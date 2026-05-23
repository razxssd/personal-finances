"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function TagCombobox({
  value,
  onChange,
  options,
  placeholder = "Seleziona tag…",
}: {
  value: string;
  onChange: (next: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  const canCreate =
    query.trim().length > 0 &&
    !options.some((o) => o.toLowerCase() === query.trim().toLowerCase());

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "default" }),
          "h-10 w-full justify-between font-normal"
        )}
        role="combobox"
        aria-expanded={open}
      >
        <span className={cn("truncate text-left", !value && "text-muted-foreground")}>
          {value || placeholder}
        </span>
        <ChevronsUpDown className="ml-2 size-4 opacity-50 shrink-0" />
      </PopoverTrigger>
      <PopoverContent
        className="w-(--anchor-width) p-0"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cerca o crea…"
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            <CommandEmpty>Nessun tag.</CommandEmpty>
            <CommandGroup>
              {filtered.map((opt) => (
                <CommandItem
                  key={opt}
                  value={opt}
                  onSelect={() => {
                    onChange(opt);
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === opt ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt}
                </CommandItem>
              ))}
              {canCreate ? (
                <CommandItem
                  value={`__create__${query}`}
                  onSelect={() => {
                    onChange(query.trim());
                    setOpen(false);
                    setQuery("");
                  }}
                >
                  <Plus className="mr-2 size-4" />
                  Crea “{query.trim()}”
                </CommandItem>
              ) : null}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
