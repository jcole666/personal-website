/**
 * 代码开发 · 坐标纸上的疯狂公式
 */

const projectData = {
  /* ===== 正在开发 ===== */
  active: {
    id: 'active-1',
    status: 'active',
    title: '个人网站',
    techStack: ['React', 'Vite', 'React Router', 'Rough.js'],
    description: '多板块个人站点，每个板块像城市的不同街区。',
    detail:
      '从零搭建的个人网站，包含首页、代码开发、课程作业、经历分享、读书、音乐、电影、市集八个板块。\n\n每个板块有独立的视觉风格——不是换个颜色那么简单，而是用完全不同的材质和隐喻：音乐页是黑胶唱片和留声机，电影页是露天影院和胶片轮播，市集是木纹台面和摊位卡片。\n\n最大的收获是"设计系统"的意识：不是写更多 CSS，而是定义一套规则让所有页面在一套语言下各自表达。',
    highlights: [
      '组件化拆分：每个板块独立的页面组件和样式文件，用 React Router 做路由',
      '转场动画：用 React Context 编排黑幕收拢、小岛停留、圆圈扩散三个阶段，中途偷偷换页',
      '用 Rough.js 做手绘线条装饰，比 Canvas 直接画简单',
    ],
    progress: 70,
    startedAt: '2026-07',
    repoUrl: 'https://github.com/jcole666',
  },

  /* ===== 已完成 ===== */
  done: [
    {
      id: 'done-1',
      status: 'done',
      title: '数据结构课设——小型数据库',
      techStack: ['C++', 'B+树', 'SQL 解析'],
      description: '手写一个小型关系数据库，支持基本 SQL 查询和索引。',
      detail:
        '大二下数据结构的课程设计。核心是实现 B+ 树索引、SQL 语句的词法分析和语法解析、以及一个简单的缓冲池管理。\n\n最难的其实不是 B+ 树算法本身——课本上伪代码写得挺清楚了——而是处理各种边界情况：节点分裂后父节点满了怎么办、删除导致树高降低怎么递归处理、并发读写时锁的粒度怎么选。\n\n写了大概 2000 行 C++，跑通了老师给的 50 个测试用例。最大的收获是理解了"数据结构不是孤立的算法题，是为上层提供服务的底层引擎"。',
      highlights: [
        'B+ 树索引：支持范围查询和等值查询，节点分裂和合并',
        'SQL 解析：手写词法分析和递归下降语法分析器',
        '缓冲池：LRU 淘汰策略，页面固定和脏页写回',
      ],
      date: '2026-06',
      repoUrl: '',
      starred: true,
    },
    {
      id: 'done-2',
      status: 'done',
      title: '命令行 TODO 工具',
      techStack: ['Python', 'SQLite', 'CLI'],
      description: '一个简单的命令行待办事项管理工具，支持项目分组和优先级排序。',
      detail:
        '大一寒假写的小项目。当时觉得市面上的 TODO 工具都太重了，想要一个"敲两个字母就能记一条"的东西。用 Python 的 argparse 做命令行解析，SQLite 存数据，支持增删查改、按项目和优先级筛选、以及简单的"今日总结"输出。\n\n虽然功能很少，但这是第一个我自己"不是交作业，而是真的想用"所以写的项目。从需求分析到写完刚好一周，那种"我创造了一个对自己有用的东西"的感觉，是编程最难替代的快乐。',
      highlights: [
        'argparse 实现 CLI 子命令',
        'SQLite 持久化，多项目分组',
        '优先级排序和"今日总结"视图',
      ],
      date: '2026-01',
      repoUrl: '',
      starred: false,
    },
    {
      id: 'done-3',
      status: 'done',
      title: '贪吃蛇 AI——强化学习实验',
      techStack: ['Python', 'PyTorch', 'DQN'],
      description: '用 DQN 训练一个玩贪吃蛇的 AI，从零理解强化学习的基本概念。',
      detail:
        '寒假花了两周看的强化学习入门课之后做的实验。从最简单的 Q-learning 到 DQN，一步步把蛇训练到能活到 100+ 格。\n\n最好玩的是观察训练过程中的行为变化——前 50 局蛇只会乱撞，100 局左右开始知道不能撞自己了，200 局后明显在追着食物走。',
      highlights: [
        '从 Q-table 到 DQN 的渐进式实现',
        '用 PyGame 做可视化训练过程',
        '写了 3 篇博客记录训练观察',
      ],
      date: '2025-10',
      repoUrl: '',
      starred: true,
    },
    {
      id: 'done-4',
      status: 'done',
      title: '寝室自动化工具集',
      techStack: ['Python', '爬虫', '自动化'],
      description: '选课监控脚本 + 课表自动解析 → Google Calendar + 图书馆座位提醒。',
      detail:
        '起因是大二选课被抢课速度震惊了，决定自己写个选课监控脚本。后来陆续加了课表自动解析、图书馆预约提醒。\n\n技术上没什么高深的——requests + BeautifulSoup + smtplib，但因为是自己要用所以写得很认真。',
      highlights: [
        '选课监控：定时刷新教务页面，有余位立即发邮件',
        '课表解析：Excel 转 iCal 格式，支持周次和节次映射',
        '图书馆座位：爬虫抓取 + 邮件通知',
      ],
      date: '2026-03',
      repoUrl: '',
      starred: false,
    },
  ],

  /* ===== 废弃/搁置 ===== */
  abandoned: [
    {
      id: 'ab-1',
      status: 'abandoned',
      title: 'Markdown 编辑器',
      techStack: ['Svelte', 'marked', 'highlight.js'],
      description: '搭了一半，发现 React 和 Vite 更适合当前阶段。',
      date: '2026-03',
    },
  ],

  /* ===== 踩坑批注 ===== */
  annotations: [
    {
      id: 'ann-1',
      text: '这里重写了两遍，第一次没搞懂闭包的作用域',
      near: 'done-2',
    },
    {
      id: 'ann-2',
      text: 'B+树分裂逻辑是一边画图一边写的',
      near: 'done-1',
    },
  ],

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
