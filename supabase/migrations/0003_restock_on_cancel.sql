-- Put stock back when an order is cancelled.
create function restock_on_cancel() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update products p set stock = p.stock + i.quantity from order_items i where i.order_id = new.id and i.product_id = p.id;
  end if;
  return new;
end $$;
create trigger orders_restock after update of status on orders for each row execute function restock_on_cancel();
