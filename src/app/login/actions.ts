"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string };

export async function authAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const mode = String(formData.get("mode") ?? "ingresar");
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) return { error: "Escribe tu correo." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const supabase = await createClient();

  if (mode === "crear") {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
  console.error("signUp:", error);
  return { error: error.message };
}
    if (!data.session) return { message: "Te enviamos un correo para confirmar tu cuenta." };
    redirect("/");
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Correo o contraseña incorrectos." };
  redirect("/");
}