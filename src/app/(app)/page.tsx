import { formatCOP } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function InicioPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("account_balances").select("balance");

  const accounts = data ?? [];
  const total = accounts.reduce((sum, row) => sum + Number(row.balance), 0);
  const month = new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date());

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <header>
        <p className="text-sm capitalize text-muted">{month}</p>
        <h1 className="text-2xl font-bold">Inicio</h1>
      </header>

      <section className="bg-hero rounded-3xl p-6 text-white">
        <p className="text-sm text-[#cdebdd]">Saldo total disponible</p>
        <p className="mt-1 text-4xl font-bold">{formatCOP(total)}</p>
      </section>

      {error ? (
        <p role="alert" className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          No pudimos leer tus cuentas. Revisa que las tablas existan en Supabase.
        </p>
      ) : accounts.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          Aún no tienes cuentas. En el siguiente módulo podrás crear la primera: efectivo, banco, Nequi o Daviplata.
        </p>
      ) : null}
    </main>
  );
}