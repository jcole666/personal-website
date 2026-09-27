/* ============================================
   旷野之息 · 海拉鲁全景插画（SVG 背景）
   赛璐璐风 + 黄金时刻 + 远景雪山 + 怨念城堡
   + 死亡之山 + 河流 + 林克背影
   ============================================ */

function HyruleLandscape() {
  return (
    <svg
      className="games-landscape"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        {/* 天空渐变：淡蓝 → 橙黄 → 暖红（黄金时刻） */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f9fd8" />
          <stop offset="35%" stopColor="#a9c3dd" />
          <stop offset="55%" stopColor="#f2d29a" />
          <stop offset="72%" stopColor="#f6b26a" />
          <stop offset="100%" stopColor="#e8955a" />
        </linearGradient>

        {/* 雪山渐变 */}
        <linearGradient id="snowMount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dcd8ec" />
          <stop offset="100%" stopColor="#b8b0d0" />
        </linearGradient>

        {/* 中层山渐变 */}
        <linearGradient id="midMount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b0a8d0" />
          <stop offset="100%" stopColor="#8a80b8" />
        </linearGradient>

        {/* 远丘 */}
        <linearGradient id="farHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a8c488" />
          <stop offset="100%" stopColor="#8fb06a" />
        </linearGradient>

        {/* 中丘 */}
        <linearGradient id="midHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7aa05a" />
          <stop offset="100%" stopColor="#668a46" />
        </linearGradient>

        {/* 近景草坡 */}
        <linearGradient id="nearHill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a8a3a" />
          <stop offset="100%" stopColor="#3a5820" />
        </linearGradient>

        {/* 草坡受光面 */}
        <linearGradient id="hillLight" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,220,150,0)" />
          <stop offset="100%" stopColor="rgba(255,230,170,0.35)" />
        </linearGradient>

        {/* 死亡之山 */}
        <linearGradient id="deathMtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a7060" />
          <stop offset="100%" stopColor="#5a4538" />
        </linearGradient>

        {/* 河流 */}
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(150,195,240,0.55)" />
          <stop offset="100%" stopColor="rgba(120,170,220,0.35)" />
        </linearGradient>

        {/* 城堡怨念 */}
        <radialGradient id="malice" cx="0.5" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="rgba(120,40,180,0.45)" />
          <stop offset="60%" stopColor="rgba(100,30,160,0.2)" />
          <stop offset="100%" stopColor="rgba(100,30,160,0)" />
        </radialGradient>

        {/* 熔岩光 */}
        <radialGradient id="lava" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ffcf70" />
          <stop offset="40%" stopColor="#ff7a2a" />
          <stop offset="100%" stopColor="rgba(255,80,10,0)" />
        </radialGradient>
      </defs>

      {/* ============ 天空 ============ */}
      <rect x="0" y="0" width="1600" height="900" fill="url(#sky)" />

      {/* 太阳 + 光晕（右上） */}
      <circle cx="1220" cy="150" r="140" fill="rgba(255,230,150,0.16)" />
      <circle cx="1220" cy="150" r="80" fill="rgba(255,235,170,0.25)" />
      <circle cx="1220" cy="150" r="46" fill="#fff4c8" />
      <circle cx="1220" cy="150" r="34" fill="#fff9e0" />

      {/* ============ 云（金边） ============ */}
      <g fill="rgba(255,225,185,0.75)">
        <g>
          <ellipse cx="300" cy="130" rx="130" ry="32" />
          <ellipse cx="350" cy="112" rx="70" ry="26" />
          <ellipse cx="240" cy="116" rx="60" ry="24" />
        </g>
        <g>
          <ellipse cx="760" cy="95" rx="100" ry="26" />
          <ellipse cx="800" cy="78" rx="55" ry="20" />
        </g>
        <g>
          <ellipse cx="1030" cy="200" rx="120" ry="28" />
          <ellipse cx="1080" cy="184" rx="60" ry="22" />
        </g>
        <g>
          <ellipse cx="90" cy="280" rx="90" ry="22" />
        </g>
        <g>
          <ellipse cx="1420" cy="320" rx="110" ry="26" />
          <ellipse cx="1460" cy="300" rx="55" ry="20" />
        </g>
      </g>
      {/* 云底金边 */}
      <g fill="none" stroke="rgba(255,190,120,0.5)" strokeWidth="3">
        <path d="M210,150 q50,-8 100,0" />
        <path d="M700,110 q50,-8 100,0" />
        <path d="M960,215 q50,-8 100,0" />
        <path d="M1370,340 q45,-8 90,0" />
      </g>

      {/* ============ 飞鸟 ============ */}
      <g stroke="rgba(60,40,30,0.35)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M420,150 q12,-8 24,0 q12,-8 24,0" />
        <path d="M520,200 q10,-7 20,0 q10,-7 20,0" />
        <path d="M980,140 q11,-7 22,0 q11,-7 22,0" />
        <path d="M640,110 q9,-6 18,0 q9,-6 18,0" />
      </g>

      {/* ============ 最远雪山山脉 ============ */}
      <path
        d="M0,540 L70,360 L140,440 L210,300 L290,410 L360,330 L440,430 L520,360 L590,440 L660,340 L740,420 L810,310 L890,410 L960,350 L1040,430 L1120,380 L1190,450 L1260,330 L1330,420 L1400,360 L1470,440 L1540,390 L1600,460 L1600,540 Z"
        fill="url(#snowMount)"
        opacity="0.9"
      />
      {/* 雪顶高光 */}
      <g fill="rgba(255,255,255,0.75)">
        <path d="M210,300 l25,-55 l25,55 z" />
        <path d="M660,340 l28,-62 l28,62 z" />
        <path d="M810,310 l25,-55 l25,55 z" />
        <path d="M1260,330 l28,-58 l28,58 z" />
      </g>

      {/* ============ 中层山脉 ============ */}
      <path
        d="M0,560 L60,440 L140,500 L230,410 L320,490 L410,440 L500,510 L590,430 L680,500 L770,460 L860,520 L950,440 L1040,510 L1130,470 L1220,530 L1310,450 L1400,510 L1490,460 L1600,520 L1600,900 L0,900 Z"
        fill="url(#midMount)"
        opacity="0.85"
      />

      {/* ============ 海拉鲁城堡（左侧，怨念缠绕） ============ */}
      <g transform="translate(180, 320)">
        {/* 怨念光晕 */}
        <ellipse cx="80" cy="30" rx="180" ry="150" fill="url(#malice)" />
        {/* 塔身 */}
        <rect x="62" y="60" width="36" height="160" fill="#4a3a5a" />
        <rect x="30" y="100" width="24" height="120" fill="#3a2a4a" />
        <rect x="106" y="120" width="24" height="100" fill="#3a2a4a" />
        {/* 尖顶 */}
        <path d="M80,60 l-22,34 h44 z" fill="#5a4a7a" />
        <path d="M42,100 l-14,22 h28 z" fill="#4a3a6a" />
        <path d="M118,120 l-14,22 h28 z" fill="#4a3a6a" />
        {/* 塔顶细节 */}
        <rect x="58" y="56" width="44" height="6" fill="#6a5a8a" />
        {/* 怨念缠绕曲线 */}
        <path d="M10,50 q20,40 0,80 q-20,40 0,80 q20,40 0,80" fill="none" stroke="rgba(150,60,210,0.4)" strokeWidth="8" strokeLinecap="round" />
        <path d="M150,30 q-25,60 0,110 q25,60 0,110" fill="none" stroke="rgba(150,60,210,0.3)" strokeWidth="6" strokeLinecap="round" />
        {/* 怨念光点 */}
        <circle cx="30" cy="90" r="5" fill="rgba(180,90,230,0.6)" />
        <circle cx="130" cy="140" r="4" fill="rgba(180,90,230,0.5)" />
        <circle cx="90" cy="190" r="6" fill="rgba(180,90,230,0.5)" />
      </g>

      {/* ============ 死亡之山（右侧） ============ */}
      <g transform="translate(1180, 250)">
        {/* 山体 */}
        <path d="M0,300 L160,60 L260,180 L320,300 Z" fill="url(#deathMtn)" />
        {/* 山体暗面 */}
        <path d="M160,60 L260,180 L320,300 L180,300 Z" fill="rgba(40,28,20,0.45)" />
        {/* 熔岩流 */}
        <path d="M165,90 L180,160 L150,220 L120,300 L60,300 L130,150 Z" fill="rgba(90,30,15,0.5)" />
        {/* 山顶黑烟 */}
        <ellipse cx="150" cy="50" rx="60" ry="28" fill="rgba(35,20,15,0.55)" />
        <ellipse cx="170" cy="28" rx="45" ry="22" fill="rgba(30,18,12,0.5)" />
        {/* 熔岩微光 */}
        <circle cx="150" cy="62" r="26" fill="url(#lava)" opacity="0.85" />
        <circle cx="150" cy="62" r="10" fill="#ffdf90" />
        <circle cx="150" cy="62" r="5" fill="#fff3c0" />
      </g>

      {/* ============ 远丘 ============ */}
      <path d="M0,570 Q100,520 220,565 T460,560 T700,570 T940,555 T1180,565 T1420,555 L1600,570 L1600,620 L0,620 Z" fill="url(#farHill)" />
      {/* 河流（蜿蜒，反射天光） */}
      <path d="M520,560 Q560,585 540,610 Q510,645 560,670 Q620,700 590,730 Q555,760 600,790 Q660,820 630,860 L670,900 L470,900 Q430,830 490,800 Q560,760 520,720 Q480,685 520,655 Q570,620 500,595 Z" fill="url(#river)" />
      {/* 河流反光 */}
      <g stroke="rgba(255,255,255,0.6)" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M530,575 h30" />
        <path d="M545,620 h28" />
        <path d="M565,665 h26" />
        <path d="M585,700 h24" />
        <path d="M570,740 h22" />
      </g>

      {/* ============ 中丘 ============ */}
      <path d="M0,600 Q80,560 200,600 T420,595 T640,605 T860,590 T1080,600 T1300,590 T1520,600 L1600,600 L1600,660 L0,660 Z" fill="url(#midHill)" />

      {/* ============ 废墟遗迹 ============ */}
      <g fill="#9a8a78" opacity="0.85">
        {/* 断墙1 */}
        <rect x="430" y="615" width="26" height="18" rx="1" />
        <rect x="460" y="608" width="18" height="26" rx="1" fill="#8a7a68" />
        <rect x="424" y="633" width="34" height="8" fill="#8a7a68" />
        {/* 断墙2 */}
        <rect x="920" y="620" width="22" height="14" rx="1" />
        <rect x="946" y="612" width="14" height="22" rx="1" fill="#8a7a68" />
        {/* 石柱 */}
        <rect x="1210" y="615" width="12" height="30" rx="1" fill="#a08a70" />
        <rect x="1204" y="611" width="24" height="6" fill="#a08a70" />
        {/* 倒塌石块 */}
        <path d="M1260,635 l14,-6 l8,12 l-14,6 z" fill="#9a8a78" />
      </g>
      {/* 废墟上的藤蔓 */}
      <g stroke="rgba(90,130,60,0.7)" strokeWidth="2" fill="none">
        <path d="M432,616 q6,6 12,2 q6,-4 10,2" />
        <path d="M948,616 q6,6 12,2" />
      </g>

      {/* ============ 近景草坡 ============ */}
      <path d="M0,640 Q200,600 420,650 T900,640 T1400,650 L1600,640 L1600,900 L0,900 Z" fill="url(#nearHill)" />
      {/* 受光面（右侧阳光） */}
      <path d="M600,640 Q900,600 1300,660 L1600,650 L1600,900 L600,900 Z" fill="url(#hillLight)" opacity="0.5" />
      {/* 草坡上的草丛层次 */}
      <g stroke="rgba(60,90,35,0.5)" strokeWidth="2" fill="none">
        <path d="M150,700 q6,-10 12,-2" />
        <path d="M162,704 q6,-8 12,-1" />
        <path d="M520,720 q7,-12 14,-2" />
        <path d="M900,700 q6,-9 12,-1" />
        <path d="M1050,740 q7,-11 14,-1" />
        <path d="M1200,690 q6,-9 12,-1" />
      </g>
      {/* 野花（小白/小黄点） */}
      <g fill="#fffdf2">
        <circle cx="180" cy="690" r="3" />
        <circle cx="310" cy="720" r="2.5" />
        <circle cx="480" cy="700" r="3" />
        <circle cx="650" cy="730" r="2.5" />
        <circle cx="830" cy="710" r="3" />
        <circle cx="1010" cy="730" r="2.5" />
        <circle cx="1150" cy="700" r="3" />
        <circle cx="1280" cy="740" r="2.5" />
        <circle cx="1380" cy="710" r="3" />
      </g>
      <g fill="#f6d060">
        <circle cx="240" cy="705" r="2.5" />
        <circle cx="560" cy="720" r="2.5" />
        <circle cx="740" cy="700" r="2.5" />
        <circle cx="950" cy="725" r="2.5" />
        <circle cx="1330" cy="715" r="2.5" />
      </g>
      {/* 花心细节 */}
      <g fill="#f6c040">
        <circle cx="180" cy="690" r="1.2" />
        <circle cx="480" cy="700" r="1.2" />
        <circle cx="830" cy="710" r="1.2" />
        <circle cx="1150" cy="700" r="1.2" />
      </g>

      {/* ============ 悬崖边岩石 ============ */}
      <g>
        <path d="M60,650 Q90,625 120,655 Q140,670 130,700 L60,700 Z" fill="#9c8c7c" />
        <path d="M70,652 Q92,634 116,658 Q130,672 122,696 L72,696 Z" fill="#b8a898" />
        <path d="M1500,660 Q1520,640 1550,660 Q1565,675 1555,700 L1500,700 Z" fill="#9c8c7c" />
        <path d="M1508,662 Q1522,646 1544,662 Q1555,674 1549,694 L1510,694 Z" fill="#b8a898" />
      </g>

      {/* ============ 林克 · 背影（近景中央偏右） ============ */}
      <g transform="translate(800, 618)">
        {/* 脚下阴影 */}
        <ellipse cx="0" cy="118" rx="66" ry="14" fill="rgba(30,50,20,0.3)" />
        {/* 靴子 */}
        <path d="M-24,102 h13 v16 h-17 a2,2 0 0 0 2,-2 z" fill="#4a3620" />
        <path d="M11,102 h13 v16 h-17 a2,2 0 0 0 2,-2 z" fill="#4a3620" />
        {/* 棕色长裤 */}
        <path d="M-25,74 q4,-4 11,-2 v30 h-17 z" fill="#8a6a3a" />
        <path d="M14,72 q4,2 11,2 v30 h-17 z" fill="#8a6a3a" />
        {/* 剑（斜背在背上） */}
        <g transform="rotate(-32, 6, 8)">
          <rect x="-4" y="-8" width="9" height="74" rx="2.5" fill="#9aa0a8" />
          <path d="M0,66 l-3,5 l6,0 z" fill="#8a90a0" />
          <rect x="-6.5" y="-14" width="13" height="8" rx="2" fill="#6b4a22" />
          <circle cx="0" cy="-17" r="3" fill="#c8a840" />
        </g>
        {/* 盾（背后右侧） */}
        <ellipse cx="22" cy="34" rx="15" ry="24" fill="#3a5a8a" />
        <ellipse cx="22" cy="34" rx="11" ry="18" fill="none" stroke="#8aa0c8" strokeWidth="2.5" />
        <path d="M22,20 l4,9 l-8,0 z" fill="#8aa0c8" />
        <path d="M16,48 q6,5 12,0" fill="none" stroke="#8aa0c8" strokeWidth="2.5" />
        {/* 手臂 */}
        <path d="M-30,12 q-14,10 -12,30 l7,2 q-3,-18 9,-30 z" fill="#3f7a28" />
        <path d="M30,12 q14,10 12,30 l-7,2 q3,-18 -9,-30 z" fill="#3f7a28" />
        {/* 手 */}
        <ellipse cx="-40" cy="46" rx="5" ry="7" fill="#e8b88a" />
        <ellipse cx="40" cy="46" rx="5" ry="7" fill="#e8b88a" />
        {/* 绿色束腰外衣（身体） */}
        <path d="M-31,8 q0,-16 9,-22 h44 q9,6 9,22 l5,58 q-33,8 -67,0 z" fill="#4a8a2f" />
        {/* 外衣高光 */}
        <path d="M2,4 q8,-4 16,0 l4,50 q-12,4 -24,0 z" fill="rgba(160,220,110,0.2)" />
        {/* 腰带 */}
        <path d="M-33,58 q34,7 69,0 l3,9 q-36,7 -72,0 z" fill="#6b4a22" />
        {/* 腰带扣 */}
        <rect x="-7" y="58" width="14" height="11" rx="2" fill="#c8a840" />
        {/* 金发后脑 */}
        <path d="M-15,-22 q0,-19 15,-19 q15,0 15,19 q-3,11 -15,11 q-12,0 -15,-11 z" fill="#e8b820" />
        {/* 头 */}
        <ellipse cx="0" cy="-20" rx="14" ry="16" fill="#e8b88a" />
        {/* 头发两侧（露出耳朵旁） */}
        <path d="M-15,-18 q-4,6 -2,12 l4,2 z" fill="#d8a818" />
        <path d="M15,-18 q4,6 2,12 l-4,2 z" fill="#d8a818" />
        {/* 绿色尖顶帽 */}
        <path d="M-17,-26 q-2,-16 17,-18 q8,26 2,44 q-19,-2 -19,-26 z" fill="#4a8a2f" />
        {/* 帽檐折边 */}
        <path d="M-19,-26 q19,-4 38,0 l-2,7 q-17,-3 -34,0 z" fill="#3f7a28" />
      </g>
    </svg>
  )
}

export default HyruleLandscape
