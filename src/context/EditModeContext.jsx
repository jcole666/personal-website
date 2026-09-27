import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const EditModeContext = createContext(null)

/**
 * 编辑模式 —— URL 开关 `?edit=1` 进入
 *  - 打开任意页面时检测 query 里的 edit=1
 *  - 全局状态：开启后切换板块页面仍保持（URL 会自动带上）
 *  - 进入后各板块页面显示编辑按钮，保存才需要登录
 */
export function EditModeProvider({ children }) {
  const [editMode, setEditMode] = useState(false)

  // 初始化：从 URL ?edit=1 读取
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('edit') === '1') setEditMode(true)
  }, [])

  // 开启/关闭时同步 URL（刷新不丢状态，也可直接分享带 edit=1 的链接）
  useEffect(() => {
    const url = new URL(window.location.href)
    if (editMode) {
      url.searchParams.set('edit', '1')
    } else {
      url.searchParams.delete('edit')
    }
    window.history.replaceState(null, '', url.toString())
  }, [editMode])

  const enterEditMode = useCallback(() => setEditMode(true), [])
  const exitEditMode = useCallback(() => setEditMode(false), [])

  return (
    <EditModeContext.Provider value={{ editMode, enterEditMode, exitEditMode }}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  return useContext(EditModeContext)
}
