import './PhotoArt.css'

/**
 * PhotoArt — 「还没拍照」时顶上来的占位插画
 *
 * 为什么要有这个组件：
 *   站里有 55 个图位（市集 32 / 电影 16 / 经历 7）现在是空的。
 *   放一个灰底 emoji，访客看到的是"这站没做完"；
 *   放一张画得认真的插画，看到的是"这是设计"。
 *   等真照片到位，父组件把 src 传进来，这个组件自动退场。
 *
 * 三个主题：
 *   food    手绘食谱卡 —— 暖色纸底 + 线描食物 + 手写体分类 + 「待拍照」印章
 *   journal 旅行明信片 —— 天空渐变 + 山影/海浪/天际线 + 邮戳
 *   poster  极简艺术海报 —— 双色几何构图 + 竖排片名 + 年份
 *
 * 三个设计约束：
 *   1. 纯 SVG，零依赖零副作用，不碰 window/document
 *   2. 同一个 id 永远画出同一张图（FNV-1a 哈希决定配色和图形），刷新不变
 *   3. 用 preserveAspectRatio="slice" 铺满容器，所以同一个主题能适配不同宽高比
 */

/* ================= 确定性随机 ================= */

/** FNV-1a：短字符串散列，分布够均匀，且跨会话稳定 */
function hash(str = '') {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 从数组里稳定地取一项 */
const pick = (list, seed, shift = 0) => list[(seed + shift) % list.length]

/* ================= 主题一：市集 · 手绘食谱卡 ================= */

const FOOD_INK = '#4a3f33'

/* 纸底配色：都是暖色，和市集页面的暖白基调是一家人 */
const FOOD_PAPERS = [
  ['#fdf6ec', '#f6e7d3'],
  ['#fdf3ea', '#f5e0cf'],
  ['#fbf6ef', '#f1e5d6'],
  ['#fdf7f2', '#f7e5e0'],
  ['#f9f5ea', '#ede6d2'],
  ['#fdf4f0', '#f6e2da'],
]

/**
 * 按商品名猜图形。顺序即优先级——比如「冰粉」要排在「粉」前面，
 * 否则会被当成面食。
 */
const FOOD_RULES = [
  { re: /冰粉/, shape: 'sweet', label: '糖水' },
  { re: /千层|提拉米苏|舒芙蕾|泡芙|蛋糕/, shape: 'cake', label: '蛋糕' },
  { re: /壶|滤杯|手冲/, shape: 'dripper', label: '咖啡器具' },
  { re: /拿铁|咖啡|美式|摩卡|冷萃/, shape: 'coffee', label: '咖啡' },
  { re: /奶茶|波波|奶盖/, shape: 'bubbletea', label: '奶茶' },
  { re: /冰沙|柠檬|果茶|杨枝甘露|红茶|绿茶/, shape: 'icetea', label: '果茶' },
  { re: /面|米线|意面|螺蛳|粉/, shape: 'noodle', label: '面食' },
  { re: /饭|咖喱|鳗鱼/, shape: 'rice', label: '米饭' },
  { re: /鱼|丸|鱿鱼|水煮/, shape: 'dish', label: '小菜' },
  { re: /双皮奶|姜撞奶|布丁|糯米糍|奶/, shape: 'sweet', label: '糖水' },
  { re: /煎饼|果子|串|烤|铁板/, shape: 'skewer', label: '小吃' },
  { re: /书|孩子/, shape: 'book', label: '书籍' },
  { re: /键盘/, shape: 'keyboard', label: '数码' },
  { re: /衬衫|格纹/, shape: 'shirt', label: '穿搭' },
  { re: /灯|蜡烛|香薰/, shape: 'lamp', label: '生活' },
  { re: /袋/, shape: 'bag', label: '文创' },
]

const FOOD_SHAPES = {
  /* 珍珠奶茶 */
  bubbletea: (c) => (
    <g>
      <path d="M110 42 L124 88" />
      <path d="M62 88 h76 v11 h-76 z" />
      <path d="M67 99 L78 212 q1.5 11 12 11 h20 q10.5 0 12-11 L133 99 Z" />
      <path d="M71 132 q29 11 58 0" />
      <circle cx="88" cy="200" r="6" fill={c} stroke="none" />
      <circle cx="103" cy="206" r="6" fill={c} stroke="none" />
      <circle cx="118" cy="199" r="6" fill={c} stroke="none" />
      <circle cx="95" cy="215" r="5" fill={c} stroke="none" />
    </g>
  ),
  /* 拿铁 */
  coffee: (c) => (
    <g>
      <path d="M86 70 q7 -11 0 -22" />
      <path d="M108 70 q7 -11 0 -22" />
      <path d="M72 96 L82 178 q1.5 12 13 12 h14 q11.5 0 13-12 L132 96 Z" />
      <ellipse cx="102" cy="96" rx="30" ry="7" />
      <path d="M132 112 q24 3 20 22 q-4 17 -22 15" />
      <path d="M78 128 q24 9 48 0" />
      <line x1="54" y1="202" x2="150" y2="202" />
      <ellipse cx="102" cy="202" rx="48" ry="8" />
    </g>
  ),
  /* 果茶 */
  icetea: (c) => (
    <g>
      <path d="M112 46 L122 92" />
      <path d="M70 92 L80 208 q1.5 11 12 11 h20 q10.5 0 12-11 L134 92 Z" />
      <path d="M74 130 q28 10 56 0" />
      <circle cx="102" cy="160" r="17" />
      <path d="M90 149 L114 171" />
      <path d="M114 149 L90 171" />
      <circle cx="88" cy="196" r="4.5" fill={c} stroke="none" />
      <circle cx="116" cy="192" r="4.5" fill={c} stroke="none" />
    </g>
  ),
  /* 面 */
  noodle: () => (
    <g>
      <path d="M118 74 L146 150" />
      <path d="M128 72 L154 146" />
      <path d="M62 140 q0 76 44 76 q44 0 44 -76" />
      <path d="M56 140 h94" />
      <path d="M76 130 q10 -22 26 -22 q16 0 26 22" />
      <path d="M82 136 q8 -13 20 -13 q12 0 20 13" />
    </g>
  ),
  /* 饭 */
  rice: () => (
    <g>
      <path d="M116 76 L142 148" />
      <path d="M126 74 L150 144" />
      <path d="M66 148 q0 68 40 68 q40 0 40 -68" />
      <path d="M60 148 h92" />
      <path d="M78 148 q6 -34 28 -34 q22 0 28 34" />
      <path d="M90 126 q5 -9 13 -9" />
    </g>
  ),
  /* 小菜 */
  dish: (c) => (
    <g>
      <ellipse cx="102" cy="180" rx="58" ry="14" />
      <path d="M46 180 q4 22 56 22 q52 0 56 -22" />
      <path d="M76 176 q4 -34 26 -34 q22 0 26 34" />
      <path d="M92 148 q10 -10 20 0" />
      <circle cx="102" cy="140" r="4.5" fill={c} stroke="none" />
    </g>
  ),
  /* 蛋糕 */
  cake: (c) => (
    <g>
      <line x1="56" y1="208" x2="148" y2="208" />
      <path d="M70 206 v-56 h64 v56" />
      <path d="M70 150 q8 -13 16 0 q8 -13 16 0 q8 -13 16 0 q8 -13 16 0" />
      <circle cx="102" cy="126" r="9" fill={c} stroke="none" />
      <path d="M102 117 q5 -13 14 -15" />
    </g>
  ),
  /* 糖水 / 小圆子 */
  sweet: (c) => (
    <g>
      <path d="M64 150 q0 66 38 66 q38 0 38 -66" />
      <path d="M56 150 h92" />
      <path d="M74 150 q6 -24 28 -24 q22 0 28 24" />
      <path d="M84 141 q18 8 36 0" />
      <circle cx="86" cy="172" r="5.5" fill={c} stroke="none" />
      <circle cx="106" cy="178" r="5.5" fill={c} stroke="none" />
      <circle cx="122" cy="168" r="5.5" fill={c} stroke="none" />
    </g>
  ),
  /* 串串 / 街头小吃 */
  skewer: (c) => (
    <g>
      <path d="M84 220 L116 92" />
      <circle cx="94" cy="182" r="15" />
      <circle cx="104" cy="142" r="15" />
      <circle cx="113" cy="102" r="14" />
      <circle cx="94" cy="182" r="4" fill={c} stroke="none" />
      <circle cx="104" cy="142" r="4" fill={c} stroke="none" />
    </g>
  ),
  /* 手冲滤杯 */
  dripper: (c) => (
    <g>
      <path d="M64 104 h76 l-26 50 h-24 z" />
      <path d="M62 158 q0 54 40 54 q40 0 40 -54" />
      <path d="M54 158 h96" />
      <path d="M88 158 v16" />
      <path d="M116 158 v16" />
      <circle cx="102" cy="196" r="5" fill={c} stroke="none" />
    </g>
  ),
  /* 书 */
  book: () => (
    <g>
      <path d="M62 96 h76 v112 h-76 z" />
      <path d="M62 96 q38 -14 76 0" />
      <path d="M78 96 v112" />
      <path d="M92 130 h34" />
      <path d="M92 148 h34" />
      <path d="M92 166 h22" />
    </g>
  ),
  /* 键盘 */
  keyboard: () => (
    <g>
      <path d="M44 130 h112 v62 h-112 z" />
      {Array.from({ length: 3 }, (_, r) =>
        Array.from({ length: 8 }, (_, k) => (
          <rect
            key={`k${r}${k}`}
            x={52 + k * 12}
            y={140 + r * 12}
            width="9"
            height="9"
            rx="1.5"
            strokeWidth="1.6"
          />
        )),
      )}
      <rect x="76" y="176" width="48" height="8" rx="2" strokeWidth="1.6" />
    </g>
  ),
  /* 衬衫 */
  shirt: (c) => (
    <g>
      <path d="M82 100 L54 118 L44 148 L66 158 L74 142 L74 212 L130 212 L130 142 L138 158 L160 148 L150 118 L122 100" />
      <path d="M82 100 q20 18 40 0" />
      <circle cx="102" cy="152" r="3" fill={c} stroke="none" />
      <circle cx="102" cy="174" r="3" fill={c} stroke="none" />
      <circle cx="102" cy="196" r="3" fill={c} stroke="none" />
    </g>
  ),
  /* 小夜灯 / 香薰 */
  lamp: (c) => (
    <g>
      <path d="M62 150 q0 -54 40 -54 q40 0 40 54 z" />
      <path d="M74 150 v56 q0 8 8 8 h40 q8 0 8 -8 v-56" />
      <path d="M80 176 h44" />
      <circle cx="102" cy="126" r="5" fill={c} stroke="none" />
    </g>
  ),
  /* 帆布袋 */
  bag: (c) => (
    <g>
      <path d="M62 122 h80 l8 90 h-96 z" />
      <path d="M82 122 v-14 q0 -18 20 -18 q20 0 20 18 v14" />
      <path d="M78 152 h48" />
      <path d="M84 172 q18 10 36 0" />
      <circle cx="102" cy="160" r="4" fill={c} stroke="none" />
    </g>
  ),
}

function FoodArt({ seed, label, accent }) {
  const rule = FOOD_RULES.find((r) => r.re.test(label))
  const shapeKey = rule?.shape ?? 'dish'
  const shapeLabel = rule?.label ?? '美食'

  const paper = pick(FOOD_PAPERS, seed)
  const gid = `pa-f${seed}`
  const accentColor = accent || pick(['#5c9e8c', '#c4704a', '#d4a040', '#c47a8c'], seed, 3)

  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor={paper[0]} />
          <stop offset="1" stopColor={paper[1]} />
        </linearGradient>
        <pattern id={`${gid}-dots`} width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill={FOOD_INK} opacity="0.07" />
        </pattern>
      </defs>

      <rect width="200" height="280" fill={`url(#${gid})`} />
      {/* 摊位色的极淡染色，让卡片和所属摊位有呼应 */}
      <rect width="200" height="280" fill={accentColor} opacity="0.05" />
      <rect width="200" height="280" fill={`url(#${gid}-dots)`} />

      {/* 插画主体 */}
      <g
        fill="none"
        stroke={FOOD_INK}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.82"
      >
        {FOOD_SHAPES[shapeKey](accentColor)}
      </g>

      {/* 手写体分类名 */}
      <text
        x="100"
        y="252"
        textAnchor="middle"
        fontSize="21"
        fill={FOOD_INK}
        opacity="0.5"
        className="photo-art-hand"
      >
        {shapeLabel}
      </text>

      {/* 待拍照印章 */}
      <g transform="rotate(-9 160 46)" opacity="0.5">
        <rect
          x="130"
          y="32"
          width="60"
          height="26"
          rx="5"
          fill="none"
          stroke="#b8574a"
          strokeWidth="2"
        />
        <text
          x="160"
          y="50"
          textAnchor="middle"
          fontSize="14"
          fill="#b8574a"
          className="photo-art-hand"
        >
          待拍照
        </text>
      </g>
    </>
  )
}

/* ================= 主题二：经历 · 旅行明信片 ================= */

const JOURNAL_PALETTES = [
  { sky: ['#cfe3e8', '#eef4ee'], far: '#a8c4bd', mid: '#7fa79d', near: '#5c887e', sun: '#f0d49a' },
  { sky: ['#f6dcc4', '#fdeee0'], far: '#e0b48f', mid: '#c68f68', near: '#a06f4d', sun: '#ef9f5f' },
  { sky: ['#d5d8ea', '#f0eef6'], far: '#a9aec9', mid: '#868cad', near: '#666b8c', sun: '#f5e6c8' },
  { sky: ['#e8dcc8', '#f8f2e4'], far: '#c4b494', mid: '#a08f6e', near: '#7a6a4e', sun: '#eec27c' },
]

/* 按经历类型挑场景：旅行看山、支教看田野、实习看城市、活动看帐篷… */
const JOURNAL_SCENE_BY_TYPE = {
  旅行: 0,
  支教: 3,
  志愿: 3,
  实习: 2,
  竞赛: 2,
  活动: 1,
  社团: 1,
}

/**
 * 场景按 viewBox 280×210（4:3）绘制。
 * 卡片封面正好是 4:3，但详情弹窗是 16:9 —— slice 会纵向裁掉约 25%。
 * 所以所有主体都压在 y 26~184 的安全区里，地面也整体上移，
 * 保证两种比例下都不缺胳膊少腿。
 */
const JOURNAL_SCENES = [
  /* 0 · 远山日出 */
  (p) => (
    <>
      <circle cx="204" cy="64" r="24" fill={p.sun} />
      <path d="M0 150 L58 100 L104 150 L148 110 L212 150 L280 120 L280 210 L0 210 Z" fill={p.far} />
      <path d="M0 168 L64 130 L124 168 L190 138 L280 168 L280 210 L0 210 Z" fill={p.mid} />
      <rect y="164" width="280" height="46" fill={p.near} />
    </>
  ),
  /* 1 · 海与帆 */
  (p) => (
    <>
      <circle cx="66" cy="60" r="22" fill={p.sun} />
      <rect y="120" width="280" height="90" fill={p.far} />
      <path
        d={`M0 142 q35 -13 70 0 q35 13 70 0 q35 -13 70 0 q35 13 70 0 v68 h-280 z`}
        fill={p.mid}
      />
      <path
        d={`M0 168 q35 -13 70 0 q35 13 70 0 q35 -13 70 0 q35 13 70 0 v42 h-280 z`}
        fill={p.near}
      />
      <path d="M186 120 v-46" stroke={p.near} strokeWidth="3" />
      <path d="M190 76 l30 30 h-30 z" fill={p.near} />
    </>
  ),
  /* 2 · 城市天际线 */
  (p) => (
    <>
      <circle cx="228" cy="58" r="20" fill={p.sun} />
      <g fill={p.far}>
        <rect x="14" y="104" width="34" height="106" />
        <rect x="56" y="78" width="26" height="132" />
        <rect x="90" y="118" width="40" height="92" />
        <rect x="138" y="90" width="30" height="120" />
        <rect x="176" y="110" width="44" height="100" />
        <rect x="228" y="82" width="28" height="128" />
      </g>
      <rect y="162" width="280" height="48" fill={p.near} />
    </>
  ),
  /* 3 · 田野与树 */
  (p) => (
    <>
      <circle cx="58" cy="58" r="22" fill={p.sun} />
      <rect y="140" width="280" height="70" fill={p.mid} />
      <path d="M0 172 q70 -16 140 0 q70 16 140 0 v38 h-280 z" fill={p.near} />
      <path d="M220 88 l28 58 h-56 z" fill={p.near} />
      <rect x="216" y="142" width="8" height="24" fill={p.near} />
      <path d="M58 166 q10 -12 20 0" stroke={p.near} strokeWidth="2.5" fill="none" />
      <path d="M104 172 q10 -12 20 0" stroke={p.near} strokeWidth="2.5" fill="none" />
    </>
  ),
]

function JournalArt({ seed, label }) {
  const type = (label || '').split('|')[0]
  const sceneIdx = JOURNAL_SCENE_BY_TYPE[type] ?? seed % JOURNAL_SCENES.length
  const p = pick(JOURNAL_PALETTES, seed, sceneIdx)
  const gid = `pa-j${seed}`

  return (
    <>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>

      <rect width="280" height="210" fill={`url(#${gid})`} />
      {JOURNAL_SCENES[sceneIdx](p)}

      {/* 明信片内框 */}
      <rect
        x="10"
        y="14"
        width="260"
        height="182"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        opacity="0.5"
      />

      {/* 右上角邮戳 */}
      <g transform="rotate(11 232 62)" opacity="0.42">
        <circle cx="232" cy="62" r="22" fill="none" stroke="#ffffff" strokeWidth="2" />
        <circle cx="232" cy="62" r="16" fill="none" stroke="#ffffff" strokeWidth="1" />
        <text
          x="232"
          y="67"
          textAnchor="middle"
          fontSize="12"
          fill="#ffffff"
          className="photo-art-hand"
        >
          待补照片
        </text>
      </g>
    </>
  )
}

/* ================= 主题三：电影 · 极简艺术海报 ================= */

const POSTER_PALETTES = [
  ['#1c1f30', '#e8a87c'],
  ['#1a2028', '#8fb8c9'],
  ['#221a28', '#c99ab0'],
  ['#1a2420', '#8fc0a0'],
  ['#28221a', '#d4b483'],
  ['#1e1a2c', '#a9a0d4'],
]

/* 四种几何构图，避免一整排海报长得一模一样 */
const POSTER_COMPOSITIONS = [
  /* 0 · 巨日 */
  (ink) => (
    <>
      <circle cx="100" cy="146" r="60" fill={ink} opacity="0.85" />
      <line x1="0" y1="212" x2="200" y2="212" stroke={ink} strokeWidth="2" opacity="0.5" />
      <line x1="0" y1="222" x2="200" y2="222" stroke={ink} strokeWidth="1" opacity="0.28" />
    </>
  ),
  /* 1 · 对角线分割 */
  (ink) => (
    <>
      <path d="M0 300 L200 96 L200 300 Z" fill={ink} opacity="0.85" />
      <path d="M0 300 L200 96" stroke="#000" strokeWidth="2" opacity="0.15" fill="none" />
      <circle cx="52" cy="70" r="20" fill={ink} opacity="0.55" />
    </>
  ),
  /* 2 · 同心弧 */
  (ink) => (
    <>
      <path d="M28 224 a72 72 0 0 1 144 0" fill="none" stroke={ink} strokeWidth="7" opacity="0.85" />
      <path d="M52 224 a48 48 0 0 1 96 0" fill="none" stroke={ink} strokeWidth="7" opacity="0.6" />
      <path d="M76 224 a24 24 0 0 1 48 0" fill="none" stroke={ink} strokeWidth="7" opacity="0.4" />
      <line x1="20" y1="224" x2="180" y2="224" stroke={ink} strokeWidth="2" opacity="0.6" />
    </>
  ),
  /* 3 · 山影三角 */
  (ink) => (
    <>
      <path d="M18 232 L76 118 L134 232 Z" fill={ink} opacity="0.85" />
      <path d="M96 232 L148 148 L200 232 Z" fill={ink} opacity="0.55" />
      <circle cx="150" cy="72" r="17" fill={ink} opacity="0.7" />
    </>
  ),
]

function PosterArt({ seed, label, accent }) {
  const [bg, inkDefault] = pick(POSTER_PALETTES, seed)
  const ink = accent || inkDefault
  const comp = (seed + 2) % POSTER_COMPOSITIONS.length
  const chars = (label || '').slice(0, 4).split('')

  return (
    <>
      <rect width="200" height="300" fill={bg} />
      <g opacity="0.9">{POSTER_COMPOSITIONS[comp](ink)}</g>

      {/* 竖排片名 */}
      <g fill="#f2f0e8" fontSize="20" className="photo-art-hand">
        {chars.map((ch, i) => (
          <text key={i} x="26" y={54 + i * 26}>
            {ch}
          </text>
        ))}
      </g>

      {/* 底部年份位留白，年份由卡片自身渲染 */}
      <line x1="26" y1="264" x2="86" y2="264" stroke="#f2f0e8" strokeWidth="1.5" opacity="0.5" />
    </>
  )
}

/* ================= 出口 ================= */

const VIEWBOX = {
  food: '0 0 200 280',
  journal: '0 0 280 210',
  poster: '0 0 200 300',
}

export default function PhotoArt({
  src,
  alt,
  id = '',
  label = '',
  theme = 'food',
  accent,
  className = '',
}) {
  // 真照片优先——有图就正常显示，这个组件的插画逻辑完全不参与
  if (src) {
    return <img className={className} src={src} alt={alt || label} loading="lazy" />
  }

  const seed = hash(`${theme}:${id || label}`)

  return (
    <svg
      className={`photo-art photo-art--${theme} ${className}`.trim()}
      viewBox={VIEWBOX[theme] ?? VIEWBOX.food}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`${alt || label || '暂无照片'}（暂无照片，此为占位插画）`}
    >
      {theme === 'food' && <FoodArt seed={seed} label={label} accent={accent} />}
      {theme === 'journal' && <JournalArt seed={seed} label={label} />}
      {theme === 'poster' && <PosterArt seed={seed} label={label} accent={accent} />}
    </svg>
  )
}
