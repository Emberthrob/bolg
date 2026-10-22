---
title: 新增一篇笔记
description: 从 Obsidian 新建 Markdown 到自动出现在侧边栏、自动部署的完整流程。
date: 2026-10-23
tags:
  - 写作
  - 工作流
---

# 新增一篇笔记

核心原则只有一句：**把 `.md` 文件放进四个栏目目录，导航会自动更新。**

不需要改 `docs/.vitepress/config.ts`，不需要在某个数组里加一行，也不需要手动维护侧边栏。

## 1. 选一个栏目

| 目录 | 放什么 | 示例路径 |
| --- | --- | --- |
| `docs/projects/` | 项目说明、实现记录、复盘 | `docs/projects/my-new-project.md` |
| `docs/tools/` | 工具、网站、服务的使用笔记 | `docs/tools/some-tool.md` |
| `docs/guides/` | 操作教程、配置步骤 | `docs/guides/some-guide.md` |
| `docs/games/` | 游戏攻略、机制拆解 | `docs/games/some-game.md` |

也可以在这四个目录里再建子文件夹，例如 `docs/projects/2026/my-project.md`。侧边栏会按目录层级自动分组。

::: warning 不要放在这些地方
- 不要放在仓库根目录（例如直接放 `my-note.md`），它不会归入四个栏目。
- 不要放在 `docs/.vitepress/` 或 `docs/public/` 里，那是配置和静态资源目录。
- 不要新建第五个顶级目录，除非你确实想让它出现在顶部导航里。顶部导航会自动多一项，但四个固定栏目的布局最稳定。
:::

## 2. 文件名怎么取

推荐用**英文小写 + 短横线**，例如：

```text
docs/guides/cloudflare-pages.md
docs/tools/image-compression.md
```

原因：生成的网址干净、不会被转义，跨设备也不容易因为编码或大小写出问题。

中文标题写在 frontmatter 的 `title` 里，会显示在侧边栏和浏览器标签上：

```md
---
title: 图片压缩工具怎么选
description: 对比几种常见方案，以及我在什么场景下用哪一个。
date: 2026-10-23
tags:
  - 工具
  - 图片
---

# 图片压缩工具怎么选

正文从这里开始。
```

`title`、`description`、`date`、`tags` 都不是必填，但建议写 `title`，这样侧边栏显示的是中文标题，而不是文件名。

## 3. 在 Obsidian 里新建

1. 在 Obsidian 左侧文件树里展开 `docs` → 选一个栏目（例如 `guides`）。
2. 右键 → **New note**，文件名用英文短横线格式。
3. 在笔记顶部的 Properties 里添加 `title`、`description`、`date`、`tags`。
4. 正文用标准 Markdown 写。

如果刚配置好 Obsidian，建议先确认三个设置（详见 [Obsidian 多端同步](/guides/obsidian-sync#四-让-obsidian-写出-vitepress-认识的格式)）：

- **Use [[Wikilinks]]**：关闭
- **New link format**：Relative path to file
- **Default location for new attachments**：In subfolder under current folder，子文件夹名 `assets`

## 4. 链接和图片怎么写

内部链接使用**以 `/` 开头的站点路径**，不要带 `.html`，也不要用 Obsidian 的双链语法：

```md
推荐看 [部署教程](/guides/cloudflare-pages)。

![架构草图](./assets/architecture.png)
```

图片放在与笔记同级的 `assets/` 文件夹里，用 `./assets/文件名.png` 引用。VitePress 会自动处理。

::: danger 两种写法不要混用
- `[[另一篇笔记]]` 是 Obsidian 双链，VitePress 不认识。
- `![[图片.png]]` 是 Obsidian 的嵌入语法，VitePress 也不认识。

博客正文请统一使用标准 Markdown：`[文字](/路径)` 和 `![说明](./assets/图片.png)`。
:::

## 5. 本地预览（可选）

在仓库根目录打开终端：

```bash
npm install
npm run dev
```

浏览器打开终端里显示的地址（通常是 `http://localhost:5173`）。

新增文件后，如果侧边栏没有立刻出现，按 `Ctrl + C` 停掉，再运行一次 `npm run dev` 即可。**不需要改配置**。线上构建每次都会重新扫描目录，所以部署后的导航一定是新的。

## 6. 同步并发布

在 Obsidian 里触发一次 Easy Git Sync 同步，或在电脑上：

```bash
git add .
git commit -m "docs: add 图片压缩工具怎么选"
git push origin main
```

推送成功后：

1. GitHub 仓库的 `main` 分支出现新提交。
2. Cloudflare Pages 自动开始一次构建。
3. 构建完成后，新文章会出现在网站上，侧边栏也会自动多一项。

## 7. 检查清单

- [ ] 文件在 `docs/projects`、`docs/tools`、`docs/guides` 或 `docs/games` 下
- [ ] 文件名是英文小写和短横线
- [ ] frontmatter 里有 `title`
- [ ] 没有使用 `[[双链]]` 或 `![[嵌入]]`
- [ ] 图片用相对路径 `./assets/...`
- [ ] 已推送到 `main`
- [ ] Cloudflare Pages 最新部署显示成功

做完这七步，就可以关掉编辑器了。
