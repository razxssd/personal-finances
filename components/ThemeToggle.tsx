"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        size="icon-sm"
        variant="ghost"
        aria-label="Cambia tema"
        className="opacity-0 pointer-events-none"
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  const active = theme ?? resolvedTheme ?? "dark";
  const next: "light" | "dark" | "system" =
    active === "dark" ? "light" : active === "light" ? "system" : "dark";

  const Icon = active === "dark" ? Moon : active === "light" ? Sun : Monitor;
  const label =
    active === "dark"
      ? "Tema scuro (passa a chiaro)"
      : active === "light"
        ? "Tema chiaro (passa a sistema)"
        : "Tema sistema (passa a scuro)";

  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" />
    </Button>
  );
}
