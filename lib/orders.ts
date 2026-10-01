// Cancels unpaid online orders after `mins` minutes; a database trigger returns their stock.
export const expireStale = (db: any, mins = 45) =>
  db.from('orders').update({ status: 'cancelled' }).eq('status', 'pending').eq('payment_method', 'online')
    .lt('created_at', new Date(Date.now() - mins * 60000).toISOString())
