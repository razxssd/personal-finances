import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

export default function NotAuthorizedPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Accesso non autorizzato</h1>
      <p className="text-muted-foreground max-w-md">
        Questa app è privata. Solo l&apos;account proprietario può accedere ai dati.
      </p>
      <SignOutButton>
        <button className="rounded-md border px-4 py-2 text-sm font-medium">Esci</button>
      </SignOutButton>
      <Link href="/sign-in" className="text-sm underline text-muted-foreground">
        Cambia account
      </Link>
    </main>
  );
}
