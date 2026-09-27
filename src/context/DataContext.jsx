import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { seedData } from '../data/index.js'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [data, setData] = useState({})
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'offline'

  // 挂载时从 API 拉取全部板块数据；失败则回落 seed
  useEffect(() => {
    let cancelled = false
    fetch('/api/data')
      .then((r) => {
        if (!r.ok) throw new Error('no backend')
        return r.json()
      })
      .then((json) => {
        if (cancelled) return
        setData(json)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setData(seedData)
        setStatus('offline')
      })
    return () => {
      cancelled = true
    }
  }, [])

  /** 保存某个板块（PUT 到后端），成功后更新本地 state */
  const saveSection = useCallback(async (key, value) => {
    const res = await fetch(`/api/data/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || `保存失败 (${res.status})`)
    }
    setData((prev) => ({ ...prev, [key]: value }))
    return value
  }, [])

  return (
    <DataContext.Provider value={{ data, status, saveSection }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  return useContext(DataContext)
}
