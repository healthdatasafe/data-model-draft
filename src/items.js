const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/items');

const { eventTypesById } = require('./eventTypes');
const streams = require('./streams');
const { checkItem } = require('./schemas/items');

const itemsById = {};
const itemsByStreamIdTypeId = {};

module.exports = {
  itemsById,
  itemsByStreamIdTypeId,
  toBePublished
};
// Load all YAML files from the streams directory

for (const file of fs.readdirSync(streamsFilePath)) {
  if (file.endsWith('.yaml')) {
    const filePath = path.join(streamsFilePath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const itemsContent = YAML.parse(fileContent);
    for (const [key, item] of Object.entries(itemsContent)) {
      addItem(key, item);
    }
  }
}

/**
 * label and description must be localized
 * Recursively find all "label" and "description" properties and change them
 * @param {Array<string>} properties
 * @param {Object}
 */
function localizeItem (properties, obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (properties.includes(key)) {
      if (typeof value === 'string') {
        obj[key] = { en: value }; // set to english
      }
    } else {
      if (typeof value === 'object') {
        localizeItem(properties, value);
      }
    }
  }
}

/**
 * Add an item found in a definitial file
 * @param {string} key
 * @param {object} item
 */
function addItem (key, itemSrc) {
  // localize item
  const item = structuredClone(itemSrc);
  localizeItem(['label', 'description'], item);

  // check schma
  checkItem(item);

  // check if streamId and eventType exits
  if (!streams.streamsById[item.streamId]) {
    throw new Error(`Stream with id ${item.streamId} does not exist, cannot add item: ${JSON.stringify(item)}`);
  }

  if (itemsById[key]) {
    throw new Error(`Item with id ${key} already exists, cannot add item: ${JSON.stringify(item)}`);
  }
  itemsById[key] = item;

  // an item may have variation of eventTypes (e.g. body-weight)
  const itemEventTypes = [];
  if (item.variations?.eventType) {
    itemEventTypes.push(...Object.keys(item.variations?.eventType));
    if (item.eventType) {
      throw new Error(`Item with ${key} mixes eventType and variation.eventTypes: ${JSON.stringify(item)}`);
    }
  } else {
    itemEventTypes.push(item.eventType);
  }

  for (const itemEventType of itemEventTypes) {
    const eventType = eventTypesById(itemEventType);
    if (eventType == null) {
      throw new Error(`Event type with id ${itemEventType} does not exist, cannot add item: ${JSON.stringify(item)}`);
    }
    checkItemVsEvenType(key, item, eventType);
    const streamIdTypeId = item.streamId + ':' + itemEventType;
    if (itemsByStreamIdTypeId[streamIdTypeId]) {
      throw new Error(`Item with streamIdTypeId ${streamIdTypeId} already exists, cannot add item: ${JSON.stringify(item)}`);
    }
    itemsByStreamIdTypeId[streamIdTypeId] = item;
  }
}

function toBePublished () {
  return [{
    title: 'Items dictionnary',
    path: './',
    filename: 'items.json',
    type: 'json',
    content: itemsById,
    includeInPack: 'items'
  }];
}

function checkItemVsEvenType (key, item, eventType) {
  if (eventType.type === 'string') {
    if (item.type === 'select') { // check that all options value are string
      if (eventType.enum === null) throw new Error(`for item "${key}", as a "select" of type "string", matching eventType must have an "enum" property`, JSON.stringify({ item, eventType }));
      for (const option of item.options) {
        if (typeof option.value !== 'string') throw new Error(`as item "${key}" is of type "select" and matching event type is "string" all options value must be string check the following option: ` + JSON.stringify(option));
        const found = eventType.enum.find((v) => (v === option.value));
        if (!found) throw new Error(`for item "${key}" the value "${option.value}" cannot be found it evenType enum": ` + JSON.stringify(eventType));
      }
      return true;
    }
    if (item.type === 'text') return true;
    if (item.type === 'date') {
      if (item.eventType === 'date/iso-8601') return true;
    }
  }
  if (item.eventType === 'ratio/generic') {
    if (item.type === 'select') {
      // values of options must be numbers
      for (const option of item.options) {
        if (typeof option.value !== 'number') throw new Error(`as item "${key}" is of type "select" and matching event type is "ratio/generic" all options value must be numbers check the following option: ` + JSON.stringify(option));
      }
      return true;
    }
  }
  if (item.type === 'number') {
    if (eventType.type !== 'number') throw new Error(`as item "${key}" is of type "number" matching eventtype should be a "number" ` + JSON.stringify({ item, eventType }));
    return true;
  }
  if (item.type === 'checkbox') {
    if (item.eventType === 'activity/plain') return true;
  }
  throw new Error(`There is no check available for the matching of item content end eventType for ${JSON.stringify({ item, eventType }, null, 2)}`);
}
