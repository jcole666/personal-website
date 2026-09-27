/**
 * 板块 key 白名单 — 路由校验的第一道闸（防路径穿越 / 未知 key）
 */
export const KEYS = [
  'food',
  'games',
  'courses',
  'projects',
  'reading',
  'music',
  'movies',
  'experience',
  'sections',
]

export function isKey(k) {
  return KEYS.includes(k)
}
