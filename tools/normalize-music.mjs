/**
 * 图片归一化：
 *   - 封面（1:1）→ 直接缩到 600x600，落到 public/music/
 *   - 头像（1:1）→ 缩到 400x400 正方形；人脸偏移的用手工 cfg 微调裁剪重心
 *
 * 头像会被 CSS 裁成圆（object-fit:cover），所以方形本身够用；
 * 真正需要处理的是「人在画面偏一侧、默认居中裁会把脸切掉」的情况。
 */
import { mkdirSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const PY = 'C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'
const SRC = 'F:/self/网站/.tmp/covers-music'

/**
 * 每张头像的裁剪参数：
 *   square: 正方形边长按 min(w,h) 取
 *   fx / fy: 裁剪窗口中心在源图上的相对位置（0~1），默认 .5
 * 以及可选的 rotate（照片是横的但人是竖的等情况）
 */
const AVATAR_CFG = {
  'ar-yorushika': { fx: 0.5, fy: 0.42 }, // 竖构图，脸偏上
  'ar-radiohead': { fx: 0.5, fy: 0.5, name: 'band composite 960x349' },
  'ar-prince': { fx: 0.5, fy: 0.38 }, // 肖像，脸在上三分之一
  'ar-wanqing': { fx: 0.48, fy: 0.5 },
  'ar-bon-iver': { fx: 0.42, fy: 0.55 }, // 舞台照，主唱偏左
  'ar-frank-ocean': { fx: 0.5, fy: 0.35 }, // 竖构图，头在上部
  'ar-jay-chou': { fx: 0.5, fy: 0.4 },
  'ar-mbv': { fx: 0.5, fy: 0.55 }, // 乐队合影，中间偏下
}

const COVER_SIZE = 600
const AVATAR_SIZE = 480

function python(code) {
  execFileSync(PY, ['-c', code], { stdio: 'inherit' })
}

const src = resolve(SRC, '..', 'covers-music').replace(/\\/g, '/')
const outMusic = 'F:/self/网站/public/music'

console.log('== 封面 ==')
python(`
from PIL import Image
import glob, os
os.makedirs(r'${outMusic}', exist_ok=True)
files = sorted(glob.glob(r'${src}/*.jpg'))
n = 0
for f in files:
    b = os.path.basename(f)
    if not (b.startswith('al-') or b.startswith('s-') or b.startswith('latest-')): continue
    im = Image.open(f).convert('RGB'); im.load()
    w, h = im.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    im = im.crop((left, top, left+side, top+side)).resize((${COVER_SIZE}, ${COVER_SIZE}), Image.LANCZOS)
    im.save(os.path.join(r'${outMusic}', b), quality=90, optimize=True)
    n += 1
print('covers ->', n)
`)

console.log('== 头像 ==')
const cfgJs = JSON.stringify(AVATAR_CFG)
python(`
from PIL import Image
import glob, os, json
os.makedirs(r'${outMusic}', exist_ok=True)
CFG = json.loads(r'''${cfgJs}''')
for f in sorted(glob.glob(r'${src}/ar-*.jpg')):
    b = os.path.basename(f); k = b[:-4]
    c = CFG.get(k, {})
    im = Image.open(f).convert('RGB'); im.load()
    w, h = im.size
    side = min(w, h)
    fx = c.get('fx', 0.5); fy = c.get('fy', 0.5)
    left = int(round((w - side) * fx))
    top  = int(round((h - side) * fy))
    left = max(0, min(left, w - side))
    top  = max(0, min(top,  h - side))
    im = im.crop((left, top, left+side, top+side)).resize((${AVATAR_SIZE}, ${AVATAR_SIZE}), Image.LANCZOS)
    im.save(os.path.join(r'${outMusic}', b), quality=90, optimize=True)
    print('  ', b, im.size)
`)
console.log('done')
