const puppeteer = require('puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getNextMonthDate(day = 12) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setMonth(date.getMonth() + 1, day);
  return toDateValue(date);
}

async function waitForText(page, text) {
  await page.waitForFunction(
    (expected) => document.body && document.body.innerText.includes(expected),
    { timeout: 15000 },
    text
  );
}

async function clickByTestId(page, testId) {
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 15000 });
  await page.click(`[data-testid="${testId}"]`);
}

async function typeByTestId(page, testId, value) {
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 15000 });
  await page.click(`[data-testid="${testId}"]`);
  await page.keyboard.type(value);
}

async function clearByTestId(page, testId) {
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 15000 });
  await page.click(`[data-testid="${testId}"]`);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  page.setDefaultTimeout(15000);

  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.localStorage.clear());
  await page.reload({ waitUntil: 'networkidle2' });

  await waitForText(page, 'Travel Plan');
  await waitForText(page, '인기 여행지');

  await typeByTestId(page, 'region-search-input', 'Tokyo');
  await clickByTestId(page, 'search-result-tokyo');
  await waitForText(page, '오늘의 날씨');
  await waitForText(page, '추천 명소');
  await waitForText(page, '맛집 리스트');

  await clickByTestId(page, 'create-ai-plan-button');
  await waitForText(page, 'AI 일정 만들기');
  await waitForText(page, '여행 날짜');

  await clickByTestId(page, 'select-end-date-mode');
  await clickByTestId(page, 'calendar-next-month');
  await clickByTestId(page, `calendar-day-${getNextMonthDate(12)}`);
  await typeByTestId(page, 'arrival-time-input', '12:30');
  await typeByTestId(page, 'departure-time-input', '18:00');
  await typeByTestId(page, 'budget-input', '150만원');
  await typeByTestId(page, 'companions-input', '친구');
  await typeByTestId(page, 'style-input', '맛집 중심');

  await clickByTestId(page, 'generate-itinerary-button');
  await waitForText(page, 'AI 일정 결과');
  await waitForText(page, 'Day 1');
  await waitForText(page, 'Day 3');
  await waitForText(page, '12:30');
  await waitForText(page, '14:00');
  await waitForText(page, '16:00');
  await waitForText(page, 'Ginza Kagari');
  await waitForText(page, 'Cafe Kitsune');
  await waitForText(page, '공항 도착');

  await clickByTestId(page, 'save-itinerary-button');
  await waitForText(page, '내 일정');
  await waitForText(page, '도쿄');
  await waitForText(page, '공항 도착');

  await page.reload({ waitUntil: 'networkidle2' });
  await waitForText(page, 'Travel Plan');
  await clickByTestId(page, 'tab-itinerary');
  await waitForText(page, '내 일정');
  await waitForText(page, '도쿄');
  await waitForText(page, '공항 도착');

  await browser.close();
  console.log('generateItinerary style and time rules verified.');
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
