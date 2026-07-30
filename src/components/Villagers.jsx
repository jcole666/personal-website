import { useState, useRef, useCallback, useEffect } from 'react'
import './Villager.css'

// 气泡消息库
const messages = {
  isabelle: [
    '岛民代表加油哦！✨',
    '今天也要元气满满！',
    '欢迎回来～',
    '你在找什么呀？',
    '有什么我可以帮忙的吗？',
  ],
  timmy: [
    '欢迎光临！🛎️',
    '今天有什么需要吗？',
    '要不要看看新到的货品？',
    '欢迎光临～',
    '想要什么尽管说！',
  ],
  tommy: [
    '...欢迎光临！🛎️',
    '...今天有什么需要吗？',
    '...要不要看看新到的货品？',
    '...欢迎光临～',
    '...想要什么尽管说！',
  ],
}

function SpeechBubble({ text, onDone }) {
  return (
    <div className="villager-bubble" onAnimationEnd={onDone}>
      <span>{text}</span>
    </div>
  )
}

function Villager({ name, imgSrc, fallback }) {
  const [bubble, setBubble] = useState(null)
  const [bouncing, setBouncing] = useState(false)
  const [imgError, setImgError] = useState(false)

  // ---- 拖动 ----
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState(() => ({
    x: name === 'isabelle' ? 24 : window.innerWidth - 140,
    y: (window.innerHeight - 170) / 2,
  }))
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0, moved: false })
  const bubbleTimerRef = useRef(null)
  const villagerRef = useRef(null)

  const handleMouseMove = useCallback((e) => {
    if (!dragRef.current.active) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 110, dragRef.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 150, dragRef.current.origY + dy)),
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    if (dragRef.current.active) {
      setDragging(false)
      dragRef.current.active = false
    }
  }, [])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  // ---- 交互 ----
  const handleMouseDown = (e) => {
    e.preventDefault()
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    }
    setDragging(true)
  }

  const handleClick = () => {
    if (dragRef.current.moved) return
    setBouncing(true)
    setTimeout(() => setBouncing(false), 450)
    const pool = messages[name] || messages.isabelle
    const idx = Math.floor(Math.random() * pool.length)
    // 先清掉旧气泡，再显示新气泡，重置 5s 计时
    setBubble(null)
    // 用 requestAnimationFrame 确保 setBubble(null) 先渲染，再显示新气泡
    requestAnimationFrame(() => {
      setBubble(pool[idx])
      clearTimeout(bubbleTimerRef.current)
      bubbleTimerRef.current = setTimeout(() => setBubble(null), 6000)
    })
  }

  return (
    <div
      ref={villagerRef}
      className={`villager villager--${name} ${dragging ? 'villager--dragging' : ''} ${bouncing ? 'villager--bounce' : ''}`}
      style={{ left: pos.x, top: pos.y, bottom: 'auto' }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      {bubble && (
        <SpeechBubble text={bubble} onDone={() => {}} />
      )}
      {imgError ? (
        <div className="villager-fallback">{fallback}</div>
      ) : (
        <img
          src={imgSrc}
          alt={name}
          className="villager-img"
          draggable={false}
          onError={() => setImgError(true)}
        />
      )}
    </div>
  )
}

export default function Villagers() {
  return (
    <div className="villagers-container" aria-hidden="true">
      <Villager
        name="isabelle"
        imgSrc="/isabelle.webp"
        fallback="🐶"
      />
      {/* 粒狸豆狸 — 图片就绪后再打开 */}
      {/* <Villager name="timmy" imgSrc="/timmy.png" fallback="🦝" /> */}
      {/* <Villager name="tommy" imgSrc="/tommy.png" fallback="🦝" /> */}
    </div>
  )
}
