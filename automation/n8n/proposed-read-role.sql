-- PROPOSAL ONLY. Not part of applied migrations. Validate columns and operational permissions first.
create schema if not exists crook_export;
create role crook_export_reader nologin;
create view crook_export.installment_demo as
select c.reference as contract,i.number as installment,i.due_on,i.amount,c.currency
from public.installments i join public.plans p on p.id=i.plan_id join public.contracts c on c.id=p.contract_id
where c.demo_scenario;
revoke all on schema crook_export from public;
revoke all on crook_export.installment_demo from public;
grant usage on schema crook_export to crook_export_reader;
grant select on crook_export.installment_demo to crook_export_reader;
-- After approval, assign this role only to the dedicated n8n LOGIN identity via secure DBA provisioning.
