/* ============================================================
   岁时记 · 传统黄历（Next.js 版）
   第 2 部分：水墨背景画（程序绘制，隔日自动更换）
   （原 script.js 第 2 部分）
============================================================ */

/* 六幅程序绘制的水墨画，按「隔日」轮换：第 1、2 天第一幅，第 3、4 天第二幅……
   以今日是今年的第几天除以 2 取整，再对幅数取余 */

const PAINT_DEFS = `
  <linearGradient id="gSkyWarm" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#faf5e8"/>
    <stop offset="1" stop-color="#efe6cf"/>
  </linearGradient>
  <radialGradient id="gSun">
    <stop offset="0" stop-color="#d29a72" stop-opacity="0.95"/>
    <stop offset="0.55" stop-color="#d29a72" stop-opacity="0.4"/>
    <stop offset="1" stop-color="#d29a72" stop-opacity="0"/>
  </radialGradient>
  <filter id="fRough" x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04 0.14" numOctaves="2" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="7"/>
  </filter>
  <filter id="fBlurL" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="fBlurM" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="7"/></filter>
  <filter id="fBlurS" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.5"/></filter>
`;

function paintSvg(inner) {
  return `<svg class="paint" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${PAINT_DEFS}</defs>${inner}</svg>`;
}

/* 梅花一朵 */
function plumFlower(x, y, s, o) {
  let g = `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">`;
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    g += `<circle cx="${(Math.cos(a) * 8).toFixed(1)}" cy="${(Math.sin(a) * 8).toFixed(1)}" r="6.5" fill="#b0442e"/>`;
  }
  g += `<circle r="3.4" fill="#7a5a2e"/></g>`;
  return g;
}

/* 竹叶一片 */
function bambooLeaf(x, y, rot, s, o) {
  return `<path d="M0 0 C ${16 * s} ${-13 * s} ${34 * s} ${-12 * s} ${46 * s} ${-3 * s} C ${30 * s} ${6 * s} ${14 * s} ${8 * s} 0 0 Z" transform="translate(${x} ${y}) rotate(${rot})" fill="#3a4330" opacity="${o}"/>`;
}

/* 飞鸟 */
function bird(x, y, s, o) {
  return `<path d="M${x} ${y} q ${13 * s} ${-15 * s} ${26 * s} 0 q ${13 * s} ${-15 * s} ${26 * s} 0" stroke="#45423a" fill="none" stroke-width="${3 * s}" stroke-linecap="round" opacity="${o}"/>`;
}

/* 1. 远山叠翠 */
function paintYuanShan() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <circle cx="1170" cy="235" r="95" fill="url(#gSun)"/>
    <g fill="#47443a">
      <path d="M-40 560 Q180 380 400 470 T820 440 T1240 470 T1680 420 L1680 900 L-40 900 Z" opacity="0.13" filter="url(#fBlurL)"/>
      <path d="M-40 640 Q220 470 520 560 T1020 520 T1680 570 L1680 900 L-40 900 Z" opacity="0.2" filter="url(#fBlurM)"/>
    </g>
    <g fill="#3c3931">
      <path d="M-40 760 Q260 590 600 690 T1200 640 T1680 700 L1680 900 L-40 900 Z" opacity="0.36" filter="url(#fBlurS)"/>
      <path d="M-40 830 Q300 700 700 780 T1680 760 L1680 900 L-40 900 Z" opacity="0.46"/>
    </g>
    <g filter="url(#fBlurL)">
      <rect x="120" y="590" width="820" height="120" fill="#f7f1e2" opacity="0.6"/>
      <rect x="880" y="640" width="700" height="110" fill="#f7f1e2" opacity="0.52"/>
    </g>
    <g stroke="#3f3b33" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M1430 900 C1430 800 1418 730 1390 640" stroke-width="11" opacity="0.85"/>
      <path d="M1405 710 C1360 690 1330 672 1295 645" stroke-width="5" opacity="0.7"/>
      <path d="M1400 760 C1350 740 1315 715 1290 685" stroke-width="4" opacity="0.6"/>
      <g stroke-width="3" opacity="0.75">
        <path d="M1295 645 q-16 -14 -6 -30 M1295 645 q-4 -20 12 -28 M1295 645 q8 -18 26 -18 M1295 645 q20 -10 30 4 M1295 645 q26 -2 30 12"/>
        <path d="M1290 685 q-16 -12 -8 -28 M1290 685 q-2 -18 14 -26 M1290 685 q10 -16 26 -14 M1290 685 q20 -8 28 6 M1290 685 q24 2 28 14"/>
      </g>
      <path d="M1395 860 C1345 845 1300 830 1260 800" stroke-width="3.5" opacity="0.55"/>
    </g>
    ${bird(330, 190, 1, 0.8)}
    ${bird(430, 140, 0.75, 0.7)}
    ${bird(520, 240, 0.65, 0.65)}
  `);
}

/* 2. 寒梅映月 */
function paintHanMei() {
  const flowers = [
    [640, 420, 1.15, 0.9], [700, 300, 1, 0.85], [740, 360, 0.8, 0.8], [560, 470, 1, 0.85],
    [460, 540, 0.85, 0.8], [400, 590, 0.7, 0.75], [330, 630, 0.6, 0.7], [260, 665, 0.5, 0.65],
    [620, 350, 0.6, 0.7], [520, 410, 0.55, 0.65],
  ];
  const buds = [[680, 260], [760, 320], [490, 520], [370, 610], [300, 655]];
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fBlurL)"><circle cx="1150" cy="215" r="150" fill="#efe6cf" opacity="0.5"/></g>
    <circle cx="1150" cy="215" r="105" fill="#f2e9d3"/>
    <circle cx="1120" cy="195" r="10" fill="#e3d7ba" opacity="0.7"/>
    <circle cx="1180" cy="240" r="7" fill="#e3d7ba" opacity="0.6"/>
    <g stroke="#2f2b25" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M-30 800 C260 770 400 660 530 540 C590 486 650 430 710 335" stroke-width="17" opacity="0.88"/>
      <path d="M350 660 C420 620 470 590 530 560" stroke-width="6" opacity="0.72"/>
      <path d="M430 625 C500 640 570 650 650 638" stroke-width="5" opacity="0.66"/>
      <path d="M550 505 C630 490 700 495 770 525" stroke-width="4" opacity="0.6"/>
      <path d="M600 450 C640 415 660 385 668 352" stroke-width="4" opacity="0.6"/>
    </g>
    ${flowers.map((f) => plumFlower(...f)).join('')}
    ${buds.map((b) => `<circle cx="${b[0]}" cy="${b[1]}" r="5" fill="#a63a2a" opacity="0.8"/>`).join('')}
    <g fill="#4a463d" opacity="0.5">
      <circle cx="1470" cy="820" r="3"/><circle cx="1492" cy="808" r="2.5"/><circle cx="1452" cy="800" r="2"/>
    </g>
  `);
}

/* 3. 竹影清风 */
function paintZhuYing() {
  let g = '';
  const stalks = [
    [150, 10, 760, 0.75], [260, 13, 860, 0.6], [420, 8, 700, 0.8], [560, 12, 820, 0.55],
    [690, 6, 620, 0.7], [880, 10, 760, 0.5], [1240, 8, 680, 0.65], [1420, 12, 800, 0.5],
  ];
  for (const [x, w, h, o] of stalks) {
    const topX = x + (x % 23) - 8;
    g += `<path d="M${x} 920 C ${x - 16} ${920 - h * 0.45} ${x + 18} ${920 - h * 0.72} ${topX} ${920 - h}" stroke="#39422f" stroke-width="${w}" fill="none" opacity="${o}" stroke-linecap="round"/>`;
    for (let i = 1; i < Math.floor(h / 130); i++) {
      const yy = 920 - i * 130 - ((i * i) % 18);
      g += `<path d="M${x - 2 - w * 0.55} ${yy} q ${w * 0.55 + 2} 3 ${(w * 1.1 + 4)} 0" stroke="#2f3626" stroke-width="3" fill="none" opacity="${Math.min(1, o + 0.15)}"/>`;
      if (i % 2 === 1) {
        g += bambooLeaf(x - w * 0.5, yy - 8, -35, 0.9, o)
          + bambooLeaf(x - w * 0.5, yy - 20, -70, 0.7, o)
          + bambooLeaf(x + w * 0.5, yy - 4, 145, 0.9, o)
          + bambooLeaf(x + w * 0.5, yy - 16, 110, 0.7, o);
      }
    }
  }
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fRough)">${g}</g>
    <ellipse cx="1040" cy="905" rx="260" ry="55" fill="#4a453c" opacity="0.4" filter="url(#fBlurS)"/>
    <ellipse cx="1040" cy="895" rx="210" ry="40" fill="#4a453c" opacity="0.5"/>
    ${bird(330, 160, 0.85, 0.6)}
  `);
}

/* 4. 孤舟蓑笠 */
function paintGuZhou() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g fill="#49463c">
      <path d="M-40 430 Q300 250 640 400 T1240 380 T1680 340 L1680 900 L-40 900 Z" opacity="0.12" filter="url(#fBlurL)"/>
      <path d="M-40 520 Q360 360 760 480 T1680 460 L1680 900 L-40 900 Z" opacity="0.18" filter="url(#fBlurM)"/>
    </g>
    <g filter="url(#fBlurL)"><rect x="80" y="430" width="900" height="90" fill="#f7f1e2" opacity="0.55"/></g>
    <g stroke="#4a463c" fill="none" stroke-width="2.5" opacity="0.22" stroke-linecap="round">
      <path d="M60 640 q60 7 120 0 t120 0"/>
      <path d="M420 660 q60 7 120 0 t120 0"/>
      <path d="M980 600 q60 7 120 0 t120 0"/>
      <path d="M1080 660 q60 7 120 0 t120 0"/>
      <path d="M560 720 q70 8 140 0 t140 0"/>
      <path d="M1200 740 q70 8 140 0 t140 0"/>
      <path d="M180 780 q70 8 140 0 t140 0"/>
      <path d="M900 800 q70 8 140 0 t140 0"/>
    </g>
    <g filter="url(#fRough)">
      <path d="M480 700 L760 700 L735 748 L512 748 Z" fill="#332f28" opacity="0.9"/>
      <path d="M520 748 C600 738 690 736 735 748 Z" fill="#232019"/>
      <circle cx="640" cy="664" r="13" fill="#3a352c"/>
      <path d="M600 660 L682 660 L660 640 Q640 630 620 640 Z" fill="#4c463a"/>
      <path d="M640 677 C638 690 636 696 634 706" stroke="#3a352c" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M634 706 C626 714 616 716 604 714" stroke="#3a352c" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M700 690 L760 850" stroke="#332f28" stroke-width="4" fill="none"/>
    </g>
    <g stroke="#3c382f" fill="none" stroke-linecap="round" opacity="0.75" filter="url(#fRough)">
      <path d="M1050 900 C1055 820 1058 780 1070 730" stroke-width="5"/>
      <path d="M1120 900 C1122 830 1120 795 1108 755" stroke-width="4"/>
      <path d="M1180 900 C1184 840 1190 810 1200 775" stroke-width="4"/>
      <path d="M1230 900 C1228 850 1225 820 1218 790" stroke-width="3"/>
    </g>
    <g fill="#3c382f" opacity="0.8">
      <ellipse cx="1070" cy="722" rx="7" ry="14" transform="rotate(-12 1070 722)"/>
      <ellipse cx="1108" cy="748" rx="6" ry="12" transform="rotate(8 1108 748)"/>
      <ellipse cx="1200" cy="768" rx="6" ry="12" transform="rotate(-8 1200 768)"/>
      <ellipse cx="1218" cy="783" rx="5" ry="10" transform="rotate(6 1218 783)"/>
    </g>
  `);
}

/* 5. 山间飞瀑 */
function paintFeiPu() {
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fBlurL)"><circle cx="700" cy="240" r="90" fill="#e8dcc2" opacity="0.8"/></g>
    <g fill="#3e3a31" filter="url(#fRough)">
      <path d="M-40 900 L-40 470 Q160 430 300 500 Q420 560 470 900 Z" opacity="0.5"/>
      <path d="M1680 900 L1680 420 Q1500 380 1360 460 Q1240 530 1180 900 Z" opacity="0.5"/>
      <path d="M-40 640 Q200 560 400 640 Q520 690 560 900 L-40 900 Z" opacity="0.3"/>
      <path d="M1680 620 Q1460 540 1300 620 Q1220 660 1180 900 L1680 900 Z" opacity="0.3"/>
    </g>
    <g filter="url(#fBlurS)">
      <path d="M700 470 C690 560 700 640 690 720 C685 760 690 800 680 900" stroke="#f6f0e2" stroke-width="34" fill="none" opacity="0.8" stroke-linecap="round"/>
      <path d="M755 500 C745 570 752 620 746 700 C742 760 748 810 740 900" stroke="#f6f0e2" stroke-width="16" fill="none" opacity="0.6" stroke-linecap="round"/>
    </g>
    <g filter="url(#fBlurL)">
      <ellipse cx="720" cy="850" rx="240" ry="70" fill="#f7f1e2" opacity="0.65"/>
    </g>
    <g stroke="#3a362c" fill="none" stroke-linecap="round" filter="url(#fRough)">
      <path d="M340 460 C350 400 380 370 430 350" stroke-width="9" opacity="0.85"/>
      <g stroke-width="3" opacity="0.7">
        <path d="M430 350 q-16 -14 -6 -30 M430 350 q-4 -20 12 -28 M430 350 q8 -18 26 -18 M430 350 q20 -10 30 4"/>
        <path d="M390 380 q-14 -12 -6 -26 M390 380 q-2 -16 12 -22 M390 380 q10 -14 24 -12"/>
      </g>
    </g>
    ${bird(1050, 260, 1, 0.8)}
    ${bird(1140, 220, 0.75, 0.7)}
  `);
}

/* 6. 荷塘清趣 */
function paintHeTang() {
  const leafP = (x, y, r, rot, o) => `<g transform="translate(${x} ${y}) rotate(${rot})" opacity="${o}">
    <path d="M0 0 L ${-r * 0.95} ${-r * 0.3} A ${r} ${r * 0.32} 0 1 0 ${r * 0.95} ${-r * 0.3} Z" fill="#414a37"/>
    <path d="M0 0 L ${-r * 0.95} ${-r * 0.3}" stroke="#2f3626" stroke-width="2.5" fill="none"/>
    <g stroke="#2f3626" stroke-width="1.6" opacity="0.7">
      <path d="M0 0 L ${-r * 0.35} ${-r * 0.3}"/>
      <path d="M0 0 L ${r * 0.35} ${-r * 0.3}"/>
      <path d="M0 0 L ${-r * 0.75} ${-r * 0.15}"/>
      <path d="M0 0 L ${r * 0.75} ${-r * 0.15}"/>
    </g></g>`;
  const lotus = (x, y, s, o) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${o}">
    <path d="M0 0 C-14 -26 -22 -58 -8 -78 C2 -60 2 -34 0 0 Z" fill="#d9a89b"/>
    <path d="M0 0 C-2 -30 4 -60 18 -76 C16 -50 12 -28 0 0 Z" fill="#d9a89b"/>
    <path d="M0 0 C12 -28 20 -54 10 -74 C4 -52 -2 -30 0 0 Z" fill="#e3b8ab"/>
    <path d="M0 0 C26 -20 40 -40 30 -60 C18 -42 6 -24 0 0 Z" fill="#e9c4b6"/>
    <path d="M0 0 C-24 -18 -36 -36 -28 -54 C-14 -38 -4 -20 0 0 Z" fill="#e9c4b6"/>
    <circle r="5" fill="#c98f6b"/></g>`;
  return paintSvg(`
    <rect width="1600" height="900" fill="url(#gSkyWarm)"/>
    <g filter="url(#fRough)">
      ${leafP(400, 760, 150, -8, 0.85)}
      ${leafP(680, 800, 190, 4, 0.7)}
      ${leafP(1050, 750, 170, -5, 0.8)}
      ${leafP(1330, 800, 130, 10, 0.6)}
      ${leafP(220, 850, 110, 12, 0.5)}
      <g stroke="#39422f" stroke-width="5" fill="none" opacity="0.7">
        <path d="M420 760 C415 690 425 640 450 590"/>
        <path d="M680 800 C685 720 675 660 660 610"/>
      </g>
      ${lotus(450, 585, 1.15, 0.9)}
      ${lotus(662, 605, 0.9, 0.8)}
      <g transform="translate(880 560)" opacity="0.85">
        <path d="M0 0 L42 10" stroke="#3a352c" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="0" cy="0" r="4" fill="#3a352c"/>
        <ellipse cx="12" cy="-2" rx="16" ry="5" fill="#8fa3a8" opacity="0.6" transform="rotate(-18 12 -2)"/>
        <ellipse cx="12" cy="2" rx="16" ry="5" fill="#8fa3a8" opacity="0.6" transform="rotate(18 12 2)"/>
        <ellipse cx="28" cy="2" rx="13" ry="4" fill="#8fa3a8" opacity="0.5" transform="rotate(16 28 2)"/>
        <ellipse cx="28" cy="9" rx="13" ry="4" fill="#8fa3a8" opacity="0.5" transform="rotate(-16 28 9)"/>
      </g>
    </g>
    <g stroke="#4a463c" fill="none" stroke-width="2" opacity="0.2" stroke-linecap="round">
      <path d="M120 640 q60 6 120 0 t120 0"/>
      <path d="M700 560 q60 6 120 0 t120 0"/>
      <path d="M1180 620 q60 6 120 0 t120 0"/>
    </g>
  `);
}

const PAINTINGS = [
  { name: '远山叠翠', build: paintYuanShan },
  { name: '寒梅映月', build: paintHanMei },
  { name: '竹影清风', build: paintZhuYing },
  { name: '孤舟蓑笠', build: paintGuZhou },
  { name: '山间飞瀑', build: paintFeiPu },
  { name: '荷塘清趣', build: paintHeTang },
];

/* 隔日一换：今天是今年的第几天 ÷ 2 取整，再对幅数取余 */
function paintingIndexFor(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const doy = Math.floor((date - start) / 86400000);
  return Math.floor(doy / 2) % PAINTINGS.length;
}

export { PAINTINGS, paintingIndexFor };
