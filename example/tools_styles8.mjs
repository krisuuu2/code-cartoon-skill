// tools_styles8.mjs: screenshots the twelve style frames (styles8.html?s=N) and the board that puts them side by side.
//   node tools_styles8.mjs [--only=3,5] [--t=0]   -> out/styles8/s1.png .. s8.png + board.jpg   (exits 1 on a page error)
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const list = args.only ? String(args.only).split(',').map(Number) : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], out = 'out/styles8'; mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ protocolTimeout: 600000, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--no-sandbox', '--allow-file-access-from-files', '--disable-web-security', '--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=d3d11'] });
const page = await browser.newPage(); let bad = 0, cur = 0;
page.on('pageerror', e => { bad++; console.error(`PAGE ERROR s${cur}:`, e.message); }); page.on('console', m => { if (m.type() === 'error') console.error(`console s${cur}:`, m.text()); });
const url = (f, q = '') => pathToFileURL(resolve(f)).href + q;
await page.setViewport({ width: 1080, height: 1920 });
for (const s of list) { cur = s; const t0 = Date.now(); await page.goto(url('styles8.html', `?s=${s}&t=${args.t || 0}`), { waitUntil: 'networkidle0' }); await page.evaluate(() => window.ready); await new Promise(r => setTimeout(r, 250)); await page.screenshot({ path: `${out}/s${s}.png`, clip: { x: 0, y: 0, width: 1080, height: 1920 } }); console.log(`s${s} ${Date.now() - t0} ms`); }
cur = 'board'; await page.setViewport({ width: 2440, height: 3530 }); await page.goto(url('styles8/board.html'), { waitUntil: 'networkidle0' }); await page.evaluate(() => document.fonts.ready); await page.screenshot({ path: `${out}/board.jpg`, type: 'jpeg', quality: 92 });
await browser.close(); console.log(bad ? `${bad} page error(s)` : `ok -> ${out}/board.jpg`); process.exit(bad ? 1 : 0);
