-- Atomic order placement: locks product rows, checks stock, prices server-side, decrements stock.
create function place_order(p_user uuid, p_email text, p_items jsonb, p_address jsonb)
returns table(o_id uuid, o_number text, o_total bigint) language plpgsql security definer set search_path = public as $$
declare v_sub bigint := 0; v_ship bigint; v_n int := 0; r record; v_id uuid; v_num text;
begin
  for r in select p.id, p.name, p.price_kobo, p.stock, (i->>'qty')::int as q
           from jsonb_array_elements(p_items) i join products p on p.id = (i->>'id')::uuid and p.is_active
           for update of p
  loop
    if r.q <= 0 or r.q > r.stock then raise exception 'Not enough stock for %', r.name; end if;
    v_sub := v_sub + r.price_kobo * r.q; v_n := v_n + 1;
  end loop;
  if v_n = 0 or v_n <> jsonb_array_length(p_items) then raise exception 'Some items are unavailable'; end if;
  v_ship := case when v_sub >= 15000000 then 0 else 350000 end;  -- free delivery from ₦150,000, otherwise ₦3,500
  insert into orders (user_id, email, subtotal_kobo, shipping_kobo, total_kobo, shipping_address)
    values (p_user, p_email, v_sub, v_ship, v_sub + v_ship, p_address) returning id, orders.order_number into v_id, v_num;
  insert into order_items (order_id, product_id, name, unit_price_kobo, quantity)
    select v_id, p.id, p.name, p.price_kobo, (i->>'qty')::int from jsonb_array_elements(p_items) i join products p on p.id = (i->>'id')::uuid;
  update products p set stock = p.stock - (i->>'qty')::int from jsonb_array_elements(p_items) i where p.id = (i->>'id')::uuid;
  return query select v_id, v_num, v_sub + v_ship;
end $$;
revoke all on function place_order(uuid, text, jsonb, jsonb) from public, anon, authenticated;
