#!/usr/bin/env bash
# Switch 独占游戏封面 —— Wikipedia 条目内的封面文件（fair-use）。
#   pageimages 对游戏条目常常拿不到封面（被 fair-use 抑制），
#   所以改用 prop=images 列出条目内所有文件，按文件名挑出封面。
# 必须走代理。
set -u
DEST="F:/self/网站/.tmp/covers-games2"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

# slug|维基条目|语言|文件名里应包含（正则）
LIST="
totk|The Legend of Zelda: Tears of the Kingdom|en|tears of the kingdom
botw|The Legend of Zelda: Breath of the Wild|en|breath of the wild
splatoon-3|Splatoon 3|en|splatoon 3
ring-fit|Ring Fit Adventure|en|ring fit
animal-crossing|Animal Crossing: New Horizons|en|new horizons
nsmbu|New Super Mario Bros. U|en|new super mario bros
super-mario-party|Super Mario Party|en|super mario party
smash-ultimate|Super Smash Bros. Ultimate|en|smash bros
mario-kart-8|Mario Kart 8|en|mario kart 8
clubhouse-51|Clubhouse Games: 51 Worldwide Classics|en|clubhouse
pokemon-arceus|Pokémon Legends: Arceus|en|arceus
mario-odyssey|Super Mario Odyssey|en|odyssey
crayon-shinchan|クレヨンしんちゃん 炭の町のシロ|ja|炭の町
pixel-cafe|Pixel Cafe|en|pixel
"

echo "$LIST" | while IFS='|' read -r slug title lang must; do
  [ -z "$slug" ] && continue
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$title")
  file=$(curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" \
    "https://$lang.wikipedia.org/w/api.php?action=query&prop=images&format=json&redirects=1&imlimit=80&titles=$enc" \
  | "$PY" -c "
import sys,json,re
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
must=re.compile(r'''$must''', re.I)
bad=re.compile(r'icon|logo|svg|flag|wiki|edit-|star|folder|question|ambox|padlock|sound|\.ogg|screenshot|gameplay|artwork|concept', re.I)
cands=[]
for k,v in (d.get('query',{}).get('pages',{}) or {}).items():
    for im in v.get('images',[]) or []:
        t=im['title']
        if not re.search(r'\.(jpg|jpeg|png)\$', t, re.I): continue
        if bad.search(t): continue
        score = 2 if must.search(t) else 0
        if re.search(r'box|cover|packshot|front', t, re.I): score += 3
        if score: cands.append((score, t))
cands.sort(reverse=True)
print(cands[0][1] if cands else '')
")
  if [ -z "$file" ]; then echo "  ✗ $slug：条目里找不到封面（$title）"; continue; fi
  encf=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$file")
  url=$(curl -s --max-time 30 -x 127.0.0.1:7890 -A "$UA" \
    "https://$lang.wikipedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=600&format=json&titles=$encf" \
  | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
for k,v in d.get('query',{}).get('pages',{}).items():
    ii=v.get('imageinfo')
    if ii: print(ii[0].get('thumburl') or ii[0]['url'])
")
  [ -z "$url" ] && { echo "  ✗ $slug：拿不到图片 URL（$file）"; continue; }
  curl -sL --max-time 60 -x 127.0.0.1:7890 -A "$UA" -o "$DEST/$slug.jpg" "$url"
  if [ -s "$DEST/$slug.jpg" ]; then
    echo "  ✓ $slug.jpg  $(du -k "$DEST/$slug.jpg"|cut -f1) KB  ← $file"
  else
    echo "  ✗ $slug：下载失败"; rm -f "$DEST/$slug.jpg"
  fi
  sleep 1
done
echo "done"
