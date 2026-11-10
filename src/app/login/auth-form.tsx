"use client";

import { useActionState, useState } from "react";
import { authAction, type AuthState } from "./actions";

type Mode = "ingresar" | "crear";

export function AuthForm() {
  const [mode, setMode] = useState<Mode>("ingresar");
  const [state, action, pending] = useActionState<AuthState, FormData>(authAction, {});
  const creating = mode === "crear";

  return (
    <form action={action} className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{creating ? "Crea tu cuenta" : "Inicia sesión"}</h2>
      <input type="hidden" name="mode" value={mode} />

      <label className="flex flex-col gap-1 text-sm text-muted">
        Correo
        <input className="field text-ink" name="email" type="email" autoComplete="email" required />
      </label>

      <label className="flex flex-col gap-1 text-sm text-muted">
        Contraseña
        <input
          className="field text-ink"
          name="password"
          type="password"
          autoComplete={creating ? "new-password" : "current-password"}
          minLength={8}
          required
        />
      </label>

      {state.error && (
        <p role="alert" className="rounded-xl bg-expense/10 px-3 py-2 text-sm text-expense">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="rounded-xl bg-income/10 px-3 py-2 text-sm text-income">
          {state.message}
        </p>
      )}

      <button className="btn-primary" disabled={pending}>
        {pending ? "Un momento…" : creating ? "Crear cuenta" : "Iniciar sesión"}
      </button>

      <button
        type="button"
        className="min-h-11 text-sm font-semibold text-brand-2"
        onClick={() => setMode(creating ? "ingresar" : "crear")}
      >
        {creating ? "Ya tengo cuenta" : "Crear una cuenta"}
      </button>
    </form>
  );
}