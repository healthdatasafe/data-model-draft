const YAML = require('yaml');
const fs = require('fs');
const path = require('path');
const datasourcesFilePath = path.join(__dirname, '../definitions/datasources');

const datasourcesById = {};

module.exports = {
  datasourcesById,
  toBePublished
};

// Load all YAML files from the datasources directory
for (const file of fs.readdirSync(datasourcesFilePath)) {
  if (file.endsWith('.yaml')) {
    const filePath = path.join(datasourcesFilePath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const datasourcesContent = YAML.parse(fileContent);
    for (const [key, datasource] of Object.entries(datasourcesContent)) {
      addDatasource(key, datasource);
    }
  }
}

/**
 * label and description must be localized
 * @param {Array<string>} properties
 * @param {Object} obj
 */
function localizeFields (properties, obj) {
  for (const [key, value] of Object.entries(obj)) {
    if (properties.includes(key)) {
      if (typeof value === 'string') {
        obj[key] = { en: value };
      }
    } else {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        localizeFields(properties, value);
      }
    }
  }
}

function addDatasource (key, datasourceSrc) {
  const datasource = structuredClone(datasourceSrc);
  localizeFields(['label', 'description'], datasource);

  if (datasourcesById[key]) {
    throw new Error(`Datasource with id ${key} already exists`);
  }

  // Basic validation
  if (!datasource.endpoint) throw new Error(`Datasource "${key}" missing endpoint`);
  if (!datasource.queryParam) throw new Error(`Datasource "${key}" missing queryParam`);
  if (!datasource.resultKey) throw new Error(`Datasource "${key}" missing resultKey`);

  datasourcesById[key] = datasource;
}

function toBePublished () {
  return [{
    title: 'Datasources dictionnary',
    path: './',
    filename: 'datasources.json',
    type: 'json',
    content: datasourcesById,
    includeInPack: 'datasources'
  }];
}
