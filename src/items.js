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
  itemsByStreamIdTypeId
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
  const eventTypes = [];
  if (item.variations?.eventType) {
    eventTypes.push(...Object.keys(item.variations?.eventType));
    if (item.eventType) {
      throw new Error(`Item with ${key} mixes eventType and variation.eventTypes: ${JSON.stringify(item)}`);
    }
  } else {
    eventTypes.push(item.eventType);
  }

  for (const eventType of eventTypes) {
    if (!eventTypesById(eventType)) {
      throw new Error(`Event type with id ${eventType} does not exist, cannot add item: ${JSON.stringify(item)}`);
    }
    const streamIdTypeId = item.streamId + ':' + eventType;
    if (itemsByStreamIdTypeId[streamIdTypeId]) {
      throw new Error(`Item with streamIdTypeId ${streamIdTypeId} already exists, cannot add item: ${JSON.stringify(item)}`);
    }
    itemsByStreamIdTypeId[streamIdTypeId] = item;
  }
}
