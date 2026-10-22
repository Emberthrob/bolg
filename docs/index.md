---
layout: home
title: Emberthrob的基地
titleTemplate: false
description: Emberthrob 的个人知识库：项目记录、工具收藏、操作教程与游戏攻略。

hero:
  name: Emberthrob的基地
  text: 把散落的想法，收进一个随时能翻的基地。
  tagline: 一个中文个人知识库：项目 · 工具 · 教程 · 游戏。用 Obsidian 写作，用 Git 同步，用 Cloudflare Pages 发布。
  image:
    src: /hero.svg
    alt: 由节点和连线组成的知识网络
  actions:
    - theme: brand
      text: 开始逛逛
      link: /projects/
    - theme: alt
      text: 写作与同步
      link: /guides/obsidian-sync

features:
  - icon: 🧩
    title: 项目说明
    details: 记录做过的东西：它解决什么问题、怎么搭起来、踩过哪些坑，以及下一步还能往哪走。
    link: /projects/
    linkText: 查看项目
  - icon: 🧰
    title: 工具网站
    details: 收藏真正用得上、能省时间的工具与服务。每条都写清楚用途和入口，不做无意义的堆砌。
    link: /tools/
    linkText: 打开工具箱
  - icon: 📘
    title: 操作教程
    details: 把配置、部署、同步这些容易忘的步骤写成可以直接照做的清单，下次不用重新摸索。
    link: /guides/
    linkText: 查看教程
  - icon: 🎮
    title: 游戏攻略
    details: 记录开荒路线、机制拆解与实用技巧。写给未来的自己，也写给刚好路过的你。
    link: /games/
    linkText: 翻翻攻略
---

<div class="home-note">
  <p class="home-note__eyebrow">WRITE → SYNC → BUILD</p>
  <h2>只写 Markdown，导航自己长出来</h2>
  <p>
    你只需要在 <code>docs/projects</code>、<code>docs/tools</code>、<code>docs/guides</code> 或
    <code>docs/games</code> 里新建 <code>.md</code> 文件。侧边栏会自动收录新笔记，顶部四个栏目保持不变。
    提交并推送到 GitHub 后，Cloudflare Pages 会自动重新构建，不需要碰配置文件。
  </p>
  <a class="home-note__link" href="/guides/new-note">看看新增一篇笔记的完整流程 →</a>
</div>
