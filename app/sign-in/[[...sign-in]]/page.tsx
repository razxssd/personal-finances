import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <SignIn appearance={{ elements: { rootBox: "w-full max-w-md" } }} />
    </main>
  );
}
