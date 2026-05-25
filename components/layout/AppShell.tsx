import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserButton } from "@clerk/nextjs";

export function AppShell({
  children,
  title,
  action,
}: {
  children: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {title ? (
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
          <div
            className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <div className="flex items-center gap-1">
              {action}
              <ThemeToggle />
              <UserButton appearance={{ elements: { avatarBox: "size-8" } }} />
            </div>
          </div>
        </header>
      ) : null}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-[calc(5rem+env(safe-area-inset-bottom))] pt-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
