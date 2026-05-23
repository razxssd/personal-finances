import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublic = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const ALLOWED_EMAIL = process.env.ALLOWED_EMAIL ?? "capanueduard98@gmail.com";

export default clerkMiddleware(async (auth, req) => {
  if (isPublic(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn({ returnBackUrl: req.url });

  const email =
    (sessionClaims as { email?: string; primary_email?: string } | null)?.email ??
    (sessionClaims as { email?: string; primary_email?: string } | null)?.primary_email;

  if (email && email !== ALLOWED_EMAIL) {
    return NextResponse.redirect(new URL("/not-authorized", req.url));
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico|css|js)).*)",
    "/(api|trpc)(.*)",
  ],
};
