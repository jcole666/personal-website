"""把 4 批感悟注入 src/data/music.js
   · 单曲 / 必听歌单 → reflection（按 "title|artist" 查表）
   · 专辑 → reflection（按 "album:title|artist"）
   · 音乐人 → profile（按 "artist:name"）
"""
import json, re, glob, os

table = {}
for f in sorted(glob.glob('.tmp/refl-*.json')):
    table.update(json.load(open(f, encoding='utf-8')))
print(f'感悟表共 {len(table)} 条')

def esc(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")

src = open('src/data/music.js', encoding='utf-8').read()
orig = src

# ---------- 1) mustListen（单行对象）----------
def fix_must(m):
    body = m.group(1)
    t = re.search(r"title: '((?:[^'\\]|\\.)*)'", body)
    a = re.search(r"artist: '((?:[^'\\]|\\.)*)'", body)
    if not t or not a: return m.group(0)
    key = f"{t.group(1).replace(chr(92)+chr(39), chr(39))}|{a.group(1).replace(chr(92)+chr(39), chr(39))}"
    if 'reflection:' in body or key not in table: return m.group(0)
    return '{' + body.rstrip() + f", reflection: '{esc(table[key])}' }}"

i = src.index('mustListen: [')
j = src.index('singles: [')
seg = src[i:j]
seg2, n = re.subn(r'\{([^{}]*?title:[^{}]*?)\}', fix_must, seg)
src = src[:i] + seg2 + src[j:]
print('mustListen 注入', n)

# ---------- 2) singles（多行对象，按 id 定位）----------
i = src.index('singles: [')
j = src.index('albums: [')
seg = src[i:j]
def fix_single(m):
    body = m.group(0)
    t = re.search(r"title: '((?:[^'\\]|\\.)*)'", body)
    a = re.search(r"artist: '((?:[^'\\]|\\.)*)'", body)
    if not t or not a: return body
    key = f"{t.group(1).replace(chr(92)+chr(39), chr(39))}|{a.group(1).replace(chr(92)+chr(39), chr(39))}"
    if 'reflection:' in body or key not in table: return body
    # 插在 coverUrl 行之后
    cm = re.search(r"(\n(\s*)coverUrl: '[^']*',)", body)
    if not cm: return body
    return body[:cm.end()] + f"\n{cm.group(2)}reflection: '{esc(table[key])}'," + body[cm.end():]
seg2, n = re.subn(r'\{\s*\n\s*id: \'sg-\d+\',[\s\S]*?\n    \},', fix_single, seg)
src = src[:i] + seg2 + src[j:]
print('singles 注入', n)

# ---------- 3) albums ----------
i = src.index('albums: [')
j = src.index('artists: [')
seg = src[i:j]
def fix_album(m):
    body = m.group(0)
    t = re.search(r"title: '((?:[^'\\]|\\.)*)'", body)
    a = re.search(r"artist: '((?:[^'\\]|\\.)*)'", body)
    if not t or not a: return body
    key = f'album:{t.group(1)}|{a.group(1)}'
    if 'reflection:' in body or key not in table: return body
    cm = re.search(r"(\n(\s*)year: [^,]*,)", body)
    if not cm: return body
    return body[:cm.end()] + f"\n{cm.group(2)}reflection: '{esc(table[key])}'," + body[cm.end():]
seg2, n = re.subn(r'\{\s*\n\s*id: \'[ab]-[\w-]+\',[\s\S]*?\n    \},', fix_album, seg)
src = src[:i] + seg2 + src[j:]
print('albums 注入', n)

# ---------- 4) artists ----------
i = src.index('artists: [')
j = src.index('thoughtIntro:')
seg = src[i:j]
def fix_artist(m):
    body = m.group(0)
    nm = re.search(r"name: '((?:[^'\\]|\\.)*)'", body)
    if not nm: return body
    key = f'artist:{nm.group(1)}'
    if 'profile:' in body or key not in table: return body
    nm2 = re.search(r"(\n(\s*)note: '[^']*',)", body)
    if not nm2: return body
    return body[:nm2.end()] + f"\n{nm2.group(2)}profile: '{esc(table[key])}'," + body[nm2.end():]
seg2, n = re.subn(r'\{\s*\n\s*id: \'ar-[\w-]+\',[\s\S]*?\n    \},', fix_artist, seg)
src = src[:i] + seg2 + src[j:]
print('artists 注入', n)

open('src/data/music.js', 'w', encoding='utf-8').write(src)
print(f'✓ 已写回（{len(orig)} → {len(src)} 字符）')
