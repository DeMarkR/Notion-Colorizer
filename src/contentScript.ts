import { getStorageData } from './storage';

async function doesTextMatchFilters(text: string) {
  const storage = await getStorageData();
  if (!storage.colorTags || !storage.colorTags.length) return false;

  //console.log(text + ' == ' + storage.colorTags.find((f) => f.tagName == text));

  return storage.colorTags.includes({ tagName: text });
}

async function getColorTags(rows: Element[]): Promise<Element[]> {
  return rows.filter(
    async (el) => (await doesTextMatchFilters(el.textContent)) == true,
  );
}

async function colorTable(tableRows: Element[]) {
  //   const allColorTags = await getColorTags(tableRows);
  const storage = await getStorageData();

  let allColorTags: Element[] = [];
  tableRows.forEach((r) => {
    //console.log(storage.colorTags);
    storage.colorTags.forEach((t) => {
      if (t.tagName.toLowerCase() == r.textContent.toLowerCase())
        allColorTags.push(r);
    });
  });

  if (!allColorTags.length) return;

  allColorTags.forEach((element) => {
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

//let fetchInterval = as;
const observer = new MutationObserver(fetchRows);
observer.observe(document.body, {
  childList: true,
  subtree: true,
});

chrome.storage.onChanged.addListener(fetchRows);
