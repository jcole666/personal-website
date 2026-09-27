function Hero() {
  return (
    <header className="hero">
      <div className="hero-inner">
        <div className="hero-text">
          <span className="hero-eyebrow">欢迎光临我的主页</span>
          <h1 className="hero-title">你好，我是流前。</h1>
          <p className="hero-intro">
            复旦大学软件工程大三在读。这里是我的主页名片——除了一些代码与项目，也有听过的歌、走过的路，一些不值一提、却舍不得删的小事。
            <br />
            <span className="hero-intro-indent">欢迎随便逛。</span>
          </p>
        </div>
        <div className="hero-avatar-frame">
          <img className="hero-avatar" src="/images/avatar2.png" alt="流前的头像" />
        </div>
      </div>
    </header>
  )
}

export default Hero
