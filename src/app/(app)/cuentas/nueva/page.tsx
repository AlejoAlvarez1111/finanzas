"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ACCOUNT_TYPES } from "@/lib/accounts";
import { createAccount, type AccountFormState } from "../actions";

export default function NuevaCuentaPage() {
  const [state, action, pending] = useActionState<AccountFormState, FormData>(createAccount, {});

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 p-5 md:p-8">
      <header>
        <Link href="/cuentas" className="text-sm font-semibold text-brand-2">
          ← Cuentas
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nueva cuenta</h1>
      </header>

      <form action={action} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
        <label className="flex flex-col gap-1 text-sm text-muted">
          Nombre
          <input className="field text-ink" name="name" placeholder="Nequi" maxLength={40} required />
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted">
          Tipo
          <select className="field text-ink" name="type" defaultValue="cash">
            {Object.entries(ACCOUNT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-muted">
          Saldo inicial (COP)
          <input className="field text-ink" name="initial_balance" inputMode="numeric" placeholder="0" />
          <span className="text-xs">Lo que ya tienes hoy en esta cuenta.</span>
        </label>

        {state.error && (
          <p role="alert" className="rounded-xl bg-expense/10 px-3 py-2 text-sm text-expense">
            {state.error}
          </p>
        )}

        <button className="btn-primary" disabled={pending}>
          {pending ? "Guardando…" : "Crear cuenta"}
        </button>
      </form>
    </main>
  );
}