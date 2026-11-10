"use server";

import { redirect } from "next/navigation";
import { ACCOUNT_TYPES } from "@/lib/accounts";
import { createClient } from "@/lib/supabase/server";

export type AccountFormState = { error?: string };

export async function createAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const initial = Number(String(formData.get("initial_balance") ?? "").replace(/\D/g, "") || 0);

  if (!name) return { error: "Escribe un nombre para la cuenta." };
  if (name.length > 40) return { error: "El nombre es demasiado largo (máximo 40 caracteres)." };
  if (!(type in ACCOUNT_TYPES)) return { error: "Elige un tipo de cuenta." };
  if (!Number.isSafeInteger(initial)) return { error: "El saldo inicial no es válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("accounts")
    .insert({ user_id: user.id, name, type, initial_balance: initial });

  if (error) {
    if (error.code === "23505") return { error: "Ya tienes una cuenta con ese nombre." };
    return { error: "No pudimos crear la cuenta. Inténtalo de nuevo." };
  }
  redirect("/cuentas");
}