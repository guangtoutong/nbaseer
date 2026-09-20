# NBAseer 部署与运维

## 架构

```
ESPN Scoreboard API ──┐
                      ├──> Worker (nbaseer-worker, cron */10) ──> D1 (nbaseer-db)
The Odds API ─────────┘                                            │
                                                                   v
                                                  Pages (nbaseer) ──> nbaseer.pages.dev
```

- **Worker** 负责全部写入：拉赛程比分、结算已完赛的预测、更新 Elo 评分、生成新预测。
- **Pages** 只读 D1，不写。
- 预测模型在 `worker/model.mjs`，Worker 与 `scripts/backfill.mjs` 共用同一份实现。

---

## 一、首次部署

### 1. 创建 D1 数据库

Cloudflare Dashboard → **Workers & Pages** → **D1** → **Create database**，命名 `nbaseer-db`，记下 Database ID。

### 2. 建表并写入球队数据

在 D1 的 **Console** 里执行 `db/schema.sql` 的全部内容。该文件已包含 30 支球队的插入语句。

或用命令行：

```bash
cd worker
npx wrangler d1 execute nbaseer-db --remote --file=../db/schema.sql
```

> Worker 每次运行都会执行幂等迁移（`team_ratings`、`meta` 表和新增字段），所以老库不需要手工补结构。

### 3. 写入 Elo 初始评分

**这一步不能跳过。** 没有它，开赛前两周所有球队评分都是 1500，预测会全是 50%。

```bash
cd worker
npx wrangler d1 execute nbaseer-db --remote --file=../db/seed-ratings.sql
```

`db/seed-ratings.sql` 由回测脚本生成，内容是上赛季 1,322 场比赛回放后的评分，并按 75% 结转到新赛季。

### 4. 部署 Worker

Worker 通过 GitHub Actions 自动部署（`.github/workflows/deploy-worker.yml`），推送 `worker/**` 即触发。

需要在 GitHub 仓库 **Settings → Secrets and variables → Actions** 配置：

| Secret | 必需 | 说明 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | 是 | 权限需包含 **Workers Scripts: Edit** 和 **D1: Edit** |
| `ODDS_API_KEY` | 否 | 不配置则模型独立出数，站点照常工作 |

> **历史教训 1**：`ODDS_API_KEY` 这个 GitHub secret 从未被创建，而 workflow 无条件把它传给 `wrangler secret put`。空值导致部署失败，连续 6 次没人发现，数据管道停了半年。现在 workflow 会先判断该 secret 是否非空，为空则跳过这一步。

> **历史教训 2**：`ODDS_API_KEY` 曾以**明文环境变量**（`plain_text`）的形式设在 Cloudflare 控制台。`wrangler deploy` 会用 `wrangler.toml` 整体替换绑定集，而配置里没有 `[vars]` 段，于是这个变量被静默抹掉——且 `wrangler secret list` 根本看不到它（那个命令只列 Secret）。
>
> **API key 一律用 Secret，不要用明文变量。** Secret 不受 `wrangler deploy` 影响。若误删，Cloudflare 保留最近 20 个版本，明文变量的值可以从版本历史取回：
>
> ```bash
> # 列出版本，找到误删之前的那个
> curl -H "Authorization: Bearer $TOKEN" \
>   "https://api.cloudflare.com/client/v4/accounts/$ACC/workers/scripts/nbaseer-worker/versions?per_page=20"
> # 读取该版本的绑定，plain_text 类型会带 text 字段（secret_text 不会）
> curl -H "Authorization: Bearer $TOKEN" \
>   ".../versions/$VERSION_ID" | jq '.result.resources.bindings'
> ```

首次也可手动部署：

```bash
cd worker
npx wrangler deploy
```

### 5. 绑定 D1 到 Worker

Worker → **Settings** → **Bindings** → 添加 D1 绑定：变量名 `DB`，选择 `nbaseer-db`。

`wrangler.toml` 里已声明该绑定，用 wrangler 部署会自动配置；仅在 Dashboard 手动创建 Worker 时需要手工加。

### 6. 部署 Pages

Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**，选择 `guangtoutong/nbaseer`：

- Framework preset: **Next.js**
- Build command: `npx @cloudflare/next-on-pages`
- Build output directory: `.vercel/output/static`

部署完成后 → **Settings** → **Functions** → **D1 database bindings** → 添加：变量名 `DB`，选择 `nbaseer-db`，然后重新部署一次。

---

## 二、部署后自检

```bash
# 1. Worker 活着，且看得到 D1
curl https://nbaseer-worker.<你的子域>.workers.dev/health

# 期望：teamRatings 为 30，hasOddsKey 反映你是否配置了 key
```

```bash
# 2. 手动触发一次完整同步
curl "https://nbaseer-worker.<你的子域>.workers.dev/sync?force=1"

# 期望：datesFetched 有 5 个日期，errors 为空数组
# 若 errors 里有 "ESPN ...: HTTP 403"，见下方故障排查
```

```bash
# 3. 站点 API 能读到数据
curl https://nbaseer.pages.dev/api/today
curl https://nbaseer.pages.dev/api/teams?stats=true
```

赛季期间，打开 https://nbaseer.pages.dev/ 应能看到当日比赛，且每场的胜率各不相同。**如果所有比赛都显示 50%，说明第 3 步的评分种子没写进去。**

---

## 三、日常运维

### Worker 端点

| 端点 | 用途 |
|---|---|
| `/health` | 绑定状态、最近同步时间、剩余赔率额度、各状态比赛数 |
| `/sync` | 手动触发同步（遵守赔率与预测的频率限制） |
| `/sync?force=1` | 强制同步，忽略频率限制 |
| `/debug/espn?date=YYYY-MM-DD` | 直接返回 ESPN 的原始响应，用于区分「上游拒绝」和「解析出错」 |

### 赔率额度

The Odds API 免费档每月 500 credits。一次请求 = 市场数 × 区域数 = `h2h,spreads,totals` × `us` = **3 credits**。

Worker 限制为每 6 小时取一次 = 4 次/天 × 3 = 12 credits/天 ≈ **372/月**，留有余量。

`/health` 的 `oddsCreditsRemaining` 字段显示上游返回的剩余额度。

> 改动 `ODDS_MIN_INTERVAL_MS` 前先算一遍月消耗。之前每 30 分钟取一次 = 4,320 credits/月，是免费额度的 8.6 倍，开赛几天就会耗尽。

### 赛季交接

新赛季开始前，重新生成评分种子并写入：

```bash
node scripts/backfill.mjs <上赛季开始日> <上赛季结束日>
cd worker && npx wrangler d1 execute nbaseer-db --remote --file=../db/seed-ratings.sql
```

脚本同时会更新 `src/lib/backtest.ts`，站点上展示的回测数字随之刷新，推送后自动生效。

---

## 四、本地开发

```bash
# 建本地库
cd worker
npx wrangler d1 execute nbaseer-db --local --file=../db/schema.sql
npx wrangler d1 execute nbaseer-db --local --file=../db/seed-ratings.sql

# 跑站点（自动连上同一个本地 D1）
cd ..
npm run dev
```

Worker 本地调试：

```bash
cd worker
npx wrangler dev --local
```

**注意**：ESPN 在 Akamai 后面，会以 TLS 指纹拒绝本地 workerd 运行时（返回 403 Access Denied），而部署到 Cloudflare 后正常。本地要跑通完整链路，用回放代理：

```bash
# 终端 1：把真实 ESPN 数据代理给 worker（REPLAY_SHIFT_DAYS 可把日期平移到有比赛的那天）
REPLAY_SHIFT_DAYS=34 node scripts/espn-replay.mjs 8798

# 终端 2
cd worker
echo 'ESPN_SCOREBOARD_URL="http://127.0.0.1:8798/scoreboard"' > .dev.vars
npx wrangler dev --local
```

### 模型调参

```bash
node scripts/backfill.mjs 2025-10-21 2026-06-27   # 首次会抓 250 天并缓存
node scripts/tune.mjs 2025-10-21 2026-06-27        # 单参数扫描
node scripts/tune.mjs 2025-10-21 2026-06-27 --grid # 联合网格
```

回测样本约 1,200 场，胜负命中率的标准误约 1.4 个百分点——**0.5 个百分点以内的差异是噪声，不要照着最大值调参**。

---

## 五、故障排查

### 数据不更新

按顺序查：

1. **GitHub Actions 是否成功** — `gh run list --limit 5`。这是上次故障的根因：部署连续失败半年无人察觉。
2. **cron 是否在跑** — Worker → Logs，或看 `/health` 的 `lastSync`。
3. **`scheduled` 处理器是否存在** — 部署的版本必须导出 `scheduled`。只有 `fetch` 的话 cron 会静默空转。
4. **手动触发** — `curl ".../sync?force=1"`，看 `errors` 数组。

### 所有预测都是 50% / 220 分

评分表是空的。执行第 3 步写入 `db/seed-ratings.sql`，再 `/sync?force=1`。

### 某些球队的比赛缺失

ESPN 对 6 支球队用了不同缩写：`GS`/`NO`/`NY`/`SA`/`UTAH`/`WSH`。`worker/model.mjs` 的 `ESPN_ABBR_ALIAS` 负责映射。如果 ESPN 再改动缩写，会导致对应球队的比赛被静默丢弃——用 `/debug/espn` 对比原始响应里的 `abbreviation` 字段。

### 历史页显示「本赛季还没有已结算的预测」

正常现象，直到第一场有预测的比赛打完。要有记录，需要满足：比赛 `status='final'`、有比分、且 `predictions` 里有对应行。

### 有比赛一直卡在「进行中」

Worker 每次运行会回收超过 1 天仍为 `live`/`scheduled` 的旧比赛（`reconcileStranded`），每次最多处理 8 个日期。积压较多时跑几次即可清空。

### ESPN 返回 403

- 本地 workerd：预期行为，见上文回放代理。
- 生产环境：通常是短时限流。回测脚本若一次性猛拉会触发，脚本已内置节流与退避。
