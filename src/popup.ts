import '../styles/popup.scss';
import { getStorageData, setStorageData } from './storage';

let tags: string[] = [];

const tagInput = <HTMLInputElement>document.getElementById('ntc_tag_input');
const listContainer = document.getElementById('ntc_list_container');

async function fetchSavedTags() {
  const storage = await getStorageData();

  if (!storage.colorTags) {
    await setStorageData({ colorTags: [] });
    return;
  }

  document.getElementById('ntc_tags_title').style.display = 'none';
  storage?.colorTags.forEach((tag) => {
    tags.push(tag.tagName);
    addTagComp(tag.tagName);
  });
}

async function removeTag(tagName: string) {
  const index = tags.indexOf(tagName);
  tags.splice(index, 1);
  listContainer.removeChild(document.getElementById(tagName));

  if (!tags.length) {
    document.getElementById('ntc_tags_title').style.display = 'none';
  }

  syncStorage();
}

function addTagComp(tagName: string) {
  const li = document.createElement('li');
  li.setAttribute('class', 'border-indigo-400 border-b');
  li.setAttribute('id', tagName);

  li.innerHTML = `<div class="flex-auto justify-between">
              <a>${tagName}</a>
              <span class="material-symbols-rounded"> delete </span>
            </div>`;

  listContainer.appendChild(li);

  document.getElementById(tagName).addEventListener('click', () => {
    removeTag(tagName);
  });

  console.log(document.getElementById(tagName));

  document.getElementById('ntc_tags_title').style.display = 'block';
  syncStorage();
}

function syncStorage() {
  const tagsMapped = tags.map((t) => {
    return { tagName: t };
  });
  setStorageData({ colorTags: tagsMapped });
}

document.querySelector('#ntc_add_tag').addEventListener('click', async () => {
  tags.push(tagInput.value);

  addTagComp(tagInput.value);

  tagInput.value = '';
});

document.querySelector('#clear_storage').addEventListener('click', async () => {
  await chrome.storage.sync.clear();
  listContainer.innerHTML = '';
  tags = [];
  syncStorage();

  await fetchSavedTags();
  console.log('Cleared storage');
});

fetchSavedTags();
