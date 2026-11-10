import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

// Estas pantallas dependen de la sesión del usuario, así que no se pre-renderizan.
export const instant = false;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-line bg-surface p-5 md:flex">
        <div className="flex flex-col gap-6">
          <p className="text-lg font-bold text-brand">Mis finanzas</p>
          <AppNav variant="side" />
        </div>
        <form action={signOut}>
          <p className="truncate px-4 pb-2 text-xs text-muted">{user.email}</p>
          <button className="min-h-11 w-full rounded-xl px-4 text-left text-sm text-muted">Cerrar sesión</button>
        </form>
      </aside>

      <div className="min-w-0 flex-1 pb-24 md:pb-0">{children}</div>

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        <AppNav variant="bottom" />
      </div>
    </div>
  );
}