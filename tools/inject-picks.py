# -*- coding: utf-8 -*-
"""把「流前精选」的推荐理由写进 src/data/food.js（按条目 id 匹配）"""
import re

PICKS = {
    'd-1': '回购四次。波波是黑糖珍珠但不过甜，嚼劲刚好；少糖最正，全糖会腻。',
    'd-3': '柠檬是手打的、不是勾兑汁，茶底比普通柠檬茶多一层花香。夏天喝比奶茶舒服。',
    'd-6': '茶底用的是潮汕单丛，跟路边奶茶店的茶精是两个世界。15 块钱能喝一下午。',
    'm-1': '牛肉给得比食堂大方三倍，汤是牛骨熬的，喝完不口渴。月底穷学生的救赎。',
    'm-4': '鱼片嫩到夹起来会抖，辣度像是专门给广东人调的。底下豆芽拌饭比鱼还好吃。',
    'm-6': '开了快二十年的老店：叉烧自己烤、滑蛋刚凝固。简单的东西做到让人「还想再来」。',
    's-1': '手打的，咬开有蜂窝孔，筷子戳下去会顶回来。12 块 8 个，分量实在。',
    's-3': '手搓的口感「弹中带软」，粉冲的是「弹中带硬」。夏天晚上来一碗比冰棍满足。',
    's-5': '两面煎到微焦，甜辣酱加芝麻酱。后街最受欢迎、九点还在排队的那一家。',
    't-1': '手指饼干浸得湿润但没塌，马斯卡彭打得极细，可可粉是现筛的。',
    't-2': '奶皮厚到舀起来会颤，甜度比别家低、吃得到牛奶本味。东门开了快四十年的那家。',
    't-6': '西柚粒是现剥的不是罐头，咬破那点酸刚好解椰奶的腻。',
    'sh-1': '青轴噼里啪啦，治写代码的困。铝合金边框压手，放桌上纹丝不动。',
    'sh-3': '前一晚丢冰箱，第二天倒出来就是丝滑冷萃，不苦不涩，比热冲加冰块好喝一万倍。',
    'sh-4': '两个穷得叮当响的年轻人，做艺术、相爱、分开、继续做艺术。看完会去听 Horses。',
    'sh-8': '螺旋纹让水流均匀铺开，萃出来比法压干净。值那每天早上磨豆注水的五分钟。',
}

ID_RE = re.compile(r"^\s*id: '([^']+)',\s*$")
RATING_RE = re.compile(r"^\s*rating:\s*[\d.]+,?\s*$")

path = 'src/data/food.js'
src = open(path, encoding='utf-8').read()
assert 'pick:' not in src, '文件里已经有 pick: 字段了'

lines = src.split('\n')
out = []
cur = None
added = []
for ln in lines:
    out.append(ln)
    m = ID_RE.match(ln)
    if m:
        cur = m.group(1)
        continue
    if cur in PICKS and RATING_RE.match(ln):
        indent = ln[:len(ln) - len(ln.lstrip())]
        out.append("%spick: '%s'," % (indent, PICKS[cur]))
        added.append(cur)
        cur = None

print('匹配到 id 行:', sum(1 for l in lines if ID_RE.match(l)))
print('注入:', len(added), added)
open(path, 'w', encoding='utf-8').write('\n'.join(out))
