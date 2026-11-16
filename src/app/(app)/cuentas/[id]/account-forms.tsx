"use client";

import { useActionState } from "react";
import { ACCOUNT_TYPES } from "@/lib/accounts";
import { formatCOP } from "@/lib/format";
import { adjustBalance, archiveAccount, updateAccount, type AccountFormState } from "../actions";

const initial: AccountFormState = {};

function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-expense/10 px-3 py-2 text-sm text-expense">
      {message}
    </p>
  );
}

export function AccountForms({
  id,
  name,
  type,
  balance,
}: {
  id: string;
  name: string;
  type: string;
  balance: number;
}) {
  const [editState, editAction, editPending] = useActionState<AccountFormState, FormData>(updateAccount, initial);
  const [adjState, adjAction, adjPending] = useActionState<AccountFormState, FormData>(adjustBalance, initial);
  const [archState, archAction, archPending] = useActionState<AccountFormState, FormData>(archiveAccount, initial);

  return (
    <div className="flex flex-col gap-5">
      <section className="bg-hero rounded-3xl p-6 text-white">
        <p className="text-sm text-[#cdebdd]">Saldo actual</p>
        <p className="mt-1 text-4xl font-bold">{formatCOP(balance)}</p>
      </section>

      <form action={editAction} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-bold">Datos de la cuenta</h2>
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-1 text-sm text-muted">
          Nombre
          <input className="field text-ink" name="name" defaultValue={name} maxLength={40} required />
        </label>
        <label className="flex flex-col gap-1 text-sm text-muted">
          Tipo
          <select className="field text-ink" name="type" defaultValue={type}>
            {Object.entries(ACCOUNT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <ErrorText message={editState.error} />
        <button className="btn-primary" disabled={editPending}>
          {editPending ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>

      <form action={adjAction} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-bold">Ajustar saldo</h2>
        <p className="text-sm text-muted">
          Escribe cuánto hay realmente en esta cuenta. La app registra la diferencia como un ajuste aparte: no cuenta
          como ingreso ni como gasto.
        </p>
        <input type="hidden" name="id" value={id} />
        <label className="flex flex-col gap-1 text-sm text-muted">
          Saldo real (COP)
          <input className="field text-ink" name="target" inputMode="numeric" placeholder={String(balance)} required />
        </label>
        <ErrorText message={adjState.error} />
        <button className="btn-primary" disabled={adjPending}>
          {adjPending ? "Registrando…" : "Registrar ajuste"}
        </button>
      </form>

      <form action={archAction} className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5">
        <h2 className="font-bold">Archivar cuenta</h2>
        <p className="text-sm text-muted">
          La cuenta deja de aparecer en la lista y en el saldo total, pero su historial se conserva. Solo se puede
          archivar cuando su saldo es $0.
        </p>
        <input type="hidden" name="id" value={id} />
        <ErrorText message={archState.error} />
        <button className="min-h-12 rounded-2xl border border-line font-semibold text-expense" disabled={archPending}>
          {archPending ? "Archivando…" : "Archivar cuenta"}
        </button>
      </form>
    </div>
  );
}