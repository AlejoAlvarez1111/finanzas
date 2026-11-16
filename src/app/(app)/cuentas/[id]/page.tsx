import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AccountForms } from "./account-forms";

export const instant = false;

export default async function CuentaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: account }, { data: balance }] = await Promise.all([
    supabase.from("accounts").select("id, name, type").eq("id", id).eq("archived", false).maybeSingle(),
    supabase.from("account_balances").select("balance").eq("account_id", id).maybeSingle(),
  ]);
  if (!account) notFound();

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 p-5 md:p-8">
      <header>
        <Link href="/cuentas" className="text-sm font-semibold text-brand-2">
          ← Cuentas
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{account.name}</h1>
      </header>
      <AccountForms id={account.id} name={account.name} type={account.type} balance={Number(balance?.balance ?? 0)} />
    </main>
  );
}