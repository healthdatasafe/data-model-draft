const legacy = require('../definitions/eventTypes/eventTypes-legacy.json').types;
const hds = require('../definitions/eventTypes/eventTypes-hds.json').types;

eventTypes = {...legacy, ...hds};

module.exports = {
  eventTypesById
};

function eventTypesById (type) {
  return eventTypes[type];
}