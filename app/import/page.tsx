import { AppShell } from "@/components/layout/AppShell";
import { ImportClient } from "./ImportClient";

export default function ImportPage() {
  return (
    <AppShell title="Import / Export">
      <ImportClient />
    </AppShell>
  );
}
