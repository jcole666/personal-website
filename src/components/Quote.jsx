import { Link } from 'react-router-dom'

function Quote() {
  return (
    <section className="quote">
      <div className="quote-inner">
        <span className="quote-mark">“</span>
        <p className="quote-label">DAILY · 每日金句</p>
        <blockquote className="quote-text">
          简单，是可靠的前提。
        </blockquote>
        <div className="quote-footer">
          <cite className="quote-source">—— 艾兹格·迪杰斯特拉</cite>
          <Link to="/reading" className="quote-more">查看更多 →</Link>
        </div>
      </div>
    </section>
  )
}

export default Quote
