#!/usr/bin/env bash
# 下载电影海报（豆瓣图床，直连可用）→ .tmp/movies-posters/
set -u
cd "$(dirname "$0")/.."
OUT=".tmp/movies-posters"
mkdir -p "$OUT"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

$PY - <<'PYEOF' > /tmp/mv-urls.txt
import json, glob, os, re
for f in sorted(glob.glob(r'F:/self/网站/.tmp/movies-raw/*-detail.json')):
    idx = os.path.basename(f)[:2]
    try:
        d = json.load(open(f, encoding='utf-8'))
    except Exception:
        continue
    u = (d.get('pic') or {}).get('large') or ''
    u = re.sub(r'/[sml]_ratio_poster/', '/l_ratio_poster/', u)
    if u:
        print(f"{idx}|{u}")
PYEOF

while IFS='|' read -r idx url; do
  [ -z "$idx" ] && continue
  f="$OUT/mv-$idx.jpg"
  if [ -s "$f" ]; then echo "· $idx 已有"; continue; fi
  code=$(curl -s --max-time 40 -o "$f" -w "%{http_code}" -H "User-Agent: $UA" -H "Referer: https://movie.douban.com/" "$url")
  size=$(stat -c%s "$f" 2>/dev/null || echo 0)
  echo "$idx http=$code size=$size"
  sleep 1
done < /tmp/mv-urls.txt
echo "--- 下载完成 ---"
ls -1 "$OUT" | wc -l
