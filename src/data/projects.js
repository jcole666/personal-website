/**
 * 代码开发 · 坐标纸上的疯狂公式
 *
 * ⚠️ 2026-10-07 重写：只保留 GitHub 上真实存在的仓库。
 * 之前这一页有 5 个项目是编的（数据结构课设、命令行 TODO 工具、
 * 贪吃蛇 AI、寝室自动化工具集、Markdown 编辑器）—— 全部删掉了。
 *
 * 现在的 4 个全部来自 github.com/jcole666，描述取自各自的 README。
 *
 * 排除的仓库及原因（用户定的标准：只放自己的作品，课程作业和练习都不上）：
 *   checker / AI_PJ2              fork 自别人，不算自己的作品
 *   learngit / muyifan...         纯练习，无描述无 README
 *   Street_Character_Recognition  随堂练习
 *   DQN-Atari_Games               课程 PJ3 作业
 *   UC-Berkeley-CS-188            课程 Project 作业
 *   AI-In-class-Practice          随堂练习
 *
 * 加新项目前先确认仓库真实存在，别编。
 */

const projectData = {
  /* ===== 正在开发 ===== */
  active: {
    id: 'active-1',
    status: 'active',
    title: '穿啥 · 智能衣橱管理 App',
    techStack: ['Flutter', 'Riverpod', 'Supabase', 'go_router'],
    description: '拍下你的衣服自动抠图归类，根据天气帮你决定今天穿什么。',
    detail:
      '一款智能衣橱管理 App。拍下衣服 → 自动抠图去背景 → 打上分类、颜色、季节、场合、风格多维标签，之后按实时天气从衣橱里推荐穿搭组合。\n\n抠图做了两套方案：纯色背景走智能抠图（算法自动识别），复杂背景走手动抠图（手指描边 + 边缘吸附）。这个取舍是被真实使用逼出来的——纯算法在复杂背景上效果不稳定，与其硬调参数不如给用户一个可控的兜底。\n\n后端用 Supabase（Auth + PostgREST + Storage），所以不依赖 Google 服务，Android / iOS 双端都能跑。断网时会回退到本地缓存并明确提示，不会白屏。',
    highlights: [
      '双方案抠图：智能识别 + 手动描边（带边缘吸附），覆盖纯色和复杂背景',
      '天气驱动推荐：按温度/降水从衣橱里挑搭配，可 👍/👎 反馈',
      '穿搭日历：记录每天穿了什么，自动累计穿着次数、算性价比',
      'Riverpod 状态管理 + go_router 登录态守卫，深色模式完整适配',
    ],
    startedAt: '2026-10',
    repoUrl: 'https://github.com/jcole666/chuansha',
  },

  /* ===== 已完成 ===== */
  done: [
    {
      id: 'done-1',
      // 这个其实还在改，所以状态是 active —— 但页面顶部只放得下一个「正在开发」，
      // 留给穿啥了。组件是按每个项目自己的 status 渲染的，所以显示没问题。
      status: 'active',
      title: '个人网站',
      techStack: ['React 19', 'Vite', 'React Router 7', 'Express'],
      description: '多板块个人站点，每个板块像城市的不同街区。',
      detail:
        '你现在看的这个站点。八个板块各有各的视觉风格——不是换个颜色，而是用完全不同的材质和隐喻：音乐页是黑胶唱片和留声机，电影页是露天影院和胶片轮播，市集是木纹台面和摊位卡片。\n\n最大的收获是"设计系统"的意识：不是写更多 CSS，而是定义一套规则，让所有页面在同一套语言下各自表达。导航栏和页脚都收敛到一份配置表，加新板块只要加一行。\n\n后端是 Express + JSON 文件存储，够用且没有部署负担。',
      highlights: [
        '九个板块独立的页面组件和样式文件，用 React Router 做路由',
        '转场动画：黑幕收拢 → 小岛停留 → 圆圈扩散，中途偷偷换页',
        '导航主题 / 页脚主题各只有一份配置表，加板块不用碰公共层',
      ],
      date: '2026-07',
      repoUrl: 'https://github.com/jcole666/personal-website',
    },
    {
      id: 'done-2',
      status: 'done',
      title: '小计 · 计量建模工作台',
      techStack: ['TypeScript', '本地服务', '计量经济'],
      description: '本地运行的计量建模桌面工具，双击即用，不用开网页也不碰命令行。',
      detail:
        '做计量作业时最烦的是"环境"——想跑个回归得先配 Python 环境、装一堆包、写脚本。这个工具把这些都包起来，做成一个本地桌面应用：双击 exe 就能用，第一次启动自动拉起本地分析服务。\n\n打包成了 portable 版本发布到 GitHub Releases，所以换电脑不用重装。当前版本还没做代码签名，Windows 会弹安全提示——README 里写了怎么绕过。',
      highlights: [
        '打包成 portable exe 发布，换机器不用重装环境',
        '首次启动自动拉起本地分析服务，用户不需要碰命令行',
        '按版本号管理 Release，旧版仍可下载回退',
      ],
      date: '2026-07',
      repoUrl: 'https://github.com/jcole666/econometrics-agent-mvp',
    },
    {
      id: 'done-3',
      status: 'done',
      title: '协作式任务管理系统',
      techStack: ['Vue 3', 'Spring Boot 3', 'MySQL', 'JWT'],
      description: '面向个人与团队的轻量级任务协同平台，前后端分离。',
      detail:
        '一个前后端分离的任务管理 Web 应用：用户注册登录、个人任务的增删改查。\n\n前端 Vue 3 + Vue Router + Pinia + Axios，后端 Spring Boot 3 + Spring Security + JWT + Spring Data JPA，数据库 MySQL 8.0。用 JWT 而不是 Session，是为了让前后端彻底解耦、部署时不用考虑会话共享。\n\n项目按 frontend / backend / sql 三个目录分开，数据库初始化脚本单独放，别人 clone 下来照 README 就能跑起来。',
      highlights: [
        '前后端分离：Vue 3 + Pinia 前端 / Spring Boot 3 后端',
        'JWT 做无状态鉴权，前后端彻底解耦',
        '数据库初始化脚本独立，clone 下来照 README 即可运行',
      ],
      date: '2026-03',
      repoUrl: 'https://github.com/jcole666/task-management-system',
    },
  ],

  /* ===== 废弃/搁置 ===== */
  /* 暂时是空的 —— 之前那个「Markdown 编辑器」是编的，已删。
     但这个字段必须留着：组件里会 spread 它，undefined 会让整页白屏。 */
  abandoned: [],

  /* ===== 灵感便签 ===== */
  ideas: [
    { id: 'idea-1', text: '做个桌面小助手\n管理每日待办', color: 'green' },
    { id: 'idea-2', text: '用 Rust 重写\n文件整理脚本', color: 'blue' },
    { id: 'idea-3', text: '整一个终端版\n音乐播放器', color: 'pink' },
  ],

  /* ===== 装备清单 ===== */
  gear: [
    { label: '编辑器', value: 'Cursor' },
    { label: '终端', value: 'Windows Terminal' },
    { label: '字体', value: 'Fira Code' },
    { label: '字体', value: 'Ma Shan Zheng' },
    { label: '键盘', value: 'Keychron K3' },
  ],
}

export default projectData
