create function public.register_payment(
 p_contract bigint, p_amount numeric, p_paid_on date, p_method text,
 p_allocations jsonb, p_request uuid
) returns bigint language plpgsql security definer set search_path='' as $$
declare saved public.payments; item jsonb; allocation_total numeric:=0; new_id bigint; seen bigint[]:='{}'; installment_id bigint;
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_amount is null or p_amount<=0 or round(p_amount,2)<>p_amount or p_request is null or p_paid_on is null then raise exception 'Invalid payment'; end if;
 -- Serialize writes per contract and retries before checking the idempotency key.
 perform 1 from public.contracts where id=p_contract for update;
 if not found then raise exception 'Contract not found'; end if;
 select * into saved from public.payments where request_id=p_request;
 if found then
  if saved.contract_id<>p_contract or saved.amount<>p_amount or saved.paid_on<>p_paid_on or saved.method<>p_method or saved.actor<>auth.uid()
    or (select coalesce(jsonb_agg(jsonb_build_object('installment_id',a.installment_id,'amount',a.amount) order by a.installment_id),'[]') from public.payment_allocations a where a.payment_id=saved.id)
       is distinct from (select jsonb_agg(jsonb_build_object('installment_id',(v->>'installment_id')::bigint,'amount',(v->>'amount')::numeric) order by (v->>'installment_id')::bigint) from jsonb_array_elements(p_allocations) v)
  then raise exception 'Idempotency key conflict' using errcode='23505'; end if;
  return saved.id;
 end if;
 if jsonb_typeof(p_allocations)<>'array' or jsonb_array_length(p_allocations)=0 then raise exception 'Allocations required'; end if;
 for item in select * from jsonb_array_elements(p_allocations) loop
  installment_id := (item->>'installment_id')::bigint;
  if installment_id is null or installment_id=any(seen) or (item->>'amount')::numeric is null or (item->>'amount')::numeric<=0 or round((item->>'amount')::numeric,2)<>(item->>'amount')::numeric then raise exception 'Invalid allocation'; end if;
  if not exists(select 1 from public.installments i join public.plans p on p.id=i.plan_id where i.id=installment_id and p.contract_id=p_contract) then raise exception 'Installment belongs to another contract'; end if;
  seen:=array_append(seen,installment_id);
  allocation_total:=allocation_total+(item->>'amount')::numeric;
 end loop;
 if allocation_total<>p_amount then raise exception 'Allocation total mismatch'; end if;
 insert into public.payments(contract_id,amount,paid_on,method,actor,request_id)
 values(p_contract,p_amount,p_paid_on,p_method,auth.uid(),p_request) returning id into new_id;
 insert into public.payment_allocations(payment_id,installment_id,amount)
 select new_id,(v->>'installment_id')::bigint,(v->>'amount')::numeric from jsonb_array_elements(p_allocations) v;
 insert into public.payment_events(payment_id,operation,after_value,reason,actor,request_id)
 values(new_id,'registered',jsonb_build_object('amount',p_amount,'voided',false,'allocations',p_allocations),'Registro manual',auth.uid(),p_request);
 return new_id;
end $$;

create function public.void_payment(p_payment bigint,p_reason text,p_request uuid) returns uuid language plpgsql security definer set search_path='' as $$
declare payment public.payments; event public.payment_events; event_id uuid;
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 if p_reason is null or length(trim(p_reason))<5 or length(p_reason)>1000 or p_request is null then raise exception 'Reason required'; end if;
 select * into payment from public.payments where id=p_payment for update;
 if not found then raise exception 'Payment not found'; end if;
 select * into event from public.payment_events where request_id=p_request;
 if found then
  if event.payment_id<>p_payment or event.operation<>'voided' or event.actor<>auth.uid() or event.reason<>trim(p_reason) then raise exception 'Idempotency key conflict' using errcode='23505'; end if;
  return event.id;
 end if;
 if payment.voided then raise exception 'Payment already voided' using errcode='40001'; end if;
 update public.payments set voided=true where id=p_payment;
 insert into public.payment_events(payment_id,operation,before_value,after_value,reason,actor,request_id)
 values(p_payment,'voided',jsonb_build_object('amount',payment.amount,'voided',false),jsonb_build_object('amount',payment.amount,'voided',true),trim(p_reason),auth.uid(),p_request) returning id into event_id;
 return event_id;
end $$;
revoke all on function public.register_payment(bigint,numeric,date,text,jsonb,uuid) from public,anon;
revoke all on function public.void_payment(bigint,text,uuid) from public,anon;
grant execute on function public.register_payment(bigint,numeric,date,text,jsonb,uuid) to authenticated;
grant execute on function public.void_payment(bigint,text,uuid) to authenticated;

create function public.set_account_enabled(p_account uuid,p_enabled boolean) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_admin() then raise exception 'Administrator required' using errcode='42501'; end if;
 update public.accounts set enabled=p_enabled where id=p_account and role='buyer';
 if not found then raise exception 'Buyer account not found'; end if;
end $$;
revoke all on function public.set_account_enabled(uuid,boolean) from public,anon;
grant execute on function public.set_account_enabled(uuid,boolean) to authenticated;
