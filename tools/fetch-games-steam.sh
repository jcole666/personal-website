#!/usr/bin/env bash
# Steam 封面 v2 —— appid 写死（商店搜索的模糊匹配会挑错，
# 比如 "Cyberpunk 2077" 会命中 "Cyberpunk 2077 REDmod" 这个 mod 工具）。
# 每个 id 都先过一遍 appdetails 接口核对名字，核对通过才下载封面。
set -u
DEST="F:/self/网站/.tmp/covers-games2"
mkdir -p "$DEST"
UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'
PY='C:/Users/Leneve/.workbuddy-ai/binaries/python/envs/default/Scripts/python.exe'

# slug|appid
LIST="
cyberpunk-2077|1091500
chinese-parents|736190
split-fiction|2001120
it-takes-two|1426210
wallpaper-engine|431960
black-myth-wukong|2358720
celeste|504230
stardew-valley|413150
fall-guys|1097150
rainbow-six-siege|359550
super-bunny-man|673750
witch-it|559590
gujian3|994280
civilization-6|289070
cs2|730
hitman-2|863550
detroit|1222140
dont-starve|219740
dont-starve-together|322330
rdr2|1174180
ultimate-chicken-horse|386940
dave-the-diver|1868140
overcooked-2|728880
nfs-hot-pursuit|1262560
"

echo "$LIST" | while IFS='|' read -r slug appid; do
  [ -z "$slug" ] && continue
  # 核对名字
  nm=$(curl -s --max-time 25 -x 127.0.0.1:7890 -A "$UA" \
    "https://store.steampowered.com/api/appdetails?appids=$appid&l=schinese" \
  | "$PY" -c "
import sys,json
try: d=json.load(sys.stdin)
except Exception: sys.exit(0)
k=list(d.keys())[0]
if d[k].get('success'): print(d[k]['data'].get('name',''))
")
  [ -z "$nm" ] && { echo "  ? $slug (app $appid) 核对失败"; continue; }
  curl -sL --max-time 45 -x 127.0.0.1:7890 -A "$UA" -o "$DEST/$slug.jpg" \
    "https://cdn.cloudflare.steamstatic.com/steam/apps/$appid/library_600x900.jpg"
  if [ -s "$DEST/$slug.jpg" ]; then
    echo "  ✓ $slug.jpg  $(du -k "$DEST/$slug.jpg"|cut -f1) KB  ← $nm (app $appid)"
  else
    echo "  ✗ $slug：封面失败 ($nm)"; rm -f "$DEST/$slug.jpg"
  fi
  sleep 0.5
done
echo "done"
