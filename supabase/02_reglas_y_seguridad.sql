-- Mis finanzas · Parte B: índices, reglas de integridad, saldos y seguridad

-- ---------- Índices ----------
create index on transactions (user_id, occurred_on desc);
create index on transactions (user_id, account_id, occurred_on desc);
create index on transactions (user_id, category_id, occurred_on desc);
create index on transactions using gin (note gin_trgm_ops);
create index on transaction_tags (tag_id);
create unique index on transactions (recurring_rule_id, occurred_on)
  where recurring_rule_id is not null;

-- ---------- Reglas con triggers ----------
create function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger transactions_updated_at before update on transactions
  for each row execute function set_updated_at();

create function check_category_parent() returns trigger language plpgsql as $$
begin
  if new.parent_id is not null and exists (
    select 1 from categories p
    where p.id = new.parent_id and (p.parent_id is not null or p.kind <> new.kind)
  ) then
    raise exception 'Subcategoría inválida: máximo un nivel y mismo tipo que la categoría padre';
  end if;
  return new;
end $$;

create trigger categories_parent_check before insert or update on categories
  for each row execute function check_category_parent();

-- ---------- Saldo por cuenta ----------
create view account_balances with (security_invoker = true) as
select
  a.id as account_id,
  a.user_id,
  a.initial_balance + coalesce(sum(
    case
      when t.kind = 'income' and t.account_id = a.id then t.amount
      when t.kind = 'expense' and t.account_id = a.id then -t.amount
      when t.kind = 'transfer' and t.account_id = a.id then -t.amount
      when t.kind = 'transfer' and t.to_account_id = a.id then t.amount
      when t.kind = 'adjustment' and t.account_id = a.id then t.amount
      else 0
    end
  ), 0) as balance
from accounts a
left join transactions t on t.account_id = a.id or t.to_account_id = a.id
group by a.id;

-- ---------- Seguridad (Row Level Security) ----------
alter table profiles enable row level security;
create policy own_profile on profiles for all
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['accounts', 'categories', 'tags', 'transactions', 'recurring_rules'] loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy own_rows on %I for all using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
  end loop;
end $$;

alter table transaction_tags enable row level security;
create policy own_rows on transaction_tags for all
  using (exists (select 1 from transactions x where x.id = transaction_id and x.user_id = (select auth.uid())))
  with check (
    exists (select 1 from transactions x where x.id = transaction_id and x.user_id = (select auth.uid()))
    and exists (select 1 from tags g where g.id = tag_id and g.user_id = (select auth.uid()))
  );

-- ---------- Alta de usuario y categorías por defecto ----------
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id) values (new.id);

  insert into public.categories (user_id, name, kind)
  select new.id, n, 'expense'::public.category_kind
  from unnest(array['Alimentación', 'Transporte', 'Educación', 'Entretenimiento',
                    'Tecnología', 'Salud', 'Compras personales', 'Otros gastos']) as n
  union all
  select new.id, n, 'income'::public.category_kind
  from unnest(array['Salario', 'Trabajo independiente', 'Ventas', 'Regalos', 'Otros ingresos']) as n;

  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();