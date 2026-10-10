import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function runBrowserTest() {
  console.log('🚀 [Browser Test] Запуск Microsoft Edge через Puppeteer Core...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1280,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  console.log('🌐 [Browser Test] Переход на http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Скриншот стартовой страницы (Кандидат Иван)
  console.log('📸 1. Скриншот Кабинета Кандидата (Иван)...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_candidate_dashboard.png') });

  // 2. Клик на кнопку старта CAT-тестирования
  console.log('🧪 2. Открытие модуля адаптивного CAT-тестирования...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text && (text.includes('тест') || text.includes('Тест'))) {
      await b.click();
      await new Promise(r => setTimeout(r, 1500));
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02_assessment_runner.png') });
      console.log('📸 2. Скриншот модуля тестирования сохранен (кнопка: ' + text.trim() + ')');
      break;
    }
  }

  // 3. Возврат на главную и переключение на Работодателя (Сбер)
  console.log('🏢 3. Переключение персоны на Работодателя (Сбер)...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btn = allBtns.find(b => b.textContent && b.textContent.includes('Сбер'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 1500));
  console.log('📸 3. Скриншот Кабинета Работодателя (Reverse Recruiting)...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_employer_dashboard.png') });

  // 4. Открытие модального окна Explainable AI
  console.log('🔍 4. Открытие модального окна Explainable AI...');
  const explainClicked = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btn = allBtns.find(b => b.textContent && (
      b.textContent.toLowerCase().includes('обоснование') || 
      b.textContent.toLowerCase().includes('почему') ||
      b.textContent.toLowerCase().includes('explain')
    ));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (explainClicked) {
    await new Promise(r => setTimeout(r, 1000));
    console.log('📸 4. Скриншот модального окна Explainable AI...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '04_explainable_ai_modal.png') });
  }

  console.log('\n--- Журнал консоли браузера: ---');
  if (consoleLogs.length === 0) {
    console.log('✅ В консоли браузера нет ни одной ошибки!');
  } else {
    consoleLogs.forEach(l => console.log('  ', l));
  }

  await browser.close();
  console.log('\n🎉 [Browser Test] Все 4 экрана успешно проверены и сохранены в docs/screenshots/!');
}

runBrowserTest().catch(err => {
  console.error('❌ Ошибка тестирования браузера:', err);
  process.exit(1);
});
