#!/usr/bin/env bash
# 电影海报 —— 豆瓣 suggest 接口（免 key）
#   Apple 的 iTunes 电影商店已下线；TMDB 要 key；Wikipedia 只对部分片子暴露海报文件。
#   豆瓣的 subject_suggest 直接回 JSON（含海报 URL），且中英文片都能查到。
#   海报取 l 尺寸（1080x1537，比例 0.703，和书籍页封面 0.68 很接近）。
# 必须走代理；Node fetch 连不上豆瓣，只能用 shell 的 curl。
set -u
DEST="F:/self/网站/.tmp/covers-movies"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'
REF='https://movie.douban.com/'

poster() { # $1=输出名 $2=查询词  [$3=期望年份]
  local out="$DEST/$1.jpg" q="$2" want_year="${3:-}"
  local enc
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")
  local js
  js=$(curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" -e "$REF" "https://movie.douban.com/j/subject_suggest?q=$enc")
  local img
  img=$(printf '%s' "$js" | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
want='${want_year}'
rows=[r for r in d if r.get('type')=='movie' and r.get('img')]
if not rows: sys.exit(0)
if want:
    hit=[r for r in rows if str(r.get('year',''))==want]
    if hit: rows=hit
print(rows[0]['img'].replace('s_ratio_poster','l'))
")
  if [ -z "$img" ]; then echo "  ✗ $1：查不到（$q）"; return 1; fi
  curl -sL --max-time 60 -x 127.0.0.1:7890 -A "$UA" -e "$REF" -o "$out" "$img"
  if [ -s "$out" ]; then
    echo "  ✓ $1.jpg  $(du -k "$out" | cut -f1) KB"
  else
    echo "  ✗ $1：下载失败 $img"; rm -f "$out"; return 1
  fi
}

echo "=== 已看电影 ==="
poster w-chungking-express   "重庆森林" 1994
poster w-parasite            "寄生虫" 2019
poster w-hanabun-no-koi      "花束般的恋爱" 2021
poster w-inception           "盗梦空间" 2010
poster w-shawshank           "肖申克的救赎" 1994
poster w-spirited-away       "千与千寻" 2001
poster w-godfather           "教父" 1972
poster w-a-sun               "阳光普照" 2019
poster w-spiderverse         "蜘蛛侠：纵横宇宙" 2023
poster w-let-bullets-fly     "让子弹飞" 2010
poster w-grand-budapest      "布达佩斯大饭店" 2014
poster w-umimachi-diary      "海街日记" 2015

echo "=== 今夜放映 ==="
poster feat-your-name        "你的名字。" 2016

echo "=== 胶片 Banner（复用已看电影）==="
cp "$DEST/w-chungking-express.jpg" "$DEST/b-chungking-express.jpg" 2>/dev/null && echo "  ✓ b-chungking-express"
cp "$DEST/w-parasite.jpg"          "$DEST/b-parasite.jpg"          2>/dev/null && echo "  ✓ b-parasite"
cp "$DEST/w-hanabun-no-koi.jpg"    "$DEST/b-hanabun-no-koi.jpg"    2>/dev/null && echo "  ✓ b-hanabun-no-koi"
cp "$DEST/w-spirited-away.jpg"     "$DEST/b-spirited-away.jpg"     2>/dev/null && echo "  ✓ b-spirited-away"
cp "$DEST/w-let-bullets-fly.jpg"   "$DEST/b-let-bullets-fly.jpg"   2>/dev/null && echo "  ✓ b-let-bullets-fly"
cp "$DEST/w-grand-budapest.jpg"    "$DEST/b-grand-budapest.jpg"    2>/dev/null && echo "  ✓ b-grand-budapest"
