import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { archiveCategory } from "./actions";

export const instant = false;

type Category = { id: string; name: string; kind: "income" | "expense"; parent_id: string | null };

const GROUPS = [
  { kind: "expense", title: "Gastos" },
  { kind: "income", title: "Ingresos" },
] as const;

function ArchiveButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={archiveCategory}>
      <input type="hidden" name="id" value={id} />
      <button aria-label={`Archivar ${name}`} className="min-h-11 rounded-xl px-3 text-sm text-muted">
        Archivar
      </button>
    </form>
  );
}

export default async function CategoriasPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, kind, parent_id")
    .eq("archived", false)
    .order("name");
  const cats = (data ?? []) as Category[];

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-6 p-5 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Link href="/categorias/nueva" className="btn-primary">
          + Nueva categoría
        </Link>
      </header>

      {error && (
        <p role="alert" className="rounded-2xl border border-line bg-surface p-4 text-sm text-muted">
          No pudimos leer tus categorías. Inténtalo de nuevo.
        </p>
      )}

      {GROUPS.map(({ kind, title }) => {
        const parents = cats.filter((c) => c.kind === kind && !c.parent_id);
        return (
          <section key={kind} className="flex flex-col gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted">{title}</h2>
            {parents.length === 0 ? (
              <p className="text-sm text-muted">Aún no hay categorías.</p>
            ) : (
              parents.map((p) => {
                const children = cats.filter((c) => c.parent_id === p.id);
                return (
                  <div key={p.id} className="rounded-2xl border border-line bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{p.name}</p>
                      <ArchiveButton id={p.id} name={p.name} />
                    </div>
                    {children.length > 0 && (
                      <ul className="mt-3 flex flex-col gap-1 border-t border-line pt-3">
                        {children.map((c) => (
                          <li key={c.id} className="flex items-center justify-between gap-3 pl-4 text-sm">
                            <span>{c.name}</span>
                            <ArchiveButton id={c.id} name={c.name} />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </section>
        );
      })}
    </main>
  );
}