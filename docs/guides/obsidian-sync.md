---
title: Obsidian 多端同步
description: 用 Easy Git Sync 把电脑和手机接到同一个博客仓库，包含 Token、克隆和冲突处理。
date: 2026-10-23
tags:
  - Obsidian
  - Git
  - 同步
---

# Obsidian 多端同步

这套方案的目标：**电脑和手机都打开同一个 Obsidian 仓库，写完后同步到 GitHub，Cloudflare Pages 自动发布。**

用到的插件是 **Easy Git Sync**（作者 69Jesse）。它能在桌面端和手机端运行，不需要在手机上装 Git。

::: danger 先记住一条
**Obsidian 仓库（Vault）的根目录 = GitHub 仓库的根目录。**

不要把 Vault 只指向 `docs/`。Easy Git Sync 是把整个 Vault 和仓库根目录对应起来的，只同步 `docs/` 会导致路径错位，甚至把仓库里的其他文件当成“被删除”。
:::

## 一、准备 GitHub Token

Token 相当于给 Obsidian 的一把“只开这一个仓库”的钥匙。用 **Fine-grained token**，不要用账号密码。

### 方式 A：用插件自动打开创建页（推荐）

安装并启用 Easy Git Sync 后，在插件设置里点 **Create token on GitHub**。GitHub 会打开一个已经填好名称和权限的表单，你只需要：

1. 确认 **Repository access** 选择 **Only select repositories**；
2. 选中 `Emberthrob/bolg`；
3. 确认 **Repository permissions → Contents** 是 **Read and write**；
4. 点 **Generate token**，复制以 `github_pat_` 开头的字符串。

> 插件打开的表单默认可能把过期时间设为 **No expiration**。建议手动改成 90 天或 1 年，到期前重新生成。这样即使 Token 泄露，影响也有时间上限。

### 方式 B：手动创建

1. 打开 GitHub → 右上角头像 → **Settings**。
2. 左侧最下方 → **Developer settings**。
3. **Personal access tokens** → **Fine-grained tokens** → **Generate new token**。
4. 按下表填写：

| 项目 | 填写 |
| --- | --- |
| Token name | `obsidian-easy-git-sync` |
| Expiration | 90 天或 1 年（到期要重新生成） |
| Resource owner | `Emberthrob` |
| Repository access | **Only select repositories** → `Emberthrob/bolg` |
| Repository permissions → Contents | **Read and write** |
| Repository permissions → Metadata | **Read-only**（自动勾选，保持即可） |

其他权限不需要开。尤其不需要 `Workflows`、`Administration` 或账号级别的全权限。

5. 点 **Generate token**，立刻复制。页面关闭后就看不到完整 Token 了。

::: warning Token 安全
- Token 只保存在每台设备的 Obsidian 钥匙串里，**不要**写进笔记、截图、聊天记录或仓库。
- 不要把它提交到 Git。仓库的 `.gitignore` 已经忽略了 `.obsidian/`，但你自己也不要把 Token 放进 Markdown。
- 如果怀疑泄露，立刻到 GitHub 的 Token 页面点 **Revoke**，然后重新生成。
- 给 Token 设过期时间，并在日历里加一个提醒。过期后同步会报 401，重新生成即可。
:::

## 二、电脑端：克隆仓库并打开

### 1. 先确认仓库不是空的

代码要先推到 `Emberthrob/bolg` 的 `main` 分支。空仓库直接克隆会得到一个空文件夹。

### 2. 克隆仓库

安装 [Git](https://git-scm.com/downloads) 后，在你想放笔记的目录打开终端：

```bash
git clone https://github.com/Emberthrob/bolg.git Emberthrob-blog
cd Emberthrob-blog
git status
```

确认：

- 当前分支是 `main`；
- 能看到 `docs/`、`package.json` 等文件；
- 工作区是干净的（`nothing to commit, working tree clean`）。

如果仓库是私有的，`git clone` 会要求登录。可以用 GitHub Desktop 克隆，或者改用 SSH；不要为了省事把 Token 直接拼进 clone 地址并留在命令历史里。

### 3. 用 Obsidian 打开仓库根目录

1. 打开 Obsidian。
2. 点左下角 **Open another vault** → **Open folder as vault**。
3. 选择刚才克隆下来的 `Emberthrob-blog` 文件夹，**不是**里面的 `docs`。
4. 如果 Obsidian 询问是否信任作者并启用插件，确认这是你自己的仓库后再继续。

打开后左侧应该能看到 `docs`、`README.md` 等。`package.json` 之类不是 Markdown 的文件通常不会显示，这是正常的。

### 4. 安装 Easy Git Sync

1. 设置 → **Community plugins** → 关闭安全模式 / 打开社区插件。
2. **Browse** → 搜索 `Easy Git Sync`。
3. 确认作者是 **69Jesse**，点 **Install** → **Enable**。
4. 如果你之前装过 **Obsidian Git**，请先把它禁用。两个 Git 插件同时跑会互相打架。

### 5. 配置并开始同步

1. 打开 Easy Git Sync 的设置。
2. 把刚才的 Token 粘贴到 **Access token**。
3. 点 **Choose**，选择 `Emberthrob/bolg`。如果有分支选项，选 `main`。
4. 点 **Start syncing**。
5. 第一次会显示将上传、下载、合并哪些文件。**先看清楚再确认**。
   - 本地是刚克隆的，正常情况下应该和远端一致。
   - 如果它提示两边都有内容，选择“合并（merge）”，不要选覆盖，除非你确定远端或本地有一边不要了。
6. 同步成功后，建议在插件设置里确认下面几项：

| 设置项 | 建议值 | 作用 |
| --- | --- | --- |
| **Sync after editing** | `30 seconds` 或 `1 minute` | 停止编辑后自动上传改动 |
| **Check GitHub for changes** | `1 minute` | 定时检查其他设备的改动，启动和回到 Obsidian 时也会检查 |
| **Merge conflicts** | `Keep both, marked` | 冲突时两边的版本都保留，避免丢内容 |
| **This device's name** | 例如 `Windows PC`、`iPhone` | 让同步记录能看出是哪台设备提交的 |

设置好之后，日常基本不用手动点同步；如果刚改完就想立刻发布，可以点 **Sync now**。

桌面上如果 Vault 本身就是这个仓库的 Git 克隆，插件会直接在这个目录里运行 Git 来保持同步。**同步期间不要同时用命令行或 GitHub Desktop 执行 pull / push / commit**，否则容易出现锁冲突或重复提交。

## 三、手机端：新建空 Vault 再拉取

手机上没有终端，也不需要装 Git。思路是：先建一个空 Vault，再让插件把仓库拉下来。

1. 在手机应用商店安装最新版 **Obsidian**。
2. 打开 Obsidian → **Create new vault**，名字可以叫 `Emberthrob的基地`，位置用默认即可。
3. 进入 Vault 后，打开设置 → **Community plugins** → 打开社区插件。
4. **Browse** → 搜索 `Easy Git Sync` → 确认作者 **69Jesse** → **Install** → **Enable**。
5. 打开插件设置，粘贴同一个 Token。
6. 点 **Choose** 选择 `Emberthrob/bolg`，分支选 `main`。
7. 点 **Start syncing**。因为手机 Vault 是空的，选择从仓库下载 / 以仓库为准（不同版本文案可能是 **Use repository** 或类似选项）。
8. 第一次下载建议连 Wi-Fi。完成后，`docs/` 里的笔记会出现在手机上。

::: tip 每台设备都要单独配置
Token 存在设备的钥匙串里，`.obsidian/` 又被 `.gitignore` 排除了，所以插件设置不会跟着仓库同步。换手机或重装 Obsidian 后，需要重新安装插件、粘贴 Token。
:::

## 四、让 Obsidian 写出 VitePress 认识的格式

这一步非常重要。Obsidian 默认的双链语法 VitePress 不认识，图片嵌入也可能失效。

在 Obsidian 设置 → **Files and links**（文件与链接）里调整：

| 设置 | 选择 |
| --- | --- |
| **Use [[Wikilinks]]** | 关闭（Off） |
| **New link format** | **Relative path to file** |
| **Default location for new attachments** | **In subfolder under current folder** |
| **Subfolder name**（附件子文件夹名） | `assets` |

这样：

- 链接会写成 `[文字](相对路径.md)` 或标准 Markdown 链接；
- 拖进笔记的图片会放到当前笔记旁边的 `assets/`；
- VitePress 能正确解析和打包。

写内部链接时，博客里更推荐用站点绝对路径：

```md
[部署教程](/guides/cloudflare-pages)
```

图片用相对路径：

```md
![架构草图](./assets/architecture.png)
```

::: danger 两个不要
- 不要写 `[[另一篇笔记]]`，VitePress 不会把它变成链接。
- 不要写 `![[图片.png]]`，VitePress 不会显示图片。

如果已经有旧的双链笔记，先备份，再用社区里的“Wikilinks to Markdown”类插件批量转换，或手动改。不要在没备份的情况下批量替换。
:::

## 五、日常写作流程

建议养成一个很简单的节奏：

### 开始写之前

1. 打开 Obsidian。
2. 点一次 Easy Git Sync 的同步按钮，确认已经从远端拉到最新内容。
3. 再开始编辑。

### 写的时候

- 只在 `docs/projects`、`docs/tools`、`docs/guides`、`docs/games` 下新建笔记。
- 标题写在 frontmatter：

```md
---
title: 我的新笔记
description: 一句话说明这篇写什么。
date: 2026-10-23
tags:
  - 随笔
---

# 我的新笔记

正文。
```

### 写完以后

1. 再点一次同步。
2. 看插件显示的变更列表，确认没有误删。
3. 同步完成后，GitHub 会出现一条新提交。
4. Cloudflare Pages 自动构建，几十秒到几分钟后线上更新。

::: tip 关于“自动同步”
Easy Git Sync 默认会在停止编辑约 30 秒后上传，并约每分钟检查一次其他设备的改动；启动 Obsidian 和从后台回到 Obsidian 时也会检查。把 **Sync after editing** 和 **Check GitHub for changes** 保持开启即可。**换设备前手动点一次 Sync now** 仍然是最稳的习惯。
:::

## 六、冲突和常见问题

### 冲突

如果两台设备改了同一行，插件会把两个版本都保留在笔记里，并提供类似 **Keep this device / Keep other device / Keep both** 的按钮。

处理原则：

1. 不确定时选 **Keep both**。
2. 同步完成后打开笔记，手动删掉不要的那一段。
3. 再同步一次。

避免冲突的最好办法不是“手速快”，而是：**同一篇笔记不要在两台设备上同时改**。

### 常见报错

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `401 Bad credentials` | Token 过期、复制不完整或被撤销 | 重新生成 Token，重新粘贴 |
| `403` / `Resource not accessible` | 没有 `Contents: Read and write` | 检查 Token 权限和仓库选择 |
| `Repository not found` | Token 没勾选这个仓库，或仓库名写错 | 重新选 `Emberthrob/bolg` |
| 插件提示 Git 插件在运行 | 同时启用了 Obsidian Git | 禁用 Obsidian Git，只留 Easy Git Sync |
| 手机看不到插件 | Obsidian 版本太旧或社区插件没开 | 更新 Obsidian，确认社区插件已启用 |
| 图片不显示 | 用了 `![[...]]` 或图片没同步 | 改成 `![](./assets/...)`，确认文件已提交 |
| 推送成功但网站没变 | 提交不在 `main`，或 Pages 构建失败 | 检查 GitHub 分支和 Cloudflare Deployments |
| 同步很慢 | 仓库里有很多大图片 | 压缩图片；单文件不要超过 100 MB |

### 文件大小限制

GitHub 拒绝超过 100 MB 的单个文件。截图和图片先压缩再放进仓库，不要直接塞原始大图。

### 大小写问题

`Note.md` 和 `note.md` 在 Windows 上可能被当成同一个文件，在 Linux 构建时却是两个。文件名统一用小写和短横线，可以避免这类问题。

## 七、最后检查

- [ ] 电脑上的 Vault 根目录就是仓库根目录
- [ ] 手机是空 Vault 拉取，不是只打开 `docs/`
- [ ] 两台设备都装了 Easy Git Sync，且没有同时开 Obsidian Git
- [ ] Token 只有 `Contents: Read and write`，且只授权 `Emberthrob/bolg`
- [ ] Obsidian 关闭了 Wikilinks，附件放在当前目录的 `assets/`
- [ ] 同步后 GitHub 的 `main` 有新提交
- [ ] Cloudflare Pages 最新部署成功
- [ ] 手机上打开 `https://blog.bfreegpt.com`，导航和正文没有横向滚动

全部打勾之后，就可以把“同步”这件事忘掉了：写，点一下，剩下的交给自动构建。
