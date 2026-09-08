import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-2xl">
            ☕
          </div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Soulmate Cafe &amp; Celebration House
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Staff sign-in — customers never need to log in.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
