/**
 * 页脚主题 —— 全站唯一一份（和 navTheme.js 一个思路）
 *
 * 改之前：9 个页脚各自手写一遍，结构完全相同、只有颜色和字体不同，
 * 加起来约 365 行 CSS，而且邮箱全站有 8 个是假的 me@example.com。
 *
 * 现在：结构骨架统一在 SiteFooter.css，这里只放每页"专属的那一点点"。
 *
 * 字段说明（除 brand / bg / ink / accent 外都可省略）
 *   brand      品牌文案，如「流前 · 露天影院」
 *   tag        副标签，一句短文案
 *   bg         页脚背景色（'transparent' 表示露出页面本身的底色）
 *   border     顶部边框色
 *   divider    品牌区与底部行之间那条细线的颜色
 *   ink        品牌主色
 *   tagInk     副标签颜色，省略则同 muted
 *   muted      链接与副文字色
 *   faint      版权小字色（省略则同 muted）
 *   accent     链接 hover 色
 *
 * 配色硬性要求：muted / faint / tagInk 与页脚底色的对比度必须 ≥ 4.5:1
 * （WCAG AA 小字号标准）。这些字都是 12~14px 的小字，达不到就是看不清。
 * 改色后请用 CDP 实测复验，别凭眼睛判断 —— 深色页面尤其容易误判。
 *   font       品牌字体
 *   size       品牌字号
 *   spacing    品牌字距
 *   uiFont     副标签/链接/版权的字体，省略则继承页面字体
 *   max        内容最大宽度（跟各页正文宽度保持一致，别让它比正文还宽）
 */

/**
 * 首页与后台用的默认主题
 *
 * 首页是深色玻璃主题（.app--home 会重定义 --purple-deep / --glass-* 等变量），
 * 所以这里一律用变量而不是硬编码颜色 —— 写死深紫的话，在首页的深色底上会看不见。
 */
export const DEFAULT_FOOTER_THEME = {
  brand: '流前',
  tag: '个人展览馆',
  bg: 'var(--glass-bg)',
  border: 'var(--glass-border)',
  divider: 'var(--glass-border)',
  ink: 'var(--purple-deep)',
  muted: 'var(--purple)',
  faint: 'var(--lilac)',
  accent: 'var(--gold)',
  font: 'var(--font-display)',
  size: '1.6rem',
  uiFont: 'var(--font-mono)',
  max: '920px',
}

export const footerThemes = {
  '/projects': {
    brand: '流前 · 坐标纸',
    tag: 'GRAPH PAPER · SINCE 2025',
    bg: 'transparent',
    border: 'rgba(180, 160, 140, 0.2)',
    divider: 'rgba(180, 160, 140, 0.15)',
    ink: '#1e2a35',
    muted: '#5b5249',
    faint: '#645a50',
    accent: '#87b846',
    font: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    size: '1.3rem',
    uiFont: "'Fira Code', 'Space Mono', monospace",
    max: '1000px',
  },
  '/coursework': {
    brand: '流前 · 夜之城',
    tag: 'NIGHT CITY · 学习日志',
    bg: 'transparent',
    border: 'rgba(255, 45, 149, 0.2)',
    divider: 'rgba(0, 240, 255, 0.12)',
    ink: '#e0dce0',
    muted: '#87808e',
    faint: '#7e7786',
    accent: '#00f0ff',
    font: "'Orbitron', 'Fira Code', sans-serif",
    size: '1.2rem',
    spacing: '0.06em',
    uiFont: "'Fira Code', 'Space Mono', monospace",
    max: '1080px',
  },
  '/experience': {
    brand: '流前',
    tag: '岛屿日志',
    bg: '#f8f8f0',
    border: 'rgba(25, 200, 185, 0.25)',
    divider: 'rgba(121, 79, 39, 0.12)',
    ink: '#794f27',
    muted: '#794f27',
    faint: '#794f27',
    accent: '#19c8b9',
    font: "Nunito, 'Microsoft YaHei', sans-serif",
    size: '1.5rem',
    max: '960px',
  },
  '/reading': {
    brand: '流前 · 读书笔记',
    tag: '好记性不如烂笔头',
    bg: '#faf7f2',
    border: 'rgba(180, 160, 140, 0.2)',
    divider: 'rgba(180, 160, 140, 0.15)',
    ink: '#5c4b32',
    muted: '#7a6240',
    faint: '#7a6240',
    accent: '#c8a24b',
    font: "'Long Cang', 'Noto Serif SC', cursive",
    size: '1.6rem',
    max: '960px',
  },
  '/music': {
    brand: '流前 · 深夜听音室',
    tag: '让耳朵决定今晚的方向',
    bg: '#1e1e24',
    border: 'rgba(107, 101, 96, 0.12)',
    divider: 'rgba(107, 101, 96, 0.1)',
    ink: '#d4d0c8',
    muted: '#948f8c',
    faint: '#8b8682',
    accent: '#d4a853',
    font: "'Playfair Display', 'Noto Serif SC', serif",
    size: '1.5rem',
    max: '1024px',
  },
  '/movies': {
    brand: '流前 · 露天影院',
    tag: '总有光，总会亮',
    bg: '#222540',
    border: 'rgba(140, 138, 160, 0.1)',
    divider: 'rgba(140, 138, 160, 0.08)',
    ink: '#ebe8dd',
    muted: '#9896aa',
    faint: '#8f8da2',
    accent: '#ffcf5c',
    font: "'Playfair Display', 'Noto Serif SC', serif",
    size: '1.5rem',
    spacing: '0.04em',
    max: '1080px',
  },
  '/games': {
    brand: '流前游戏',
    tag: 'PLAYTHROUGH LOG · SINCE 2023',
    // 这一页背景是照片。原来只有 0.18 的不透明度，合成出来的底色是中间调的绿色，
    // 任何文字颜色都到不了 4.5:1，所以提到 0.9（保留一点点照片透出来）
    bg: 'rgba(245, 240, 226, 0.9)',
    border: 'rgba(0, 0, 0, 0.06)',
    divider: 'rgba(0, 0, 0, 0.08)',
    ink: '#3d3022',
    muted: '#645c52',
    faint: '#665e54',
    accent: '#2a7ab0',
    font: "'ZCOOL KuaiLe', 'Ma Shan Zheng', cursive",
    size: '1.1rem',
    spacing: '0.04em',
    max: '1000px',
  },
  '/food': {
    brand: '流前',
    tag: '市集',
    bg: '#f5efe5',
    border: 'rgba(0, 0, 0, 0.05)',
    divider: 'rgba(0, 0, 0, 0.05)',
    ink: '#2d2418',
    muted: '#6f6252',
    faint: '#6f6252',
    accent: '#c47a5e',
    font: "'Playfair Display', 'Noto Serif SC', serif",
    size: '1.3rem',
    spacing: '0.03em',
    max: '960px',
  },
}

/** 按路径取页脚主题，取不到就走默认 */
export function getFooterTheme(pathname) {
  return footerThemes[pathname] ?? DEFAULT_FOOTER_THEME
}

/** 把主题配置翻译成一组 CSS 自定义属性，交给 SiteFooter.css 消费 */
export function footerThemeVars(theme) {
  return {
    '--ft-bg': theme.bg,
    '--ft-border': theme.border ?? 'transparent',
    '--ft-divider': theme.divider ?? 'transparent',
    '--ft-ink': theme.ink,
    '--ft-tag-ink': theme.tagInk ?? theme.muted,
    '--ft-muted': theme.muted,
    '--ft-faint': theme.faint ?? theme.muted,
    '--ft-accent': theme.accent,
    '--ft-font': theme.font ?? 'var(--font-display)',
    '--ft-size': theme.size ?? '1.5rem',
    '--ft-spacing': theme.spacing ?? 'normal',
    '--ft-ui-font': theme.uiFont ?? 'inherit',
    '--ft-max': theme.max ?? '1080px',
  }
}
