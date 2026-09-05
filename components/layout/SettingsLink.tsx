"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Settings lives in the header next to the theme toggle, not in the bottom nav:
 * the tab bar is reserved for the four data views, and this is a rare stop.
 * Hidden while you are already there.
 */
export function SettingsLink() {
  const pathname = usePathname();
  if (pathname === "/settings") return null;
  return (
    <Link
      href="/settings"
      aria-label="Settings"
      title="Settings"
      className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
    >
      <Settings className="size-4" />
    </Link>
  );
}
