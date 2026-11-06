-- User confirmation: ARS, no deposit, flat 10% TOTAL interest, monthly installments; demo only.
-- Preserve existing USD financial history. New scenarios carry an explicit rule identifier.
alter table public.contracts drop constraint contracts_currency_check;
alter table public.contracts add constraint contracts_currency_check check(currency in ('ARS','USD'));
alter table public.contracts add column price numeric(14,2) check(price>0);
alter table public.contracts add column interest_percent numeric(5,2) not null default 0 check(interest_percent>=0);
alter table public.contracts add column rule_code text not null default 'legacy_demo';
alter table public.account_clients add constraint one_account_per_person unique(client_id);
alter table public.account_clients add constraint one_person_per_account unique(account_id);
alter table public.accounts drop constraint accounts_role_check;
alter table public.accounts add constraint accounts_role_check check(role in ('super_admin','admin','buyer'));
create or replace function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.accounts where id=auth.uid() and role in ('admin','super_admin') and enabled)
$$;

create function public.create_demo_contract(p_client bigint,p_lot text,p_reference text,p_price numeric,p_count integer,p_first_due date)
returns bigint language plpgsql security definer set search_path='' as $$
declare result bigint; plan bigint; total_cents bigint; base_cents bigint;
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_price is null or p_price<=0 or round(p_price,2)<>p_price or p_price>99999999999
 or p_count is null or p_count<1 or p_count>600 or p_first_due is null or p_reference is null or length(trim(p_reference)) not between 1 and 100 then raise exception 'Invalid plan parameters'; end if;
 perform 1 from public.clients where id=p_client; if not found then raise exception 'Client not found'; end if;
 perform 1 from public.lots where id=p_lot for update; if not found then raise exception 'Lot not found'; end if;
 total_cents:=round(p_price*1.10*100)::bigint;
 base_cents:=total_cents/p_count;
 if base_cents<1 then raise exception 'Installment amount below one cent'; end if;
 insert into public.contracts(reference,signed_on,currency,total,deposit,price,interest_percent,rule_code)
 values(trim(p_reference),(now() at time zone 'America/Argentina/Buenos_Aires')::date,'ARS',total_cents::numeric/100,0,p_price,10,'demo_ars_flat10_v1') returning id into result;
 insert into public.contract_clients values(result,p_client);
 insert into public.contract_lots values(result,p_lot);
 insert into public.plans(contract_id,label) values(result,p_count||' cuotas mensuales · 10% total fijo · Sin anticipo') returning id into plan;
 insert into public.installments(plan_id,number,due_on,amount)
 select plan,n,(p_first_due+make_interval(months=>n-1))::date,
 (case when n=p_count then total_cents-base_cents*(p_count-1) else base_cents end)::numeric/100
 from generate_series(1,p_count) n;
 update public.lots set demo_state='Adjudicado' where id=p_lot;
 return result;
end $$;
revoke all on function public.create_demo_contract(bigint,text,text,numeric,integer,date) from public,anon;
grant execute on function public.create_demo_contract(bigint,text,text,numeric,integer,date) to authenticated;

-- New payments affect a single installment. Historical multi-allocation records remain untouched.
alter function public.register_payment(bigint,numeric,date,text,jsonb,uuid) set schema private;
alter function private.register_payment(bigint,numeric,date,text,jsonb,uuid) rename to register_payment_base;
revoke all on function private.register_payment_base(bigint,numeric,date,text,jsonb,uuid) from public,anon,authenticated;
create function public.register_payment(p_contract bigint,p_amount numeric,p_paid_on date,p_method text,p_allocations jsonb,p_request uuid)
returns bigint language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if jsonb_typeof(p_allocations)<>'array' or jsonb_array_length(p_allocations)<>1 then raise exception 'Only one installment per payment is allowed'; end if;
 return private.register_payment_base(p_contract,p_amount,p_paid_on,p_method,p_allocations,p_request);
end $$;
revoke all on function public.register_payment(bigint,numeric,date,text,jsonb,uuid) from public,anon;
grant execute on function public.register_payment(bigint,numeric,date,text,jsonb,uuid) to authenticated;

create schema if not exists crook_export;
revoke all on schema crook_export from public,anon,authenticated;
-- Approved four-column projection; one row per non-voided payment on a fully covered installment.
create view crook_export.paid_installments as
select c.email as usuario,i.number as cuota_pagada,p.paid_on as fecha,a.amount as monto_pagado
from public.payments p join public.payment_allocations a on a.payment_id=p.id
join public.installments i on i.id=a.installment_id
join public.contract_clients cc on cc.contract_id=p.contract_id
join public.clients c on c.id=cc.client_id
where not p.voided and exists(select 1 from public.account_clients ac where ac.client_id=c.id)
and (select coalesce(sum(pa.amount),0) from public.payment_allocations pa join public.payments pp on pp.id=pa.payment_id where pa.installment_id=i.id and not pp.voided)>=i.amount;
revoke all on crook_export.paid_installments from public,anon,authenticated;
-- Dedicated n8n read credentials and destination remain separately configured; no broad table grants.
