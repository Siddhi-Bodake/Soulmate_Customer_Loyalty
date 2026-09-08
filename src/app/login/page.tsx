import { LoginForm } from "./login-form";
import { LoginHeader } from "./login-header";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <LoginHeader />
        {reason === "timeout" && (
          <p className="mb-4 rounded-lg bg-accent/60 px-3 py-2 text-center text-sm text-accent-foreground">
            Your session expired after 24 hours — please sign in again.
          </p>
        )}
        <LoginForm next={next} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Owner or Staff — sign in with the same email and password either way.
          What you can do inside is decided automatically by your account.
        </p>
      </div>
    </div>
  );
}
