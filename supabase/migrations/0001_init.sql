-- Shop_It core schema (Supabase / PostgreSQL). Prices are stored in kobo.
create extension if not exists pgcrypto;

create type user_role as enum ('customer','admin');
create type order_status as enum ('pending','paid','processing','shipped','delivered','cancelled');

create table admin_emails (email text primary key);          -- emails that become ADMIN on first sign-in

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null, full_name text, avatar_url text, phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table categories (
  id serial primary key, slug text unique not null, name text not null
);

create table products (
  id uuid primary key default gen_random_uuid(),
  category_id int not null references categories,
  slug text unique not null, name text not null, description text,
  price_kobo bigint not null check (price_kobo >= 0),
  stock int not null default 0 check (stock >= 0),
  image_url text, is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on products (category_id) where is_active;

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default 'SI-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  user_id uuid references profiles,
  email text not null, status order_status not null default 'pending',
  subtotal_kobo bigint not null, shipping_kobo bigint not null default 0, total_kobo bigint not null,
  shipping_address jsonb not null, payment_ref text,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders on delete cascade,
  product_id uuid not null references products,
  name text not null, unit_price_kobo bigint not null, quantity int not null check (quantity > 0)
);

create table email_events (                                   -- outbox for Mailgun sends, retried by a cron route
  id uuid primary key default gen_random_uuid(),
  kind text not null, to_email text not null, payload jsonb not null,
  status text not null default 'queued', attempts int not null default 0,
  created_at timestamptz not null default now()
);

-- Create a profile on first Google sign-in; allowlisted emails become admins.
create function handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, avatar_url, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url',
    case when exists (select 1 from admin_emails a where lower(a.email) = lower(new.email)) then 'admin'::user_role else 'customer' end);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin') $$;

-- Row-level security
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table email_events enable row level security;
alter table admin_emails enable row level security;

create policy "read categories" on categories for select using (true);
create policy "read active products" on products for select using (is_active or is_admin());
create policy "admin manage products" on products for all using (is_admin()) with check (is_admin());
create policy "own profile" on profiles for select using (id = auth.uid() or is_admin());
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = 'customer');
create policy "own orders" on orders for select using (user_id = auth.uid() or is_admin());
create policy "admin update orders" on orders for update using (is_admin());
create policy "own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
-- No policies on email_events / admin_emails and no insert policy on orders: the server writes them with the service-role key.

-- Seed data (replace with real products later)
insert into categories (slug, name) values ('fashion','Fashion'),('electronics','Electronics'),('laptops','Laptops'),('phones','Phones');

insert into products (category_id, slug, name, description, price_kobo, stock)
select c.id, v.slug, v.name, v.descr, v.naira * 100, v.stock
from (values
 ('fashion','classic-white-leather-sneakers','Classic White Leather Sneakers','Everyday low-top sneakers in smooth white leather.',45000,24),
 ('fashion','slim-fit-cotton-chinos','Slim Fit Cotton Chinos','Stretch cotton chinos with a tapered leg.',28500,40),
 ('fashion','ankara-print-short-sleeve-shirt','Ankara Print Short-Sleeve Shirt','Tailored short-sleeve shirt in a bold Ankara print.',22000,3),
 ('fashion','leather-crossbody-bag','Leather Crossbody Bag','Compact crossbody bag with zip pocket and adjustable strap.',38000,15),
 ('electronics','noise-cancelling-wireless-headphones','Noise-Cancelling Wireless Headphones','Over-ear Bluetooth headphones with active noise cancellation.',85000,18),
 ('electronics','smartwatch-heart-rate','Smartwatch with Heart-Rate Monitor','Fitness smartwatch with heart-rate and sleep tracking.',65000,4),
 ('electronics','power-bank-20000mah','20,000mAh Fast-Charge Power Bank','Dual-output power bank with fast charging.',18500,60),
 ('electronics','portable-bluetooth-speaker','Portable Bluetooth Speaker','Water-resistant speaker with 12-hour battery.',32000,22),
 ('laptops','lenovo-ideapad-slim-3','Lenovo IdeaPad Slim 3 (15.6", 8GB, 512GB SSD)','Everyday laptop for study and work.',620000,9),
 ('laptops','hp-pavilion-14','HP Pavilion 14 (Core i5, 16GB, 512GB SSD)','Slim 14-inch laptop with 16GB RAM.',780000,5),
 ('phones','samsung-galaxy-a55-5g','Samsung Galaxy A55 5G (8GB, 128GB)','5G smartphone with AMOLED display.',520000,14),
 ('phones','tecno-spark-30','Tecno Spark 30 (8GB, 256GB)','Value smartphone with large storage and big battery.',165000,35)
) as v(cat, slug, name, descr, naira, stock)
join categories c on c.slug = v.cat;

-- After running this file, add your admin email:
-- insert into admin_emails values ('you@example.com');
