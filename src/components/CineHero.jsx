import './CineHero.css'

/**
 * 影院首屏
 *
 * 2026-10-10：用户反馈「胶片带和下面这块之间有明显分割」，并建议
 * 「下面这个背景如果是视频就删掉，统一用一个」。
 * —— 背景原来确实是**一个 2.5MB 的装饰视频**（`/videos/hero.mp4`），
 *    它的 poster 本身就是一张暖黄色光晕图。于是首屏有了两个光源：
 *    上面胶片带一层 CSS 光晕、下面视频一层，中间必然出现一条「谷」。
 *
 * 现在：视频、poster、可读性遮罩、宽银幕上下黑边**全部删掉**，
 * 整块首屏的暖黄光晕改由 `.movies-stage` 的**一层** CSS 渐变提供，
 * 和上面的胶片带连成一片 —— 不再有第二个背景，也就没有接缝了。
 * 首屏高度由 `.movies-stage` 的 flex 决定（见 movies.css），这里不再写死 vh。
 */
export default function CineHero({ children }) {
  return (
    <section className="cine-hero">
      <div className="cine-hero-content">{children}</div>
    </section>
  )
}
