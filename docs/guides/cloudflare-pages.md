---
title: 部署到 Cloudflare Pages
description: 连接 GitHub 仓库、配置构建参数并绑定 blog.bfreegpt.com 的完整步骤。
date: 2026-10-23
tags:
  - Cloudflare
  - 部署
  - 域名
---

# 部署到 Cloudflare Pages

这篇是从“代码已经在 GitHub 上”开始的。目标是把 `Emberthrob/bolg` 的 `main` 分支接到 Cloudflare Pages，并让 `https://blog.bfreegpt.com` 自动跟随每次推送更新。

::: tip 前置条件
1. 代码已经推送到 `Emberthrob/bolg` 的 `main` 分支。
2. `bfreegpt.com` 已经托管在 Cloudflare，并且域名的 Nameservers 已生效。
3. 你登录的是同一个 Cloudflare 账号。
:::

## 一、连接 GitHub 仓库

1. 打开 [Cloudflare Dashboard](https://dash.cloudflare.com/)，进入 **Workers & Pages**。
2. 点 **Create application** → **Pages** → **Connect to Git**。
3. 第一次使用时，点 **Connect GitHub**，会跳到 GitHub 授权页。
4. 在 GitHub 页面里选择 **Only select repositories**，只勾选 `Emberthrob/bolg`，然后点 **Install & Authorize**。
   - 只授权这一个仓库就够了，不需要给 Cloudflare 访问全部仓库的权限。
5. 回到 Cloudflare，在仓库列表里选中 `Emberthrob/bolg`，点 **Begin setup**。

::: warning 不要选错入口
请选 **Pages → Connect to Git**，不是 **Workers**，也不是 GitHub 仓库里的 Pages 设置。这个项目不使用 GitHub Pages。
:::

## 二、填写构建配置

| 配置项 | 填写内容 | 说明 |
| --- | --- | --- |
| Project name | `emberthrob-blog` | 会生成 `emberthrob-blog.pages.dev`，可换成别的可用名字 |
| Production branch | `main` | 只有这个分支的推送会更新正式站 |
| Framework preset | `VitePress` | 有就选；没有就选 `None` |
| Build command | `npm run build` | 调用 `package.json` 里的构建脚本 |
| Build output directory | `docs/.vitepress/dist` | **必须完全一致** |
| Root directory | 留空（或 `/`） | 不要填 `docs` |

然后在 **Environment variables (advanced)** 里加一条：

```text
NODE_VERSION = 22
```

生产环境和预览环境都加上。仓库里已经有 `.node-version`，双保险，避免构建镜像默认 Node 版本过旧。

::: danger 最常见的两个错误
1. **Root directory 填了 `docs`**：Cloudflare 会在 `docs/` 里找 `package.json`，直接构建失败。根目录必须保持仓库根目录。
2. **Build output directory 填了 `dist` 或 `.vitepress/dist`**：我们的配置在 `docs/.vitepress/` 下，正确路径是 `docs/.vitepress/dist`。
:::

填好后点 **Save and Deploy**。第一次构建通常 1～3 分钟。

## 三、确认第一次部署成功

在项目的 **Deployments** 页面看最新一条：

- 状态是 **Success**；
- 日志末尾能看到 VitePress 的 `build complete`；
- 点开 `https://emberthrob-blog.pages.dev` 能打开首页。

如果构建失败，先看日志里的第一条报错：

| 日志关键词 | 常见原因 | 处理 |
| --- | --- | --- |
| `Output directory ... not found` | 输出路径填错 | 改成 `docs/.vitepress/dist` |
| `Could not read package.json` | Root directory 填错 | 清空根目录设置 |
| `Unsupported engine` | Node 版本太低 | 加 `NODE_VERSION=22` |
| `Cannot find module` | 依赖没装好或大小写不一致 | 删掉部署重试；检查文件名大小写 |
| `vitepress-gen-navs` 相关错误 | 依赖版本未安装 | 本地 `npm install` 后提交 `package-lock.json` |

`package-lock.json` 一定要提交。Cloudflare 会根据锁文件安装依赖，避免每次构建拿到不同版本。

## 四、绑定子域名

推荐使用 `blog.bfreegpt.com`。它短、语义明确，也方便以后把 `bfreegpt.com` 留给别的内容。

### 1. 在 Pages 里添加域名

1. 进入 Pages 项目 → **Custom domains**。
2. 点 **Set up a domain**（部分界面显示为 **Set up a custom domain**）。
3. 输入：

   ```text
   blog.bfreegpt.com
   ```

4. 点 **Continue** → **Activate domain**。

### 2. CNAME 会自动添加

因为 `bfreegpt.com` 就在当前 Cloudflare 账号里，确认后 Cloudflare 会自动在 DNS 里添加一条记录，大致是：

| Type | Name | Content | Proxy status |
| --- | --- | --- | --- |
| CNAME | `blog` | `emberthrob-blog.pages.dev` | Proxied（橙色云朵） |

你可以在 **DNS → Records** 里看到它。**不需要手动再加一条 CNAME**，更不要加 A 或 AAAA 记录。

::: danger 顺序不能反
必须先在上面的 **Custom domains** 里完成域名关联，再让 Cloudflare 自动写 DNS。如果先手动加一条 CNAME 指向 `pages.dev`、但没有在 Pages 里关联域名，访问时可能出现 **522** 错误。
:::

如果 `blog` 下面原本已经有一条 A、AAAA 或 CNAME 记录，先删掉冲突记录，再回来添加自定义域名。

### 3. 等状态变成 Active

添加后，Custom domains 里会经历类似这样的状态：

```text
Initializing → Pending → Active
```

- DNS 生效通常很快，几分钟内。
- SSL 证书一般也会在几分钟内签发；少数情况下需要几十分钟，官方排障时以 **24 小时**作为需要进一步检查的界限。
- 状态变成 **Active**、浏览器地址栏出现锁图标，就说明 HTTPS 正常了。

不要因为等了几分钟没变就反复删除重加，频繁操作反而会重新触发验证。

### 4. SSL/TLS 设置

在 Cloudflare 的 **SSL/TLS → Overview** 里，加密模式建议选 **Full (strict)**。Pages 的源站支持有效证书，这个模式最稳妥。

`blog.bfreegpt.com` 是 `bfreegpt.com` 下的一级子域名，Cloudflare 的 Universal SSL 通常已经覆盖，不需要自己上传证书。

可选：在 **SSL/TLS → Edge Certificates** 打开 **Always Use HTTPS**，让 `http://` 自动跳到 `https://`。

## 五、验证与日常发布

### 验证清单

- [ ] `https://emberthrob-blog.pages.dev` 可以打开
- [ ] `https://blog.bfreegpt.com` 可以打开，证书有效
- [ ] Pages 的 Custom domains 显示 **Active**
- [ ] DNS 里只有一条指向 `emberthrob-blog.pages.dev` 的 `blog` CNAME
- [ ] 在手机上打开，导航和正文没有横向滚动

### 以后怎么发布

只需要把改动推到 `main`：

```bash
git add .
git commit -m "docs: update something"
git push origin main
```

Cloudflare Pages 会自动：

1. 拉取最新代码；
2. 执行 `npm run build`；
3. 把 `docs/.vitepress/dist` 发布到正式域名。

在 **Deployments** 里能看到每次构建的记录。构建失败时，线上仍然是上一个成功版本，不会把旧内容删掉。

### 非 main 分支

推到其他分支或开 Pull Request 时，Cloudflare 会生成一个预览地址，不会影响正式站。可以拿它检查排版，再合并到 `main`。

## 六、常见问题

::: details 访问域名出现 522
大概率是 DNS 里有一条指向 Pages 的 CNAME，但 Pages 的 Custom domains 里没有完成关联。先删除手动添加的记录，回到 Pages → Custom domains 重新添加域名。
:::

::: details 一直显示 Pending / SSL 证书没签发
1. 检查 `bfreegpt.com` 的 CAA 记录是否限制了 Cloudflare 的证书颁发机构。
2. 检查 `blog` 这个主机名上是否启用了 Cloudflare Access 或 Worker，导致验证请求被拦截。
3. 等待一段时间，不要反复删除重加；超过 24 小时再提交 Cloudflare 支持。
:::

::: details 构建成功但页面 404
检查 Pages 的 Build output directory 是否严格为 `docs/.vitepress/dist`，以及部署日志里是否真的生成了 `index.html`。
:::

::: details 想换成 notes.bfreegpt.com
可以。把本文里的 `blog` 全部换成 `notes`，并在 `docs/.vitepress/config.ts` 里把 `sitemap.hostname` 改成 `https://notes.bfreegpt.com`。一个 Pages 项目可以绑定多个自定义域名，但建议只保留一个主域名。
:::
