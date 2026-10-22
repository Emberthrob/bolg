# Emberthrob的基地

个人知识库 / 博客站点，使用 **VitePress + vitepress-gen-navs + Cloudflare Pages** 搭建，内容通过 **Obsidian + Easy Git Sync** 在电脑和手机之间同步。

- 正式域名：`https://blog.bfreegpt.com`（待绑定）
- GitHub 仓库：`https://github.com/Emberthrob/bolg`
- 内容语言：中文
- 部署方式：Cloudflare Pages 连接 GitHub `main` 分支自动构建（不使用 GitHub Pages）

## 本地运行

需要 Node.js 20 或更高版本（推荐 22）。

```bash
npm install
npm run dev
```

构建与预览：

```bash
npm run build
npm run preview
```

构建产物在 `docs/.vitepress/dist/`。

## 目录结构

```text
.
├─ docs/
│  ├─ index.md                  # 首页
│  ├─ projects/                 # 项目说明
│  ├─ tools/                    # 工具网站
│  ├─ guides/                   # 操作教程
│  ├─ games/                    # 游戏攻略
│  ├─ public/                   # 静态资源（logo、hero）
│  └─ .vitepress/
│     ├─ config.ts              # 站点配置 + 自动导航 + 搜索
│     └─ theme/
│        ├─ index.ts            # 主题入口
│        └─ custom.css          # 响应式与视觉调整
├─ package.json
├─ package-lock.json
├─ .node-version                # Cloudflare 构建使用 Node 22
└─ .gitignore                   # 忽略依赖、缓存、.obsidian
```

## 导航为什么不用手动维护

`docs/.vitepress/config.ts` 调用 `vitepress-gen-navs` 扫描 `docs/`：

- 顶部导航固定为四个栏目：**项目 / 工具 / 教程 / 游戏**；
- 每个栏目下的 Markdown 会自动进入侧边栏，新增文件不需要改配置；
- 子文件夹会按层级自动分组；
- 侧边栏在手机端由 VitePress 的抽屉式菜单承载，不会把顶部导航撑长。

新增文章时只需要：

1. 在四个栏目目录之一新建 `.md` 文件；
2. 文件名用英文小写 + 短横线；
3. 在 frontmatter 写 `title`；
4. 用标准 Markdown 链接和图片（不要用 `[[双链]]`、`![[图片]]`）；
5. 同步 / 推送到 `main`。

本地开发时如果新文件没有立刻出现在侧边栏，重启 `npm run dev` 即可。线上每次构建都会重新扫描，无需改配置。

## 推送到 GitHub

仓库是空的，可以在本地初始化后推送：

```bash
git init
git branch -M main
git add .
git commit -m "chore: initialize VitePress blog"
git remote add origin https://github.com/Emberthrob/bolg.git
git push -u origin main
```

如果远端已经有内容，先执行：

```bash
git pull --rebase origin main
```

再推送。首次推送前确认 Git 用户名和邮箱已配置：

```bash
git config --global user.name "Emberthrob"
git config --global user.email "你的 GitHub 邮箱"
```

## Cloudflare Pages 构建配置

| 配置 | 值 |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `docs/.vitepress/dist` |
| Root directory | 留空（仓库根目录） |
| Environment variable | `NODE_VERSION=22` |

绑定自定义域名：

1. Pages 项目 → **Custom domains** → **Set up a domain**；
2. 输入 `blog.bfreegpt.com`；
3. 因为 `bfreegpt.com` 已托管在同一 Cloudflare 账号，CNAME 会自动添加；
4. 等待状态变为 **Active**，SSL 证书通常几分钟内签发。

详细步骤、常见报错和域名注意事项见 [部署到 Cloudflare Pages](docs/guides/cloudflare-pages.md)。

## Obsidian 多端同步

1. 安装并启用社区插件 **Easy Git Sync**（作者 69Jesse）；
2. 创建 Fine-grained GitHub Token，只授权 `Emberthrob/bolg`，权限为 **Contents: Read and write**；
3. 电脑：`git clone` 仓库，用 Obsidian 打开**仓库根目录**作为 Vault；
4. 手机：新建空 Vault，安装插件，粘贴 Token，选择仓库并拉取；
5. 不要同时启用 Obsidian Git；不要用 Obsidian Sync 再同步同一份 Vault。

完整的 Token 步骤、克隆、冲突处理和 Obsidian 设置见 [Obsidian 多端同步](docs/guides/obsidian-sync.md)。

## 写作约定

- 内部链接：`[文字](/guides/cloudflare-pages)`
- 图片：`![说明](./assets/图片.png)`
- 不要在博客正文使用 Obsidian 双链 / 嵌入语法
- 不要在四个固定栏目之外新增顶级目录，除非确实想让它出现在顶部导航
- `.obsidian/` 已被忽略，插件配置不会跨设备同步，这是有意为之

## 相关内容

- [新增一篇笔记](docs/guides/new-note.md)
- [部署到 Cloudflare Pages](docs/guides/cloudflare-pages.md)
- [Obsidian 多端同步](docs/guides/obsidian-sync.md)
- [本站是怎么搭起来的](docs/projects/how-this-site-works.md)
