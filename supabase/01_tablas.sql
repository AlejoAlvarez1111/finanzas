-- Mis finanzas · Parte A: tipos y tablas

create extension if not exists pg_trgm;

create type account_type as enum ('cash', 'bank', 'wallet', 'other');
create type category_kind as enum ('income', 'expense');
create type transaction_kind as enum ('income', 'expense', 'transfer', 'adjustment');
create type recurrence_frequency as enum ('weekly', 'semi_monthly', 'monthly', 'yearly');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  currency char(3) not null default 'COP',
  timezone text not null default 'America/Bogota',
  created_at timestamptz not null default now()
);

create table accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  type account_type not null default 'cash',
  initial_balance bigint not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, name)
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  parent_id uuid,
  name text not null,
  kind category_kind not null,
  color text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique nulls not distinct (user_id, kind, parent_id, name),
  foreign key (parent_id, user_id) references categories (id, user_id)
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  unique (id, user_id),
  unique (user_id, name)
);

create table recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  kind transaction_kind not null check (kind in ('income', 'expense')),
  amount bigint not null check (amount > 0),
  account_id uuid not null,
  category_id uuid not null,
  note text,
  frequency recurrence_frequency not null,
  start_date date not null,
  end_date date,
  next_run_date date not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  check (end_date is null or end_date >= start_date),
  foreign key (account_id, user_id) references accounts (id, user_id),
  foreign key (category_id, user_id) references categories (id, user_id)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  kind transaction_kind not null,
  amount bigint not null,
  occurred_on date not null,
  account_id uuid not null,
  to_account_id uuid,
  category_id uuid,
  note text,
  recurring_rule_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (account_id, user_id) references accounts (id, user_id),
  foreign key (to_account_id, user_id) references accounts (id, user_id),
  foreign key (category_id, user_id) references categories (id, user_id),
  foreign key (recurring_rule_id, user_id) references recurring_rules (id, user_id),
  constraint amount_valid check (
    (kind = 'adjustment' and amount <> 0) or (kind <> 'adjustment' and amount > 0)
  ),
  constraint shape_valid check (
    (kind in ('income', 'expense') and category_id is not null and to_account_id is null)
    or (kind = 'transfer' and to_account_id is not null and to_account_id <> account_id and category_id is null)
    or (kind = 'adjustment' and category_id is null and to_account_id is null)
  )
);

create table transaction_tags (
  transaction_id uuid not null references transactions (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (transaction_id, tag_id)
);