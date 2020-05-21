const inputMap = {
  setList : {
    el : null,
    selector: 'select[name="set-list"]',
    listener: {
      type: 'change',
      fn: 'onSetChange'
    }
  },
  setItemList : {
    el : null,
    selector: 'select[name="set-item-list"]',
    listener: {
      type: 'change',
      fn: 'onSetItemChange'
    }
  }
};

const listenerMap = {};

const main = () => {
  init();
  registerListeners();
  addEvents();
  ready();
};

const init = () => {
  Object.keys(inputMap).forEach(key => inputMap[key].el = document.querySelector(inputMap[key].selector));
};

const registerListeners = () => {
  Object.assign(listenerMap, {
    onSetChange : onSetChange,
    onSetItemChange : onSetItemChange
  })
};

const addEvents = () => {
  Object.keys(inputMap).forEach(key => {
    const listener = inputMap[key].listener;
    inputMap[key].el.addEventListener(listener.type, listenerMap[listener.fn]);
  });
};

const ready = () => {
  setData.forEach((set, index) => getEl('setList').appendChild(new Option(set.name, index.toString())));

  getEl('setList').value = 2 // Testing...

  triggerEvent(getEl('setList'), 'change');
};

const renderWikiText = (set, setItem) => {
  const shortName = toTitleCase(set.shortName);
  const slot = slotData[setItem.slot];
  const itemName = setItem.name || (slot.short || slot.type);
  const imgName = shortName + (slot.short || slot.type);

  return `{{future}}
{{stub}}
'''${itemName}''' ${slot.plural ? 'are' : 'is'} a ${slot.short ? `[[${slot.type}|${slot.short}]]` : `[[${slot.type}]]`} piece of the ${set.name} [[Set Items|set]] in ''[[Diablo III]]''.

It only drops at [[character level]] 70, and only at [[Torment (difficulty)|Torment]] difficulty. Note that ${slot.plural ? 'they' : 'it'} can only be worn by [[${set.class} (Diablo III)|${set.class}]]s.

==Stats (Level 70)==
[[File:${imgName}.png|right]]

{{Set|${itemName}}}<br />
Set ${slot.type}}}
* 559-595 Armor

{{Magic block|
Properties:
*One of 3 Magic Properties (varies):
**+626–750 [[Dexterity]]
**+626–750 [[Strength]]
**+626–750 [[Intelligence]]
*+4 Random Magic Properties
*Empty [[Socket]]
}}
{{${shortName}SetBonus}}
{{D3ItemText|${setItem.flavorText}}}
{{${shortName}Set}}
`;
};


const onSetChange = (e) => {
  getEl('setItemList').innerHTML = '';
  getCurrentSet().pieces.forEach((piece, index) => {
    const text = piece.name || piece.slot;
    getEl('setItemList').appendChild(new Option(text, index.toString()));
  });
  triggerEvent(getEl('setItemList'), 'change');
};

const onSetItemChange = (e) => {
  const currSet = getCurrentSet();
  const currentSetItem = getCurrentSetItem();
  const slot = slotData[currentSetItem.slot];
  const itemName = currentSetItem.name || (slot.short || slot.type)

  document.querySelector('.set-name').textContent = itemName;
  document.querySelector('.output-wrapper > textarea').value = renderWikiText(currSet, currentSetItem);
};

const getCurrentSet = () => setData[getSelectIndex('setList')];
const getCurrentSetItem = () => getCurrentSet().pieces[getSelectIndex('setItemList')];

const getSelectIndex = (key) => parseInt(getEl(key).value, 10);

/**
 * @param key
 * @returns {HTMLElement}
 */
const getEl = (key) => inputMap[key].el;

/**
 *
 * @param {HTMLElement} el
 * @param {string} eventName
 */
const triggerEvent = (el, eventName) => {
  return new Promise((resolve, reject) => {
    const event = document.createEvent('HTMLEvents');
    event.initEvent(eventName, true, false);
    el.dispatchEvent(event);
    resolve(true);
  })
};

const toTitleCase = str => [...str].map((w, i) => i === 0 ? w[0].toUpperCase() : w).join('');

// Main Entry
document.addEventListener('DOMContentLoaded', main)