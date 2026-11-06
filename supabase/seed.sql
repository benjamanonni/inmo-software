-- FICTIONAL demo only. Run only against a disposable local/test project.
insert into public.clients(id,name,email) values
 (1,'Lucía Fernández','lucia@example.com'),(2,'Martín Acosta','martin@example.com'),
 (3,'Carolina Ríos','carolina@example.com'),(4,'Diego Molina','diego@example.com') on conflict(id) do nothing;
select setval('public.clients_id_seq',greatest(4,(select max(id) from public.clients)));
insert into public.properties(id,title,subtitle,description,operation,published) values
 ('horizonte','Horizonte','El comienzo de algo propio.','Desarrollo completamente ficticio para la demo Crook.','Venta',true),
 ('los-olivos','Los Olivos','Otra forma de habitar.','Desarrollo ficticio. Fotografías de referencia visual.','Venta',true)
on conflict(id) do nothing;
insert into public.property_photos(id,property_id,reference_url,alt) values
 ('10000000-0000-0000-0000-000000000001','horizonte','https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1400&q=85','Paisaje de referencia'),
 ('10000000-0000-0000-0000-000000000002','los-olivos','https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1400&q=85','Paisaje de referencia') on conflict(id) do nothing;
insert into public.lots(id,property_id,area,block,demo_state) values
 ('H-012','horizonte',300,'A','Adjudicado'),('H-018','horizonte',300,'A','Adjudicado'),
 ('O-007','los-olivos',300,'B','Adjudicado'),('O-014','los-olivos',300,'B','Adjudicado') on conflict(id) do nothing;
insert into public.contracts(id,reference,signed_on,currency,total,deposit)
 select n,'CR-2026-00'||n,'2026-03-01','USD',30000,6000 from generate_series(1,4) n on conflict(id) do nothing;
select setval('public.contracts_id_seq',greatest(4,(select max(id) from public.contracts)));
insert into public.contract_clients select n,n from generate_series(1,4) n on conflict do nothing;
insert into public.contract_lots values(1,'H-012'),(2,'H-018'),(3,'O-007'),(4,'O-014') on conflict do nothing;
insert into public.plans(id,contract_id,label) select n,n,'Escenario demo: 48 cuotas, sin intereses' from generate_series(1,4) n on conflict(id) do nothing;
select setval('public.plans_id_seq',greatest(4,(select max(id) from public.plans)));
insert into public.installments(id,plan_id,number,due_on,amount,demo_state)
 select (p-1)*48+n,p,n,('2026-03-10'::date+make_interval(months=>n-1))::date,500,
 case when n=9 then 'A vencer' else 'Pendiente' end from generate_series(1,4) p cross join generate_series(1,48) n on conflict(id) do nothing;
select setval('public.installments_id_seq',greatest(192,(select max(id) from public.installments)));
-- Auth users and initial manual payments are provisioned by scripts/seed-auth.mjs, not by static passwords in SQL.
