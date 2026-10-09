#!/usr/bin/env bash
# 抓取电影元数据（豆瓣）—— 走代理，直连会被限流返回 []
# 用法：bash tools/fetch-movies.sh
set -u
cd "$(dirname "$0")/.."
OUT=".tmp/movies-raw"
mkdir -p "$OUT"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
PROXY='127.0.0.1:7890'

# 序号|片名|年份
LIST='01|奥德赛|2026
02|给阿嬷的情书|2026
03|飞驰人生3|2026
04|爱情三选一|2008
05|诺丁山|1999
06|当哈利遇到莎莉|1989
07|机器人之梦|2023
08|死亡诗社|1989
09|盗梦空间|2010
10|奥本海默|2023
11|超脱|2011
12|蜘蛛侠：纵横宇宙|2023
13|肖申克的救赎|1994
14|情书|1995
15|海蒂和爷爷|2015
16|海上钢琴师|1998
17|大话西游之大圣娶亲|1995'

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
ls -1 "$OUT" | wc -l
