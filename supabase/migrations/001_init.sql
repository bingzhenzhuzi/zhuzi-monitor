-- ============================================================
-- 竹子嵌入式设备监控平台 · 数据库初始化迁移
-- 在 Supabase Dashboard -> SQL Editor 中整体执行本文件
-- ============================================================

-- 用于生成 UUID 主键
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 设备表
-- ------------------------------------------------------------
create table if not exists public.devices (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  code             text not null unique,
  comm_type        text not null check (comm_type in ('wifi', 'ethernet', 'cellular', 'bluetooth', 'nbiot')),
  status           text not null default 'offline' check (status in ('online', 'offline', 'alert')),
  firmware_version text,
  location         text,
  latitude         double precision,
  longitude        double precision,
  online_since     timestamptz,
  last_report_at   timestamptz,
  current_temp     numeric,
  current_humidity numeric,
  signal_strength  numeric,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 传感器数据表
-- ------------------------------------------------------------
create table if not exists public.sensor_data (
  id              uuid primary key default gen_random_uuid(),
  device_id       uuid not null references public.devices(id) on delete cascade,
  temperature     numeric not null,
  humidity        numeric not null,
  signal_strength numeric,
  reported_at     timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 告警记录表
-- ------------------------------------------------------------
create table if not exists public.alerts (
  id            uuid primary key default gen_random_uuid(),
  device_id     uuid not null references public.devices(id) on delete cascade,
  device_name   text,
  type          text not null check (type in ('temp_high', 'temp_low', 'humidity_high', 'humidity_low', 'offline', 'signal_abnormal')),
  level         text not null check (level in ('critical', 'major', 'minor')),
  trigger_value numeric,
  threshold     numeric,
  triggered_at  timestamptz not null default now(),
  status        text not null default 'pending' check (status in ('pending', 'processing', 'resolved')),
  remark        text,
  resolved_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 日历笔记表（user_id 绑定 auth.uid()，实现按用户隔离）
-- ------------------------------------------------------------
create table if not exists public.calendar_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  date       text not null, -- 北京时间日期键 YYYY-MM-DD
  title      text not null,
  content    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ------------------------------------------------------------
-- 记事本表（user_id 绑定 auth.uid()）
-- ------------------------------------------------------------
create table if not exists public.memos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title      text not null,
  content    text,
  category   text not null default '其他',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 索引
-- ------------------------------------------------------------
create index if not exists idx_devices_status     on public.devices (status);
create index if not exists idx_devices_comm_type  on public.devices (comm_type);
create index if not exists idx_sensor_device_time on public.sensor_data (device_id, reported_at desc);
create index if not exists idx_alerts_status_time on public.alerts (status, triggered_at desc);
create index if not exists idx_calendar_notes_date on public.calendar_notes (date);
create index if not exists idx_memos_created_at   on public.memos (created_at desc);

-- ------------------------------------------------------------
-- updated_at 自动更新时间戳触发器
-- ------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_devices_updated_at on public.devices;
create trigger trg_devices_updated_at
  before update on public.devices
  for each row execute function public.set_updated_at();

drop trigger if exists trg_calendar_notes_updated_at on public.calendar_notes;
create trigger trg_calendar_notes_updated_at
  before update on public.calendar_notes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_memos_updated_at on public.memos;
create trigger trg_memos_updated_at
  before update on public.memos
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 新上报数据时自动更新设备的实时读数（current_temp/humidity/signal）
-- ------------------------------------------------------------
create or replace function public.update_device_latest()
returns trigger
language plpgsql
as $$
begin
  update public.devices
  set current_temp     = new.temperature,
      current_humidity = new.humidity,
      signal_strength  = new.signal_strength,
      last_report_at   = new.reported_at,
      updated_at       = now()
  where id = new.device_id;
  return new;
end;
$$;

drop trigger if exists trg_sensor_data_latest on public.sensor_data;
create trigger trg_sensor_data_latest
  after insert on public.sensor_data
  for each row execute function public.update_device_latest();

-- ------------------------------------------------------------
-- 开启行级安全（RLS）
-- ------------------------------------------------------------
alter table public.devices        enable row level security;
alter table public.sensor_data    enable row level security;
alter table public.alerts         enable row level security;
alter table public.calendar_notes enable row level security;
alter table public.memos          enable row level security;

-- ------------------------------------------------------------
-- 访问策略
-- 设备 / 传感器 / 告警：面向单一管理员角色，允许所有已登录用户读写
-- 日历笔记 / 记事本：基于 auth.uid() 实现按用户隔离
-- ------------------------------------------------------------
drop policy if exists "authenticated_access_devices" on public.devices;
create policy "authenticated_access_devices"
  on public.devices for all to authenticated
  using (true) with check (true);

drop policy if exists "authenticated_access_sensor_data" on public.sensor_data;
create policy "authenticated_access_sensor_data"
  on public.sensor_data for all to authenticated
  using (true) with check (true);

drop policy if exists "authenticated_access_alerts" on public.alerts;
create policy "authenticated_access_alerts"
  on public.alerts for all to authenticated
  using (true) with check (true);

drop policy if exists "own_calendar_notes" on public.calendar_notes;
create policy "own_calendar_notes"
  on public.calendar_notes for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "own_memos" on public.memos;
create policy "own_memos"
  on public.memos for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ------------------------------------------------------------
-- （可选）演示种子数据：仅用于本地联调，生产环境请删除
-- 取消注释并执行后，会插入若干示例设备
-- ------------------------------------------------------------
-- insert into public.devices (name, code, comm_type, status, location, latitude, longitude, firmware_version)
-- values
--   ('浦东机房传感器-01', 'ZHUZI-1001', 'wifi',      'online', '上海·浦东机房', 31.23, 121.47, 'v2.4.1'),
--   ('亦庄园区传感器-02', 'ZHUZI-1002', 'ethernet',  'online', '北京·亦庄园区', 39.80, 116.50, 'v2.4.0'),
--   ('南山智造传感器-03', 'ZHUZI-1003', 'cellular',  'alert',  '深圳·南山智造', 22.54, 113.93, 'v2.3.8'),
--   ('余杭工厂传感器-04', 'ZHUZI-1004', 'bluetooth', 'online', '杭州·余杭工厂', 30.27, 120.00, 'v2.4.1'),
--   ('高新仓传感器-05',   'ZHUZI-1005', 'nbiot',     'offline', '成都·高新仓', 30.57, 104.07, 'v2.3.7');
