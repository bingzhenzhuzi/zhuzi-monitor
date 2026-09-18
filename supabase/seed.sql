-- ============================================================
-- 竹子嵌入式设备监控平台 · 演示种子数据
-- 用途：向真实 Supabase 库填充示例设备 / 传感器数据 / 告警，
--       让线上平台首次打开即可看到效果（不再是一片空白）。
--
-- 使用方法：Supabase 后台 -> SQL Editor，全选本文件 -> Run
-- 可重复执行；如需完全重置，先执行下方注释里的 TRUNCATE 段。
-- ============================================================

-- ------------------------------------------------------------
-- 【可选】重置演示数据（会连带删除设备对应的传感器与告警数据）
-- 需要重新来一遍时，取消下面两行注释再执行
-- ------------------------------------------------------------
-- truncate table public.sensor_data restart identity cascade;
-- truncate table public.alerts       restart identity cascade;
-- truncate table public.devices      restart identity cascade;

-- ------------------------------------------------------------
-- 1. 设备（27 台：24 台温湿度 + 3 台多指标示例，覆盖 5 种通信方式，含在线/离线/告警状态）
-- ------------------------------------------------------------
insert into public.devices
  (name, code, comm_type, status, firmware_version, location, latitude, longitude,
   online_since, last_report_at, current_temp, current_humidity, signal_strength)
values
  ('浦东机房传感器-01', 'ZHUZI-1001', 'wifi',      'online',  'v2.4.1', '上海·浦东机房', 31.23, 121.47, now() - interval '30 days', now() - interval '1 minute',  24.3, 52.1, 88),
  ('浦东机房传感器-02', 'ZHUZI-1002', 'ethernet',  'online',  'v2.4.1', '上海·浦东机房', 31.25, 121.49, now() - interval '45 days', now() - interval '2 minutes', 23.8, 48.5, 91),
  ('浦东机房传感器-03', 'ZHUZI-1003', 'cellular',  'alert',   'v2.4.0', '上海·浦东机房', 31.21, 121.46, now() - interval '20 days', now() - interval '1 minute',  38.2, 55.0, 72),
  ('亦庄园区传感器-01', 'ZHUZI-1004', 'bluetooth', 'online',  'v2.4.1', '北京·亦庄园区', 39.80, 116.50, now() - interval '60 days', now() - interval '3 minutes', 25.1, 50.3, 79),
  ('亦庄园区传感器-02', 'ZHUZI-1005', 'nbiot',     'online',  'v2.4.0', '北京·亦庄园区', 39.81, 116.52, now() - interval '35 days', now() - interval '4 minutes', 24.6, 49.8, 85),
  ('亦庄园区传感器-03', 'ZHUZI-1006', 'wifi',      'offline', 'v2.3.8', '北京·亦庄园区', 39.79, 116.49, now() - interval '90 days', now() - interval '12 hours',  null, null, null),
  ('南山智造传感器-01', 'ZHUZI-1007', 'ethernet',  'online',  'v2.4.1', '深圳·南山智造', 22.54, 113.93, now() - interval '18 days', now() - interval '1 minute',  26.2, 58.4, 90),
  ('南山智造传感器-02', 'ZHUZI-1008', 'cellular',  'online',  'v2.4.0', '深圳·南山智造', 22.55, 113.95, now() - interval '25 days', now() - interval '5 minutes', 25.7, 56.1, 83),
  ('南山智造传感器-03', 'ZHUZI-1009', 'bluetooth', 'offline', 'v2.3.8', '深圳·南山智造', 22.53, 113.92, now() - interval '50 days', now() - interval '8 hours',   null, null, null),
  ('余杭工厂传感器-01', 'ZHUZI-1010', 'nbiot',     'online',  'v2.4.1', '杭州·余杭工厂', 30.27, 120.00, now() - interval '40 days', now() - interval '2 minutes', 23.4, 47.2, 87),
  ('余杭工厂传感器-02', 'ZHUZI-1011', 'wifi',      'online',  'v2.4.1', '杭州·余杭工厂', 30.28, 120.01, now() - interval '22 days', now() - interval '3 minutes', 24.0, 51.6, 81),
  ('余杭工厂传感器-03', 'ZHUZI-1012', 'ethernet',  'alert',   'v2.4.0', '杭州·余杭工厂', 30.26, 119.99, now() - interval '15 days', now() - interval '1 minute',  22.5, 86.3, 68),
  ('高新仓传感器-01',   'ZHUZI-1013', 'cellular',  'online',  'v2.4.1', '成都·高新仓',   30.57, 104.07, now() - interval '28 days', now() - interval '4 minutes', 25.3, 53.7, 84),
  ('高新仓传感器-02',   'ZHUZI-1014', 'bluetooth', 'online',  'v2.4.0', '成都·高新仓',   30.58, 104.08, now() - interval '33 days', now() - interval '5 minutes', 24.9, 52.2, 77),
  ('高新仓传感器-03',   'ZHUZI-1015', 'nbiot',     'offline', 'v2.3.8', '成都·高新仓',   30.56, 104.06, now() - interval '70 days', now() - interval '30 minutes', null, null, null),
  ('江北库传感器-01',   'ZHUZI-1016', 'wifi',      'online',  'v2.4.1', '南京·江北库',   32.09, 118.71, now() - interval '26 days', now() - interval '2 minutes', 23.6, 46.9, 89),
  ('江北库传感器-02',   'ZHUZI-1017', 'ethernet',  'online',  'v2.4.0', '南京·江北库',   32.10, 118.72, now() - interval '38 days', now() - interval '3 minutes', 24.2, 49.1, 82),
  ('光谷站传感器-01',   'ZHUZI-1018', 'cellular',  'online',  'v2.4.1', '武汉·光谷站',   30.51, 114.42, now() - interval '21 days', now() - interval '1 minute',  26.8, 60.2, 86),
  ('光谷站传感器-02',   'ZHUZI-1019', 'bluetooth', 'alert',   'v2.4.0', '武汉·光谷站',   30.52, 114.43, now() - interval '19 days', now() - interval '2 minutes', 39.5, 54.2, 71),
  ('工业园传感器-01',   'ZHUZI-1020', 'nbiot',     'online',  'v2.4.1', '苏州·工业园',   31.31, 120.67, now() - interval '42 days', now() - interval '4 minutes', 24.5, 50.7, 80),
  ('工业园传感器-02',   'ZHUZI-1021', 'wifi',      'online',  'v2.4.1', '苏州·工业园',   31.32, 120.68, now() - interval '16 days', now() - interval '1 minute',  23.9, 48.8, 93),
  ('工业园传感器-03',   'ZHUZI-1022', 'ethernet',  'offline', 'v2.3.7', '苏州·工业园',   31.30, 120.66, now() - interval '80 days', now() - interval '6 hours',   null, null, null),
  ('浦东机房传感器-04', 'ZHUZI-1023', 'cellular',  'online',  'v2.4.1', '上海·浦东机房', 31.24, 121.48, now() - interval '27 days', now() - interval '2 minutes', 25.6, 55.3, 78),
  ('亦庄园区传感器-04', 'ZHUZI-1024', 'bluetooth', 'online',  'v2.4.0', '北京·亦庄园区', 39.82, 116.51, now() - interval '23 days', now() - interval '5 minutes', 24.7, 51.9, 88);

-- 多指标示例设备（3 台：液位+压力 / 光照+分贝 / 加速度+距离）
insert into public.devices
  (name, code, comm_type, status, firmware_version, location, latitude, longitude,
   online_since, last_report_at, signal_strength, metrics,
   current_liquid_level, current_pressure, current_illuminance, current_decibel, current_acceleration, current_distance)
values
  ('水箱液位传感器-01', 'ZHUZI-1025', 'cellular', 'online', 'v2.4.1', '上海·浦东机房', 31.26, 121.50, now() - interval '15 days', now() - interval '1 minute',  81,
   '{liquid_level,pressure}',  72.5, 128.4, null, null, null, null),
  ('环境光监测传感器-01', 'ZHUZI-1026', 'wifi',  'online', 'v2.4.1', '深圳·南山智造', 22.56, 113.94, now() - interval '12 days', now() - interval '2 minutes', 84,
   '{illuminance,decibel}',    null, null, 480,  55,   null, null),
  ('设备振动传感器-01',  'ZHUZI-1027', 'nbiot', 'online', 'v2.4.0', '杭州·余杭工厂', 30.29, 120.02, now() - interval '10 days', now() - interval '3 minutes', 76,
   '{acceleration,distance}',  null, null, null, null, 0.32, 1.25);

-- ------------------------------------------------------------
-- 2. 告警记录（10 条，覆盖紧急/重要/一般 与 已处理/处理中/未处理）
-- ------------------------------------------------------------
insert into public.alerts
  (device_id, device_name, type, level, trigger_value, threshold, triggered_at, status, remark, resolved_at)
values
  ((select id from public.devices where code = 'ZHUZI-1003'), (select name from public.devices where code = 'ZHUZI-1003'), 'temp_high',      'critical', 38.2,  35,  now() - interval '2 hours',  'pending',   null, null),
  ((select id from public.devices where code = 'ZHUZI-1012'), (select name from public.devices where code = 'ZHUZI-1012'), 'humidity_high',  'major',    86.3,  80,  now() - interval '5 hours',  'pending',   null, null),
  ((select id from public.devices where code = 'ZHUZI-1019'), (select name from public.devices where code = 'ZHUZI-1019'), 'temp_high',      'critical', 39.5,  35,  now() - interval '1 hour',   'pending',   null, null),
  ((select id from public.devices where code = 'ZHUZI-1006'), (select name from public.devices where code = 'ZHUZI-1006'), 'offline',        'major',    0,     null, now() - interval '12 hours', 'processing', '已联系现场排查', null),
  ((select id from public.devices where code = 'ZHUZI-1009'), (select name from public.devices where code = 'ZHUZI-1009'), 'signal_abnormal','minor',    32,    40,  now() - interval '8 hours',  'processing', null, null),
  ((select id from public.devices where code = 'ZHUZI-1010'), (select name from public.devices where code = 'ZHUZI-1010'), 'temp_low',       'minor',    4.2,   5,   now() - interval '2 days',   'resolved',   '已恢复正常', now() - interval '1 day'),
  ((select id from public.devices where code = 'ZHUZI-1016'), (select name from public.devices where code = 'ZHUZI-1016'), 'humidity_low',   'minor',    18.5,  20,  now() - interval '3 days',   'resolved',   '加湿器已启动', now() - interval '2 days'),
  ((select id from public.devices where code = 'ZHUZI-1015'), (select name from public.devices where code = 'ZHUZI-1015'), 'offline',        'critical', 0,     null, now() - interval '30 minutes', 'pending', null, null),
  ((select id from public.devices where code = 'ZHUZI-1018'), (select name from public.devices where code = 'ZHUZI-1018'), 'temp_high',      'major',    36.1,  35,  now() - interval '1 day',    'resolved',   '通风后回落', now() - interval '20 hours'),
  ((select id from public.devices where code = 'ZHUZI-1022'), (select name from public.devices where code = 'ZHUZI-1022'), 'offline',        'major',    0,     null, now() - interval '6 hours',  'processing', null, null);

-- ------------------------------------------------------------
-- 3. 传感器历史数据（可选）
-- 为在线/告警设备生成近 6 小时、每 5 分钟一个点的时间序列，
-- 用于设备详情曲线与历史数据页。若不需要历史曲线可跳过本段。
-- 注意：插入后会触发 update_device_latest，把设备实时读数更新为最新点。
-- 每个指标仅在设备 metrics 数组包含它时才生成（多指标设备不会产生无意义的温湿度）。
-- ------------------------------------------------------------
insert into public.sensor_data
  (device_id, temperature, humidity, acceleration, illuminance, pressure, liquid_level, decibel, distance, signal_strength, reported_at)
select
  d.id,
  case when d.metrics && array['temperature']  then round((case when d.status = 'alert' then 37.0 else 24.0 end + 3 * sin(extract(epoch from g) / 600)   + (random() - 0.5) * 2)::numeric, 1) end,
  case when d.metrics && array['humidity']     then round((52.0 + 6 * cos(extract(epoch from g) / 900) + (random() - 0.5) * 4)::numeric, 1) end,
  case when d.metrics && array['acceleration'] then round((0.30 + 0.15 * sin(extract(epoch from g) / 800) + (random() - 0.5) * 0.10)::numeric, 2) end,
  case when d.metrics && array['illuminance']  then (300 + floor(400 * (0.5 + 0.5 * sin(extract(epoch from g) / 1200)))::int) end,
  case when d.metrics && array['pressure']     then round((125.0 + 5 * sin(extract(epoch from g) / 1500) + (random() - 0.5) * 2)::numeric, 1) end,
  case when d.metrics && array['liquid_level'] then round((72.0 + 8 * sin(extract(epoch from g) / 1800) + (random() - 0.5) * 3)::numeric, 1) end,
  case when d.metrics && array['decibel']      then (50 + floor(15 * (0.5 + 0.5 * sin(extract(epoch from g) / 600)))::int) end,
  case when d.metrics && array['distance']     then round((1.20 + 0.3 * sin(extract(epoch from g) / 1000) + (random() - 0.5) * 0.2)::numeric, 2) end,
  (55 + floor(random() * 44)::int),
  g
from public.devices d
cross join generate_series(now() - interval '6 hours', now(), interval '5 minutes') as g
where d.status in ('online', 'alert');

-- ------------------------------------------------------------
-- 说明：日历笔记(calendar_notes)与记事本(memos)未在此填充，
--       因为它们依赖 auth.uid()（当前登录用户），请登录后在前端页面直接创建。
-- ============================================================
