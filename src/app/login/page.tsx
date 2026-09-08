import { LoginPanel } from "./login-panel";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; reason?: string }>;
}) {
  const { next, reason } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {reason === "timeout" && (
          <p className="mb-4 rounded-lg bg-accent/60 px-3 py-2 text-center text-sm text-accent-foreground">
            Your session expired after 24 hours — please sign in again.
          </p>
        )}
        <LoginPanel next={next} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Choose Owner or Staff above to match your account — using the wrong
          one will be rejected.
        </p>
      </div>
    </div>
  );
}
