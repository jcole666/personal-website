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
    // 书籍页是 Watercolor Style：纸张色底 + 蓝灰墨 + 柔和细边。
    // 边框必须细（半透明 1px）—— 这个风格明令禁止硬边框和粗边框，
    // 上一版这里的 2px 棕边要收回。
    // logo 保留衬线 —— 水彩要求「衬线字体增加艺术感」。
    tag: 'READING NOTES',
    bg: 'rgba(250, 248, 245, 0.94)',
    border: 'rgba(74, 111, 165, 0.2)',
    ink: '#3a3430',
    // 蓝灰主色在纸色上 4.84，达标（弱化色 #8a8a8a 只有 3.25，所以用压深版）
    accent: '#4a6fa5',
    tagInk: '#6b6459',
    logoFont: "'Fraunces', 'Noto Serif SC', Georgia, serif",
    logoSize: '1.4rem',
    logoSpacing: '0.03em',
  },
  '/music': {
    // 音乐页是 Neo-Brutalist：白底 + 纯黑粗边 + 直角。
    // 原来导航是白底黑字，和纯白页面糊在一起、没有边界感 —— 改成实心黑条：
    // 白底页面上一条黑横杠，是这个风格最典型的强对比，也把导航和内容分开了。
    // 边框仍是纯黑加粗（风格明令「禁止灰色边框」），底色用实色不用半透明。
    tag: 'LISTENING ROOM',
    bg: '#000000',
    border: '#000000',
    borderWidth: '4px',
    ink: '#ffffff',
    // 亮粉：黑底上对比度 5.9:1，过 WCAG AA；比原来的 #ff006e 更亮更清楚
    accent: '#ff2d78',
    tagInk: '#ffffff',
    logoFont: "'Space Grotesk', 'Noto Sans SC', sans-serif",
    logoSize: '1.35rem',
    logoSpacing: '0.02em',
    blur: 'none',
  },
  '/movies': {
    // 电影页是 Cinematic Video Hero：暗场调色 + 唯一暖金强调。
    // 原来那套深蓝紫的色相被收敛掉了 —— 底色越接近纯黑，
    // 那支暖金越像从画面里透出来的光，而不是印上去的颜色。
    tag: 'SCREENING ROOM',
    bg: 'rgba(5, 6, 10, 0.92)',
    border: 'rgba(154, 166, 184, 0.14)',
    ink: '#F3EFE8',
    accent: '#E4C063',
    tagInk: '#9AA6B8',
    logoFont: "'Playfair Display', 'Noto Serif SC', serif",
    logoSpacing: '0.04em',
  },
  '/games': {
    // 游戏页是 Vaporwave 霓虹复古：深紫底 + 粉青双色霓虹。
    // logoGlow 用双色重影（粉 + 青）—— 这个风格明令「禁止仅用单色 glow」。
    // 字体换掉手写体：蒸汽波禁止「过于正式的字体」，Orbitron 这种科技无衬线才对味。
    tag: 'ADVENTURE LOG',
    bg: 'rgba(26, 5, 51, 0.92)',
    border: 'rgba(255, 113, 206, 0.4)',
    ink: '#e8c8f8',
    accent: '#01cdfe',
    tagInk: '#ff71ce',
    logoFont: "'Orbitron', 'Fira Code', sans-serif",
    logoSize: '1.3rem',
    logoSpacing: '0.08em',
    logoGlow: '0 0 10px rgba(255, 113, 206, 0.75), 0 0 22px rgba(1, 205, 254, 0.45)',
    menuShadow: '0 0 10px rgba(255, 113, 206, 0.35)',
    blur: 'blur(10px)',
  },
  '/food': {
    // 市集页是 Cottagecore 田园核：奶油亚麻底 + 大地棕 + 花粉边。
    // 这一页禁止直角和硬边框，所以边框色用花粉而不是深色发丝线。
    // ink 用压深版 #6b5540（6.50）—— 原色 #8b7355 在奶油底上只有 4.17
    tag: 'FOOD MARKET',
    bg: 'rgba(250, 246, 240, 0.94)',
    border: 'rgba(212, 160, 160, 0.45)',
    ink: '#6b5540',
    accent: '#3f6b3f',
    tagInk: '#7a6349',
    logoFont: "'Fraunces', 'Noto Serif SC', Georgia, serif",
    logoSize: '1.4rem',
    logoSpacing: '0.03em',
  },
}

/** 按路径取主题，取不到就走默认 */
/**
 * 把路径规整成主题表的 key。
 *
 * ⚠️ 必须做这一步：`public/games/`、`public/music/` 这些图片目录会让
 * express.static 把同名路由当成目录，于是 `/games` 被 301 成 `/games/`，
 * `location.pathname` 就带上了尾斜杠 → 查表失败 → 悄悄回退到默认主题
 * （深紫字压深底，几乎看不清）。/music、/movies、/food 都有同样的问题。
 * 所以查表前统一去掉尾斜杠和查询串。
 */
function normalizePath(pathname) {
  const p = String(pathname ?? '/').split('?')[0].split('#')[0]
  return p.length > 1 ? p.replace(/\/+$/, '') : p
}

export function getNavTheme(pathname) {
  return navThemes[normalizePath(pathname)] ?? DEFAULT_NAV_THEME
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
