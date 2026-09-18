-- ============================================================
-- 竹子嵌入式设备监控平台 · 迁移 002：传感器多指标扩展
-- 用途：新增 6 种传感器数据类型（加速度/光照/压力/液位/分贝/距离），
--       设备可同时上报多种指标（devices.metrics 数组）。
-- 执行：Supabase Dashboard -> SQL Editor 中整体执行。幂等，可重复执行。
-- ============================================================

-- ------------------------------------------------------------
-- 1. devices：新增指标列表 + 6 个当前值列（当前值由触发器自动刷新）
-- ------------------------------------------------------------
alter table public.devices
  add column if not exists metrics text[] not null default '{temperature,humidity}';

alter table public.devices add column if not exists current_acceleration numeric;
alter table public.devices add column if not exists current_illuminance  numeric;
alter table public.devices add column if not exists current_pressure     numeric;
alter table public.devices add column if not exists current_liquid_level numeric;
alter table public.devices add column if not exists current_decibel      numeric;
alter table public.devices add column if not exists current_distance     numeric;

-- ------------------------------------------------------------
-- 2. sensor_data：放宽温湿度非空（多指标设备可能不报温湿度），新增 6 列
-- ------------------------------------------------------------
alter table public.sensor_data alter column temperature drop not null;
alter table public.sensor_data alter column humidity    drop not null;

alter table public.sensor_data add column if not exists acceleration numeric;
alter table public.sensor_data add column if not exists illuminance numeric;
alter table public.sensor_data add column if not exists pressure     numeric;
alter table public.sensor_data add column if not exists liquid_level numeric;
alter table public.sensor_data add column if not exists decibel      numeric;
alter table public.sensor_data add column if not exists distance     numeric;

-- ------------------------------------------------------------
-- 3. 重写 update_device_latest：把新指标一并刷到 devices.current_*
-- ------------------------------------------------------------
create or replace function public.update_device_latest()
returns trigger
language plpgsql
as $$
begin
  update public.devices
  set current_temp         = new.temperature,
      current_humidity     = new.humidity,
      current_acceleration = new.acceleration,
      current_illuminance  = new.illuminance,
      current_pressure     = new.pressure,
      current_liquid_level = new.liquid_level,
      current_decibel      = new.decibel,
      current_distance     = new.distance,
      signal_strength      = new.signal_strength,
      last_report_at       = new.reported_at,
      updated_at           = now()
  where id = new.device_id;
  return new;
end;
$$;
