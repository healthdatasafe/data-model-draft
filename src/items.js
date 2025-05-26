const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/items');

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
      const itemId = item.streamId + ':' + item.eventType;
      if (itemsById[itemId] !== undefined) {
        throw new Error(`Item with id ${itemId} already exists, cannot add: ${JSON.stringify(item)}`);
      }
      itemsById[itemId] = item;
    }
  }
}
