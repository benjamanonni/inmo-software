-- Explicit four-column ARS-only demo export. Never mix historical USD amounts in a currency-less sheet.
create or replace view crook_export.paid_installments as
select c.email as usuario,i.number as cuota_pagada,p.paid_on as fecha,a.amount as monto_pagado
from public.payments p join public.payment_allocations a on a.payment_id=p.id
join public.installments i on i.id=a.installment_id
join public.contracts contract on contract.id=p.contract_id
join public.contract_clients cc on cc.contract_id=p.contract_id
join public.clients c on c.id=cc.client_id
where not p.voided and contract.currency='ARS' and contract.demo_scenario
and exists(select 1 from public.account_clients ac where ac.client_id=c.id)
and (select coalesce(sum(pa.amount),0) from public.payment_allocations pa join public.payments pp on pp.id=pa.payment_id where pa.installment_id=i.id and not pp.voided)>=i.amount;
comment on view crook_export.paid_installments is 'FICTITIOUS DEMO ONLY: usuario, cuota_pagada, fecha, monto_pagado in ARS. No production financial/export policy is implied.';
do $$begin if not exists(select 1 from pg_roles where rolname='crook_export_reader') then create role crook_export_reader nologin; end if;end $$;
revoke all on schema crook_export from public,anon,authenticated;
revoke all on crook_export.paid_installments from public,anon,authenticated;
grant usage on schema crook_export to crook_export_reader;
grant select on crook_export.paid_installments to crook_export_reader;
