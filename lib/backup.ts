"use client";

import { exportAllAsJson } from "@/lib/import/actions";

/**
 * Downloads the full JSON export. Shared by the Import page and the Settings
 * danger zone, where it is the one safety net before a dataset is wiped.
 */
export async function downloadJsonBackup(): Promise<void> {
  const json = await exportAllAsJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `personal-finances-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
