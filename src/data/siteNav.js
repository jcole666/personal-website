/**
 * 站点板块清单 —— 导航栏和页脚共用同一份
 *
 * 以前这份清单硬编码在 Navbar.jsx 里。页脚再加一遍站内导航的话，
 * 就会变成"加一个板块要改两个地方"，所以抽到这里来。
 *
 * 加新板块时：在 sections.js 加首页卡片 + 在 navTheme.js / footerTheme.js 加主题 + 这里加一行。
 */
export const siteNav = [
  { to: '/projects', label: '代码开发' },
  { to: '/coursework', label: '课程学习' },
  { to: '/experience', label: '经历分享' },
  { to: '/reading', label: '书籍' },
  { to: '/music', label: '音乐' },
  { to: '/movies', label: '电影' },
  { to: '/games', label: '游戏' },
  { to: '/food', label: '市集' },
]
