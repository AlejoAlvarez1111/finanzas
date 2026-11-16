"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = { error?: string };

export async function createCategory(
  _prev: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const parentId = String(formData.get("parent_id") ?? "");
  let kind = String(formData.get("kind") ?? "");

  if (!name) return { error: "Escribe un nombre para la categoría." };
  if (name.length > 40) return { error: "El nombre es demasiado largo (máximo 40 caracteres)." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (parentId) {
    const { data: parent } = await supabase
      .from("categories")
      .select("kind, parent_id")
      .eq("id", parentId)
      .maybeSingle();
    if (!parent) return { error: "No encontramos la categoría padre." };
    if (parent.parent_id) return { error: "Una subcategoría no puede tener subcategorías." };
    kind = parent.kind; // la subcategoría hereda el tipo de su padre
  }

  if (kind !== "income" && kind !== "expense") return { error: "Elige si es de gasto o de ingreso." };

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name, kind, parent_id: parentId || null });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe una categoría con ese nombre en ese lugar." };
    return { error: "No pudimos crear la categoría. Inténtalo de nuevo." };
  }
  redirect("/categorias");
}

export async function archiveCategory(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();

  // Se archiva la categoría y, si tiene, sus subcategorías. El historial se conserva.
  await supabase.from("categories").update({ archived: true }).eq("id", id);
  await supabase.from("categories").update({ archived: true }).eq("parent_id", id);

  revalidatePath("/categorias");
}