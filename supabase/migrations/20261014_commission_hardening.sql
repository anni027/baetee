alter table public.commission_rate_limits enable row level security;
create index if not exists commission_rate_limits_window on public.commission_rate_limits (window_start);

create or replace function public.consume_commission_quota(p_key_hash text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare current_count integer;
begin
  if p_key_hash is null or p_key_hash !~ '^[a-f0-9]{64}$' or p_limit is null or p_limit < 1 or p_limit > 100 then return false; end if;
  perform pg_advisory_xact_lock(hashtext(p_key_hash));
  delete from public.commission_rate_limits where window_start < now() - interval '24 hours';
  insert into public.commission_rate_limits (key_hash, window_start, request_count)
  values (p_key_hash, now(), 1)
  on conflict (key_hash) do update
    set window_start = case when commission_rate_limits.window_start < now() - interval '1 hour' then now() else commission_rate_limits.window_start end,
        request_count = case when commission_rate_limits.window_start < now() - interval '1 hour' then 1 else least(commission_rate_limits.request_count + 1, p_limit + 1) end
  returning request_count into current_count;
  return current_count <= p_limit;
end;
$$;

revoke all on public.commission_rate_limits from public, anon, authenticated;
revoke all on function public.consume_commission_quota(text, integer) from public, anon, authenticated;
grant execute on function public.consume_commission_quota(text, integer) to service_role;
