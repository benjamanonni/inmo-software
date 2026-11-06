insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('property-photos','property-photos',false,5242880,array['image/jpeg','image/png','image/webp']),
 ('receipts','receipts',false,10485760,array['application/pdf','image/jpeg','image/png'])
on conflict(id) do nothing;
create policy photo_read on storage.objects for select to anon,authenticated using(
 bucket_id='property-photos' and exists(select 1 from public.property_photos pp join public.properties p on p.id=pp.property_id where pp.object_path=name and (p.published or private.is_admin()))
);
create policy receipt_read on storage.objects for select to authenticated using(
 bucket_id='receipts' and exists(select 1 from public.receipts r where r.object_path=name and (private.is_admin() or private.can_payment(r.payment_id)))
);
create policy admin_storage_insert on storage.objects for insert to authenticated with check(bucket_id in ('property-photos','receipts') and private.is_admin());
-- No DELETE/overwrite of historical receipts. New versions get a new object path.
grant insert on public.receipts to authenticated;
create policy receipt_insert on public.receipts for insert to authenticated with check(private.is_admin());
