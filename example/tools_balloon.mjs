// tools_balloon.mjs: stills and video of THE BALLOON (balloon.html). Frames are page screenshots, because scenes are SVG, DOM, canvas and WebGL.
//   node tools_balloon.mjs --scene=book --sheet=auto         8 stills of one scene -> out/balloon/stills/book_u01.20.jpg ... + book_sheet.jpg (all tiled)
//   node tools_balloon.mjs --scene=book --sheet=0.5,3,7.2    stills at those scene times (seconds since the scene started)
//   node tools_balloon.mjs --glide=book                      the finale pose at k = 0, .5, 1 -> out/balloon/stills/book_glide_*.jpg
//   node tools_balloon.mjs --film --sheet=10,20.5            stills of the whole film at those times (transitions included)
//   node tools_balloon.mjs --video --scene=book              that scene's part of the film -> out/balloon/seg/book.mp4 (30 fps); --video alone = every scene, one file each
//   node tools_balloon.mjs --cues                            out/balloon/cues.json + sounds.json (collected from the scenes)
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, copyFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; })), out = 'out/balloon'; mkdirSync(`${out}/stills`, { recursive: true }); mkdirSync(`${out}/seg`, { recursive: true });
const TL = JSON.parse(readFileSync('balloon/timeline.json', 'utf8')), id = args.scene || args.glide, sc = id && TL.scenes.find(s => s.id === id);
if (id && !sc) { console.error('no such scene:', id, '| scenes:', TL.scenes.map(s => s.id).join(' ')); process.exit(1); }
const browser = await puppeteer.launch({ protocolTimeout: 900000, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'] });
const page = await browser.newPage(); let bad = 0; page.on('pageerror', e => { bad++; console.error('PAGE ERROR', e.message); }); page.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) console.error('console:', m.text()); });
await page.setViewport({ width: 1080, height: 1920 });
const open = async q => { await page.goto(pathToFileURL(resolve('balloon.html')).href + q, { waitUntil: 'networkidle0' }); await page.evaluate(() => window.ready); };
const snap = () => page.screenshot({ type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
const tile = (files, name) => { files.forEach((f, i) => copyFileSync(f, `${out}/stills/_n${process.pid}_${String(i).padStart(2, '0')}.jpg`)); spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', `${out}/stills/_n${process.pid}_%02d.jpg`, '-vf', `scale=270:-1,tile=${Math.min(files.length, 8)}x${Math.ceil(files.length / 8)}`, `${out}/stills/${name}_sheet.jpg`]); files.forEach((f, i) => rmSync(`${out}/stills/_n${process.pid}_${String(i).padStart(2, '0')}.jpg`)); console.log(`${out}/stills/${name}_sheet.jpg`); };
if (args.cues) { await open(''); writeFileSync(`${out}/cues.json`, JSON.stringify(await page.evaluate(() => FILM.cues()), null, 1)); writeFileSync(`${out}/sounds.json`, JSON.stringify(await page.evaluate(() => FILM.sounds()), null, 1)); console.log('cues.json, sounds.json'); }
else if (args.glide) { await open(`?glide=${id}`); const fs = []; for (const k of [0, .5, 1]) { await page.evaluate((i, k) => window.drawGlide(i, k), id, k); const f = `${out}/stills/${id}_glide_${k}.jpg`; writeFileSync(f, await snap()); fs.push(f); } tile(fs, `${id}_glide`); }
else if (args.sheet && args.film) { await open(args.only ? `?only=${args.only}` : ''); for (const t of String(args.sheet).split(',').map(Number)) { await page.evaluate(t => window.draw(t), t); writeFileSync(`${out}/stills/film_t${t.toFixed(2).padStart(6, '0')}.jpg`, await snap()); } }
else if (args.sheet) {
  await open(`?scene=${id}`); const us = args.sheet === 'auto' ? [...Array(8)].map((_, i) => +(.25 + i * (sc.dur - .35) / 7).toFixed(2)) : String(args.sheet).split(',').map(Number), fs = [], t0 = Date.now();
  for (const u of us) { await page.evaluate((i, u) => window.drawScene(i, u), id, u); const f = `${out}/stills/${id}_u${u.toFixed(2).padStart(5, '0')}.jpg`; writeFileSync(f, await snap()); fs.push(f); }
  console.log(`${us.length} stills, ${((Date.now() - t0) / us.length / 1000).toFixed(2)} s per frame`); tile(fs, id);
} else if (args.video) {
  await open(args.only ? `?only=${args.only}` : '');
  for (const s of TL.scenes.filter(s => !id || s.id === id)) {
    const n = Math.round(s.dur * TL.fps), t0 = Date.now();
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(TL.fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'h264_nvenc', '-preset', 'p5', '-rc', 'vbr', '-cq', '17', '-b:v', '0', '-pix_fmt', 'yuv420p', '-r', String(TL.fps), `${out}/seg/${s.id}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let i = 0; i < n; i++) { await page.evaluate(t => window.draw(t), s.t0 + i / TL.fps); const b = await snap(); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(`${s.id}: ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
}
await browser.close(); process.exit(bad ? 1 : 0);
