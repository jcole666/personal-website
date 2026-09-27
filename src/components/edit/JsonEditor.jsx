import { useState } from 'react'

/**
 * 通用递归 JSON 编辑器
 * 把任意板块数据渲染成可编辑的树：
 *   - 叶子值    → 输入框（字符串→单行/长文本、数字→数字框、布尔→开关）
 *   - 对象      → 字段分组，逐字段编辑
 *   - 数组      → 可增删、可上下移的列表，新增项按现有项结构生成空模板
 * 保存时输出结构与原数据完全一致，直接 PUT 回后端。
 */

/* 认识的字段显示中文，其余显示原始 key */
const FIELD_LABELS = {
  id: 'ID', name: '名称', title: '标题', subtitle: '副标题', desc: '描述',
  description: '描述', icon: '图标', color: '颜色', date: '日期',
  startedAt: '开始', completedAt: '完成', finishedDate: '读完日期',
  rating: '评分', price: '价格', shop: '店铺', location: '地点',
  photoUrl: '图片链接', coverUrl: '封面', avatarUrl: '头像',
  tags: '标签', review: '点评', reflection: '感想', feeling: '感受',
  status: '状态', progress: '进度', techStack: '技术栈', detail: '详情',
  highlights: '亮点', summary: '简介', label: '标签', link: '链接',
  num: '编号', latest: '最新', content: '内容', source: '出处',
  wantReason: '想读理由', genre: '体裁', author: '作者', notes: '笔记',
  profile: '简介', stats: '统计', finished: '已读', reading: '在读',
  wantToRead: '想读', dailyQuotes: '每日金句', tagDimensions: '标签维度',
  options: '选项', key: '键', text: '文本', year: '年份', album: '专辑',
  artist: '歌手', director: '导演', watchedDate: '观看日期',
  bannerMovies: '顶部轮播', featured: '主打', watched: '已看',
  watchlist: '想看', people: '人物', name_zh: '中文名', role: '身份',
  movies: '代表作', note: '备注', cardStyle: '卡片样式', items: '内容',
  stalls: '摊位', platform: '平台', school: '来源', files: '附件',
  fullReview: '完整感想', active: '进行中', done: '已完成', abandoned: '搁置',
  ideas: '灵感碎片', reason: '理由', quotes: '金句', total: '总数',
  stats_total: '总数', tag: '标签', version: '版本', link: '链接',
  experiences: '经历', experienceTypes: '经历类型', type: '类型',
  cover: '封面图', details: '详情', sections: '板块', games: '游戏',
  courses: '课程', books: '书籍', singles: '单曲', albums: '专辑',
  artists: '音乐人', latestPick: '本期推荐', recommend: '推荐语',
  featuredText: '深度聆听', coverUrl_zh: '封面', lyricQuote: '歌词',
  lyricNote: '歌词备注', itemId: '条目', priceTag: '价格',
}

/** 按现有项的字段结构生成空模板（新增数组项时用） */
function blankFromSample(sample) {
  if (Array.isArray(sample)) return []
  if (sample !== null && typeof sample === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(sample)) {
      out[k] = blankFromSample(v)
    }
    return out
  }
  if (typeof sample === 'number') return 0
  if (typeof sample === 'boolean') return false
  return ''
}

/** 叶子字段编辑器：按值类型自动选输入框 */
function FieldEditor({ value, onChange }) {
  const isNumber = typeof value === 'number'
  const isBool = typeof value === 'boolean'
  const isLongText = typeof value === 'string' && value.length > 60

  if (isBool) {
    return (
      <button
        type="button"
        className={`je-toggle ${value ? 'je-toggle--on' : ''}`}
        onClick={() => onChange(!value)}
      >
        {value ? '✓ 是' : '✗ 否'}
      </button>
    )
  }
  if (isNumber) {
    return (
      <input
        type="number"
        step="any"
        className="je-input"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    )
  }
  if (isLongText) {
    return (
      <textarea
        className="je-input je-input--area"
        rows={Math.min(8, Math.ceil(value.length / 40) + 1)}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    )
  }
  return (
    <input
      type="text"
      className="je-input"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

/** 对象编辑器：逐字段编辑 */
function ObjectEditor({ value, onChange }) {
  return (
    <div className="je-object">
      {Object.entries(value).map(([k, v]) => (
        <div key={k} className="je-row">
          <div className="je-label" title={k}>{FIELD_LABELS[k] || k}</div>
          <div className="je-field">
            <JsonEditor value={v} onChange={(nv) => onChange({ ...value, [k]: nv })} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** 数组编辑器：可增删、上下移 */
function ArrayEditor({ value, onChange }) {
  const [collapsed, setCollapsed] = useState({})

  const replace = (i, nv) => onChange(value.map((item, idx) => (idx === i ? nv : item)))
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const move = (i, dir) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = [...value]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const add = () => {
    const sample = value[0]
    const blank = blankFromSample(sample)
    // 对象且原结构有 id 字段 → 自动补唯一 id
    if (blank && typeof blank === 'object' && sample && 'id' in sample) {
      blank.id = `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    }
    onChange([...value, blank])
  }

  return (
    <div className="je-array">
      <div className="je-array-head">
        <span className="je-array-count">共 {value.length} 项</span>
        <button type="button" className="je-btn je-btn--add" onClick={add}>＋ 添加一项</button>
      </div>

      {value.map((item, i) => {
        // 取一个可读的名字做标题（name / title / id 优先）
        const titleName =
          (item && typeof item === 'object' && (item.name || item.title || item.id)) || `#${i + 1}`
        const isCollapsed = collapsed[i]
        return (
          <div key={i} className={`je-item ${isCollapsed ? 'je-item--collapsed' : ''}`}>
            <div className="je-item-bar">
              <span className="je-item-title">{titleName}</span>
              <span className="je-item-actions">
                <button type="button" className="je-btn" onClick={() => setCollapsed((c) => ({ ...c, [i]: !c[i] }))}>
                  {isCollapsed ? '展开' : '折叠'}
                </button>
                <button type="button" className="je-btn" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
                <button type="button" className="je-btn" onClick={() => move(i, 1)} disabled={i === value.length - 1}>↓</button>
                <button type="button" className="je-btn je-btn--danger" onClick={() => remove(i)}>删除</button>
              </span>
            </div>
            {!isCollapsed && <JsonEditor value={item} onChange={(nv) => replace(i, nv)} />}
          </div>
        )
      })}
    </div>
  )
}

/** 顶层分发 */
function JsonEditor({ value, onChange }) {
  if (Array.isArray(value)) return <ArrayEditor value={value} onChange={onChange} />
  if (value !== null && typeof value === 'object') return <ObjectEditor value={value} onChange={onChange} />
  return <FieldEditor value={value} onChange={onChange} />
}

export default JsonEditor
