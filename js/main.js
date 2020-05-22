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
  },
  setAvailable : {
    el : null,
    selector: 'input[name="set-available"]',
    listener: {
      type: 'change',
      fn: 'onAvailabilityChange'
    }
  }
};

const setData = [];
const listenerMap = {};

const main = () => {
  fetch('data/sets.json')
      .then(response => response.json())
      .then((jsonData) => {
        setData.push(...jsonData);
        onLoad();
      });
};

const onLoad = () => {
  init();
  registerListeners();
  addEvents();
  ready();
}

const init = () => {
  Object.keys(inputMap).forEach(key => inputMap[key].el = document.querySelector(inputMap[key].selector));
};

const registerListeners = () => {
  Object.assign(listenerMap, {
    onSetChange : onSetChange,
    onSetItemChange : onSetItemChange,
    onAvailabilityChange: onAvailabilityChange
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
  const slotValues = slot.types[setItem.type || slot.defaultType];
  const itemName = setItem.name || slotValues.name;
  const prefix = slotValues.prefix === true || slotValues.prefix === undefined ? (slot.plural ? 'a pair of ' : 'a ') : '';
  const imgName = slot.type;
  const notices = [ '{{stub}}' ];

  if (getEl('setAvailable').checked === false) notices.unshift('{{future}}');

  return `${notices.join('\n')}
'''${itemName}''' is ${prefix}[[${slotValues.name}]] from the [[${set.name}]] [[Set Items|set]] in ''[[Diablo III]]''.

The item only drops at [[character level]] ${set.level}, and only at [[Torment (difficulty)|Torment]] difficulty. Note that ${slot.plural ? 'they' : 'it'} can only be worn by [[${set.class} (Diablo III)|${set.class}]]s.

==Stats (Level ${set.level})==
[[File:${imgName}.png|right]]

{{Set|${itemName}}}<br />
Set ${slot.type}}}
* ${setItem.stats.armor.join('–')} Armor

{{Magic block|
Properties:
*One of 3 Magic Properties (varies):
**+${setItem.stats.dex.join('–')} [[Dexterity]]
**+${setItem.stats.str.join('–')} [[Strength]]
**+${setItem.stats.int.join('–')} [[Intelligence]]
*+4 Random Magic Properties
*Empty [[Socket]]
}}
{{${shortName}SetBonus}}
{{D3ItemText|${setItem.flavorText}}}
{{${shortName}Set}}
`;
};


const onSetChange = (e) => {
  const currentSet = getCurrentSet();
  const isAvailable = currentSet.available === undefined || currentSet.available !== false;

  getEl('setItemList').innerHTML = '';
  currentSet.pieces.forEach((piece, index) => {
    const text = piece.name || piece.slot;
    getEl('setItemList').appendChild(new Option(text, index.toString()));
  });
  getEl('setAvailable').checked = isAvailable;
  triggerEvent(getEl('setItemList'), 'change');
};

const onSetItemChange = (e) => {
  update();
};

const onAvailabilityChange = (e) => {
  update();
};

const update = () => {
  const currSet = getCurrentSet();
  const currentSetItem = getCurrentSetItem();
  const slot = slotData[currentSetItem.slot];
  const itemName = currentSetItem.name || (slot.short || slot.type);
  const wikiText = renderWikiText(currSet, currentSetItem);

  //console.log(Wiky.toHtml(wikiText));
  document.querySelector('.set-name').textContent = `${itemName} (${currSet.class})`;
  document.querySelector('.output-wrapper > textarea').value = wikiText;
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