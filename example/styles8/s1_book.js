// styles8/s1_book.js: style 1, PICTURE BOOK (for small viewers). Pure SVG: every shape is a cut-paper layer (edge displaced by noise + a drop shadow),
// the paint is feTurbulence (grain, gouache blotches, brush streaks). Round corners, big eyes, cheeks, a balloon.
S8.push({ name: 'PICTURE BOOK', tech: 'SVG + filters', init(stage) {
  const u = 33, cx = 500, top = 1010, X = c => cx + (c - 8) * u, Y = r => top + r * u, OR = '#F0793A';
  const R = (c, r, w, h, rx, fill = OR) => `<rect x="${X(c)}" y="${Y(r)}" width="${w * u}" height="${h * u}" rx="${rx}" fill="${fill}"/>`;
  const cloud = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" fill="#FFFDF4"><circle cx="-70" cy="10" r="50"/><circle cx="-10" cy="-25" r="68"/><circle cx="65" cy="5" r="55"/><rect x="-120" y="5" width="240" height="56" rx="28"/></g>`;
  const flower = ([x, y, col], i) => `<path d="M${x} ${y} q ${i % 2 ? 14 : -14} 50 0 110" stroke="#2F6B3A" stroke-width="7" fill="none" stroke-linecap="round"/>` +
    [0, 1, 2, 3, 4].map(k => `<circle cx="${x + Math.cos(k * 1.257) * 19}" cy="${y + Math.sin(k * 1.257) * 19}" r="14" fill="${col}"/>`).join('') + `<circle cx="${x}" cy="${y}" r="10" fill="#E4572E"/>`;
  const rays = [...Array(12)].map((_, i) => `<rect x="-15" y="-246" width="30" height="62" rx="15" transform="rotate(${i * 30 + 8})"/>`).join('');
  const tree = (x, y, r, col) => `<rect x="${x - 11}" y="${y - 10}" width="22" height="${r * 1.5}" rx="8" fill="#8A5A3C"/><circle cx="${x}" cy="${y - r * .5}" r="${r}" fill="${col}"/>`;
  const ex = [X(4.5), X(11.5)], ey = Y(3);
  stage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}" style="position:absolute;left:0;top:0">
  <defs>
    <filter id="cut" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".028" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="13" xChannelSelector="R" yChannelSelector="G" result="d"/><feDropShadow in="d" dx="0" dy="8" stdDeviation="6" flood-color="#17361f" flood-opacity=".3"/></filter>
    <filter id="crayon" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".7" numOctaves="1" seed="2" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="3" seed="8"/><feColorMatrix type="matrix" values=".4 .4 .4 0 .32  .4 .4 .4 0 .32  .4 .4 .4 0 .32  0 0 0 0 1"/></filter>
    <filter id="blot" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".007 .012" numOctaves="3" seed="21"/><feColorMatrix type="matrix" values=".5 .5 .5 0 .2  .5 .5 .5 0 .2  .5 .5 .5 0 .2  0 0 0 0 1"/></filter>
    <filter id="brush" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".003 .16" numOctaves="2" seed="5"/><feColorMatrix type="matrix" values=".6 .6 .6 0 .1  .6 .6 .6 0 .1  .6 .6 .6 0 .1  0 0 0 0 1"/></filter>
  </defs>
  <rect width="${FW}" height="${FH}" fill="#BCE5F1"/>
  <g filter="url(#cut)"><g transform="translate(860 600)"><g fill="#FFAE1F">${rays}</g><circle r="150" fill="#FFC93C"/><circle cx="-82" cy="34" r="24" fill="#FF8A5B" opacity=".65"/><circle cx="82" cy="34" r="24" fill="#FF8A5B" opacity=".65"/>
    <circle cx="-46" cy="-16" r="13" fill="#7A4A12"/><circle cx="46" cy="-16" r="13" fill="#7A4A12"/><path d="M-52 32 Q0 86 52 32" stroke="#7A4A12" stroke-width="11" fill="none" stroke-linecap="round"/></g></g>
  <g filter="url(#cut)">${cloud(330, 650, .95)}${cloud(950, 960, .7)}</g>
  <g filter="url(#crayon)" stroke="#24507A" stroke-width="7" fill="none" stroke-linecap="round"><path d="M470 830 q18 -22 36 0 q18 -22 36 0"/><path d="M570 780 q14 -18 28 0 q14 -18 28 0"/></g>
  <g filter="url(#cut)"><path d="M-20 1250 Q540 900 1100 1250 V1940 H-20Z" fill="#A9D98C"/>${tree(200, 1090, 58, '#3F8F5A')}${tree(310, 1050, 74, '#57A866')}
    <rect x="790" y="1050" width="116" height="100" fill="#FFF3DC"/><path d="M772 1056 L848 976 L924 1056Z" fill="#E4572E"/><rect x="832" y="1094" width="34" height="56" rx="10" fill="#8A5A3C"/><rect x="802" y="1070" width="24" height="24" rx="5" fill="#8FD0E8"/></g>
  <g filter="url(#cut)"><path d="M-20 1400 Q260 1250 540 1310 T1100 1330 V1940 H-20Z" fill="#7CC36E"/></g>
  <g filter="url(#crayon)" stroke="#4FA35A" stroke-width="7" fill="none" stroke-linecap="round">${[[90, 1420], [170, 1390], [820, 1380], [900, 1400], [980, 1375], [250, 1445]].map(([x, y]) => `<path d="M${x} ${y} l-8 -30 M${x + 14} ${y} l2 -36 M${x + 28} ${y} l10 -28"/>`).join('')}</g>
  <ellipse cx="500" cy="1344" rx="262" ry="22" fill="#3F8F5A" opacity=".45"/>
  <g filter="url(#crayon)"><path d="M240 1172 Q150 1090 162 975" stroke="#5B4636" stroke-width="6" fill="none" stroke-linecap="round"/></g>
  <g filter="url(#cut)"><ellipse cx="160" cy="880" rx="82" ry="98" fill="#E4572E"/><path d="M148 974 L160 992 L174 974Z" fill="#E4572E"/><ellipse cx="132" cy="842" rx="20" ry="32" fill="#fff" opacity=".45" transform="rotate(-20 132 842)"/></g>
  <g filter="url(#cut)">${R(3, 8, 1, 2.1, 14)}${R(5, 8, 1, 2.1, 14)}${R(10, 8, 1, 2.1, 14)}${R(12, 8, 1, 2.1, 14)}${R(0, 4, 16, 2, 30)}${R(2, 0, 12, 8.2, 46)}</g>
  <circle cx="338" cy="1170" r="26" fill="#FF9E80" opacity=".8"/><circle cx="662" cy="1170" r="26" fill="#FF9E80" opacity=".8"/>
  ${ex.map(x => `<circle cx="${x}" cy="${ey}" r="38" fill="#FFFDF4"/><circle cx="${x - 9}" cy="${ey - 9}" r="19" fill="#2B2118"/><circle cx="${x - 16}" cy="${ey - 17}" r="7" fill="#fff"/>`).join('')}
  <g filter="url(#crayon)"><path d="M452 1166 Q500 1210 548 1166" stroke="#2B2118" stroke-width="10" fill="none" stroke-linecap="round"/></g>
  <g filter="url(#cut)"><g transform="translate(905 1262) rotate(-14)"><ellipse cx="-22" cy="-6" rx="24" ry="32" fill="#FF8FB1" transform="rotate(-24 -22 -6)"/><ellipse cx="22" cy="-6" rx="24" ry="32" fill="#FF8FB1" transform="rotate(24 22 -6)"/><rect x="-4" y="-22" width="8" height="42" rx="4" fill="#5B4636"/></g></g>
  <g filter="url(#cut)"><path d="M-20 1640 Q300 1500 620 1600 T1100 1540 V1940 H-20Z" fill="#4FA35A"/></g>
  <g filter="url(#crayon)">${[[120, 1700, '#FFFDF4'], [270, 1630, '#FFC93C'], [410, 1745, '#FF8FB1'], [570, 1680, '#FFFDF4'], [710, 1770, '#FFC93C'], [850, 1650, '#FF8FB1'], [975, 1740, '#FFFDF4']].map(flower).join('')}</g>
  <g font-family="'Baloo 2'" font-weight="800"><text x="80" y="300" font-size="92" fill="#24507A">Good morning,</text><text x="76" y="450" font-size="164" fill="#E4572E" transform="rotate(-3 76 450)">Clawd!</text></g>
  <rect width="${FW}" height="${FH}" filter="url(#brush)" style="mix-blend-mode:soft-light" opacity=".55"/>
  <rect width="${FW}" height="${FH}" filter="url(#blot)" style="mix-blend-mode:multiply" opacity=".28"/>
  <rect width="${FW}" height="${FH}" filter="url(#grain)" style="mix-blend-mode:multiply" opacity=".5"/>
  </svg>`;
} });
