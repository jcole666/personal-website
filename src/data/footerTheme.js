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
    // Watercolor：页脚用比页面略深一档的纸色（#f0ebe3），同一族但压下去一层。
    // 对比度实测（底色 #f0ebe3）：ink 10.57 / muted 4.92 / accent 5.46，都过 AA。
    // ⚠️ accent 用了压深版 #3f5f8f —— 页面主色 #4a6fa5 在这个略深的纸色上只有 4.32，
    // 差一点点；主色留给页面（那里底更亮，4.84 是够的）。
    brand: '流前 · 读书笔记',
    tag: '好记性不如烂笔头',
    bg: '#f0ebe3',
    border: 'rgba(74, 111, 165, 0.2)',
    divider: 'rgba(74, 111, 165, 0.16)',
    ink: '#3a3430',
    muted: '#6b6459',
    faint: '#6b6459',
    accent: '#3f5f8f',
    font: "'Fraunces', 'Noto Serif SC', Georgia, serif",
    size: '1.4rem',
    spacing: '0.03em',
    uiFont: "'Fraunces', 'Noto Serif SC', Georgia, serif",
    max: '1060px',
  },
  '/music': {
    // Neo-Brutalist：纯黑底 + 白字 + 荧光绿强调。
    // 参考站的页脚骨架就是 bg-black text-white，这里照做。
    // 对比度（白 on 黑）21:1，荧光绿 #ccff00 on 黑 约 16:1，都远超 AA。
    brand: '流前 · 深夜听音室',
    tag: '让耳朵决定今晚的方向',
    bg: '#000000',
    border: '#ffffff',
    borderWidth: '4px',
    divider: 'rgba(255, 255, 255, 0.28)',
    ink: '#ffffff',
    muted: '#ffffff',
    faint: '#ffffff',
    accent: '#ccff00',
    font: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    size: '1.3rem',
    uiFont: "'Space Mono', 'Consolas', monospace",
    max: '1080px',
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
/** 同上：查表前去掉尾斜杠，避免 `/games/` 查不到 `/games` 的主题 */
function normalizePath(pathname) {
  const p = String(pathname ?? '/').split('?')[0].split('#')[0]
  return p.length > 1 ? p.replace(/\/+$/, '') : p
}

export function getFooterTheme(pathname) {
  return footerThemes[normalizePath(pathname)] ?? DEFAULT_FOOTER_THEME
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
