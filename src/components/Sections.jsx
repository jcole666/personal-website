import { Link } from 'react-router-dom'

const sections = [
  { icon: '💻', title: '代码开发', desc: '课余编程项目，技术栈与踩坑记录', link: '/projects' },
  { icon: '📚', title: '课程作业', desc: '大学课程的学习记录与作业归档', link: '/coursework' },
  { icon: '✍️', title: '随笔', desc: '技术思考、生活感悟等文字创作', link: '/essays' },
  { icon: '🗺️', title: '经历分享', desc: '个人成长故事、实习比赛社团经历', link: '/experience' },
  { icon: '🎵', title: '音乐', desc: '喜欢的音乐、歌单、乐器相关', link: '/music' },
  { icon: '🎬', title: '电影', desc: '影评、观影记录、推荐', link: '/movies' },
  { icon: '🧋', title: '奶茶打卡', desc: '日常奶茶探店、口味记录、打卡日志', link: '/milktea' },
]

function Sections() {
  return (
    <section className="sections">
      <div className="sections-grid">
        {sections.map((section) => (
          <Link to={section.link} className="section-card" key={section.title}>
            <span className="card-icon">{section.icon}</span>
            <h2 className="card-title">{section.title}</h2>
            <p className="card-desc">{section.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default Sections
