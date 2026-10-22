---
title: 本站是怎么搭起来的
description: Emberthrob的基地的技术栈、目录结构与自动发布流程。
date: 2026-10-23
tags:
  - VitePress
  - Cloudflare
  - Obsidian
---

# 本站是怎么搭起来的

这个站点从一个空仓库开始，目标很简单：**写作要轻，发布要自动，导航不要手动维护**。

## 技术栈

| 环节 | 选择 | 作用 |
| --- | --- | --- |
| 写作 | Obsidian | 在电脑和手机上写 Markdown，多设备同步 |
| 框架 | VitePress 1.6.4 | 把 Markdown 生成静态站点 |
| 导航 | vitepress-gen-navs | 扫描目录，自动生成 nav 和 sidebar |
| 代码托管 | GitHub `Emberthrob/bolg` | 保存内容与代码，作为部署源 |
| 部署 | Cloudflare Pages | 监听 `main` 分支，自动构建并发布 |
| 域名 | `blog.bfreegpt.com` | 绑定到 Pages 项目，自动签发证书 |

## 内容是怎么流动的

```text
Obsidian 写 Markdown
        ↓  Easy Git Sync
GitHub 仓库 main 分支
        ↓  Cloudflare Pages 自动构建
https://blog.bfreegpt.com
```

整个流程里，新增一篇笔记**不需要改 `config.ts`**。自动导航插件在每次构建时扫描 `docs/`，把新文件放进对应栏目的侧边栏。

## 目录约定

```text
docs/
├─ projects/   项目说明
├─ tools/      工具网站
├─ guides/     操作教程
├─ games/      游戏攻略
└─ .vitepress/ 站点配置与主题
```

只在这四个目录里写内容，顶部导航就始终是四项，手机上也不会越加越长。文章再多，也只在侧边栏里展开。

## 下一步

- [新增笔记的完整流程](/guides/new-note)
- [部署到 Cloudflare Pages](/guides/cloudflare-pages)
- [Obsidian 多端同步](/guides/obsidian-sync)
