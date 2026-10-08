/** 拼装 music.js：singles 来自生成文件，albums/artists 手写 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = 'F:/self/网站'
const singles = readFileSync(resolve(ROOT, '.tmp', 'singles-array.txt'), 'utf8')

/* 最近收藏 10 张（用户给的第 1 份清单） */
const RECENT = [
  ['a-timeless', 'Timeless', 'Prince', 1998, 'Prince 的精选集，二十多首歌把放克、灵魂、摇滚全串了一遍。'],
  ['a-ok', 'OK', '张震岳', 2007, '《OK》是张震岳最松弛的一张，痞里痞气但每句都实在。'],
  ['a-groupies', 'Groupies 吉他手', '陈绮贞', 2002, '陈绮贞的第三张。歌词像日记，编曲却一点不含糊。'],
  ['a-music-fashion-film', 'Music, Fashion, Film', 'Charli xcx', 2024, 'Charli 把流行、俱乐部和噪音揉在一起，还是那股子不管不顾的劲儿。'],
  ['a-niguang', '逆光', '孙燕姿', 2007, '千禧年华语流行的标准答案，副歌一响就回中学。'],
  ['a-born-to-die', 'Born To Die', 'Lana Del Rey', 2012, '复古好莱坞的颓靡美学，整张像一部慢镜头电影。'],
  ['a-my-everything', 'My Everything', 'Ariana Grande', 2014, 'Ariana 从偶像转成天后的那一张，情歌和舞曲各占一半。'],
  ['a-honestly-nevermind', 'Honestly, Nevermind', 'Drake', 2022, 'Drake 突然做了一张浩室舞曲专辑，评价两极但很耐听。'],
  ['a-bully', 'BULLY', 'Kanye West / Ye', 2025, 'Ye 的新作，还是那种把采样玩到极致的路子。'],
  ['a-olivia-sad', 'you seem pretty sad for a girl so in love', 'Olivia Rodrigo', 2025, '名字长到打不完，但情绪给得很准。'],
]

/* 听得最多 10 张（用户给的第 2 份清单）→ 深度聆听 */
const TOP = [
  ['b-blonde', 'Blonde', 'Frank Ocean', 2016,
    '听得最多的一张。它不靠副歌抓人，靠的是那种「一个人在深夜反复想同一件事」的质地。编曲极其克制，人声常常被推到最前面，剩下的空间全留给呼吸。\n\n每重听一次都会听到之前漏掉的细节——一层和声、一段环境音、某个突然变调的瞬间。'],
  ['b-new-world', '新世界NEW WORLD', '华晨宇', 2020,
    '华晨宇把「新世界」做成了一个完整的叙事：从压抑到爆发的完整弧线。他的高音不是炫技，是情绪到了那个位置不得不上去。'],
  ['b-starboy', 'Starboy', 'The Weeknd', 2016,
    'Daft Punk 参与制作，把 The Weeknd 从地下 R&B 推到流行顶端。整张的合成器音色是标志性的，冷、亮、带点金属感。'],
  ['b-2014-fhd', '2014 Forest Hills Drive', 'J. Cole', 2014,
    'J. Cole 最真诚的一张，没有客串、没有花哨的制作，就是一个人讲他从哪来。'],
  ['b-damn', 'DAMN.', 'Kendrick Lamar', 2017,
    '拿了普利策奖的那张。结构上正着听倒着听都能成立，每一首都在问同一个问题：我到底是个好人还是坏人。'],
  ['b-liangbian', '量变临界点', '华晨宇', 2025,
    '华晨宇最新的一张，把电子、摇滚和实验元素推得更远。'],
  ['b-gnx', 'GNX', 'Kendrick Lamar', 2024,
    '突然空降的一张，西海岸味道极重，节奏比 DAMN. 更硬。'],
  ['b-astroworld', 'ASTROWORLD', 'Travis Scott', 2018,
    'Travis 把「氛围」做成了主角——人声常常只是众多音色里的一个。'],
  ['b-divide', '÷ (Deluxe)', 'Ed Sheeran', 2017,
    '流行到极致的一张，几乎每首都能当单曲发。'],
  ['b-dawn-fm', 'Dawn FM', 'The Weeknd', 2022,
    '整张假装是一档午夜电台节目，有主持人串场。概念完整到像一部广播剧。'],
]

/* 最近关注 10 位 + 播放量前十 10 位（并列第 10 两位都收） */
const ARTISTS = [
  ['ar-zhangfangzhao', '张方钊', ['说唱', '华语'], '最近才关注的说唱新人，flow 很稳。'],
  ['ar-logic', 'Logic', ['说唱', '英语'], '技术流的代表，押韵密度极高。'],
  ['ar-songyueting', '宋岳庭', ['说唱', '华语'], '华语说唱的先行者，留下的作品不多但句句是命。'],
  ['ar-future', 'Future', ['说唱', 'Trap'], '把 Auto-Tune 用成了一种乐器的人。'],
  ['ar-olivia-rodrigo', 'Olivia Rodrigo', ['流行', '摇滚'], '新生代里最会把青春期写成歌的。'],
  ['ar-don-toliver', 'Don Toliver', ['说唱', 'R&B'], '声音辨识度极高，飘忽的唱腔是他的签名。'],
  ['ar-led-zeppelin', 'Led Zeppelin', ['摇滚', '经典'], '老摇滚的顶点之一，riff 教科书。'],
  ['ar-sade', 'Sade', ['灵魂', '爵士'], '把「温柔」做成了一种风格，几十年没变过。'],
  ['ar-rosalia', 'ROSALÍA', ['流行', '弗拉门戈'], '把弗拉门戈和电子揉在一起，听起来完全不像别人。'],
  ['ar-chris-brown', 'Chris Brown', ['R&B', '流行'], '争议不少，但唱跳实力是公认的。'],

  ['ar-mouhuanjun', '某幻君', ['说唱', '华语'], '740', '播放量第一。'],
  ['ar-huachenyu', '华晨宇', ['流行', '摇滚'], '549', '从选秀出来，一路把唱功和编曲都推到了很前面。'],
  ['ar-kendrick', 'Kendrick Lamar', ['说唱', '英语'], '537', '这个时代最好的叙事型说唱歌手之一。'],
  ['ar-prince', 'Prince', ['放克', '摇滚'], '452', '一个人能演奏所有乐器，也能把所有风格都变成自己的。'],
  ['ar-jcole', 'J. Cole', ['说唱', '英语'], '388', '很少炒作，靠作品说话。'],
  ['ar-laofanqie', '老番茄', ['说唱', '华语'], '332', 'B 站创作者出身，合作曲传唱度很高。'],
  ['ar-theweeknd', 'The Weeknd', ['R&B', '流行'], '258', '从地下 mixtape 一路做到超级碗中场秀。'],
  ['ar-wanghanzhe', '王瀚哲', ['说唱', '华语'], '248', '中国 BOY，和某幻君、老番茄一批的合作曲常客。'],
  ['ar-frankocean', 'Frank Ocean', ['R&B', '独立'], '218', '产量极低，但两张专辑定义了一个时代的审美。'],
  ['ar-travisscott', 'Travis Scott', ['说唱', 'Trap'], '139', '把现场做成了一种宗教体验。'],
  ['ar-postmalone', 'Post Malone', ['流行', '说唱'], '139', '从 SoundCloud 出来，最后成了最会写旋律的那类人。'],
]

/* 感想：先是一段整体的音乐感悟，再是每首歌的具体感受。
   ⚠️ 这些是初稿，用户说「随便写写」；每张卡片写的是对**那首歌**的理解。 */
const THOUGHT_INTRO =
  '这些歌陆陆续续听了好几年。口味从中文说唱一路滑到 R&B、放克、灵魂乐，再滑回来——现在回头看，真正留下来的从来不是「好听」，而是那些能对上某个具体时刻的歌：某次深夜改代码、某段没结果的感情、某个突然想通的下午。所以这份清单与其说是歌单，不如说是一份情绪存档。'

const THOUGHTS = [
  ['假行僧 (Live)', '华晨宇', '/music/s-歌手2018第十期livehuachenyu.jpg',
    '崔健的原版是痞的、满不在乎的；华晨宇把它改成了一场自我审判。前面几乎是耳语，副歌突然炸开——那个落差不是在炫技，是在演「我装不下去了」的那一秒。'],
  ['Do Me, Baby (Live)', 'Prince', '/music/s-1999superdeluxeedition2019remasterprince.jpg',
    '录音室版已经很露骨，现场版反而更狠：他把速度拖慢到近乎停滞，让每个字都落在你来不及准备的位置。听的时候会不自觉屏住呼吸。'],
  ['Self Control', 'Frank Ocean', '/music/s-blondefrankocean.jpg',
    '整张 Blonde 里最像「凌晨四点」的一首。人声被推到最前，几乎听得见换气；后半段突然切进一段变调的吉他，像记忆被猛地拧了一下。'],
  ['Not Like Us', 'Kendrick Lamar', '/music/s-notlikeussinglekendricklamar.jpg',
    '一首 diss 能做到全民传唱，靠的不是脏话密度，是节奏。「wop, wop, wop, wop, wop」简单到听一遍就会——这才是最狠的地方：它让所有人都能跟着唱。'],
  ['疯人院', '华晨宇', '/music/s-歌手当打之年第十期livehuachenyu.jpg',
    '用雷鬼的拍子唱精神崩溃。编曲越轻快、歌词越绝望，这个反差本身就是它的刀。'],
  ['好想爱这个世界啊', '华晨宇', '/music/s-新世界huachenyu.jpg',
    '写给抑郁的人，但通篇没有一句「你要坚强」。它只做了一件事：把「站在人群里却听不见声音」那种状态说清楚，然后陪着。'],
  ['小宇', '张震岳', '/music/s-okayuechang.jpg',
    '张震岳写情歌从不美化自己。这首最好的一句其实是承认「我不太会说话」——笨拙本身就是内容，比任何漂亮话都管用。'],
  ['路口', '张震岳', '/music/s-okayuechang.jpg',
    '同一张专辑里最沉的一首。讲的是站在岔路口那种「怎么选都会后悔」的犹豫，副歌没有给答案，只是把问题又唱了一遍。'],
  ['太聪明', '陈绮贞', '/music/s-吉他手陳綺貞.jpg',
    '「我太聪明，所以我不快乐」——一句话就把整首歌的逻辑立住了。编曲只有吉他和弦乐，留白比声音多。'],
  ['躺在你的衣柜 (Piano)', '陈绮贞', '/music/s-groupiescheerchen.jpg',
    '钢琴独奏版把原版的乐队织体全剥掉了，只剩下人声和琴键。剥掉之后才发现，这首歌的可怕之处在于它的平静。'],
  ['Purple Rain', 'Prince', '/music/s-purpleraindeluxeexpandededition2015paisl.jpg',
    '八分多钟，前六分钟都在铺，最后两分钟的吉他 solo 才是目的。他把它当布道，不是当单曲发。'],
  ['No Role Modelz', 'J. Cole', '/music/s-2014foresthillsdrivejcole.jpg',
    'J. Cole 最出圈的一首，但内核一点都不讨喜：讲的是成名之后发现「有钱也治不好原来的问题」。副歌那种自嘲式的豁达，其实是咬牙说出来的。'],
]

function albumBlock(list, featured) {
  return list
    .map(([slug, title, artist, year, text]) => {
      const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, "\\'")
      let o = `    {\n      id: '${slug}',\n      title: '${esc(title)}',\n      artist: '${esc(artist)}',\n`
      o += `      coverUrl: '/music/${slug}.jpg',\n      year: ${year},\n`
      if (featured) o += `      featured: true,\n      featuredText: '${esc(text)}',\n`
      else o += `      reflection: '${esc(text)}',\n      featured: false,\n      featuredText: '',\n`
      o += `    },\n`
      return o
    })
    .join('')
}

function artistBlock() {
  return ARTISTS.map(([slug, name, tags, playsOrNote, note]) => {
    const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/'/g, "\\'")
    const hasPlays = /^\d+$/.test(playsOrNote)
    const plays = hasPlays ? Number(playsOrNote) : null
    const n = hasPlays ? note : playsOrNote
    let o = `    {\n      id: '${slug}',\n      name: '${esc(name)}',\n`
    o += `      avatarUrl: '/music/${slug}.jpg',\n`
    o += `      tags: [${tags.map((t) => `'${t}'`).join(', ')}],\n`
    if (plays) o += `      plays: ${plays},\n`
    o += `      note: '${esc(n)}',\n    },\n`
    return o
  }).join('')
}

const file = `/**
 * 音乐 · 深夜听音室
 *
 * 数据全部来自用户提供的听歌记录（2026-10-08）：
 *   - 红心 100 首（按红心先后，最近的在前）→ singles 里 heart: 1..100
 *   - 累计播放排行 93 首（从高到低）      → singles 里 plays: 1..93
 *   - 最近收藏的 10 张专辑 + 听得最多的 10 张专辑
 *   - 最近关注的 10 位艺人 + 播放量前十的艺人（并列第 10 收了两位）
 *
 * ⚠️ 红心榜和播放榜几乎不重合，所以 singles 是两份榜单的并集（193 首）。
 *    一首歌可能只有 heart、只有 plays，或者两者都有。
 *
 * ⚠️ 封面来自 iTunes：106/193 命中。剩下 87 首基本是华语（华晨宇专辑曲、
 *    某幻君、陈绮贞、蔡依林等）iTunes 没有收录，coverUrl 留空，
 *    由 PhotoArt 画占位插画。
 */

const musicData = {
  /* ===== 本期推荐：播放量第一 ===== */
  latestPick: {
    type: 'single',
    title: 'Do Me, Baby (Live)',
    artist: 'Prince',
    coverUrl: '/music/s-purpleraindeluxeexpandededition2015paisl.jpg',
    recommend:
      '播放量第一。Prince 把一首录音室慢歌放慢到近乎停滞，然后在一个你完全没准备的位置把嗓子顶上去——那是现场才有的、无法复制的失控。',
  },

  /* ===== 歌曲：红心 100 + 播放排行 93 的并集 ===== */
  singles: [
${singles}  ],

  /* ===== 专辑 ===== */
  albums: [
${albumBlock(RECENT, false)}${albumBlock(TOP, true)}  ],

  /* ===== 音乐人 ===== */
  artists: [
${artistBlock()}  ],

  /* ===== 感想 ===== */
  thoughtIntro: '${THOUGHT_INTRO.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',
  thoughts: [
${THOUGHTS.map(([title, artist, cover, text], i) => {
  const e = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  return `    {\n      id: 'th-${i + 1}',\n      title: '${e(title)}',\n      artist: '${e(artist)}',\n      coverUrl: '${cover}',\n      text: '${e(text)}',\n    },\n`
}).join('')}  ],
}

export default musicData

export function extractAllTags(data) {
  const set = new Set()
  const add = (arr) => arr?.forEach((t) => t && set.add(t))
  data.singles?.forEach((s) => add(s.tags))
  data.albums?.forEach((a) => add(a.tags))
  data.artists?.forEach((a) => add(a.tags))
  return [...set]
}

export function filterByTag(items, activeTag) {
  if (!activeTag) return items
  return items.filter((item) => item.tags?.includes(activeTag))
}
`

writeFileSync(resolve(ROOT, 'src', 'data', 'music.js'), file, 'utf8')
console.log('music.js 已生成')
