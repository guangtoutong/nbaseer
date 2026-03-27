# NBAseer 部署指南 (Web 端操作)

## 前置要求

1. Cloudflare 账号
2. GitHub 账号（代码已推送到 GitHub）
3. (可选) The Odds API Key - 从 https://the-odds-api.com/ 免费获取

---

## 第一步：创建 D1 数据库

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 左侧菜单选择 **Workers & Pages** → **D1 SQL Database**
3. 点击 **Create database**
4. 输入名称：`nbaseer-db`
5. 点击 **Create**
6. **记录 Database ID**（页面上会显示，格式如 `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`）

---

## 第二步：初始化数据库表

1. 在刚创建的 `nbaseer-db` 页面，点击 **Console** 标签
2. 复制以下 SQL 并粘贴到控制台执行：

```sql
-- NBA Teams
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  abbreviation TEXT UNIQUE NOT NULL,
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  name_cn TEXT,
  conference TEXT,
  division TEXT
);

-- NBA Games
CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  period INTEGER DEFAULT 0,
  time_remaining TEXT,
  home_team_id INTEGER NOT NULL,
  away_team_id INTEGER NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  season INTEGER,
  postseason INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (home_team_id) REFERENCES teams(id),
  FOREIGN KEY (away_team_id) REFERENCES teams(id)
);

-- Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER UNIQUE NOT NULL,
  home_win_prob REAL,
  away_win_prob REAL,
  predicted_home_score INTEGER,
  predicted_away_score INTEGER,
  predicted_spread REAL,
  predicted_total REAL,
  confidence REAL,
  analysis TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Odds
CREATE TABLE IF NOT EXISTS odds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  bookmaker TEXT NOT NULL,
  home_ml REAL,
  away_ml REAL,
  spread_home REAL,
  spread_home_price REAL,
  spread_away REAL,
  spread_away_price REAL,
  total_over REAL,
  total_over_price REAL,
  total_under REAL,
  total_under_price REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Team Stats
CREATE TABLE IF NOT EXISTS team_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  home_wins INTEGER DEFAULT 0,
  home_losses INTEGER DEFAULT 0,
  away_wins INTEGER DEFAULT 0,
  away_losses INTEGER DEFAULT 0,
  pts_per_game REAL,
  opp_pts_per_game REAL,
  last_10_wins INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, season),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

-- Prediction Results
CREATE TABLE IF NOT EXISTS prediction_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER UNIQUE NOT NULL,
  predicted_winner_id INTEGER,
  actual_winner_id INTEGER,
  predicted_spread REAL,
  actual_spread REAL,
  predicted_total REAL,
  actual_total REAL,
  winner_correct INTEGER DEFAULT 0,
  spread_correct INTEGER DEFAULT 0,
  total_correct INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_games_date ON games(date);
CREATE INDEX IF NOT EXISTS idx_games_status ON games(status);
CREATE INDEX IF NOT EXISTS idx_predictions_game ON predictions(game_id);
CREATE INDEX IF NOT EXISTS idx_odds_game ON odds(game_id);
```

3. 点击 **Execute** 执行

4. 再执行以下 SQL 插入球队数据：

```sql
INSERT OR IGNORE INTO teams (id, abbreviation, city, name, full_name, name_cn, conference, division) VALUES
(1, 'ATL', 'Atlanta', 'Hawks', 'Atlanta Hawks', '老鹰', 'East', 'Southeast'),
(2, 'BOS', 'Boston', 'Celtics', 'Boston Celtics', '凯尔特人', 'East', 'Atlantic'),
(3, 'BKN', 'Brooklyn', 'Nets', 'Brooklyn Nets', '篮网', 'East', 'Atlantic'),
(4, 'CHA', 'Charlotte', 'Hornets', 'Charlotte Hornets', '黄蜂', 'East', 'Southeast'),
(5, 'CHI', 'Chicago', 'Bulls', 'Chicago Bulls', '公牛', 'East', 'Central'),
(6, 'CLE', 'Cleveland', 'Cavaliers', 'Cleveland Cavaliers', '骑士', 'East', 'Central'),
(7, 'DAL', 'Dallas', 'Mavericks', 'Dallas Mavericks', '独行侠', 'West', 'Southwest'),
(8, 'DEN', 'Denver', 'Nuggets', 'Denver Nuggets', '掘金', 'West', 'Northwest'),
(9, 'DET', 'Detroit', 'Pistons', 'Detroit Pistons', '活塞', 'East', 'Central'),
(10, 'GSW', 'Golden State', 'Warriors', 'Golden State Warriors', '勇士', 'West', 'Pacific'),
(11, 'HOU', 'Houston', 'Rockets', 'Houston Rockets', '火箭', 'West', 'Southwest'),
(12, 'IND', 'Indiana', 'Pacers', 'Indiana Pacers', '步行者', 'East', 'Central'),
(13, 'LAC', 'Los Angeles', 'Clippers', 'Los Angeles Clippers', '快船', 'West', 'Pacific'),
(14, 'LAL', 'Los Angeles', 'Lakers', 'Los Angeles Lakers', '湖人', 'West', 'Pacific'),
(15, 'MEM', 'Memphis', 'Grizzlies', 'Memphis Grizzlies', '灰熊', 'West', 'Southwest'),
(16, 'MIA', 'Miami', 'Heat', 'Miami Heat', '热火', 'East', 'Southeast'),
(17, 'MIL', 'Milwaukee', 'Bucks', 'Milwaukee Bucks', '雄鹿', 'East', 'Central'),
(18, 'MIN', 'Minnesota', 'Timberwolves', 'Minnesota Timberwolves', '森林狼', 'West', 'Northwest'),
(19, 'NOP', 'New Orleans', 'Pelicans', 'New Orleans Pelicans', '鹈鹕', 'West', 'Southwest'),
(20, 'NYK', 'New York', 'Knicks', 'New York Knicks', '尼克斯', 'East', 'Atlantic'),
(21, 'OKC', 'Oklahoma City', 'Thunder', 'Oklahoma City Thunder', '雷霆', 'West', 'Northwest'),
(22, 'ORL', 'Orlando', 'Magic', 'Orlando Magic', '魔术', 'East', 'Southeast'),
(23, 'PHI', 'Philadelphia', '76ers', 'Philadelphia 76ers', '76人', 'East', 'Atlantic'),
(24, 'PHX', 'Phoenix', 'Suns', 'Phoenix Suns', '太阳', 'West', 'Pacific'),
(25, 'POR', 'Portland', 'Trail Blazers', 'Portland Trail Blazers', '开拓者', 'West', 'Northwest'),
(26, 'SAC', 'Sacramento', 'Kings', 'Sacramento Kings', '国王', 'West', 'Pacific'),
(27, 'SAS', 'San Antonio', 'Spurs', 'San Antonio Spurs', '马刺', 'West', 'Southwest'),
(28, 'TOR', 'Toronto', 'Raptors', 'Toronto Raptors', '猛龙', 'East', 'Atlantic'),
(29, 'UTA', 'Utah', 'Jazz', 'Utah Jazz', '爵士', 'West', 'Northwest'),
(30, 'WAS', 'Washington', 'Wizards', 'Washington Wizards', '奇才', 'East', 'Southeast');
```

---

## 第三步：部署 Pages 前端

1. 在 Cloudflare Dashboard，选择 **Workers & Pages**
2. 点击 **Create** → **Pages** → **Connect to Git**
3. 选择你的 GitHub 仓库 `guangtoutong/nbaseer`
4. 配置构建设置：
   - **Framework preset**: Next.js
   - **Build command**: `npx @cloudflare/next-on-pages`
   - **Build output directory**: `.vercel/output/static`
5. 点击 **Save and Deploy**

---

## 第四步：绑定 D1 数据库到 Pages

1. 部署完成后，进入 **nbaseer** 项目
2. 点击 **Settings** → **Functions** → **D1 database bindings**
3. 点击 **Add binding**
   - **Variable name**: `DB`
   - **D1 database**: 选择 `nbaseer-db`
4. 点击 **Save**
5. 返回 **Deployments** 页面，点击最新部署的 **...** → **Retry deployment**

---

## 第五步：创建数据获取 Worker（可选）

如果需要自动获取真实 NBA 数据：

1. 在 Cloudflare Dashboard，选择 **Workers & Pages**
2. 点击 **Create** → **Worker**
3. 命名为 `nbaseer-worker`
4. 将 `worker/index.ts` 的代码复制粘贴进去
5. 点击 **Deploy**
6. 进入 Worker 设置：
   - **Settings** → **Variables** → **D1 Database Bindings**
   - 添加绑定：Variable name = `DB`，选择 `nbaseer-db`
7. **Settings** → **Triggers** → **Cron Triggers**
   - 添加：`*/30 * * * *`（每30分钟执行）
8. 如果有 Odds API Key：
   - **Settings** → **Variables** → **Environment Variables**
   - 添加：`ODDS_API_KEY` = 你的 API Key

---

## 完成！

访问你的网站：https://nbaseer.pages.dev/

- 如果数据库为空，页面会显示演示数据（带"演示数据"标签）
- Worker 部署后会每 30 分钟自动获取真实数据
- 也可以手动访问 `https://nbaseer-worker.你的账号.workers.dev/update` 触发更新

---

## 故障排查

### 页面显示 500 错误
- 检查 D1 绑定是否正确配置
- 确保重新部署了 Pages

### 一直显示演示数据
- Worker 是否成功部署
- D1 绑定是否正确
- 在 D1 Console 执行 `SELECT * FROM games LIMIT 5` 检查数据

### Worker 没有获取数据
- 检查 Cron Trigger 是否配置
- 查看 Worker 的 Logs 页面
