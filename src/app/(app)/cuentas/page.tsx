import Link from "next/link";
import { ACCOUNT_TYPES, type AccountType } from "@/lib/accounts";
import { formatCOP } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

const BADGE: Record<AccountType, string> = {
  cash: "bg-income/10 text-income",
  bank: "bg-brand-2/10 text-brand-2",
  wallet: "bg-lime/50 text-brand",
  other: "bg-muted/10 text-muted",
};

export default async function CuentasPage() {
  const supabase = await createClient();
  const [{ data: accounts, error }, { data: balances }] = await Promise.all([
    supabase.from("accounts").select("id, name, type").eq("archived", false).order("created_at"),
    supabase.from("account_balances").select("account_id, balance"),
  ]);

  const balanceById = new Map((balances ?? []).map((b) => [b.account_id, Number(b.balance)]));
  const rows = (accounts ?? []).map((a) => ({ ...a, balance: balanceById.get(a.id) ?? 0 }));
  const total = rows.reduce((sum, a) => sum + a.balance, 0);

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-5 p-5 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Cuentas</h1>
        <Link href="/cuentas/nueva" className="btn-primary">
          + Agregar cuenta
        </Link>
      </header>

      <section className="bg-hero rounded-3xl p-6 text-white">
        <p className="text-sm text-[#cdebdd]">Saldo total</p>
        <p className="mt-1 text-4xl font-bold">{formatCOP(total)}</p>
      </section>

      {error && (
        <p role="alert" className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          No pudimos leer tus cuentas. Inténtalo de nuevo.
        </p>
      )}

      {rows.length === 0 && !error ? (
        <p className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          Aún no tienes cuentas. Crea la primera: efectivo, banco, Nequi o Daviplata.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
              <div
                aria-hidden="true"
                className={`flex size-11 shrink-0 items-center justify-center rounded-full font-bold ${BADGE[a.type as AccountType]}`}
              >
                {a.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{a.name}</p>
                <p className="text-xs text-muted">{ACCOUNT_TYPES[a.type as AccountType]}</p>
              </div>
              <p className="font-bold">{formatCOP(a.balance)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}