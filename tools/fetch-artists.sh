#!/usr/bin/env bash
# 艺人照片 —— Wikipedia pageimages（条目主图通常是人物照）
#   20 位：最近关注的 10 位 + 播放量前十的 10 位
#   中文艺人先试中文维基，再试英文维基；B 站 UP 主（某幻君 / 老番茄 / 王瀚哲）大概率没有条目，
#   失败的最后单独处理。
set -u
DEST="F:/self/网站/.tmp/covers-artists"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

try() { # $1=slug $2=条目 $3=语言
  local slug="$1" title="$2" lang="$3"
  local enc js url
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1].replace(' ','_')))" "$title")
  js=$(curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" \
    "https://$lang.wikipedia.org/api/rest_v1/page/summary/$enc")
  url=$(printf '%s' "$js" | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: raise SystemExit
if d.get('type')=='disambiguation': raise SystemExit
print((d.get('originalimage') or d.get('thumbnail') or {}).get('source',''))
")
  [ -z "$url" ] && return 1
  curl -sL --max-time 60 -x 127.0.0.1:7890 -A "$UA" -o "$DEST/$slug.jpg" "$url"
  if [ -s "$DEST/$slug.jpg" ]; then
    echo "  ✓ $slug.jpg  $(du -k "$DEST/$slug.jpg"|cut -f1) KB  ← [$lang] $title"
    return 0
  fi
  rm -f "$DEST/$slug.jpg"; return 1
}

# slug|英文条目|中文条目
LIST="
ar-zhangfangzhao||张方钊
ar-logic|Logic (rapper)|
ar-songyueting||宋岳庭
ar-future|Future (rapper)|
ar-olivia-rodrigo|Olivia Rodrigo|
ar-don-toliver|Don Toliver|
ar-led-zeppelin|Led Zeppelin|
ar-sade|Sade (band)|
ar-rosalia|Rosalía|
ar-chris-brown|Chris Brown|
ar-mouhuanjun||某幻君
ar-huachenyu|Hua Chenyu|华晨宇
ar-kendrick|Kendrick Lamar|
ar-prince|Prince (musician)|
ar-jcole|J. Cole|
ar-laofanqie||老番茄
ar-theweeknd|The Weeknd|
ar-wanghanzhe||王瀚哲
ar-frankocean|Frank Ocean|
ar-travisscott|Travis Scott|
ar-postmalone|Post Malone|
"

echo "$LIST" | while IFS='|' read -r slug en zh; do
  [ -z "$slug" ] && continue
  ok=0
  [ -n "$zh" ] && { try "$slug" "$zh" zh && ok=1; }
  [ "$ok" = 0 ] && [ -n "$en" ] && { try "$slug" "$en" en && ok=1; }
  [ "$ok" = 0 ] && [ -n "$en" ] && { try "$slug" "$en" zh && ok=1; }
  [ "$ok" = 0 ] && echo "  ✗ $slug：找不到条目"
  sleep 0.4
done
echo done
