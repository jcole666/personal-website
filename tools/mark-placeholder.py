# -*- coding: utf-8 -*-
"""给市集的所有条目打上 placeholder: true（AI 生成的占位内容，待录入真实内容后替换）"""
import re

path = 'src/data/food.js'
src = open(path, encoding='utf-8').read()
if 'placeholder:' in src:
    raise SystemExit('已经有 placeholder 标记了，先确认')

# 条目级 id 缩进 10 空格；摊位级 id 缩进 6 空格 —— 靠缩进区分，只标条目
ID_RE = re.compile(r"^(\s{10})id: '([^']+)',\s*$")

lines = src.split('\n')
out, n = [], 0
for ln in lines:
    out.append(ln)
    m = ID_RE.match(ln)
    if m:
        out.append("%splaceholder: true, // ⚠️ AI 生成的占位内容，等录入真实内容后删掉这一行" % m.group(1))
        n += 1

open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('标记条目数:', n)
