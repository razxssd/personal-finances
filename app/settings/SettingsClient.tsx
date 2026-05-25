"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SignOutButton } from "@clerk/nextjs";
import { deleteTag } from "@/lib/actions";
import { colorForTag, PRESET_TAGS } from "@/lib/tags";
import type { TagKind } from "@/lib/db/schema";

type CustomTag = { id: string; name: string; kind: TagKind };

const KIND_LABEL: Record<TagKind, string> = {
  investment: "Investments",
  liquidity: "Liquidity",
  income: "Income",
  expense: "Expenses",
};

export function SettingsClient({ tags }: { tags: CustomTag[] }) {
  const [pending, startTransition] = useTransition();
  const kinds: TagKind[] = ["investment", "liquidity", "income", "expense"];

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
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {KIND_LABEL[kind]}
                </p>
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
            Preset tags can't be deleted. Custom tags are created on-the-fly when you select them in a form.
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
    </div>
  );
}
