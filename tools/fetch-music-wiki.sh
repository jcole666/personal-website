#!/usr/bin/env bash
# 音乐人头像 + loveless 封面（Wikipedia，必须走代理）
# Node 的 fetch 连不上 Wikipedia，只能借 shell 的 curl。
set -u
DEST="F:/self/网站/.tmp/covers-music"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

fetch() { # $1=输出名 $2=条目
  local out="$DEST/$1.jpg" title="$2"
  local api="https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&piprop=original&format=json&redirects=1&titles=$(printf '%s' "$title" | sed 's/ /%20/g;s/(/%28/g;s/)/%29/g')"
  local url
  url=$(curl -s --max-time 25 -x 127.0.0.1:7890 -A "$UA" "$api" \
        | C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe -c "
import sys,json
try: d=json.load(sys.stdin)
except: sys.exit(0)
for k,v in (d.get('query',{}).get('pages',{}) or {}).items():
    o=v.get('original') or v.get('thumbnail')
    if o: print(o['source']); break
")
  if [ -z "$url" ]; then echo "  ✗ $1：条目无主图 ($title)"; return 1; fi
  curl -sL --max-time 40 -x 127.0.0.1:7890 -A "$UA" -o "$out" "$url"
  if [ -s "$out" ]; then
    echo "  ✓ $1.jpg  $(du -k "$out" | cut -f1) KB  ← $(basename "$url")"
  else
    echo "  ✗ $1：下载失败 $url"; return 1
  fi
}

echo "=== 音乐人头像 ==="
fetch ar-yorushika  "Hitsujibungaku"
fetch ar-radiohead  "Radiohead"
fetch ar-prince     "Prince (musician)"
fetch ar-wanqing    "Omnipotent Youth Society"
fetch ar-bon-iver   "Bon Iver"
fetch ar-frank-ocean "Frank Ocean"
fetch ar-jay-chou   "Jay Chou"
fetch ar-mbv        "My Bloody Valentine (band)"

echo "=== 专辑封面兜底 ==="
fetch al-loveless   "Loveless (My Bloody Valentine album)"
