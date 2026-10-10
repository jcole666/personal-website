/**
 * 生成 src/data/movies.js —— 用豆瓣抓来的真实数据（.tmp/movies-raw/）
 *
 * 「我的评分 / 看过日期 / 片单标签」来自用户豆瓣截图（截图里读出来的，不是编的）；
 * 其余（导演、演员、类型、国家、时长、豆瓣评分、原名、海报）来自豆瓣接口。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..')
const RAW = path.join(ROOT, '.tmp/movies-raw')

/**
 * 截图里的信息：序号 → 我的评分、评语、看过日期、片单标签、类型
 *
 * ⚠️ 为什么要单独写类型：豆瓣 rexxar 接口的 genres 字段有时只回 3 个
 *   （比如《蜘蛛侠：纵横宇宙》只给「喜剧/动作/科幻」，漏了「动画/奇幻/冒险」，
 *   导致按「动画」筛选时它不出现）。截图里是完整的一行，所以以截图为准。
 */
const MINE = {
  '01': { mine: 5, label: '力荐', date: '2026-09-15', tag: '美国历史片榜' , genres: ['动作', '历史', '奇幻', '冒险']},
  '02': { mine: 5, label: '力荐', date: '2026-05-16', tag: '第28届上海国际电影节获奖名单' , genres: ['剧情', '家庭']},
  '03': { mine: 3, label: '还行', date: '2026-02-26', tag: '' , genres: ['剧情', '喜剧', '运动']},
  '04': { mine: 4, label: '推荐', date: '2025-12-19', tag: '' , genres: ['剧情', '喜剧', '爱情']},
  '05': { mine: 4, label: '推荐', date: '2025-12-18', tag: '英国爱情片榜' , genres: ['喜剧', '爱情']},
  '06': { mine: 4, label: '推荐', date: '2025-12-17', tag: '第43届英国电影学院奖获奖名单' , genres: ['剧情', '喜剧', '爱情']},
  '07': { mine: 5, label: '力荐', date: '2024-11-24', tag: '豆瓣电影Top250' , genres: ['剧情', '动画', '音乐']},
  '08': { mine: 5, label: '力荐', date: '2024-07-02', tag: '豆瓣电影Top250' , genres: ['剧情']},
  '09': { mine: 5, label: '力荐', date: '2023-09-18', tag: '豆瓣电影Top250' , genres: ['剧情', '科幻', '悬疑', '冒险']},
  '10': { mine: 5, label: '力荐', date: '2023-09-16', tag: '美国历史片榜' , genres: ['剧情', '传记', '历史']},
  '11': { mine: 4, label: '推荐', date: '2023-09-15', tag: '豆瓣电影Top250' , genres: ['剧情']},
  '12': { mine: 5, label: '力荐', date: '2023-07-30', tag: '美国动画片榜' , genres: ['喜剧', '动作', '科幻', '动画', '奇幻', '冒险']},
  '13': { mine: 5, label: '力荐', date: '2023-01-24', tag: '豆瓣电影Top250' , genres: ['剧情', '犯罪']},
  '14': { mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' , genres: ['剧情', '爱情']},
  '15': { mine: 5, label: '力荐', date: '2023-01-23', tag: '豆瓣电影Top250' , genres: ['剧情', '家庭', '冒险']},
  '16': { mine: 5, label: '力荐', date: '2023-01-20', tag: '豆瓣电影Top250' , genres: ['剧情', '音乐']},
  '17': { mine: 5, label: '力荐', date: '2021-07-22', tag: '豆瓣电影Top250' , genres: ['喜剧', '爱情', '奇幻', '古装']},
  /* ====== 2026-10-09 追加 8 部（用户票务订单截图）======
     这些电影用户在电影院买过票，纳入「看过」清单。
     ⚠️ 这 8 部的 myRating 是用户授权「根据豆瓣分编一下」的：
     规则 = 豆瓣 ≥8.4 → 5★力荐 / 7.0–8.3 → 4★推荐 / <7.0 → 3★还行。
     （用户未逐部给星，日后可覆盖） */
  '18': { mine: 3, label: '还行', date: '2026-06-20', tag: '' , genres: ['喜剧', '动画', '奇幻']}, // 超级马力欧银河大电影（端午假期中间那天）
  '19': { mine: 4, label: '推荐', date: '2026-04-26', tag: '' , genres: ['剧情', '音乐', '传记']}, // 迈克尔·杰克逊：巨星之路
  '20': { mine: 4, label: '推荐', date: '2025-12-07', tag: '' , genres: ['喜剧', '动画', '悬疑']}, // 疯狂动物城2
  '21': { mine: 5, label: '力荐', date: '2025-11-30', tag: '' , genres: ['动作', '动画', '奇幻']}, // 鬼灭之刃：无限城篇
  '22': { mine: 4, label: '推荐', date: '2025-02-06', tag: '' , genres: ['剧情', '喜剧', '动画']}, // 哪吒之魔童闹海
  '23': { mine: 3, label: '还行', date: '2025-02-04', tag: '' , genres: ['喜剧', '动作', '悬疑']}, // 唐探1900
  '24': { mine: 3, label: '还行', date: '2024-12-06', tag: '' , genres: ['爱情', '歌舞', '奇幻']}, // 魔法坏女巫
  '25': { mine: 4, label: '推荐', date: '2024-09-01', tag: '' , genres: ['科幻', '惊悚', '恐怖']}, // 异形：夺命舰
}

/**
 * 每部电影的「我的感想」（100–200 字）。
 *
 * ⚠️ 用户要求「每一部都要写」，并允许参考豆瓣。
 *   做法：抓了豆瓣每部的高赞短评当切入点（tools 里没留脚本，用
 *   m.douban.com/rexxar/api/v2/movie/<id>/interests?order_by=vote），
 *   但**文字是重写的，不是摘抄**。属于主观观后感，不是事实断言。
 */
const REFLECTIONS = {
  '01': '诺兰把荷马史诗拍成了一部关于「回家」的创伤片。十年漂流不是冒险，是一场漫长的偿还——特洛伊的木马赢了，可奥德修斯从此再没能干净地站在任何人面前。最动人的是它不歌颂战争，它拆穿「战争神话」：那些被传唱的胜利者的歌谣，在亲历者耳中全是讽刺。IMAX 把海和沙拍得让人喘不过气，看完只想安静地坐一会儿。',
  '02': '一个家族的几十年，被折叠进几封没寄出的信里。最戳我的是它没有把任何一个人写成「坏人」——被时代困住的选择、说不出口的偏爱、迟到了几十年的理解，都被温柔地摊开。当阿嬷知道真相后第一反应是心疼另一个女人「带这么多孩子得多辛苦」，那一刻突然明白：真正的宽厚不是原谅，是先看见别人。',
  '03': '系列里最「纯粹」的一部，文戏压到最低，几乎全给了赛道。镜头很帅，引擎声很燃，还塞了个「人对 AI」的新命题。张驰不再需要跟谁和解了，他只想把这一圈开好——这大概是三部曲里最松弛也最成熟的心态。燃点是够的，但配方也是熟悉的，三星是因为「好，但没惊喜」。',
  '04': '英文名 Definitely, Maybe 其实剧透了它的结构——三段感情、一次悬念转移，最后把答案交给「当下」。最聪明的是让「父亲给女儿讲自己的情史」这条线撑住叙事。浪漫现实主义的外壳下，说的是「真爱不是你找到的，是它自己找上门的」。看完会心一笑，也会有点怅然。',
  '05': '一个童话，而且它自己知道自己是童话——所以才有那句「我只是一个女孩，站在一个男孩面前，请他爱我」。明星和书店老板的设定有多不真实，那条街上走过春夏秋冬的蒙太奇就有多动人。恶俗和美好在这里是一回事。不理智的傻瓜才会一直对它没抵抗力，而我就是那个傻瓜。',
  '06': '「日久生情，就是你第一眼就爱上了她，只是很久以后才知道。」这句话被引用太多次，但真看完电影才明白它的分量。十二年兜兜转转，吵过、错过、各自爱过别人，最后发现最想说话的人一直是对方。餐桌上假装高潮、以及「我爱你用半小时点三明治」这两段，是会记一辈子的。',
  '07': '一句台词都没有，却让我看到最后眼睛发酸。机器人和狗在海边分开，各自经历了一整个夏天——被捡走、被修好、被新的温柔接住。最狠的一笔是重逢：明明看见了，却选择不打扰，各自在原地跳完同一支舞。它讲的是「有些关系就是会结束」，但也讲了结束之后，你还值得被好好对待。',
  '08': '「诗歌、浪漫、爱，是我们生而为人的原因。」基廷教学生站上课桌、撕掉序言、把日子过成诗，却没能教他们怎么在现实里活下去——这大概是最痛的地方。结尾站上课桌喊「哦，船长，我的船长」，既是致敬也是控诉。看的时候会热血，看完会沉默很久。',
  '09': '第一次看是烧脑，第二次是享受，第三次才发现它其实是一部关于「放下」的电影。陀螺转不转不重要，重要的是柯布选择转身走向孩子——他不再需要确认自己在哪里了。五层梦境剪得滴水不漏，但真正让人记住的，是结尾那半秒的悬停。',
  '10': '诺兰把一个理论物理学家拍成了这个时代最惊心动魄的传记片。三小时的对白密度、黑白与彩色的时空交错，最后都指向同一种东西：一个人造出了足以毁灭世界的东西之后，该怎么面对自己。原子弹爆炸那一场戏没有声音，只有呼吸——比任何爆炸都响。看完「我成了死神」这句会一直跟着你。',
  '11': '「我的灵魂与我之间的距离如此遥远，而我的存在却如此真实。」整部电影就是这句话的注脚。代课老师把每个学生都当人看，自己却始终站在自己的生命之外。它最扎人的不是绝望，是那种「明明可以不在乎却偏偏在乎」的疲惫。看完会有点撑不住，但也正因为撑不住，才说明它戳到了。',
  '12': '每一帧都能当壁纸，而且是真的「画」出来的——水彩、拼贴、漫画分格，六种画风在同一部片子里打架又共存。故事上是「打破宿命」的老命题，但用多元宇宙讲「你属于哪里」，还是被它说服了。技术上的先锋和情感上的老派，在这里居然不冲突。',
  '13': '「恐惧让你沦为囚犯，希望让你重获自由。」安迪用十九年挖出一条隧道，也挖出了一个人在最坏的环境里还能保有多少尊严。它讲的不是越狱，是在制度化面前守住自己。每次现实让人疲惫的时候翻出来看一遍，依然能重新站起来。它在我心里排第一位，很多年没变过。',
  '14': '那些没开口的告白，最后还是被听见了。岩井俊二把暗恋拍成了一场雪——干净、安静、带着一点疼。借书卡背面的侧脸、博子在雪地里喊「你好吗」，藤井树的故事其实从来不是关于一个人，而是关于所有被时间藏起来的喜欢。看完会想起自己那本没还的书。',
  '15': '人至善，景至美。阿尔卑斯山的草地、羊群和木屋，配上海蒂光着脚奔跑的身影，几乎是治愈片的教科书。难得的是它没把「山里」和「城里」简单对立——克拉拉的优雅、皮特的耿直、爷爷的沉默，每个角色都立体。看完只想深呼吸，觉得人生本该这么简单。',
  '16': '1900 不肯下船，不是懦弱，是他知道那座没有尽头的城市里没有属于他的琴键。每个人心里都有一艘船、一个偏执的小角落，因为只有在那里才觉得安全，不至于无枝可依。最动人的不是他弹得多好，是他连死都选择留在自己认得的方寸之间。看完会重新想一想：我到底想守住什么。',
  '17': '「一遍烂，两遍笑，三遍哭。」小时候看是闹剧，长大看是悲剧。至尊宝戴上金箍就再也抱不了紫霞，不戴金箍就救不了她。紫霞眨眼那一瞬惊艳了三十年，可那句「他好像一条狗啊」才是真正的刀子。它用最不正经的方式，讲了最正经的无奈。',
  '18': '坐在电影院里只恨不能拿起手柄。彩蛋密到让人晃神，一个没看清就错过一个，那种纯粹的、五彩斑斓的快乐几乎俯首可拾。作为游戏改编它足够懂玩家，但作为电影，剧情确实「梦到哪里是哪里」，故事性比第一部还弱。适合带着小时候的自己去看，不适合带着编剧的脑子去看。',
  '19': '能在银幕上看到那些几乎复刻的舞步和现场，光这一点就值回票价——毕竟那是这个星球上最大的腕儿。但传记片本身确实扁平，成长路上的阻碍被简化成一个控制欲强的父亲，故事只讲到 1988 年就戛然而止。作为粉丝向的致敬足够动人，作为传记还是欠一部更好的。',
  '20': '第一部用「食肉与食草」讲偏见与身份，第二部降级成了欢喜搭档的合家欢——笑点密集、糖分管够，但内核薄了不少。朱迪的执拗被放大成「一意孤行」，尼克的机灵变成了「一味迁就」，两个人看着都有点别扭。技术上依然漂亮，只是那只狐狸和那只兔子，本来可以更好。',
  '21': '每一帧都在烧钱，打戏的密度和分镜几乎不给喘息。最动人的是猗窝座——头里全是无惨的记忆，心里全是恋雪，头没了，才终于能遵从自己的心。原来他的血鬼术是雪花、绝招是烟花，都是那个女孩留下的形状。哪有什么恶鬼，都是被逼到走投无路的人。三哥自杀那段，是真的绷不住。',
  '22': '第一部的「我命由我不由天」是喊出来的，第二部把它沉进了水里。阴阳、水火、红蓝，视觉上的对撞比第一部更狠也更美，变身和兵器的设计燃到起鸡皮疙瘩。内核上它把「反父权」从「反父亲」推进到了「反规则本身」。笑和泪都在，饺子这次是真的稳。',
  '23': '陈思诚像一个很努力的中等生：题型都练过，想法也不少，但一到考场还是会露怯。1900 年旧金山华工的题材其实很有分量，可惜被探案的套路和插科打诨冲淡了。有灵光的地方，也有敷衍的地方。看得出野心，但离「好」还差一口气。',
  '24': '画面是真的好看，音乐是真的好听，但歌舞和剧情像两条互不搭理的线——唱几句停下来，演一段再接着唱，节奏被切得很碎。两个女孩成为朋友的契机也没讲透，后半段更像在赶进度。作为音乐剧改编它足够华丽，作为电影它有点不知道自己想要什么。',
  '25': '回归了第一部的幽闭恐惧——狭长的走廊、忽明忽暗的灯、随时可能从阴影里窜出来的东西。作为系列重启，它把「吓人」和「怀旧」平衡得不错，从生产那一段开始才真正进入高潮。附带一条很实用的人生建议：别和渣男谈恋爱，也别给渣男生孩子，生出来的都是逆子，只会吸你的血。',
}

/**
 * 影片推荐（用户指定顺序）—— 卡片显示第一条，点开看全部。
 * id 对应 movies 里的 mv-XX。
 */
const RECOMMENDATIONS = [
  { id: 'mv-01', reason: '如果只看一部，就这部。诺兰把《荷马史诗》拍成了一部关于「回家」的创伤片，IMAX 的银幕会把海和沙拍得让你忘了呼吸。它不歌颂战争，它拆穿战争神话。' },
  { id: 'mv-02', reason: '一部把几十年家族史折进几封没寄出的信里的电影。最难得的是它不把任何人写成坏人，只是温柔地摊开每个被时代困住的选择。看完想给家里打个电话。' },
  { id: 'mv-06', reason: '关于「男女能不能只做朋友」的三十年老答案，可每次重看还是会被说服。十二年兜兜转转，最后发现最想说话的人一直是对方。台词可以背，感情骗不了人。' },
  { id: 'mv-07', reason: '全片没有一句台词，却把「关系会结束」这件事讲得比任何对白都清楚。重逢时选择不打扰、各自在原地跳完同一支舞——这是我看过最温柔的告别。' },
  { id: 'mv-08', reason: '「诗歌、浪漫、爱，是我们生而为人的原因。」它让你热血，也让你沉默很久。适合在觉得日子被过成流程表的时候看一遍，把课桌站上去。' },
  { id: 'mv-14', reason: '那些没开口的告白，最后还是被听见了。岩井俊二把暗恋拍成了一场雪，干净、安静、带着一点疼。看完会想起自己那本没还的书。' },
  { id: 'mv-16', reason: '1900 不肯下船，因为他知道那座没有尽头的城市里没有属于他的琴键。每个人心里都有一艘船。看完会重新想一想：我到底想守住什么。' },
]

const esc = (s) => String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
const arr = (a) => `[${(a ?? []).map((x) => `'${esc(x)}'`).join(', ')}]`

const idxs = Object.keys(MINE).sort()
const movies = []
for (const idx of idxs) {
  const p = path.join(RAW, `${idx}-detail.json`)
  if (!fs.existsSync(p)) {
    console.log(`✗ 缺 ${idx}-detail.json`)
    continue
  }
  const d = JSON.parse(fs.readFileSync(p, 'utf8'))
  if (!d.title) {
    console.log(`✗ ${idx} 详情为空`)
    continue
  }
  const m = MINE[idx]
  movies.push({
    idx,
    id: `mv-${idx}`,
    doubanId: String(d.id ?? ''),
    title: d.title,
    originalTitle: d.original_title || '',
    year: Number(d.year) || null,
    posterUrl: `/movies/mv-${idx}.jpg`,
    poster: (d.pic?.large || '').replace(/\/[sml]_ratio_poster\//, '/l_ratio_poster/'),
    doubanRating: d.rating?.value ?? null,
    doubanVotes: d.rating?.count ?? null,
    myRating: m.mine,
    myLabel: m.label,
    watchedDate: m.date,
    tag: m.tag,
    genres: m.genres ?? d.genres ?? [],
    countries: d.countries ?? [],
    durations: d.durations ?? [],
    directors: (d.directors ?? []).map((x) => x.name),
    actors: (d.actors ?? []).slice(0, 5).map((x) => x.name),
    reflection: REFLECTIONS[idx] ?? '',
  })
}

/* 按 watchedDate 降序排序（晚的在前）—— MINE 里的 idx 顺序只是输入顺序，
   真正的展示顺序要看实际观看日期；新增的 18-25 要按日期插入到合适位置。 */
movies.sort((a, b) => (b.watchedDate || '').localeCompare(a.watchedDate || ''))

/* ===== 统计 ===== */
const withRating = movies.filter((m) => m.doubanRating)
const stats = {
  count: movies.length,
  avgDouban: withRating.length
    ? (withRating.reduce((s, m) => s + m.doubanRating, 0) / withRating.length).toFixed(1)
    : '—',
  fiveStar: movies.filter((m) => m.myRating === 5).length,
  firstDate: movies.length ? movies[movies.length - 1].watchedDate : '',
  lastDate: movies.length ? movies[0].watchedDate : '',
}

/* ===== 胶片 banner：力荐 + 豆瓣 Top250 里挑前 8 张 ===== */
const banner = movies.slice(0, 8)

/* ===== 类型标签（用于筛选），按出现次数排序 ===== */
const genreCount = new Map()
movies.forEach((m) => m.genres.forEach((g) => genreCount.set(g, (genreCount.get(g) ?? 0) + 1)))
const genres = [...genreCount.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g)

function movieBlock(m, indent = '    ') {
  const L = []
  L.push(`${indent}{`)
  L.push(`${indent}  id: '${m.id}',`)
  L.push(`${indent}  doubanId: '${m.doubanId}',`)
  L.push(`${indent}  title: '${esc(m.title)}',`)
  if (m.originalTitle) L.push(`${indent}  originalTitle: '${esc(m.originalTitle)}',`)
  L.push(`${indent}  year: ${m.year},`)
  L.push(`${indent}  posterUrl: '${m.posterUrl}',`)
  L.push(`${indent}  doubanRating: ${m.doubanRating ?? 'null'},`)
  L.push(`${indent}  myRating: ${m.myRating},`)
  L.push(`${indent}  myLabel: '${m.myLabel}',`)
  L.push(`${indent}  watchedDate: '${m.watchedDate}',`)
  if (m.tag) L.push(`${indent}  tag: '${esc(m.tag)}',`)
  L.push(`${indent}  genres: ${arr(m.genres)},`)
  L.push(`${indent}  countries: ${arr(m.countries)},`)
  L.push(`${indent}  durations: ${arr(m.durations)},`)
  L.push(`${indent}  directors: ${arr(m.directors)},`)
  L.push(`${indent}  actors: ${arr(m.actors)},`)
  if (m.reflection) L.push(`${indent}  reflection: '${esc(m.reflection)}',`)
  L.push(`${indent}},`)
  return L.join('\n')
}

const out = `/**
 * 电影页数据 —— 露天影院
 *
 * ⚠️ 真实数据，不要编：
 *   - 「看过」清单来自用户豆瓣截图（片名/年份/我的星级/看过日期/片单标签）
 *   - 导演、演员、类型、国家、时长、豆瓣评分、原名、海报 来自豆瓣接口
 *     （tools/fetch-movies.sh 抓取 → tools/build-movies.mjs 生成）
 *   - 顺序 = 豆瓣列表顺序 = 看过时间倒序（最近看的在最前）
 *
 * 字段说明：
 *   myRating    我的星级 1–5（豆瓣的「力荐/推荐/还行」）
 *   myLabel     对应的文字评语
 *   doubanRating 豆瓣评分（不是我打的）
 *   tag         豆瓣给这部电影挂的片单标签，没有就留空
 */

const movieData = {
  stats: {
    count: ${stats.count},
    avgDouban: ${stats.avgDouban},
    fiveStar: ${stats.fiveStar},
    firstDate: '${stats.firstDate}',
    lastDate: '${stats.lastDate}',
  },

  /* 片单标签 / 类型，用于筛选 */
  genres: ${arr(genres)},

  /* 胶片 banner（取最近看的 8 部） */
  bannerMovies: [
${banner.map((m) => movieBlock(m, '    ')).join('\n')}
  ],

  /* 已看（豆瓣「看过」全量，倒序） */
  watched: [
${movies.map((m) => movieBlock(m, '    ')).join('\n')}
  ],

  /* 影片推荐（用户指定顺序，第一条 = 最新推荐） */
  recommendations: [
${RECOMMENDATIONS.map((r) => `    { id: '${r.id}', reason: '${esc(r.reason)}' },`).join('\n')}
  ],
}

/* 按类型筛选（全部 = 返回原数组） */
export function filterMoviesByGenre(list, genre) {
  if (!genre) return list ?? []
  return (list ?? []).filter((m) => (m.genres ?? []).includes(genre))
}

export default movieData
`

fs.writeFileSync(path.join(ROOT, 'src/data/movies.js'), out)
console.log(`✓ 生成 src/data/movies.js：${movies.length} 部，类型 ${genres.length} 个`)
console.log(`  统计：${stats.count} 部 · 豆瓣均分 ${stats.avgDouban} · 五星 ${stats.fiveStar} 部`)
movies.forEach((m) => console.log(`  ${m.id} ${m.title}（${m.year}）豆瓣${m.doubanRating} 我${m.myRating}★ ${m.watchedDate}`))
