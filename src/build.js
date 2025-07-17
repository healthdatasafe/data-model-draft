const fs = require('fs');
const path = require('path');
const YAML = require('yaml');

const basePath = path.resolve(__dirname, '../docs');

const { itemsById } = require('./items');

const sources = [
  require('./schemas/items').toBePublished,
  require('./streams').toBePublished,
  require('./items').toBePublished
];

const pack = {
  publicationDate: (new Date()).toISOString()
};

const htmlTableSrc = [{
  title: 'Pack items & streams',
  link: './pack.json',
  linkTxt: 'pack.json'
}];

for (const source of sources) {
  for (const file of source()) {
    const dirPath = path.resolve(basePath, file.path);
    const filePath = path.resolve(dirPath, file.filename);
    if (file.type !== 'json') throw new Error('Can only publish json files');
    const content = JSON.stringify(file.content, null, 2);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    if (file.includeInPack) pack[file.includeInPack] = file.content;
    htmlTableSrc.push({
      title: file.title,
      link: file.path + file.filename,
      linkTxt: file.path + file.filename
    });
  }
}

const packFilePath = path.resolve(basePath, 'pack.json');
fs.writeFileSync(packFilePath, JSON.stringify(pack, null, 2), 'utf-8');

// -- html table files
const htmlTableFiles = htmlTableSrc.map(i => `<tr><td>${i.title}</td><td><a href="${i.link}">${i.linkTxt}</a></tr>`).join('\n');

const indexHtmlSrc = fs.readFileSync(path.resolve(__dirname, '../docs-src/index.html'), 'utf-8');
const indexHtmlDest1 = indexHtmlSrc.replace('{TABLE_FILES}', htmlTableFiles);

// -- html table items
const rowsItems = [];
for (const key of Object.keys(itemsById).sort()) {
  const i = itemsById[key];
  const variation = i.variations ? YAML.stringify(i.variations, null, 2) : '';
  const line = `<tr><td>Id: ${key}<br>Type: ${i.type}</td><td>${i.label.en}<br>${i.description.en}</td><td>streamId: ${i.streamId}<br>eventType(s): ${i.eventTypes || '- variations -'}</td><td><pre>${variation}</pre></td></tr>`;
  rowsItems.push(line);
}
const indexHtmlDest = indexHtmlDest1.replace('{TABLE_ITEMS}', rowsItems.join('\n'));

fs.writeFileSync(path.resolve(basePath, 'index.html'), indexHtmlDest, 'utf-8');
