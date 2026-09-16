import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Connexion — Backoffice",
};

export default function AdminLoginPage() {
  return (
    <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-neutral-50 p-6 dark:bg-neutral-950">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-semibold">Backoffice</h1>
        <LoginForm />
      </div>
    </div>
  );
}
