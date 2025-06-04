const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/items');

const { eventTypesById } = require('./eventTypes')
const streams = require('./streams')

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

console.log(itemsById);

function addItem(key, item) {
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
    itemsByStreamIdTypeId[streamIdTypeId]
  }
}