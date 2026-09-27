/**
 * seedData — 9 个板块的静态快照
 * 作用：
 *   1. 后端关闭 / 纯静态托管时，页面回落显示 seed（和今天的行为完全一致）
 *   2. 首次加载 API 数据前的占位
 * 与 server/seed.js 的播种逻辑同构。
 */
import food from './food.js'
import games from './games.js'
import courses from './courses.js'
import projects from './projects.js'
import * as readingMod from './reading.js'
import music from './music.js'
import movies from './movies.js'
import * as experienceMod from './experience.js'
import * as sectionsMod from './sections.js'

export const seedData = {
  food,
  games,
  courses,
  projects,
  reading: {
    profile: readingMod.profile,
    books: readingMod.books,
    dailyQuotes: readingMod.dailyQuotes,
    tagDimensions: readingMod.tagDimensions,
    notes: readingMod.notes,
  },
  music,
  movies,
  experience: {
    experiences: experienceMod.experiences,
    experienceTypes: experienceMod.experienceTypes,
  },
  sections: { sections: sectionsMod.sections },
}
