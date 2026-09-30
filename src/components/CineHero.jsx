import { useEffect, useRef, useState } from 'react'
import './CineHero.css'

/**
 * 电影感视频首屏
 *
 * 这个组件的重点**不是视觉，而是加载策略**。风格规范里全是性能红线：
 *
 *   1. poster 帧是 LCP —— 视频永远不是首屏依赖。poster 只有 5KB，
 *      秒开；视频 2.5MB 是渐进增强，不播也不影响内容
 *   2. preload="none" + IntersectionObserver —— 页面加载时一个字节都不下载，
 *      滚进视口（25% 可见）才开始 load/play
 *   3. muted + loop + playsInline —— 无声才能自动播，浏览器不会拦
 *   4. 关键信息一律在文字层，不在视频里（视频可能不播 / 被降级）
 *   5. 三级降级：prefers-reduced-motion / Save-Data / 移动端 → 只显 poster 静帧
 *   6. 纯装饰，所以 aria-hidden；但仍然给用户暂停入口，不剥夺控制权
 */
export default function CineHero({
  src = '/videos/hero.mp4',
  poster = '/videos/hero-poster.webp',
  children,
}) {
  const videoRef = useRef(null)
  const [skipVideo, setSkipVideo] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(false)
  const [ready, setReady] = useState(false)

  /* 降级判定：系统开了「减少动效」、浏览器开了省流量、或窄屏 —— 三种都只显 poster */
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const narrow = window.matchMedia('(max-width: 768px)')

    const judge = () => {
      const saveData = !!navigator.connection?.saveData
      setSkipVideo(motion.matches || narrow.matches || saveData)
    }
    judge()

    motion.addEventListener('change', judge)
    narrow.addEventListener('change', judge)
    return () => {
      motion.removeEventListener('change', judge)
      narrow.removeEventListener('change', judge)
    }
  }, [])

  /* 进视口才加载并播放。绝不 preload="auto" —— 那会在首屏就拉 2.5MB */
  useEffect(() => {
    const v = videoRef.current
    if (!v || skipVideo || userPaused) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        v.play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false))
        io.disconnect()
      },
      { threshold: 0.25 }
    )
    io.observe(v)
    return () => io.disconnect()
  }, [skipVideo, userPaused])

  const toggle = () => {
    const v = videoRef.current
    if (!v) return
    if (playing) {
      v.pause()
      setPlaying(false)
      setUserPaused(true)
    } else {
      setUserPaused(false)
      v.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  return (
    <section className="cine-hero">
      {/* 视频是纯装饰 —— 关键信息全在下面的文字层 */}
      <video
        ref={videoRef}
        className={`cine-hero-video${ready ? ' cine-hero-video--ready' : ''}`}
        poster={poster}
        preload="none"
        muted
        loop
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        onLoadedData={() => setReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* 可读性遮罩：文字压视频前必须先铺这一层，保证 4.5:1 */}
      <div className="cine-hero-scrim" aria-hidden="true" />

      {/* 宽银幕上下黑边 */}
      <div className="cine-hero-bar cine-hero-bar--top" aria-hidden="true" />
      <div className="cine-hero-bar cine-hero-bar--bottom" aria-hidden="true" />

      <div className="cine-hero-content">{children}</div>

      {/* 用户控制权：不自动播的环境下给播放按钮，能播的给暂停入口 */}
      <button
        type="button"
        className="cine-hero-toggle"
        onClick={toggle}
        aria-label={playing ? '暂停背景视频' : '播放背景视频'}
      >
        <span className="cine-hero-toggle-icon" aria-hidden="true">
          {playing ? '❙❙' : '▶'}
        </span>
        {playing ? '暂停' : '播放'}
      </button>
    </section>
  )
}
