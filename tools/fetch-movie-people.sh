#!/usr/bin/env bash
# 电影页「关注人物」头像 —— Wikipedia pageimages（条目主图通常是人物照）
# 音乐人头像用同样方法成功了 7/8，这里沿用。
set -u
DEST="F:/self/网站/.tmp/covers-movies"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

person() { # $1=输出名 $2=条目  $3=语言
  local out="$DEST/$1.jpg" title="$2" lang="${3:-en}"
  local enc
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1].replace(' ','_')))" "$title")
  local js
  js=$(curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" \
    "https://$lang.wikipedia.org/api/rest_v1/page/summary/$enc")
  local url
  url=$(printf '%s' "$js" | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
print((d.get('originalimage') or d.get('thumbnail') or {}).get('source',''))
")
  if [ -z "$url" ]; then echo "  ✗ $1：无主图（$title）"; return 1; fi
  curl -sL --max-time 60 -x 127.0.0.1:7890 -A "$UA" -o "$out" "$url"
  if [ -s "$out" ]; then echo "  ✓ $1.jpg  $(du -k "$out"|cut -f1) KB  ← $(basename "$url" | cut -c1-46)"
  else echo "  ✗ $1：下载失败"; rm -f "$out"; return 1; fi
}

echo "=== 关注人物 ==="
person p-koreeda       "Hirokazu Kore-eda"
person p-hamaguchi     "Ryusuke Hamaguchi"
person p-sakura-ando   "Sakura Ando"
person p-wong-kar-wai  "Wong Kar-wai"
person p-miyazaki      "Hayao Miyazaki"
person p-nolan         "Christopher Nolan"
