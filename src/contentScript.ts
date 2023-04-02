import { getStorageData } from './storage';

function doesTextExistInSavedTags(text: string, savedTags: string[]): boolean {
  return savedTags.some((t) => t.toLowerCase() == text.toLowerCase());
}

async function getTagElements(rows: Element[]): Promise<Element[]> {
  const storage = await getStorageData();
  if (!storage.tags?.length) return [];

  let tagElements: Element[] = [];
  rows.forEach((r) => {
    if (doesTextExistInSavedTags(r.textContent, storage.tags)) {
      tagElements.push(r);
    }
  });

  return tagElements;
}

async function colorTable(tableRows: Element[]) {
  const tagElements = await getTagElements(tableRows);
  if (!tagElements.length) return;

  tagElements.forEach((element) => {
    const rgb = getComputedStyle(element).backgroundColor;
    const rgbValues: string[] = rgb
      .substring(4, rgb.length - 1)
      .replace(/ /g, '')
      .split(',');
    rgbValues.push('0.4');

    const tableRow = element.closest('.notion-collection-item') as any;
    if (tableRow) {
      tableRow.style['background-color'] = ` rgb(${rgbValues.join(',')})`;
    }
  });
}

async function fetchRows() {
  if (!chrome.runtime?.id) return;

  const rows = document.querySelectorAll(
    '.notion-collection-item div[style*="color"]',
  );
  if (rows && rows.length) {
    await colorTable(Array.from(rows));
  }
}

const observer = new MutationObserver(fetchRows);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

chrome.storage.onChanged.addListener(fetchRows);
