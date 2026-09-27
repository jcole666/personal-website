import { useState, useMemo } from 'react'
import {
  Title,
  Tag,
  Divider,
  Typewriter,
  Time,
  Icon,
} from 'animal-island-ui'
import { experiences as seedExperiences, experienceTypes as seedTypes } from '../data/experience.js'
import { useData } from '../context/DataContext.jsx'
import Villagers from '../components/Villagers.jsx'
import EditButton from '../components/edit/EditButton.jsx'
import PhotoArt from '../components/PhotoArt.jsx'
import FileAttach from '../components/FileAttach.jsx'
import { useEditMode } from '../context/EditModeContext.jsx'

const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i
import SiteFooter from '../components/SiteFooter.jsx'

// 类型标签颜色映射
const typeColors = {
  '旅行': 'app-teal',
  '支教': 'app-orange',
  '活动': 'purple',
  '实习': 'app-blue',
  '竞赛': 'app-yellow',
  '社团': 'app-green',
  '志愿': 'lime-green',
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
  const { experiences, experienceTypes } = data.experience ?? { experiences: seedExperiences, experienceTypes: seedTypes }

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

  // 根据类型筛选
  const filtered = useMemo(() => {
    if (!activeType) return experiences
    return experiences.filter((e) => e.type === activeType)
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
                <PhotoArt
                  src={item.cover}
                  alt={item.title}
                  id={item.id}
                  label={item.type}
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

      {/* 海浪 + 桌面宠物（回到顶部已统一放进页脚，这里不再重复放一个） */}
      <div className="experience-sea" />
      <Villagers />

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
