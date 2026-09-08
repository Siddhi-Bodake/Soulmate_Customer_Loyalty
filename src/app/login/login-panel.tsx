"use client";

import { useState } from "react";
import { LoginHeader } from "./login-header";
import { LoginForm } from "./login-form";

export type LoginMode = "owner" | "staff";

export function LoginPanel({ next }: { next?: string }) {
  const [mode, setMode] = useState<LoginMode>("owner");

  return (
    <>
      <LoginHeader mode={mode} onModeChange={setMode} />
      <LoginForm next={next} mode={mode} />
    </>
  );
}
