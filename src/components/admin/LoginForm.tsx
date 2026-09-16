"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginFormState } from "@/app/admin/login/actions";

const INITIAL_STATE: LoginFormState = {};

export function LoginForm() {
  const [state, formAction] = useActionState(signIn, INITIAL_STATE);

  return (
    <form action={formAction} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-system-blue dark:border-white/15 dark:bg-white/5"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-system-blue dark:border-white/15 dark:bg-white/5"
        />
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-system-blue px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-60"
    >
      {pending ? "Connexion…" : "Se connecter"}
    </button>
  );
}
