import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">流前</Link>
        <ul className="nav-links">
          <li><Link to="/">首页</Link></li>
          <li><Link to="/projects">代码开发</Link></li>
          <li><Link to="/coursework">课程作业</Link></li>
          <li><Link to="/essays">随笔</Link></li>
          <li><Link to="/experience">经历分享</Link></li>
          <li><Link to="/music">音乐</Link></li>
          <li><Link to="/movies">电影</Link></li>
          <li><Link to="/milktea">奶茶打卡</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
