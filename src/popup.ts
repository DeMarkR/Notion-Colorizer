import '../styles/popup.scss';
import { getStorageData, setStorageData } from './storage';
import { gsap } from 'gsap';
gsap.config({ nullTargetWarn: false });

const tagInput = <HTMLInputElement>document.getElementById('ntc_tag_input');
const listContainer = document.getElementById('ntc_list_container');

function setListTitleVisibility(state: boolean) {
  const title = document.getElementById('ntc_tags_title');
  title.style.display = state ? 'block' : 'none';
}

async function fetchSavedTags() {
  const storage = await getStorageData();
  setListTitleVisibility(false);

  if (!storage.tags) {
    await setStorageData({ tags: [] });
    return;
  }

  removeAllChildNodes(listContainer);
  for (const tag of storage.tags) {
    await addTag(tag, false);
  }
}
let mainTimeline: GSAPTimeline;

async function removeTag(tagName: string, component: Element) {
  if (mainTimeline && mainTimeline.isActive()) {
    return;
  }

  const storage = await getStorageData();
  storage.tags?.splice(storage.tags.indexOf(tagName), 1);
  await setStorageData(storage);

  mainTimeline = gsap.timeline({
    onComplete: () => {
      listContainer.removeChild(component);
      if (listContainer.childElementCount <= 0) {
        setListTitleVisibility(false);
      }
      mainTimeline.revert().pause();
    },
  });
  mainTimeline.to(component, {
    opacity: 0,
    y: -50,
  });

  mainTimeline.to(
    listContainer,
    {
      marginBottom: -50,
    },
    '<',
  );

  mainTimeline.to(
    getSiblings(component),
    {
      y: -50,
      duration: 0.5,
      ease: 'expo.out',
    },
    '<+=0.1',
  );
}

async function addTag(tagName: string, insertToStorage = true) {
  if (insertToStorage) {
    const storage = await getStorageData();
    storage.tags?.push(tagName);
    await setStorageData(storage);
  }

  const li = document.createElement('li');
  li.setAttribute('class', 'border-indigo-400 border-b w-full');
  li.setAttribute('id', tagName);
  li.setAttribute(
    'style',
    `background-color: hsl(var(--b1)/var(--tw-bg-opacity))`,
  );

  li.style.zIndex = (1000 - listContainer.childElementCount).toString();

  li.innerHTML = `<div class="flex-auto justify-between w-full">
              <a class="overflow-hidden">${tagName}</a>
              <span class="material-symbols-rounded"> delete </span>
            </div>`;

  li.addEventListener('click', async () => {
    await removeTag(tagName, li);
  });

  listContainer.appendChild(li);
  setListTitleVisibility(true);

  let tl = gsap.timeline();
  if (insertToStorage) {
    tl.from(li, { y: -50, ease: 'expo.out' }, '<');
    tl.from(
      listContainer,
      {
        marginBottom: -50,
        ease: 'expo.out',
      },
      '<',
    );
  } else {
    tl.from(li, { opacity: 0 }, '<');
  }
}

var getSiblings = function (elem: Element): Element[] {
  // Setup siblings array and get the first sibling
  var siblings = [];
  var sibling = elem.nextElementSibling;

  // Loop through each sibling and push to the array
  while (sibling) {
    if (sibling.nodeType === 1 && sibling !== elem) {
      siblings.push(sibling);
    }
    sibling = sibling.nextElementSibling;
  }

  return siblings;
};

function removeAllChildNodes(parent: Element) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

document.querySelector('#ntc_add_tag').addEventListener('click', async () => {
  if (tagInput.value.trim() == '') return;

  await addTag(tagInput.value);
  tagInput.value = '';
});

const clearAllButton = document.querySelector('#clear_storage');
clearAllButton.addEventListener('click', async () => {
  if (mainTimeline && mainTimeline.isActive()) {
    return;
  }

  mainTimeline = gsap.timeline({
    onComplete: async () => {
      await chrome.storage.sync.clear();
      removeAllChildNodes(listContainer);
      setListTitleVisibility(false);

      console.log('Cleared storage');
    },
  });

  mainTimeline.to('li', {
    x: 100,
    opacity: 0,
    stagger: 0.05,
    ease: 'expo.out',
  });
});

fetchSavedTags();

const randomPrimaryColor = () => {
  const colorsArray: string[] = [
    'red',
    'yellow',
    'green',
    'blue',
    'indigo',
    'purple',
    'pink',
  ];
  const randomColor =
    colorsArray[Math.floor(Math.random() * colorsArray.length)];
  return randomColor;
};

gsap.from('body', {
  background: randomPrimaryColor(),
  duration: 0.5,
  ease: 'expo.out',
});
