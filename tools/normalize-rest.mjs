/**
 * 归一化：电影 / 游戏 / 市集
 *
 * 目标比例由各页 CSS 决定：
 *   - 电影海报  2/3  （.movie-gallery-poster / .signboard-poster / .movie-modal-cover / .film-poster-img 都是 aspect-ratio: 2/3）
 *   - 电影人物  1/1  （.person-avatar 是圆形，object-fit:cover）
 *   - 游戏封面  2/3  （Steam 原生 600x900）
 *   - 市集照片  4/3  （.food-card-photo aspect-ratio: 4/3；弹窗 16/9 会再裁上下）
 *
 * 人像用 fy 把裁剪重心上移，避免居中裁把脑袋切掉。
 */
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const PY = 'C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

/* 人像裁剪重心（0~1，0 是顶边） */
const FACE = {
  'p-koreeda': 0.30,
  'p-hamaguchi': 0.28,
  'p-sakura-ando': 0.30,
  'p-wong-kar-wai': 0.32,
  'p-miyazaki': 0.30,
  'p-nolan': 0.30,
}

function run(code) {
  execFileSync(PY, ['-c', code], { stdio: 'inherit' })
}

const TMP = 'F:/self/网站/.tmp'
const PUB = 'F:/self/网站/public'

/* ---------- 1. 电影海报 2/3 ---------- */
console.log('== 电影海报 → public/movies (2/3) ==')
run(`
from PIL import Image
import glob, os, re
src=r'${TMP}/covers-movies'; dst=r'${PUB}/movies'
os.makedirs(dst, exist_ok=True)
TARGET=2/3
n=0
for f in sorted(glob.glob(os.path.join(src,'*.jpg'))):
    b=os.path.basename(f)
    if b.startswith('p-'): continue          # 人物单独处理
    im=Image.open(f).convert('RGB'); im.load()
    w,h=im.size; r=w/h
    if r > TARGET:                            # 太宽 → 裁宽
        nw=int(h*TARGET); left=(w-nw)//2
        im=im.crop((left,0,left+nw,h))
    else:                                     # 太高 → 裁高（居中）
        nh=int(w/TARGET); top=(h-nh)//2
        im=im.crop((0,top,w,top+nh))
    im=im.resize((800,1200), Image.LANCZOS)
    im.save(os.path.join(dst,b), quality=88, optimize=True)
    n+=1
print('  海报', n)
`)

/* ---------- 2. 电影人物 1/1 ---------- */
console.log('== 电影人物 → public/movies (1/1) ==')
run(`
from PIL import Image
import glob, os, json
src=r'${TMP}/covers-movies'; dst=r'${PUB}/movies'
FACE=json.loads(r'''${JSON.stringify(FACE)}''')
n=0
for f in sorted(glob.glob(os.path.join(src,'p-*.jpg'))):
    b=os.path.basename(f); k=b[:-4]
    im=Image.open(f).convert('RGB'); im.load()
    w,h=im.size; side=min(w,h)
    fy=FACE.get(k,0.32)
    left=int((w-side)*0.5)
    top=int((h-side)*fy)
    left=max(0,min(left,w-side)); top=max(0,min(top,h-side))
    im=im.crop((left,top,left+side,top+side)).resize((480,480), Image.LANCZOS)
    im.save(os.path.join(dst,b), quality=90, optimize=True)
    n+=1
print('  人物', n)
`)

/* ---------- 3. 游戏封面 2/3 ---------- */
console.log('== 游戏封面 → public/games (2/3) ==')
run(`
from PIL import Image
import glob, os
src=r'${TMP}/covers-games'; dst=r'${PUB}/games'
os.makedirs(dst, exist_ok=True)
TARGET=2/3
n=0
for f in sorted(glob.glob(os.path.join(src,'*.jpg'))):
    b=os.path.basename(f)
    im=Image.open(f).convert('RGB'); im.load()
    w,h=im.size; r=w/h
    if r > TARGET:
        nw=int(h*TARGET); left=(w-nw)//2
        im=im.crop((left,0,left+nw,h))
    else:
        nh=int(w/TARGET); top=int((h-nh)*0.12)   # 游戏封面标题多在上方，重心略上移
        top=max(0,min(top,h-nh))
        im=im.crop((0,top,w,top+nh))
    im=im.resize((600,900), Image.LANCZOS)
    im.save(os.path.join(dst,b), quality=88, optimize=True)
    n+=1
print('  游戏', n)
`)

/* ---------- 4. 市集 4/3 ---------- */
console.log('== 市集 → public/food (4/3) ==')
run(`
from PIL import Image
import glob, os
src=r'${TMP}/covers-food'; dst=r'${PUB}/food'
os.makedirs(dst, exist_ok=True)
TARGET=4/3
n=0
for f in sorted(glob.glob(os.path.join(src,'*.jpg'))):
    b=os.path.basename(f)
    im=Image.open(f).convert('RGB'); im.load()
    w,h=im.size; r=w/h
    if r > TARGET:
        nw=int(h*TARGET); left=(w-nw)//2
        im=im.crop((left,0,left+nw,h))
    else:
        nh=int(w/TARGET); top=int((h-nh)*0.45)
        top=max(0,min(top,h-nh))
        im=im.crop((0,top,w,top+nh))
    im=im.resize((1000,750), Image.LANCZOS)
    im.save(os.path.join(dst,b), quality=86, optimize=True)
    n+=1
print('  市集', n)
`)
console.log('done')
