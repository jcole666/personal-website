/**
 * 读书页数据
 *
 * 数据字段说明：
 * ── 每日金句 ──
 * @property {string} date   - 日期
 * @property {string} text   - 金句正文
 * @property {string} source - 出处
 *
 * ── 标签维度 ──
 * @property {string} key   - 维度标识
 * @property {string} label - 显示名（类型/国家/自定义……）
 * @property {string[]} options - 预设选项
 *
 * ── 书籍 ──
 * @property {string}   id
 * @property {string}   title
 * @property {string}   author
 * @property {string}   coverUrl
 * @property {'finished'|'reading'|'want-to-read'} status
 * @property {string[]} tags       - 多维标签（类型+国家……）
 * @property {string}   finishedDate
 * @property {number}   rating
 * @property {string}   reflection
 * @property {{ text: string, note: string }[]} highlights
 * @property {string}   wantReason
 *
 * ── 感想（独立于书本）──
 * @property {string} id
 * @property {string} date
 * @property {string} title   - 用户自定义标题（文艺风）
 * @property {string} content - 正文
 * @property {string} color   - 便签底色（可选）
 */

const readingData = {
  /* ===== 标签维度定义 ===== */
  tagDimensions: [
    {
      key: 'genre',
      label: '类型',
      options: ['小说', '诗歌', '散文', '哲学', '心理学', '计算机', '科幻', '历史', '传记', '科普', '经济学', '漫画'],
    },
    {
      key: 'country',
      label: '国家/地区',
      options: ['中国', '日本', '美国', '英国', '法国', '德国', '俄国', '拉美', '其他'],
    },
  ],

  /* ===== 每日金句 ===== */
  dailyQuotes: [
    {
      date: '2026-07-29',
      text: '一本书读完可能就忘了，但竹篮经过一次次水的冲洗，会变得越来越干净。',
      source: '佚名',
    },
    {
      date: '2026-07-28',
      text: '读史使人明智，读诗使人灵秀，数学使人周密，科学使人深刻。',
      source: '培根',
    },
    {
      date: '2026-07-27',
      text: '书籍是横渡时间大海的航船。',
      source: '培根',
    },
    {
      date: '2026-07-26',
      text: '我们读书，因为我们孤单。我们读书，然后就不孤单了。',
      source: '《岛上书店》',
    },
    {
      date: '2026-07-25',
      text: '读书不是为了拿文凭或发财，而是成为一个有温度、懂情趣、会思考的人。',
      source: '杨绛',
    },
    {
      date: '2026-07-24',
      text: '世界上任何书籍都不能带给你好运，但它们能让你悄悄成为你自己。',
      source: '赫尔曼·黑塞',
    },
    {
      date: '2026-07-23',
      text: '读书是灵魂的壮游，随时可以发现名山巨川、古迹名胜。',
      source: '林语堂',
    },
    {
      date: '2026-07-22',
      text: '一个人的阅读史，就是他的精神发育史。',
      source: '朱永新',
    },
    {
      date: '2026-07-21',
      text: '不读书的人，思想就会停止。',
      source: '狄德罗',
    },
    {
      date: '2026-07-20',
      text: '书卷多情似故人，晨昏忧乐每相亲。',
      source: '于谦',
    },
  ],

  /* ===== 个人档案 ===== */
  profile: {
    stats: {
      finished: 12,
      reading: 1,
      wantToRead: 4,
    },
  },

  /* ===== 书籍列表 ===== */
  books: [
    {
      id: 'b1',
      title: '人月神话',
      author: 'Frederick P. Brooks, Jr.',
      coverUrl: '',
      status: 'finished',
      tags: ['计算机', '美国'],
      finishedDate: '2026-07-20',
      rating: 4.5,
      reflection:
        '大二上软件工程课的时候老师推荐的。一开始以为是讲项目管理的"成功学"，读完才发现是一本关于"为什么软件项目会失败"的书。\n\n最震撼的点是"没有银弹"——Brooks 在 1986 年就说清楚了，软件复杂性的本质不是工具能解决的。',
      highlights: [
        {
          text: '在众多软件项目中，缺乏合理的时间进度安排是造成项目滞后的最主要原因。',
          note: '赶 ddl 的时候看到这句……',
        },
      ],
    },
    {
      id: 'b2',
      title: '杀死一只知更鸟',
      author: 'Harper Lee',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '美国'],
      finishedDate: '2026-06-15',
      rating: 5,
      reflection:
        '大一英语课要求读原版，一口气两天看完。Atticus 成了我心中最理想的大人形象。\n\nScout 的叙述视角选得太好了，用孩子的眼睛看成人世界的偏见和不公。',
      highlights: [
        {
          text: "You never really understand a person until you climb into his skin and walk around in it.",
          note: '全书最好的一句。',
        },
        {
          text: "Courage is not a man with a gun in his hand. It's knowing you're licked before you begin but you begin anyway.",
          note: '关于勇气的定义。',
        },
      ],
    },
    {
      id: 'b3',
      title: '局外人',
      author: 'Albert Camus',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '法国'],
      finishedDate: '2026-05-08',
      rating: 4,
      reflection:
        '读完像在烈日下看一卷过曝的照片。默尔索不是因为杀人才被判死刑，而是因为"在母亲葬礼上没有哭"。',
      highlights: [
        {
          text: '今天，妈妈死了。也许是昨天，我不知道。',
          note: '被这个开头的冷淡击中。',
        },
      ],
    },
    {
      id: 'b4',
      title: '代码整洁之道',
      author: 'Robert C. Martin',
      coverUrl: '',
      status: 'finished',
      tags: ['计算机', '美国'],
      finishedDate: '2026-04-22',
      rating: 3.5,
      reflection:
        '实用建议不少，但 Uncle Bob 有些地方太教条了。总体来说是一本"取其精华"的书。',
      highlights: [
        {
          text: '函数应该做一件事。做好它。只做它。',
          note: '说起来简单，做到好难。',
        },
      ],
    },
    {
      id: 'b5',
      title: '小王子',
      author: 'Antoine de Saint-Exupéry',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '法国'],
      finishedDate: '2026-03-14',
      rating: 5,
      reflection:
        '小时候读中文版觉得是童话。大二重读原版，才发现这根本不是给孩子看的。狐狸说"驯服就是建立联系"，玫瑰花说"我那时候太年轻，还不懂得怎么去爱"。',
      highlights: [
        {
          text: "On ne voit bien qu'avec le cœur. L'essentiel est invisible pour les yeux.",
          note: '用心才能看清。',
        },
      ],
    },
    {
      id: 'b6',
      title: '算法导论',
      author: 'Thomas H. Cormen 等',
      coverUrl: '',
      status: 'finished',
      tags: ['计算机', '美国'],
      finishedDate: '2026-01-10',
      rating: 4,
      reflection:
        '为了算法竞赛硬啃的。好处是它不假设你聪明，每个算法都从最 naive 的思路开始，一步步优化。缺点是真厚，当枕头都嫌高。',
      highlights: [
        {
          text: '算法是任何良定义的计算过程。',
          note: '朴素到极点的定义。',
        },
      ],
    },
    {
      id: 'b7',
      title: '百年孤独',
      author: 'Gabriel García Márquez',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '拉美'],
      finishedDate: '2025-12-20',
      rating: 4.5,
      reflection:
        '画了一张布恩迪亚家族谱才读完。结尾羊皮卷被破译的那一刻，所有魔幻的情节突然都有了宿命的解释。马尔克斯不是在写魔幻，他是在写时间。',
      highlights: [
        {
          text: '多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。',
          note: '教科书级别的开头。',
        },
      ],
    },
    {
      id: 'b8',
      title: '苏菲的世界',
      author: 'Jostein Gaarder',
      coverUrl: '',
      status: 'finished',
      tags: ['哲学', '挪威'],
      finishedDate: '2025-11-05',
      rating: 4,
      reflection:
        '以一个 14 岁女孩收到哲学信件的视角把西方哲学史捋了一遍。读到康德和黑格尔有点吃力，但嵌套叙事本身就很哲学。',
      highlights: [
        {
          text: '最聪明的是明白自己无知的人。',
          note: '苏格拉底的影子。',
        },
      ],
    },
    {
      id: 'b9',
      title: '了不起的盖茨比',
      author: 'F. Scott Fitzgerald',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '美国'],
      finishedDate: '2025-10-18',
      rating: 4.5,
      reflection:
        'Gatsby 的"纯粹"最打动我——他不是不知道 Daisy 变了，他选择假装不知道。',
      highlights: [
        {
          text: '每当你想批评别人的时候，要记住，这世上并不是所有人都有你拥有的那些优势。',
          note: '比结尾那句更值得记住。',
        },
      ],
    },
    {
      id: 'b10',
      title: '异乡人',
      author: 'Albert Camus',
      coverUrl: '',
      status: 'finished',
      tags: ['哲学', '法国'],
      finishedDate: '2025-09-22',
      rating: 3.5,
      reflection:
        '台版翻译语气更冷。存在主义还是有点抽象，但"世界是荒诞的"这个前提，慢慢能体会到了。',
      highlights: [],
    },
    {
      id: 'b11',
      title: 'JavaScript 高级程序设计',
      author: 'Matt Frisbie',
      coverUrl: '',
      status: 'finished',
      tags: ['计算机', '美国'],
      finishedDate: '2025-08-15',
      rating: 4,
      reflection:
        '大二暑假啃完的。原型链、闭包、事件循环这几章至今受用。',
      highlights: [
        {
          text: '闭包是指有权访问另一个函数作用域中变量的函数。',
          note: '面试必问。',
        },
      ],
    },
    {
      id: 'b12',
      title: '挪威的森林',
      author: '村上春树',
      coverUrl: '',
      status: 'finished',
      tags: ['小说', '日本'],
      finishedDate: '2025-07-30',
      rating: 4,
      reflection:
        '村上的文字有一种"干净感"——写死亡和性也像隔着毛玻璃在看，不煽情但后劲大。',
      highlights: [
        {
          text: '死并非生的对立面，而作为生的一部分永存。',
          note: '',
        },
      ],
    },

    // ──── 在读 ────
    {
      id: 'b13',
      title: '深入理解计算机系统（CS:APP）',
      author: 'Randal E. Bryant / David R. O\'Hallaron',
      coverUrl: '',
      status: 'reading',
      tags: ['计算机', '美国'],
      finishedDate: '',
      rating: 0,
      reflection: '',
      highlights: [
        {
          text: '如果程序员能够理解底层硬件和操作系统的行为，他们就能更好地利用这些系统来编写高效的程序。',
          note: '正在啃第三章，汇编真的好难……',
        },
      ],
    },

    // ──── 想读 ────
    {
      id: 'b14',
      title: '设计模式',
      author: 'GoF（四人帮）',
      coverUrl: '',
      status: 'want-to-read',
      tags: ['计算机', '美国'],
      finishedDate: '',
      rating: 0,
      reflection: '',
      highlights: [],
      wantReason: '老师说必读，面试也经常问。思想是通用的。',
    },
    {
      id: 'b15',
      title: '禅与摩托车维修艺术',
      author: 'Robert M. Pirsig',
      coverUrl: '',
      status: 'want-to-read',
      tags: ['哲学', '美国'],
      finishedDate: '',
      rating: 0,
      reflection: '',
      highlights: [],
      wantReason: '书名太奇怪了。据说表面上写摩托车维修，实际上在讨论"良质"。',
    },
    {
      id: 'b16',
      title: '1984',
      author: 'George Orwell',
      coverUrl: '',
      status: 'want-to-read',
      tags: ['小说', '英国'],
      finishedDate: '',
      rating: 0,
      reflection: '',
      highlights: [],
      wantReason: '"老大哥在看着你"听了无数次，是时候读原著了。',
    },
    {
      id: 'b17',
      title: '人间词话',
      author: '王国维',
      coverUrl: '',
      status: 'want-to-read',
      tags: ['散文', '中国'],
      finishedDate: '',
      rating: 0,
      reflection: '',
      highlights: [],
      wantReason: '"昨夜西风凋碧树，独上高楼，望尽天涯路"——想理解王国维说的三种境界。',
    },
  ],

  /* ===== 独立感想（不是针对一本书的，是随时随地的记录）===== */
  notes: [
    {
      id: 'n1',
      date: '2026-07-28',
      title: '雨夜翻书',
      content:
        '窗外下着暴雨，宿舍只剩下我和一盏台灯。翻着《局外人》的最后一章，默尔索在监狱里听着城市的喧嚣。\n\n突然觉得，孤独不是一个人待着，而是全世界都在忙，只有你停了下来。书就是那个让你停下来的理由。',
      color: '#f5f1e8',
    },
    {
      id: 'n2',
      date: '2026-07-22',
      title: '代码与诗',
      content:
        '写了一天代码，晚上翻开《小王子》。发现 Debug 和读书很像——都是在混乱中找秩序。\n\n只不过一个找的是分号，一个找的是意义。找分号更快，找意义更久。',
      color: '#f2eee5',
    },
    {
      id: 'n3',
      date: '2026-07-15',
      title: '书脊与书架',
      content:
        '今天整理书架，把所有书按颜色重新排了一遍。室友说我有强迫症。\n\n其实只是想让每本书都有一个新的邻居。说不定《算法导论》和《百年孤独》会趁我不在的时候聊聊天。',
      color: '#f5f1e8',
    },
    {
      id: 'n4',
      date: '2026-07-08',
      title: '借书不还的人',
      content:
        '大一时借给同学的那本《挪威的森林》还没还。我也不好意思催，毕竟才过了两个学期。\n\n这说明一件事：书比朋友容易弄丢。',
      color: '#f2eee5',
    },
    {
      id: 'n5',
      date: '2026-06-30',
      title: '地铁上的阅读',
      content:
        '坐 1 号线去面试的路上看《代码整洁之道》。旁边大叔盯着我的书看了三站地，终于忍不住问我是不是程序员。\n\n我说我是学生。他说"那你看得懂啊？"我说看不太懂，但装懂也是学习的一部分。',
      color: '#f5f1e8',
    },
    {
      id: 'n6',
      date: '2026-06-20',
      title: '纸质书的味道',
      content:
        '我还是喜欢纸质书。Kindle 很方便，但不会变旧，不会在某一页不小心留下咖啡渍。\n\n书是会和人一起老的。你在变，你读过的书也在变。这才是最浪漫的事。',
      color: '#f2eee5',
    },
    {
      id: 'n7',
      date: '2026-06-12',
      title: '读完一本厚书之后',
      content:
        '合上《CS:APP》的那一刻，突然有点失落。\n\n不是因为它太难——确实很难——而是因为你和一个世界相处了那么久，然后就说再见了。就像毕业，只不过书里的角色永远不会离开。',
      color: '#f5f1e8',
    },
    {
      id: 'n8',
      date: '2026-06-01',
      title: '买书如山倒',
      content:
        '618 又忍不住买了一堆书。书架上的未读书从 3 本变成了 7 本。\n\n读书如抽丝。但买书这件事本身就已经给了我一种"即将变聪明"的错觉，这 200 块花得值。',
      color: '#f2eee5',
    },
  ],
}

export const { profile, books, dailyQuotes, tagDimensions, notes } = readingData

/* ===================================================================
   辅助函数
   =================================================================== */

export function getReadingBooks(books) {
  return books.filter((b) => b.status === 'reading')
}

export function getFinishedBooks(books) {
  return books
    .filter((b) => b.status === 'finished' && b.finishedDate)
    .sort((a, b) => new Date(b.finishedDate) - new Date(a.finishedDate))
}

export function getWantToReadBooks(books) {
  return books.filter((b) => b.status === 'want-to-read')
}

/** 从已读书籍中收集某个维度的所有标签 */
export function getTagsForDimension(books, dimKey) {
  const set = new Set()
  books
    .filter((b) => b.status === 'finished')
    .forEach((b) => {
      b.tags?.forEach((t) => {
        // 检查这个 tag 是否属于当前维度
        const dim = tagDimensions.find((d) => d.key === dimKey)
        if (dim && dim.options.includes(t)) set.add(t)
      })
    })
  return [...set]
}

/** 按多个标签筛选（同一维度 OR，不同维度 AND） */
export function filterByTags(books, selectedTags) {
  if (!selectedTags || selectedTags.length === 0) return books
  return books.filter((b) => {
    if (!b.tags || b.tags.length === 0) return false
    return selectedTags.every((t) => b.tags.includes(t))
  })
}

/** 获取今天的金句 */
export function getTodayQuote(quotes) {
  if (!quotes || quotes.length === 0) return null
  const today = new Date().toISOString().slice(0, 10)
  return quotes.find((q) => q.date === today) || quotes[0]
}
