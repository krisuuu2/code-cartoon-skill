// styles8/s8_bauhaus.js: style 8, BAUHAUS POSTER. Only HTML + CSS: divs, border-radius, clip-path, rotate, and multiply blending where two inks overlap.
// No canvas, no SVG, no image. Clawd is already geometry, so it is ten black rectangles.
S8.push({ name: 'BAUHAUS POSTER', tech: 'HTML + CSS only', init(stage) {
  const u = 36, L = 312, T = 620, K = '#151515', rc = ([c, r, w, h], col) => `<div style="left:${L + c * u}px;top:${T + r * u}px;width:${w * u}px;height:${h * u}px;background:${col}"></div>`;
  stage.innerHTML = `<div id="bau"><style>
    #bau { position: absolute; inset: 0; background: #F0E7D4; font-family: Jost, sans-serif; color: ${K}; overflow: hidden }
    #bau div, #bau p { position: absolute; margin: 0; box-sizing: border-box }
    #bau .m { mix-blend-mode: multiply }
    #bau .s { font-weight: 500; font-size: 34px; letter-spacing: 3px }
    #bau .bar { left: -120px; width: 1320px; background: ${K}; transform: rotate(-24deg) }
  </style>
  <p class="s" style="left:80px;top:92px">exhibition of moving shapes</p><p class="s" style="right:80px;top:92px">no. 8</p><div style="left:80px;top:150px;width:920px;height:6px;background:${K}"></div>
  <div class="m" style="left:80px;top:210px;width:430px;height:430px;background:#F2B807;clip-path:polygon(0 0,100% 0,0 100%)"></div>
  <div style="left:760px;top:215px;width:240px;height:172px;background-image:radial-gradient(circle,${K} 6px,transparent 6.6px);background-size:34px 34px"></div>
  <div style="left:210px;top:350px;width:860px;height:860px;border:5px solid ${K};border-radius:50%"></div>
  <div class="m" style="left:290px;top:430px;width:700px;height:700px;background:#E03A1E;border-radius:50%"></div>
  ${CLAWD.body.map(q => rc(q, K)).join('')}${CLAWD.eyes.map(q => rc(q, '#F0E7D4')).join('')}
  <div class="bar" style="top:1190px;height:44px"></div><div class="bar" style="top:1140px;height:6px"></div><div class="bar" style="top:1112px;height:6px"></div>
  <div class="m" style="left:800px;top:1150px;width:150px;height:150px;background:#F2B807;border-radius:50%"></div>
  <div style="left:80px;top:1075px;width:200px;height:200px;border:30px solid ${K};border-radius:50%"></div>
  <div class="m" style="left:520px;top:1360px;width:560px;height:560px;background:#1F4FA3;border-radius:100% 0 0 0"></div>
  <p style="left:76px;top:1462px;font-weight:900;font-size:156px;line-height:137px;letter-spacing:-4px">form<br>follows<br>code</p>
  <p style="left:800px;top:1760px;font-weight:900;font-size:92px;color:#F0E7D4;letter-spacing:-2px">2026</p>
  <p class="s" style="left:30px;top:1040px;font-size:24px;letter-spacing:6px;white-space:nowrap;transform-origin:0 0;transform:rotate(-90deg)">BAUHAUS · HTML + CSS · NO CANVAS · NO IMAGES</p>
  </div>`;
} });
