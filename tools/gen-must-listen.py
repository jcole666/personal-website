"""生成 music.js 的 mustListen 数组（62 首「人生必听歌单」）"""
import json, re, os

must = json.load(open('.tmp/must-listen.json', encoding='utf-8'))
cache = json.load(open('.tmp/must-covers.json', encoding='utf-8')) if os.path.exists('.tmp/must-covers.json') else {}

src = open('src/data/music.js', encoding='utf-8').read()
i = src.index('singles: ['); j = src.index('albums: [')
objs = re.findall(r'\{[^{}]*\}', src[i:j], re.S)
singles = []
for o in objs:
    def g(k):
        m = re.search(k + r":\s*'([^']*)'", o)
        return m.group(1) if m else None
    singles.append({'title': g('title'), 'artist': g('artist'), 'cover': g('coverUrl')})

norm = lambda s: re.sub(r'[^a-z0-9\u4e00-\u9fa5]', '', str(s or '').lower())
slug = lambda t, a: re.sub(r'[^a-z0-9\u4e00-\u9fa5]', '', (t + a).lower())[:48]

rows = []
hit_itunes = hit_existing = 0
for title, artist in must:
    main = artist.split(' / ')[0]
    cover = ''
    url = cache.get(f'{title}|{artist}', '')
    local = f's-{slug(title, artist)}.jpg'
    if url and os.path.exists(os.path.join('public/music', local)):
        cover = f'/music/{local}'
        hit_itunes += 1
    else:
        for s in singles:
            if norm(s['title']) == norm(title) and main.lower() in (s['artist'] or '').lower() and s['cover']:
                cover = s['cover']; hit_existing += 1; break
        if not cover:
            for s in singles:
                if norm(s['title']) == norm(title) and s['cover']:
                    cover = s['cover']; hit_existing += 1; break
    rows.append((title, artist, cover))

print(f'共 {len(rows)} 首：iTunes 新封面 {hit_itunes}，复用现有封面 {hit_existing}，无封面 {len(rows)-hit_itunes-hit_existing}')

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

lines = []
for t, a, c in rows:
    lines.append(f"    {{ title: '{esc(t)}', artist: '{esc(a)}', coverUrl: '{c}' }},")
block = '  mustListen: [\n' + '\n'.join(lines) + '\n  ],\n'

# 插到 pickHistory 之后
anchor = src.index('  /* ===== 歌曲：红心 100 + 播放排行 93 的并集 ===== */')
new = src[:anchor] + block + '\n' + src[anchor:]
open('src/data/music.js', 'w', encoding='utf-8').write(new)
print('已写入 src/data/music.js')
