"""把新抓到的封面写回 src/data/music.js（mustListen 与 singles 两处）"""
import re

src = open('src/data/music.js', encoding='utf-8').read()

# mustListen 用的是单行对象：{ title: 'T', artist: 'A', coverUrl: '' }
MUST = {
    '吻别': '/music/s-吻别张学友.jpg',
    '枫叶做的风铃': '/music/s-枫叶做的风铃方大同.jpg',
    '爱爱爱': '/music/s-爱爱爱方大同.jpg',
    'Diamonds From Sierra Leone (Remix)': '/music/s-diamondsfromsierraleoneremixkanyewestjaz.jpg',
    'Thinkin Bout You (Spring Sampler / 2012)': '/music/s-thinkinboutyouspringsampler2012frankocean.jpg',
    'King Kunta': '/music/s-kingkuntakendricklamar.jpg',
}

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

fixed = 0
for title, cover in MUST.items():
    t = esc(title)
    # 只改 coverUrl 还是空的那条（title 唯一的）
    pat = re.compile(r"(\{ title: '" + re.escape(t) + r"', artist: '[^']*', coverUrl: )''( \})")
    src, n = pat.subn(lambda m: m.group(1) + "'" + cover + "'" + m.group(2), src)
    fixed += n
    print(('✓' if n else '·'), 'mustListen', title, '→', cover if n else '(没找到空位)')

# singles 用的是多行对象：title: 'X', ... coverUrl: '',
SINGLES = {
    'Father Stretch My Hands Pt. 1': '/music/s-fatherstretchmyhandspt1kanyewestkidcudi.jpg',
}
i = src.index('singles: [')
j = src.index('mustListen: [')
head, singles_block, tail = src[:i], src[i:j], src[j:]
for title, cover in SINGLES.items():
    t = esc(title)
    # 找到该 title 之后最近的 coverUrl: ''
    m = re.search(r"(title: '" + re.escape(t) + r"',[\s\S]{0,400}?coverUrl: )''", singles_block)
    if m:
        singles_block = singles_block[:m.start()] + m.group(1) + "'" + cover + "'" + singles_block[m.end():]
        fixed += 1
        print('✓', 'singles', title, '→', cover)
    else:
        print('·', 'singles', title, '(已经是空位以外 / 未找到)')

open('src/data/music.js', 'w', encoding='utf-8').write(head + singles_block + tail)
print(f'\n共写入 {fixed} 条')
