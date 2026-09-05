"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@clerk/nextjs";
import { BottomSheet } from "@/components/forms/BottomSheet";
import { deleteAllTags, deleteTag, resetDataset } from "@/lib/actions";
import { downloadJsonBackup } from "@/lib/backup";
import { colorForTag, PRESET_TAGS, TAG_KINDS } from "@/lib/tags";
import type { TagKind } from "@/lib/db/schema";

type CustomTag = { id: string; name: string; kind: TagKind };

const KIND_LABEL: Record<TagKind, string> = {
  investment: "Investments",
  liquidity: "Liquidity",
  income: "Income",
  expense: "Expenses",
};

export function SettingsClient({
  tags,
  counts,
}: {
  tags: CustomTag[];
  counts: Record<TagKind, number>;
}) {
  const [pending, startTransition] = useTransition();
  const [resetKind, setResetKind] = useState<TagKind | null>(null);
  const [backingUp, setBackingUp] = useState(false);
  const kinds = TAG_KINDS;

  const rowLabel = (n: number) => `${n} ${n === 1 ? "row" : "rows"}`;

  function handleReset(kind: TagKind) {
    startTransition(async () => {
      try {
        const { deleted } = await resetDataset(kind);
        setResetKind(null);
        toast.success(`${KIND_LABEL[kind]} cleared — ${rowLabel(deleted)} deleted`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  function handleClearTags(kind: TagKind, n: number) {
    if (!confirm(`Delete all ${n} custom ${KIND_LABEL[kind]} tags? Preset tags stay.`)) return;
    startTransition(async () => {
      try {
        const { deleted } = await deleteAllTags(kind);
        toast.success(`${deleted} custom ${KIND_LABEL[kind]} ${deleted === 1 ? "tag" : "tags"} deleted`);
      } catch (e) {
        toast.error((e as Error).message);
      }
    });
  }

  async function handleBackup() {
    setBackingUp(true);
    try {
      await downloadJsonBackup();
      toast.success("Backup downloaded");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBackingUp(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {kinds.map((kind, idx) => {
            const custom = tags.filter((t) => t.kind === kind);
            return (
              <div key={kind} className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {KIND_LABEL[kind]}
                  </p>
                  {custom.length > 0 ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={pending}
                      onClick={() => handleClearTags(kind, custom.length)}
                    >
                      <Trash2 className="size-3.5" />
                      Delete {custom.length} custom
                    </Button>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_TAGS[kind].map((name) => (
                    <Badge
                      key={name}
                      variant="secondary"
                      style={{ backgroundColor: `${colorForTag(name)}1f`, color: colorForTag(name) }}
                    >
                      {name}
                    </Badge>
                  ))}
                  {custom.map((t) => (
                    <Badge
                      key={t.id}
                      variant="outline"
                      className="gap-1 pr-1"
                      style={{ borderColor: colorForTag(t.name), color: colorForTag(t.name) }}
                    >
                      {t.name}
                      <button
                        type="button"
                        className="ml-1 -mr-0.5 size-4 rounded-full hover:bg-muted inline-flex items-center justify-center"
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Delete custom tag "${t.name}"?`)) return;
                          startTransition(async () => {
                            try {
                              await deleteTag(t.id);
                              toast.success("Tag deleted");
                            } catch (e) {
                              toast.error((e as Error).message);
                            }
                          });
                        }}
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {idx < kinds.length - 1 ? <Separator className="mt-2" /> : null}
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground">
            Preset tags can&apos;t be deleted. Custom tags are created on-the-fly when you select them in a form.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <SignOutButton>
            <Button variant="outline" size="sm">
              Sign out
            </Button>
          </SignOutButton>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-4" />
            Danger zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Clear one dataset at a time, so you can re-import it from scratch. Only that
            dataset is touched — the other three and your tags are left alone.
          </p>
          <div className="space-y-2">
            {kinds.map((kind) => (
              <div
                key={kind}
                className="flex items-center justify-between gap-3 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{KIND_LABEL[kind]}</p>
                  <p className="text-xs text-muted-foreground">{rowLabel(counts[kind])}</p>
                </div>
                <Button
                  variant="destructive"
                  disabled={pending || counts[kind] === 0}
                  onClick={() => setResetKind(kind)}
                >
                  <Trash2 className="size-4" />
                  Delete all
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {resetKind ? (
        <BottomSheet
          open
          onOpenChange={(v) => {
            if (!v) setResetKind(null);
          }}
          title={`Delete all ${KIND_LABEL[resetKind]}?`}
          description={`This permanently deletes ${rowLabel(counts[resetKind])}. It can't be undone.`}
          footer={
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={pending}
                onClick={() => setResetKind(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={pending}
                onClick={() => handleReset(resetKind)}
              >
                {pending ? "Deleting…" : `Delete ${rowLabel(counts[resetKind])}`}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            Your custom tags stay, so a re-import lands on the same categories. Grab a
            backup first if you want a way back.
          </p>
          <Button
            variant="outline"
            className="w-full"
            disabled={backingUp}
            onClick={handleBackup}
          >
            <Download className="size-4" />
            {backingUp ? "Preparing…" : "Download backup (JSON)"}
          </Button>
        </BottomSheet>
      ) : null}
    </div>
  );
}
