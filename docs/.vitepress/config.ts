import { defineConfig } from 'vitepress'
import { genNavs } from 'vitepress-gen-navs'

/**
 * 四个固定栏目在导航里的中文名。
 * 新增笔记不用改这里；只有想给“新的顶级目录”起中文别名时才需要加一行。
 */
const sectionLabels: Record<string, string> = {
  projects: '项目',
  tools: '工具',
  guides: '教程',
  games: '游戏'
}

/** 顶部导航的固定顺序，避免不同系统扫描顺序不一致。 */
const sectionOrder = ['项目', '工具', '教程', '游戏']

/**
 * MiniSearch 的中文分词。
 *
 * VitePress 1.6.4 的默认 tokenizer 只按空格和符号切分，中文长句会被当成一个词。
 * 这里用 Intl.Segmenter 做词级切分，再额外补上汉字单字和双字组合：
 * - “知识库”能命中“个人知识库”
 * - “博客”能命中“博客域名证书”
 * 单字 + 双字带来的索引体积很小，对个人站点完全够用。
 *
 * 注意：这个函数会被序列化后发送到浏览器，函数内部不要引用外部变量，
 * 否则查询时会报 `xxx is not defined`。
 */
function tokenizeForSearch(text: string): string[] {
  const normalized = text.normalize('NFKC').toLowerCase()
  const tokens = new Set<string>()
  const segmenter =
    'Segmenter' in Intl
      ? new Intl.Segmenter('zh-CN', { granularity: 'word' })
      : null

  if (segmenter) {
    for (const part of segmenter.segment(normalized)) {
      if (part.isWordLike) tokens.add(part.segment)
    }
  } else {
    for (const token of normalized.split(/[\s\-_/.,;:!?()[\]{}"'`]+/)) {
      if (token) tokens.add(token)
    }
  }

  // 连续汉字补上单字与 bigram，保证短查询和跨词查询也能命中。
  for (const match of normalized.matchAll(/[\p{Script=Han}]+/gu)) {
    const run = match[0]
    for (let i = 0; i < run.length; i++) {
      tokens.add(run[i])
      if (i < run.length - 1) tokens.add(run.slice(i, i + 2))
    }
  }

  return [...tokens].filter(Boolean)
}

const { nav: generatedNav, sidebar: generatedSidebar } = genNavs({
  dir: './docs',
  include: ['**/*.md'],
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.obsidian/**',
    '**/.vitepress/**'
  ],
  nav: {
    // 一级导航只显示四个栏目，不把每个文件都塞进顶部菜单；
    // 文章列表由侧边栏自动展开，手机上更稳、更不容易溢出。
    depth: 1,
    onDirectory: ({ name }) => sectionLabels[name] ?? null
  },
  sidebar: {
    // 目录树默认展开；新文件会自动出现在对应栏目的侧边栏。
    collapsed: false,
    onDirectory: ({ name }) => sectionLabels[name] ?? null
  },
  excludeRootIndex: true,
  formatSortPrefix: true
})

/**
 * vitepress-gen-navs 生成的是 /projects/index 形式；
 * VitePress 的规范地址是 /projects/，这里统一一下，避免导航跳到 index 路由。
 */
function normalizeIndexLink(link: string): string {
  return link.endsWith('/index') ? `${link.slice(0, -5)}` : link
}

function normalizeLinks<T>(items: T[]): T[] {
  return items.map((item) => {
    const node = item as T & { link?: string; items?: T[] }

    if (Array.isArray(node.items)) {
      return { ...node, items: normalizeLinks(node.items) }
    }

    if (typeof node.link === 'string') {
      return { ...node, link: normalizeIndexLink(node.link) }
    }

    return item
  })
}

const nav = normalizeLinks(generatedNav).sort((a, b) => {
  const aText = (a as { text?: string }).text ?? ''
  const bText = (b as { text?: string }).text ?? ''
  const aIndex = sectionOrder.indexOf(aText)
  const bIndex = sectionOrder.indexOf(bText)

  if (aIndex === -1 && bIndex === -1) return 0
  if (aIndex === -1) return 1
  if (bIndex === -1) return -1
  return aIndex - bIndex
})

const sidebar = Object.fromEntries(
  Object.entries(generatedSidebar).map(([key, items]) => [key, normalizeLinks(items)])
)

export default defineConfig({
  lang: 'zh-CN',
  title: 'Emberthrob的基地',
  titleTemplate: ':title | Emberthrob的基地',
  description: 'Emberthrob 的个人知识库：项目记录、工具收藏、操作教程与游戏攻略。',
  cleanUrls: true,
  lastUpdated: true,
  sitemap: {
    hostname: 'https://blog.bfreegpt.com'
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#f97316' }],
    ['meta', { name: 'format-detection', content: 'telephone=no' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Emberthrob的基地' }]
  ],
  markdown: {
    lineNumbers: true,
    image: {
      lazyLoading: true
    },
    container: {
      tipLabel: '提示',
      warningLabel: '注意',
      dangerLabel: '警告',
      infoLabel: '信息',
      detailsLabel: '展开查看'
    },
    /**
     * 给所有 Markdown 表格套一层可横向滚动的容器。
     * 手机上宽表格只滚动表格本身，不会把整页撑宽。
     */
    config(md) {
      const renderToken = (tokens: any, idx: number, options: any, env: any, self: any) =>
        self.renderToken(tokens, idx, options)

      md.renderer.rules.table_open = (tokens, idx, options, env, self) =>
        `<div class="table-wrapper">${renderToken(tokens, idx, options, env, self)}`

      md.renderer.rules.table_close = (tokens, idx, options, env, self) =>
        `${renderToken(tokens, idx, options, env, self)}</div>`
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Emberthrob的基地',
    nav,
    sidebar,
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Emberthrob/bolg' }
    ],
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    },
    editLink: {
      pattern: 'https://github.com/Emberthrob/bolg/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    footer: {
      message: '以 Markdown 记录，用 VitePress 发布。',
      copyright: 'Copyright © 2026 Emberthrob'
    },
    sidebarMenuLabel: '目录',
    returnToTopLabel: '回到顶部',
    skipToContentLabel: '跳到正文',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    langMenuLabel: '切换语言',
    externalLinkIcon: true,
    notFound: {
      title: '页面走丢了',
      quote: '这个地址没有对应的笔记，可能是链接写错了，或者内容还没同步过来。',
      linkLabel: '回到首页',
      linkText: '回到首页'
    },
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索笔记',
                buttonAriaLabel: '搜索笔记'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '清空搜索',
                backButtonTitle: '关闭搜索',
                noResultsText: '没有找到相关笔记',
                footer: {
                  selectText: '打开',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        },
        miniSearch: {
          options: {
            // 中文按词切分，并补上汉字单字和 bigram；英文和数字仍按词处理。
            tokenize: tokenizeForSearch,
            processTerm: (term: string) => term.toLowerCase()
          },
          searchOptions: {
            fuzzy: 0.2,
            prefix: true,
            combineWith: 'AND',
            boost: {
              title: 4,
              text: 2,
              headings: 3
            }
          }
        }
      }
    }
  }
})
