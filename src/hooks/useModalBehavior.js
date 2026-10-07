import { useEffect } from 'react'

/**
 * 弹窗通用行为：Esc 关闭 + 锁住背景滚动。
 *
 * 抽出来统一用，之后新增任何弹窗都套这个，别再各写一份。
 *
 * ⚠️ isOpen 为 false 时**完全不做事、也不残留锁**。
 * 常驻挂载但内部 return null 的弹窗组件（ProjectModal / IdeaModal / CourseModal），
 * 必须传 isOpen 跟随「是否真的打开」，否则一进页面就把 body.overflow 设成 hidden
 * 且永远不还原，整页就滑不动了。所以锁必须跟着"是否真的打开"走。
 */
export function useModalBehavior(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen])
}
