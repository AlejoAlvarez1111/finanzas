-- Corrección: el trigger de categorías debe indicar su esquema explícitamente
create or replace function check_category_parent() returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.parent_id is not null and exists (
    select 1 from public.categories p
    where p.id = new.parent_id and (p.parent_id is not null or p.kind <> new.kind)
  ) then
    raise exception 'Subcategoría inválida: máximo un nivel y mismo tipo que la categoría padre';
  end if;
  return new;
end $$;