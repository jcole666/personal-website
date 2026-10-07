import { useState, useMemo } from 'react'
import {
  Title,
  Tag,
  Divider,
  Typewriter,
  Time,
  Icon,
} from 'animal-island-ui'
import { useModalBehavior } from '../hooks/useModalBehavior.js'
import { experiences as seedExperiences, experienceTypes as seedTypes } from '../data/experience.js'
import { useData } from '../context/DataContext.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'
import SiteFooter from '../components/SiteFooter.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import FileAttach from '../components/FileAttach.jsx'

const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i

// 后端未返回时的回落数据。提到模块层（只建一次），
// 否则每次渲染都新建对象 → experiences 引用每次都变 → useMemo 失效
const FALLBACK = { experiences: seedExperiences, experienceTypes: seedTypes }

// 取 date 里的起始日期，拼成可比较的 yyyymmdd 数字（用于倒序）。
// date 形如 "2025.07.12 - 2025.07.23" 或 "2025.10.02"
function startOf(item) {
  const m = String(item.date || '').match(/(\d{4})\.(\d{1,2})\.(\d{1,2})/)
  return m ? Number(m[1] + m[2].padStart(2, '0') + m[3].padStart(2, '0')) : 0
}

// 类型标签颜色映射
const typeColors = {
  '旅行': 'app-teal',
  '支教': 'app-orange',
  '活动': 'purple',
  '实习': 'app-blue',
  '竞赛': 'app-yellow',
  '社团': 'app-green',
  '志愿': 'lime-green',
  '演出': 'purple',
}

function renderParagraphs(text) {
  return text
    .trim()
    .split('\n\n')
    .map((para, i) => <p key={i}>{para.trim()}</p>)
}

/**
 * 经历详情弹窗
 * 从页面中间弹出，显示照片 + 完整文字
 */
function DetailModal({ item, onClose, onFilesChange }) {
  const { editMode } = useEditMode()
  // Esc 关闭 + 锁背景滚动。组件常驻挂载、内部 return null，
  // 必须传 isOpen 跟随「是否真的打开」，否则一进页面就锁死整页滚动
  useModalBehavior(Boolean(item), onClose)
  if (!item) return null

  const files = item.files ?? []
  // 封面优先用 cover 字段；没设就用第一张图片附件顶上 —— 传了照片立刻生效，
  // 不用再单独去填一次封面路径
  const coverSrc = item.cover || files.find((f) => IMAGE_RE.test(f.name))?.url

  return (
    <div className="exp-modal-overlay" onClick={onClose}>
      <div className="exp-modal" onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button className="exp-modal-close" onClick={onClose}>
          ✕
        </button>

        {/* 封面图：有 cover 用真照片，没有就画一张旅行明信片 */}
        <div className="exp-modal-cover">
          <PhotoArt
            src={coverSrc}
            alt={item.title}
            id={item.id}
            label={item.type}
            theme="journal"
          />
        </div>

        {/* 内容区 */}
        <div className="exp-modal-body">
          <div className="exp-modal-meta">
            <Tag color={typeColors[item.type]} size="small">{item.type}</Tag>
            <span className="exp-modal-date">{item.date}</span>
          </div>
          <h2 className="exp-modal-title">{item.title}</h2>
          <div className="exp-modal-details">
            {renderParagraphs(item.details)}
          </div>

          {/* 照片与资料：图片直接出缩略图，md / txt 可以就地阅读 */}
          {(files.length > 0 || editMode) && (
            <div className="exp-modal-files">
              <h3 className="exp-modal-files-label">照片与资料</h3>
              <FileAttach
                files={files}
                onChange={(next) => onFilesChange(item.id, next)}
                label="照片 / 资料"
                emptyHint="这段经历还没有上传照片或资料。"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Experience() {
  const { data, saveSection } = useData()
  const { experiences, experienceTypes } = data.experience ?? FALLBACK

  const [activeType, setActiveType] = useState(null) // null = 全部
  // 存 id 而不是对象快照 —— 上传附件后 experiences 会更新，按 id 重查才拿得到最新的 files
  const [selectedId, setSelectedId] = useState(null)
  const selectedItem = selectedId ? experiences.find((e) => e.id === selectedId) : null

  /** 上传 / 删除某条经历的附件后，把整个 experience 文档存回后端 */
  async function handleItemFiles(itemId, files) {
    const next = {
      ...(data.experience ?? {}),
      experiences: experiences.map((e) => (e.id === itemId ? { ...e, files } : e)),
    }
    await saveSection('experience', next)
  }

  // 根据类型筛选，并按时间倒序（最新的在前）
  const filtered = useMemo(() => {
    const list = activeType ? experiences.filter((e) => e.type === activeType) : experiences
    return [...list].sort((a, b) => startOf(b) - startOf(a))
  }, [activeType, experiences])

  return (
    <main className="experience-world">
      <div className="experience-inner">
        {/* 飘带标题 */}
        <div className="experience-title-wrap">
          <Title size="large" color="app-teal">
            <Icon name="icon-map" size={36} />
            {' '}经历分享
          </Title>
        </div>

        {/* 动森时钟 + 打字机开场 */}
        <div className="experience-hero">
          <div className="experience-hero-time">
            <Time />
          </div>
          <div className="experience-hero-text">
            <Typewriter speed={60}>
              <p className="experience-intro-text">
                欢迎来到我的冒险笔记！这里记录了我大学生活中走过的路、踩过的坑、遇见的人。
              </p>
            </Typewriter>
          </div>
        </div>

        <Divider type="dashed-brown" />

        {/* 类型筛选栏 —— 轻量标签，不抢眼 */}
        <div className="exp-filter">
          <button
            className={`exp-filter-btn ${activeType === null ? 'exp-filter-btn--active' : ''}`}
            onClick={() => setActiveType(null)}
          >
            全部
          </button>
          {experienceTypes.map((type) => (
            <button
              key={type}
              className={`exp-filter-btn ${activeType === type ? 'exp-filter-btn--active' : ''}`}
              onClick={() => setActiveType(type === activeType ? null : type)}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 画廊卡片网格 */}
        <div className="exp-gallery">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="exp-card"
              onClick={() => setSelectedId(item.id)}
            >
              {/* 照片区 */}
              <div className="exp-card-cover">
                {/* 不传 label —— PhotoArt 会把 label 画成一个圆形徽章，
                    在这个尺寸下会被卡片边缘裁掉一半；类型信息下面已经有 Tag 了 */}
                <PhotoArt
                  src={item.cover}
                  alt={item.title}
                  id={item.id}
                  theme="journal"
                />
              </div>

              {/* 信息区 */}
              <div className="exp-card-body">
                <div className="exp-card-top">
                  <Tag color={typeColors[item.type]} size="small">{item.type}</Tag>
                  <span className="exp-card-date">{item.date}</span>
                </div>
                <h3 className="exp-card-title">{item.title}</h3>
                <p className="exp-card-summary">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="exp-empty">
            <Icon name="icon-map" size={48} />
            <p>还没有这个类型的记录，去创造一些回忆吧～</p>
          </div>
        )}
      </div>

      {/* 页脚 */}
      <SiteFooter path="/experience" />

      {/* 海浪（回到顶部已统一放进页脚，这里不再重复放一个） */}
      <div className="experience-sea" />

      {/* 详情弹窗 */}
      <DetailModal
        item={selectedItem}
        onClose={() => setSelectedId(null)}
        onFilesChange={handleItemFiles}
      />
      <EditButton sectionKey="experience" label="经历分享" />
    </main>
  )
}

export default Experience
