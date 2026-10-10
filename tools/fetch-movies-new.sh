#!/usr/bin/env bash
# 抓取电影页 8 部新片（基于用户的票务订单截图）
# 走代理 127.0.0.1:7890（直连被限流返回 []）
# 用法：bash tools/fetch-movies-new.sh
set -u
cd "$(dirname "$0")/.."
OUT=".tmp/movies-raw"
mkdir -p "$OUT"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
PROXY='127.0.0.1:7890'

# 序号|片名|年份（年份用 0 表示"按 suggest 第一个匹配"）
LIST='18|超级马力欧银河大电影|2026
19|迈克尔·杰克逊：巨星之路|2026
20|疯狂动物城2|2025
21|鬼灭之刃：无限城篇|2025
22|哪吒之魔童闹海|2025
23|唐探1900|2025
24|魔法坏女巫|2024
25|异形：夺命舰|2024'

echo "$LIST" | while IFS='|' read -r idx title year; do
  [ -z "$idx" ] && continue
  sug="$OUT/$idx-suggest.json"
  if [ ! -s "$sug" ] || [ "$(head -c 2 "$sug")" = "[]" ]; then
    curl -s --max-time 30 -x "$PROXY" -G --data-urlencode "q=$title" \
      -H "User-Agent: $UA" "https://movie.douban.com/j/subject_suggest" -o "$sug"
    sleep 2
  fi
  # 取出匹配年份的 id
  id=$(C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe -c "
import json,sys
try: d=json.load(open(r'$sug',encoding='utf-8'))
except Exception: sys.exit(0)
if not isinstance(d,list) or not d: sys.exit(0)
ex=[x for x in d if str(x.get('year'))=='$year']
print((ex[0] if ex else d[0]).get('id',''))
" 2>/dev/null)
  if [ -z "$id" ]; then echo "✗ $idx $title：suggest 拿不到 id"; continue; fi
  det="$OUT/$idx-detail.json"
  if [ ! -s "$det" ]; then
    curl -s --max-time 30 -x "$PROXY" \
      -H "User-Agent: $UA" -H "Referer: https://m.douban.com/movie/subject/$id/" \
      "https://m.douban.com/rexxar/api/v2/movie/$id" -o "$det"
    sleep 2
  fi
  echo "✓ $idx $title → id=$id"
done
echo "--- 完成 ---"
ls -1 "$OUT" | grep -E '^(1[89]|2[0-5])-' | wc -l
