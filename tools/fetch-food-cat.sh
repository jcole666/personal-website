#!/usr/bin/env bash
# 市集照片 v2 —— 改用 Commons「分类」而不是自由文本搜索
#
# 教训：自由文本搜索会把「生椰拿铁」匹配成「蔓越莓面包配拿铁」，
#       把「泰式柠檬红茶」匹配成「某餐厅的晚餐」。分类是人工维护的，
#       命中率与准确率都高得多。
set -u
DEST="F:/self/网站/.tmp/covers-food"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

# 从分类里挑一张：优先横图、分辨率够、排除 svg/map/logo
pick_from_cat() { # $1=Category名
  local cat="$1"
  local enc
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "Category:$cat")
  curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" \
    "https://commons.wikimedia.org/w/api.php?action=query&generator=categorymembers&gcmtitle=$enc&gcmtype=file&gcmlimit=40&prop=imageinfo&iiprop=url%7Csize&iiurlwidth=1000&format=json" \
  | "$PY" -c "
import sys,json,re
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
rows=[]
for k,v in (d.get('query',{}).get('pages',{}) or {}).items():
    ii=v.get('imageinfo')
    if not ii: continue
    i=ii[0]; t=v['title']
    if not re.search(r'\.(jpg|jpeg|png)$', t, re.I): continue
    if re.search(r'logo|map|icon|chart|diagram|sign|poster|svg|drawing|illustration|coat of arms|flag|menu', t, re.I): continue
    w,h=i.get('width',0),i.get('height',0)
    if w<700 or h<500: continue
    ar=w/h
    if ar<0.65 or ar>2.2: continue
    rows.append((-abs(ar-1.4), i.get('thumburl') or i.get('url')))
rows.sort()
if rows: print(rows[0][1])
"
}

grab_cat() { # $1=输出名 $2=Category  [$3=备用搜索词]
  local out="$DEST/$1.jpg" url
  url=$(pick_from_cat "$2")
  if [ -z "$url" ] && [ -n "${3:-}" ]; then url=$(pick_from_cat "$3"); fi
  if [ -z "$url" ]; then echo "  ✗ $1：分类 $2 无可用图"; return 1; fi
  curl -sL --max-time 60 -x 127.0.0.1:7890 -A "$UA" -o "$out" "$url"
  if [ -s "$out" ]; then echo "  ✓ $1.jpg  $(du -k "$out"|cut -f1) KB  ← $(basename "$url" | cut -c1-46)"
  else echo "  ✗ $1：下载失败"; rm -f "$out"; return 1; fi
}

echo "=== 饮品部 ==="
grab_cat d-1 "Bubble tea"
grab_cat d-2 "Iced coffee" "Latte"
grab_cat d-3 "Iced tea"
grab_cat d-4 "Smoothies" "Mango juice"
grab_cat d-5 "Latte" "Coffee with milk"
grab_cat d-6 "Thai tea" "Iced tea with lemon"

echo "=== 主食部 ==="
grab_cat m-1 "Lanzhou beef noodles" "Beef noodle soup"
grab_cat m-2 "Unadon" "Unagi"
grab_cat m-3 "Spaghetti bolognese" "Spaghetti"
grab_cat m-4 "Shuizhuyu" "Sichuan cuisine"
grab_cat m-5 "Luosifen" "Rice noodles"
grab_cat m-6 "Char siu" "Char siu rice"

echo "=== 小吃部 ==="
grab_cat s-1 "Beef balls" "Meatballs"
grab_cat s-2 "Grilled squid" "Squid as food"
grab_cat s-3 "Bingfen" "Grass jelly"
grab_cat s-4 "Jianbing"
grab_cat s-5 "Kaolengmian" "Grilled noodles"
grab_cat s-6 "Daifuku" "Mochi"

echo "=== 甜品部 ==="
grab_cat t-1 "Tiramisu"
grab_cat t-2 "Double skin milk" "Milk desserts"
grab_cat t-3 "Matcha cakes" "Mille crepe"
grab_cat t-4 "Ginger milk curd" "Milk curd"
grab_cat t-5 "Soufflés" "Pancakes"
grab_cat t-6 "Mango pomelo sago" "Sago desserts"

echo "=== 购物部 ==="
grab_cat sh-1 "Mechanical keyboards" "Computer keyboards"
grab_cat sh-2 "Tote bags" "Canvas bags"
grab_cat sh-3 "Cold brew coffee" "Coffee makers"
grab_cat sh-5 "Night lamps" "Mushroom lamps"
grab_cat sh-6 "Plaid shirts" "Flannel shirts"
grab_cat sh-7 "Scented candles" "Candles"
grab_cat sh-8 "Coffee drippers" "Pour-over coffee"
