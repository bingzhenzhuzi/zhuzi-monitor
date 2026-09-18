-- ============================================================
-- 竹子嵌入式设备监控平台 · 迁移 003：每设备告警阈值
-- 用途：为每台设备、每个传感器指标配置「过高上限 / 过低下限」，
--       供设备详情页判断实时数据是否异常（替代硬编码阈值）。
-- 执行：Supabase Dashboard -> SQL Editor 中整体执行。幂等，可重复执行。
-- ============================================================

-- 阈值表：每设备 × 每指标一行；min_value/max_value 为空表示不判该方向
create table if not exists public.alert_thresholds (
  id         uuid primary key default gen_random_uuid(),
  device_id  uuid not null references public.devices(id) on delete cascade,
  metric     text not null check (metric in
    ('temperature','humidity','acceleration','illuminance','pressure','liquid_level','decibel','distance')),
  min_value  numeric,
  max_value  numeric,
  updated_at timestamptz not null default now(),
  unique (device_id, metric)
);

create index if not exists idx_alert_thresholds_device on public.alert_thresholds (device_id);

-- updated_at 自动更新时间戳（复用 001 的 set_updated_at）
drop trigger if exists trg_alert_thresholds_updated_at on public.alert_thresholds;
create trigger trg_alert_thresholds_updated_at
  before update on public.alert_thresholds
  for each row execute function public.set_updated_at();

-- 行级安全（与 devices 一致：允许所有已登录用户读写）
alter table public.alert_thresholds enable row level security;
drop policy if exists "authenticated_access_alert_thresholds" on public.alert_thresholds;
create policy "authenticated_access_alert_thresholds"
  on public.alert_thresholds for all to authenticated
  using (true) with check (true);
