const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const streamsFilePath = path.join(__dirname, '../definitions/streams');

const roots = [];
const streamsById = {};

module.exports = {
  roots,
  streamsById,
  getRootOfById,
  toBePublished
};

function getRootOfById (id) {
  if (!streamsById[id]) {
    throw new Error(`Stream with id ${id} not found`);
  }
  let stream = streamsById[id];
  while (stream.parentId) {
    stream = streamsById[stream.parentId];
  }
  return stream;
}

// Load all YAML files from the streams directory

for (const file of fs.readdirSync(streamsFilePath)) {
  if (file.endsWith('.yaml')) {
    const filePath = path.join(streamsFilePath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const root = YAML.parse(fileContent);
    indexStreams(root, null);
    roots.push(root);
  }
}

function indexStreams (stream, parentId) {
  if (stream.id == null) throw new Error('missing id for stream: ' + JSON.stringify(stream));
  if (stream.name == null) throw new Error('missing name for stream: ' + JSON.stringify(stream));
  if (streamsById[stream.id] !== undefined) {
    throw new Error(`Stream with id ${stream.id} already exists, cannot add: ${JSON.stringify(stream)}`);
  }
  if (stream.parentId && parentId !== null) {
    console.log(`${stream.id} does not need parentId : ${stream.parentId}`);
  }
  stream.parentId = parentId;
  streamsById[stream.id] = stream;
  if (stream.children) {
    for (const child of stream.children) {
      indexStreams(child, stream.id);
    }
  }
}

function toBePublished () {
  return [{
    title: 'Streams Tree',
    path: './',
    filename: 'streamsTree.json',
    type: 'json',
    content: roots,
    includeInPack: 'streams'
  }];
}
