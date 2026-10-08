/**
 * 电影页数据 — 露天影院
 */

const movieData = {
/* ===== 场记板精选 → 改名为 featured 但数据结构一致 ===== */
  featured: {
    id: 'feat-2',
    title: '你的名字。',
    director: '新海诚',
    year: 2016,
    posterUrl: '/movies/feat-your-name.jpg',
    posterColor: '#e07a5f',
    posterLabel: '你的',
    tags: ['动画', '奇幻', '日本'],
    rating: 5,
    watchedDate: '2026-08-01',
    reflection:
      '每一次看都有不同的理解。这不是一个关于穿越时空的爱情故事，而是一个关于"寻找"的故事——寻找那个你明明不认识、但潜意识里一直在找的人。\n\n新海诚说这部电影的灵感来自一首和歌："梦里相逢人不见，若知是梦何须醒"。黄昏时分两人同时在火山口喊出"君の名は"的时候，不需要任何台词来解释为什么——你已经相信了。',
    quote: '黄昏之时，能看到非人之物。',
  },

  /* ===== 已看电影（胶片传送带）===== */
  watched: [
    {
      id: 'w-1',
      title: '重庆森林',
      director: '王家卫',
      year: 1994,
      posterUrl: '/movies/w-chungking-express.jpg',
      tags: ['文艺', '爱情', '香港'],
      rating: 5,
      watchedDate: '2026-07-15',
      reflection:
        '过期的凤梨罐头、663 的毛巾、阿菲偷偷潜入公寓留下的水渍——王家卫的物件比角色更能说话。《重庆森林》不是在看故事，是在听一个城市凌晨四点的呼吸。金城武跑步把身体里的水分蒸发掉那一段，我这辈子都忘不了。',
      quote: '如果记忆是一个罐头的话，我希望这一个罐头不会过期。',
    },
    {
      id: 'w-2',
      title: '寄生虫',
      director: '奉俊昊',
      year: 2019,
      posterUrl: '/movies/w-parasite.jpg',
      tags: ['剧情', '悬疑', '韩国'],
      rating: 5,
      watchedDate: '2026-07-08',
      reflection:
        '地下室那段戏简直是完美的类型片教科书。奉俊昊用一个家庭入侵另一个家庭的故事，把阶级问题讲得比一百篇论文都清楚。穷人不是坏人，富人也不是——但系统是。那场暴雨把所有假装平等的表象冲得一干二净。',
      quote: '你知道什么计划绝不会失败吗？没有计划。',
    },
    {
      id: 'w-3',
      title: '花束般的恋爱',
      director: '土井裕泰',
      year: 2021,
      posterUrl: '/movies/w-hanabun-no-koi.jpg',
      tags: ['爱情', '日本'],
      rating: 4.5,
      watchedDate: '2026-06-28',
      reflection:
        '太真实了以至于有点痛。两个人从"世界上竟然有一个和我一样的人"相遇，到"我好像不认识你了"分开——不是因为谁做错了什么，就是生活本身会让那些细小的裂缝慢慢变大。坂元裕二把这种微妙的断裂写得像一首注定要结束的诗。',
      quote: '开始是结束的开始。相遇总是伴随着离别。',
    },
    {
      id: 'w-4',
      title: '盗梦空间',
      director: '克里斯托弗·诺兰',
      year: 2010,
      posterUrl: '/movies/w-inception.jpg',
      tags: ['科幻', '悬疑', '英语'],
      rating: 4.5,
      watchedDate: '2026-06-15',
      reflection:
        '看了三遍才大概理清所有层级。但我后来发现理清不是最重要的——诺兰真正想说的是："你确定你现在是醒着的吗？"最后那条旋转的陀螺到底是停了还是没停，这个问题本身比答案有意义。',
      quote: 'You mustn\'t be afraid to dream a little bigger, darling.',
    },
    {
      id: 'w-5',
      title: '肖申克的救赎',
      director: '弗兰克·德拉邦特',
      year: 1994,
      posterUrl: '/movies/w-shawshank.jpg',
      tags: ['剧情', '经典', '英语'],
      rating: 5,
      watchedDate: '2026-05-30',
      reflection:
        '教科书式的剧本结构，没有一点浪费。Andy 爬过下水道冲向雷雨的那一刻，是电影史上最伟大的"释放"瞬间。它说的是监狱，但每个被什么东西困住的人都能在里面找到自己的出口。',
      quote: 'Get busy living, or get busy dying.',
    },
    {
      id: 'w-6',
      title: '千与千寻',
      director: '宫崎骏',
      year: 2001,
      posterUrl: '/movies/w-spirited-away.jpg',
      tags: ['动画', '奇幻', '日本'],
      rating: 5,
      watchedDate: '2026-05-22',
      reflection:
        '小时候觉得是冒险，长大了发现是寓言。汤屋是一个浓缩的成人世界——你把名字交出去，就忘掉了自己是谁。宫崎骏提醒你：别忘记自己的名字，那是你唯一的武器。每次重看都能发现新的隐喻。',
      quote: '名字一旦被夺走，就再也找不到回家的路了。',
    },
    {
      id: 'w-7',
      title: '教父',
      director: '弗朗西斯·科波拉',
      year: 1972,
      posterUrl: '/movies/w-godfather.jpg',
      tags: ['剧情', '经典', '英语'],
      rating: 5,
      watchedDate: '2026-05-10',
      reflection:
        '大学选修的"电影与社会"课上看完的。以前觉得"经典"就意味着"无聊"，但《教父》完全打破了这种偏见。一个家族从"保护家人"出发，慢慢变成了自己最初反对的东西。Michael 在教堂洗礼的场景和谋杀蒙太奇交错的剪辑，至今是电影史最伟大的平行蒙太奇。',
      quote: "I'm gonna make him an offer he can't refuse.",
    },
    {
      id: 'w-8',
      title: '阳光普照',
      director: '钟孟宏',
      year: 2019,
      posterUrl: '/movies/w-a-sun.jpg',
      tags: ['剧情', '家庭', '台湾'],
      rating: 4.5,
      watchedDate: '2026-04-28',
      reflection:
        '台湾家庭题材拍得最好的电影之一。大儿子和小儿子的命运对比让你思考：光不一定是好的——被阳光普照太久，也是一种残酷。片尾阿和在桥上骑单车那一段，配上山路和风，是整部电影唯一的"松一口气"。',
      quote: '这个世界，最公平的是太阳。',
    },
    {
      id: 'w-9',
      title: '蜘蛛侠：纵横宇宙',
      director: 'Joaquim Dos Santos 等',
      year: 2023,
      posterUrl: '/movies/w-spiderverse.jpg',
      tags: ['动画', '科幻', '英语'],
      rating: 4.5,
      watchedDate: '2026-04-15',
      reflection:
        '每一帧都可以截下来当壁纸。不止是视觉炫技——故事本身也在和"命运"这个概念较劲。Miles 选择不遵守任何一个蜘蛛侠该遵守的规则——"被选中的不是你，是你自己选择了成为谁"。',
      quote: "Everyone keeps telling me how my story is supposed to go. Nah, I'm gonna do my own thing.",
    },
    {
      id: 'w-10',
      title: '让子弹飞',
      director: '姜文',
      year: 2010,
      posterUrl: '/movies/w-let-bullets-fly.jpg',
      tags: ['喜剧', '剧情', '华语'],
      rating: 5,
      watchedDate: '2026-04-01',
      reflection:
        '台词密度高到窒息，看一遍只能接住 40% 的子弹。姜文用黑色喜剧包裹了太多东西——公平、权力、革命、人性。每一次回头重看你都能在台词和镜头里找到新的密码。"站着把钱挣了"这话现在听着依然响。',
      quote: '让子弹飞一会儿。',
    },
    {
      id: 'w-11',
      title: '布达佩斯大饭店',
      director: '韦斯·安德森',
      year: 2014,
      posterUrl: '/movies/w-grand-budapest.jpg',
      tags: ['喜剧', '文艺', '英语'],
      rating: 4,
      watchedDate: '2026-03-20',
      reflection:
        '对称构图到令人舒适。安德森把一部关于两次世界大战的电影拍成了粉色蛋糕盒——外壳越精致，内核越悲凉。Gustave 那句"文明在消亡之前总会先变得优雅"是整部电影的墓志铭。',
      quote: 'You see, there are still faint glimmers of civilization left in this barbaric slaughterhouse that was once known as humanity.',
    },
    {
      id: 'w-12',
      title: '海街日记',
      director: '是枝裕和',
      year: 2015,
      posterUrl: '/movies/w-umimachi-diary.jpg',
      tags: ['剧情', '家庭', '日本'],
      rating: 4.5,
      watchedDate: '2026-03-05',
      reflection:
        '是枝裕和把"平淡"做到了极致。四姐妹住在同一个屋檐下，吃饭、上班、做梅酒、放烟火——没有吵架、没有狗血，只有时间穿过她们。看完了才意识到：这是一部关于"失去"的电影，但每一个画面都在说"活着真好"。',
      quote: '活着的东西都是很费功夫的。',
    },
  ],

  /* ===== 放映排期（待看清单）===== */
  watchlist: [
    { id: 'wl-1', title: '一一', director: '杨德昌', year: 2000 },
    { id: 'wl-2', title: '燃烧女子的肖像', director: '瑟琳·席安玛', year: 2019 },
    { id: 'wl-3', title: '燃烧', director: '李沧东', year: 2018 },
    { id: 'wl-4', title: '驾驶我的车', director: '滨口龙介', year: 2021 },
    { id: 'wl-5', title: '社交网络', director: '大卫·芬奇', year: 2010 },
    { id: 'wl-6', title: '无间道', director: '刘伟强 / 麦兆辉', year: 2002 },
    { id: 'wl-7', title: '情书', director: '岩井俊二', year: 1995 },
  ],

  /* ===== 轮播 Banner（精选电影，胶片滚动）===== */
  bannerMovies: [
    {
      id: 'b-1', title: '重庆森林', director: '王家卫', year: 1994,
      posterUrl: '/movies/b-chungking-express.jpg', tags: ['文艺', '爱情', '香港'], rating: 5,
      quote: '如果记忆是一个罐头的话，我希望这一个罐头不会过期。',
    },
    {
      id: 'b-2', title: '寄生虫', director: '奉俊昊', year: 2019,
      posterUrl: '/movies/b-parasite.jpg', tags: ['剧情', '悬疑', '韩国'], rating: 5,
      quote: '你知道什么计划绝不会失败吗？没有计划。',
    },
    {
      id: 'b-3', title: '花束般的恋爱', director: '土井裕泰', year: 2021,
      posterUrl: '/movies/b-hanabun-no-koi.jpg', tags: ['爱情', '日本'], rating: 4.5,
      quote: '开始是结束的开始。相遇总是伴随着离别。',
    },
    {
      id: 'b-4', title: '千与千寻', director: '宫崎骏', year: 2001,
      posterUrl: '/movies/b-spirited-away.jpg', tags: ['动画', '奇幻', '日本'], rating: 5,
      quote: '名字一旦被夺走，就再也找不到回家的路了。',
    },
    {
      id: 'b-5', title: '让子弹飞', director: '姜文', year: 2010,
      posterUrl: '/movies/b-let-bullets-fly.jpg', tags: ['喜剧', '剧情', '华语'], rating: 5,
      quote: '让子弹飞一会儿。',
    },
    {
      id: 'b-6', title: '布达佩斯大饭店', director: '韦斯·安德森', year: 2014,
      posterUrl: '/movies/b-grand-budapest.jpg', tags: ['喜剧', '文艺', '英语'], rating: 4,
      quote: 'You see, there are still faint glimmers of civilization left in this barbaric slaughterhouse.',
    },
  ],

  /* ===== 关注人物 ===== */
  people: [
    {
      id: 'p-1',
      name: '是枝裕和',
      role: '导演',
      avatarUrl: '/movies/p-koreeda.jpg',
      movies: ['小偷家族', '海街日记', '步履不停'],
      note: '他对家庭关系的洞察太厉害了。他的电影里没有坏人，只有被生活磨损的普通人。每次看完都会沉默很久。',
    },
    {
      id: 'p-2',
      name: '滨口龙介',
      role: '导演',
      avatarUrl: '/movies/p-hamaguchi.jpg',
      movies: ['驾驶我的车', '偶然与想象', '欢乐时光'],
      note: '对话是他的武器。一场对话可以拍四十分钟但不觉得长——那种"日常中的微妙张力"太高级了。',
    },
    {
      id: 'p-3',
      name: '安藤樱',
      role: '演员',
      avatarUrl: '/movies/p-sakura-ando.jpg',
      movies: ['小偷家族', '百元之恋', '0.5毫米'],
      note: '小偷家族里最后那场哭泣——不是好看的哭，是"真的在哭"的那种哭。她不会演，她是活在那里。',
    },
    {
      id: 'p-4',
      name: '王家卫',
      role: '导演',
      avatarUrl: '/movies/p-wong-kar-wai.jpg',
      movies: ['重庆森林', '花样年华', '春光乍泄'],
      note: '他的电影不需要剧本，需要的是颜色、音乐和一种"说不清楚"的氛围。没人能把孤独拍得像他那么好看。',
    },
    {
      id: 'p-5',
      name: '宫崎骏',
      role: '导演',
      avatarUrl: '/movies/p-miyazaki.jpg',
      movies: ['千与千寻', '龙猫', '幽灵公主'],
      note: '他的电影有"风"的味道。每次看完都想出去走走，看看树，看看天空。他就是那个提醒你别忘记名字的人。',
    },
    {
      id: 'p-6',
      name: '诺兰',
      role: '导演',
      avatarUrl: '/movies/p-nolan.jpg',
      movies: ['盗梦空间', '奥本海默', '星际穿越'],
      note: '时间是他最喜欢的玩具。每部电影都在玩不同的叙事结构，但从不为了炫技而牺牲情感。',
    },
  ],
}

export default movieData

/** 从所有数据中自动提取标签（去重） */
export function extractMovieTags(data) {
  const set = new Set()
  data.watched?.forEach((m) => m.tags?.forEach((t) => t && set.add(t)))
  return [...set]
}

/** 按标签过滤 */
export function filterByMovieTag(items, activeTag) {
  if (!activeTag) return items
  return items.filter((item) => item.tags?.includes(activeTag))
}
