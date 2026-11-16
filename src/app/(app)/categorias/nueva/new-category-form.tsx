"use client";

import { useActionState } from "react";
import { createCategory, type CategoryFormState } from "../actions";

type Parent = { id: string; name: string; kind: "income" | "expense" };

export function NewCategoryForm({ parents }: { parents: Parent[] }) {
  const [state, action, pending] = useActionState<CategoryFormState, FormData>(createCategory, {});

  return (
    <form action={action} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5">
      <label className="flex flex-col gap-1 text-sm text-muted">
        Nombre
        <input className="field text-ink" name="name" placeholder="Mascotas" maxLength={40} required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Tipo
        <select className="field text-ink" name="kind" defaultValue="expense">
          <option value="expense">Gasto</option>
          <option value="income">Ingreso</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Dentro de (opcional)
        <select className="field text-ink" name="parent_id" defaultValue="">
          <option value="">Ninguna: es una categoría principal</option>
          <optgroup label="Gastos">
            {parents
              .filter((p) => p.kind === "expense")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Ingresos">
            {parents
              .filter((p) => p.kind === "income")
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </optgroup>
        </select>
        <span className="text-xs">Si eliges una categoría, la nueva será su subcategoría y tomará su tipo.</span>
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-expense/10 px-3 py-2 text-sm text-expense">
          {state.error}
        </p>
      )}

      <button className="btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Crear categoría"}
      </button>
    </form>
  );
}
