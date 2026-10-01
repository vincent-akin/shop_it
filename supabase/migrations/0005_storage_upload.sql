-- Let admins upload product images from the admin page; only JPG/PNG/WebP under 2 MB are accepted.
update storage.buckets set file_size_limit = 2097152, allowed_mime_types = array['image/jpeg','image/png','image/webp'] where id = 'products';
create policy "admins upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'products' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated using (bucket_id = 'products' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated using (bucket_id = 'products' and public.is_admin());
