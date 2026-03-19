const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const defsDir = path.resolve(__dirname, '../definitions/converters');

/**
 * Loads all converter definitions from definitions/converters/{itemKey}/
 * Each item-key directory contains:
 *   converter/{version}.yaml — dimensions, weights, helpers
 *   models/{sourceKey}/{version}.json — observations + vectors per method
 *
 * Publishes:
 *   dist/converters/pack.json — index of all converters
 *   dist/converters/{itemKey}/index.json — versions with status
 *   dist/converters/{itemKey}/pack-latest.json — bundled converter config + all models
 */

const converterIndex = {};

// Discover item-key directories
const itemKeys = fs.readdirSync(defsDir)
  .filter(f => fs.statSync(path.join(defsDir, f)).isDirectory());

for (const itemKey of itemKeys) {
  const itemDir = path.join(defsDir, itemKey);

  // Load converter configs (versioned)
  const converterDir = path.join(itemDir, 'converter');
  const converterVersions = {};
  if (fs.existsSync(converterDir)) {
    for (const file of fs.readdirSync(converterDir).filter(f => f.endsWith('.yaml'))) {
      const version = path.basename(file, '.yaml');
      converterVersions[version] = yaml.load(fs.readFileSync(path.join(converterDir, file), 'utf-8'));
    }
  }

  // Load models (grouped by sourceKey, each with versions)
  const modelsDir = path.join(itemDir, 'models');
  const models = {};
  if (fs.existsSync(modelsDir)) {
    for (const sourceKey of fs.readdirSync(modelsDir).filter(f => fs.statSync(path.join(modelsDir, f)).isDirectory())) {
      models[sourceKey] = {};
      const sourceDir = path.join(modelsDir, sourceKey);
      for (const file of fs.readdirSync(sourceDir).filter(f => f.endsWith('.json'))) {
        const version = path.basename(file, '.json');
        models[sourceKey][version] = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf-8'));
      }
    }
  }

  // Build version index
  const versions = {};
  for (const version of Object.keys(converterVersions)) {
    versions[version] = {
      status: 'active',
      updatedAt: new Date().toISOString()
    };
  }

  // Build pack-latest: latest converter config + all models at latest version
  const latestVersion = Object.keys(converterVersions).sort().pop();
  let packLatest = null;
  if (latestVersion) {
    const latestConfig = converterVersions[latestVersion];
    const latestModels = [];
    for (const sourceKey of Object.keys(models)) {
      const sourceVersions = Object.keys(models[sourceKey]).sort();
      const latestModelVersion = sourceVersions[sourceVersions.length - 1];
      if (latestModelVersion) {
        latestModels.push(models[sourceKey][latestModelVersion]);
      }
    }
    packLatest = {
      itemKey,
      converterVersion: latestVersion,
      engine: latestConfig.engine,
      eventType: latestConfig.eventType,
      dimensionNames: latestConfig.dimensionNames,
      dimensions: latestConfig.dimensions,
      colorToRGB: latestConfig.colorToRGB || undefined,
      methods: latestModels
    };
  }

  converterIndex[itemKey] = {
    latestVersion,
    updatedAt: new Date().toISOString()
  };

  // Store for publishing
  converterIndex[itemKey]._versions = versions;
  converterIndex[itemKey]._packLatest = packLatest;
}

module.exports = {
  toBePublished
};

function toBePublished () {
  const files = [];

  // Per-item files
  for (const itemKey of Object.keys(converterIndex)) {
    const entry = converterIndex[itemKey];

    // index.json — version list with status
    files.push({
      title: `Converter: ${itemKey} — versions`,
      path: `converters/${itemKey}/`,
      filename: 'index.json',
      type: 'json',
      content: { itemKey, versions: entry._versions }
    });

    // pack-latest.json — bundled converter + models
    if (entry._packLatest) {
      files.push({
        title: `Converter: ${itemKey} — latest pack`,
        path: `converters/${itemKey}/`,
        filename: 'pack-latest.json',
        type: 'json',
        content: entry._packLatest
      });
    }
  }

  // Global converters pack.json
  const packContent = {};
  for (const itemKey of Object.keys(converterIndex)) {
    packContent[itemKey] = {
      latestVersion: converterIndex[itemKey].latestVersion,
      updatedAt: converterIndex[itemKey].updatedAt
    };
  }
  files.push({
    title: 'Converters index',
    path: 'converters/',
    filename: 'pack.json',
    type: 'json',
    content: packContent,
    includeInPack: 'converters'
  });

  return files;
}
