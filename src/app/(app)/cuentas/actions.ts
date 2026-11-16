"use server";

import { redirect } from "next/navigation";
import { ACCOUNT_TYPES } from "@/lib/accounts";
import { todayInBogota } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";

export type AccountFormState = { error?: string };

function parseName(formData: FormData) {
  return String(formData.get("name") ?? "").trim();
}

function validate(name: string, type: string): string | null {
  if (!name) return "Escribe un nombre para la cuenta.";
  if (name.length > 40) return "El nombre es demasiado largo (máximo 40 caracteres).";
  if (!(type in ACCOUNT_TYPES)) return "Elige un tipo de cuenta.";
  return null;
}

export async function createAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const name = parseName(formData);
  const type = String(formData.get("type") ?? "");
  const initial = Number(String(formData.get("initial_balance") ?? "").replace(/\D/g, "") || 0);

  const invalid = validate(name, type);
  if (invalid) return { error: invalid };
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

export async function updateAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const id = String(formData.get("id") ?? "");
  const name = parseName(formData);
  const type = String(formData.get("type") ?? "");

  const invalid = validate(name, type);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase.from("accounts").update({ name, type }).eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya tienes una cuenta con ese nombre." };
    return { error: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  }
  redirect("/cuentas");
}

export async function adjustBalance(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const id = String(formData.get("id") ?? "");
  const raw = String(formData.get("target") ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return { error: "Escribe el saldo real de la cuenta." };
  const target = Number(digits) * (raw.startsWith("-") ? -1 : 1);
  if (!Number.isSafeInteger(target)) return { error: "El saldo no es válido." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: current } = await supabase
    .from("account_balances")
    .select("balance")
    .eq("account_id", id)
    .maybeSingle();
  if (!current) return { error: "No encontramos la cuenta." };

  const difference = target - Number(current.balance);
  if (difference === 0) return { error: "El saldo ya coincide, no hay nada que ajustar." };

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    kind: "adjustment",
    amount: difference,
    occurred_on: todayInBogota(),
    account_id: id,
    note: "Ajuste de saldo",
  });
  if (error) return { error: "No pudimos registrar el ajuste. Inténtalo de nuevo." };
  redirect("/cuentas");
}

export async function archiveAccount(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("account_balances")
    .select("balance")
    .eq("account_id", id)
    .maybeSingle();
  if (!current) return { error: "No encontramos la cuenta." };
  if (Number(current.balance) !== 0) {
    return { error: "Para archivar la cuenta, su saldo debe ser $0. Pasa el dinero a otra cuenta primero." };
  }

  const { error } = await supabase.from("accounts").update({ archived: true }).eq("id", id);
  if (error) return { error: "No pudimos archivar la cuenta. Inténtalo de nuevo." };
  redirect("/cuentas");
}