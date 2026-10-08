#!/usr/bin/env bash
# 补抓歌曲封面（走代理，iTunes 直连已被 403）
#   只处理 songs-cover-map.json 里仍然为 null 的歌
set -u
ROOT="F:/self/网站"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

# 生成待办清单：title \t artist
"$PY" - <<'PYEOF'
import json
root=r'F:/self/网站'
songs=json.load(open(root+'/.tmp/songs.json',encoding='utf-8'))
m=json.load(open(root+'/.tmp/songs-cover-map.json',encoding='utf-8'))
out=[]
for s in songs:
    main=(s.get('a') or '').split('/')[0].strip()
    if not m.get(f"{s['t']}|||{main}"):
        out.append(s['t']+'\t'+main)
open(root+'/.tmp/todo-songs.txt','w',encoding='utf-8').write('\n'.join(out))
print('待办',len(out))
PYEOF

while IFS=$'\t' read -r title artist; do
  [ -z "$title" ] && continue
  q="$artist $title"
  enc=$("$PY" -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$q")
  got=""
  for cc in US CN TW; do
    js=$(curl -s --max-time 25 -x 127.0.0.1:7890 -A "$UA" \
      "https://itunes.apple.com/search?term=$enc&entity=song&limit=8&country=$cc")
    res=$(printf '%s' "$js" | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: raise SystemExit
rs=[r for r in d.get('results',[]) if r.get('artworkUrl100')]
if not rs: raise SystemExit
r=rs[0]
print(r['artworkUrl100'].replace('100x100bb','600x600bb') + chr(9) + (r.get('collectionName') or r.get('trackName','')) + chr(9) + r.get('artistName',''))
")
    if [ -n "$res" ]; then got="$res"; break; fi
    sleep 0.3
  done
  if [ -z "$got" ]; then echo "  ✗ $artist - $title"; sleep 0.4; continue; fi
  art=$(printf '%s' "$got" | cut -f1)
  album=$(printf '%s' "$got" | cut -f2)
  aname=$(printf '%s' "$got" | cut -f3)
  fname=$("$PY" -c "
import re,sys,hashlib
s=(sys.argv[1]+'-'+sys.argv[2]).lower()
s=re.sub(r'[^a-z0-9\u4e00-\u9fff]','',s)[:40] or 'x'
print('s-'+s)
" "$album" "$aname")
  curl -sL --max-time 40 -x 127.0.0.1:7890 -A "$UA" -o "$ROOT/.tmp/covers-songs/$fname.jpg" "$art"
  if [ -s "$ROOT/.tmp/covers-songs/$fname.jpg" ]; then
    "$PY" -c "
import json,sys
root=r'F:/self/网站'
p=root+'/.tmp/songs-cover-map.json'
m=json.load(open(p,encoding='utf-8'))
m[sys.argv[1]]={'cover':'/music/'+sys.argv[2]+'.jpg','album':sys.argv[3],'artist':sys.argv[4]}
json.dump(m,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
" "$title|||$artist" "$fname" "$album" "$aname"
    echo "  ✓ $artist - $title"
  else
    echo "  ✗ $artist - $title (下载失败)"
  fi
  sleep 0.35
done < "$ROOT/.tmp/todo-songs.txt"
echo done
