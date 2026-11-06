create function public.provision_buyer_link(p_account uuid,p_client bigint) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 -- Serialize concurrent provisioning for the same client. This demo permits one active buyer account per client in this operation only.
 perform 1 from public.clients where id=p_client for update;
 if not found then raise exception 'Client not found'; end if;
 if exists(select 1 from public.account_clients where client_id=p_client) then raise exception 'Client already linked'; end if;
 if not exists(select 1 from auth.users u join public.clients c on lower(u.email)=lower(c.email) where u.id=p_account and c.id=p_client) then raise exception 'Identity email mismatch'; end if;
 if exists(select 1 from public.accounts where id=p_account) then raise exception 'Existing account requires reconciliation'; end if;
 insert into public.accounts(id,role,enabled) values(p_account,'buyer',false);
 insert into public.account_clients(account_id,client_id) values(p_account,p_client);
 update public.accounts set enabled=true where id=p_account;
end $$;
revoke all on function public.provision_buyer_link(uuid,bigint) from public,anon;
grant execute on function public.provision_buyer_link(uuid,bigint) to authenticated;
