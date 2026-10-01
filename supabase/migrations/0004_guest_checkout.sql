-- Guest checkout + online (Paystack) payment support
alter table orders
  add column access_token uuid not null default gen_random_uuid(),   -- unguessable key for guests to view their order
  add column payment_method text not null default 'cod' check (payment_method in ('cod','online')),
  add column is_guest boolean not null default false,
  add column ip_hash text;                                             -- HMAC of the buyer's IP, for rate limiting only
create index on orders (email, created_at);
create index on orders (ip_hash, created_at);
-- Public bucket for product images: upload in the Supabase dashboard (Storage > products), then paste the public URL in /admin/products
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict do nothing;
