const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/streams');

const roots = [];
const streamsById = {};

module.exports = {
  roots,
  streamsById,
};

for (const file of fs.readdirSync(streamsFilePath)) {
  if (file.endsWith('.yaml')) {
    const filePath = path.join(streamsFilePath, file);    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const root = YAML.parse(fileContent);
    indexStreams(root);
    roots.push(root);
  }
}


function indexStreams(parent) {
  if (streamsById[parent.id] !== undefined) { 
    throw new Error(`Stream with id ${parent.id} already exists, cannot add: ${JSON.stringify(parent)}`);
  }
  streamsById[parent.id] = parent;
  if (parent.children) {
    for (const stream of parent.children) {
      indexStreams(stream);
    }
  }
}
