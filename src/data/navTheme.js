/**
 * 导航栏主题 —— 全站唯一一份
 *
 * 以前这套东西散在三个地方，改一处得动三处：
 *   1. Navbar.jsx 里 8 个 isXxxWorld 布尔判断
 *   2. Footer.jsx 里又原样抄了一遍同样的 8 个判断
 *   3. 8 个页面 CSS 里各有一段 .navbar-xxx（合计约 160 行，还得靠 !important 硬压）
 *
 * 现在收敛到下面这张表。加一个新板块，只需要在这里加一行。
 *
 * 分工：
 *   结构层（高度 / 内边距 / 菜单字号字重 / 项间距 / hover 时长 / active 下划线）
 *     全部统一写在 common.css，所有页面共用，这里不重复。
 *   这里只放每页"专属的那一点点"：底色、文字色、强调色、logo 字体。
 *
 * 关于 logoSize 为什么不统一：
 *   不同字体的视觉高度差很多 —— Orbitron 全大写显得大，Long Cang 是手写体显得小。
 *   强行统一字号反而会看起来不齐。所以这里统一的是"视觉高度"，字号按字体微调。
 */

/**
 * 首页与后台用的默认主题
 * 首页是深色玻璃主题（.app--home 会重定义 --purple-deep 等变量），
 * 所以底色用深色，文字色用变量而不是写死。
 */
export const DEFAULT_NAV_THEME = {
  tag: '首页',
  bg: 'rgba(36, 30, 55, 0.6)',
  border: 'rgba(255, 255, 255, 0.14)',
  ink: 'var(--purple-deep)',
  accent: 'var(--gold)',
  tagInk: 'var(--gold)',
  logoFont: 'var(--font-display)',
}

/**
 * 字段说明（除 tag / bg / border / ink / accent 外都可省略）
 *   tag         logo 右侧那行小标签文字
 *   bg          导航栏底色
 *   border      底边框颜色
 *   ink         常规文字色（logo 与菜单项）
 *   accent      强调色 —— 当前页文字 + 下划线 + hover，统一都用它
 *   tagInk      标签颜色，省略则同 accent
 *   logoFont    logo 字体，省略则用 --font-display
 *   logoSize    logo 字号，省略则 1.5rem
 *   logoSpacing logo 字距，省略则不额外设置（同样是按字体微调）
 *   logoWeight  logo 字重，省略则 600（Memphis 这类风格要 900）
 *   menuWeight  菜单项字重，省略则 500
 *   borderWidth 底边框宽度，省略则 1px（Memphis 禁止细边框，要 4px）
 *   logoGlow    logo 的 text-shadow，用于课程页的霓虹感
 *   menuShadow  菜单文字的 text-shadow，用于游戏页（半透明导航压在背景图上）
 *   blur        毛玻璃强度，省略则跟随全局 --glass-blur
 */
export const navThemes = {
  '/projects': {
    // 代码开发页是 Editorial 编辑杂志风：暖米纸底 + 纯单色墨 + 发丝线。
    // 所以导航栏也跟着换成同一套 —— 米纸底、墨色文字、强调色就是墨色本身，
    // 并关掉毛玻璃（那个风格明确禁止玻璃态）。
    tag: 'WORKSHOP',
    bg: 'rgba(249, 248, 246, 0.92)',
    border: 'rgba(28, 28, 28, 0.1)',
    ink: '#1c1c1c',
    accent: '#1c1c1c',
    tagInk: 'rgba(28, 28, 28, 0.65)',
    // 衬线 logo —— 该风格要求标题一律衬线
    logoFont: 'var(--font-display)',
    logoSize: '1.35rem',
    logoSpacing: '-0.01em',
    blur: 'none',
  },
  '/coursework': {
    // 课程学习页是 Memphis 孟菲斯风格：暖米底 + 纯黑粗边 + 高饱和撞色。
    // 那个风格明令禁止细边框，所以 borderWidth 拉到 4px；字体也要极粗（900）。
    tag: 'COURSEWORK',
    bg: '#fef9ef',
    border: '#000000',
    borderWidth: '4px',
    ink: '#000000',
    accent: '#ff6b6b',
    tagInk: '#000000',
    logoFont: "'Noto Sans SC', 'Microsoft YaHei', sans-serif",
    logoSize: '1.35rem',
    logoSpacing: '-0.01em',
    logoWeight: '900',
    menuWeight: '900',
    blur: 'none',
  },
  '/experience': {
    tag: 'ISLAND JOURNAL',
    bg: 'rgba(248, 248, 240, 0.88)',
    border: 'rgba(25, 200, 185, 0.35)',
    ink: '#794f27',
    accent: '#19c8b9',
    tagInk: '#19c8b9',
    logoFont: "Nunito, 'Noto Sans SC', sans-serif",
  },
  '/reading': {
    tag: 'READING NOTES',
    bg: 'rgba(250, 247, 242, 0.88)',
    border: 'rgba(180, 160, 140, 0.25)',
    ink: '#5c4b32',
    accent: '#c8a24b',
    tagInk: '#b0a090',
    logoFont: "'Long Cang', 'Noto Serif SC', cursive",
    logoSize: '1.7rem',
  },
  '/music': {
    tag: 'LISTENING ROOM',
    bg: 'rgba(30, 30, 36, 0.9)',
    border: 'rgba(107, 101, 96, 0.15)',
    ink: '#d4d0c8',
    accent: '#d4a853',
    tagInk: '#6b6560',
    logoFont: "'Playfair Display', 'Noto Serif SC', serif",
    logoSpacing: '0.04em',
  },
  '/movies': {
    tag: 'SCREENING ROOM',
    bg: 'rgba(34, 37, 64, 0.92)',
    border: 'rgba(140, 138, 160, 0.12)',
    ink: '#ebe8dd',
    accent: '#ffcf5c',
    tagInk: '#8c8aa0',
    logoFont: "'Playfair Display', 'Noto Serif SC', serif",
    logoSpacing: '0.04em',
  },
  '/games': {
    tag: 'ADVENTURE LOG',
    bg: 'rgba(230, 200, 150, 0.15)',
    border: 'rgba(74, 168, 224, 0.12)',
    ink: '#3d3022',
    accent: '#4aa8e0',
    tagInk: '#4aa8e0',
    logoFont: "'ZCOOL KuaiLe', 'Ma Shan Zheng', cursive",
    logoSize: '1.4rem',
    logoSpacing: '0.04em',
    logoGlow: '0 1px 6px rgba(255, 240, 200, 0.9)',
    menuShadow: '0 1px 6px rgba(255, 240, 200, 0.9)',
    blur: 'blur(4px)',
  },
  '/food': {
    tag: 'FOOD MARKET',
    bg: 'rgba(250, 246, 240, 0.94)',
    border: 'rgba(0, 0, 0, 0.05)',
    ink: '#2d2418',
    accent: '#c47a5e',
    tagInk: '#8c7b68',
    logoFont: "'Playfair Display', 'Noto Serif SC', serif",
    logoSize: '1.4rem',
    logoSpacing: '0.03em',
  },
}

/** 按路径取主题，取不到就走默认 */
export function getNavTheme(pathname) {
  return navThemes[pathname] ?? DEFAULT_NAV_THEME
}

/** 把主题配置翻译成一组 CSS 自定义属性，交给 common.css 消费 */
export function navThemeVars(theme) {
  return {
    '--nav-bg': theme.bg,
    '--nav-border': theme.border,
    '--nav-ink': theme.ink,
    '--nav-accent': theme.accent,
    '--nav-tag-ink': theme.tagInk ?? theme.accent,
    '--nav-logo-font': theme.logoFont ?? 'var(--font-display)',
    '--nav-logo-size': theme.logoSize ?? '1.5rem',
    '--nav-logo-spacing': theme.logoSpacing ?? 'normal',
    '--nav-logo-weight': theme.logoWeight ?? '600',
    '--nav-menu-weight': theme.menuWeight ?? '500',
    '--nav-border-width': theme.borderWidth ?? '1px',
    '--nav-logo-glow': theme.logoGlow ?? 'none',
    '--nav-menu-shadow': theme.menuShadow ?? 'none',
    '--nav-blur': theme.blur ?? 'var(--glass-blur)',
  }
}
