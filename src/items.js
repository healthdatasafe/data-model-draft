const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/items');

const { eventTypesById } = require('./eventTypes')
const streams = require('./streams')

const itemsById = {};

module.exports = {
  itemsById
};
// Load all YAML files from the streams directory

for (const file of fs.readdirSync(streamsFilePath)) {
  if (file.endsWith('.yaml')) {
    const filePath = path.join(streamsFilePath, file);    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const itemsContent = YAML.parse(fileContent);
    for (const item of itemsContent) {
      
      addItem(item);
    }
  }
}

function addItem(item) {
  // check if streamId and eventType exits
  if (!streams.streamsById[item.streamId]) {
    throw new Error(`Stream with id ${item.streamId} does not exist, cannot add item: ${JSON.stringify(item)}`);
  }

  if (!eventTypesById(item.eventType)) {
    throw new Error(`Event type with id ${item.eventType} does not exist, cannot add item: ${JSON.stringify(item)}`);
  }
  const itemId = item.id || item.streamId + ':' + item.eventType;
  itemsById[itemId] = item;
}