# 竹子嵌入式设备监控平台

面向设备管理员的嵌入式设备远程监控平台，支持 WiFi、以太网、蜂窝网络、蓝牙、NB-IoT 等多种通信方式，实时采集并展示温度、湿度等传感器数据。深色科技风仪表盘，一屏掌控全局设备状态。

## 功能一览

- **设备总览仪表盘**：设备总数 / 在线 / 离线 / 告警统计、通信方式分布、环境数据概览、最近告警、近 24 小时在线率趋势
- **设备管理**：台账列表（表格 / 卡片双视图）、按通信方式与状态筛选、关键词搜索、多字段排序与分页
- **设备详情**：基本信息、实时温湿度与信号强度、动态曲线（近 1 / 6 / 24 小时）、自动刷新、最近上报记录
- **历史数据**：按设备（多选）、时间范围、数据类型查询，折线图对比、明细表格、CSV 导出
- **设备地图**：高德地图（可选）或内置坐标分布示意视图，按状态着色，点击查看摘要并跳转详情
- **告警中心**：告警统计、等级 / 类型 / 状态筛选、展开详情、标记已处理并填写备注
- **日历笔记**：月历视图、按日期记录工作笔记（新建 / 编辑 / 删除）
- **记事本**：标题 + 正文 + 分类标签，关键词搜索、分类筛选、删除二次确认

全站时间统一对接**北京时间（UTC+8）**。

## 技术栈

- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router v6
- @supabase/supabase-js
- TanStack Query（服务端状态管理）
- Recharts（图表）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入 Supabase 的 URL 与 anon key（在 Supabase 项目 `Settings -> API` 中获取）：

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
# 可选：高德地图 Key，不填则使用内置坐标分布示意视图
VITE_AMAP_KEY=
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:5173 即可。

> **演示模式**：如果未配置 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_ANON_KEY`，项目会自动回退到**演示模式**——使用内置 mock 数据，任意邮箱密码即可登录，方便你直接体验完整功能而无需后端。

## 配置 Supabase

### 1. 创建项目

前往 [supabase.com](https://supabase.com) 注册并创建一个新项目。

### 2. 执行 SQL 初始化

1. 进入项目 `SQL Editor`
2. 打开本仓库 `supabase/migrations/001_init.sql`
3. 全选并点击 `Run`，完成建表、索引、触发器与 RLS 策略

> 建议使用 Supabase CLI 执行迁移（更规范、可版本化）：
>
> ```bash
> npx supabase login
> npx supabase link --project-ref <你的项目ref>
> npx supabase db push
> ```

### 3. 获取连接信息

在 `Settings -> API` 页面复制：
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public key** → `VITE_SUPABASE_ANON_KEY`

> ⚠️ 安全提醒：**只使用 anon key**，绝不要在前端使用 `service_role` key，也不要暴露数据库密码。`service_role` 会绕过 RLS，仅可用于服务端。

### 4. 创建登录账号

在 Supabase `Authentication -> Users` 中手动添加用户，或使用登录页的「注册」功能（若开启了邮箱确认，需先到邮箱验证）。

## 数据库结构

| 表 | 说明 | 关键字段 |
| --- | --- | --- |
| `devices` | 设备 | name、comm_type、status、location、经纬度、current_temp/humidity/signal |
| `sensor_data` | 传感器数据 | device_id、temperature、humidity、signal_strength、reported_at |
| `alerts` | 告警记录 | device_id、type、level、trigger_value、threshold、status、remark |
| `calendar_notes` | 日历笔记 | user_id、date、title、content |
| `memos` | 记事本 | user_id、title、content、category |

- 所有表已开启 **RLS**；`calendar_notes` / `memos` 基于 `auth.uid()` 做用户隔离
- 时间字段统一存储为 UTC，前端展示时转换为北京时间（UTC+8）
- 新上报 `sensor_data` 时，触发器会自动更新设备最新读数

## 部署

构建产物：

```bash
npm run build
```

### Vercel

1. 推送代码到 GitHub，在 [vercel.com](https://vercel.com) 导入仓库
2. Framework Preset 选择 **Vite**，构建命令 `npm run build`，输出目录 `dist`
3. 在 `Project Settings -> Environment Variables` 添加：
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - （可选）`VITE_AMAP_KEY`

### Netlify

1. 在 [netlify.com](https://netlify.com) 导入仓库
2. Build command：`npm run build`，Publish directory：`dist`
3. 在 `Site settings -> Environment variables` 添加同上环境变量

### Cloudflare Pages

1. 在 [Cloudflare Pages](https://pages.cloudflare.com) 创建项目
2. Build command：`npm run build`，输出目录：`dist`
3. 在 `Settings -> Environment variables` 添加同上环境变量

> 注意：三个平台均为静态托管，需要为 SPA 配置重写规则，把未匹配的路径重定向到 `index.html`：
>
> - **Vercel**：添加 `vercel.json`，内容 `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`
> - **Netlify**：添加 `public/_redirects`，内容 `/*  /index.html  200`
> - **Cloudflare Pages**：无需额外配置，默认已支持 SPA 回退

## 绑定自定义域名

1. 在所选平台的项目设置中找到 **Domains**（自定义域名）
2. 添加你的域名（如 `monitor.example.com`）
3. 按平台提示到域名服务商处添加对应的 DNS 记录（`CNAME` 或 `A` 记录，具体以平台给出的目标为准）
4. 等待 DNS 生效并完成 HTTPS 证书签发即可

> 若使用 Supabase Auth 的邮箱确认 / OAuth 回调，记得在 Supabase `Authentication -> URL Configuration` 中把 **Site URL** 更新为你的正式域名。

## 目录结构

```
zhuzi-monitor/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── .env.local.example
├── supabase/
│   └── migrations/
│       └── 001_init.sql
└── src/
    ├── main.tsx               # 入口
    ├── App.tsx                # 应用根组件
    ├── router/index.tsx       # 路由 + 登录保护
    ├── lib/
    │   ├── supabaseClient.ts  # Supabase 客户端（含环境变量回退）
    │   ├── api.ts             # 数据访问公共助手
    │   ├── constants.ts       # 标签 / 颜色映射
    │   ├── mockData.ts        # mock 数据生成
    │   └── utils.ts           # 时间格式化等工具
    ├── types/index.ts         # 全局类型
    ├── services/              # 数据访问层（页面不直接写查询）
    │   ├── devices.ts
    │   ├── sensorData.ts
    │   ├── alerts.ts
    │   ├── calendarNotes.ts
    │   └── memos.ts
    ├── hooks/                 # TanStack Query hooks
    ├── context/AuthContext.tsx# Supabase Auth + 演示模式
    ├── components/
    │   ├── layout/            # AppLayout / Sidebar / Header
    │   ├── ui/                # 通用 UI 组件
    │   ├── charts/            # 图表组件
    │   └── devices/           # 设备相关组件
    └── pages/                 # 各页面
```

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run preview` | 预览生产构建 |
| `npm run typecheck` | 仅做 TypeScript 类型检查 |
