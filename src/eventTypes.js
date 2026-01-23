const legacy = require('../definitions/eventTypes/eventTypes-legacy.json');
const hds = require('../definitions/eventTypes/eventTypes-hds.json');

const data = {
  types: {},
  extras: {}
};
for (const dataSet of ['types', 'extras']) {
  for (const source of [legacy[dataSet], hds[dataSet]]) {
    for (const [key, value] of Object.entries(source)) {
      if (data[dataSet][key]) throw new Error('Double entry for "' + key + '" ' + JSON.stringify(data[dataSet][key]) + ' -- ' + JSON.stringify(value));
      data[dataSet][key] = value;
    }
  }
}

module.exports = {
  eventTypesById,
  toBePublished
};

function eventTypesById (type) {
  return data.types[type];
}

function toBePublished () {
  return [{
    title: 'EventTypes dictionnary',
    path: './',
    filename: 'eventTypes.json',
    type: 'json',
    content: data,
    includeInPack: 'eventTypes'
  }];
}
