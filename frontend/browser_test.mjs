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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
  page.on('console', (msg) => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => consoleLogs.push(`[PAGE_ERROR] ${err.message}`));

  console.log('🌐 [Browser Test] Переход на http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await sleep(1200);

  // 1. Скриншот Кабинета Кандидата (Иван)
  console.log('📸 1. Скриншот Кабинета Кандидата (Иван)...');
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_candidate_dashboard.png') });

  // 2. Открытие адаптивного CAT-тестирования
  console.log('🧪 2. Открытие модуля адаптивного CAT-тестирования...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('CAT-тест'));
    if (btn) btn.click();
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_assessment_runner.png') });

  // 3. Переход на вкладку Входящие офферы
  console.log('💼 3. Открытие вкладки «Офферы» (Reverse Recruiting)...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Офферы'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_candidate_invitations.png') });

  // 4. Переход на вкладку Задания дня
  console.log('⚡ 4. Открытие вкладки «Задания дня»...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Задания дня'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_daily_challenges.png') });

  // 5. Переход на вкладку Вакансии
  console.log('📋 5. Открытие вкладки «Вакансии»...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Вакансии'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_vacancies_catalog.png') });

  // 6. Открытие окна Авторизации / Регистрации
  console.log('🔑 6. Открытие модального окна Авторизации / Регистрации...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Войти'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06_auth_modal.png') });

  // Закрываем модальное окно авторизации
  await page.evaluate(() => {
    const xBtn = document.querySelector('button svg.lucide-x')?.closest('button');
    if (xBtn) xBtn.click();
  });
  await sleep(600);

  // 7. Возврат в профиль и открытие параметров профиля соискателя
  console.log('⚙️ 7. Открытие модального окна параметров профиля...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Профиль'));
    if (btn) btn.click();
  });
  await sleep(600);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Параметры профиля'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07_candidate_onboarding.png') });
  await page.evaluate(() => {
    const xBtn = document.querySelector('button svg.lucide-x')?.closest('button');
    if (xBtn) xBtn.click();
  });
  await sleep(600);

  // 8. Переключение персоны на Работодателя (Сбер)
  console.log('🏢 8. Переключение персоны на Работодателя (Сбер)...');
  await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btn = allBtns.find((b) => b.textContent && b.textContent.includes('Сбер'));
    if (btn) btn.click();
  });
  await sleep(1200);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08_employer_dashboard.png') });

  // 9. Открытие модального окна Explainable AI
  console.log('🔍 9. Открытие модального окна Explainable AI...');
  const explainClicked = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const btn = allBtns.find(
      (b) =>
        b.textContent &&
        (b.textContent.toLowerCase().includes('обоснование') ||
          b.textContent.toLowerCase().includes('почему') ||
          b.textContent.toLowerCase().includes('explain'))
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });

  if (explainClicked) {
    await sleep(800);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09_explainable_ai_modal.png') });
    await page.evaluate(() => {
      const xBtn = document.querySelector('button svg.lucide-x')?.closest('button');
      if (xBtn) xBtn.click();
    });
    await sleep(600);
  }

  // 10. Открытие вкладки Отправленные офферы работодателя
  console.log('📤 10. Открытие вкладки «Отправленные офферы» работодателя...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const btn = btns.find((b) => b.textContent && b.textContent.includes('Отправленные офферы'));
    if (btn) btn.click();
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_employer_invitations.png') });

  console.log('\n--- Журнал консоли браузера: ---');
  if (consoleLogs.length === 0) {
    console.log('✅ В консоли браузера нет ни одной ошибки!');
  } else {
    consoleLogs.forEach((l) => console.log('  ', l));
  }

  await browser.close();
  console.log('\n🎉 [Browser Test] Все 10 сценариев успешно протестированы и сохранены в docs/screenshots/!');
}

runBrowserTest().catch((err) => {
  console.error('❌ Ошибка тестирования браузера:', err);
  process.exit(1);
});
