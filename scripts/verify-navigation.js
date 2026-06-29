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
  const selector = `[data-testid="${testId}"]`;
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.$eval(selector, (node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
  await page.click(selector);
}

async function openMorePanel(page, testId, panelTestId) {
  await clickByTestId(page, 'more-menu-button');
  await page.waitForSelector('[data-testid="more-menu-popover"]', { timeout: 15000 });
  await clickByTestId(page, testId);
  await page.waitForSelector('[data-testid="more-panel-sheet"]', { timeout: 15000 });
  await page.waitForSelector(`[data-testid="${panelTestId}"]`, { timeout: 15000 });
}

async function closeMorePanel(page) {
  await clickByTestId(page, 'close-more-panel');
  await page.waitForFunction(
    () => !document.querySelector('[data-testid="more-panel-sheet"]'),
    { timeout: 15000 }
  );
}

async function typeByTestId(page, testId, value) {
  await page.waitForSelector(`[data-testid="${testId}"]`, { timeout: 15000 });
  await page.click(`[data-testid="${testId}"]`);
  await page.keyboard.type(value);
}

async function replaceByTestId(page, testId, value) {
  const selector = `[data-testid="${testId}"]`;
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.$eval(selector, (node) => node.scrollIntoView({ block: 'center', inline: 'center' }));
  await page.click(selector);
  await page.keyboard.down('Control');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Control');
  await page.keyboard.type(value);
}

async function waitForInputValue(page, testId, value) {
  await page.waitForFunction(
    ({ id, expected }) => {
      const node = document.querySelector(`[data-testid="${id}"]`);
      return node && node.value === expected;
    },
    { timeout: 15000 },
    { id: testId, expected: value }
  );
}

async function clickFirstByPrefix(page, prefix) {
  await page.waitForSelector(`[data-testid^="${prefix}"]`, { timeout: 15000 });
  await page.click(`[data-testid^="${prefix}"]`);
}

async function getFirstTestIdByPrefix(page, prefix) {
  await page.waitForSelector(`[data-testid^="${prefix}"]`, { timeout: 15000 });
  return page.$eval(`[data-testid^="${prefix}"]`, (node) => node.getAttribute('data-testid'));
}

async function expectNoSelector(page, selector) {
  const found = await page.$(selector);
  if (found) {
    throw new Error(`Unexpected selector found: ${selector}`);
  }
}

async function getChecklistRowCount(page) {
  return page.$$eval('[data-testid^="checklist-label-"]', (nodes) => nodes.length);
}

async function waitForChecklistRowCountGreaterThan(page, count) {
  await page.waitForFunction(
    (previousCount) => document.querySelectorAll('[data-testid^="checklist-label-"]').length > previousCount,
    { timeout: 15000 },
    count
  );
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
  const guestLoginButton = await page.$('[data-testid="guest-login-button"]');
  if (guestLoginButton) {
    await clickByTestId(page, 'guest-login-button');
    await page.waitForSelector('[data-testid="region-search-input"]', { timeout: 15000 });
  }

  await typeByTestId(page, 'region-search-input', '도쿄');
  await page.waitForSelector('[data-testid="search-result-tokyo"]', { timeout: 15000 });
  await clickByTestId(page, 'clear-search-button');

  await typeByTestId(page, 'region-search-input', 'Atlantis');
  await page.waitForSelector('[data-testid="empty-search-result"]', { timeout: 15000 });
  await clickByTestId(page, 'clear-search-button');

  await clickByTestId(page, 'filter-food');
  await page.waitForSelector('[data-testid="search-result-bangkok"]', { timeout: 15000 });
  await clickByTestId(page, 'filter-family');
  await page.waitForSelector('[data-testid="search-result-jeju"]', { timeout: 15000 });
  await clickByTestId(page, 'filter-family');

  await typeByTestId(page, 'region-search-input', 'Tokyo');
  await clickByTestId(page, 'search-result-tokyo');
  await clickByTestId(page, 'create-ai-plan-button');
  await page.waitForSelector('[data-testid="ai-plan-destination-name"]', { timeout: 15000 });

  await clickByTestId(page, 'select-end-date-mode');
  await clickByTestId(page, 'calendar-next-month');
  await clickByTestId(page, `calendar-day-${getNextMonthDate(12)}`);
  await typeByTestId(page, 'arrival-time-input', '12:30');
  await typeByTestId(page, 'departure-time-input', '18:00');
  await typeByTestId(page, 'budget-input', '1500000');
  await typeByTestId(page, 'companions-input', 'friends');
  await typeByTestId(page, 'style-input', 'food');

  await clickByTestId(page, 'generate-itinerary-button');
  await waitForText(page, 'food');
  await waitForText(page, '26');
  await clickByTestId(page, 'save-itinerary-button');

  const savedCardTestId = await getFirstTestIdByPrefix(page, 'saved-plan-card-');
  await waitForText(page, 'friends');
  await clickByTestId(page, savedCardTestId);

  await openMorePanel(page, 'more-menu-checklist', 'checklist-tab-panel');
  const defaultChecklistCount = await getChecklistRowCount(page);
  await replaceByTestId(page, 'checklist-input', 'Travel Towel');
  await waitForInputValue(page, 'checklist-input', 'Travel Towel');
  await clickByTestId(page, 'add-checklist-item-button');
  await waitForChecklistRowCountGreaterThan(page, defaultChecklistCount);
  await clickByTestId(page, 'checklist-label-0');
  await closeMorePanel(page);
  await openMorePanel(page, 'more-menu-budget', 'budget-tab-panel');
  await replaceByTestId(page, 'budget-input-flight', '900000');
  await replaceByTestId(page, 'budget-input-stay', '700000');
  await waitForText(page, '1,600,000원');
  await page.waitForSelector('[data-testid="budget-warning"]', { timeout: 15000 });
  await closeMorePanel(page);
  await openMorePanel(page, 'more-menu-assistant', 'assistant-tab-panel');
  await replaceByTestId(page, 'assistant-chat-input', 'rain plan');
  await clickByTestId(page, 'assistant-send-button');
  await waitForText(page, '비 오는 날');
  await closeMorePanel(page);
  await clickByTestId(page, 'detail-tab-schedule');

  await clickByTestId(page, 'detail-tab-map');
  await page.waitForSelector('[data-testid="itinerary-map-section"]', { timeout: 15000 });
  await clickByTestId(page, 'map-day-selector-2');
  await page.waitForSelector('[data-testid^="map-pin-"]', { timeout: 15000 });
  await clickByTestId(page, 'detail-tab-today');
  await page.waitForSelector('[data-testid="today-schedule-panel"]', { timeout: 15000 });
  await page.waitForSelector('[data-testid^="today-notification-toggle-"]', { timeout: 15000 });
  await clickFirstByPrefix(page, 'today-item-');
  await clickByTestId(page, 'detail-tab-schedule');

  await clickByTestId(page, 'place-detail-trigger-0-1');
  await page.waitForSelector('[data-testid="place-detail-modal"]', { timeout: 15000 });
  await clickByTestId(page, 'show-alternative-places-button');
  await clickByTestId(page, 'alternative-place-0');
  await waitForText(page, 'Ginza Kagari');
  await clickByTestId(page, 'close-place-modal');

  await clickByTestId(page, 'detail-edit-item-0-1');
  await replaceByTestId(page, 'detail-edit-time-0-1', '14:30');
  await replaceByTestId(page, 'detail-edit-place-0-1', 'Saved Detail Cafe');
  await replaceByTestId(page, 'detail-edit-description-0-1', 'Updated from saved detail.');
  await clickByTestId(page, 'detail-save-edit-0-1');
  await waitForText(page, 'Saved Detail Cafe');

  await clickByTestId(page, 'detail-add-item-0');
  await replaceByTestId(page, 'detail-add-time-0', '20:00');
  await replaceByTestId(page, 'detail-add-place-0', 'Saved Added Market');
  await replaceByTestId(page, 'detail-add-description-0', 'Added from saved detail.');
  await clickByTestId(page, 'detail-save-add-0');
  await waitForText(page, 'Saved Added Market');

  await clickByTestId(page, 'detail-edit-item-0-0');
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await clickByTestId(page, 'detail-delete-item-0-0');
  await expectNoSelector(page, '[data-testid="detail-edit-time-0-0"]');

  await clickByTestId(page, 'detail-save-itinerary-button');
  await clickByTestId(page, savedCardTestId);
  await waitForText(page, 'Saved Detail Cafe');
  await waitForText(page, 'Saved Added Market');
  await openMorePanel(page, 'more-menu-checklist', 'checklist-tab-panel');
  await waitForChecklistRowCountGreaterThan(page, defaultChecklistCount);
  await closeMorePanel(page);
  await clickByTestId(page, 'detail-tab-schedule');

  await page.reload({ waitUntil: 'networkidle2' });
  await clickByTestId(page, 'tab-itinerary');
  await clickFirstByPrefix(page, 'saved-plan-card-');
  await waitForText(page, 'Saved Detail Cafe');
  await waitForText(page, 'Saved Added Market');
  await openMorePanel(page, 'more-menu-checklist', 'checklist-tab-panel');
  await waitForChecklistRowCountGreaterThan(page, defaultChecklistCount);
  await closeMorePanel(page);

  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });
  await clickByTestId(page, 'delete-plan-button');
  await page.waitForSelector('[data-testid="empty-itinerary"]', { timeout: 15000 });

  await browser.close();
  console.log('Saved itinerary list, detail editing, persistence, and deletion verified in Chrome.');
})().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
