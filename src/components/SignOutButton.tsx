"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center gap-2 text-sm font-medium text-indigo-950/75 transition-all hover:text-rose-600"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden xl:inline">Keluar</span>
    </button>
  );
}
