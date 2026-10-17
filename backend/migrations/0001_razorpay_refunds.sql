create table if not exists baetee_gateway_refunds (
  operation_id text primary key,
  payment_id text not null,
  amount bigint not null check (amount > 0),
  status text not null check (status in ('pending', 'succeeded')),
  refund_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists baetee_gateway_refunds_payment on baetee_gateway_refunds (payment_id, created_at);
