import { AppShell } from "@/components/layout/AppShell";
import { SettingsClient } from "./SettingsClient";
import { datasetCounts, listTags } from "@/lib/db/queries";
import type { TagKind } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [tags, counts] = await Promise.all([listTags(), datasetCounts()]);
  return (
    <AppShell title="Settings">
      <SettingsClient
        tags={tags.map((t) => ({ id: t.id, name: t.name, kind: t.kind as TagKind }))}
        counts={counts}
      />
    </AppShell>
  );
}
