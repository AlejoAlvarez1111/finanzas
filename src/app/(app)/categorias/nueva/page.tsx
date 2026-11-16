import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { NewCategoryForm } from "./new-category-form";

export const instant = false;

export default async function NuevaCategoriaPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, kind")
    .is("parent_id", null)
    .eq("archived", false)
    .order("name");

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 p-5 md:p-8">
      <header>
        <Link href="/categorias" className="text-sm font-semibold text-brand-2">
          ← Categorías
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Nueva categoría</h1>
      </header>
      <NewCategoryForm parents={data ?? []} />
    </main>
  );
}