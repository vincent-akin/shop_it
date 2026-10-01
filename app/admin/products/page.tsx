import Link from 'next/link'
import { requireAdmin } from '@/lib/admin'
import { saveProduct } from '../actions'
import { ImageField } from '@/components/ImageField'

function Fields({ p }: { p?: any }) {
  return (
    <>
      {p && <input type="hidden" name="id" value={p.id} />}
      <input name="name" placeholder="Product name" defaultValue={p?.name} required aria-label="Name" />
      <input name="description" placeholder="Short description" defaultValue={p?.description ?? ''} aria-label="Description" />
      <input name="price" type="number" min="0" step="0.01" placeholder="Price (₦)" defaultValue={p ? p.price_kobo / 100 : undefined} required aria-label="Price in naira" />
      <input name="stock" type="number" min="0" placeholder="Stock" defaultValue={p?.stock} required aria-label="Stock" />
      <ImageField name="image_url" defaultValue={p?.image_url ?? ''} />
      <label><input type="checkbox" name="active" defaultChecked={p ? p.is_active : true} /> Visible in store</label>
    </>
  )
}

export default async function AdminProducts() {
  const sb = await requireAdmin()
  const { data: cats } = await sb.from('categories').select('id,name').order('id')
  const { data: products } = await sb.from('products').select('*').order('created_at')
  return (
    <>
      <div className="row"><h1>Products</h1><Link className="btn sm" href="/admin">Orders</Link></div>
      <form className="card p f" action={saveProduct} style={{ marginBottom: 16 }}>
        <h3>Add product</h3>
        <select name="category_id" aria-label="Category">{cats?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <Fields />
        <button className="btn">Add product</button>
      </form>
      {products?.map((p: any) => (
        <form key={p.id} className="card p f" action={saveProduct} style={{ marginBottom: 12 }}>
          <Fields p={p} /><button className="btn sm">Save changes</button>
        </form>
      ))}
    </>
  )
}
