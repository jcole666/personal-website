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
 *   weight     品牌字重，省略则 600（Memphis 这类风格要 900）
 *   borderWidth 顶边框宽度，省略则 1px（Memphis 禁止细边框，要 4px）
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
    // 配合代码开发页的 Editorial 风格：暖米纸底 + 纯单色墨 + 发丝线。
    // 品牌名从「坐标纸」改成「工作台」—— 那一版没有坐标纸了，
    // tag 也换成和导航栏一致的 WORKSHOP。
    brand: '流前 · 工作台',
    tag: 'WORKSHOP · SINCE 2025',
    bg: '#f9f8f6',
    border: 'rgba(28, 28, 28, 0.1)',
    divider: 'rgba(28, 28, 28, 0.1)',
    ink: '#1c1c1c',
    muted: 'rgba(28, 28, 28, 0.65)',
    faint: 'rgba(28, 28, 28, 0.65)',
    accent: '#1c1c1c',
    font: 'var(--font-display)',
    size: '1.35rem',
    spacing: '-0.01em',
    // 1104 = 页面内容宽（1200）减掉页面左右内边距（48×2），让页脚和正文左右对齐
    max: '1104px',
  },
  '/coursework': {
    // 配合 Memphis 风格：整块纯黑底 + 白字 + 4px 黑边
    //（参考文件里的页脚骨架就是 bg-black text-white）
    brand: '流前 · 课堂',
    tag: 'COURSEWORK · SINCE 2024',
    bg: '#000000',
    border: '#000000',
    borderWidth: '4px',
    divider: 'rgba(255, 255, 255, 0.25)',
    ink: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.75)',
    faint: 'rgba(255, 255, 255, 0.62)',
    accent: '#feca57',
    font: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    size: '1.35rem',
    spacing: '-0.01em',
    weight: '900',
    max: '1104px',
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
    // Retro Vintage：页脚用比页面略深的羊皮纸，视觉上「压在下面」。
    // 对比度实测（底色 #e8d5c0）：ink 7.95 / muted 6.08 / faint 4.96，都过 AA。
    // 注意 muted 比 faint 深 —— 这个底色上棕色系的可用范围很窄，
    // 再浅一档（#a0632a）就只有 3.4 了，所以「次要」和「更次要」只能靠这两档分。
    brand: '流前 · 读书笔记',
    tag: '好记性不如烂笔头',
    bg: '#e8d5c0',
    border: '#8b4513',
    borderWidth: '2px',
    divider: 'rgba(139, 69, 19, 0.3)',
    ink: '#5c2e0a',
    muted: '#7a4a1e',
    faint: '#8b4513',
    accent: '#8b2c2c',
    font: "'Playfair Display', 'Noto Serif SC', serif",
    size: '1.5rem',
    spacing: '0.06em',
    uiFont: "'Playfair Display', 'Noto Serif SC', serif",
    max: '1080px',
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
    // 同上一套。页脚用抬升面 #141821，比页面的近黑底亮一档 ——
    // 形成「舞台后区 / 前区」的层次，又不破坏单一暖金调色。
    // 对比度实测（底色 #141821）：ink 15.50 / muted 7.21 / accent 10.17
    brand: '流前 · 露天影院',
    tag: '总有光，总会亮',
    bg: '#141821',
    border: 'rgba(154, 166, 184, 0.14)',
    divider: 'rgba(154, 166, 184, 0.1)',
    ink: '#F3EFE8',
    muted: '#9AA6B8',
    faint: '#9AA6B8',
    accent: '#E4C063',
    font: "'Playfair Display', 'Noto Serif SC', serif",
    size: '1.5rem',
    spacing: '0.04em',
    max: '1080px',
  },
  '/games': {
    // Vaporwave：深紫底 + 霓虹文字。原来这里是半透明奶油底压在照片上，
    // 照片去掉了，改成与页面同调的实色深紫。
    // 对比度实测（底色 #1a0533）：ink 12.6 / muted 9.2 / faint 5.8，都很宽裕 ——
    // 深底上的浅色天然好过浅底上的深色。
    brand: '流前游戏',
    tag: 'PLAYTHROUGH LOG · SINCE 2023',
    bg: '#1a0533',
    border: 'rgba(255, 113, 206, 0.35)',
    divider: 'rgba(185, 103, 255, 0.3)',
    ink: '#e8c8f8',
    muted: '#c9a8e8',
    faint: '#b967ff',
    accent: '#01cdfe',
    font: "'Orbitron', 'Fira Code', sans-serif",
    size: '1.25rem',
    spacing: '0.08em',
    uiFont: "'Fira Code', 'Space Mono', monospace",
    max: '1100px',
  },
  '/food': {
    // Cottagecore：亚麻色底 + 大地棕文字 + 花粉分隔线。
    // 对比度实测（底色 #f5f0e8）：ink 6.17 / muted 5.00 / faint 5.00 / accent 5.46
    brand: '流前',
    tag: '市集',
    bg: '#f5f0e8',
    border: 'rgba(212, 160, 160, 0.45)',
    divider: 'rgba(212, 160, 160, 0.3)',
    ink: '#6b5540',
    muted: '#7a6349',
    faint: '#7a6349',
    accent: '#3f6b3f',
    font: "'Fraunces', 'Noto Serif SC', Georgia, serif",
    size: '1.3rem',
    spacing: '0.03em',
    max: '1040px',
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
    '--ft-weight': theme.weight ?? '600',
    '--ft-border-width': theme.borderWidth ?? '1px',
    '--ft-ui-font': theme.uiFont ?? 'inherit',
    '--ft-max': theme.max ?? '1080px',
  }
}
